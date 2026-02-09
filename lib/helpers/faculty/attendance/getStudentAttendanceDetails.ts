"use server";

import { createClient } from "@/app/utils/supabase/server";

const safeGet = (data: any) => {
  if (!data) return null;
  return Array.isArray(data) ? data[0] : data;
};

export async function getStudentAttendanceDetails(studentIdStr: string) {
  const supabase = await createClient();
  const studentId = parseInt(studentIdStr);

  if (isNaN(studentId)) return null;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      `
      studentId,
      user:users (fullName, email, mobile, gender), 
      education:college_education (collegeEducationType), 
      branch:college_branch (collegeBranchCode) 
    `,
    )
    .eq("studentId", studentId)
    .single();

  if (studentError || !student) {
    console.error("❌ Student Fetch Error:", studentError);
    return null;
  }

  const { data: history, error: historyError } = await supabase
    .from("student_academic_history")
    .select(
      `
       section:college_sections (collegeSections),
       year:college_academic_year (collegeAcademicYear)
    `,
    )
    .eq("studentId", studentId)
    .eq("isCurrent", true)
    .single();

  const user = safeGet(student.user) || {};
  const branch = safeGet(student.branch) || {};
  const education = safeGet(student.education) || {};

  const section = safeGet(history?.section) || {};
  const yearData = safeGet(history?.year) || {};

  const { data: records, error: attendanceError } = await supabase
    .from("attendance_record")
    .select(
      `
      status,
      event:calendar_event (
        subject,
        college_subjects (subjectName, subjectCode)
      )
    `,
    )
    .eq("studentId", studentId);

  const subjectMap = new Map<
    number,
    {
      name: string;
      code: string;
      total: number;
      present: number;
      absent: number;
      leave: number;
    }
  >();

  let totalClasses = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLeave = 0;

  records?.forEach((r: any) => {
    const event = safeGet(r.event);
    if (!event) return;

    const subjId = event.subject;
    const subjectData = safeGet(event.college_subjects);

    const subjName = subjectData?.subjectName || "Unknown Subject";
    const subjCode = subjectData?.subjectCode || "N/A";

    if (!subjId) return;

    if (!subjectMap.has(subjId)) {
      subjectMap.set(subjId, {
        name: subjName,
        code: subjCode,
        total: 0,
        present: 0,
        absent: 0,
        leave: 0,
      });
    }

    const stats = subjectMap.get(subjId)!;

    if (["CLASS_CANCEL", "CANCELLED", "CANCEL_CLASS"].includes(r.status)) {
      return;
    }

    stats.total++;
    totalClasses++;

    if (r.status === "PRESENT" || r.status === "LATE") {
      stats.present++;
      totalPresent++;
    } else if (r.status === "LEAVE") {
      stats.leave++;
      totalLeave++;
    } else {
      stats.absent++;
      totalAbsent++;
    }
  });

  const subjectAttendance = Array.from(subjectMap.values()).map((s) => ({
    subjectName: s.name,
    subjectCode: s.code,
    total: s.total,
    present: s.present,
    absent: s.absent,
    leave: s.leave,
    percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
  }));

  return {
    fullName: user.fullName || "Unknown",
    studentsId: student.studentId,
    department: branch.collegeBranchCode || "N/A",
    year: yearData.collegeAcademicYear || "N/A",
    section: section.collegeSections || "N/A",
    degree: education.collegeEducationType || "N/A",
    mobile: user.mobile || "N/A",
    email: user.email || "N/A",
    address: "Not Available",
    photo: user.gender === "Female" ? "/student-f.png" : "/maleuser.png",

    attendanceDays: totalPresent,
    absentDays: totalAbsent,
    leaveDays: totalLeave,

    subjectAttendance,
  };
}
