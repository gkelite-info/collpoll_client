import { supabase } from "@/lib/supabaseClient";
import { adminSupabase } from "@/lib/helpers/devices/scanIngestionHelper";

const e = (err: unknown) =>
  err instanceof Error ? err.message : "Unknown error";


export interface ActivationResult {
  success: boolean;
  deviceClassSessionId?: number;
  skipped?: boolean;
  skipReason?: string;
  error?: string;
}


async function resolveCollegeRoomId(
  calendarEventId: number,
  collegeId: number,
): Promise<number | null> {
  const { data: evt, error: evtErr } = await adminSupabase
    .from("calendar_event")
    .select("collegeRoomId")
    .eq("calendarEventId", calendarEventId)
    .maybeSingle();

  if (evtErr) throw new Error(`Event lookup failed: ${evtErr.message}`);
  if (!evt) throw new Error(`Calendar event ${calendarEventId} not found`);

  return evt.collegeRoomId as number;
}


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

  const dev = Array.isArray(data.biometric_devices)
    ? data.biometric_devices[0]
    : data.biometric_devices;

  if (!dev || dev.is_deleted || !dev.isActive) return null;

  return {
    deviceId: data.deviceId,
    isOnline: dev.isOnline ?? false,
  };
}


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


export async function activateDeviceSessionForClass(params: {
  calendarEventId: number;
  facultyClassSessionsId: number;
  collegeId: number;
}): Promise<ActivationResult> {
  try {
    const { calendarEventId, facultyClassSessionsId, collegeId } = params;

    const { data: evt, error: evtErr } = await adminSupabase
      .from("calendar_event")
      .select("type, date, fromTime, toTime, collegeRoomId")
      .eq("calendarEventId", calendarEventId)
      .maybeSingle();

    if (evtErr) throw new Error(evtErr.message);
    if (!evt) {
      return { success: true, skipped: true, skipReason: "EventNotFound" };
    }

    if (evt.type !== "class") {
      return {
        success: true,
        skipped: true,
        skipReason: `EventType=${evt.type}NoBiometric`,
      };
    }

    const collegeRoomId = await resolveCollegeRoomId(calendarEventId, collegeId);
    if (!collegeRoomId) {
      return {
        success: true,
        skipped: true,
        skipReason: "NoRoomConfigured",
      };
    }

    const device = await resolveDeviceForRoom(collegeRoomId);
    if (!device) {
      return {
        success: true,
        skipped: true,
        skipReason: "NoDeviceAssignedToRoom",
      };
    }

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
    return { success: false, error: e(err) };
  }
}


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
