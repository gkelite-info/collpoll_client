import { supabase } from "@/lib/supabaseClient";

export async function getCurrentSemesterPendingStudents({
  collegeId,
  collegeEducationId,
  collegeBranchId,
  selectedAcademicYearId,
}: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number;
  selectedAcademicYearId?: number;
}) {

  console.log("Filters:", {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    selectedAcademicYearId,
  });

  let studentQuery = supabase
    .from("students")
    .select(`
      studentId,
      student_academic_history!inner(
        collegeAcademicYearId,
        isCurrent
      )
    `)
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .eq("student_academic_history.isCurrent", true);

  if (collegeBranchId) {
    studentQuery = studentQuery.eq(
      "collegeBranchId",
      collegeBranchId
    );
  }

  if (selectedAcademicYearId) {
    studentQuery = studentQuery.eq(
      "student_academic_history.collegeAcademicYearId",
      selectedAcademicYearId
    );
  }

  const { data: students, error: studentError } = await studentQuery;

  if (studentError) {
    return 0;
  }

  if (!students?.length) return 0;

  const studentIds = students.map(s => s.studentId);
  const { data: obligations, error: obligationError } = await supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId, studentId, totalAmount")
    .in("studentId", studentIds)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (obligationError) {
    return 0;
  }
  if (!obligations?.length) return 0;

  const obligationIds = obligations.map(
    o => o.studentFeeObligationId
  );

  const { data: payments, error: paymentError } = await supabase
    .from("student_payment_transaction")
    .select("studentFeeObligationId, paidAmount")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (paymentError) {
    return 0;
  }
  const paidMap = new Map<number, number>();
  payments?.forEach(p => {
    const existing =
      paidMap.get(p.studentFeeObligationId) || 0;

    paidMap.set(
      p.studentFeeObligationId,
      existing + Number(p.paidAmount)
    );
  });
  let pendingCount = 0;

  obligations.forEach(o => {
    const paid =
      paidMap.get(o.studentFeeObligationId) || 0;

    console.log(
      `➡ Obligation ${o.studentFeeObligationId}: Total=${o.totalAmount}, Paid=${paid}`
    );

    if (paid === 0) {
      pendingCount++;
    }
  });

  return pendingCount;
}