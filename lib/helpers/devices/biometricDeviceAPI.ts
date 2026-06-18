import { supabase } from "@/lib/supabaseClient";
import { encryptPassword } from "./encryptionUtils";

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

export type DeviceCategory = "classroom" | "gate";
export type DeviceType = "fingerprint" | "facerecognition" | "card" | "multi";
export type GateDirection = "In" | "Out";

export interface BiometricDevicePayload {
  deviceId?: number;
  collegeId: number;
  deviceName: string;
  deviceSerialNumber: string;
  deviceIp: string;
  devicePort: number;
  deviceUsername: string;
  /** Plain‑text — encrypted before insert/update */
  devicePassword: string;
  deviceType: DeviceType;
  deviceCategory: DeviceCategory;
  gateDirection?: GateDirection | null;
  deviceModel?: string | null;
  firmwareVersion?: string | null;
  isActive?: boolean;
  createdBy: number;
}

export interface BiometricDeviceRow {
  deviceId: number;
  collegeId: number;
  deviceName: string;
  deviceSerialNumber: string;
  deviceIp: string;
  devicePort: number;
  deviceUsername: string;
  deviceType: DeviceType;
  deviceCategory: DeviceCategory;
  gateDirection: GateDirection | null;
  deviceModel: string | null;
  firmwareVersion: string | null;
  lastHeartbeat: string | null;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface DeviceFilters {
  deviceCategory?: DeviceCategory;
  isActive?: boolean;
  isOnline?: boolean;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  GET — paginated list                                               */
/* ------------------------------------------------------------------ */

export const getBiometricDevices = async (
  collegeId: number,
  page = 1,
  limit = 10,
  filters?: DeviceFilters,
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("biometric_devices")
      .select(
        "deviceId, collegeId, deviceName, deviceSerialNumber, deviceIp, devicePort, deviceUsername, deviceType, deviceCategory, gateDirection, deviceModel, firmwareVersion, lastHeartbeat, isOnline, isActive, createdAt",
        { count: "exact" },
      )
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .is("deletedAt", null);

    if (filters?.deviceCategory) query = query.eq("deviceCategory", filters.deviceCategory);
    if (filters?.isActive !== undefined) query = query.eq("isActive", filters.isActive);
    if (filters?.isOnline !== undefined) query = query.eq("isOnline", filters.isOnline);
    if (filters?.search) {
      query = query.or(
        `deviceName.ilike.%${filters.search}%,deviceSerialNumber.ilike.%${filters.search}%,deviceIp.ilike.%${filters.search}%`,
      );
    }

    const { data, error, count } = await query
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as BiometricDeviceRow[], total: count ?? 0 };
  } catch (e) {
    return { success: false as const, data: [] as BiometricDeviceRow[], total: 0, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  GET — single                                                       */
/* ------------------------------------------------------------------ */

export const getBiometricDeviceById = async (deviceId: number) => {
  try {
    const { data, error } = await supabase
      .from("biometric_devices")
      .select("*")
      .eq("deviceId", deviceId)
      .single();

    if (error) throw error;
    return { success: true as const, data };
  } catch (e) {
    return { success: false as const, data: null, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  GET — unassigned devices (not linked to any room)                  */
/* ------------------------------------------------------------------ */

export const getUnassignedDevices = async (
  collegeId: number,
  category?: DeviceCategory,
  page = 1,
  limit = 10,
  search?: string,
) => {
  try {
    const { data: links, error: linkErr } = await supabase
      .from("room_devices")
      .select("deviceId")
      .eq("isActive", true)
      .is("deletedAt", null);
    if (linkErr) throw linkErr;

    const linkedIds = (links ?? []).map((l: { deviceId: number }) => l.deviceId);

    let devQuery = supabase
      .from("biometric_devices")
      .select("deviceId, deviceName, deviceSerialNumber, deviceIp, devicePort, deviceCategory, gateDirection")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null);

    if (category) devQuery = devQuery.eq("deviceCategory", category);
    if (linkedIds.length > 0) {
      devQuery = devQuery.not("deviceId", "in", `(${linkedIds.join(",")})`);
    }
    if (search?.trim()) {
      devQuery = devQuery.or(
        `deviceName.ilike.%${search.trim()}%,deviceSerialNumber.ilike.%${search.trim()}%,deviceIp.ilike.%${search.trim()}%`,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: devices, error: devErr } = await devQuery
      .order("deviceName", { ascending: true })
      .range(from, to);

    if (devErr) throw devErr;
    return { success: true as const, data: (devices ?? []) as BiometricDeviceRow[] };
  } catch (e) {
    return { success: false as const, data: [] as BiometricDeviceRow[], error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  UPSERT                                                             */
/* ------------------------------------------------------------------ */

export const upsertBiometricDevice = async (payload: BiometricDevicePayload) => {
  try {
    const now = new Date().toISOString();

    const base: {
      collegeId: number;
      deviceName: string;
      deviceSerialNumber: string;
      deviceIp: string;
      devicePort: number;
      deviceUsername: string;
      devicePasswordEncrypted?: string;
      deviceType: DeviceType;
      deviceCategory: DeviceCategory;
      gateDirection: GateDirection | null;
      deviceModel: string | null;
      firmwareVersion: string | null;
      isActive: boolean;
      updatedAt: string;
    } = {
      collegeId: payload.collegeId,
      deviceName: payload.deviceName.trim(),
      deviceSerialNumber: payload.deviceSerialNumber.trim(),
      deviceIp: payload.deviceIp.replace(/^https?:\/\//i, '').replace(/\/$/, '').split(':')[0].trim(),
      devicePort: payload.devicePort,
      deviceUsername: payload.deviceUsername.trim(),
      deviceType: payload.deviceType,
      deviceCategory: payload.deviceCategory,
      gateDirection: payload.deviceCategory === "gate" ? payload.gateDirection || null : null,
      deviceModel: payload.deviceModel?.trim() || null,
      firmwareVersion: payload.firmwareVersion?.trim() || null,
      isActive: payload.isActive ?? true,
      updatedAt: now,
    };

    if (payload.devicePassword && payload.devicePassword !== "unchanged_placeholder") {
      base.devicePasswordEncrypted = await encryptPassword(payload.devicePassword);
    }

    let snQuery = supabase
      .from("biometric_devices")
      .select("deviceId")
      .eq("deviceSerialNumber", base.deviceSerialNumber)
      .eq("is_deleted", false)
      .is("deletedAt", null);
    if (payload.deviceId) snQuery = snQuery.neq("deviceId", payload.deviceId);
    const { data: snDup } = await snQuery;
    if (snDup && snDup.length > 0)
      return { success: false as const, error: "A device with this serial number already exists." };

    let ipQuery = supabase
      .from("biometric_devices")
      .select("deviceId")
      .eq("collegeId", payload.collegeId)
      .eq("deviceIp", base.deviceIp)
      .eq("devicePort", base.devicePort)
      .eq("is_deleted", false)
      .is("deletedAt", null);
    if (payload.deviceId) ipQuery = ipQuery.neq("deviceId", payload.deviceId);
    const { data: ipDup } = await ipQuery;
    if (ipDup && ipDup.length > 0)
      return { success: false as const, error: "A device with this IP and port already exists in your college." };

    if (payload.deviceId) {
      const { data, error } = await supabase
        .from("biometric_devices")
        .update(base)
        .eq("deviceId", payload.deviceId)
        .select()
        .single();
      if (error) throw error;
      return { success: true as const, data };
    }

    const { data, error } = await supabase
      .from("biometric_devices")
      .insert({ ...base, createdBy: payload.createdBy, createdAt: now })
      .select()
      .single();
    if (error) throw error;
    return { success: true as const, data };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  DELETE (soft)                                                       */
/* ------------------------------------------------------------------ */

export const deleteBiometricDevice = async (deviceId: number) => {
  try {
    const now = new Date().toISOString();

    // Also deactivate any room link
    await supabase
      .from("room_devices")
      .update({ isActive: false, deletedAt: now, updatedAt: now })
      .eq("deviceId", deviceId)
      .is("deletedAt", null);

    const { error } = await supabase
      .from("biometric_devices")
      .update({ is_deleted: true, isActive: false, deletedAt: now, updatedAt: now })
      .eq("deviceId", deviceId);

    if (error) throw error;
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  Heartbeat update                                                   */
/* ------------------------------------------------------------------ */

export const updateDeviceHeartbeat = async (deviceId: number, isOnline: boolean) => {
  try {
    const { error } = await supabase
      .from("biometric_devices")
      .update({
        lastHeartbeat: new Date().toISOString(),
        isOnline,
        updatedAt: new Date().toISOString(),
      })
      .eq("deviceId", deviceId);
    if (error) throw error;
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  Realtime Subscription                                             */
/* ------------------------------------------------------------------ */

export const subscribeToDeviceStatusUpdates = (
  collegeId: number,
  onUpdate: (payload: { newRow: any; oldRow: any }) => void
) => {
  const channel = supabase
    .channel("realtime-biometric-devices")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "biometric_devices",
        filter: `collegeId=eq.${collegeId}`,
      },
      (payload) => {
        onUpdate({ newRow: payload.new, oldRow: payload.old });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
