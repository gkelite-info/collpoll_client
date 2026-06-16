import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * =================================================================================
 * CRON: Deactivate Expired Device Class Sessions
 * =================================================================================
 * Runs every 5 minutes. Marks device_class_sessions as inactive once the class
 * time window (toTime + bufferMinutes) has passed.
 *
 * Schedule this in Supabase SQL Editor:
 * 
 * ```sql
 * SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'deactivate-sessions-cron';
 * 
 * SELECT cron.schedule(
 *   'deactivate-sessions-cron',
 *   '* /5 * * * *',  -- every 5 minutes (remove space before /5)
 *   $$
 *     SELECT net.http_get(
 *       url:='https://yourdomain.com/api/cron/deactivate-sessions',
 *       headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
 *       timeout_milliseconds:=15000
 *     );
 *   $$
 * );
 * ```
 * =================================================================================
 */

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    // Secure with cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM

    // Find all active sessions where:
    // 1. Event date is before today (definitely expired)
    // 2. Event date is today but toTime + bufferMinutes < current time
    const { data: activeSessions, error: fetchErr } = await supabase
      .from("device_class_sessions")
      .select("deviceClassSessionId, eventDate, toTime, bufferMinutes")
      .eq("isActive", true)
      .is("deletedAt", null)
      .lte("eventDate", today); // Only consider today or past

    if (fetchErr) {
      console.error("[deactivate-sessions] Fetch error:", fetchErr.message);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!activeSessions || activeSessions.length === 0) {
      return NextResponse.json({ deactivated: 0 });
    }

    const toDeactivate: number[] = [];
    const nowMin = timeToMin(currentTimeStr);

    for (const session of activeSessions) {
      const sessionDate = session.eventDate;
      const buf = session.bufferMinutes ?? 0;

      if (sessionDate < today) {
        // Past date — definitely expired
        toDeactivate.push(session.deviceClassSessionId);
      } else if (sessionDate === today) {
        // Same day — check if time window has passed
        const endMin = timeToMin(session.toTime) + buf;
        if (nowMin > endMin) {
          toDeactivate.push(session.deviceClassSessionId);
        }
      }
    }

    if (toDeactivate.length === 0) {
      return NextResponse.json({ deactivated: 0 });
    }

    const { error: updateErr } = await supabase
      .from("device_class_sessions")
      .update({
        isActive: false,
        deactivatedAt: now.toISOString(),
        deactivationReason: "ClassEnded",
        updatedAt: now.toISOString(),
      })
      .in("deviceClassSessionId", toDeactivate);

    if (updateErr) {
      console.error("[deactivate-sessions] Update error:", updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    console.log(`[deactivate-sessions] Deactivated ${toDeactivate.length} sessions`);
    return NextResponse.json({
      deactivated: toDeactivate.length,
      sessionIds: toDeactivate,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[deactivate-sessions] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  Helper                                                              */
/* ------------------------------------------------------------------ */

function timeToMin(hhmmss: string): number {
  const parts = (hhmmss ?? "00:00").split(":");
  return parseInt(parts[0] ?? "0") * 60 + parseInt(parts[1] ?? "0");
}
