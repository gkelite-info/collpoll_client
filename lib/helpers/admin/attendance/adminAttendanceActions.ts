"use server";

import { createClient } from "@/app/utils/supabase/server";
import { create } from "domain";

// --- TYPES ---
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
  stats?: { present: number; total: number };
}

interface AttendancePayload {
  studentId: string;
  status: string;
  reason?: string;
  adminId?: number;
}

export async function getAdminClassesForSection(sectionId: number, dateStr?: string) {
  const supabase = await createClient();
  const today = dateStr || new Date().toISOString().split("T")[0];

  const { data: events, error } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId, date, fromTime, toTime,
      subject:college_subjects (subjectName),
      topic:college_subject_unit_topics (topicTitle),
      faculty:faculty ( user:users (fullName) ),
      calendar_event_section!inner(collegeSectionId)
    `,
    )
    .eq("calendar_event_section.collegeSectionId", sectionId)
    .eq("is_deleted", false)
    .eq("date", today)
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("❌ Admin Fetch Classes Error:", error);
  }

  const { data: bulkEvents, error: bulkError } = await supabase
    .from("bulk_calendar_events")
    .select(
      `
      bulkCalendarEventId, fromDate, toDate, fromTime, toTime,
      subject:college_subjects (subjectName),
      faculty:faculty ( user:users (fullName) ),
      bulk_calendar_event_sections!inner(collegeSectionId)
    `,
    )
    .eq("bulk_calendar_event_sections.collegeSectionId", sectionId)
    .lte("fromDate", today)
    .gte("toDate", today)
    .is("deletedAt", null)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .order("fromTime", { ascending: true });

  if (bulkError) {
    console.error("❌ Admin Fetch Bulk Classes Error:", bulkError);
  }

  const uniqueEvents = new Map();
  (events || []).forEach((e: any) => {
    if (!uniqueEvents.has(e.calendarEventId))
      uniqueEvents.set(`single-${e.calendarEventId}`, { ...e, isBulk: false });
  });

  const isSunday = new Date(today).getDay() === 0;
  if (!isSunday) {
    (bulkEvents || []).forEach((e: any) => {
      if (!uniqueEvents.has(`bulk-${e.bulkCalendarEventId}`))
        uniqueEvents.set(`bulk-${e.bulkCalendarEventId}`, { ...e, isBulk: true });
    });
  }

  const allClasses = Array.from(uniqueEvents.values());
  allClasses.sort((a, b) => (a.fromTime || "").localeCompare(b.fromTime || ""));

  return allClasses.map((e: any) => {
    const subj = Array.isArray(e.subject)
      ? e.subject[0]?.subjectName
      : e.subject?.subjectName || "No Subject";
    const topicObj = Array.isArray(e.topic) ? e.topic[0] : e.topic;
    const topic = topicObj?.topicTitle || "General Session";
    const facultyName = e.faculty?.user?.fullName || "Unknown Faculty";
    const time = e.fromTime ? e.fromTime.slice(0, 5) : "";

    const idStr = e.isBulk ? `bulk-${e.bulkCalendarEventId}` : String(e.calendarEventId);

    return {
      id: idStr,
      label: `${time} • ${subj} • ${facultyName} (${topic})`,
    };
  });
}

export async function getFacultyClasses(
  facultyId: number,
): Promise<ClassOption[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: events, error } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId, date, fromTime, toTime,
      subject:college_subjects (subjectName),
      topic:college_subject_unit_topics (topicTitle)
    `,
    )
    .eq("facultyId", facultyId)
    .eq("is_deleted", false)
    .eq("date", today)
    .order("fromTime", { ascending: true });

  const { data: bulkEvents } = await supabase
    .from("bulk_calendar_events")
    .select(
      `
      bulkCalendarEventId, fromDate, toDate, fromTime, toTime,
      subject:college_subjects (subjectName)
    `,
    )
    .eq("facultyId", facultyId)
    .lte("fromDate", today)
    .gte("toDate", today)
    .is("deletedAt", null)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("❌ getFacultyClasses Error:", error);
    return [];
  }

  const isSunday = new Date().getDay() === 0;
  const validBulkEvents = isSunday ? [] : (bulkEvents || []);

  const allClasses: any[] = [];

  (events || []).forEach((e: any) => {
    allClasses.push({ ...e, isBulk: false });
  });

  validBulkEvents.forEach((e: any) => {
    allClasses.push({ ...e, isBulk: true });
  });

  allClasses.sort((a, b) => (a.fromTime || "").localeCompare(b.fromTime || ""));

  return allClasses.map((e: any) => {
    const subj = Array.isArray(e.subject)
      ? e.subject[0]?.subjectName
      : e.subject?.subjectName || "No Subject";
    const topicObj = Array.isArray(e.topic) ? e.topic[0] : e.topic;
    const topic = topicObj?.topicTitle || "General Session";
    const time = e.fromTime ? e.fromTime.slice(0, 5) : "";

    const idStr = e.isBulk ? `bulk-${e.bulkCalendarEventId}` : String(e.calendarEventId);

    return {
      id: idStr,
      label: `${time} • ${subj} • ${topic}`,
    };
  });
}

