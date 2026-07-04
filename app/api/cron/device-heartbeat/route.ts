import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =================================================================================
// SUPABASE CRON JOB SETUP & MANUAL TRIGGER INSTRUCTIONS (SaaS Grade)
// =================================================================================
// If the automated cron job fails or needs to be redeployed, run the following 
// SQL in the Supabase SQL Editor. This uses pg_cron and pg_net to reliably 
// trigger this endpoint every minute.
// 
// ```sql
// -- 1. Enable required extensions for HTTP requests and scheduling
// CREATE EXTENSION IF NOT EXISTS pg_net;
// CREATE EXTENSION IF NOT EXISTS pg_cron;
// 
// -- 2. Safely remove any existing job to prevent duplicate polling
// -- (Using a conditional subquery to avoid "could not find valid entry" errors on fresh setups)
// SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'device-heartbeat-cron';
// 
// -- 3. Schedule the robust 5-minute heartbeat job
// SELECT cron.schedule(
//   'device-heartbeat-cron',  -- Unique job identifier
//   '*/5 * * * *',            -- Execute every 5 minutes (safer for thousands of devices)
//   $$
//     SELECT net.http_get(
//       url:='https://tektoncampus.com/api/cron/device-heartbeat',
//       headers:='{"Authorization": "Bearer ACTUAL_CRON_SECRET_HERE"}'::jsonb,
//       timeout_milliseconds:=10000 -- Generous 10s timeout for the API to process all devices
//     );
//   $$
// );
// 
// -- ==========================================
// -- TROUBLESHOOTING & DEBUGGING COMMANDS:
// -- ==========================================
// -- Verify the job is scheduled:
// -- SELECT * FROM cron.job WHERE jobname = 'device-heartbeat-cron';
// 
// -- Check recent execution logs (success/failures):
// -- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'device-heartbeat-cron') ORDER BY start_time DESC LIMIT 10;
// ```
// =================================================================================

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Secure the endpoint: Ensure only authorized schedulers can trigger the DB operations
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date().toISOString();

    // 1. Fetch all active devices
    const { data: devices, error } = await supabase
      .from("biometric_devices")
      .select("deviceId, deviceIp, devicePort, isOnline")
      .eq("isActive", true)
      .eq("is_deleted", false);

    if (error) throw error;

    if (!devices || devices.length === 0) {
      return NextResponse.json({ message: "No active devices to monitor" }, { status: 200 });
    }

    let onlineCount = 0;
    let offlineCount = 0;
    const updates = [];

    // 2. Ping each device concurrently
    // We use a lightweight fetch (no digest auth) to optimize for scale.
    // If the device's web server responds at all (even with 401/403), it is physically online.
    const pingDevice = async (device: any) => {
      let isActuallyOnline = false;
      try {
        // Use a standard ISAPI endpoint. Some firmware drops root '/' connections abruptly
        const url = `http://${device.deviceIp}:${device.devicePort}/ISAPI/System/status`;
        // Fast timeout: if it doesn't respond in 4 seconds on a local network, it's offline/power cut.
        await fetch(url, { 
          signal: AbortSignal.timeout(4000), 
          method: "GET" 
        });
        // Any HTTP response (even 401 Unauthorized) means the web server is alive
        isActuallyOnline = true;
      } catch (err: any) {
        // Network Error or AbortError (Timeout) -> Offline
        isActuallyOnline = false;
      }

      return {
        deviceId: device.deviceId,
        wasOnline: device.isOnline,
        isNowOnline: isActuallyOnline
      };
    };

    const results = await Promise.all(devices.map(pingDevice));

    // 3. Prepare database updates
    for (const res of results) {
      if (res.isNowOnline) {
        onlineCount++;
      } else {
        offlineCount++;
      }

      // To minimize DB load, we only update if the online status CHANGED
      // OR if it IS currently online (so we can bump the lastHeartbeat timestamp).
      // We don't need to constantly update offline devices if their status hasn't changed.
      if (res.wasOnline !== res.isNowOnline || res.isNowOnline) {
        updates.push(
          supabase
            .from("biometric_devices")
            .update({
              isOnline: res.isNowOnline,
              ...(res.isNowOnline ? { lastHeartbeat: now } : {}),
              updatedAt: now,
            })
            .eq("deviceId", res.deviceId)
        );
      }
    }

    // 4. Execute updates concurrently
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return NextResponse.json({
      success: true,
      totalDevices: devices.length,
      onlineCount,
      offlineCount,
      updatedCount: updates.length,
      timestamp: now,
    });
  } catch (error: any) {
    console.error("Device heartbeat cron error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * =================================================================================
 * SAAS WEBHOOK (PUSH ARCHITECTURE)
 * =================================================================================
 * For multiple colleges with devices behind local network firewalls (like 192.168.x.x), 
 * the cloud cannot ping them directly. 
 * Instead, colleges can configure their Device Gateway (or a local agent) to POST 
 * their status to this endpoint dynamically.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deviceSerialNumber, isOnline } = body;

    if (!deviceSerialNumber || typeof isOnline !== "boolean") {
      return NextResponse.json({ error: "Invalid payload. Required: { deviceSerialNumber, isOnline }" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("biometric_devices")
      .update({
        isOnline: isOnline,
        ...(isOnline ? { lastHeartbeat: now } : {}),
        updatedAt: now,
      })
      .eq("deviceSerialNumber", deviceSerialNumber)
      .select("deviceId");

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatedDevice: data[0].deviceId, status: isOnline ? "Online" : "Offline" });
  } catch (error: any) {
    console.error("Device heartbeat webhook error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
