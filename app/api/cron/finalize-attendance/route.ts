import { NextResponse } from "next/server";
import { runAttendanceFinalization } from "@/lib/helpers/devices/attendanceFinalizationHelper";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current hour and minute in IST
    const now = new Date();
    const formatterHour = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
    const formatterMinute = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", minute: "2-digit" });
    const formatterDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
    
    let currentHourStr = formatterHour.format(now).replace(/^24$/, "00");
    let currentMinStr = formatterMinute.format(now);
    const todayDateStr = formatterDate.format(now);

    const currentTargetTime = `${currentHourStr.padStart(2, "0")}:${currentMinStr.padStart(2, "0")}`;

    // 1. Fetch all active colleges with their cron timings
    const { data: scheduledColleges, error: fetchErr } = await supabase
      .from("college_cron_timings")
      .select("collegeId, finalizeTime")
      .eq("isActive", true)
      .eq("is_deleted", false);

    // If table doesn't exist yet (42P01), fallback to running for ALL colleges at 19:00 (7 PM) for backward compatibility
    let targetCollegeIds: number[] = [];
    
    if (fetchErr) {
        if (fetchErr.code === '42P01') {
            if (currentTargetTime >= "19:00") {
                const { data: allColleges } = await supabase.from("colleges").select("collegeId");
                targetCollegeIds = allColleges?.map(c => c.collegeId) || [];
            }
        } else {
            throw fetchErr;
        }
    } else if (scheduledColleges) {
        // Filter colleges where finalizeTime has passed or is current
        const dueColleges = scheduledColleges.filter(c => c.finalizeTime <= currentTargetTime);
        
        if (dueColleges.length > 0) {
            // Exclude colleges that already successfully ran today via cron
            const { data: todayLogs } = await supabase
                .from("staff_attendance_finalization_logs")
                .select("collegeId")
                .eq("finalizationDate", todayDateStr)
                .eq("triggeredBy", "cron")
                .eq("errorCount", 0);

            const completedCollegeIds = new Set(todayLogs?.map(l => l.collegeId) || []);
            
            targetCollegeIds = dueColleges
                .filter(c => !completedCollegeIds.has(c.collegeId))
                .map(c => c.collegeId);
        }
    }

    if (targetCollegeIds.length === 0) {
        return NextResponse.json({
            success: true,
            message: `No colleges scheduled for ${currentTargetTime} IST`,
            timestamp: new Date().toISOString(),
        });
    }

    // 2. Run finalization strictly isolated per college (concurrently for SaaS scalability)
    const promises = targetCollegeIds.map(async (collegeId) => {
        try {
            const result = await runAttendanceFinalization(undefined, collegeId);
            return { collegeId, status: 'success', result };
        } catch (e: any) {
            return { collegeId, status: 'error', error: e.message };
        }
    });

    const allResults = await Promise.all(promises);

    return NextResponse.json({
      success: true,
      processedCollegesCount: targetCollegeIds.length,
      currentTargetTime,
      results: allResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
