import { supabase } from "@/lib/supabaseClient";

export type StudentTimetableRow = {
  calendarEventId: number;
  fromTime: string;
  toTime: string;
  eventTitle: string;   // Subject
  eventTopic: string;   // Topic
  facultyName: string;
  roomNo: string;
};

export async function fetchStudentTimetableByDate(params: {
  date: string;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  collegeSectionId: number;
}): Promise<StudentTimetableRow[]> {
  const { data, error } = await supabase
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
    .eq("sections.collegeSemesterId", params.collegeSemesterId)
    .eq("sections.collegeSectionId", params.collegeSectionId)
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("❌ [StudentTimetable] Supabase error", error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    calendarEventId: item.calendarEventId,
    fromTime: item.fromTime?.slice(0, 5),
    toTime: item.toTime?.slice(0, 5),
    eventTitle: item.subject?.subjectName ?? "Class",
    eventTopic: item.topic?.topicTitle ?? "",
    facultyName: item.faculty?.fullName ?? "Faculty",
    roomNo: item.roomNo ?? "",
  }));
}