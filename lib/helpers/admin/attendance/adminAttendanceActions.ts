"use server";

import { createClient } from "@/app/utils/supabase/server";

export async function getAdminClassesForSection(sectionId: number) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Fetch events for this specific section for TODAY
  const { data: events, error } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId,
      date,
      fromTime,
      toTime,
      subject:college_subjects (subjectName),
      topic:college_subject_unit_topics (topicTitle),
      faculty:faculty (
         user:users (fullName)
      ),
      calendar_event_section!inner(collegeSectionId)
    `,
    )
    .eq("calendar_event_section.collegeSectionId", sectionId)
    .eq("is_deleted", false)
    .eq("date", today)
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("❌ Admin Fetch Classes Error:", error);
    return [];
  }

  return events.map((e: any) => {
    const subj = Array.isArray(e.subject)
      ? e.subject[0]?.subjectName
      : e.subject?.subjectName || "No Subject";
    const topicObj = Array.isArray(e.topic) ? e.topic[0] : e.topic;
    const topic = topicObj?.topicTitle || "General Session";
    const facultyName = e.faculty?.user?.fullName || "Unknown Faculty";
    const time = e.fromTime ? e.fromTime.slice(0, 5) : "";

    return {
      id: String(e.calendarEventId),
      label: `${time} • ${subj} • ${facultyName} (${topic})`,
    };
  });
}

export interface ClassOption {
  id: string;
  label: string;
}

export interface SectionOption {
  id: string;
  name: string;
}

export interface UIStudent {
  id: string;
  name: string;
  roll: string;
  photo?: string;
  percentage: string;
  attendance:
    | "Not Marked"
    | "Present"
    | "Absent"
    | "Leave"
    | "Late"
    | "Class Cancel";
  reason: string;
}

// 1. Fetch Today's Classes for Faculty
export async function getFacultyClasses(
  facultyId: number,
): Promise<ClassOption[]> {
  const supabase = await createClient();

  // Get Today's Date in YYYY-MM-DD format (Server Time)
  const today = new Date().toISOString().split("T")[0];

  const { data: events, error } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId,
      date,
      fromTime,
      toTime,
      subject:college_subjects (subjectName),
      topic:college_subject_unit_topics (topicTitle)
    `,
    )
    .eq("facultyId", facultyId)
    .eq("is_deleted", false)
    .eq("date", today) // FILTER: TODAY ONLY
    .order("fromTime", { ascending: true }); // Earliest first

  if (error) {
    console.error("❌ getFacultyClasses Error:", error);
    return [];
  }

  return events.map((e: any) => {
    const subj = Array.isArray(e.subject)
      ? e.subject[0]?.subjectName
      : e.subject?.subjectName || "No Subject";
    const topicObj = Array.isArray(e.topic) ? e.topic[0] : e.topic;
    const topic = topicObj?.topicTitle || "General Session";
    const time = e.fromTime ? e.fromTime.slice(0, 5) : "";

    return {
      id: String(e.calendarEventId),
      label: `${time} • ${subj} • ${topic}`,
    };
  });
}

// ... (Keep getClassSections, getStudentsForClass, saveAttendance exactly as they were) ...
// (Implicitly preserved to save space)

export async function getClassSections(
  classId: string,
): Promise<SectionOption[]> {
  const supabase = await createClient();
  const { data: sections, error } = await supabase
    .from("calendar_event_section")
    .select(`collegeSectionId, section:college_sections (collegeSections)`)
    .eq("calendarEventId", classId);
  if (error) return [];
  const unique = new Map();
  sections.forEach((s: any) => {
    const name = Array.isArray(s.section)
      ? s.section[0]?.collegeSections
      : s.section?.collegeSections;
    if (!unique.has(s.collegeSectionId))
      unique.set(s.collegeSectionId, {
        id: String(s.collegeSectionId),
        name: name || "Unknown",
      });
  });
  return Array.from(unique.values());
}

