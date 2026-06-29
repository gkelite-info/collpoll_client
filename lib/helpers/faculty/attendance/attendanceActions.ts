"use server";

import { createClient } from "@/app/utils/supabase/server";
import { calculateAttendancePercentage } from "@/lib/helpers/attendance/attendancePolicyMessage";
import { saveFacultyClassSession } from "../facultyClassSessionsAPI";
import {
  activateDeviceSessionForClass,
  deactivateSessionsForEvent,
} from "@/lib/helpers/devices/classSessionActivation";


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

// export async function getFacultyClasses(
//   facultyId: number,
// ): Promise<ClassOption[]> {
//   const supabase = await createClient();

//   const today = new Date().toISOString().split("T")[0];

//   const { data: events, error } = await supabase
//     .from("calendar_event")
//     .select(
//       `
//       calendarEventId,
//       date,
//       fromTime,
//       toTime,
//       subject:college_subjects (subjectName),
//       topic:college_subject_unit_topics (topicTitle)
//     `,
//     )
//     .eq("facultyId", facultyId)
//     .eq("is_deleted", false)
//     .eq("date", today)
//     .order("fromTime", { ascending: true });

//   if (error) return [];

//   return events.map((e: any) => {
//     const subj = Array.isArray(e.subject)
//       ? e.subject[0]?.subjectName
//       : e.subject?.subjectName || "No Subject";
//     const topicObj = Array.isArray(e.topic) ? e.topic[0] : e.topic;
//     const topic = topicObj?.topicTitle || "General Session";
//     const time = e.fromTime ? e.fromTime.slice(0, 5) : "";

//     return {
//       id: String(e.calendarEventId),
//       label: `${time} • ${subj} • ${topic}`,
//     };
//   });
// }

