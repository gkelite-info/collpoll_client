import { getBiometricValidity } from "./biometricValidity";
import { getBiometricDevices } from "@/lib/helpers/devices/biometricDeviceAPI";
import { registerUserOnDevice } from "@/lib/helpers/devices/hikvisionAPI";

/**
 * Register a user on ALL active biometric devices for a college.
 *
 * Uses the dynamic device-proxy (via `registerUserOnDevice`) which resolves
 * device IP / credentials from the DB.  If the user already exists on a device,
 * the Hikvision API returns `employeeNoAlreadyExist` and we transparently
 * switch to a Modify call — so this function is idempotent and safe to call
 * during enrollment or user creation.
 *
 * @returns Summary with per-device results
 */
export const registerUserToHikvision = async (
  userId: number,
  fullName: string,
  collegeId: number,
  role?: string,
  educationType?: string | null,
): Promise<{ totalDevices: number; succeeded: number; failed: number; errors: string[] }> => {
  const { beginTime, endTime } = getBiometricValidity(role, educationType);

  // Fetch all active devices for this college (up to 100)
  const devicesRes = await getBiometricDevices(collegeId, 1, 100);
  if (!devicesRes.success || devicesRes.data.length === 0) {
    return { totalDevices: 0, succeeded: 0, failed: 0, errors: [] };
  }

  const activeDevices = devicesRes.data.filter((d) => d.isActive);
  if (activeDevices.length === 0) {
    return { totalDevices: 0, succeeded: 0, failed: 0, errors: [] };
  }

  // Register on all devices concurrently — allSettled ensures one failure doesn't block others
  const results = await Promise.allSettled(
    activeDevices.map(async (device) => {
      try {
        await registerUserOnDevice(device.deviceId, userId, fullName, beginTime, endTime);
        return { deviceId: device.deviceId, deviceName: device.deviceName, success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return { deviceId: device.deviceId, deviceName: device.deviceName, success: false, error: msg };
      }
    }),
  );

  const succeeded = results.filter(
    (r) => r.status === "fulfilled" && r.value.success,
  ).length;

  const errors = results
    .filter((r) => r.status === "fulfilled" && !r.value.success)
    .map((r) => {
      const val = (r as PromiseFulfilledResult<any>).value;
      return `${val.deviceName}: ${val.error}`;
    });

  // Also count rejected promises (unexpected throws)
  const rejected = results.filter((r) => r.status === "rejected");
  rejected.forEach((r) => {
    const reason = (r as PromiseRejectedResult).reason;
    errors.push(`Unknown device: ${reason?.message || String(reason)}`);
  });

  return {
    totalDevices: activeDevices.length,
    succeeded,
    failed: activeDevices.length - succeeded,
    errors,
  };
};