"use server";

import { supabase } from "@/lib/supabaseClient";

export async function getStudentDashboardData(
  userId: string | number,
  queryDate?: string
) {
  const targetDate = queryDate || new Date().toISOString().split("T")[0];

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("studentsId")
    .eq("userId", userId)
    .maybeSingle();

  if (studentError || !student) return null;
  const studentId = student.studentsId;

  const { data: allEvents, error: eventError } = await supabase
    .from("calendarEvent")
    .select("id:calendarEventId, eventTitle, date, fromTime, toTime")
    .order("date", { ascending: true });

  if (eventError || !allEvents) return null;

  const { data: allAttendance, error: attError } = await supabase
    .from("attendance")
    .select("student_id, status, calendar_event_id")
    .eq("student_id", studentId);

  if (attError) return null;

  const attendanceMap = new Map();
  allAttendance?.forEach((r) => {
    attendanceMap.set(r.calendar_event_id, r.status);
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const totalClasses = allEvents.filter((e) => e.date <= todayStr).length;
  const totalPresent =
    allAttendance?.filter((a) => a.status === "PRESENT").length || 0;
  const totalAbsent =
    allAttendance?.filter((a) => a.status === "ABSENT").length || 0;
  const totalLeaves =
    allAttendance?.filter((a) => a.status === "LEAVE").length || 0;

  const dailyEvents = allEvents.filter((e) => e.date === targetDate);

  const tableData = dailyEvents.map((event) => {
    const status = attendanceMap.get(event.id) || "Pending";

    const subjectHistoryEvents = allEvents.filter(
      (e) => e.eventTitle === event.eventTitle && e.date <= todayStr
    );
    const subjectTotal = subjectHistoryEvents.length;
    const subjectPresent = subjectHistoryEvents.reduce((acc, curr) => {
      return attendanceMap.get(curr.id) === "PRESENT" ? acc + 1 : acc;
    }, 0);

    const percentage =
      subjectTotal > 0 ? Math.round((subjectPresent / subjectTotal) * 100) : 0;

    return {
      id: event.id,
      subject: event.eventTitle,
      status: mapStatusToUI(status),
      classAttendance: `${subjectPresent}/${subjectTotal}`,
      percentage: `${percentage}%`,
    };
  });

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayEvents = allEvents.filter((e) => e.date === dateStr);

    if (dayEvents.length === 0) {
      weeklyData.push(0);
      continue;
    }
    const dayPresent = dayEvents.reduce((acc, curr) => {
      return attendanceMap.get(curr.id) === "PRESENT" ? acc + 1 : acc;
    }, 0);
    weeklyData.push(Math.round((dayPresent / dayEvents.length) * 100));
  }

  const overallPercent =
    totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
  const absentPercent =
    totalClasses > 0 ? Math.round((totalAbsent / totalClasses) * 100) : 0;
  const leavePercent =
    totalClasses > 0 ? Math.round((totalLeaves / totalClasses) * 100) : 0;

  return {
    cards: {
      totalClasses: totalClasses,
      attended: totalPresent,
      percentage: overallPercent,
    },
    semesterStats: {
      present: overallPercent,
      absent: absentPercent,
      late: leavePercent,
    },
    tableData,
    weeklyData,
  };
}

function mapStatusToUI(dbStatus: string) {
  if (dbStatus === "PRESENT") return "Present";
  if (dbStatus === "ABSENT") return "Absent";
  if (dbStatus === "LEAVE") return "Leave";
  if (dbStatus === "CANCEL_CLASS") return "Cancelled";
  return "Pending";
}