export async function getFacultyClasses(
  facultyId: number,
): Promise<ClassOption[]> {
  const supabase = await createClient();
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
    .eq("date", today)
    .order("fromTime", { ascending: true });

  if (error || !events || events.length === 0) return [];

  const eventIds = events.map((e: any) => e.calendarEventId);
  
  const { data: acceptedSessions } = await supabase
    .from("faculty_class_sessions")
    .select("calendarEventId")
    .in("calendarEventId", eventIds)
    .eq("status", "accepted");

  const acceptedEventIds = new Set(
    acceptedSessions?.map((s) => s.calendarEventId) || []
  );

  const acceptedEvents = events.filter((e: any) =>
    acceptedEventIds.has(e.calendarEventId)
  );

  return acceptedEvents.map((e: any) => {
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

  const isBulk = classId.startsWith("bulk-");
  let eventId: number;
  let sectionNameFilter: string | undefined;

  if (isBulk) {
    const parts = classId.split("-");
    eventId = parseInt(parts[1]);
    sectionNameFilter = parts[2] !== "undefined" ? parts[2] : undefined;
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
       // Needs manual mapping if we only have name, but sectionFilterId is usually provided or we just query sections directly
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
      `studentId, user:users (fullName, gender, user_profile(profileUrl)), student_pins(pinNumber), attendance_record (status, reason, calendarEventId, bulkCalendarEventId)`,
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
    const pct = calculateAttendancePercentage(stats.present, stats.total);
    const userGender = s.user?.gender || "Male";

    const profileUrl = Array.isArray(s.user?.user_profile)
      ? s.user.user_profile[0]?.profileUrl
      : s.user?.user_profile?.profileUrl;

    const pin = Array.isArray(s.student_pins)
      ? s.student_pins[0]?.pinNumber
      : s.student_pins?.pinNumber;


    return {
      id: String(s.studentId),
      name: s.user?.fullName || `Student ${s.studentId}`,
      roll: pin || String(s.studentId),
      photo: profileUrl,
      percentage: `${pct}%`,
      attendance: status as any,
      reason: reason,
      stats: { present: stats.present, total: stats.total },
    };
  });
}

export async function saveAttendance(classId: string, payload: any[]) {
  const supabase = await createClient();

  const isBulk = classId.startsWith("bulk-");
  const eventId = parseInt(isBulk ? classId.split("-")[1] : classId.split("-")[0]);

  const { data } = await supabase
    .from(isBulk ? "bulk_calendar_events" : "calendar_event")
    .select(isBulk ? "fromDate" : "date")
    .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId)
    .single();

  const eventDate = isBulk 
    ? new Date().toLocaleDateString("en-CA") // "YYYY-MM-DD" local timezone format
    : (data as any)?.date;

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
        facultyMark: p.facultyId,
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

export async function handleMissionClassStatus(
  classIdStr: string,
  facultyId: number,
  status: "Accepted" | "Cancel" | "Scheduled",
  reason?: string,
  collegeId?: number,
) {
  const supabase = await createClient();
  const isBulk = classIdStr.startsWith("bulk-");
  const eventId = parseInt(isBulk ? classIdStr.split("-")[1] : classIdStr.split("-")[0]);
  const timeNow = new Date().toTimeString().split(" ")[0];

  let facultyClassSessionsId: number | undefined;

  const { data: eventData } = await supabase
    .from(isBulk ? "bulk_calendar_events" : "calendar_event")
    .select("collegeRoomId")
    .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId)
    .single();
  
  const collegeRoomId = eventData?.collegeRoomId;

  const { data: existingSessions } = await supabase
    .from("faculty_class_sessions")
    .select("facultyClassSessionsId")
    .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId)
    .eq("facultyId", facultyId)
    .is("deletedAt", null);

  if (existingSessions && existingSessions.length > 0) {
    const [primary, ...duplicates] = existingSessions;
    facultyClassSessionsId = primary.facultyClassSessionsId;

    if (duplicates.length > 0) {
      await supabase
        .from("faculty_class_sessions")
        .delete()
        .in(
          "facultyClassSessionsId",
          duplicates.map((d) => d.facultyClassSessionsId),
        );
    }
    await supabase
      .from("faculty_class_sessions")
      .update({
        collegeRoomId: collegeRoomId,
        status: status.toLowerCase(),
        acceptedAt: status === "Accepted" ? timeNow : undefined,
        updatedAt: new Date().toISOString(),
      })
      .eq("facultyClassSessionsId", primary.facultyClassSessionsId);
  } else {
    const { data: inserted } = await supabase
      .from("faculty_class_sessions")
      .insert({
        calendarEventId: isBulk ? null : eventId,
        bulkCalendarEventId: isBulk ? eventId : null,
        facultyId: facultyId,
        collegeRoomId: collegeRoomId,
        status: status.toLowerCase(),
        acceptedAt: status === "Accepted" ? timeNow : "00:00:00",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select("facultyClassSessionsId")
      .single();
    facultyClassSessionsId = inserted?.facultyClassSessionsId;
  }

  // ── Phase 1 Hook: Activate device session when faculty accepts ──
  if (status === "Accepted" && facultyClassSessionsId && collegeId) {
    // Non-blocking — device session failure must NOT break accept flow
    activateDeviceSessionForClass({
      calendarEventId: eventId,
      isBulk,
      facultyClassSessionsId,
      collegeId,
    }).catch((err) => {
      console.error("[handleMissionClassStatus] Device session activation failed:", err);
    });
  }

  if (status === "Cancel") {
    // ── Phase 1 Hook: Deactivate device session on cancel ──
    deactivateSessionsForEvent(eventId, reason ?? "ClassCancelledByFaculty", isBulk).catch((err) => {
      console.error("[handleMissionClassStatus] Device session deactivation failed:", err);
    });

    const { data: eventData } = await supabase
      .from(isBulk ? "bulk_calendar_events" : "calendar_event")
      .select(isBulk ? "fromDate" : "date")
      .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId)
      .single();
      
    const eventDate = isBulk ? (eventData as any)?.fromDate : (eventData as any)?.date;
    
    const { data: sections } = await supabase
      .from(isBulk ? "bulk_calendar_event_sections" : "calendar_event_section")
      .select("collegeSectionId")
      .eq(isBulk ? "bulkCalendarEventId" : "calendarEventId", eventId);

    const sectionIds = sections?.map((s) => s.collegeSectionId) || [];

    if (sectionIds.length > 0) {
      const { data: history } = await supabase
        .from("student_academic_history")
        .select("studentId")
        .in("collegeSectionsId", sectionIds)
        .eq("isCurrent", true);

      const studentIds = history?.map((h) => h.studentId) || [];

      if (studentIds.length > 0) {
        const attendanceRecords = studentIds.map((sId) => ({
          studentId: sId,
          calendarEventId: isBulk ? null : eventId,
          bulkCalendarEventId: isBulk ? eventId : null,
          status: "CLASS_CANCEL",
          reason: reason || "Cancelled by faculty",
          markedAt: eventDate,
          facultyMark: facultyId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        await supabase.from("attendance_record").upsert(attendanceRecords, {
          onConflict: isBulk ? "studentId,bulkCalendarEventId" : "studentId,calendarEventId",
        });
      }
    }
  }

  return { success: true };
}

