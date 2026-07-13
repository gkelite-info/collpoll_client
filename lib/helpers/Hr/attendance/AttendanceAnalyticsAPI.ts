"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

const MONTH_MAP: Record<string, number> = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };

function formatMinutesToHours(minutes: number | null) {
  if (minutes === null || minutes === undefined) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function formatLateEarlyMinutes(minutes: number | null) {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}m`;
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${m} ${ampm}`;
}

export async function fetchFullAttendanceDashboardData(userId: number, monthName: string, yearStr: string) {
  const year = parseInt(yearStr);
  const monthNum = MONTH_MAP[monthName.toUpperCase()];
  if (!monthNum) throw new Error("Invalid month");

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const [
    { data: user },
    { data: attendance },
    { data: allocData },
    { data: facultyData }
  ] = await Promise.all([
    adminSupabase.from("users").select("collegeId").eq("userId", userId).single(),
    adminSupabase.from("attendance_daily").select("*").eq("userId", userId).gte("attendanceDate", startDate).lte("attendanceDate", endDate),
    adminSupabase.from("employee_leave_allocations").select("totalLeaves, sickLeave, casualLeave, paidLeave").eq("userId", userId).is("deletedAt", null).maybeSingle(),
    adminSupabase.from("faculty").select("facultyId").eq("userId", userId).maybeSingle()
  ]);

  const collegeId = user?.collegeId;
  let holidaysPromise = Promise.resolve({ data: [] });
  let timingsPromise = Promise.resolve({ data: null });

  if (collegeId) {
    holidaysPromise = adminSupabase.from("college_holidays").select("holidayDate").eq("collegeId", collegeId).gte("holidayDate", startDate).lte("holidayDate", endDate).eq("isActive", true).eq("is_deleted", false) as any;
    timingsPromise = adminSupabase.from("college_timings").select("openAt, closeAt").eq("collegeId", collegeId).eq("dayOfWeek", "Saturday").eq("is_deleted", false).maybeSingle() as any;
  }

  const [ { data: holidays }, { data: timings } ] = await Promise.all([holidaysPromise, timingsPromise]);

  const holidayDates = new Set<string>((holidays || []).map((h: any) => h.holidayDate));
  let isSaturdayOpen = true;
  if (timings && (!(timings as any).openAt || !(timings as any).closeAt)) isSaturdayOpen = false;

// Physical DB sync handles leaves now, so leaveMap is removed.

  const totalCalendarDays = new Date(year, monthNum, 0).getDate();
  const monthStartDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const monthEndDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(totalCalendarDays).padStart(2, '0')}`;

  const facultyId = facultyData?.facultyId;
  let classesTakenByDate = new Map<string, number>();

  if (facultyId) {
    const [ { data: attData }, { data: singleEvents } ] = await Promise.all([
      adminSupabase
        .from("attendance_record")
        .select("markedAt, calendarEventId, bulkCalendarEventId")
        .eq("facultyMark", facultyId)
        .gte("markedAt", monthStartDate)
        .lte("markedAt", monthEndDate)
        .is("deletedAt", null),
      adminSupabase
        .from("faculty_class_sessions")
        .select("calendarEventId, calendar_event!inner(date)")
        .eq("facultyId", facultyId)
        .eq("is_deleted", false)
        .eq("status", "accepted")
        .gte("calendar_event.date", monthStartDate)
        .lte("calendar_event.date", monthEndDate)
    ]);

    const dailyEvents = new Map<string, Set<string>>();

    if (attData) {
      for (const row of attData) {
        if (!dailyEvents.has(row.markedAt)) dailyEvents.set(row.markedAt, new Set());
        if (row.calendarEventId) dailyEvents.get(row.markedAt)!.add(`c_${row.calendarEventId}`);
        if (row.bulkCalendarEventId) dailyEvents.get(row.markedAt)!.add(`b_${row.bulkCalendarEventId}`);
      }
    }

    if (singleEvents) {
      for (const session of singleEvents as any[]) {
        const date = session.calendar_event?.date;
        if (date) {
          if (!dailyEvents.has(date)) dailyEvents.set(date, new Set());
          if (session.calendarEventId) dailyEvents.get(date)!.add(`c_${session.calendarEventId}`);
        }
      }
    }

    for (const [date, events] of dailyEvents.entries()) {
      classesTakenByDate.set(date, events.size);
    }
  }

  const attendanceByDate = new Map<string, any>();
  (attendance || []).forEach((a: any) => attendanceByDate.set(a.attendanceDate, a));

  const todayObj = new Date();
  todayObj.setHours(23, 59, 59, 999);
  const todayStr = todayObj.toISOString().split("T")[0];

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const chartData = monthLabels.map((mStr, mIdx) => {
    const m = mIdx + 1;
    const totalDays = new Date(year, m, 0).getDate();
    let fullDays = 0, halfDays = 0, evalDays = 0;
    let physicalPresentDays = 0, workingDays = 0;
    let hasActualAttendance = false;
    
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const loopDate = new Date(year, m - 1, d);
      if (loopDate > todayObj) break; 
      
      evalDays++;
      const isSunday = loopDate.getDay() === 0;
      const isSaturdayClosed = loopDate.getDay() === 6 && !isSaturdayOpen;
      const isHoliday = isSunday || isSaturdayClosed || holidayDates.has(dateStr);
      
      if (!isHoliday) {
        workingDays++;
      }

      if (attendanceByDate.has(dateStr)) {
        hasActualAttendance = true;
        const st = attendanceByDate.get(dateStr).status?.toUpperCase();
        if (st === "PRESENT" || st === "LATE") {
          fullDays++;
          physicalPresentDays++;
        } else if (st === "HALFDAY") {
          halfDays++;
          physicalPresentDays += 0.5;
        }
      } else if (isHoliday) {
        fullDays++;
      }
    }
    
    let performance = 0;
    let attendancePercentage = 0;
    
    if (hasActualAttendance && evalDays > 0) {
      const presentDays = fullDays + halfDays;
      performance = Math.min(100, Math.round((presentDays / evalDays) * 100));
      attendancePercentage = workingDays > 0 ? Math.min(100, Math.round((physicalPresentDays / workingDays) * 100)) : 100;
    }
    
    return { month: mStr, performance, attendance: attendancePercentage };
  });


  let fullDays = 0, halfDays = 0, absentDays = 0, paidLeaves = 0, lopDays = 0, evaluatedDays = 0;
  const dailyStatus = new Array(totalCalendarDays + 1).fill("HOLIDAY");
  const records = [];

  for (let d = 1; d <= totalCalendarDays; d++) {
    const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const loopDate = new Date(year, monthNum - 1, d);
    const [y, mStr, dStr] = dateStr.split("-");
    const displayDate = `${dStr}/${mStr}/${y}`;

    if (loopDate > todayObj) continue;
    
    evaluatedDays++;
    const isSunday = loopDate.getDay() === 0;
    const isSaturdayClosed = loopDate.getDay() === 6 && !isSaturdayOpen;
    const isHoliday = isSunday || isSaturdayClosed || holidayDates.has(dateStr);

    let rowStatus = "Absent";
    let checkIn = "—", checkOut = "—", totalHours = "Oh 00m", lateBy = "—", earlyOut = "—", classDetail = "—";
    const dynamicClasses = classesTakenByDate.get(dateStr);
    if (dynamicClasses !== undefined) {
      classDetail = dynamicClasses > 0 ? String(dynamicClasses).padStart(2, "0") : "—";
    }

    const attRecord = attendanceByDate.get(dateStr);

    if (isHoliday) {
      dailyStatus[d] = "HOLIDAY";
      rowStatus = "Holiday";
    }

    if (attRecord) {
      const st = attRecord.status?.toUpperCase();
      if (st === "PRESENT" || st === "LATE" || st === "HALFDAY") { 
        fullDays++; dailyStatus[d] = "PRESENT"; 
      }
      else if (st === "ABSENT") { 
        absentDays++; lopDays++; dailyStatus[d] = "ABSENT"; 
      }
      else {
        // It must be a leave type (e.g. "CASUAL", "SICK", "LEAVE")
        paidLeaves++; dailyStatus[d] = "LEAVE";
      }
      
      rowStatus = attRecord.status.charAt(0) + attRecord.status.slice(1).toLowerCase();
      
      // Don't format null times for leaves
      if (rowStatus.toLowerCase().includes("leave") || rowStatus === "Casual" || rowStatus === "Sick") {
        checkIn = "—";
        checkOut = "—";
      } else {
        checkIn = formatTime(attRecord.checkIn);
        checkOut = formatTime(attRecord.checkOut);
      }
      
      totalHours = formatMinutesToHours(attRecord.totalMinutes);
      lateBy = formatLateEarlyMinutes(attRecord.lateByMinutes);
      earlyOut = formatLateEarlyMinutes(attRecord.earlyOutMinutes);
      if (dynamicClasses === undefined) {
        classDetail = attRecord.classesTaken ? String(attRecord.classesTaken).padStart(2, "0") : "—";
      }
    } else {
      if (!isHoliday) {
        // SaaS Rule: If today is not completed, don't penalize with an LOP yet.
        if (loopDate.toDateString() === todayObj.toDateString()) {
          dailyStatus[d] = "NOT_MARKED";
          rowStatus = "Not Marked";
        } else {
          absentDays++; lopDays++; dailyStatus[d] = "ABSENT";
          rowStatus = "Absent";
        }
      }
    }

    if (!isHoliday || attRecord) {
      records.push({
        date: displayDate,
        checkIn, checkOut, totalHours, status: rowStatus, lateBy, earlyOut, classDetail,
        sortDate: dateStr
      });
    }
  }

  const lastCalendarDay = Math.min(totalCalendarDays, todayObj.getDate());
  for (let d = 1; d <= lastCalendarDay; d++) {
    if (dailyStatus[d] === "HOLIDAY") {
      let prevWorkingDay = "NONE", nextWorkingDay = "NONE";
      for (let p = d - 1; p >= 1; p--) {
        if (dailyStatus[p] !== "HOLIDAY" && dailyStatus[p] !== "SANDWICH_LOP") { 
          prevWorkingDay = dailyStatus[p]; break; 
        }
      }
      for (let n = d + 1; n <= lastCalendarDay; n++) {
        if (dailyStatus[n] !== "HOLIDAY" && dailyStatus[n] !== "SANDWICH_LOP") { 
          nextWorkingDay = dailyStatus[n]; break; 
        }
      }
      if ((prevWorkingDay === "ABSENT" || prevWorkingDay === "NONE") && (nextWorkingDay === "ABSENT" || nextWorkingDay === "NONE") && (prevWorkingDay === "ABSENT" || nextWorkingDay === "ABSENT")) {
        lopDays++; dailyStatus[d] = "SANDWICH_LOP";
      }
    }
  }

  if (fullDays === 0 && halfDays === 0) lopDays = evaluatedDays - paidLeaves;
  
  let ytdLeavesTaken = 0;
  Array.from(attendanceByDate.values()).forEach(a => {
    const st = a.status?.toUpperCase();
    if (st && st !== "PRESENT" && st !== "LATE" && st !== "HALFDAY" && st !== "ABSENT") {
      ytdLeavesTaken++;
    }
  });

  const alloc = { total: Number(allocData?.totalLeaves) || 0 };
  if (alloc.total === 0) alloc.total = 24;

  const stats = {
    totalWorkingDays: Math.max(0, evaluatedDays - lopDays),
    leavesTaken: ytdLeavesTaken,
    remainingLeaves: Math.max(0, alloc.total - ytdLeavesTaken),
    lopDays: Math.max(0, lopDays),
    presentDays: fullDays + halfDays,
    expectedWorkingDays: evaluatedDays
  };

  const todayRecord = attendanceByDate.get(todayStr);
  const todayStatus = todayRecord?.status ? todayRecord.status.charAt(0) + todayRecord.status.slice(1).toLowerCase() : "Not Marked";

  records.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  
  return {
    stats,
    todayStatus,
    chartData,
    records: records.map(({ sortDate, ...rest }) => rest)
  };
}

export async function calculateMonthlyAttendanceStats(userId: number, month: number, year: number, tillDateOnly: boolean = false) {
  const monthName = Object.keys(MONTH_MAP).find(k => MONTH_MAP[k] === month) || "JAN";
  const { stats } = await fetchFullAttendanceDashboardData(userId, monthName, String(year));
  return stats;
}

export async function fetchUserAttendanceStats(userId: number) {
  const today = new Date();
  const monthName = Object.keys(MONTH_MAP).find(k => MONTH_MAP[k] === today.getMonth() + 1) || "JAN";
  const { stats, todayStatus } = await fetchFullAttendanceDashboardData(userId, monthName, String(today.getFullYear()));
  return { todayStatus, ...stats };
}

export async function fetchUserAttendanceRecords(userId: number, monthName: string, yearStr: string) {
  const { records } = await fetchFullAttendanceDashboardData(userId, monthName, yearStr);
  return records;
}

export async function fetchUserMonthlyChartData(userId: number, yearStr: string) {
  const { chartData } = await fetchFullAttendanceDashboardData(userId, "JAN", yearStr);
  return chartData;
}
