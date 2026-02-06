"use server";

import { createClient } from "@/app/utils/supabase/server";

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

export async function getStudentsForClass(
  classId: string,
): Promise<UIStudent[]> {
  const supabase = await createClient();

  // 1. Get Section IDs & Subject ID for this Class
  const { data: eventData } = await supabase
    .from("calendar_event")
    .select(
      `
       subject,
       calendar_event_section (collegeSectionId)
    `,
    )
    .eq("calendarEventId", classId)
    .single();

  const subjectId = eventData?.subject;
  const sectionIds =
    eventData?.calendar_event_section?.map((s: any) => s.collegeSectionId) ||
    [];

  if (sectionIds.length === 0) return [];

  // 2. Get Student IDs
  const { data: history } = await supabase
    .from("student_academic_history")
    .select("studentId")
    .in("collegeSectionsId", sectionIds)
    .eq("isCurrent", true);

  const ids = history?.map((h) => h.studentId) || [];
  if (ids.length === 0) return [];

  // 3. FETCH ATTENDANCE HISTORY FOR PERCENTAGE CALCULATION
  const statsMap = new Map<number, { present: number; total: number }>();

  if (subjectId) {
    const { data: allRecords } = await supabase
      .from("attendance_record")
      .select(
        `
        studentId,
        status,
        event:calendar_event!inner(subject)
      `,
      )
      .in("studentId", ids)
      .eq("event.subject", subjectId);

    allRecords?.forEach((r: any) => {
      const sid = r.studentId;
      if (!statsMap.has(sid)) statsMap.set(sid, { present: 0, total: 0 });

      const stats = statsMap.get(sid)!;

      if (["PRESENT", "ABSENT", "LEAVE", "LATE"].includes(r.status)) {
        stats.total++;
        if (r.status === "PRESENT") stats.present++;
      }
    });
  }

  // 4. Fetch Students & Current Class Status
  const { data: students, error } = await supabase
    .from("students")
    .select(
      `
      studentId, 
      user:users (fullName, gender), 
      attendance_record (
         status,
         reason,
         calendarEventId
      )
    `,
    )
    .in("studentId", ids)
    .eq("attendance_record.calendarEventId", classId)
    .order("studentId");

  if (error) {
    console.error("❌ Error fetching students:", error);
    return [];
  }

  // 5. Map to UI
  return students!.map((s: any) => {
    const record = s.attendance_record?.[0];

    // Status Logic
    let status = "Not Marked";
    let reason = "";

    if (record) {
      // FIX: Map DB Enum (UPPERCASE) to UI State (Title Case)
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

    const userGender = s.user?.gender || "Male";

    const stats = statsMap.get(s.studentId) || { present: 0, total: 0 };
    const percentageVal =
      stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    return {
      id: String(s.studentId),
      name: s.user?.fullName || `Student ${s.studentId}`,
      roll: s.studentId,
      photo: userGender === "Female" ? "/student-f.png" : "/maleuser.png",
      percentage: percentageVal.toString(),
      attendance: status as any,
      reason: reason,
    };
  });
}

export async function saveAttendance(
  classId: string,
  payload: { studentId: string; status: string; reason: string }[],
) {
  const supabase = await createClient();

  const { data: eventData } = await supabase
    .from("calendar_event")
    .select("date")
    .eq("calendarEventId", classId)
    .single();

  const classDate = eventData?.date;

  const validPayload = payload.filter((p) => p.status !== "Not Marked");

  const dbRecords = validPayload.map((p) => {
    let dbStatus = "PRESENT";
    switch (p.status) {
      case "Present":
        dbStatus = "PRESENT";
        break;
      case "Absent":
        dbStatus = "ABSENT";
        break;
      case "Leave":
        dbStatus = "LEAVE";
        break;
      case "Late":
        dbStatus = "LATE";
        break;
      case "Class Cancel":
        dbStatus = "CLASS_CANCEL";
        break;
      default:
        dbStatus = "PRESENT";
    }

    return {
      studentId: parseInt(p.studentId),
      calendarEventId: parseInt(classId),
      status: dbStatus,
      reason: p.reason || null,
      markedAt: classDate,
      updatedAt: new Date().toISOString(),
    };
  });

  const { error } = await supabase
    .from("attendance_record")
    .upsert(dbRecords, { onConflict: "studentId,calendarEventId" });

  if (error) {
    console.error("❌ Save Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getAllStudents(): Promise<UIStudent[]> {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select(`studentId, user:users(fullName, gender)`)
    .limit(50);

  return (students || []).map((s: any) => ({
    id: String(s.studentId),
    name: s.user?.fullName || `Student ${s.studentId}`,
    roll: s.studentId,
    photo: s.user?.gender === "Female" ? "/student-f.png" : "/maleuser.png",
    percentage: "--",
    attendance: "Not Marked",
    reason: "",
  }));
}
