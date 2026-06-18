import { supabase } from "@/lib/supabaseClient";

const err = (e: unknown) => {
  if (e instanceof Error) {
    const msg = e.message;
    if (msg.includes("duplicate key value violates unique constraint")) {
      return "This record already exists.";
    }
    if (msg.includes("violates foreign key constraint")) {
      return "Invalid reference provided.";
    }
    return msg;
  }
  return "Something went wrong. Please try again.";
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DeviceClassSessionPayload {
  deviceClassSessionId?: number;
  facultyClassSessionsId: number;
  calendarEventId: number;
  deviceId: number;
  collegeRoomId: number;
  collegeId: number;
  eventDate: string; // YYYY-MM-DD
  fromTime: string;  // HH:MM
  toTime: string;    // HH:MM
  bufferMinutes?: number;
  activatedAt: string;
}

export interface DeviceClassSessionRow {
  deviceClassSessionId: number;
  facultyClassSessionsId: number;
  calendarEventId: number;
  deviceId: number;
  collegeRoomId: number;
  collegeId: number;
  eventDate: string;
  fromTime: string;
  toTime: string;
  bufferMinutes: number;
  isActive: boolean;
  activatedAt: string;
  deactivatedAt: string | null;
  deactivationReason: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  GET                                                                */
/* ------------------------------------------------------------------ */

export const getDeviceClassSessions = async (
  collegeId: number,
  page = 1,
  limit = 10,
  filters?: {
    deviceId?: number;
    eventDate?: string;
    isActive?: boolean;
    calendarEventId?: number;
  },
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("device_class_sessions")
      .select("*", { count: "exact" })
      .eq("collegeId", collegeId)
      .is("deletedAt", null);

    if (filters?.deviceId) query = query.eq("deviceId", filters.deviceId);
    if (filters?.eventDate) query = query.eq("eventDate", filters.eventDate);
    if (filters?.isActive !== undefined) query = query.eq("isActive", filters.isActive);
    if (filters?.calendarEventId) query = query.eq("calendarEventId", filters.calendarEventId);

    const { data, error, count } = await query
      .order("eventDate", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as DeviceClassSessionRow[], total: count ?? 0 };
  } catch (e) {
    return { success: false as const, data: [], total: 0, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  CREATE                                                             */
/* ------------------------------------------------------------------ */

export const createDeviceClassSession = async (payload: DeviceClassSessionPayload) => {
  try {
    const now = new Date().toISOString();

    // Uniqueness: calendarEventId + deviceId
    const { data: dup } = await supabase
      .from("device_class_sessions")
      .select("deviceClassSessionId")
      .eq("calendarEventId", payload.calendarEventId)
      .eq("deviceId", payload.deviceId)
      .is("deletedAt", null);

    if (dup && dup.length > 0)
      return { success: false as const, error: "This device is already assigned to this class session." };

    const { data, error } = await supabase
      .from("device_class_sessions")
      .insert({
        ...payload,
        bufferMinutes: payload.bufferMinutes ?? 15,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true as const, data };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  DEACTIVATE                                                         */
/* ------------------------------------------------------------------ */

export const deactivateDeviceClassSession = async (
  sessionId: number,
  reason: string,
) => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("device_class_sessions")
      .update({
        isActive: false,
        deactivatedAt: now,
        deactivationReason: reason,
        updatedAt: now,
      })
      .eq("deviceClassSessionId", sessionId);

    if (error) throw error;
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};
