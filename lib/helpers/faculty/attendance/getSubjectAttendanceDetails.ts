"use server";

import { createClient } from "@/app/utils/supabase/server";
import { calculateAttendancePercentage } from "@/lib/helpers/attendance/attendancePolicyMessage";

type UiAttendanceStatus =
  | "Present"
  | "Absent"
  | "Leave"
  | "Late"
  | "Class Cancel";

type FacultyRow = {
  fullName?: string | null;
};

type EventRow = {
  date?: string | null;
  fromDate?: string | null;
  fromTime?: string | null;
  toTime?: string | null;
  faculty?: FacultyRow | FacultyRow[] | null;
};

type AttendanceRecordRow = {
  attendanceRecordId: number;
  status: string;
  markedAt?: string | null;
  reason?: string | null;
  calendarEventId?: number | null;
  bulkCalendarEventId?: number | null;
  event?: EventRow | EventRow[] | null;
  bulk_event?: EventRow | EventRow[] | null;
};

const safeGet = <T,>(
  data: T | T[] | null | undefined,
  fallback: T | null = null,
): T | null => {
  if (!data) return fallback;
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return fallback;
  return item;
};

export async function getSubjectAttendanceDetails(
  studentIdStr: string,
  subjectIdStr: string,
  filter: "ALL" | "Present" | "Absent" | "Leave" = "ALL",
  page: number = 1,
  limit: number = 20
) {
  const supabase = await createClient();
  const studentId = parseInt(studentIdStr);
  const subjectId = parseInt(subjectIdStr);

  if (isNaN(studentId) || isNaN(subjectId)) return null;

  const { data: subjectData, error: subjError } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("collegeSubjectId", subjectId)
    .maybeSingle();

  const subjectName = subjectData?.subjectName || "Unknown Subject";

  const [singleRes, bulkRes] = await Promise.all([
    supabase
      .from("attendance_record")
      .select(`
        attendanceRecordId,
        status,
        markedAt,
        reason,
        calendarEventId,
        bulkCalendarEventId,
        event:calendar_event!inner (
          date,
          fromTime,
          toTime,
          subject,
          faculty:faculty ( users (fullName) ) 
        )
      `)
      .eq("studentId", studentId)
      .eq("event.subject", subjectId),
    supabase
      .from("attendance_record")
      .select(`
        attendanceRecordId,
        status,
        markedAt,
        reason,
        calendarEventId,
        bulkCalendarEventId,
        bulk_event:bulk_calendar_events!inner (
          fromDate,
          fromTime,
          toTime,
          subject,
          faculty:faculty ( users (fullName) )
        )
      `)
      .eq("studentId", studentId)
      .eq("bulk_event.subject", subjectId)
  ]);

  const attendanceError = singleRes.error || bulkRes.error;
  const records = [...(singleRes.data || []), ...(bulkRes.data || [])];
  
  records.sort((a: any, b: any) => {
    const dateA = a.markedAt || a.event?.date || a.bulk_event?.fromDate || "";
    const dateB = b.markedAt || b.event?.date || b.bulk_event?.fromDate || "";
    return dateB.localeCompare(dateA); // Descending
  });

  if (attendanceError) {
    console.error("Subject Attendance Error:", attendanceError);
    return {
      subjectName: subjectName,
      facultyName: "Unknown Faculty",
      summary: { totalClasses: 0, attended: 0, absent: 0, leave: 0, percentage: "0%" },
      records: [],
      totalCount: 0
    };
  }

  let totalClasses = 0;
  let attended = 0;
  let absent = 0;
  let leave = 0;

  const facultyNames = new Map<string, number>();

  const formattedRecords = (records as AttendanceRecordRow[]).map((r) => {
    if (["PRESENT", "ABSENT", "LEAVE", "LATE"].includes(r.status)) {
      totalClasses++;
      if (r.status === "PRESENT" || r.status === "LATE") attended++;
      if (r.status === "ABSENT") absent++;
      if (r.status === "LEAVE") leave++;
    }

    const rAny = r as any;
    const eventObj = r.calendarEventId ? rAny.event : rAny.bulk_event;

    let uiStatus: UiAttendanceStatus = "Present";
    switch (r.status) {
      case "ABSENT":
        uiStatus = "Absent";
        break;
      case "LEAVE":
        uiStatus = "Leave";
        break;
      case "LATE":
        uiStatus = "Late";
        break;
      case "CLASS_CANCEL":
      case "CANCELLED":
      case "CANCEL_CLASS":
        uiStatus = "Class Cancel";
        break;
      case "PRESENT":
      default:
        uiStatus = "Present";
    }

    const e = safeGet(eventObj);
    const dateStr =
      r.markedAt || (e && "date" in e ? e.date : e?.fromDate) || "";
    const fromTime = e?.fromTime || "";
    const toTime = e?.toTime || "";

    const fac = safeGet(e?.faculty);
    const user = safeGet((fac as any)?.users);
    const fname = user?.fullName || "Unknown Faculty";
    facultyNames.set(fname, (facultyNames.get(fname) || 0) + 1);

    return {
      id: String(r.attendanceRecordId),
      date: dateStr,
      time: `${fromTime} - ${toTime}`,
      faculty: fname,
      status: uiStatus,
      reason: r.reason || "-",
    };
  });

  let topFaculty = "Unknown Faculty";
  let maxCount = -1;
  facultyNames.forEach((count, name) => {
    if (count > maxCount) {
      maxCount = count;
      topFaculty = name;
    }
  });

  const pctString = calculateAttendancePercentage(attended, totalClasses);

  // Apply Filter
  const filteredRecords = filter === "ALL" 
    ? formattedRecords 
    : formattedRecords.filter(r => r.status === filter);

  // Apply Pagination
  const totalCount = filteredRecords.length;
  const from = (page - 1) * limit;
  const to = from + limit;
  const paginatedRecords = filteredRecords.slice(from, to);

  return {
    subjectName,
    facultyName: topFaculty,
    summary: {
      totalClasses,
      attended,
      absent,
      leave,
      percentage: pctString,
    },
    records: paginatedRecords,
    totalCount
  };
}
