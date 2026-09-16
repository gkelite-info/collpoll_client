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
  collegeBranchId: number | null;
  collegeAcademicYearId: number;
  collegeSemesterId?: number | null;
  collegeSectionId: number;
  collegeSectionName?: string | null;
  isInter?: boolean;
  isSchool?: boolean;
}): Promise<any[]> {
  const { data, error } = await supabase
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
      topic:college_subject_unit_topics (
        topicTitle
      ),
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
    `)
    .eq("type", "class")
    .or("is_deleted.eq.false,is_deleted.is.null")
    .eq("date", params.date)
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("fetchStudentTimetableByDate calendar_event error:", error);
    return [];
  }

  const { data: bulkData, error: bulkError } = await supabase
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
      units:bulk_calendar_event_units (
        collegeSubjectUnitId,
        college_subject_units (
          unitTitle
        )
      ),
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
      )
    `)
    .eq("type", "class")
    .or("is_deleted.eq.false,is_deleted.is.null")
    .lte("fromDate", params.date)
    .gte("toDate", params.date)
    .order("fromTime", { ascending: true });

  if (bulkError) {
    console.error("fetchStudentTimetableByDate bulk_calendar_events error:", bulkError);
  }

  const matchesSection = (s: any) => {
    if (s.collegeSectionId == params.collegeSectionId) return true;
    if (params.collegeSectionName && s.section?.collegeSections) {
      return (
        String(s.section.collegeSections).trim().toLowerCase() ===
        String(params.collegeSectionName).trim().toLowerCase()
      );
    }
    return false;
  };

  const filtered = (data ?? []).filter((event: any) =>
    event.sections?.some(
      (s: any) =>
        s.collegeEducationId == params.collegeEducationId &&
        (params.isSchool || !params.collegeBranchId || s.collegeBranchId == params.collegeBranchId || (!s.collegeBranchId && !params.collegeBranchId)) &&
        s.collegeAcademicYearId == params.collegeAcademicYearId &&
        (params.isSchool || !params.collegeSemesterId || s.collegeSemesterId == params.collegeSemesterId || (!s.collegeSemesterId && !params.collegeSemesterId)) &&
        matchesSection(s),
    ),
  );

  const isSunday = new Date(params.date).getDay() === 0;
  const filteredBulk = isSunday
    ? []
    : (bulkData ?? []).filter((event: any) =>
        event.sections?.some(
          (s: any) =>
            s.collegeEducationId == params.collegeEducationId &&
            (params.isSchool || !params.collegeBranchId || s.collegeBranchId == params.collegeBranchId || (!s.collegeBranchId && !params.collegeBranchId)) &&
            s.collegeAcademicYearId == params.collegeAcademicYearId &&
            (params.isSchool || !params.collegeSemesterId || s.collegeSemesterId == params.collegeSemesterId || (!s.collegeSemesterId && !params.collegeSemesterId)) &&
            matchesSection(s),
        ),
      );

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

  const isAccepted = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return false;
    sessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sessions[0].status?.toLowerCase() === "accepted";
  };

  const finalData = filtered.filter((event: any) => isAccepted(singleSessionMap.get(event.calendarEventId) || []));
  const finalBulkData = filteredBulk.filter((event: any) => isAccepted(bulkSessionMap.get(event.bulkCalendarEventId) || []));

  const mapped = finalData.map((item: any) => {
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

  const mappedBulk = finalBulkData.map((item: any) => {
    const isCancelled = item.attendance_record?.some(
      (a: any) => a.status === "CLASS_CANCEL"
    );

    const units = (item.units || []).map((u: any) => ({
      unitId: u.collegeSubjectUnitId,
      unitTitle: u.college_subject_units?.unitTitle
    }));
    
    // For simplicity, we just use the first unit for topic/unit text
    const firstUnit = units[0];

    return {
      calendarEventId: item.bulkCalendarEventId,
      isBulk: true,
      fromTime: item.fromTime?.slice(0, 5),
      toTime: item.toTime?.slice(0, 5),
      eventTitle: item.subject?.subjectName ?? "Class",
      eventTopic: firstUnit ? firstUnit.unitTitle : "",
      topicId: firstUnit ? firstUnit.unitId : null,
      facultyName: item.faculty?.fullName ?? "Faculty",
      roomNo: item.college_rooms?.roomNo ?? "",
      isCancelled,
    };
  });

  const combined = [...mapped, ...mappedBulk];
  combined.sort((a, b) => a.fromTime.localeCompare(b.fromTime));

  return combined;
}

export async function fetchStudentCalendarLeftTasks(params: {
  date: string;
  collegeAcademicYearId: number;
  collegeSectionId: number;
  collegeSectionName?: string | null;
  collegeBranchId: number | null;
  isSchool?: boolean;
}) {
  let validSectionIds = [params.collegeSectionId];

  if (params.collegeSectionName) {
    let secQuery = supabase
      .from("college_sections")
      .select("collegeSectionsId")
      .eq("collegeAcademicYearId", params.collegeAcademicYearId)
      .ilike("collegeSections", params.collegeSectionName.trim());
      
    if (!params.isSchool) {
      if (params.collegeBranchId) {
        secQuery = secQuery.eq("collegeBranchId", params.collegeBranchId);
      } else {
        secQuery = secQuery.is("collegeBranchId", null);
      }
    }
    
    const { data: sections } = await secQuery;
    if (sections && sections.length > 0) {
      validSectionIds = sections.map((s: any) => s.collegeSectionsId);
      if (!validSectionIds.includes(params.collegeSectionId)) {
         validSectionIds.push(params.collegeSectionId);
      }
    }
  }

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .in("collegeSectionsId", validSectionIds)
    .eq("isActive", true)
    .lte("startDate", `${params.date}T23:59:59`)
    .gte("endDate", `${params.date}T00:00:00`);

  const { data: discussions } = await supabase
    .from("discussion_forum_sections")
    .select("discussionSectionId, discussion_forum!inner(deadline, title, createdAt)")
    .in("collegeSectionsId", validSectionIds)
    .eq("is_deleted", false)
    .gte("discussion_forum.deadline", `${params.date}`)
    .lte("discussion_forum.createdAt", `${params.date}T23:59:59`);

  const dateParts = params.date.split('-');
  const dateInt = parseInt(`${dateParts[0]}${dateParts[1]}${dateParts[2]}`);

  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      assignmentId,
      subjectId,
      topicName,
      dateAssignedInt,
      submissionDeadlineInt,
      marks,
      createdBy,
      status,
      createdAt,
      updatedAt,
      deletedAt,
      collegeAcademicYearId,
      collegeSectionsId
    `)
    .eq("collegeAcademicYearId", params.collegeAcademicYearId)
    .in("collegeSectionsId", validSectionIds)
    .in("status", ["Active", "Published"])
    .is("deletedAt", null)
    .is("is_deleted", false)
    .gte("submissionDeadlineInt", dateInt)
    .lte("dateAssignedInt", dateInt);

  return {
    quizzes: quizzes || [],
    discussions: discussions || [],
    facultyTasks: assignments || [], // Keeping the key as facultyTasks so we don't break consumers like CalendarLeft
  };
}