import { supabase } from "@/lib/supabaseClient";

export type TotalStudentsStatus = "Paid" | "Pending" | "Partial" | "Not Assigned";

export type TotalStudentsFilters = {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number | null;
  collegeAcademicYearId?: number | null;
  collegeSemesterId?: number | null;
  status?: TotalStudentsStatus | null;
};

export type TotalStudentsSummary = {
  totalStudents: number;
  fullyPaidStudents: number;
  partiallyPaidStudents: number;
  pendingStudents: number;
};

export type TotalStudentsRow = {
  studentId: number;
  studentName: string;
  rollNo: string;
  educationType: string;
  branch: string;
  year: string;
  semester: string;
  paid: number;
  pending: number;
  status: TotalStudentsStatus;
};

type StudentPinRow = {
  pinNumber?: string | null;
};

type StudentUserRow = {
  fullName?: string | null;
};

type AcademicHistoryRow = {
  isCurrent?: boolean | null;
  collegeAcademicYearId?: number | null;
  collegeSemesterId?: number | null;
  college_academic_year?: { collegeAcademicYear?: string | null } | null;
  college_semester?: { collegeSemester?: number | null } | null;
};

type StudentRow = {
  studentId: number;
  collegeEducationId: number;
  users?: StudentUserRow | StudentUserRow[] | null;
  student_pins?: StudentPinRow | StudentPinRow[] | null;
  college_education?: { collegeEducationType?: string | null } | null;
  college_branch?: { collegeBranchCode?: string | null; collegeBranchType?: string | null } | null;
  student_academic_history?: AcademicHistoryRow | AcademicHistoryRow[] | null;
};

type FeeCollectionRow = {
  collectedAmount?: number | string | null;
};

type FeeObligationRow = {
  studentId: number;
  collegeAcademicYearId: number;
  totalAmount?: number | string | null;
  student_fee_collection?: FeeCollectionRow[] | null;
};

const getFirst = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const getCurrentHistory = (student: StudentRow): AcademicHistoryRow | null => {
  const histories = student.student_academic_history;
  if (Array.isArray(histories)) {
    return histories.find((history) => history.isCurrent) ?? histories[0] ?? null;
  }
  return histories ?? null;
};

const sumCollections = (collections: FeeCollectionRow[] | null | undefined) =>
  (collections ?? []).reduce(
    (sum, collection) => sum + Number(collection.collectedAmount ?? 0),
    0,
  );

