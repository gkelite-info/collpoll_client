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
      .select("deviceId, deviceIp, devicePort, isOnline, lastHeartbeat")
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
    const pingDevice = async (device: any) => {
      let isActuallyOnline = false;
      let pingAttempted = true;
      
      const isPrivateIp = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(device.deviceIp);
      const isCloudEnv = process.env.VERCEL || process.env.NEXT_PUBLIC_APP_URL?.includes("https://");

      // If we are in the cloud and the device is on a private network, active ping will ALWAYS fail.
      // We skip the ping and rely on passive heartbeats (scans/syncs) to prevent false 'Offline' flags.
      if (isCloudEnv && isPrivateIp) {
        pingAttempted = false;
        
        // Passive fallback check: if it hasn't synced or scanned in 24 hours, assume offline.
        // Otherwise, assume it's still online (so we don't break the UI status randomly).
        if (device.lastHeartbeat) {
          const hoursSinceLastHeartbeat = (new Date().getTime() - new Date(device.lastHeartbeat).getTime()) / (1000 * 60 * 60);
          isActuallyOnline = hoursSinceLastHeartbeat < 24;
        } else {
          isActuallyOnline = device.isOnline; // Keep previous state if no heartbeat recorded
        }
      } else {
        // Normal active ping (works for public IPs, or if server is hosted locally)
        try {
          const url = `http://${device.deviceIp}:${device.devicePort}/ISAPI/System/status`;
          await fetch(url, { 
            signal: AbortSignal.timeout(5000), 
            method: "GET" 
          });
          isActuallyOnline = true;
        } catch (err: any) {
          isActuallyOnline = false;
        }
      }

      return {
        deviceId: device.deviceId,
        wasOnline: device.isOnline,
        isNowOnline: isActuallyOnline,
        pingAttempted
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
      // OR if it IS currently online AND we actively pinged it (so we can bump the lastHeartbeat timestamp).
      // We don't need to constantly update offline devices if their status hasn't changed.
      const statusChanged = res.wasOnline !== res.isNowOnline;
      const shouldBumpHeartbeat = res.isNowOnline && res.pingAttempted;
      
      if (statusChanged || shouldBumpHeartbeat) {
        updates.push(
          supabase
            .from("biometric_devices")
            .update({
              isOnline: res.isNowOnline,
              ...(shouldBumpHeartbeat ? { lastHeartbeat: now } : {}),
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
