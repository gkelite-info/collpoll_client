import { supabase } from "@/lib/supabaseClient";

type SemesterFinanceFilters = {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
};

export type PaymentStatus = "Pending" | "Paid" | "Partial";

export type SemesterStudent = {
  studentId: number;
  fullName: string;
  branch: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  lastPaymentDate: string | null;
};

export async function getSemesterFinanceSummary(
  filters: SemesterFinanceFilters,
  page: number,
  limit: number,
  searchQuery?: string,
) {
  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,
  } = filters;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let matchingUserIds: number[] = [];
  if (searchQuery) {
    const { data: usersMatch } = await supabase
      .from("users")
      .select("userId")
      .ilike("fullName", `%${searchQuery}%`);
    if (usersMatch) {
      matchingUserIds = usersMatch.map((u) => u.userId);
    }
  }

  let studentQuery = supabase
    .from("students")
    .select(
      `
    studentId,
    userId,
    users!students_userId_fkey(fullName),
    college_branch(collegeBranchCode),
    student_academic_history!inner(
      collegeAcademicYearId,
      collegeSemesterId,
      deletedAt
    )
  `,
      { count: "exact" },
    )
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("student_academic_history.collegeAcademicYearId", collegeAcademicYearId)
    .eq("student_academic_history.collegeSemesterId", collegeSemesterId)
    .is("student_academic_history.deletedAt", null);

  /* 🟢 DB-LEVEL SEARCH FILTER INJECTION */
  if (searchQuery) {
    const isNumeric = /^\d+$/.test(searchQuery);
    if (isNumeric) {
      // Search by Exact StudentID OR matched FullName
      const userIdsStr =
        matchingUserIds.length > 0 ? matchingUserIds.join(",") : "0";
      studentQuery = studentQuery.or(
        `studentId.eq.${searchQuery},userId.in.(${userIdsStr})`,
      );
    } else {
      // Search ONLY by matching FullName
      if (matchingUserIds.length > 0) {
        studentQuery = studentQuery.in("userId", matchingUserIds);
      } else {
        // Force empty result gracefully if no name matched
        studentQuery = studentQuery.in("userId", [0]);
      }
    }
  }

  const {
    data: students,
    error: studentError,
    count,
  } = await studentQuery.range(from, to);

  if (studentError) {
    return null;
  }

  if (!students?.length) return emptyResponse(count ?? 0);

  const studentIds = students.map((s) => s.studentId);

  /* 2) Obligations for those students */
  let obligationQuery = supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId, studentId, totalAmount")
    .in("studentId", studentIds)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("isActive", true)
    .is("deletedAt", null);

  const { data: obligations, error: obligationError } = await obligationQuery;

  if (obligationError) {
    return null;
  }

  if (!obligations?.length) return emptyResponse(count ?? 0);

  const obligationStudentIds = new Set(
    obligations.map((o: any) => o.studentId),
  );

  const filteredStudents = students.filter((student: any) =>
    obligationStudentIds.has(student.studentId),
  );

  const obligationIds = obligations.map((o) => o.studentFeeObligationId);

  /* 3) Success Transactions for these obligations */
  const { data: transactions, error: txnError } = await supabase
    .from("student_payment_transaction")
    .select("studentPaymentTransactionId, studentFeeObligationId")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (txnError) {
    return null;
  }

  if (!transactions?.length) {
    return buildFromNoPayments(students, obligations, count ?? 0);
  }

  const transactionIds = transactions.map((t) => t.studentPaymentTransactionId);

  /* 4) Collections (semester-scoped) */
  const { data: collections, error: collError } = await supabase
    .from("student_fee_collection")
    .select(
      "collectedAmount, collegeSemesterId, studentPaymentTransactionId, createdAt",
    )
    .in("studentPaymentTransactionId", transactionIds)
    .eq("collegeSemesterId", collegeSemesterId);

  const semesterTransactionIds = new Set(
    (collections || []).map((c: any) => c.studentPaymentTransactionId),
  );

  if (collError) {
    console.error("❌ Collection Fetch Error:", collError);
    return null;
  }

  const { data: ledgers, error: ledgerError } = await supabase
    .from("student_fee_ledger")
    .select(
      `
    amount,
    studentFeeObligationId,
    studentPaymentTransactionId,
    createdAt
  `,
    )
    .in("studentPaymentTransactionId", Array.from(semesterTransactionIds));

  if (ledgerError) {
    console.error("Ledger Fetch Error:", ledgerError);
    return null;
  }

  /* 5) Paid map per obligation using collections (semester-wise) */
  const txnToObligation = new Map<number, number>();
  transactions.forEach((t: any) => {
    txnToObligation.set(
      t.studentPaymentTransactionId,
      t.studentFeeObligationId,
    );
  });

  const paidMap = new Map<number, number>();
  const lastPayMap = new Map<number, string>();

  (ledgers || []).forEach((l: any) => {
    const obligationId = l.studentFeeObligationId;
    const amt = Number(l.amount) || 0;

    paidMap.set(obligationId, (paidMap.get(obligationId) || 0) + amt);

    const prev = lastPayMap.get(obligationId);
    if (!prev || new Date(l.createdAt) > new Date(prev)) {
      lastPayMap.set(obligationId, l.createdAt);
    }
  });

  /* 6) Build response */
  let expected = 0;
  let collected = 0;
  let pending = 0;
  let paidStudents = 0;
  let pendingStudents = 0;

  const result = filteredStudents.map((student: any) => {
    const obligation = obligations.find(
      (o: any) => o.studentId === student.studentId,
    );

    const totalAmount = Number(obligation?.totalAmount) || 0;
    const paidAmount = obligation
      ? paidMap.get(obligation.studentFeeObligationId) || 0
      : 0;

    const balance = totalAmount - paidAmount;

    const status: PaymentStatus =
      paidAmount === 0 ? "Pending" : balance === 0 ? "Paid" : "Partial";

    expected += totalAmount;
    collected += paidAmount;
    pending += Math.max(balance, 0);

    if (status === "Paid") paidStudents++;
    else pendingStudents++;

    return {
      studentId: student.studentId,
      fullName: student.users?.fullName || "N/A",
      branch: student.college_branch?.collegeBranchCode || "N/A",
      totalAmount,
      paidAmount,
      balanceAmount: balance,
      paymentStatus: status,
      lastPaymentDate: obligation
        ? lastPayMap.get(obligation.studentFeeObligationId) || null
        : null,
    };
  });

  return {
    students: result,
    summary: {
      totalStudents: count ?? 0,
      expected,
      collected,
      pending,
      paidStudents,
      pendingStudents,
    },
    totalCount: count ?? 0,
    currentPageCount: result.length,
  };
}

