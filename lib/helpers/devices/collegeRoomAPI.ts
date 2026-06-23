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

export type RoomType =
  | "classroom"
  | "lab"
  | "auditorium"
  | "seminarhall"
  | "gate"
  | "library"
  | "conference";

export type RoomDBPayload = {
  collegeRoomId?: number;
  roomNo: string;
  roomType?: RoomType;
  floor?: string | null;
  building?: string | null;
  capacity?: number | null;
  collegeId: number;
  createdBy: number;
};

export interface RoomViewData {
  collegeRoomId: number;
  collegeId: number;
  roomNo: string;
  roomType: RoomType | null;
  floor: string | null;
  building: string | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: string;
  // Joined device info
  device: {
    deviceId: number;
    deviceName: string;
    deviceSerialNumber: string;
    deviceIp: string;
    devicePort: number;
    deviceCategory: string;
    isOnline: boolean;
  } | null;
}

/* ------------------------------------------------------------------ */
/*  GET — paginated                                                    */
/* ------------------------------------------------------------------ */

export const getCollegeRooms = async (
  collegeId: number,
  page = 1,
  limit = 10,
  search?: string,
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = supabase
      .from("college_rooms")
      .select(
        "collegeRoomId, collegeId, roomNo, roomType, floor, building, capacity, isActive, createdAt",
        { count: "exact" },
      )
      .eq("collegeId", collegeId)
      .is("deletedAt", null);

    if (search?.trim()) {
      q = q.or(
        `roomNo.ilike.%${search.trim()}%,building.ilike.%${search.trim()}%,floor.ilike.%${search.trim()}%`,
      );
    }

    const { data: roomsData, error: roomsError, count } = await q
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (roomsError) throw roomsError;
    if (!roomsData || roomsData.length === 0) return { success: true, data: [], total: 0 };

    const roomIds = roomsData.map((r: any) => r.collegeRoomId);

    // Fetch active room-device links
    let deviceMap: Record<number, RoomViewData["device"]> = {};
    try {
      const { data: links } = await supabase
        .from("room_devices")
        .select("collegeRoomId, deviceId")
        .in("collegeRoomId", roomIds)
        .eq("isActive", true)
        .is("deletedAt", null);

      if (links && links.length > 0) {
        const deviceIds = links.map((l: any) => l.deviceId);
        const { data: devices } = await supabase
          .from("biometric_devices")
          .select("deviceId, deviceName, deviceSerialNumber, deviceIp, devicePort, deviceCategory, isOnline")
          .in("deviceId", deviceIds)
          .eq("is_deleted", false)
          .is("deletedAt", null);

        if (devices) {
          const devById: Record<number, any> = {};
          devices.forEach((d: any) => { devById[d.deviceId] = d; });

          links.forEach((l: any) => {
            const dev = devById[l.deviceId];
            if (dev) deviceMap[l.collegeRoomId] = dev;
          });
        }
      }
    } catch { /* device lookup failure is non-fatal */ }

    const mapped: RoomViewData[] = roomsData.map((r: any) => ({
      collegeRoomId: r.collegeRoomId,
      collegeId: r.collegeId,
      roomNo: r.roomNo,
      roomType: r.roomType,
      floor: r.floor,
      building: r.building,
      capacity: r.capacity,
      isActive: r.isActive,
      createdAt: r.createdAt,
      device: deviceMap[r.collegeRoomId] || null,
    }));

    return { success: true, data: mapped, total: count ?? 0 };
  } catch (e) {
    return { success: false, data: [], total: 0, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  UPSERT room (without device creation)                              */
/* ------------------------------------------------------------------ */

export const upsertCollegeRoom = async (payload: RoomDBPayload) => {
  try {
    const now = new Date().toISOString();
    const { collegeRoomId, ...rest } = payload;

    const formatted = {
      ...rest,
      roomNo: payload.roomNo.trim(),
      roomType: payload.roomType || "classroom",
      floor: payload.floor?.trim() || null,
      building: payload.building?.trim() || null,
      capacity: payload.capacity ? Number(payload.capacity) : null,
      updatedAt: now,
    };

    // Unique check: roomNo per college
    let q = supabase
      .from("college_rooms")
      .select("collegeRoomId")
      .eq("collegeId", payload.collegeId)
      .eq("roomNo", formatted.roomNo)
      .is("deletedAt", null);
    if (collegeRoomId) q = q.neq("collegeRoomId", collegeRoomId);
    const { data: dup } = await q;
    if (dup && dup.length > 0)
      return { success: false, error: "A room with this Room No already exists in your college." };

    if (collegeRoomId) {
      const { data, error } = await supabase
        .from("college_rooms")
        .update(formatted)
        .eq("collegeRoomId", collegeRoomId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    }

    const { data, error } = await supabase
      .from("college_rooms")
      .insert({ ...formatted, createdAt: now })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    return { success: false, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  Assign / Unassign device to room                                   */
/* ------------------------------------------------------------------ */

export const assignDeviceToRoom = async (collegeRoomId: number, deviceId: number) => {
  try {
    const now = new Date().toISOString();

    await supabase
      .from("room_devices")
      .update({ isActive: false, deletedAt: now, updatedAt: now })
      .eq("collegeRoomId", collegeRoomId)
      .is("deletedAt", null);

    await supabase
      .from("room_devices")
      .update({ isActive: false, deletedAt: now, updatedAt: now })
      .eq("deviceId", deviceId)
      .is("deletedAt", null);

    const { data: existing, error: checkErr } = await supabase
      .from("room_devices")
      .select("deviceId")
      .eq("deviceId", deviceId)
      .maybeSingle();

    if (checkErr) throw checkErr;

    if (existing) {
      const { error } = await supabase
        .from("room_devices")
        .update({
          collegeRoomId,
          isActive: true,
          installedAt: now.split("T")[0],
          deletedAt: null,
          updatedAt: now,
        })
        .eq("deviceId", deviceId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("room_devices").insert({
        collegeRoomId,
        deviceId,
        isActive: true,
        installedAt: now.split("T")[0],
        createdAt: now,
        updatedAt: now,
      });
      if (error) throw error;
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: err(e) };
  }
};

export const unassignDeviceFromRoom = async (collegeRoomId: number) => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("room_devices")
      .update({ isActive: false, deletedAt: now, updatedAt: now })
      .eq("collegeRoomId", collegeRoomId)
      .is("deletedAt", null);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  DELETE room (soft)                                                  */
/* ------------------------------------------------------------------ */

export const deleteCollegeRoom = async (collegeRoomId: number) => {
  try {
    const now = new Date().toISOString();

    // Deactivate device links
    await supabase
      .from("room_devices")
      .update({ isActive: false, deletedAt: now, updatedAt: now })
      .eq("collegeRoomId", collegeRoomId)
      .is("deletedAt", null);

    const { error } = await supabase
      .from("college_rooms")
      .update({ deletedAt: now })
      .eq("collegeRoomId", collegeRoomId);

    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, error: err(e) };
  }
};
