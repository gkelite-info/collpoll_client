"use server";

import { createClient } from "@/app/utils/supabase/server";

export interface ConflictingSection {
  facultyName: string;
  subjectName: string;
  sectionName: string;
  fromTime: string;
  toTime: string;
}

export async function checkSectionConflict(params: {
  collegeId: number;
  date?: string;
  fromDate?: string;
  toDate?: string;
  fromTime: string;
  toTime: string;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  sectionIds: number[];
  ignoreEventId?: number;
  ignoreBulkEventId?: number;
}): Promise<ConflictingSection[]> {
  const supabase = await createClient();

  const {
    collegeId,
    date,
    fromDate,
    toDate,
    fromTime,
    toTime,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,
    sectionIds,
    ignoreEventId,
    ignoreBulkEventId,
  } = params;

  // 1. Query calendar_event (single events)
  let query = supabase
    .from("calendar_event")
    .select(`
      calendarEventId,
      fromTime,
      toTime,
      facultyData:faculty!inner (
        fullName,
        collegeId
      ),
      subjectData:college_subjects (subjectName),
      calendar_event_section (
        isActive,
        deletedAt,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId,
        sectionData:college_sections (collegeSections)
      )
    `)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq("faculty.collegeId", collegeId);

  if (date) {
    query = query.eq("date", date);
  } else if (fromDate && toDate) {
    query = query.gte("date", fromDate).lte("date", toDate);
  }

  // 2. Query bulk_calendar_events
  let bulkQuery = supabase
    .from("bulk_calendar_events")
    .select(`
      bulkCalendarEventId,
      fromDate,
      toDate,
      fromTime,
      toTime,
      facultyData:faculty!inner (
        fullName,
        collegeId
      ),
      subjectData:college_subjects (subjectName),
      bulk_calendar_event_sections (
        isActive,
        deletedAt,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId,
        sectionData:college_sections (collegeSections)
      )
    `)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq("faculty.collegeId", collegeId);

  if (date) {
    bulkQuery = bulkQuery.lte("fromDate", date).gte("toDate", date);
  } else if (fromDate && toDate) {
    bulkQuery = bulkQuery.lte("fromDate", toDate).gte("toDate", fromDate);
  }

  const [eventsRes, bulkEventsRes] = await Promise.all([
    query,
    bulkQuery,
  ]);

  const events = eventsRes.data ?? [];
  const bulkEvents = bulkEventsRes.data ?? [];

  const conflicts: ConflictingSection[] = [];

  // Check single event conflicts
  for (const event of events) {
    if (ignoreEventId && event.calendarEventId === ignoreEventId) continue;

    // Check time overlap
    const overlaps = fromTime < event.toTime && toTime > event.fromTime;
    if (!overlaps) continue;

    const activeSections = (event.calendar_event_section || []).filter(
      (s: any) =>
        s.isActive === true &&
        s.deletedAt === null &&
        s.collegeEducationId === collegeEducationId &&
        s.collegeBranchId === collegeBranchId &&
        s.collegeAcademicYearId === collegeAcademicYearId &&
        s.collegeSemesterId === collegeSemesterId &&
        sectionIds.includes(s.collegeSectionId),
    );

    for (const s of activeSections) {
      const facultyData = Array.isArray(event.facultyData)
        ? event.facultyData[0]
        : event.facultyData;
      const subjectData = Array.isArray(event.subjectData)
        ? event.subjectData[0]
        : event.subjectData;
      const sectionData = Array.isArray(s.sectionData)
        ? s.sectionData[0]
        : s.sectionData;

      conflicts.push({
        facultyName: facultyData?.fullName ?? "Unknown Faculty",
        subjectName: subjectData?.subjectName ?? "Unknown Subject",
        sectionName: sectionData?.collegeSections ?? "Unknown Section",
        fromTime: event.fromTime,
        toTime: event.toTime,
      });
    }
  }

  // Check bulk event conflicts
  for (const bulkEvent of bulkEvents) {
    if (ignoreBulkEventId && bulkEvent.bulkCalendarEventId === ignoreBulkEventId) continue;

    // Check time overlap
    const overlaps = fromTime < bulkEvent.toTime && toTime > bulkEvent.fromTime;
    if (!overlaps) continue;

    const activeSections = (bulkEvent.bulk_calendar_event_sections || []).filter(
      (s: any) =>
        s.isActive === true &&
        s.deletedAt === null &&
        s.collegeEducationId === collegeEducationId &&
        s.collegeBranchId === collegeBranchId &&
        s.collegeAcademicYearId === collegeAcademicYearId &&
        s.collegeSemesterId === collegeSemesterId &&
        sectionIds.includes(s.collegeSectionId),
    );

    for (const s of activeSections) {
      const facultyData = Array.isArray(bulkEvent.facultyData)
        ? bulkEvent.facultyData[0]
        : bulkEvent.facultyData;
      const subjectData = Array.isArray(bulkEvent.subjectData)
        ? bulkEvent.subjectData[0]
        : bulkEvent.subjectData;
      const sectionData = Array.isArray(s.sectionData)
        ? s.sectionData[0]
        : s.sectionData;

      conflicts.push({
        facultyName: facultyData?.fullName ?? "Unknown Faculty",
        subjectName: subjectData?.subjectName ?? "Unknown Subject",
        sectionName: sectionData?.collegeSections ?? "Unknown Section",
        fromTime: bulkEvent.fromTime,
        toTime: bulkEvent.toTime,
      });
    }
  }

  return conflicts;
}