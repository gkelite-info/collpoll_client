import { supabase } from "@/lib/supabaseClient";

export type StudentTimetableRow = {
  calendarEventId: number;
  fromTime: string;
  toTime: string;
  eventTitle: string;
  eventTopic: string;
  facultyName: string;
  roomNo: string;
  isCancelled?: boolean;
};

export async function fetchStudentTimetableByDate(params: {
  date: string;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId?: number | null;
  collegeSectionId: number;
  isInter?: boolean;
}): Promise<any[]> {

  let query = supabase
    .from("calendar_event")
    .select(`
      calendarEventId,
      date,
      fromTime,
      toTime,
      collegeRoomId,
      college_rooms (
        roomNo
      ),
      eventTopic,
      faculty:facultyId (
        fullName
      ),
      subject:subject (
        subjectName
      ),
      topic:eventTopic (
        topicTitle
      ),
      attendance_record (
        status
      ),
      sections:calendar_event_section!inner (
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId
      )
    `)
    .eq("type", "class")
    .eq("is_deleted", false)
    .eq("date", params.date)
    .eq("sections.collegeEducationId", params.collegeEducationId)
    .eq("sections.collegeBranchId", params.collegeBranchId);

  if (params.collegeAcademicYearId !== null && params.collegeAcademicYearId !== undefined) {
    query = query.eq("sections.collegeAcademicYearId", params.collegeAcademicYearId);
  } else {
    query = query.is("sections.collegeAcademicYearId", null);
  }

  if (params.collegeSectionId !== null && params.collegeSectionId !== undefined) {
    query = query.eq("sections.collegeSectionId", params.collegeSectionId);
  } else {
    query = query.is("sections.collegeSectionId", null);
  }

  if (!params.isInter && params.collegeSemesterId) {
    query = query.eq("sections.collegeSemesterId", params.collegeSemesterId);
  }

  const { data, error } = await query.order("fromTime", { ascending: true });

  if (error) {
    console.error("Helper Error:", error);
    return [];
  }

  let bulkQuery = supabase
    .from("bulk_calendar_events")
    .select(`
      bulkCalendarEventId,
      fromDate,
      toDate,
      fromTime,
      toTime,
      collegeRoomId,
      college_rooms (
        roomNo
      ),
      faculty:facultyId (
        fullName
      ),
      subject:subject (
        subjectName
      ),
      attendance_record (
        status
      ),
      sections:bulk_calendar_event_sections!inner (
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId
      )
    `)
    .eq("type", "class")
    .eq("is_deleted", false)
    .lte("fromDate", params.date)
    .gte("toDate", params.date)
    .eq("sections.collegeEducationId", params.collegeEducationId)
    .eq("sections.collegeBranchId", params.collegeBranchId);

  if (params.collegeAcademicYearId !== null && params.collegeAcademicYearId !== undefined) {
    bulkQuery = bulkQuery.eq("sections.collegeAcademicYearId", params.collegeAcademicYearId);
  } else {
    bulkQuery = bulkQuery.is("sections.collegeAcademicYearId", null);
  }

  if (params.collegeSectionId !== null && params.collegeSectionId !== undefined) {
    bulkQuery = bulkQuery.eq("sections.collegeSectionId", params.collegeSectionId);
  } else {
    bulkQuery = bulkQuery.is("sections.collegeSectionId", null);
  }

  if (!params.isInter && params.collegeSemesterId) {
    bulkQuery = bulkQuery.eq("sections.collegeSemesterId", params.collegeSemesterId);
  }

  const { data: bulkData, error: bulkError } = await (bulkQuery as any).order("fromTime", { ascending: true });

  if (bulkError) {
    console.error("Bulk Helper Error:", bulkError);
  }

  const mapped = (data ?? []).map((item: any) => {
    const isCancelled = item.attendance_record?.some(
      (a: any) => a.status === "CLASS_CANCEL"
    );

    return {
      calendarEventId: item.calendarEventId,
      fromTime: item.fromTime?.slice(0, 5),
      toTime: item.toTime?.slice(0, 5),
      eventTitle: item.subject?.subjectName ?? "Class",
      eventTopic: item.topic?.topicTitle ?? "",
      topicId: item.eventTopic,
      facultyName: item.faculty?.fullName ?? "Faculty",
      roomNo: item.college_rooms?.roomNo ?? "",
      isCancelled,
    };
  });

  const mappedBulk = (bulkData ?? []).map((item: any) => {
    const isCancelled = item.attendance_record?.some(
      (a: any) => a.status === "CLASS_CANCEL"
    );

    return {
      calendarEventId: item.bulkCalendarEventId,
      fromTime: item.fromTime?.slice(0, 5),
      toTime: item.toTime?.slice(0, 5),
      eventTitle: item.subject?.subjectName ?? "Class",
      eventTopic: "",
      topicId: null,
      facultyName: item.faculty?.fullName ?? "Faculty",
      roomNo: item.college_rooms?.roomNo ?? "",
      isCancelled,
    };
  });

  const combined = [...mapped, ...mappedBulk];
  combined.sort((a, b) => a.fromTime.localeCompare(b.fromTime));

  return combined;
}