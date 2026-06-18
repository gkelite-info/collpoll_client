import { supabase } from "@/lib/supabaseClient";
import { adminSupabase } from "@/lib/helpers/devices/scanIngestionHelper";

const e = (err: unknown) =>
  err instanceof Error ? err.message : "Unknown error";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface ActivationResult {
  success: boolean;
  deviceClassSessionId?: number;
  skipped?: boolean;
  skipReason?: string;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  resolveCollegeRoomId                                               */
/*  Finds the collegeRoomId for a calendar event, using the            */
/*  FK column if populated, falling back to roomNo string match.       */
/* ------------------------------------------------------------------ */

async function resolveCollegeRoomId(
  calendarEventId: number,
  collegeId: number,
): Promise<number | null> {
  // 1. Primary: direct FK column (populated for new events after migration)
  const { data: evt, error: evtErr } = await adminSupabase
    .from("calendar_event")
    .select("collegeRoomId")
    .eq("calendarEventId", calendarEventId)
    .maybeSingle();

  if (evtErr) throw new Error(`Event lookup failed: ${evtErr.message}`);
  if (!evt) throw new Error(`Calendar event ${calendarEventId} not found`);

  return evt.collegeRoomId as number;
}

/* ------------------------------------------------------------------ */
/*  resolveDeviceForRoom                                               */
/*  Returns the active biometric device assigned to the given room.    */
/* ------------------------------------------------------------------ */

async function resolveDeviceForRoom(collegeRoomId: number): Promise<{
  deviceId: number;
  isOnline: boolean;
} | null> {
  const { data, error } = await adminSupabase
    .from("room_devices")
    .select(
      "deviceId, isActive, biometric_devices:deviceId(isActive, is_deleted, isOnline)",
    )
    .eq("collegeRoomId", collegeRoomId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) throw new Error(`Room-device lookup failed: ${error.message}`);
  if (!data) return null;

  // Validate the linked device is active and not deleted
  const dev = Array.isArray(data.biometric_devices)
    ? data.biometric_devices[0]
    : data.biometric_devices;

  if (!dev || dev.is_deleted || !dev.isActive) return null;

  return {
    deviceId: data.deviceId,
    isOnline: dev.isOnline ?? false,
  };
}

/* ------------------------------------------------------------------ */
/*  upsertDeviceClassSession                                           */
/*  Idempotent — ON CONFLICT calendarEventId+deviceId does nothing.    */
/* ------------------------------------------------------------------ */

async function upsertDeviceClassSession(payload: {
  facultyClassSessionsId: number;
  calendarEventId: number;
  deviceId: number;
  collegeRoomId: number;
  collegeId: number;
  eventDate: string;
  fromTime: string;
  toTime: string;
  bufferMinutes: number;
}): Promise<number> {
  const now = new Date().toISOString();

  // Check for existing (covers duplicate accept clicks)
  const { data: existing } = await adminSupabase
    .from("device_class_sessions")
    .select("deviceClassSessionId")
    .eq("calendarEventId", payload.calendarEventId)
    .eq("deviceId", payload.deviceId)
    .is("deletedAt", null)
    .maybeSingle();

  if (existing) return existing.deviceClassSessionId;

  const { data, error } = await adminSupabase
    .from("device_class_sessions")
    .insert({
      facultyClassSessionsId: payload.facultyClassSessionsId,
      calendarEventId: payload.calendarEventId,
      deviceId: payload.deviceId,
      collegeRoomId: payload.collegeRoomId,
      collegeId: payload.collegeId,
      eventDate: payload.eventDate,
      fromTime: payload.fromTime,
      toTime: payload.toTime,
      bufferMinutes: payload.bufferMinutes,
      isActive: true,
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .select("deviceClassSessionId")
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data.deviceClassSessionId;
}

/* ------------------------------------------------------------------ */
/*  activateDeviceSessionForClass                                      */
/*  Main entry point — called after faculty accepts a class.           */
/*  Non-blocking: returns gracefully on skip/warn cases.              */
/* ------------------------------------------------------------------ */

export async function activateDeviceSessionForClass(params: {
  calendarEventId: number;
  facultyClassSessionsId: number;
  collegeId: number;
}): Promise<ActivationResult> {
  try {
    const { calendarEventId, facultyClassSessionsId, collegeId } = params;

    // 1. Get event details (date, times, type)
    const { data: evt, error: evtErr } = await adminSupabase
      .from("calendar_event")
      .select("type, date, fromTime, toTime, collegeRoomId")
      .eq("calendarEventId", calendarEventId)
      .maybeSingle();

    if (evtErr) throw new Error(evtErr.message);
    if (!evt) {
      return { success: true, skipped: true, skipReason: "EventNotFound" };
    }

    // 2. Only activate for "class" type events
    if (evt.type !== "class") {
      return {
        success: true,
        skipped: true,
        skipReason: `EventType=${evt.type}NoBiometric`,
      };
    }

    // 3. Resolve the room
    const collegeRoomId = await resolveCollegeRoomId(calendarEventId, collegeId);
    if (!collegeRoomId) {
      return {
        success: true,
        skipped: true,
        skipReason: "NoRoomConfigured",
      };
    }

    // 4. Find active device for this room
    const device = await resolveDeviceForRoom(collegeRoomId);
    if (!device) {
      return {
        success: true,
        skipped: true,
        skipReason: "NoDeviceAssignedToRoom",
      };
    }

    // 5. Create the device_class_session (idempotent)
    const deviceClassSessionId = await upsertDeviceClassSession({
      facultyClassSessionsId,
      calendarEventId,
      deviceId: device.deviceId,
      collegeRoomId,
      collegeId,
      eventDate: evt.date,
      fromTime: evt.fromTime,
      toTime: evt.toTime,
      bufferMinutes: 0,
    });

    return { success: true, deviceClassSessionId };
  } catch (err) {
    // Non-blocking — failure here must NOT break the accept flow
    return { success: false, error: e(err) };
  }
}

/* ------------------------------------------------------------------ */
/*  deactivateSessionsForEvent                                         */
/*  Called when a class is cancelled. Deactivates device sessions.    */
/* ------------------------------------------------------------------ */

export async function deactivateSessionsForEvent(
  calendarEventId: number,
  reason: string = "ClassCancelled",
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const { error } = await adminSupabase
      .from("device_class_sessions")
      .update({
        isActive: false,
        deactivatedAt: now,
        deactivationReason: reason,
        updatedAt: now,
      })
      .eq("calendarEventId", calendarEventId)
      .eq("isActive", true);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: e(err) };
  }
}

/* ------------------------------------------------------------------ */
/*  updateDeviceSessionForEvent                                        */
/*  Updates active device sessions when event timings change.          */
/* ------------------------------------------------------------------ */

export async function updateDeviceSessionForEvent(params: {
  calendarEventId: number;
  eventDate: string;
  fromTime: string;
  toTime: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const { error } = await adminSupabase
      .from("device_class_sessions")
      .update({
        eventDate: params.eventDate,
        fromTime: params.fromTime,
        toTime: params.toTime,
        updatedAt: now,
      })
      .eq("calendarEventId", params.calendarEventId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: e(err) };
  }
}