async function fetchStudents(filters: TotalStudentsFilters, search?: string) {
  let query = supabase
    .from("students")
    .select(
      `
      studentId,
      collegeEducationId,
      users!inner (
        fullName,
        role,
        collegeId,
        isActive,
        is_deleted,
        deletedAt
      ),
      student_pins ( pinNumber ),
      college_education:collegeEducationId ( collegeEducationType ),
      college_branch:collegeBranchId ( collegeBranchCode, collegeBranchType ),
      student_academic_history!inner (
        isCurrent,
        collegeAcademicYearId,
        collegeSemesterId,
        college_academic_year ( collegeAcademicYear ),
        college_semester ( collegeSemester )
      )
    `,
    )
    .eq("collegeId", filters.collegeId)
    .eq("collegeEducationId", filters.collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("users.role", "Student")
    .eq("users.collegeId", filters.collegeId)
    .eq("users.isActive", true)
    .eq("users.is_deleted", false)
    .is("users.deletedAt", null)
    .eq("student_academic_history.isCurrent", true);

  if (filters.collegeBranchId) {
    query = query.eq("collegeBranchId", filters.collegeBranchId);
  }

  if (filters.collegeAcademicYearId) {
    query = query.eq(
      "student_academic_history.collegeAcademicYearId",
      filters.collegeAcademicYearId,
    );
  }

  if (filters.collegeSemesterId) {
    query = query.eq(
      "student_academic_history.collegeSemesterId",
      filters.collegeSemesterId,
    );
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const [{ data: userMatches }, { data: pinMatches }] = await Promise.all([
      supabase
        .from("users")
        .select("userId")
        .eq("collegeId", filters.collegeId)
        .eq("role", "Student")
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .ilike("fullName", `%${trimmedSearch}%`),
      supabase
        .from("student_pins")
        .select("studentId")
        .eq("isActive", true)
        .is("deletedAt", null)
        .ilike("pinNumber", `%${trimmedSearch}%`),
    ]);

    const userIds = (userMatches ?? []).map((user) => user.userId);
    const studentIds = (pinMatches ?? []).map((pin) => pin.studentId);

    query = query.or(
      `userId.in.(${userIds.length ? userIds.join(",") : "0"}),studentId.in.(${studentIds.length ? studentIds.join(",") : "0"})`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StudentRow[];
}

async function fetchObligations(
  filters: TotalStudentsFilters,
  studentIds: number[],
) {
  if (studentIds.length === 0) return [];

  let query = supabase
    .from("student_fee_obligation")
    .select(
      `
      studentId,
      collegeAcademicYearId,
      totalAmount,
      student_fee_collection ( collectedAmount )
    `,
    )
    .eq("collegeEducationId", filters.collegeEducationId)
    .in("studentId", studentIds)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (filters.collegeBranchId) {
    query = query.eq("collegeBranchId", filters.collegeBranchId);
  }

  if (filters.collegeAcademicYearId) {
    query = query.eq("collegeAcademicYearId", filters.collegeAcademicYearId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FeeObligationRow[];
}

function buildRows(
  students: StudentRow[],
  obligations: FeeObligationRow[],
): TotalStudentsRow[] {
  const obligationMap = new Map<string, FeeObligationRow>();
  obligations.forEach((obligation) => {
    obligationMap.set(
      `${obligation.studentId}-${obligation.collegeAcademicYearId}`,
      obligation,
    );
  });

  return students.map((student) => {
    const history = getCurrentHistory(student);
    const user = getFirst(student.users);
    const pin = getFirst(student.student_pins);
    const academicYear = getFirst(history?.college_academic_year);
    const semester = getFirst(history?.college_semester);
    const obligation = obligationMap.get(
      `${student.studentId}-${history?.collegeAcademicYearId ?? ""}`,
    );
    const totalFee = Number(obligation?.totalAmount ?? 0);
    const paid = sumCollections(obligation?.student_fee_collection);
    const pending = Math.max(totalFee - paid, 0);
    const status: TotalStudentsStatus =
      totalFee <= 0
        ? "Not Assigned"
        : pending <= 0
          ? "Paid"
          : paid > 0
            ? "Partial"
            : "Pending";

    return {
      studentId: student.studentId,
      studentName: user?.fullName?.trim() || "Unknown Student",
      rollNo: pin?.pinNumber ?? String(student.studentId),
      educationType: student.college_education?.collegeEducationType ?? "",
      branch:
        student.college_branch?.collegeBranchCode ||
        student.college_branch?.collegeBranchType ||
        "",
      year: academicYear?.collegeAcademicYear ?? "N/A",
      semester: semester?.collegeSemester
        ? `Sem ${semester.collegeSemester}`
        : "N/A",
      paid,
      pending,
      status,
    };
  });
}

export async function fetchTotalStudentsOverview(
  filters: TotalStudentsFilters,
  search?: string,
) {
  const students = await fetchStudents(filters, search);
  const studentIds = students.map((student) => student.studentId);
  const obligations = await fetchObligations(filters, studentIds);
  const rows = buildRows(students, obligations);
  const filteredRows = filters.status
    ? rows.filter((row) => row.status === filters.status)
    : rows;

  return {
    rows: filteredRows,
  };
}

export async function fetchTotalStudentsSummary(filters: TotalStudentsFilters) {
  const students = await fetchStudents({
    collegeId: filters.collegeId,
    collegeEducationId: filters.collegeEducationId,
  });
  const studentIds = students.map((student) => student.studentId);
  const obligations = await fetchObligations(
    {
      collegeId: filters.collegeId,
      collegeEducationId: filters.collegeEducationId,
    },
    studentIds,
  );
  const rows = buildRows(students, obligations);

  return {
    totalStudents: rows.length,
    fullyPaidStudents: rows.filter((row) => row.status === "Paid").length,
    partiallyPaidStudents: rows.filter((row) => row.status === "Partial").length,
    pendingStudents: rows.filter((row) => row.status === "Pending").length,
  };
}
