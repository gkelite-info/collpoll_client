import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const runAttendanceFinalization = async (targetDate?: string, specificCollegeId?: number) => {
  // Use provided date or default to today (IST timezone adjustment)
  const now = new Date();
  const dateStr = targetDate || now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); 
  
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeekStr = daysOfWeek[new Date(dateStr).getDay()];

  let totalProcessedColleges = 0;
  let totalErrors = 0;
  const results = [];

  let query = supabase.from("colleges").select("collegeId");
  if (specificCollegeId) {
    query = query.eq("collegeId", specificCollegeId);
  }

  const { data: colleges, error: collegesError } = await query;

  if (collegesError) throw collegesError;
  if (!colleges || colleges.length === 0) return { message: "No colleges found" };

  for (const college of colleges) {
    const { collegeId } = college;
    let errorCount = 0;

    try {
      // 1. Parallelize Phase 1 fetching
      const [
        { data: holiday },
        { data: timings },
        { data: policy },
        { data: staffList }
      ] = await Promise.all([
        supabase.from("college_holidays").select("holidayId").eq("collegeId", collegeId).eq("holidayDate", dateStr).eq("isActive", true).eq("is_deleted", false).maybeSingle(),
        supabase.from("college_timings").select("collegeTimingId, isOpen, openAt, closeAt, lunchFrom, lunchTo").eq("collegeId", collegeId).eq("dayOfWeek", dayOfWeekStr).eq("is_deleted", false).maybeSingle(),
        supabase.from("staff_attendance_policies").select("*").eq("collegeId", collegeId).eq("is_deleted", false).maybeSingle(),
        supabase.from("users").select("userId, role").eq("collegeId", collegeId).eq("is_deleted", false).not("role", "in", '("student","parent","superadmin","Student","Parent","SuperAdmin")')
      ]);

      if (holiday) {
        await logFinalization({ collegeId, dateStr, skippedHoliday: true, triggeredBy: targetDate ? "manual" : "cron" });
        results.push({ collegeId, status: "Skipped (Holiday)" });
        continue;
      }

      if (!timings || !timings.isOpen || !timings.openAt || !timings.closeAt) {
        // College closed today
        await logFinalization({ collegeId, dateStr, skippedHoliday: true, triggeredBy: targetDate ? "manual" : "cron" });
        results.push({ collegeId, status: "Skipped (Closed)" });
        continue;
      }

      if (!staffList || staffList.length === 0) continue;

      // 2. Parallelize Phase 2 fetching
      const [
        { data: breaks },
        { data: attendanceRecords }
      ] = await Promise.all([
        supabase.from("college_break_timings").select("startTime, endTime").eq("collegeTimingId", timings.collegeTimingId).eq("is_deleted", false),
        supabase.from("attendance_daily").select("*").in("userId", staffList.map((s) => s.userId)).eq("attendanceDate", dateStr)
      ]);

      // Calculate Effective Shift Duration
      const shiftStart = timeToMinutes(timings.openAt);
      const shiftEnd = timeToMinutes(timings.closeAt);
      let totalShiftMins = shiftEnd - shiftStart;
      
      let totalBreakMins = 0;
      
      // Subtract Lunch Break
      if (timings.lunchFrom && timings.lunchTo) {
        totalBreakMins += timeToMinutes(timings.lunchTo) - timeToMinutes(timings.lunchFrom);
      }

      // Subtract Small Breaks
      if (breaks) {
        breaks.forEach((b) => {
          totalBreakMins += timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
        });
      }
      
      let effectiveShiftMins = totalShiftMins - totalBreakMins;
      
      // SaaS Robustness: Prevent division by zero if timings are misconfigured
      if (effectiveShiftMins <= 0) {
        effectiveShiftMins = 480; // Fallback to standard 8-hour shift
      }

      // Fallback defaults if no policy set
      const halfDayMinPercent = policy?.halfDayMinPercent ?? 50;
      const fullDayMinPercent = policy?.fullDayMinPercent ?? 75;

      const attendanceMap = new Map();
      if (attendanceRecords) {
        attendanceRecords.forEach((r) => attendanceMap.set(r.userId, r));
      }

      let presentCount = 0;
      let absentCount = 0;
      let halfDayCount = 0;
      let lateCount = 0;
      let skippedManual = 0;
      
      const inserts = [];
      const updates = [];

      for (const staff of staffList) {
        const record = attendanceMap.get(staff.userId);

        if (record && (record.isManual || ['Present', 'Late', 'Leave', 'HalfDay'].includes(record.status))) {
          skippedManual++;
          if (record.status === 'Present') presentCount++;
          else if (record.status === 'Absent') absentCount++;
          else if (record.status === 'HalfDay') halfDayCount++;
          else if (record.status === 'Late') lateCount++;
          continue;
        }

        const workedMins = record?.totalMinutes || 0;
        let newStatus = "Absent";

        if (workedMins > 0) {
          const workedPercent = (workedMins / effectiveShiftMins) * 100;
          if (workedPercent >= fullDayMinPercent) {
            newStatus = record?.lateByMinutes > 0 ? "Late" : "Present";
          } else if (workedPercent >= halfDayMinPercent) {
            newStatus = "HalfDay";
          } else {
            newStatus = "LessThanHalfDay"; // Treated as LOP usually
          }
        }

        if (newStatus === 'Present') presentCount++;
        else if (newStatus === 'Absent' || newStatus === 'LessThanHalfDay') absentCount++;
        else if (newStatus === 'HalfDay') halfDayCount++;
        else if (newStatus === 'Late') lateCount++;

        // Separate inserts and updates to maintain consistent object keys for Supabase
        if (!record) {
          inserts.push({
            userId: staff.userId,
            attendanceDate: dateStr,
            status: newStatus,
            totalMinutes: 0,
            lateByMinutes: 0,
            earlyOutMinutes: 0,
            isManual: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else if (record.status !== newStatus) {
          updates.push({
            ...record,
            status: newStatus,
            updatedAt: new Date().toISOString()
          });
        }
      }

      // Execute inserts in batches of 100 (using upsert to prevent rare race conditions)
      for (let i = 0; i < inserts.length; i += 100) {
        const batch = inserts.slice(i, i + 100);
        const { error } = await supabase.from("attendance_daily").upsert(batch, { onConflict: "userId,attendanceDate" });
        if (error) throw error;
      }

      // Execute updates in batches of 100
      for (let i = 0; i < updates.length; i += 100) {
        const batch = updates.slice(i, i + 100);
        const { error } = await supabase.from("attendance_daily").upsert(batch, { onConflict: "attendanceDailyId" });
        if (error) throw error;
      }

      // 6. Log the finalization
      await logFinalization({
        collegeId,
        dateStr,
        totalStaff: staffList.length,
        presentCount,
        absentCount,
        halfDayCount,
        lateCount,
        skippedHoliday: false,
        skippedManualOverride: skippedManual,
        errorCount,
        triggeredBy: targetDate ? "manual" : "cron"
      });

      totalProcessedColleges++;
      results.push({ collegeId, status: "Success" });

    } catch (err: any) {
      totalErrors++;
      errorCount++;
      await logFinalization({ collegeId, dateStr, errorCount, errorMessage: err.message, triggeredBy: targetDate ? "manual" : "cron" });
      results.push({ collegeId, status: "Error", message: err.message });
    }
  }

  return { totalProcessedColleges, totalErrors, results };
};

// --- Helpers ---

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const str = timeStr.trim().toLowerCase();
  const isPM = str.includes("pm");
  const isAM = str.includes("am");
  const parts = str.replace(/(am|pm)/g, "").trim().split(":");
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

const logFinalization = async (params: {
  collegeId: number;
  dateStr: string;
  totalStaff?: number;
  presentCount?: number;
  absentCount?: number;
  halfDayCount?: number;
  lateCount?: number;
  skippedHoliday?: boolean;
  skippedManualOverride?: number;
  errorCount?: number;
  errorMessage?: string;
  triggeredBy: string;
}) => {
  await supabase.from("staff_attendance_finalization_logs").insert({
    collegeId: params.collegeId,
    finalizationDate: params.dateStr,
    totalStaff: params.totalStaff || 0,
    presentCount: params.presentCount || 0,
    absentCount: params.absentCount || 0,
    halfDayCount: params.halfDayCount || 0,
    lateCount: params.lateCount || 0,
    skippedHoliday: params.skippedHoliday || false,
    skippedManualOverride: params.skippedManualOverride || 0,
    errorCount: params.errorCount || 0,
    errorMessage: params.errorMessage || null,
    triggeredBy: params.triggeredBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};
