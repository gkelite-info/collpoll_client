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
    
    let currentHourStr = formatterHour.format(now).replace(/^24$/, "00");
    let currentMin = parseInt(formatterMinute.format(now), 10);

    // Round to nearest 15 minutes to accommodate slight trigger delays
    if (currentMin >= 0 && currentMin < 8) currentMin = 0;
    else if (currentMin >= 8 && currentMin < 23) currentMin = 15;
    else if (currentMin >= 23 && currentMin < 38) currentMin = 30;
    else if (currentMin >= 38 && currentMin < 53) currentMin = 45;
    else { 
        currentMin = 0; 
        currentHourStr = String((parseInt(currentHourStr, 10) + 1) % 24).padStart(2, '0'); 
    }

    const currentTargetTime = `${currentHourStr.padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

    // 1. Fetch colleges scheduled for this hour
    const { data: scheduledColleges, error: fetchErr } = await supabase
      .from("college_cron_timings")
      .select("collegeId")
      .eq("isActive", true)
      .eq("is_deleted", false)
      .eq("finalizeTime", currentTargetTime);

    // If table doesn't exist yet (42P01), fallback to running for ALL colleges at 19:00 (7 PM) for backward compatibility
    let targetCollegeIds: number[] = [];
    
    if (fetchErr) {
        if (fetchErr.code === '42P01') {
            if (currentTargetTime === "19:00") {
                const { data: allColleges } = await supabase.from("colleges").select("collegeId");
                targetCollegeIds = allColleges?.map(c => c.collegeId) || [];
            }
        } else {
            throw fetchErr;
        }
    } else if (scheduledColleges) {
        targetCollegeIds = scheduledColleges.map(c => c.collegeId);
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
