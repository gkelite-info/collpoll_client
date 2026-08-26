"use server";

import { createClient } from "@supabase/supabase-js";

export interface FacultyTeachingSession {
  section: string;
  subject: string;
  students: number;
}

const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");

export async function getFacultyTeachingSessions(facultyId: number, selectedMonth: string): Promise<FacultyTeachingSession[]> {
  const [year, month] = selectedMonth.split("-").map(Number);
  if (!facultyId || !year || !month || month < 1 || month > 12) return [];
  const monthStart = `${selectedMonth}-01`;
  const monthEnd = `${selectedMonth}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;

  const { data: classSessions, error: sessionError } = await adminSupabase.from("faculty_class_sessions")
    .select("calendarEventId, calendar_event!inner(date, subject)").eq("facultyId", facultyId)
    .neq("status", "cancel").eq("is_deleted", false).is("deletedAt", null)
    .gte("calendar_event.date", monthStart).lte("calendar_event.date", monthEnd);
  if (sessionError) throw new Error(sessionError.message);
  if (!classSessions?.length) return [];

  const eventIds = [...new Set(classSessions.map((row) => row.calendarEventId))];
  const { data: eventSections, error: sectionError } = await adminSupabase.from("calendar_event_section")
    .select("calendarEventId, collegeSectionId, section:college_sections(collegeSections), branch:college_branch(collegeBranchType, collegeBranchCode)")
    .in("calendarEventId", eventIds).eq("isActive", true).is("deletedAt", null);
  if (sectionError) throw new Error(sectionError.message);

  const subjectIds = [...new Set(classSessions.map((row: any) => {
    const event = Array.isArray(row.calendar_event) ? row.calendar_event[0] : row.calendar_event;
    return event?.subject as number | undefined;
  }).filter(Boolean))] as number[];
  const { data: subjects, error: subjectError } = subjectIds.length
    ? await adminSupabase.from("college_subjects").select("collegeSubjectId, subjectName").in("collegeSubjectId", subjectIds)
    : { data: [], error: null };
  if (subjectError) throw new Error(subjectError.message);

  const sectionIds = [...new Set((eventSections ?? []).map((row) => row.collegeSectionId))];
  const { data: histories, error: historyError } = sectionIds.length
    ? await adminSupabase.from("student_academic_history").select("collegeSectionsId").in("collegeSectionsId", sectionIds).eq("isCurrent", true).is("deletedAt", null)
    : { data: [], error: null };
  if (historyError) throw new Error(historyError.message);

  const subjectNames = new Map((subjects ?? []).map((row) => [row.collegeSubjectId, String(row.subjectName).replace(/_/g, " ")]));
  const studentCounts = (histories ?? []).reduce<Record<number, number>>((counts, row) => {
    counts[row.collegeSectionsId] = (counts[row.collegeSectionsId] || 0) + 1;
    return counts;
  }, {});
  const sessions = new Map<string, FacultyTeachingSession>();
  classSessions.forEach((row: any) => {
    const event = Array.isArray(row.calendar_event) ? row.calendar_event[0] : row.calendar_event;
    (eventSections ?? []).filter((item) => item.calendarEventId === row.calendarEventId).forEach((item: any) => {
      const section = Array.isArray(item.section) ? item.section[0] : item.section;
      const branch = Array.isArray(item.branch) ? item.branch[0] : item.branch;
      const branchName = branch?.collegeBranchCode || branch?.collegeBranchType || "";
      const sectionName = section?.collegeSections || "";
      sessions.set(`${item.collegeSectionId}-${event?.subject}`, {
        section: branchName && sectionName ? `${branchName} - ${sectionName}` : branchName || sectionName || "Unknown",
        subject: subjectNames.get(event?.subject) || "Not assigned",
        students: studentCounts[item.collegeSectionId] || 0,
      });
    });
  });
  return [...sessions.values()];
}