function emptyResponse(count: number = 0) {
  return {
    students: [],
    summary: {
      totalStudents: count,
      expected: 0,
      collected: 0,
      pending: 0,
      paidStudents: 0,
      pendingStudents: 0,
    },
    totalCount: count,
    currentPageCount: 0,
  };
}

function buildFromNoPayments(
  students: any[],
  obligations: any[],
  count: number = 0,
) {
  let expected = 0;

  const obligationStudentIds = new Set(
    obligations.map((o: any) => o.studentId),
  );

  const filteredStudents = students.filter((student: any) =>
    obligationStudentIds.has(student.studentId),
  );

  const result = filteredStudents.map((student: any) => {
    const obligation = obligations.find(
      (o: any) => o.studentId === student.studentId,
    );
    const totalAmount = Number(obligation?.totalAmount) || 0;
    expected += totalAmount;

    return {
      studentId: student.studentId,
      fullName: student.users?.fullName || "N/A",
      branch: student.college_branch?.collegeBranchCode || "N/A",
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      paymentStatus: "Pending" as PaymentStatus,
      lastPaymentDate: null,
    };
  });

  return {
    students: result,
    summary: {
      totalStudents: count ?? 0,
      expected,
      collected: 0,
      pending: expected,
      paidStudents: 0,
      pendingStudents: result.length,
    },
    totalCount: count ?? 0,
    currentPageCount: result.length,
  };
}
