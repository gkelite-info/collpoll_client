import { supabase } from "@/lib/supabaseClient";

export type SyncStatus = "Pending" | "Success" | "Failed";

export interface UserDeviceSyncRow {
  userDeviceSyncId: number;
  userDeviceCredentialId: number;
  deviceId: number;
  syncStatus: SyncStatus;
  lastSyncAttempt: string | null;
  lastSyncSuccess: string | null;
  failureReason: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export const upsertUserDeviceSync = async (payload: {
  userDeviceCredentialId: number;
  deviceId: number;
  syncStatus: SyncStatus;
  failureReason?: string | null;
}) => {
  try {
    const now = new Date().toISOString();
    
    const { data: existing, error: checkErr } = await supabase
      .from("user_device_sync")
      .select("*")
      .eq("userDeviceCredentialId", payload.userDeviceCredentialId)
      .eq("deviceId", payload.deviceId)
      .single();

    if (checkErr && checkErr.code !== 'PGRST116') {
      throw checkErr; // Unknown error
    }

    if (existing) {
      const { data, error } = await supabase
        .from("user_device_sync")
        .update({
          syncStatus: payload.syncStatus,
          lastSyncAttempt: now,
          lastSyncSuccess: payload.syncStatus === "Success" ? now : existing.lastSyncSuccess,
          failureReason: payload.failureReason || null,
          retryCount: payload.syncStatus === "Failed" ? existing.retryCount + 1 : existing.retryCount,
          updatedAt: now,
        })
        .eq("userDeviceSyncId", existing.userDeviceSyncId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true as const, data };
    } else {
      const { data, error } = await supabase
        .from("user_device_sync")
        .insert({
          userDeviceCredentialId: payload.userDeviceCredentialId,
          deviceId: payload.deviceId,
          syncStatus: payload.syncStatus,
          lastSyncAttempt: now,
          lastSyncSuccess: payload.syncStatus === "Success" ? now : null,
          failureReason: payload.failureReason || null,
          retryCount: payload.syncStatus === "Failed" ? 1 : 0,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
        
      if (error) throw error;
      return { success: true as const, data };
    }
  } catch (e: any) {
    return { success: false as const, error: e.message || "Failed to upsert sync record" };
  }
};

export const getSyncStatusesForCredential = async (credentialId: number) => {
  try {
    const { data, error } = await supabase
      .from("user_device_sync")
      .select(`
        *,
        biometric_devices(deviceName)
      `)
      .eq("userDeviceCredentialId", credentialId);

    if (error) throw error;
    return { success: true as const, data: data as (UserDeviceSyncRow & { biometric_devices: { deviceName: string } })[] };
  } catch (e: any) {
    return { success: false as const, error: e.message || "Failed to fetch sync statuses" };
  }
};

export const getSyncStatusesForUser = async (userId: number, collegeId: number) => {
  try {
    const { data, error } = await supabase
      .from("user_device_credentials")
      .select(`
        userDeviceCredentialId,
        user_device_sync (
          userDeviceSyncId,
          deviceId,
          syncStatus,
          failureReason,
          updatedAt,
          biometric_devices (deviceName)
        )
      `)
      .eq("userId", userId)
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (error) throw error;
    return { success: true as const, data };
  } catch (e: any) {
    return { success: false as const, error: e.message || "Failed to fetch sync statuses for user" };
  }
};

export const subscribeToSyncStatuses = (
  credentialIds: number[],
  onUpdate: (payload: any) => void
) => {
  if (credentialIds.length === 0) return { unsubscribe: () => {} };

  const channel = supabase
    .channel("user_device_sync_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_device_sync",
        filter: `userDeviceCredentialId=in.(${credentialIds.join(",")})`,
      },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
};
