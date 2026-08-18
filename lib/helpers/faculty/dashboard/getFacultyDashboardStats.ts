"use server";

import { createClient } from "@/app/utils/supabase/server";

export async function getFacultyDashboardStats(
  facultyId: number,
  subjectId?: number | null,
  sectionId?: number | null
) {
  const supabase = await createClient();

  let totalClasses = 0,
    acceptedClasses = 0;
  let totalHours = 0,
    acceptedHours = 0;
  let totalStudents = 0, // Total Attendance Marks Possible
    presentStudents = 0; // Total Attendance Marks Attained
  let totalLessons = 0,
    completedLessons = 0;

  // ---------------------------------------------------------
  // 1. FETCH EVENTS (Single + Bulk) FOR THE ENTIRE SCOPE
  // ---------------------------------------------------------
  
  let singleQuery = supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId, fromTime, toTime, subject,
      calendar_event_section!inner ( collegeSectionId )
    `
    )
    .eq("facultyId", facultyId)
    .eq("type", "class")
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .not("subject", "is", null);

  if (subjectId) singleQuery = singleQuery.eq("subject", subjectId);
  if (sectionId) singleQuery = singleQuery.eq("calendar_event_section.collegeSectionId", sectionId);

  const { data: singleEvents } = await singleQuery;

  let bulkQuery = supabase
    .from("bulk_calendar_events")
    .select(
      `
      bulkCalendarEventId, fromTime, toTime, collegeSubjectId,
      bulk_calendar_event_sections!inner ( collegeSectionId )
    `
    )
    .eq("facultyId", facultyId)
    .eq("type", "class")
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .not("collegeSubjectId", "is", null);

  if (subjectId) bulkQuery = bulkQuery.eq("collegeSubjectId", subjectId);
  if (sectionId) bulkQuery = bulkQuery.eq("bulk_calendar_event_sections.collegeSectionId", sectionId);

  const { data: bulkEvents } = await bulkQuery;

  const validSingleEvents = singleEvents || [];
  const validBulkEvents = bulkEvents || [];

  const mappedBulkEvents = validBulkEvents.map((be: any) => ({
    calendarEventId: null,
    bulkCalendarEventId: be.bulkCalendarEventId,
    fromTime: be.fromTime,
    toTime: be.toTime,
    calendar_event_section: be.bulk_calendar_event_sections,
  }));

  const events = [...validSingleEvents, ...mappedBulkEvents];

  const singleEventIds: number[] = [];
  const bulkEventIds: number[] = [];
  const fetchedSectionIds = new Set<number>();

  if (events && events.length > 0) {
    events.forEach((e: any) => {
      if (e.calendarEventId) singleEventIds.push(e.calendarEventId);
      if (e.bulkCalendarEventId) bulkEventIds.push(e.bulkCalendarEventId);
      
      const evSections = Array.isArray(e.calendar_event_section)
        ? e.calendar_event_section
        : [];
      evSections.forEach((sec: any) => {
        if (sec?.collegeSectionId) fetchedSectionIds.add(sec.collegeSectionId);
      });
    });

    // ---------------------------------------------------------
    // 2. COMPUTE TOTAL CLASSES & HOURS (AND ACCEPTED)
    // ---------------------------------------------------------
    let allSessionRecords: any[] = [];
    if (singleEventIds.length > 0 || bulkEventIds.length > 0) {
      const orConditions = [];
      if (singleEventIds.length > 0)
        orConditions.push(`calendarEventId.in.(${singleEventIds.join(",")})`);
      if (bulkEventIds.length > 0)
        orConditions.push(`bulkCalendarEventId.in.(${bulkEventIds.join(",")})`);

      const { data: sessionRecords } = await supabase
        .from("faculty_class_sessions")
        .select("calendarEventId, bulkCalendarEventId, status")
        .or(orConditions.join(","));
        
      if (sessionRecords) allSessionRecords = sessionRecords;
    }

    const sessionMap = new Map<string, string>();
    allSessionRecords.forEach((rec) => {
      if (rec.calendarEventId) {
        sessionMap.set(`single-${rec.calendarEventId}`, rec.status);
      }
      if (rec.bulkCalendarEventId) {
        // For bulk events, we simplify by taking any session record attached to it 
        // representing the general status, or we iterate through all to count exact occurrences.
        // Dashboard stats usually summarize total scheduled vs total accepted.
        sessionMap.set(`bulk-${rec.bulkCalendarEventId}`, rec.status);
      }
    });

    for (const ev of events as any[]) {
      totalClasses++;

      const from = new Date(`1970-01-01T${ev.fromTime}Z`);
      const to = new Date(`1970-01-01T${ev.toTime}Z`);
      const duration = Math.max(
        0,
        (to.getTime() - from.getTime()) / (1000 * 60 * 60)
      );

      totalHours += duration;

      const statusKey = ev.calendarEventId
        ? `single-${ev.calendarEventId}`
        : `bulk-${ev.bulkCalendarEventId}`;
      const isAccepted = sessionMap.get(statusKey) === "Accepted";

      if (isAccepted) {
        acceptedClasses++;
        acceptedHours += duration;
      }
    }
  }

  // ---------------------------------------------------------
  // 3. COMPUTE TOTAL STUDENTS (Total Possible Attendance Marks)
  let sectionIdsToCount: number[] = [];
  if (sectionId) {
    sectionIdsToCount = [sectionId];
  } else {
    // get all sections for this faculty's selected subject (or all subjects)
    let query = supabase.from("faculty_sections").select("collegeSectionsId").eq("facultyId", facultyId).is("deletedAt", null);
    if (subjectId) {
       query = query.eq("collegeSubjectId", subjectId);
    }
    const { data: fSecs } = await query;
    if (fSecs) {
      sectionIdsToCount = fSecs.map((fs) => fs.collegeSectionsId);
    }
  }

  if (sectionIdsToCount.length > 0) {
    const { count, error } = await supabase
      .from("student_academic_history")
      .select("studentId", { count: "exact", head: true })
      .in("collegeSectionsId", sectionIdsToCount)
      .eq("isCurrent", true)
      .is("deletedAt", null);
      
    if (!error && count !== null) {
      totalStudents = count;
    }
  }

  // ---------------------------------------------------------
  // 4. COMPUTE PRESENT STUDENTS (Total Attained Attendance Marks)
  // ---------------------------------------------------------
  if (singleEventIds.length > 0 || bulkEventIds.length > 0) {
    let query = supabase
      .from("attendance_record")
      .select("attendanceRecordId", { count: "exact", head: true })
      .in("status", ["PRESENT", "LATE"]);

    const orConditions = [];
    if (singleEventIds.length > 0)
      orConditions.push(`calendarEventId.in.(${singleEventIds.join(",")})`);
    if (bulkEventIds.length > 0)
      orConditions.push(`bulkCalendarEventId.in.(${bulkEventIds.join(",")})`);

    const { count, error } = await query.or(orConditions.join(","));
    if (!error && count !== null) presentStudents = count;
  }

  // ---------------------------------------------------------
  // 5. COMPUTE TOTAL & COMPLETED LESSONS (TOPICS)
  // ---------------------------------------------------------
  let filterSubjectIds: number[] = [];

  if (subjectId) {
    filterSubjectIds = [subjectId];
  } else {
    // If no specific subject is selected, fetch all subjects taught by this faculty
    const { data: facultySections } = await supabase
      .from("faculty_sections")
      .select("collegeSubjectId")
      .eq("facultyId", facultyId)
      .is("deletedAt", null);

    if (facultySections) {
      filterSubjectIds = [
        ...new Set(facultySections.map((fs) => fs.collegeSubjectId)),
      ];
    }
  }

  if (filterSubjectIds.length > 0) {
    const { data: topics } = await supabase
      .from("college_subject_unit_topics")
      .select("isCompleted")
      .in("collegeSubjectId", filterSubjectIds)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (topics) {
      totalLessons = topics.length;
      completedLessons = topics.filter((t) => t.isCompleted === true).length;
    }
  }

  return {
    totalClasses,
    acceptedClasses,
    totalHours: Math.round(totalHours),
    acceptedHours: Math.round(acceptedHours),
    totalStudents,
    presentStudents,
    totalLessons,
    completedLessons,
  };
}
