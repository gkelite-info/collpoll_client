import { supabase } from "@/lib/supabaseClient";

type FinanceDashboardFilters = {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    //   collegeAcademicYearId: number;
    selectedYear?: number;
};

export type PaymentStatus = "Pending" | "Paid" | "Partial";

export async function getFinanceDashboardData(
    filters: FinanceDashboardFilters,
    page: number,
    limit: number
) {
    const {
        collegeId,
        collegeEducationId,
        collegeBranchId,
        // collegeAcademicYearId,
        selectedYear,
    } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: students, error: studentError, count } = await supabase
        .from("students")
        .select(
            `
    studentId,
    user:users!students_userId_fkey (
      userId,
      fullName
    ),
    branch:college_branch!students_collegeBranchId_fkey (
      collegeBranchId,
      collegeBranchCode
    )
  `,
            { count: "exact" }
        )
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("status", "Active")
        .eq("isActive", true)
        .is("deletedAt", null)
        .range(from, to);
    // .eq(
    //   "student_academic_history.collegeAcademicYearId",
    //   collegeAcademicYearId
    // )
    // .is("student_academic_history.deletedAt", null);

    if (studentError) {
        return emptyDashboard();
    }

    if (!students?.length) {
        return emptyDashboard();
    }

    const studentIds = students.map((s) => s.studentId);
    const { data: obligations, error: obligationError } = await supabase
        .from("student_fee_obligation")
        .select("studentFeeObligationId, studentId, totalAmount")
        .in("studentId", studentIds)
        // .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (obligationError) {
        return emptyDashboard();
    }

    if (!obligations?.length) {
        return emptyDashboard();
    }

    const obligationMap = new Map<number, any>();
    obligations.forEach((o) => obligationMap.set(o.studentId, o));

    const obligationIds = obligations.map(
        (o) => o.studentFeeObligationId
    );
    const { data: transactions, error: transactionError } = await supabase
        .from("student_payment_transaction")
        .select("studentPaymentTransactionId, studentFeeObligationId")
        .in("studentFeeObligationId", obligationIds)
        .eq("paymentStatus", "success");

    if (transactionError) {
        return emptyDashboard();
    }

    if (!transactions?.length) {
        return emptyDashboard();
    }

    const transactionIds = transactions.map(
        (t) => t.studentPaymentTransactionId
    );
    const { data: ledgers, error: ledgerError } = await supabase
        .from("student_fee_ledger")
        .select(`
      amount,
      studentFeeObligationId,
      createdAt
    `)
        .in("studentPaymentTransactionId", transactionIds);

    if (ledgerError) {
        return emptyDashboard();
    }

    const overallPaidMap = new Map<number, number>();
    const lastPayMap = new Map<number, string>();

    const rangePaidMap = {
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
        thisYear: 0,
    };

    const today = new Date();
    const currentYear = selectedYear || today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    (ledgers || []).forEach((l) => {
        const amount = Number(l.amount) || 0;
        const created = new Date(l.createdAt);
        overallPaidMap.set(
            l.studentFeeObligationId,
            (overallPaidMap.get(l.studentFeeObligationId) || 0) + amount
        );

        const prev = lastPayMap.get(l.studentFeeObligationId);
        if (!prev || created > new Date(prev)) {
            lastPayMap.set(l.studentFeeObligationId, l.createdAt);
        }

        if (created >= startOfYear && created <= endOfYear) {
            rangePaidMap.thisYear += amount;
        }
    });

    let expected = 0;
    let collected = 0;
    let pending = 0;
    let paidStudents = 0;
    let pendingStudents = 0;

    const tableData = students.map((student) => {
        const obligation = obligationMap.get(student.studentId);

        const totalAmount = Number(obligation?.totalAmount) || 0;
        const paidAmount = obligation
            ? overallPaidMap.get(
                obligation.studentFeeObligationId
            ) || 0
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
            fullName: (student.user as any)?.fullName ?? "N/A",
            branch: (student.branch as any)?.collegeBranchCode ?? "N/A",
            totalAmount,
            paidAmount,
            balanceAmount: balance,
            paymentStatus: status,
            lastPaymentDate: obligation
                ? lastPayMap.get(
                    obligation.studentFeeObligationId
                ) || null
                : null,
        };
    });

    return {
        tableData,
         totalCount: count ?? 0,
        summary: {
            totalStudents: tableData.length,
            expected,
            collected,
            pending,
            paidStudents,
            pendingStudents,
        },
        quickInsights: rangePaidMap,
    };
}

function emptyDashboard() {
  return {
    tableData: [],
    totalCount: 0,  
    summary: {
      totalStudents: 0,
      expected: 0,
      collected: 0,
      pending: 0,
      paidStudents: 0,
      pendingStudents: 0,
    },
    quickInsights: {
      thisWeek: 0,
      lastWeek: 0,
      thisMonth: 0,
      lastMonth: 0,
      thisYear: 0,
    },
  };
}