export async function getClassSections(
  classId: string,
): Promise<SectionOption[]> {
  const supabase = await createClient();
  const isBulk = classId.startsWith("bulk-");
  const eventId = isBulk ? parseInt(classId.split("-")[1]) : parseInt(classId);

  const table = isBulk ? "bulk_calendar_event_sections" : "calendar_event_section";
  const column = isBulk ? "bulkCalendarEventId" : "calendarEventId";

  const { data: sections, error } = await supabase
    .from(table)
    .select(`collegeSectionId, section:college_sections (collegeSections)`)
    .eq(column, eventId);

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

  const isBulk = classId.startsWith("bulk-");
  let eventId: number;
  let sectionNameFilter: string | undefined;

  if (isBulk) {
    const parts = classId.split("-");
    const subparts = parts[1].split("_");
    eventId = parseInt(subparts[0]);
    sectionNameFilter = subparts[4] !== "undefined" ? subparts[4] : undefined;
  } else {
    const parts = classId.split("-");
    eventId = parseInt(parts[0]);
    sectionNameFilter = parts[1] !== "undefined" ? parts[1] : undefined;
  }

  let targetSectionIds: number[] = [];

  if (sectionFilterId) {
    targetSectionIds = [parseInt(sectionFilterId)];
  } else if (sectionNameFilter) {
    if (isBulk) {
       const { data: eventSections } = await supabase
        .from("bulk_calendar_event_sections")
        .select("collegeSectionId")
        .eq("bulkCalendarEventId", eventId);
       if (eventSections && eventSections.length > 0) {
         const { data: sections } = await supabase.from("college_sections").select("collegeSectionsId").in("collegeSectionsId", eventSections.map(s => s.collegeSectionId)).eq("collegeSections", sectionNameFilter);
         targetSectionIds = sections?.map((s) => s.collegeSectionsId) || [];
       }
    } else {
      const { data: eventSections } = await supabase
        .from("calendar_event_section")
        .select("collegeSectionId, college_sections!inner(collegeSections)")
        .eq("calendarEventId", eventId)
        .eq("college_sections.collegeSections", sectionNameFilter);
      targetSectionIds = eventSections?.map((s) => s.collegeSectionId) || [];
    }
  } else {
    if (isBulk) {
       const { data: eventSections } = await supabase
        .from("bulk_calendar_event_sections")
        .select("collegeSectionId")
        .eq("bulkCalendarEventId", eventId);
       targetSectionIds = eventSections?.map((s) => s.collegeSectionId) || [];
    } else {
      const { data: eventSections } = await supabase
        .from("calendar_event_section")
        .select("collegeSectionId")
        .eq("calendarEventId", eventId);
      targetSectionIds = eventSections?.map((s) => s.collegeSectionId) || [];
    }
  }

  if (targetSectionIds.length === 0) return [];

  const { data: history } = await supabase
    .from("student_academic_history")
    .select("studentId")
    .in("collegeSectionsId", targetSectionIds)
    .eq("isCurrent", true);

  const ids = history?.map((h) => h.studentId) || [];
  if (ids.length === 0) return [];

  const { data: eventData } = await supabase
    .from(isBulk ? "bulk_calendar_events" : "calendar_event")
    .select(isBulk ? "subject, fromDate" : "subject, date")
    .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId)
    .single();

  const eventDate = isBulk 
    ? new Date().toLocaleDateString("en-CA") // "YYYY-MM-DD" local timezone format
    : (eventData as any)?.date;

  const subjectId = eventData?.subject;
  const statsMap = new Map<number, { present: number; total: number }>();

  if (subjectId) {
    const { data: allRecords } = await supabase
      .from("attendance_record")
      .select(`studentId, status, event:calendar_event(subject), bulk_event:bulk_calendar_events(subject)`)
      .in("studentId", ids);

    allRecords?.forEach((r: any) => {
      const recSubjectId = r.event?.subject || r.bulk_event?.subject;
      if (recSubjectId === subjectId && ["PRESENT", "ABSENT", "LEAVE", "LATE"].includes(r.status)) {
        const s = statsMap.get(r.studentId) || { present: 0, total: 0 };
        s.total++;
        if (r.status === "PRESENT" || r.status === "LATE") s.present++;
        statsMap.set(r.studentId, s);
      }
    });
  }

  const { data: students, error } = await supabase
    .from("students")
    .select(
      `studentId, user:users (fullName, gender, user_profile (profileUrl)), student_pins (pinNumber), attendance_record (status, reason, calendarEventId, bulkCalendarEventId)`,
    )
    .in("studentId", ids)
    .eq(isBulk ? "attendance_record.bulkCalendarEventId" : "attendance_record.calendarEventId", eventId)
    .eq("attendance_record.markedAt", eventDate)
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

    const pinData = s.student_pins;
    const pinNumber = Array.isArray(pinData) ? pinData[0]?.pinNumber : pinData?.pinNumber;

    const profileData = s.user?.user_profile;
    const avatarUrl = Array.isArray(profileData) ? profileData[0]?.profileUrl : profileData?.profileUrl;

    return {
      id: String(s.studentId),
      name: s.user?.fullName || `Student ${s.studentId}`,
      roll: pinNumber || String(s.studentId),
      photo: avatarUrl,
      percentage: `${pct}%`,
      attendance: status as any,
      reason: reason,
      stats: { present: stats.present, total: stats.total },
    };
  });
}

