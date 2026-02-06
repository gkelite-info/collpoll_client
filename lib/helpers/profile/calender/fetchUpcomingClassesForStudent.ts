import { supabase } from "@/lib/supabaseClient";

export async function fetchUpcomingClassesForStudent(filters: {
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  collegeSectionId: number;
}) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("calendar_event")
    .select(`
      calendarEventId,
      date,
      fromTime,
      faculty:facultyId ( fullName ),
      subject:subject ( subjectName ),
      topic:eventTopic ( topicTitle ),
      sections:calendar_event_section (
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId
      )
    `)
    .eq("is_deleted", false)
    .eq("type", "class")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("fromTime", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  const filtered = (data ?? []).filter((event: any) =>
    event.sections?.some((s: any) =>
      s.collegeEducationId === filters.collegeEducationId &&
      s.collegeBranchId === filters.collegeBranchId &&
      s.collegeAcademicYearId === filters.collegeAcademicYearId &&
      s.collegeSemesterId === filters.collegeSemesterId &&
      s.collegeSectionId === filters.collegeSectionId
    )
  );

  return filtered.map((item: any) => ({
    calendarEventId: item.calendarEventId,
    fromTime: item.fromTime.slice(0, 5),
    eventTitle: item.subject?.subjectName ?? "Class",
    eventTopic: item.topic?.topicTitle ?? "",
    facultyName: item.faculty?.fullName ?? "Faculty",
  }));
}