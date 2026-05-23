import { supabase } from "@/lib/supabaseClient";

export type PendingFeeFilters = {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number | null;
  collegeAcademicYearId?: number | null;
  collegeSemesterId?: number | null;
  createdYear?: string | null;
};

export type PendingFeeTableRow = {
  studentId: number;
  userId: number;
  collegeAcademicYearId: number | null;
  collegeSemesterId: number | null;
  studentName: string;
  studentIdentifier: string;
  year: string;
  semester: string;
  totalFee: number;
  paid: number;
  pending: number;
};

export type PendingFeeBreakdownRow = {
  id: number;
  label: string;
  collected: number;
  pending: number;
  totalFee: number;
};

type AcademicHistoryRow = {
  isCurrent?: boolean | null;
  collegeAcademicYearId?: number | null;
  collegeSemesterId?: number | null;
  college_academic_year?: { collegeAcademicYear?: string | null } | null;
  college_semester?: { collegeSemester?: number | null } | null;
};

type StudentPinRow = {
  pinNumber?: string | null;
};

type StudentUserRow = {
  fullName?: string | null;
};

type StudentRow = {
  studentId: number;
  userId: number;
  createdAt?: string | null;
  users?: StudentUserRow | StudentUserRow[] | null;
  student_pins?: StudentPinRow | StudentPinRow[] | null;
  student_academic_history?: AcademicHistoryRow | AcademicHistoryRow[] | null;
};

type FeeCollectionRow = {
  collectedAmount?: number | string | null;
  collegeSemesterId?: number | null;
};

