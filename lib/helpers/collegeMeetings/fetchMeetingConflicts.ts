import { supabase } from "@/lib/supabaseClient";

export interface ConflictItem {
  type: "meeting" | "calendar_event" | "bulk_calendar_event";
  id: number;
  title: string;
  organizer: string;
  fromTime: string;
  toTime: string;
}

export async function fetchMeetingConflicts(params: {
  collegeId: number;
  date: string;
  fromTime: string;
  toTime: string;
  participantUserIds?: number[];
  excludeMeetingId?: number;
}): Promise<ConflictItem[]> {
  const { collegeId, date, fromTime, toTime, participantUserIds, excludeMeetingId } = params;
  
  if (!participantUserIds || participantUserIds.length === 0) return [];

  const normFrom = fromTime.length === 5 ? fromTime + ":00" : fromTime;
  const normTo = toTime.length === 5 ? toTime + ":00" : toTime;

  const conflicts: ConflictItem[] = [];

  // 1. Check college_meetings for the specified participants
  let meetingQuery = supabase
    .from("college_meetings")
    .select("collegeMeetingId, title, organizer, fromTime, toTime, createdBy, college_meeting_participants(userId)")
    .eq("collegeId", collegeId)
    .eq("date", date)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (excludeMeetingId) {
    meetingQuery = meetingQuery.neq("collegeMeetingId", excludeMeetingId);
  }

  const { data: meetingData, error: meetingError } = await meetingQuery;
  if (!meetingError && meetingData) {
    for (const m of meetingData as any[]) {
      if (normFrom < m.toTime && normTo > m.fromTime) {
        const pIds = (m.college_meeting_participants || []).map((p: any) => p.userId);
        const involvesParticipant = participantUserIds.some(id => pIds.includes(id) || m.createdBy === id);
        
        if (involvesParticipant) {
          conflicts.push({
            type: "meeting",
            id: m.collegeMeetingId,
            title: m.title || "Meeting",
            organizer: m.organizer || "Unknown",
            fromTime: m.fromTime,
            toTime: m.toTime,
          });
        }
      }
    }
  }

  // Find faculty and students among participants
  const { data: facultyData } = await supabase.from('faculty').select('facultyId, userId').in('userId', participantUserIds).eq('isActive', true);
  const facultyIds = facultyData?.map(f => f.facultyId) || [];
  
  const { data: studentData } = await supabase.from('student_academic_history').select('collegeSectionsId, students!inner(userId)').in('students.userId', participantUserIds).eq('isCurrent', true).is('deletedAt', null);
  const sectionIds = studentData?.map(s => s.collegeSectionsId).filter(Boolean) || [];

  // 2. Check calendar_event and bulk_calendar_events for faculty
  if (facultyIds.length > 0) {
    const { data: eventData } = await supabase
      .from("calendar_event")
      .select(`
        calendarEventId, fromTime, toTime, faculty(fullName), college_subjects(subjectName)
      `)
      .in("facultyId", facultyIds)
      .eq("date", date)
      .eq("is_deleted", false)
      .is("deletedAt", null);

    if (eventData) {
      for (const e of eventData as any[]) {
        if (normFrom < e.toTime && normTo > e.fromTime) {
          const facultyName = Array.isArray(e.faculty) ? e.faculty[0]?.fullName : e.faculty?.fullName;
          const subjectName = Array.isArray(e.college_subjects) ? e.college_subjects[0]?.subjectName : e.college_subjects?.subjectName;
          conflicts.push({
            type: "calendar_event",
            id: e.calendarEventId,
            title: subjectName || "Class",
            organizer: facultyName || "Unknown Faculty",
            fromTime: e.fromTime,
            toTime: e.toTime,
          });
        }
      }
    }
    
    const { data: bulkData } = await supabase
      .from("bulk_calendar_events")
      .select(`
        bulkCalendarEventId, fromTime, toTime, faculty(fullName), college_subjects(subjectName)
      `)
      .in("facultyId", facultyIds)
      .lte("fromDate", date)
      .gte("toDate", date)
      .eq("is_deleted", false)
      .is("deletedAt", null);

    if (bulkData) {
      for (const b of bulkData as any[]) {
        if (normFrom < b.toTime && normTo > b.fromTime) {
          const facultyName = Array.isArray(b.faculty) ? b.faculty[0]?.fullName : b.faculty?.fullName;
          const subjectName = Array.isArray(b.college_subjects) ? b.college_subjects[0]?.subjectName : b.college_subjects?.subjectName;
          conflicts.push({
            type: "bulk_calendar_event",
            id: b.bulkCalendarEventId,
            title: subjectName || "Bulk Class",
            organizer: facultyName || "Unknown Faculty",
            fromTime: b.fromTime,
            toTime: b.toTime,
          });
        }
      }
    }
  }
  
  // 3. Check calendar events for students
  if (sectionIds.length > 0) {
    const { data: studentEvents } = await supabase
      .from("calendar_event_section")
      .select(`
        calendar_event!inner(
          calendarEventId, fromTime, toTime, date, is_deleted, deletedAt,
          college_subjects(subjectName), faculty(fullName)
        )
      `)
      .in("collegeSectionId", sectionIds)
      .eq("calendar_event.date", date)
      .eq("calendar_event.is_deleted", false)
      .is("calendar_event.deletedAt", null);
      
    if (studentEvents) {
      for (const ev of studentEvents as any[]) {
        const e = Array.isArray(ev.calendar_event) ? ev.calendar_event[0] : ev.calendar_event;
        if (e && normFrom < e.toTime && normTo > e.fromTime) {
          const facultyName = Array.isArray(e.faculty) ? e.faculty[0]?.fullName : e.faculty?.fullName;
          const subjectName = Array.isArray(e.college_subjects) ? e.college_subjects[0]?.subjectName : e.college_subjects?.subjectName;
          conflicts.push({
            type: "calendar_event",
            id: e.calendarEventId,
            title: subjectName || "Class",
            organizer: facultyName || "Unknown Faculty",
            fromTime: e.fromTime,
            toTime: e.toTime,
          });
        }
      }
    }
    
    const { data: studentBulkEvents } = await supabase
      .from("bulk_calendar_event_sections")
      .select(`
        bulk_calendar_events!inner(
          bulkCalendarEventId, fromTime, toTime, fromDate, toDate, is_deleted, deletedAt,
          college_subjects(subjectName), faculty(fullName)
        )
      `)
      .in("collegeSectionId", sectionIds)
      .lte("bulk_calendar_events.fromDate", date)
      .gte("bulk_calendar_events.toDate", date)
      .or("is_deleted.eq.false,is_deleted.is.null", { foreignTable: 'bulk_calendar_events' })
      .is("bulk_calendar_events.deletedAt", null);
      
    if (studentBulkEvents) {
      for (const bv of studentBulkEvents as any[]) {
        const b = Array.isArray(bv.bulk_calendar_events) ? bv.bulk_calendar_events[0] : bv.bulk_calendar_events;
        if (b && normFrom < b.toTime && normTo > b.fromTime) {
          const facultyName = Array.isArray(b.faculty) ? b.faculty[0]?.fullName : b.faculty?.fullName;
          const subjectName = Array.isArray(b.college_subjects) ? b.college_subjects[0]?.subjectName : b.college_subjects?.subjectName;
          conflicts.push({
            type: "bulk_calendar_event",
            id: b.bulkCalendarEventId,
            title: subjectName || "Bulk Class",
            organizer: facultyName || "Unknown Faculty",
            fromTime: b.fromTime,
            toTime: b.toTime,
          });
        }
      }
    }
  }

  // Deduplicate conflicts
  const uniqueConflicts = conflicts.filter((c, index, self) => 
    index === self.findIndex((t) => t.type === c.type && t.id === c.id)
  );

  return uniqueConflicts;
}
