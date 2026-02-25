import { supabase } from "@/lib/supabaseClient";

type YearFinanceFilters = {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
};

export type PaymentStatus = "Pending" | "Paid" | "Partial";

export async function getYearFinanceStudentList(filters: YearFinanceFilters) {
    const {
        collegeId,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
    } = filters;

    /* 1️⃣ Students in that Academic Year */
    const { data: students } = await supabase
        .from("students")
        .select(`
      studentId,
      users!students_userId_fkey(fullName),
      college_branch(collegeBranchCode),
      student_academic_history!inner(
        collegeAcademicYearId,
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
        .is("student_academic_history.deletedAt", null);

    if (!students?.length) return emptyResponse();

    const studentIds = students.map((s) => s.studentId);

    /* 2️⃣ Obligations (Year-wise) */
    const { data: obligations } = await supabase
        .from("student_fee_obligation")
        .select("studentFeeObligationId, studentId, totalAmount")
        .in("studentId", studentIds)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (!obligations?.length) return emptyResponse();

    /* 🔥 ADD THIS FILTERING LOGIC */
    const obligationStudentIds = new Set(
        obligations.map(o => o.studentId)
    );

    const filteredStudents = students.filter(s =>
        obligationStudentIds.has(s.studentId)
    );

    const obligationIds = obligations.map(o => o.studentFeeObligationId);

    /* 3️⃣ Transactions */
    const { data: transactions } = await supabase
        .from("student_payment_transaction")
        .select("studentPaymentTransactionId, studentFeeObligationId")
        .in("studentFeeObligationId", obligationIds)
        .eq("paymentStatus", "success");

    const transactionIds = transactions?.map(t => t.studentPaymentTransactionId) || [];

    /* 4️⃣ Ledger */
    const { data: ledgers } = await supabase
        .from("student_fee_ledger")
        .select("amount, studentFeeObligationId")
        .in("studentPaymentTransactionId", transactionIds);

    const paidMap = new Map<number, number>();

    ledgers?.forEach(l => {
        paidMap.set(
            l.studentFeeObligationId,
            (paidMap.get(l.studentFeeObligationId) || 0) + Number(l.amount)
        );
    });

    /* 5️⃣ Build Result (NOW USE filteredStudents) */
    const result = filteredStudents.map(student => {
        const obligation = obligations.find(
            o => o.studentId === student.studentId
        );

        const total = Number(obligation?.totalAmount) || 0;
        const paid = obligation
            ? (paidMap.get(obligation.studentFeeObligationId) || 0)
            : 0;

        const balance = total - paid;

        const status: PaymentStatus =
            paid === 0
                ? "Pending"
                : balance === 0
                    ? "Paid"
                    : "Partial";

        return {
            studentName: Array.isArray(student.users)
                ? student.users[0]?.fullName
                : (student.users as any)?.fullName || "N/A",
            studentId: student.studentId,
            branch: Array.isArray(student.college_branch)
                ? student.college_branch[0]?.collegeBranchCode
                : (student.college_branch as any)?.collegeBranchCode || "",
            totalFee: total,
            paidAmount: paid,
            balanceAmount: balance,
            paymentStatus: status,
        };
    });

    return result;
}

function emptyResponse() {
    return [];
}