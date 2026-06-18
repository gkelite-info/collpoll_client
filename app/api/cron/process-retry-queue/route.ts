import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * =================================================================================
 * SUPABASE CRON JOB SETUP FOR RETRY QUEUE
 * =================================================================================
 * Run this in your Supabase SQL Editor to schedule the retry processor:
 * 
 * SELECT cron.schedule(
 *   'process-retry-queue-cron',
 *   '* /5 * * * *', -- Every 5 minutes (remove space before /5)
 *   $$
 *     SELECT net.http_get(
 *       url:='https://yourdomain.com/api/cron/process-retry-queue',
 *       headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
 *       timeout_milliseconds:=30000
 *     );
 *   $$
 * );
 * =================================================================================
 */

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SaaS level backoff: 1m, 2m, 5m, 15m, 30m, 60m, 120m
const BACKOFF_MINUTES = [1, 2, 5, 15, 30, 60, 120];
const MAX_ATTEMPTS = BACKOFF_MINUTES.length;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch unresolved items
    // Fetch a larger pool because we will filter by backoff logic in-memory.
    const { data: rawQueue, error: fetchError } = await supabase
      .from("scan_retry_queue")
      .select("*")
      .eq("resolved", false)
      .lt("attempt", MAX_ATTEMPTS)
      .order("createdAt", { ascending: true })
      .limit(100);

    if (fetchError) throw fetchError;

    if (!rawQueue || rawQueue.length === 0) {
      return NextResponse.json({ message: "Queue is empty" }, { status: 200 });
    }

    const now = Date.now();

    // 2. Exponential Backoff Filter
    const queue = rawQueue.filter((item) => {
      if (!item.lastAttemptAt) return true; // Never attempted
      const lastAttempt = new Date(item.lastAttemptAt).getTime();
      const currentAttempt = item.attempt || 0;
      
      // Use the backoff array, default to longest if something goes wrong
      const backoffDelay = BACKOFF_MINUTES[Math.min(currentAttempt, MAX_ATTEMPTS - 1)] * 60 * 1000;
      
      return now - lastAttempt >= backoffDelay;
    });

    if (queue.length === 0) {
      return NextResponse.json({ message: "No items ready for retry based on backoff logic" }, { status: 200 });
    }

    // Get the base URL dynamically from the request (e.g. localhost:3000 or production domain)
    const baseUrl = new URL(request.url).origin;
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    // 3. Process items in controlled parallel batches
    const BATCH_SIZE = 10;
    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
      const batch = queue.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(batch.map(async (item) => {
        try {
          // ==========================================
          // OPTIMISTIC CONCURRENCY CONTROL (OCC) LOCK
          // ==========================================
          const attemptTs = new Date().toISOString();
          const { data: lockResult, error: lockError } = await supabase
            .from("scan_retry_queue")
            .update({ 
              attempt: (item.attempt || 0) + 1, 
              lastAttemptAt: attemptTs,
              updatedAt: attemptTs 
            })
            .eq("retryId", item.retryId)
            // Critical OCC check: Only update if no other cron grabbed it first
            .eq("attempt", item.attempt || 0)
            .select("retryId")
            .maybeSingle();

          if (lockError || !lockResult) {
            // Another cron instance already took this row, or it was deleted. Skip!
            skippedCount++;
            return;
          }

          // Lock acquired. Proceed with retry processing.
          const retryPayload = {
            ...(typeof item.rawPayload === "string" ? JSON.parse(item.rawPayload) : item.rawPayload),
            isRetry: true,
          };

          const res = await fetch(`${baseUrl}/api/biometric/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(retryPayload),
          });

          const resultText = await res.text();
          let resultData: any = {};
          try {
            resultData = JSON.parse(resultText);
          } catch {
             // Ignore parse errors, handle based on res.ok
          }

          // 4. Evaluate success
          // A true success means the webhook returned 200 OK and didn't re-queue it.
          const isSuccess = res.ok && resultData.processed === true && !resultData.queued;

          if (isSuccess) {
            successCount++;
            await supabase
              .from("scan_retry_queue")
              .update({
                resolved: true,
                updatedAt: new Date().toISOString(),
              })
              .eq("retryId", item.retryId);
          } else {
            failureCount++;
            await supabase
              .from("scan_retry_queue")
              .update({
                failureReason: resultData.reason || "Retry Failed",
                updatedAt: new Date().toISOString(),
              })
              .eq("retryId", item.retryId);
          }
        } catch (err: any) {
          failureCount++;
          // Network error during fetch
          await supabase
            .from("scan_retry_queue")
            .update({
              failureReason: err.message,
              updatedAt: new Date().toISOString(),
            })
            .eq("retryId", item.retryId);
        }
      }));
    }

    return NextResponse.json({
      success: true,
      totalFound: rawQueue.length,
      readyToProcess: queue.length,
      successCount,
      failureCount,
      skippedDueToLocking: skippedCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Process retry queue cron error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
