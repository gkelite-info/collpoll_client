import { supabase } from "@/lib/supabaseClient";

export async function getCurrentSemesterPendingStudents({
  collegeId,
  collegeEducationId,
  collegeBranchId,
}: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number;
}) {

  console.log("🔎 Filters:", {
    collegeId,
    collegeEducationId,
    collegeBranchId
  });

  let studentQuery = supabase
    .from("students")
    .select(`
      studentId,
      student_academic_history!inner(
        collegeAcademicYearId,
        collegeSemesterId,
        isCurrent
      )
    `)
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .eq("student_academic_history.isCurrent", true);

  if (collegeBranchId) {
    studentQuery = studentQuery.eq("collegeBranchId", collegeBranchId);
  }

  const { data: students, error: studentError } = await studentQuery;

  if (studentError) {
    console.error("Student fetch error:", studentError);
    return 0;
  }

  if (!students?.length) {
    console.log("⚠ No students found");
    return 0;
  }

  const studentIds = students.map(s => s.studentId);

  console.log("👨‍🎓 Students found:", studentIds.length);

  const { data: obligations, error: obligationError } = await supabase
    .from("student_fee_obligation")
    .select(`
      studentFeeObligationId,
      studentId,
      totalAmount
    `)
    .in("studentId", studentIds)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (obligationError) {
    console.error("Obligation error:", obligationError);
    return 0;
  }

  if (!obligations?.length) {
    console.log("⚠ No obligations");
    return 0;
  }

  const obligationIds = obligations.map(
    o => o.studentFeeObligationId
  );

  const { data: ledgers } = await supabase
    .from("student_fee_ledger")
    .select(`
      studentFeeObligationId,
      amount
    `)
    .in("studentFeeObligationId", obligationIds);

  const paidMap = new Map<number, number>();

  ledgers?.forEach(l => {

    const existing =
      paidMap.get(l.studentFeeObligationId) || 0;

    paidMap.set(
      l.studentFeeObligationId,
      existing + Number(l.amount)
    );

  });

  let pendingStudents = new Set<number>();

  obligations.forEach(o => {

    const paid =
      paidMap.get(o.studentFeeObligationId) || 0;

    const pending =
      Number(o.totalAmount) - paid;

    console.log(
      `➡ Student ${o.studentId} | Total=${o.totalAmount} Paid=${paid} Pending=${pending}`
    );

    if (pending > 0) {
      pendingStudents.add(o.studentId);
    }

  });

  console.log("🎯 Pending Students:", pendingStudents.size);

  return pendingStudents.size;
}