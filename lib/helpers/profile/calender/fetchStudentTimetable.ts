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
}): Promise<StudentTimetableRow[]> {

  let query = supabase
    .from("calendar_event")
    .select(`
      calendarEventId,
      date,
      fromTime,
      toTime,
      roomNo,
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
    .eq("sections.collegeBranchId", params.collegeBranchId)
    .eq("sections.collegeAcademicYearId", params.collegeAcademicYearId)
    .eq("sections.collegeSectionId", params.collegeSectionId);

  if (!params.isInter && params.collegeSemesterId) {
    query = query.eq("sections.collegeSemesterId", params.collegeSemesterId);
  }

  const { data, error } = await query.order("fromTime", { ascending: true });

  if (error) {
    return [];
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
      facultyName: item.faculty?.fullName ?? "Faculty",
      roomNo: item.roomNo ?? "",
      isCancelled,
    };
  });

  return mapped;
}