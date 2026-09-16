"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function fetchUpcomingClassesForStudent(filters: {
  collegeEducationId: number;
  collegeBranchId: number | null;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  collegeSectionId: number;
  collegeSectionName?: string | null;
  isSchool?: boolean;
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
        collegeSectionId,
        section:college_sections (
          collegeSections
        )
      )
    `,
    )
    .or("is_deleted.eq.false,is_deleted.is.null")
    .in("type", ["class", "meeting", "exam"])
    .eq("date", today)
    .order("date", { ascending: true })
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("fetchUpcomingClassesForStudent calendar_event error:", error);
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
        collegeSectionId,
        section:college_sections (
          collegeSections
        )
      ),
      units:bulk_calendar_event_units (
        collegeSubjectUnitId,
        college_subject_units (
          unitTitle
        )
      )
    `,
    )
    .or("is_deleted.eq.false,is_deleted.is.null")
    .in("type", ["class", "meeting", "exam"])
    .lte("fromDate", today)
    .gte("toDate", today)
    .order("fromTime", { ascending: true });

  if (bulkError) {
    console.error("fetchUpcomingClassesForStudent bulk_calendar_events error:", bulkError);
  }

  const matchesSection = (s: any) => {
    if (s.collegeSectionId == filters.collegeSectionId) return true;
    if (filters.collegeSectionName && s.section?.collegeSections) {
      return (
        String(s.section.collegeSections).trim().toLowerCase() ===
        String(filters.collegeSectionName).trim().toLowerCase()
      );
    }
    return false;
  };

  const filtered = (data ?? []).filter((event: any) =>
    event.sections?.some(
      (s: any) =>
        s.collegeEducationId == filters.collegeEducationId &&
        (filters.isSchool || !filters.collegeBranchId || s.collegeBranchId == filters.collegeBranchId || (!s.collegeBranchId && !filters.collegeBranchId)) &&
        s.collegeAcademicYearId == filters.collegeAcademicYearId &&
        (filters.isSchool || !filters.collegeSemesterId || s.collegeSemesterId == filters.collegeSemesterId || (!s.collegeSemesterId && !filters.collegeSemesterId)) &&
        matchesSection(s),
    ),
  );

  const isSunday = new Date(today).getDay() === 0;
  const filteredBulk = isSunday
    ? []
    : (bulkData ?? []).filter((event: any) =>
        event.sections?.some(
          (s: any) =>
            s.collegeEducationId == filters.collegeEducationId &&
            (filters.isSchool || !filters.collegeBranchId || s.collegeBranchId == filters.collegeBranchId || (!s.collegeBranchId && !filters.collegeBranchId)) &&
            s.collegeAcademicYearId == filters.collegeAcademicYearId &&
            (filters.isSchool || !filters.collegeSemesterId || s.collegeSemesterId == filters.collegeSemesterId || (!s.collegeSemesterId && !filters.collegeSemesterId)) &&
            matchesSection(s),
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
        const units = (item.units || []).map((u: any) => ({
          unitId: u.collegeSubjectUnitId,
          unitTitle: u.college_subject_units?.unitTitle
        }));
        const firstUnit = units[0];
        topicDescription = firstUnit ? firstUnit.unitTitle : (item.meetingTitle ?? "");
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
      sessionStatus: item.sessionStatus,
    };
  };

  const allEvents = [...filtered, ...filteredBulk];
  if (allEvents.length === 0) return [];

  const eventIds = filtered.map((e: any) => e.calendarEventId);
  const bulkEventIds = filteredBulk.map((e: any) => e.bulkCalendarEventId);
  
  const orConditions = [];
  if (eventIds.length > 0) orConditions.push(`calendarEventId.in.(${eventIds.join(",")})`);
  if (bulkEventIds.length > 0) orConditions.push(`bulkCalendarEventId.in.(${bulkEventIds.join(",")})`);

  let sessionRecords: any[] = [];
  if (orConditions.length > 0) {
    const { data: sessionData } = await supabase
      .from("faculty_class_sessions")
      .select("calendarEventId, bulkCalendarEventId, status, createdAt")
      .or(orConditions.join(","));
    if (sessionData) sessionRecords = sessionData;
  }

  const singleSessionMap = new Map<number, any[]>();
  const bulkSessionMap = new Map<number, any[]>();

  sessionRecords.forEach((record: any) => {
    if (record.calendarEventId) {
      const arr = singleSessionMap.get(record.calendarEventId) || [];
      arr.push(record);
      singleSessionMap.set(record.calendarEventId, arr);
    }
    if (record.bulkCalendarEventId) {
      const arr = bulkSessionMap.get(record.bulkCalendarEventId) || [];
      arr.push(record);
      bulkSessionMap.set(record.bulkCalendarEventId, arr);
    }
  });

  const getSessionStatus = (event: any, sessions: any[]) => {
    if (event.type !== "class") return "scheduled"; 
    if (!sessions || sessions.length === 0) return "scheduled";
    sessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sessions[0].status; // e.g. "accepted", "scheduled", "cancelled"
  };

  const finalFiltered = filtered.map((event: any) => ({
    ...event,
    sessionStatus: getSessionStatus(event, singleSessionMap.get(event.calendarEventId) || [])
  }));
  const finalFilteredBulk = filteredBulk.map((event: any) => ({
    ...event,
    sessionStatus: getSessionStatus(event, bulkSessionMap.get(event.bulkCalendarEventId) || [])
  }));

  const mapped = finalFiltered.map((item: any) => processEvent(item, false));
  const mappedBulk = finalFilteredBulk.map((item: any) => processEvent(item, true));

  const allMapped = [...mapped, ...mappedBulk];
  
  allMapped.sort((a, b) => {
    if (a.fromTime < b.fromTime) return -1;
    if (a.fromTime > b.fromTime) return 1;
    return 0;
  });

  return allMapped;
}