export async function getStudentsForClass(
  classId: string,
  sectionFilterId?: string,
): Promise<UIStudent[]> {
  const supabase = await createClient();
  let sectionIds: number[] = [];
  if (sectionFilterId) {
    sectionIds = [parseInt(sectionFilterId)];
  } else {
    const { data: eventSections } = await supabase
      .from("calendar_event_section")
      .select("collegeSectionId")
      .eq("calendarEventId", classId);
    sectionIds = eventSections?.map((s) => s.collegeSectionId) || [];
  }
  if (sectionIds.length === 0) return [];

  const { data: history } = await supabase
    .from("student_academic_history")
    .select("studentId")
    .in("collegeSectionsId", sectionIds)
    .eq("isCurrent", true);
  const ids = history?.map((h) => h.studentId) || [];
  if (ids.length === 0) return [];

  const { data: eventData } = await supabase
    .from("calendar_event")
    .select("subject")
    .eq("calendarEventId", classId)
    .single();
  const subjectId = eventData?.subject;
  const statsMap = new Map<number, { present: number; total: number }>();

  if (subjectId) {
    const { data: allRecords } = await supabase
      .from("attendance_record")
      .select(`studentId, status, event:calendar_event!inner(subject)`)
      .in("studentId", ids)
      .eq("event.subject", subjectId);
    allRecords?.forEach((r: any) => {
      if (["PRESENT", "ABSENT", "LEAVE", "LATE"].includes(r.status)) {
        const s = statsMap.get(r.studentId) || { present: 0, total: 0 };
        s.total++;
        if (r.status === "PRESENT") s.present++;
        statsMap.set(r.studentId, s);
      }
    });
  }

  const { data: students, error } = await supabase
    .from("students")
    .select(
      `studentId, user:users (fullName, gender), attendance_record (status, reason, calendarEventId)`,
    )
    .in("studentId", ids)
    .eq("attendance_record.calendarEventId", classId)
    .order("studentId");
  if (error) return [];

  return students!.map((s: any) => {
    const record = s.attendance_record?.[0];
    let status = "Not Marked";
    let reason = "";
    if (record) {
      switch (record.status) {
        case "PRESENT":
          status = "Present";
          break;
        case "ABSENT":
          status = "Absent";
          break;
        case "LEAVE":
          status = "Leave";
          break;
        case "LATE":
          status = "Late";
          break;
        case "CLASS_CANCEL":
        case "CANCELLED":
        case "CANCEL_CLASS":
          status = "Class Cancel";
          break;
        default:
          status = "Present";
      }
      reason = record.reason || "";
    }
    const stats = statsMap.get(s.studentId) || { present: 0, total: 0 };
    const pct =
      stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    const userGender = s.user?.gender || "Male";
    return {
      id: String(s.studentId),
      name: s.user?.fullName || `Student ${s.studentId}`,
      roll: String(s.studentId),
      photo: userGender === "Female" ? "/student-f.png" : "/maleuser.png",
      percentage: `${pct}%`,
      attendance: status as any,
      reason: reason,
    };
  });
}

export async function saveAttendance(classId: string, payload: any[]) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("calendar_event")
    .select("date")
    .eq("calendarEventId", classId)
    .single();
  const dbRecords = payload
    .filter((p) => p.status !== "Not Marked")
    .map((p) => {
      let dbStatus = "PRESENT";
      if (p.status === "Absent") dbStatus = "ABSENT";
      else if (p.status === "Leave") dbStatus = "LEAVE";
      else if (p.status === "Late") dbStatus = "LATE";
      else if (p.status === "Class Cancel") dbStatus = "CLASS_CANCEL";
      return {
        studentId: parseInt(p.studentId),
        calendarEventId: parseInt(classId),
        status: dbStatus,
        reason: p.reason || null,
        markedAt: data?.date,
        facultyMark: p.facultyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  const { error } = await supabase
    .from("attendance_record")
    .upsert(dbRecords, { onConflict: "studentId,calendarEventId" });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
