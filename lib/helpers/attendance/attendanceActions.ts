"use server";

import { supabase } from "@/lib/supabaseClient";

function extractNames(input: any): string[] {
  if (!input) return [];

  let parsed = input;

  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      return input.includes(",")
        ? input.split(",").map((s) => s.trim())
        : [input];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item: any) => item.name || item);
  }

  return [];
}

export async function getStudentsForClass(
  departmentRaw: any,
  yearRaw: string | number,
  sectionRaw: any,
  classId: string
) {
  const departments = extractNames(departmentRaw);
  const sections = extractNames(sectionRaw);
  const year = Number(yearRaw);

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("*")
    .in("department", departments)
    .in("section", sections)
    .eq("year", year)
    .order("fullName", { ascending: true });

  if (studentError || !students) {
    console.error("Error fetching students:", studentError);
    return [];
  }

  const { data: attendanceRecords, error: attendanceError } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("calendar_event_id", classId);

  const attendanceMap = new Map();
  if (attendanceRecords) {
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.student_id, record.status);
    });
  }

  return students.map((s) => {
    const dbStatus = attendanceMap.get(s.studentsId);

    let uiStatus: any = "Present";

    if (dbStatus === "CLASS_CANCEL") {
      uiStatus = "Class Cancelled";
    } else if (dbStatus) {
      uiStatus =
        dbStatus.charAt(0).toUpperCase() + dbStatus.slice(1).toLowerCase();
    }

    return {
      id: s.studentsId.toString(),
      roll: s.studentsId.toString(),
      name: s.fullName,
      photo: "",
      attendance: uiStatus,
      percentage: 85, // placeholder for now
      department: s.department,
    };
  });
}

export async function saveAttendance(
  classId: string,
  attendanceData: { studentId: string; status: string }[]
) {
  if (!classId) return { success: false, error: "Missing Class ID" };

  const cancelCount = attendanceData.filter(
    (r) => r.status === "Class Cancelled"
  ).length;

  const totalCount = attendanceData.length;

  if (cancelCount > 0 && cancelCount !== totalCount) {
    return {
      success: false,
      error:
        "Invalid Action: 'Class Cancelled' must apply to the entire class, not individual students.",
    };
  }

  const now = new Date().toISOString();

  const records = attendanceData.map((record) => {
    let dbStatus = record.status.toUpperCase();

    if (record.status === "Class Cancelled") {
      dbStatus = "CLASS_CANCEL";
    }

    return {
      calendar_event_id: parseInt(classId),
      student_id: parseInt(record.studentId),
      status: dbStatus,
      created_at: now,
      updated_at: now,
    };
  });

  const { data, error } = await supabase
    .from("attendance")
    .upsert(records, { onConflict: "calendar_event_id,student_id" })
    .select();

  if (error) {
    console.error("Database Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getStudentDetails(studentId: string) {
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("studentsId", studentId)
    .single();

  if (studentError || !student) return null;

  const { data: attendance } = await supabase
    .from("attendance")
    .select(
      `
      status,
      event:calendar_event_id (
        eventTitle,
        eventTopic,
        date
      )
    `
    )
    .eq("student_id", studentId);

  const records = attendance || [];

  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const leaves = records.filter((r) => r.status === "LEAVE").length;

  const subjectMap = new Map<
    string,
    { total: number; present: number; absent: number; leave: number }
  >();

  records.forEach((r: any) => {
    const subject = r.event?.eventTitle || "Unknown Subject";

    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, { total: 0, present: 0, absent: 0, leave: 0 });
    }
    const stats = subjectMap.get(subject)!;

    if (r.status === "CANCEL_CLASS") return;

    stats.total += 1;
    if (r.status === "PRESENT") stats.present += 1;
    if (r.status === "ABSENT") stats.absent += 1;
    if (r.status === "LEAVE") stats.leave += 1;
  });

  const subjectAttendance = Array.from(subjectMap.entries()).map(
    ([subject, stats]) => ({
      subject,
      totalClasses: stats.total,
      present: stats.present,
      absent: stats.absent,
      leave: stats.leave,
      percentage:
        stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    })
  );

  const parents = [
    {
      id: "p1",
      name: "Guardian",
      relation: "Parent",
      phone: student.mobile || "N/A",
      email: "parent@example.com",
    },
  ];

  return {
    ...student,
    attendanceDays: present,
    absentDays: absent,
    leaveDays: leaves,
    parents,
    subjectAttendance,
  };
}

export async function getSubjectAttendanceDetails(
  studentId: string,
  subjectName: string
) {
  const decodedSubject = decodeURIComponent(subjectName);

  const { data: allRecords, error } = await supabase
    .from("attendance")
    .select(
      `
      attendanceId: id,
      status,
      event:calendar_event_id (
        eventTitle,
        eventTopic,
        date,
        fromTime,
        toTime
      )
    `
    )
    .eq("student_id", studentId);

  if (error || !allRecords) return null;

  const subjectRecords = allRecords.filter(
    (r: any) => r.event?.eventTitle === decodedSubject
  );

  const total = subjectRecords.length;
  const present = subjectRecords.filter((r) => r.status === "PRESENT").length;
  const absent = subjectRecords.filter((r) => r.status === "ABSENT").length;
  const leaves = subjectRecords.filter((r) => r.status === "LEAVE").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const formattedRecords = subjectRecords.map((r: any) => {
    let uiStatus = "Present";
    if (r.status === "ABSENT") uiStatus = "Absent";
    if (r.status === "LEAVE") uiStatus = "Leave";
    if (r.status === "CANCEL_CLASS") uiStatus = "Class Cancelled";

    const dateObj = new Date(r.event?.date);
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      id: r.attendanceId,
      date: dateStr,
      topic: r.event?.eventTopic || "No Topic",
      time: `${formatTime(r.event?.fromTime)} - ${formatTime(r.event?.toTime)}`,
      status: uiStatus,
      action: "View",
    };
  });

  return {
    subjectName: decodedSubject,
    facultyName: "Faculty",
    summary: {
      totalClasses: total,
      attended: present,
      absent: absent,
      percentage: percentage,
    },
    records: formattedRecords,
  };
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export async function getAllStudents() {
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("fullName", { ascending: true });

  if (error || !students) {
    console.error("Error fetching all students:", error);
    return [];
  }

  return students.map((s) => ({
    id: s.studentsId.toString(),
    roll: s.studentsId.toString(),
    name: s.fullName,
    photo: "",
    attendance: "Present",
    percentage: 85, // Placeholder for now
    department: s.department,
  }));
}
