"use server";

import { createClient } from "@/app/utils/supabase/server";

const safeGet = (
  data: any,
  key: string | null = null,
  fallback: any = "N/A",
) => {
  if (!data) return fallback;
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return fallback;
  return key ? (item[key] ?? fallback) : item;
};

export async function getSubjectAttendanceDetails(
  studentIdStr: string,
  subjectCodeStr: string,
) {
  const supabase = await createClient();
  const studentId = parseInt(studentIdStr);

  const subjectCode = decodeURIComponent(subjectCodeStr);

  if (isNaN(studentId)) return null;

  const { data: subjectData, error: subjError } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("subjectCode", subjectCode)
    .single();

  if (subjError || !subjectData) {
    console.error("Subject Not Found:", subjError);
    return null;
  }

  const subjectId = subjectData.collegeSubjectId;

  const { data: records, error: attendanceError } = await supabase
    .from("attendance_record")
    .select(
      `
      attendanceRecordId,
      status,
      markedAt,
      reason,
      event:calendar_event!inner (
        date,
        fromTime,
        toTime,
        eventTopic,
        subject,
        faculty:faculty (fullName) 
      )
    `,
    )
    .eq("studentId", studentId)
    .eq("event.subject", subjectId)
    .order("markedAt", { ascending: false });

  if (attendanceError) {
    console.error("Attendance Fetch Error:", attendanceError);
    return null;
  }

  let totalClasses = 0;
  let attended = 0;
  let absent = 0;
  let leave = 0;

  const facultyNames = new Map<string, number>();

  const formattedRecords = records.map((r: any) => {
    if (["PRESENT", "ABSENT", "LEAVE", "LATE"].includes(r.status)) {
      totalClasses++;
      if (r.status === "PRESENT") attended++;
      if (r.status === "ABSENT") absent++;
      if (r.status === "LEAVE") leave++;
    }

    const event = safeGet(r.event);
    const faculty = safeGet(event?.faculty);
    const fName = faculty?.fullName || "Unknown Faculty";
    facultyNames.set(fName, (facultyNames.get(fName) || 0) + 1);

    const eventDate = r.date || event.date;
    const dateObj = new Date(eventDate);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timeStr = event.fromTime
      ? `${event.fromTime.slice(0, 5)} - ${event.toTime.slice(0, 5)}`
      : "N/A";

    let uiStatus = "Present";
    switch (r.status) {
      case "PRESENT":
        uiStatus = "Present";
        break;
      case "ABSENT":
        uiStatus = "Absent";
        break;
      case "LEAVE":
        uiStatus = "Leave";
        break;
      case "LATE":
        uiStatus = "Late";
        break;
      case "CANCEL_CLASS":
        uiStatus = "Class Cancel";
        break;
      default:
        uiStatus = r.status;
    }

    return {
      id: r.attendanceRecordId,
      date: formattedDate,
      time: timeStr,
      topic: "General Session",
      status: uiStatus,
      reason: r.reason || "-",
    };
  });

  let mainFaculty = "Unknown Faculty";
  let maxCount = 0;
  facultyNames.forEach((count, name) => {
    if (count > maxCount) {
      maxCount = count;
      mainFaculty = name;
    }
  });

  const percentage =
    totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

  return {
    subjectName: subjectData.subjectName,
    facultyName: mainFaculty,
    summary: {
      totalClasses,
      attended,
      absent,
      leave,
      percentage,
    },
    records: formattedRecords,
  };
}
