import { supabase } from "@/lib/supabaseClient";

export async function fetchMeetingDetails(meetingId: string) {
  if (!meetingId) return { agenda: "", attendees: [] };

  if (meetingId.startsWith("ce_")) {
    const calendarEventId = parseInt(meetingId.replace("ce_", ""), 10);
    const { data: eventData } = await supabase
      .from("calendar_event")
      .select(`
        topicData:college_subject_unit_topics(topicTitle),
        calendar_event_section(
          collegeSectionId,
          section:college_sections(collegeSections),
          branch:college_branch(collegeBranchCode),
          yearData:college_academic_year(collegeAcademicYear),
          education:college_education(collegeEducationType)
        )
      `)
      .eq("calendarEventId", calendarEventId)
      .single();

    if (!eventData) return { agenda: "", attendees: [] };

    const sectionIds = (eventData.calendar_event_section || [])
      .map((s: any) => s.collegeSectionId)
      .filter(Boolean);

    const studentCountMap = await getStudentCounts(sectionIds);

    const sectionDetails = (eventData.calendar_event_section || []).map((s: any) => {
      const edu = s.education?.collegeEducationType || "";
      const branch = s.branch?.collegeBranchCode || "";
      const year = s.yearData?.collegeAcademicYear || "";
      const sec = s.section?.collegeSections || "";
      const count = studentCountMap.get(s.collegeSectionId) || 0;
      return `${edu} ${branch} Year ${year} - Sec ${sec} (${count} Students)`.trim();
    }).filter(Boolean);

    const topic = Array.isArray(eventData.topicData) ? eventData.topicData[0]?.topicTitle : (eventData.topicData as any)?.topicTitle;
    const topicStr = topic ? `Topic: ${topic}` : "";
    
    // Deduplicate attendees
    const uniqueAttendees = Array.from(new Set(sectionDetails));
    
    const agendaStr = [topicStr, ...uniqueAttendees].filter(Boolean).join("\n");

    return { agenda: agendaStr, attendees: uniqueAttendees };
  }

  if (meetingId.startsWith("bce_")) {
    // bce_ID_DATE
    const parts = meetingId.split("_");
    const bulkCalendarEventId = parseInt(parts[1], 10);

    const { data: bulkData } = await supabase
      .from("bulk_calendar_events")
      .select(`
        bulk_calendar_event_units(
          college_subject_units(unitTitle)
        ),
        bulk_calendar_event_sections(
          collegeSectionId,
          section:college_sections(collegeSections),
          branch:college_branch(collegeBranchCode),
          yearData:college_academic_year(collegeAcademicYear),
          education:college_education(collegeEducationType)
        )
      `)
      .eq("bulkCalendarEventId", bulkCalendarEventId)
      .single();

    if (!bulkData) return { agenda: "", attendees: [] };

    const sectionIds = (bulkData.bulk_calendar_event_sections || [])
      .map((s: any) => s.collegeSectionId)
      .filter(Boolean);

    const studentCountMap = await getStudentCounts(sectionIds);

    const sectionDetails = (bulkData.bulk_calendar_event_sections || []).map((s: any) => {
      const edu = s.education?.collegeEducationType || "";
      const branch = s.branch?.collegeBranchCode || "";
      const year = s.yearData?.collegeAcademicYear || "";
      const sec = s.section?.collegeSections || "";
      const count = studentCountMap.get(s.collegeSectionId) || 0;
      return `${edu} ${branch} Year ${year} - Sec ${sec} (${count} Students)`.trim();
    }).filter(Boolean);

    const unitNames = (bulkData.bulk_calendar_event_units || [])
      .map((u: any) => u.college_subject_units?.unitTitle)
      .filter(Boolean)
      .join(", ");
    const unitStr = unitNames ? `Unit: ${unitNames}` : "";

    const uniqueAttendees = Array.from(new Set(sectionDetails));
    const agendaStr = [unitStr, ...uniqueAttendees].filter(Boolean).join("\n");

    return { agenda: agendaStr, attendees: uniqueAttendees };
  }

  return { agenda: "", attendees: [] };
}

async function getStudentCounts(sectionIds: number[]) {
  const map = new Map<number, number>();
  if (sectionIds.length === 0) return map;

  const { data: countData } = await supabase
    .from("student_academic_history")
    .select("collegeSectionsId")
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .in("collegeSectionsId", sectionIds);

  if (countData) {
    countData.forEach((row: any) => {
      const sid = row.collegeSectionsId;
      if (sid) {
        map.set(sid, (map.get(sid) || 0) + 1);
      }
    });
  }
  return map;
}
