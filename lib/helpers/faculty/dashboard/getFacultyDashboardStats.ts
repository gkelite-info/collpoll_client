// "use server";
// import { createClient } from "@/app/utils/supabase/server";

// export async function getFacultyDashboardStats(facultyId: number) {
//   const supabase = await createClient();
//   const today = new Date().toISOString().split("T")[0];

//   const { data: events, error: eventsError } = await supabase
//     .from("calendar_event")
//     .select(
//       `
//       calendarEventId,
//       fromTime,
//       toTime,
//       faculty_class_sessions ( status ),
//       calendar_event_section ( collegeSectionId )
//     `,
//     )
//     .eq("facultyId", facultyId)
//     .eq("type", "class")
//     .gte("date", today)
//     .eq("is_deleted", false)
//     .is("deletedAt", null);

//   if (eventsError || !events) {
//     return {
//       totalClasses: 0,
//       acceptedClasses: 0,
//       totalHours: 0,
//       acceptedHours: 0,
//       totalStudents: 0,
//       presentStudents: 0,
//     };
//   }

//   let totalClasses = 0;
//   let acceptedClasses = 0;
//   let totalHours = 0;
//   let acceptedHours = 0;
//   let totalStudents = 0;
//   let presentStudents = 0;

//   const eventIds: number[] = [];
//   const sectionIds = new Set<number>();

//   for (const ev of events) {
//     totalClasses++;
//     eventIds.push(ev.calendarEventId);

//     const from = new Date(`1970-01-01T${ev.fromTime}Z`);
//     const to = new Date(`1970-01-01T${ev.toTime}Z`);
//     const hrs = (to.getTime() - from.getTime()) / (1000 * 60 * 60);
//     const duration = hrs > 0 ? hrs : 0;

//     totalHours += duration;

//     const sessions = Array.isArray(ev.faculty_class_sessions)
//       ? ev.faculty_class_sessions
//       : [ev.faculty_class_sessions];
//     const statusObj = sessions[0];
//     const isAccepted = statusObj?.status === "Accepted";

//     if (isAccepted) {
//       acceptedClasses++;
//       acceptedHours += duration;
//     }

//     const evSections = Array.isArray(ev.calendar_event_section)
//       ? ev.calendar_event_section
//       : [];
//     evSections.forEach((sec: any) => {
//       if (sec?.collegeSectionId) sectionIds.add(sec.collegeSectionId);
//     });
//   }

//   let sectionStudentCounts: Record<number, number> = {};
//   if (sectionIds.size > 0) {
//     const { data: history } = await supabase
//       .from("student_academic_history")
//       .select("collegeSectionsId")
//       .in("collegeSectionsId", Array.from(sectionIds))
//       .eq("isCurrent", true);

//     if (history) {
//       history.forEach((h) => {
//         sectionStudentCounts[h.collegeSectionsId] =
//           (sectionStudentCounts[h.collegeSectionsId] || 0) + 1;
//       });
//     }
//   }

//   for (const ev of events) {
//     const evSections = Array.isArray(ev.calendar_event_section)
//       ? ev.calendar_event_section
//       : [];
//     let evStudentCount = 0;
//     evSections.forEach((sec: any) => {
//       if (sec?.collegeSectionId)
//         evStudentCount += sectionStudentCounts[sec.collegeSectionId] || 0;
//     });
//     totalStudents += evStudentCount;
//   }

//   if (eventIds.length > 0) {
//     const { data: attendance } = await supabase
//       .from("attendance_record")
//       .select("attendanceRecordId")
//       .in("calendarEventId", eventIds)
//       .in("status", ["PRESENT", "LATE"]);

//     if (attendance) {
//       presentStudents = attendance.length;
//     }
//   }

//   return {
//     totalClasses,
//     acceptedClasses,
//     totalHours: Math.round(totalHours),
//     acceptedHours: Math.round(acceptedHours),
//     totalStudents,
//     presentStudents,
//   };
// }

"use server";

import { createClient } from "@/app/utils/supabase/server";