export async function saveAttendance(
  classId: string,
  payload: AttendancePayload[],
) {
  const supabase = await createClient();

  const isBulk = classId.startsWith("bulk-");
  const eventId = parseInt(isBulk ? classId.split("-")[1].split("_")[0] : classId.split("-")[0]);

  const { data } = await supabase
    .from(isBulk ? "bulk_calendar_events" : "calendar_event")
    .select(isBulk ? "fromDate" : "date")
    .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId)
    .single();

  let eventDate = isBulk 
    ? new Date().toLocaleDateString("en-CA") // "YYYY-MM-DD" local timezone format
    : (data as any)?.date;

  if (isBulk) {
    const parts = classId.split("-");
    const subparts = parts[1].split("_");
    if (subparts.length >= 4) {
      eventDate = `${subparts[1]}-${subparts[2]}-${subparts[3]}`;
    }
  }

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
        calendarEventId: isBulk ? null : eventId,
        bulkCalendarEventId: isBulk ? eventId : null,
        status: dbStatus,
        reason: p.reason || null,
        markedAt: eventDate,
        adminMark: p.adminId ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attendanceRecordId: undefined as number | undefined,
      };
    });

  if (dbRecords.length === 0) {
    return { success: true };
  }

  const studentIds = dbRecords.map((r) => r.studentId);
  const { data: existingRecords, error: fetchError } = await supabase
    .from("attendance_record")
    .select("attendanceRecordId, studentId")
    .in("studentId", studentIds)
    .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId)
    .eq("markedAt", eventDate)
    .is("deletedAt", null);

  if (fetchError) {
    console.error("fetch existing records error:", fetchError);
    return { success: false, error: fetchError.message };
  }

  const recordMap = new Map(existingRecords?.map((r) => [r.studentId, r.attendanceRecordId]));
  
  const updates: any[] = [];
  const inserts: any[] = [];

  dbRecords.forEach((record) => {
    const existingId = recordMap.get(record.studentId);
    if (existingId) {
      record.attendanceRecordId = existingId;
      updates.push(record);
    } else {
      delete record.attendanceRecordId;
      inserts.push(record);
    }
  });

  if (updates.length > 0) {
    const { error: updateError } = await supabase
      .from("attendance_record")
      .upsert(updates);
    if (updateError) return { success: false, error: updateError.message };
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase
      .from("attendance_record")
      .insert(inserts);
    if (insertError) return { success: false, error: insertError.message };
  }

  return { success: true };
}
