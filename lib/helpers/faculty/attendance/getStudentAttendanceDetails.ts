"use server";

import { createClient } from "@/app/utils/supabase/server";

const safeGet = (
  data: any,
  key: string | null = null,
  fallback: any = "N/A",
) => {
  if (!data) return fallback;
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return fallback;
  return key ? (item[key] ?? fallback) : item;
};

export async function getStudentAttendanceDetails(studentIdStr: string) {
  const supabase = await createClient();
  const studentId = parseInt(studentIdStr);

  if (isNaN(studentId)) return null;

  const { data: rawStudent, error } = await supabase
    .from("students")
    .select(
      `
      studentId,
      userId,
      collegeId,
      user:users (
        fullName,
        email,
        mobile,
        gender
      ),
      branch:college_branch (collegeBranchType),
      degree:college_education (collegeEducationType),
      academic:student_academic_history (
        isCurrent,
        section:college_sections(collegeSections),
        year:college_academic_year(collegeAcademicYear)
      )
    `,
    )
    .eq("studentId", studentId)
    .eq("academic.isCurrent", true)
    .single();

  if (error || !rawStudent) {
    console.error("Profile Fetch Error:", error);
    return null;
  }

  // 2. Fetch Attendance Records
  const { data: records, error: attendanceError } = await supabase
    .from("attendance_record")
    .select(
      `
      status,
      event:calendar_event (
        subject:college_subjects (
           subjectName,
           subjectCode
        )
      )
    `,
    )
    .eq("studentId", studentId);

  if (attendanceError) {
    console.error("Attendance Fetch Error:", attendanceError);
    return null;
  }

  let present = 0;
  let absent = 0;
  let leave = 0;

  const subjectMap = new Map<
    string,
    { name: string; code: string; present: number; total: number }
  >();

  records?.forEach((r: any) => {
    if (r.status === "PRESENT") present++;
    if (r.status === "ABSENT") absent++;
    if (r.status === "LEAVE") leave++;

    if (["PRESENT", "ABSENT", "LEAVE", "LATE"].includes(r.status)) {
      const event = safeGet(r.event);
      const subj = safeGet(event?.subject);

      if (subj && subj !== "N/A") {
        const key = subj.subjectCode;
        if (!subjectMap.has(key)) {
          subjectMap.set(key, {
            name: subj.subjectName,
            code: subj.subjectCode,
            present: 0,
            total: 0,
          });
        }

        const entry = subjectMap.get(key)!;
        entry.total++;
        if (r.status === "PRESENT") entry.present++;
      }
    }
  });

  const subjectAttendance = Array.from(subjectMap.values()).map((s) => ({
    subjectName: s.name,
    subjectCode: s.code,
    present: s.present,
    total: s.total,
    percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
  }));

  const student = rawStudent as any;
  const user = safeGet(student.user);
  const branchObj = safeGet(student.branch);
  const degreeObj = safeGet(student.degree);

  const academic = safeGet(student.academic);
  const sectionObj = safeGet(academic.section);
  const yearObj = safeGet(academic.year);

  return {
    studentsId: student.studentId,
    fullName: user.fullName || "Unknown",
    email: user.email || "N/A",
    mobile: user.mobile || "N/A",
    address: "N/A",
    photo: user.gender === "Female" ? "/student-f.png" : "/maleuser.png",

    department: branchObj.collegeBranchType || "General",
    year: parseInt(yearObj.collegeAcademicYear) || 1,
    section: sectionObj.collegeSections || "N/A",
    degree: degreeObj.collegeEducationType || "Degree",

    attendanceDays: present,
    absentDays: absent,
    leaveDays: leave,
    subjectAttendance: subjectAttendance,
  };
}
