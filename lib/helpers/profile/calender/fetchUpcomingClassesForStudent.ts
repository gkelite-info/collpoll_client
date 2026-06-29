import { supabase } from "@/lib/supabaseClient";

export async function fetchUpcomingClassesForStudent(filters: {
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  collegeSectionId: number;
}) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId,
      type,
      date,
      fromTime,
      toTime,
      collegeRoomId,
      college_rooms(roomNo),
      meetingLink,
      faculty:facultyId ( fullName ),
      subject:subject ( subjectName ),
      topic:eventTopic ( topicTitle ),
      attendance_record (
        status
      ),
      sections:calendar_event_section (
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId
      )
    `,
    )
    .eq("is_deleted", false)
    .in("type", ["class", "meeting", "exam"])
    .eq("date", today)
    .order("date", { ascending: true })
    .order("fromTime", { ascending: true });

  if (error) {
    return [];
  }

  const { data: bulkData, error: bulkError } = await supabase
    .from("bulk_calendar_events")
    .select(
      `
      bulkCalendarEventId,
      type,
      fromDate,
      toDate,
      fromTime,
      toTime,
      collegeRoomId,
      college_rooms(roomNo),
      meetingLink,
      meetingTitle,
      faculty:facultyId ( fullName ),
      subject:subject ( subjectName ),
      attendance_record (
        status
      ),
      sections:bulk_calendar_event_sections (
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId
      )
    `,
    )
    .eq("is_deleted", false)
    .in("type", ["class", "meeting", "exam"])
    .lte("fromDate", today)
    .gte("toDate", today)
    .order("fromTime", { ascending: true });

  const filtered = (data ?? []).filter((event: any) =>
    event.sections?.some(
      (s: any) =>
        s.collegeEducationId === filters.collegeEducationId &&
        s.collegeBranchId === filters.collegeBranchId &&
        s.collegeAcademicYearId === filters.collegeAcademicYearId &&
        s.collegeSemesterId === filters.collegeSemesterId &&
        s.collegeSectionId === filters.collegeSectionId,
    ),
  );

  const filteredBulk = (bulkData ?? []).filter((event: any) =>
    event.sections?.some(
      (s: any) =>
        s.collegeEducationId === filters.collegeEducationId &&
        s.collegeBranchId === filters.collegeBranchId &&
        s.collegeAcademicYearId === filters.collegeAcademicYearId &&
        s.collegeSemesterId === filters.collegeSemesterId &&
        s.collegeSectionId === filters.collegeSectionId,
    ),
  );

  const processEvent = (item: any, isBulk: boolean) => {
    const isMeeting = item.type === "meeting";
    const isExam = item.type === "exam";

    let title = "Class";
    if (isMeeting) title = "Meeting";
    if (isExam)
      title = item.subject?.subjectName
        ? `${item.subject.subjectName} (Exam)`
        : "Exam";
    if (!isMeeting && !isExam && item.subject?.subjectName)
      title = item.subject.subjectName;

    let topicDescription = "";
    if (isMeeting) {
      topicDescription = item.meetingLink
        ? "Online Meeting"
        : item.college_rooms?.roomNo
          ? `Room: ${item.college_rooms?.roomNo}`
          : "General Meeting";
    } else if (isExam) {
      topicDescription = item.college_rooms?.roomNo
        ? `Room: ${item.college_rooms?.roomNo}`
        : "Exam Location TBA";
    } else {
      if (isBulk) {
        topicDescription = item.meetingTitle ?? "";
      } else {
        topicDescription = item.topic?.topicTitle ?? "";
      }
    }

    return {
      calendarEventId: isBulk ? `bulk_${item.bulkCalendarEventId}` : `cal_${item.calendarEventId}`,
      date: today,
      fromTime: item.fromTime.slice(0, 5),
      toTime: item.toTime.slice(0, 5),
      eventTitle: title,
      eventTopic: topicDescription,
      facultyName: item.faculty?.fullName ?? "Faculty",
      isCancelled: item.attendance_record?.some(
        (a: any) => a.status === "CLASS_CANCEL",
      ),
      type: item.type,
      meetingLink: item.meetingLink,
    };
  };

  const mapped = filtered.map((item: any) => processEvent(item, false));
  const mappedBulk = filteredBulk.map((item: any) => processEvent(item, true));

  const allMapped = [...mapped, ...mappedBulk];
  
  allMapped.sort((a, b) => {
    if (a.fromTime < b.fromTime) return -1;
    if (a.fromTime > b.fromTime) return 1;
    return 0;
  });

  return allMapped;
}
