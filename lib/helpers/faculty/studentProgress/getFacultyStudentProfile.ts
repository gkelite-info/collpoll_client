import { supabase } from "@/lib/supabaseClient";
import { getBaseStudentHistory } from "./getBaseStudentHistory";
import {
  FacultyStudentProgressDetailsScope,
  ParentInfo,
  formatDate,
  getFirst,
  isAttendedStatus,
  isCancelledStatus,
  isConductedStatus,
  getParentRelation,
  UserProfileRow,
  ParentRow,
  AttendanceRecordRow
} from "./sharedProgressTypes";

export type FacultyStudentProfile = {
  departmentLabel: string;
  yearLabel: string;
  sectionLabel: string;
  semesterLabel: string;
  studentProfile: {
    name: string;
    department: string;
    studentId: string;
    phone: string;
    email: string;
    address: string;
    photo: string;
    attendanceDays: number;
    absentDays: number;
    leaveDays: number;
  };
  parents: ParentInfo[];
  attendancePercentage: number;
};

export async function getFacultyStudentProfile(
  scope: FacultyStudentProgressDetailsScope,
): Promise<FacultyStudentProfile | null> {
  const baseData = await getBaseStudentHistory(scope);
  if (!baseData) return null;

  const { pinRow, studentRow, historyRow, user } = baseData;
  const today = formatDate(new Date());

  const [
    userProfileResult,
    parentsResult,
    attendanceResult
  ] = await Promise.all([
    supabase
      .from("user_profile")
      .select("userId, profileUrl")
      .eq("userId", studentRow.userId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .maybeSingle<UserProfileRow>(),
    supabase
      .from("parents")
      .select(`
        parentId,
        userId,
        user:userId (
          fullName,
          gender
        )
      `)
      .eq("studentId", studentRow.studentId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .returns<ParentRow[]>(),
    supabase
      .from("attendance_record")
      .select(`
        status,
        calendar_event:calendar_event (
          subject,
          facultyId,
          type,
          date,
          is_deleted
        ),
        bulk_event:bulk_calendar_events (
          subject,
          facultyId,
          type,
          fromDate,
          is_deleted
        )
      `)
      .eq("studentId", studentRow.studentId)
      .is("deletedAt", null)
      .lte("markedAt", today)
      .returns<AttendanceRecordRow[]>()
  ]);

  if (userProfileResult.error) throw userProfileResult.error;
  if (parentsResult.error) throw parentsResult.error;
  if (attendanceResult.error) throw attendanceResult.error;

  const parentUserIds = (parentsResult.data ?? []).map((parent) => parent.userId);

  let parentProfilesResult = { data: [], error: null };
  if (parentUserIds.length) {
    const res = await supabase
      .from("user_profile")
      .select("userId, profileUrl")
      .in("userId", parentUserIds)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .returns<UserProfileRow[]>();
    if (res.error) throw res.error;
    parentProfilesResult = res as any;
  }

  const studentProfileUrl = userProfileResult.data?.profileUrl ?? null;
  const parentProfilesByUserId = new Map(
    ((parentProfilesResult.data ?? []) as UserProfileRow[]).map((profile) => [
      profile.userId,
      profile.profileUrl,
    ]),
  );

  const relevantAttendance = ((attendanceResult.data ?? []) as AttendanceRecordRow[]).filter(
    (record) => {
      const singleEvent = Array.isArray(record.calendar_event)
        ? record.calendar_event[0]
        : record.calendar_event;
      const bulkEvent = Array.isArray(record.bulk_event)
        ? record.bulk_event[0]
        : record.bulk_event;
        
      const event = singleEvent || bulkEvent;
      const eventDate = singleEvent ? singleEvent.date : bulkEvent?.fromDate;

      return (
        !!event &&
        event.facultyId === scope.facultyId &&
        !!event.subject &&
        scope.subjectIds.includes(event.subject) &&
        event.type === "class" &&
        event.is_deleted === false &&
        !!eventDate &&
        eventDate <= today &&
        !isCancelledStatus(record.status) &&
        isConductedStatus(record.status)
      );
    },
  );

  let attendanceDays = 0;
  let absentDays = 0;
  let leaveDays = 0;

  for (const record of relevantAttendance) {
    if (isAttendedStatus(record.status)) {
      attendanceDays += 1;
    } else if (record.status === "LEAVE") {
      leaveDays += 1;
    } else {
      absentDays += 1;
    }
  }

  const attendancePercentage =
    attendanceDays + absentDays + leaveDays === 0
      ? 0
      : Math.round(
          (attendanceDays / (attendanceDays + absentDays + leaveDays)) * 100,
        );

  const parents: ParentInfo[] = ((parentsResult.data ?? []) as ParentRow[]).map(
    (parent, index) => {
      const parentUser = getFirst(parent.user);
      return {
        name: parentUser?.fullName ?? `Parent ${index + 1}`,
        relation: getParentRelation(parentUser?.gender, index),
        avatar:
          parentProfilesByUserId.get(parent.userId) ||
          (parentUser?.gender?.toLowerCase() === "female"
            ? "/student-f.png"
            : "/maleuser.png"),
      };
    },
  );

  return {
    departmentLabel: scope.departmentLabel ?? "N/A",
    yearLabel: getFirst(historyRow.college_academic_year)?.collegeAcademicYear ?? "N/A",
    sectionLabel: getFirst(historyRow.college_sections)?.collegeSections ?? "N/A",
    semesterLabel:
      getFirst(historyRow.college_semester)?.collegeSemester !== null &&
      getFirst(historyRow.college_semester)?.collegeSemester !== undefined
        ? String(getFirst(historyRow.college_semester)?.collegeSemester)
        : "N/A",
    studentProfile: {
      name: user?.fullName ?? "Unknown Student",
      department: scope.isSchool
        ? getFirst(historyRow.college_academic_year)?.collegeAcademicYear ?? "N/A"
        : scope.departmentLabel ?? "N/A",
      studentId: pinRow.pinNumber,
      phone: user?.mobile ?? "N/A",
      email: user?.email ?? "N/A",
      address: "Not Available",
      photo:
        studentProfileUrl ||
        (user?.gender?.toLowerCase() === "female" ? "/student-f.png" : "/maleuser.png"),
      attendanceDays,
      absentDays,
      leaveDays,
    },
    parents,
    attendancePercentage,
  };
}
