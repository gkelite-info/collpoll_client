import { supabase } from "@/lib/supabaseClient";

const MONTH_MAP: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

function formatMinutesToHours(minutes: number | null) {
  if (minutes === null || minutes === undefined) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${m} ${ampm}`;
}

export async function fetchUserAttendanceStats(userId: number) {
  const today = new Date().toISOString().split("T")[0];

  // Today's status
  const { data: todayRecord } = await supabase
    .from("attendance_daily")
    .select("status")
    .eq("userId", userId)
    .eq("attendanceDate", today)
    .maybeSingle();

  // Total Working Days (Present or Late)
  const { count: workingDays } = await supabase
    .from("attendance_daily")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)
    .in("status", ["PRESENT", "LATE"]);

  // Leaves Taken
  const { count: leaves } = await supabase
    .from("attendance_daily")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("status", "LEAVE");

  const leavesCount = leaves || 0;

  return {
    todayStatus: todayRecord?.status
      ? todayRecord.status.charAt(0) + todayRecord.status.slice(1).toLowerCase()
      : "Not Marked",
    totalWorkingDays: workingDays || 0,
    leavesTaken: leavesCount,
    remainingLeaves: Math.max(0, 24 - leavesCount), // Assuming 24 annual leaves
  };
}

export async function fetchUserAttendanceRecords(
  userId: number,
  monthName: string,
  yearStr: string,
) {
  const monthNum = MONTH_MAP[monthName.toUpperCase()];
  if (!monthNum) return [];

  const startDate = `${yearStr}-${String(monthNum).padStart(2, "0")}-01`;
  const endDate = new Date(parseInt(yearStr), monthNum, 0)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("attendance_daily")
    .select("*")
    .eq("userId", userId)
    .gte("attendanceDate", startDate)
    .lte("attendanceDate", endDate)
    .order("attendanceDate", { ascending: false });

  if (error) {
    console.error("Error fetching attendance records:", error);
    return [];
  }

  return (data || []).map((row) => {
    const [y, m, d] = row.attendanceDate.split("-");
    const formattedStatus =
      row.status.charAt(0) + row.status.slice(1).toLowerCase();
    return {
      date: `${d}/${m}/${y}`,
      checkIn: formatTime(row.checkIn),
      checkOut: formatTime(row.checkOut),
      totalHours: formatMinutesToHours(row.totalMinutes),
      status: formattedStatus,
      lateBy: row.lateByMinutes
        ? `${String(row.lateByMinutes).padStart(2, "0")}m`
        : "—",
      earlyOut: row.earlyOutMinutes
        ? `${String(row.earlyOutMinutes).padStart(2, "0")}m`
        : "—",
      classDetail: row.classesTaken
        ? String(row.classesTaken).padStart(2, "0")
        : "—",
    };
  });
}

export async function fetchUserMonthlyChartData(userId: number, year: string) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from("attendance_daily")
    .select("attendanceDate, status")
    .eq("userId", userId)
    .gte("attendanceDate", startDate)
    .lte("attendanceDate", endDate);

  if (error) return [];

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyStats = Array.from({ length: 12 }, () => ({
    presentDays: 0,
    totalMarkedDays: 0,
  }));

  (data || []).forEach((row) => {
    const monthIdx = parseInt(row.attendanceDate.split("-")[1]) - 1;
    monthlyStats[monthIdx].totalMarkedDays += 1;
    if (row.status === "PRESENT" || row.status === "LATE") {
      monthlyStats[monthIdx].presentDays += 1;
    }
  });

  return monthLabels.map((month, idx) => {
    const stats = monthlyStats[idx];
    const performance =
      stats.totalMarkedDays > 0
        ? Math.round((stats.presentDays / stats.totalMarkedDays) * 100)
        : 0;

    return {
      month,
      performance,
      attendance: stats.presentDays,
    };
  });
}
