import { NextResponse } from "next/server";
import { configureDeviceWebhook, getDeviceInfo } from "@/lib/helpers/devices/hikvisionAPI";
import { adminSupabase } from "@/lib/helpers/devices/scanIngestionHelper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetDeviceId = searchParams.get("deviceId");

    let query = adminSupabase
      .from("biometric_devices")
      .select("deviceId, deviceName")
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null);

    if (targetDeviceId) {
      query = query.eq("deviceId", targetDeviceId);
    }

    const { data: devices, error } = await query;

    if (error) throw error;
    if (!devices || devices.length === 0) return NextResponse.json({ message: "No active devices found" });

    // Resolve SaaS URL dynamically using incoming request headers.
    // This perfectly handles any dynamic port, internal LAN IPs, or SaaS production domains
    // without relying on hardcoded localhost fallbacks or os.networkInterfaces.
    const hostHeader = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || (hostHeader?.includes("localhost") ? "http" : "https");
    const appUrl = hostHeader ? `${protocol}://${hostHeader}` : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    const results = [];
    for (const dev of devices) {
      try {
        // 1. Test Physical Connection & Retrieve Name
        const deviceInfo = await getDeviceInfo(dev.deviceId);
        const physicalName = deviceInfo?.deviceName || "Unknown Device";

        // 2. Configure SaaS Webhook dynamically
        await configureDeviceWebhook(dev.deviceId, appUrl);
        
        results.push({ 
          deviceId: dev.deviceId, 
          registeredName: dev.deviceName, 
          physicalName: physicalName,
          status: `Connection Successful. Webhook configured securely to: ${appUrl}` 
        });
      } catch (err: any) {
        results.push({ 
          deviceId: dev.deviceId, 
          registeredName: dev.deviceName, 
          status: "Connection/Config Failed", 
          error: err.message 
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