type FeeObligationRow = {
  studentFeeObligationId?: number;
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

async function fetchStudents(filters: PendingFeeFilters, search?: string) {
  let query = supabase
    .from("students")
    .select(
      `
      studentId,
      userId,
      createdAt,
      users!inner (
        fullName,
        role,
        collegeId,
        isActive,
        is_deleted,
        deletedAt
      ),
      student_pins ( pinNumber ),
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

  if (filters.createdYear) {
    query = query
      .gte("createdAt", `${filters.createdYear}-01-01T00:00:00.000Z`)
      .lt("createdAt", `${Number(filters.createdYear) + 1}-01-01T00:00:00.000Z`);
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
  filters: PendingFeeFilters,
  studentIds: number[],
) {
  if (studentIds.length === 0) return [];

  let query = supabase
    .from("student_fee_obligation")
    .select(
      `
      studentFeeObligationId,
      studentId,
      collegeAcademicYearId,
      totalAmount,
      student_fee_collection (
        collectedAmount,
        collegeSemesterId
      )
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
): PendingFeeTableRow[] {
  const obligationMap = new Map<string, FeeObligationRow>();
  obligations.forEach((obligation) => {
    obligationMap.set(
      `${obligation.studentId}-${obligation.collegeAcademicYearId}`,
      obligation,
    );
  });

  return students.map((student) => {
    const history = getCurrentHistory(student);
    const obligation = obligationMap.get(
      `${student.studentId}-${history?.collegeAcademicYearId ?? ""}`,
    );
    const user = getFirst(student.users);
    const pin = getFirst(student.student_pins);
    const academicYear = getFirst(history?.college_academic_year);
    const semester = getFirst(history?.college_semester);
    const totalFee = Number(obligation?.totalAmount ?? 0);
    const paid = sumCollections(obligation?.student_fee_collection);

    return {
      studentId: student.studentId,
      userId: student.userId,
      collegeAcademicYearId: history?.collegeAcademicYearId ?? null,
      collegeSemesterId: history?.collegeSemesterId ?? null,
      studentName: user?.fullName ?? "Unknown Student",
      studentIdentifier: pin?.pinNumber ?? String(student.studentId),
      year: academicYear?.collegeAcademicYear ?? "N/A",
      semester: semester?.collegeSemester
        ? `Semester ${semester.collegeSemester}`
        : "N/A",
      totalFee,
      paid,
      pending: Math.max(totalFee - paid, 0),
    };
  });
}

export async function sendPendingFeeReminderNotification(payload: {
  userId: number;
  pendingAmount: number;
}) {
  const now = new Date().toISOString();
  const pendingAmount = Math.max(Number(payload.pendingAmount) || 0, 0);
  const message =
    pendingAmount > 0
      ? `Your fee payment is pending. Please clear your dues of ₹${Math.round(
          pendingAmount,
        ).toLocaleString("en-IN")} at the earliest.`
      : "Your fee payment is pending. Please clear your dues at the earliest.";

  const { error } = await supabase.from("notifications").insert({
    userId: payload.userId,
    title: "Fee Payment Reminder",
    message,
    type: "FeeReminder",
    referenceId: null,
    isRead: false,
    createdAt: now,
    updatedAt: now,
  });

  if (error) throw error;
  return { success: true };
}

export async function fetchPendingFeesOverview(
  filters: PendingFeeFilters,
  search?: string,
) {
  const students = await fetchStudents(filters, search);
  const studentIds = students.map((student) => student.studentId);
  const obligations = await fetchObligations(filters, studentIds);
  const rows = buildRows(students, obligations);

  const totalFee = rows.reduce((sum, row) => sum + row.totalFee, 0);
  const paid = rows.reduce((sum, row) => sum + row.paid, 0);
  const pending = rows.reduce((sum, row) => sum + row.pending, 0);
  const feeRows = rows.filter((row) => row.totalFee > 0);

  return {
    summary: {
      fullyPaidStudents: feeRows.filter((row) => row.pending <= 0).length,
      totalPendingAmount: pending,
      studentsWithPendingFees: feeRows.filter(
        (row) => row.paid > 0 && row.pending > 0,
      ).length,
      highPendingStudents: feeRows.filter(
        (row) => row.paid <= 0 && row.pending > 0,
      ).length,
      totalFee,
      paid,
      pending,
    },
    rows,
  };
}

export async function fetchPendingFeesBreakdowns(filters: PendingFeeFilters) {
  const yearStudents = await fetchStudents({
    collegeId: filters.collegeId,
    collegeEducationId: filters.collegeEducationId,
    collegeBranchId: filters.collegeBranchId,
    collegeAcademicYearId: filters.collegeAcademicYearId,
    createdYear: filters.createdYear,
  });
  const yearStudentIds = yearStudents.map((student) => student.studentId);
  const yearObligations = await fetchObligations(
    {
      collegeId: filters.collegeId,
      collegeEducationId: filters.collegeEducationId,
      collegeBranchId: filters.collegeBranchId,
      collegeAcademicYearId: filters.collegeAcademicYearId,
    },
    yearStudentIds,
  );
  const yearRows = buildRows(yearStudents, yearObligations);

  const semesterStudents = await fetchStudents({
    collegeId: filters.collegeId,
    collegeEducationId: filters.collegeEducationId,
    collegeBranchId: filters.collegeBranchId,
    collegeAcademicYearId: filters.collegeAcademicYearId,
    createdYear: filters.createdYear,
  });
  const semesterStudentIds = semesterStudents.map((student) => student.studentId);
  const semesterObligations = await fetchObligations(
    {
      collegeId: filters.collegeId,
      collegeEducationId: filters.collegeEducationId,
      collegeBranchId: filters.collegeBranchId,
      collegeAcademicYearId: filters.collegeAcademicYearId,
    },
    semesterStudentIds,
  );
  const semesterRows = buildRows(semesterStudents, semesterObligations);

  const yearMap = new Map<number, PendingFeeBreakdownRow>();
  const semesterMap = new Map<number, PendingFeeBreakdownRow>();

  yearRows.forEach((row) => {
    if (!row.collegeAcademicYearId) return;

    const yearEntry = yearMap.get(row.collegeAcademicYearId) ?? {
      id: row.collegeAcademicYearId,
      label: row.year,
      collected: 0,
      pending: 0,
      totalFee: 0,
    };
    yearEntry.totalFee += row.totalFee;
    yearEntry.collected += row.paid;
    yearEntry.pending += row.pending;
    yearMap.set(row.collegeAcademicYearId, yearEntry);
  });

  semesterRows.forEach((row) => {
    if (!row.collegeSemesterId) return;

    const semesterEntry = semesterMap.get(row.collegeSemesterId) ?? {
      id: row.collegeSemesterId,
      label: row.semester.replace("Semester", "Sem"),
      collected: 0,
      pending: 0,
      totalFee: 0,
    };
    semesterEntry.totalFee += row.totalFee;
    semesterEntry.collected += row.paid;
    semesterEntry.pending += row.pending;
    semesterMap.set(row.collegeSemesterId, semesterEntry);
  });

  return {
    years: Array.from(yearMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    ),
    semesters: Array.from(semesterMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    ),
  };
}

export async function fetchPendingFeeCreatedYears(filters: PendingFeeFilters) {
  const students = await fetchStudents({
    collegeId: filters.collegeId,
    collegeEducationId: filters.collegeEducationId,
    collegeBranchId: filters.collegeBranchId,
  });

  return Array.from(
    new Set(
      students
        .map((student) =>
          student.createdAt ? new Date(student.createdAt).getFullYear() : null,
        )
        .filter((year): year is number => Boolean(year)),
    ),
  )
    .sort((a, b) => b - a)
    .map(String);
}
