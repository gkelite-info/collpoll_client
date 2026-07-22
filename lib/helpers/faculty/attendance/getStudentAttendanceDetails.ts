"use server";

import { createClient } from "@/app/utils/supabase/server";
import {
  buildAttendancePolicyMessage,
  calculateAttendancePercentage,
} from "@/lib/helpers/attendance/attendancePolicyMessage";

const safeGet = <T,>(data: T | T[] | null | undefined): T | null => {
  if (!data) return null;
  return Array.isArray(data) ? data[0] : data;
};

type EventType = {
        subject: number | null;
        type: string | null;
        date?: string | null;
        fromDate?: string | null;
        is_deleted: boolean | null;
        college_subjects:
          | { subjectName?: string | null; subjectCode?: string | null }
          | Array<{ subjectName?: string | null; subjectCode?: string | null }>
          | null;
      };

type AttendanceRecordRow = {
  status: string;
  event: EventType | EventType[] | null;
  bulk_event: EventType | EventType[] | null;
};

type UserRow = {
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
  user_profile?: { profileUrl?: string | null } | Array<{ profileUrl?: string | null }> | null;
};

type PinRow = {
  pinNumber?: string | number | null;
};

type EducationRow = {
  collegeEducationType?: string | null;
};

type BranchRow = {
  collegeBranchCode?: string | null;
};

type SectionRow = {
  collegeSections?: string | null;
};

type YearRow = {
  collegeAcademicYear?: string | number | null;
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
      collegeId,
      collegeEducationId,
      collegeBranchId,
      student_pins (pinNumber),
      user:users (fullName, email, mobile, gender, user_profile (profileUrl)), 
      education:college_education (collegeEducationType), 
      branch:college_branch (collegeBranchCode) 
    `,
    )
    .eq("studentId", studentId)
    .single();

  if (studentError || !student) return null;

  const { data: history } = await supabase
    .from("student_academic_history")
    .select(
      `
       collegeAcademicYearId,
       collegeSemesterId,
       collegeSectionsId,
       section:college_sections (collegeSections),
       year:college_academic_year (collegeAcademicYear)
    `,
    )
    .eq("studentId", studentId)
    .eq("isCurrent", true)
    .single();

  const user: UserRow = safeGet<UserRow>(student.user) ?? {};
  const branch: BranchRow = safeGet<BranchRow>(student.branch) ?? {};
  const education: EducationRow =
    safeGet<EducationRow>(student.education) ?? {};

  const section: SectionRow = safeGet<SectionRow>(history?.section) ?? {};
  const yearData: YearRow = safeGet<YearRow>(history?.year) ?? {};

  let minAttendance: number | null = null;

  if (
    student.collegeEducationId &&
    student.collegeBranchId &&
    history?.collegeAcademicYearId &&
    history?.collegeSemesterId
  ) {
    const { data: policy, error: policyError } = await supabase
      .from("college_attendance_policies")
      .select("minAttendance")
      .eq("collegeEducationId", student.collegeEducationId)
      .eq("collegeBranchId", student.collegeBranchId)
      .eq("collegeAcademicYearId", history.collegeAcademicYearId)
      .eq("collegeSemesterId", history.collegeSemesterId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .maybeSingle();

    if (!policyError) {
      minAttendance = policy?.minAttendance ?? null;
    }
  }

  const { data: records } = await supabase
    .from("attendance_record")
    .select(
      `
      status,
      event:calendar_event (
        subject,
        type,
        date,
        is_deleted,
        college_subjects (subjectName, subjectCode)
      ),
      bulk_event:bulk_calendar_events (
        subject,
        type,
        fromDate,
        is_deleted,
        college_subjects (subjectName, subjectCode)
      )
    `,
    )
    .eq("studentId", studentId)
    .is("deletedAt", null);

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

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLeave = 0;
  const today = new Date().toISOString().slice(0, 10);

  (records as unknown as AttendanceRecordRow[] | null)?.forEach((r) => {
    const singleEvent = safeGet(r.event);
    const bulkEvent = safeGet(r.bulk_event);
    const event = singleEvent || bulkEvent;
    
    if (!event) return;
    const eventDate = singleEvent ? singleEvent.date : bulkEvent?.fromDate;
    if (event.type !== "class" || event.is_deleted !== false || !eventDate || eventDate > today) {
      return;
    }

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
    const statusUpper = r.status?.toUpperCase();

    if (statusUpper === "PRESENT" || statusUpper === "LATE") {
      stats.present++;
      totalPresent++;
    } else if (statusUpper === "LEAVE") {
      stats.leave++;
      totalLeave++;
    } else {
      stats.absent++;
      totalAbsent++;
    }
  });

  const subjectAttendance = Array.from(subjectMap.entries()).map(([id, s]) => ({
    subjectId: id,
    subjectName: s.name,
    subjectCode: s.code,
    total: s.total,
    present: s.present,
    absent: s.absent,
    leave: s.leave,
    percentage: calculateAttendancePercentage(s.present, s.total),
  }));

  const pinData: PinRow = safeGet<PinRow>(student.student_pins) ?? {};
  const profileData = safeGet<{ profileUrl?: string | null }>(
    user.user_profile,
  ) ?? {};
  const attendanceInsight = buildAttendancePolicyMessage({
    studentName: user.fullName || "This student",
    attendedClasses: totalPresent,
    totalClasses: totalPresent + totalAbsent,
    minAttendance,
  });

  return {
    fullName: user.fullName || "Unknown",
    collegeId: student.collegeId,
    collegeEducationId: student.collegeEducationId,
    collegeBranchId: student.collegeBranchId,
    collegeAcademicYearId: history?.collegeAcademicYearId ?? null,
    collegeSemesterId: history?.collegeSemesterId ?? null,
    collegeSectionsId: history?.collegeSectionsId ?? null,
    studentsId: pinData.pinNumber || student.studentId,
    department: branch.collegeBranchCode || "N/A",
    year: yearData.collegeAcademicYear || "N/A",
    section: section.collegeSections || "N/A",
    degree: education.collegeEducationType || "N/A",
    mobile: user.mobile || "N/A",
    email: user.email || "N/A",
    address: "Not Available",
    photo: profileData.profileUrl,

    attendanceDays: totalPresent,
    absentDays: totalAbsent,
    leaveDays: totalLeave,

    subjectAttendance,
    minAttendance: attendanceInsight.minAttendance,
    attendancePercentage: attendanceInsight.percentage,
    attendanceClassesNeeded: attendanceInsight.classesNeeded,
    attendancePrompt: attendanceInsight.message,
  };
}