export async function getFacultyDashboardStats(facultyId: number) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let totalClasses = 0,
    acceptedClasses = 0;
  let totalHours = 0,
    acceptedHours = 0;
  let totalStudents = 0,
    presentStudents = 0;
  let totalLessons = 0,
    completedLessons = 0;

  const { data: singleEvents } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId, fromTime, toTime,
      calendar_event_section ( collegeSectionId )
    `,
    )
    .eq("facultyId", facultyId)
    .eq("type", "class")
    .gte("date", today)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  const { data: bulkEvents } = await supabase
    .from("bulk_calendar_events")
    .select(
      `
      bulkCalendarEventId, fromTime, toTime,
      bulk_calendar_event_sections ( collegeSectionId )
    `,
    )
    .eq("facultyId", facultyId)
    .eq("type", "class")
    .lte("fromDate", today)
    .gte("toDate", today)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  const isSunday = new Date().getDay() === 0;
  const validSingleEvents = singleEvents || [];
  const validBulkEvents = isSunday ? [] : (bulkEvents || []);

  const mappedBulkEvents = validBulkEvents.map((be: any) => ({
    calendarEventId: null,
    bulkCalendarEventId: be.bulkCalendarEventId,
    fromTime: be.fromTime,
    toTime: be.toTime,
    calendar_event_section: be.bulk_calendar_event_sections
  }));

  const events = [...validSingleEvents, ...mappedBulkEvents];

  const singleEventIds: number[] = [];
  const bulkEventIds: number[] = [];
  const sectionIds = new Set<number>();

  if (events && events.length > 0) {
    events.forEach((e: any) => {
        if (e.calendarEventId) singleEventIds.push(e.calendarEventId);
        if (e.bulkCalendarEventId) bulkEventIds.push(e.bulkCalendarEventId);
    });
    
    let allSessionRecords: any[] = [];
    if (singleEventIds.length > 0 || bulkEventIds.length > 0) {
      const orConditions = [];
      if (singleEventIds.length > 0) orConditions.push(`calendarEventId.in.(${singleEventIds.join(",")})`);
      if (bulkEventIds.length > 0) orConditions.push(`bulkCalendarEventId.in.(${bulkEventIds.join(",")})`);
      
      const { data: sessionRecords } = await supabase
        .from("faculty_class_sessions")
        .select("calendarEventId, bulkCalendarEventId, status")
        .or(orConditions.join(","));
      if (sessionRecords) allSessionRecords = sessionRecords;
    }
      
    const sessionMap = new Map<string, string>();
    allSessionRecords.forEach((rec) => {
      if (rec.calendarEventId) sessionMap.set(`single-${rec.calendarEventId}`, rec.status);
      if (rec.bulkCalendarEventId) sessionMap.set(`bulk-${rec.bulkCalendarEventId}`, rec.status);
    });

    for (const ev of events as any[]) {
      totalClasses++;

      const from = new Date(`1970-01-01T${ev.fromTime}Z`);
      const to = new Date(`1970-01-01T${ev.toTime}Z`);
      const duration = Math.max(
        0,
        (to.getTime() - from.getTime()) / (1000 * 60 * 60),
      );

      totalHours += duration;

      const isAccepted = (ev.calendarEventId ? sessionMap.get(`single-${ev.calendarEventId}`) : sessionMap.get(`bulk-${ev.bulkCalendarEventId}`)) === "Accepted";

      if (isAccepted) {
        acceptedClasses++;
        acceptedHours += duration;
      }

      const evSections = Array.isArray(ev.calendar_event_section)
        ? ev.calendar_event_section
        : [];
      evSections.forEach((sec: any) => {
        if (sec?.collegeSectionId) sectionIds.add(sec.collegeSectionId);
      });
    }
  }

  // 2. Map Student Total Counts
  if (sectionIds.size > 0) {
    const sectionStudentCounts: Record<number, number> = {};
    const { data: history } = await supabase
      .from("student_academic_history")
      .select("collegeSectionsId")
      .in("collegeSectionsId", Array.from(sectionIds))
      .eq("isCurrent", true);

    if (history) {
      history.forEach((h) => {
        sectionStudentCounts[h.collegeSectionsId] =
          (sectionStudentCounts[h.collegeSectionsId] || 0) + 1;
      });
    }

    if (events) {
      for (const ev of events as any[]) {
        const evSections = Array.isArray(ev.calendar_event_section)
          ? ev.calendar_event_section
          : [];
        let evStudentCount = 0;
        evSections.forEach((sec: any) => {
          if (sec?.collegeSectionId)
            evStudentCount += sectionStudentCounts[sec.collegeSectionId] || 0;
        });
        totalStudents += evStudentCount;
      }
    }
  }

  // 3. Calculate Present Students
  if (singleEventIds.length > 0 || bulkEventIds.length > 0) {
    let query = supabase
      .from("attendance_record")
      .select("attendanceRecordId", { count: 'exact' })
      .in("status", ["PRESENT", "LATE"]);

    const orConditions = [];
    if (singleEventIds.length > 0) orConditions.push(`calendarEventId.in.(${singleEventIds.join(",")})`);
    if (bulkEventIds.length > 0) orConditions.push(`bulkCalendarEventId.in.(${bulkEventIds.join(",")})`);

    const { count } = await query.or(orConditions.join(","));

    if (count !== null) presentStudents = count;
  }

  // 4. ---> NEW: CALCULATE TOTAL & COMPLETED LESSONS (TOPICS) <---
  // A. Find subjects taught by this faculty
  const { data: facultySections } = await supabase
    .from("faculty_sections")
    .select("collegeSubjectId")
    .eq("facultyId", facultyId)
    .is("deletedAt", null);

  const subjectIds = [
    ...new Set(facultySections?.map((fs) => fs.collegeSubjectId) || []),
  ];

  // B. Fetch topics for those subjects and calculate completion
  if (subjectIds.length > 0) {
    const { data: topics } = await supabase
      .from("college_subject_unit_topics")
      .select("isCompleted")
      .in("collegeSubjectId", subjectIds)
      .eq("isActive", true);

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
