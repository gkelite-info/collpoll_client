import { NextResponse } from "next/server";
import { configureDeviceWebhook, getDeviceInfo } from "@/lib/helpers/devices/hikvisionAPI";
import { adminSupabase } from "@/lib/helpers/devices/scanIngestionHelper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "Missing deviceId" }, { status: 400 });
    }

    const { data: device, error } = await adminSupabase
      .from("biometric_devices")
      .select("deviceId, deviceName")
      .eq("deviceId", deviceId)
      .single();

    if (error || !device) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    // Fully dynamic SaaS approach: derive URL from incoming request!
    // We expect the frontend to pass its origin in the payload, but if not we can try headers.
    // However, the cleanest is to let configureDeviceWebhook read NEXT_PUBLIC_APP_URL, 
    // but on the server, process.env is safest, OR we can extract the Host header.
    const hostHeader = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || (hostHeader?.includes("localhost") ? "http" : "https");
    const dynamicAppUrl = hostHeader ? `${protocol}://${hostHeader}` : undefined;

    // 1. Test connection and get physical device name
    const info = await getDeviceInfo(device.deviceId);
    const physicalName = info?.deviceName || "Unknown Device";

    if (!info?.raw) {
      throw new Error("Device is offline or credentials rejected");
    }

    // 2. Configure webhook dynamically
    await configureDeviceWebhook(device.deviceId, dynamicAppUrl);

    return NextResponse.json({ 
      success: true, 
      physicalName,
      message: `Device connected. Webhook synced securely.` 
    });
  } catch (err: any) {
    console.error("Device Sync Error:", err);
    return NextResponse.json({ success: false, error: "Device is unreachable or credentials are wrong. Please verify network." }, { status: 500 });
  }
}
