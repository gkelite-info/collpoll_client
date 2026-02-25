import { supabase } from "@/lib/supabaseClient";

export type OverallStudentsFilters = {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId?: number;
    collegeAcademicYearId?: number;
    collegeSemesterId?: number;
    status?: "Paid" | "Pending" | "Partial";
};

export async function getOverallStudentsOverview(
    filters: OverallStudentsFilters,
    page: number,
    limit: number,
    search?: string
) {
    const {
        collegeId,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        status,
    } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;


    /* --------------------------------------------------
       1️⃣ Fetch Students
    --------------------------------------------------- */
    let query = supabase
        .from("students")
        .select(
            `
      studentId,
      collegeEducationId,
      college_branch:collegeBranchId (
        collegeBranchId,
        collegeBranchCode
      ),
      users:userId (
        fullName
      ),
      student_academic_history!inner(
        collegeAcademicYearId,
        collegeSemesterId,
        isCurrent,
        college_academic_year (
          collegeAcademicYear
        ),
        college_semester (
          collegeSemester
        )
      )
    `,
            { count: "exact" } // ✅ moved here
        )

        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("status", "Active")
        .eq("isActive", true)
        .is("deletedAt", null)
        .eq("student_academic_history.isCurrent", true);

    if (collegeBranchId) {
        query = query.eq("collegeBranchId", collegeBranchId);
    }

    if (collegeAcademicYearId) {
        query = query.eq(
            "student_academic_history.collegeAcademicYearId",
            collegeAcademicYearId
        );
    }

    if (collegeSemesterId) {
        query = query.eq(
            "student_academic_history.collegeSemesterId",
            collegeSemesterId
        );
    }

    /* -----------------------------
   🔍 SEARCH LOGIC
------------------------------ */
    if (search && search.trim() !== "") {
        const searchValue = search.trim();
        const isNumber = !isNaN(Number(searchValue));

        let searchQuery = `users.fullName.ilike.%${searchValue}%`;

        if (isNumber) {
            searchQuery += `,studentId.eq.${Number(searchValue)}`;
        }

        query = query.or(searchQuery);
    }

    const { data: students, error, count } = await query.range(from, to);


    if (error) throw error;
    if (!students || students.length === 0) {
        return {
            students: [],
            counts: { total: 0, paid: 0, pending: 0, partial: 0 },
        };
    }

    const studentIds = students.map((s) => s.studentId);

    /* --------------------------------------------------
       2️⃣ Fetch Obligations
    --------------------------------------------------- */

    const { data: obligations } = await supabase
        .from("student_fee_obligation")
        .select("*")
        .in("studentId", studentIds)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .is("deletedAt", null);
    const obligationMap = new Map<number, any>();
    obligations?.forEach((o) => {
        obligationMap.set(o.studentId, o);
    });

    const obligationIds =
        obligations?.map((o) => o.studentFeeObligationId) || [];

    /* --------------------------------------------------
       3️⃣ Fetch Payments
    --------------------------------------------------- */

    const { data: payments } = await supabase
        .from("student_payment_transaction")
        .select("studentFeeObligationId, paidAmount, paymentStatus")
        .in("studentFeeObligationId", obligationIds);
    const paymentMap = new Map<
        number,
        { paidAmount: number; paymentStatus: string }
    >();

    payments?.forEach((p) => {
        paymentMap.set(p.studentFeeObligationId, {
            paidAmount: Number(p.paidAmount),
            paymentStatus: p.paymentStatus,
        });
    });

    /* --------------------------------------------------
       4️⃣ Build Result
    --------------------------------------------------- */

    let paidCount = 0;
    let pendingCount = 0;
    let partialCount = 0;

    const result = students.map((student: any) => {
        const obligation = obligationMap.get(student.studentId);
        const totalAmount = obligation?.totalAmount || 0;

        const paymentInfo =
            paymentMap.get(obligation?.studentFeeObligationId);

        const paidAmount = paymentInfo?.paidAmount || 0;

        const pendingAmount = totalAmount - paidAmount;

        let uiStatus: "Paid" | "Pending" | "Partial";

        if (pendingAmount === 0 && totalAmount > 0) {
            uiStatus = "Paid";
            paidCount++;
        } else if (paidAmount === 0) {
            uiStatus = "Pending";
            pendingCount++;
        } else {
            uiStatus = "Partial";
            partialCount++;
        }
        return {
            studentId: student.studentId,
            studentName: student.users?.fullName || "",
            branchCode: student.college_branch?.collegeBranchCode || "",
            yearName:
                student.student_academic_history?.[0]
                    ?.college_academic_year?.collegeAcademicYear || "",
            semester:
                student.student_academic_history?.[0]
                    ?.college_semester?.collegeSemester || "",
            paidAmount,
            pendingAmount,
            status: uiStatus,
        };
    });

    const filtered = status
        ? result.filter((r) => r.status === status)
        : result;
    return {
        students: filtered,
        totalCount: count ?? 0,
        counts: {
            total: count ?? 0,
            paid: paidCount,
            pending: pendingCount,
            partial: partialCount,
        },
    };

}







export async function getOverallStudentsSummary(
    collegeId: number,
    collegeEducationId: number
) {


    /* --------------------------------------------------
       1️⃣ Fetch ALL active students for education
    --------------------------------------------------- */

    const { data: students, error } = await supabase
        .from("students")
        .select("studentId")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("status", "Active")
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) throw error;

    if (!students || students.length === 0) {
        return {
            total: 0,
            paid: 0,
            pending: 0,
            partial: 0,
        };
    }

    const studentIds = students.map((s) => s.studentId);

    /* --------------------------------------------------
       2️⃣ Fetch obligations
    --------------------------------------------------- */

    const { data: obligations } = await supabase
        .from("student_fee_obligation")
        .select("studentId, studentFeeObligationId, totalAmount")
        .in("studentId", studentIds)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (!obligations || obligations.length === 0) {
        return {
            total: students.length,
            paid: 0,
            pending: students.length,
            partial: 0,
        };
    }

    const obligationIds = obligations.map(
        (o) => o.studentFeeObligationId
    );

    /* --------------------------------------------------
       3️⃣ Fetch payments
    --------------------------------------------------- */

    const { data: payments } = await supabase
        .from("student_payment_transaction")
        .select("studentFeeObligationId, paidAmount")
        .in("studentFeeObligationId", obligationIds);

    const paymentMap = new Map<number, number>();

    payments?.forEach((p) => {
        const existing = paymentMap.get(p.studentFeeObligationId) || 0;
        paymentMap.set(
            p.studentFeeObligationId,
            existing + Number(p.paidAmount)
        );
    });

    /* --------------------------------------------------
       4️⃣ Calculate counts
    --------------------------------------------------- */
    /* --------------------------------------------------
       4️⃣ Calculate counts (Correct Logic)
    --------------------------------------------------- */

    let paid = 0;
    let partial = 0;

    /*
    We will count pending as:
    Total Students - Paid - Partial
    */

    obligations?.forEach((o) => {
        const totalAmount = o.totalAmount || 0;
        const paidAmount =
            paymentMap.get(o.studentFeeObligationId) || 0;

        const remaining = totalAmount - paidAmount;

        if (remaining === 0 && totalAmount > 0) {
            paid++;
        } else if (paidAmount > 0 && remaining > 0) {
            partial++;
        }
    });

    const total = students.length;
    const pending = total - paid - partial;

    return {
        total,
        paid,
        pending,
        partial,
    };

}

