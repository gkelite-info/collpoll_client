import { supabase } from "../../../supabaseClient";

type Filters = {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    selectedYear: string; // 2026 from URL
};

export default async function getBranchYearWiseFinanceSummaryV2(
    filters: Filters
) {
    const {
        collegeId,
        collegeEducationId,
        collegeBranchId,
        selectedYear,
    } = filters;

    /* -------------------------------------------------
       1️⃣ Get Academic Years for Branch
    --------------------------------------------------*/
    const { data: academicYears } = await supabase
        .from("college_academic_year")
        .select("collegeAcademicYearId, collegeAcademicYear")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (!academicYears?.length) {
        return emptyResponse();
    }

    const academicYearIds = academicYears.map(
        (y) => Number(y.collegeAcademicYearId)
    );

    /* -------------------------------------------------
       2️⃣ Get Students in This Branch + Education
    --------------------------------------------------*/
    const { data: students } = await supabase
        .from("students")
        .select("studentId")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("status", "Active")
        .eq("isActive", true);

    if (!students?.length) {
        console.log("⚠ No students found. Returning academic years with zero values.");

        return {
            years: academicYears.map((year) => ({
                academicYearId: year.collegeAcademicYearId,
                academicYear: year.collegeAcademicYear,
                expected: 0,
                collected: 0,
                pending: 0,
                collectionPercentage: 0,
            })),
            totalExpected: 0,
            totalCollected: 0,
            totalPending: 0,
            totalCollectionPercentage: 0,
        };
    }

    const studentIds = students.map((s) => Number(s.studentId));

    /* -------------------------------------------------
       3️⃣ Filter by Student Academic History (Year)
    --------------------------------------------------*/
    const { data: academicHistory, error } = await supabase
        .from("student_academic_history")
        .select("studentId, collegeAcademicYearId")
        .in("studentId", studentIds)
        .eq("isCurrent", true)
        .is("deletedAt", null);

    if (error) {
        console.error("❌ Academic History Error:", error);
    }

    console.log("📖 Academic History Raw:", academicHistory);

    const validStudentIds = (academicHistory || [])
        .filter((a) =>
            academicYearIds.includes(a.collegeAcademicYearId)
        )
        .map((a) => a.studentId);

    console.log("✅ Valid StudentIds:", validStudentIds);
    /* -------------------------------------------------
       4️⃣ Fetch Obligations
    --------------------------------------------------*/
    const { data: obligations } = await supabase
        .from("student_fee_obligation")
        .select(
            "studentFeeObligationId, collegeAcademicYearId, totalAmount"
        )
        .in("studentId", validStudentIds)
        .eq("collegeBranchId", collegeBranchId)
        .eq("isActive", true)
        .is("deletedAt", null);

    const obligationIds =
        obligations?.map((o) => o.studentFeeObligationId) || [];

    /* -------------------------------------------------
       5️⃣ Successful Transactions
    --------------------------------------------------*/
    const { data: transactions } = await supabase
        .from("student_payment_transaction")
        .select(
            "studentPaymentTransactionId, studentFeeObligationId"
        )
        .in("studentFeeObligationId", obligationIds)
        .eq("paymentStatus", "success");

    const transactionIds =
        transactions?.map(
            (t) => t.studentPaymentTransactionId
        ) || [];

    /* -------------------------------------------------
       6️⃣ Ledger Calculation
    --------------------------------------------------*/
    const ledgerMap = new Map<number, number>();

    if (transactionIds.length > 0) {
        const { data: ledgers } = await supabase
            .from("student_fee_ledger")
            .select(
                "studentFeeObligationId, amount"
            )
            .in("studentPaymentTransactionId", transactionIds);

        ledgers?.forEach((l: any) => {
            const existing =
                ledgerMap.get(l.studentFeeObligationId) || 0;
            ledgerMap.set(
                l.studentFeeObligationId,
                existing + Number(l.amount)
            );
        });
    }

    /* -------------------------------------------------
       7️⃣ Year Wise Aggregation
    --------------------------------------------------*/
    const yearMap = new Map<
        number,
        { expected: number; collected: number }
    >();

    obligations?.forEach((o: any) => {
        const expected = Number(o.totalAmount) || 0;
        const collected =
            ledgerMap.get(o.studentFeeObligationId) || 0;

        if (!yearMap.has(o.collegeAcademicYearId)) {
            yearMap.set(o.collegeAcademicYearId, {
                expected: 0,
                collected: 0,
            });
        }

        const entry = yearMap.get(o.collegeAcademicYearId)!;
        entry.expected += expected;
        entry.collected += collected;
    });

    /* -------------------------------------------------
       8️⃣ Final Build
    --------------------------------------------------*/
    let totalExpected = 0;
    let totalCollected = 0;

    const years = academicYears.map((year) => {
        const data = yearMap.get(
            year.collegeAcademicYearId
        );

        const expected = data?.expected || 0;
        const collected = data?.collected || 0;
        const pending = expected - collected;

        totalExpected += expected;
        totalCollected += collected;

        const collectionPercentage =
            expected === 0
                ? 0
                : Number(
                    ((collected / expected) * 100).toFixed(2)
                );

        return {
            academicYearId: year.collegeAcademicYearId,
            academicYear: year.collegeAcademicYear,
            expected,
            collected,
            pending,
            collectionPercentage,
        };
    });

    const totalPending = totalExpected - totalCollected;

    const totalCollectionPercentage =
        totalExpected === 0
            ? 0
            : Number(
                ((totalCollected / totalExpected) * 100).toFixed(2)
            );

    return {
        years,
        totalExpected,
        totalCollected,
        totalPending,
        totalCollectionPercentage,
    };
}

function emptyResponse() {
    return {
        years: [],
        totalExpected: 0,
        totalCollected: 0,
        totalPending: 0,
        totalCollectionPercentage: 0,
    };
}