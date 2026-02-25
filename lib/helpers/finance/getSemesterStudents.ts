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

export async function getSemesterFinanceSummary(filters: SemesterFinanceFilters) {
  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,
  } = filters;

  /* 1) Students in selected academicYear + semester */
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select(`
  studentId,
  users!students_userId_fkey(fullName),
 college_branch(collegeBranchCode),
  student_academic_history!inner(
    collegeAcademicYearId,
    collegeSemesterId,
    deletedAt
  )
`)
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("student_academic_history.collegeAcademicYearId", collegeAcademicYearId)
    .eq("student_academic_history.collegeSemesterId", collegeSemesterId)
    .is("student_academic_history.deletedAt", null);

  if (studentError) {
    return null;
  }

  if (!students?.length) return emptyResponse();

  const studentIds = students.map((s) => s.studentId);

  /* 2) Obligations for those students (prefer semester filter if column exists) */
  let obligationQuery = supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId, studentId, totalAmount")
    .in("studentId", studentIds)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("isActive", true)
    .is("deletedAt", null);

  // ✅ IMPORTANT: if your table has this column, keep it ON
  // obligationQuery = obligationQuery.eq("collegeSemesterId", collegeSemesterId);

  const { data: obligations, error: obligationError } = await obligationQuery;

  if (obligationError) {
    return null;
  }

  if (!obligations?.length) return emptyResponse();

  // ✅ Keep only students who exist in student_fee_obligation
  const obligationStudentIds = new Set(
    obligations.map((o: any) => o.studentId)
  );

  const filteredStudents = students.filter((student: any) =>
    obligationStudentIds.has(student.studentId)
  );

  const obligationIds = obligations.map((o) => o.studentFeeObligationId);

  /* 3) Success Transactions for these obligations (need obligationId mapping) */
  const { data: transactions, error: txnError } = await supabase
    .from("student_payment_transaction")
    .select("studentPaymentTransactionId, studentFeeObligationId")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (txnError) {
    return null;
  }

  if (!transactions?.length) {
    // No payments done yet - still return expected totals
    return buildFromNoPayments(students, obligations);
  }

  const transactionIds = transactions.map((t) => t.studentPaymentTransactionId);

  /* 4) Collections (THIS is semester-scoped) */
  const { data: collections, error: collError } = await supabase
    .from("student_fee_collection")
    .select("collectedAmount, collegeSemesterId, studentPaymentTransactionId, createdAt")
    .in("studentPaymentTransactionId", transactionIds)
    .eq("collegeSemesterId", collegeSemesterId);

  const semesterTransactionIds = new Set(
    (collections || []).map((c: any) => c.studentPaymentTransactionId)
  );

  if (collError) {
    console.error("❌ Collection Fetch Error:", collError);
    return null;
  }

  const { data: ledgers, error: ledgerError } = await supabase
    .from("student_fee_ledger")
    .select(`
    amount,
    studentFeeObligationId,
    studentPaymentTransactionId,
    createdAt
  `)
    .in("studentPaymentTransactionId", Array.from(semesterTransactionIds));

  if (ledgerError) {
    console.error("Ledger Fetch Error:", ledgerError);
    return null;
  }

  /* 5) Paid map per obligation using collections (semester-wise) */
  const txnToObligation = new Map<number, number>();
  transactions.forEach((t: any) => {
    txnToObligation.set(t.studentPaymentTransactionId, t.studentFeeObligationId);
  });

  const paidMap = new Map<number, number>(); // obligationId -> paidAmount
  const lastPayMap = new Map<number, string>(); // studentId -> last payment date

  (ledgers || []).forEach((l: any) => {
    const obligationId = l.studentFeeObligationId;
    const amt = Number(l.amount) || 0;

    paidMap.set(
      obligationId,
      (paidMap.get(obligationId) || 0) + amt
    );

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
    const obligation = obligations.find((o: any) => o.studentId === student.studentId);

    const totalAmount = Number(obligation?.totalAmount) || 0;
    const paidAmount = obligation
      ? (paidMap.get(obligation.studentFeeObligationId) || 0)
      : 0;

    const balance = totalAmount - paidAmount;

    const status: PaymentStatus =
      paidAmount === 0
        ? "Pending"
        : balance === 0
          ? "Paid"
          : "Partial";

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
      totalStudents: result.length,
      expected,
      collected,
      pending,
      paidStudents,
      pendingStudents,
    },
  };
}

function emptyResponse() {
  return {
    students: [],
    summary: {
      totalStudents: 0,
      expected: 0,
      collected: 0,
      pending: 0,
      paidStudents: 0,
      pendingStudents: 0,
    },
  };
}

function buildFromNoPayments(students: any[], obligations: any[]) {
  let expected = 0;

  const obligationStudentIds = new Set(
    obligations.map((o: any) => o.studentId)
  );

  const filteredStudents = students.filter((student: any) =>
    obligationStudentIds.has(student.studentId)
  );

  const result = filteredStudents.map((student: any) => {
    const obligation = obligations.find((o: any) => o.studentId === student.studentId);
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
      totalStudents: result.length,
      expected,
      collected: 0,
      pending: expected,
      paidStudents: 0,
      pendingStudents: result.length,
    },
  };
}