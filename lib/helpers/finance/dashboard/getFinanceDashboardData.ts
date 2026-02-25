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
    filters: FinanceDashboardFilters
) {
    console.log("🚀 getFinanceDashboardData called with:", filters);

    const {
        collegeId,
        collegeEducationId,
        collegeBranchId,
        // collegeAcademicYearId,
        selectedYear,
    } = filters;

    /* =========================
       1️⃣ STUDENTS
    ========================= */
    const { data: students, error: studentError } = await supabase
        .from("students")
        .select(`
    studentId,
    user:users!students_userId_fkey (
      userId,
      fullName
    ),
    branch:college_branch!students_collegeBranchId_fkey (
      collegeBranchId,
      collegeBranchCode
    )
  `)
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("status", "Active")
        .eq("isActive", true)
        .is("deletedAt", null);
    // .eq(
    //   "student_academic_history.collegeAcademicYearId",
    //   collegeAcademicYearId
    // )
    // .is("student_academic_history.deletedAt", null);

    if (studentError) {
        console.error("❌ Student Query Error:", studentError);
        return emptyDashboard();
    }

    console.log("👨‍🎓 Students Found:", students?.length || 0);

    if (!students?.length) {
        console.log("⚠️ No students matched filters");
        return emptyDashboard();
    }

    const studentIds = students.map((s) => s.studentId);
    console.log("🆔 Student IDs:", studentIds);

    /* =========================
       2️⃣ OBLIGATIONS
    ========================= */
    const { data: obligations, error: obligationError } = await supabase
        .from("student_fee_obligation")
        .select("studentFeeObligationId, studentId, totalAmount")
        .in("studentId", studentIds)
        // .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (obligationError) {
        console.error("❌ Obligation Query Error:", obligationError);
        return emptyDashboard();
    }

    console.log("📑 Obligations Found:", obligations?.length || 0);

    if (!obligations?.length) {
        console.log("⚠️ No obligations found");
        return emptyDashboard();
    }

    const obligationMap = new Map<number, any>();
    obligations.forEach((o) => obligationMap.set(o.studentId, o));

    const obligationIds = obligations.map(
        (o) => o.studentFeeObligationId
    );

    console.log("🧾 Obligation IDs:", obligationIds);

    /* =========================
       3️⃣ TRANSACTIONS
    ========================= */
    const { data: transactions, error: transactionError } = await supabase
        .from("student_payment_transaction")
        .select("studentPaymentTransactionId, studentFeeObligationId")
        .in("studentFeeObligationId", obligationIds)
        .eq("paymentStatus", "success");

    if (transactionError) {
        console.error("❌ Transaction Query Error:", transactionError);
        return emptyDashboard();
    }

    console.log("💳 Successful Transactions:", transactions?.length || 0);

    if (!transactions?.length) {
        console.log("⚠️ No successful transactions found");
        return emptyDashboard();
    }

    const transactionIds = transactions.map(
        (t) => t.studentPaymentTransactionId
    );

    console.log("🪙 Transaction IDs:", transactionIds);

    /* =========================
       4️⃣ LEDGER
    ========================= */
    const { data: ledgers, error: ledgerError } = await supabase
        .from("student_fee_ledger")
        .select(`
      amount,
      studentFeeObligationId,
      createdAt
    `)
        .in("studentPaymentTransactionId", transactionIds);

    if (ledgerError) {
        console.error("❌ Ledger Query Error:", ledgerError);
        return emptyDashboard();
    }

    console.log("📘 Ledger Entries Found:", ledgers?.length || 0);

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

    console.log("📅 Selected Calendar Year:", currentYear);

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    (ledgers || []).forEach((l) => {
        const amount = Number(l.amount) || 0;
        const created = new Date(l.createdAt);

        console.log("🧾 Ledger Entry:", {
            amount,
            createdAt: l.createdAt,
            year: created.getFullYear(),
        });

        // Overall paid
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

    /* =========================
       5️⃣ BUILD TABLE DATA
    ========================= */

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
        console.log("Student Row:", student);
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

    console.log("📊 Final Summary:", {
        totalStudents: tableData.length,
        expected,
        collected,
        pending,
        paidStudents,
        pendingStudents,
    });

    console.log("⚡ Quick Insights:", rangePaidMap);

    return {
        tableData,
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
    console.log("📭 Returning Empty Dashboard");
    return {
        tableData: [],
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