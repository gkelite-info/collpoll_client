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
      
      // Determine if the server executing this code is running in the cloud vs locally
      const host = request.headers.get("host") || "";
      const isCloudEnv = !host.includes("localhost") && !host.includes("127.0.0.1");

      // 1. ALWAYS attempt the ping first. This supports advanced SaaS edge cases 
      // like Site-to-Site VPNs where a cloud server *can* actually ping a private IP.
      try {
        const tcpPing = () => new Promise<boolean>((resolve) => {
          const net = require("net");
          const socket = new net.Socket();
          socket.setTimeout(1500); // 1.5s timeout prevents Vercel lambda exhaustion
          socket.on("connect", () => { socket.destroy(); resolve(true); });
          socket.on("timeout", () => { socket.destroy(); resolve(false); });
          socket.on("error", () => { socket.destroy(); resolve(false); });
          socket.connect(device.devicePort, device.deviceIp);
        });
        
        isActuallyOnline = await tcpPing();
        
        if (!isActuallyOnline) {
          const url = `http://${device.deviceIp}:${device.devicePort}/`;
          await fetch(url, { signal: AbortSignal.timeout(1500), method: "GET" }).catch(() => {});
          // If fetch doesn't throw, it's technically reachable, but Hikvision might drop it
          // We won't strictly rely on fetch success if TCP failed, but this handles weird proxies.
        }
      } catch (err: any) {
        isActuallyOnline = false;
      }

      // 2. Intelligently Handle Ping Failures
      if (!isActuallyOnline) {
        // If a ping to a Private IP fails from a Cloud Server, the failure is AMBIGUOUS.
        // It might be turned off, OR the cloud just can't route to it due to NAT.
        const isAmbiguousFailure = isPrivateIp && isCloudEnv;

        if (isAmbiguousFailure) {
          pingAttempted = false; // We can't trust this ping attempt
          
          // Passive fallback: rely on the last successful heartbeat push or local sync
          if (device.lastHeartbeat) {
            const hoursSinceLastHeartbeat = (new Date().getTime() - new Date(device.lastHeartbeat).getTime()) / (1000 * 60 * 60);
            isActuallyOnline = hoursSinceLastHeartbeat < 24;
          } else {
            isActuallyOnline = device.isOnline; // Retain previous state
          }
        } else {
          // If it's a Public IP, OR if the server is running on Localhost, a failed ping means it's truly offline.
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

    // 3. Ping each device in controlled batches (SaaS Scalability: prevents Node.js socket exhaustion)
    const PING_BATCH_SIZE = 150;
    const results = [];
    
    for (let i = 0; i < devices.length; i += PING_BATCH_SIZE) {
      const batch = devices.slice(i, i + PING_BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(pingDevice));
      results.push(...batchResults);
    }

    // 4. Prepare database updates (using variables declared above)
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

    // 5. Execute DB updates in controlled batches to prevent Supabase connection pool exhaustion
    const DB_BATCH_SIZE = 50;
    for (let i = 0; i < updates.length; i += DB_BATCH_SIZE) {
      await Promise.all(updates.slice(i, i + DB_BATCH_SIZE));
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
