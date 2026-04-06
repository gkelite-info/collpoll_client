"use server";

import { fetchParentContext } from "@/app/utils/context/parent/parentContextAPI";
import { supabase } from "@/lib/supabaseClient";

const ATTENDED_STATUSES = ["PRESENT", "LATE"];
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

const getFirst = (item: any) => (Array.isArray(item) ? item[0] : item);

export async function getParentDashboardWidgets(userId: number) {
  const parent = await fetchParentContext(userId);
  if (!parent || !parent.studentId)
    throw new Error("Parent or child not found");

  const studentId = parent.studentId;

  const { data: studentInfo } = await supabase
    .from("students")
    .select(
      `
        studentId,
        userId,
        collegeId,
        collegeSessionId,
        collegeEducationId,
        collegeBranchId,
        user:userId(fullName),
        college_branch(collegeBranchCode, collegeBranchType)
      `,
    )
    .eq("studentId", studentId)
    .single();

  if (!studentInfo) throw new Error("Student data not found");

  const branchName =
    getFirst(studentInfo.college_branch)?.collegeBranchCode || "Unknown Branch";
  const studentName = getFirst(studentInfo.user)?.fullName || "Student";

  const { data: sah } = await supabase
    .from("student_academic_history")
    .select(
      `
        collegeAcademicYearId,
        college_academic_year (
            collegeAcademicYear
        )
      `,
    )
    .eq("studentId", studentId)
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .single();

  const academicYear =
    getFirst(sah?.college_academic_year)?.collegeAcademicYear || "";

  let totalFee = 0;
  let feePaid = 0;

  if (sah?.collegeAcademicYearId) {
    const { data: obligation } = await supabase
      .from("student_fee_obligation")
      .select("studentFeeObligationId")
      .eq("studentId", studentId)
      .eq("collegeSessionId", studentInfo.collegeSessionId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .maybeSingle();

    if (obligation) {
      const { data: feeStructs } = await supabase
        .from("college_fee_structure")
        .select("feeStructureId")
        .eq("collegeId", studentInfo.collegeId)
        .eq("collegeBranchId", studentInfo.collegeBranchId)
        .eq("collegeEducationId", studentInfo.collegeEducationId)
        .eq("collegeSessionId", studentInfo.collegeSessionId)
        .eq("isActive", true)
        .order("createdAt", { ascending: false })
        .limit(1);

      const feeStruct = feeStructs?.[0];

      if (feeStruct) {
        const { data: comps } = await supabase
          .from("college_fee_components")
          .select(
            `
              amount,
              fee_type_master ( feeTypeName )
            `,
          )
          .eq("feeStructureId", feeStruct.feeStructureId)
          .eq("isActive", true);

        let gstAmount = 0;
        let subTotal = 0;

        comps?.forEach((c: any) => {
          const name = getFirst(c.fee_type_master)?.feeTypeName || "Fee";
          const amt = Number(c.amount);

          if (name.toUpperCase() === "GST") {
            gstAmount = amt;
          } else {
            subTotal += amt;
          }
        });

        totalFee = subTotal + gstAmount;

        const { data: ledgerRows } = await supabase
          .from("student_fee_ledger")
          .select("amount")
          .eq("studentFeeObligationId", obligation.studentFeeObligationId);

        feePaid =
          ledgerRows?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;
      }
    }
  }

  const { data: attendanceRecords } = await supabase
    .from("attendance_record")
    .select("status, markedAt")
    .eq("studentId", studentId)
    .is("deletedAt", null);

  let totalConducted = 0;
  let totalAttended = 0;

  const monthOrder: string[] = [];
  const currentDate = new Date();

  const sixMonthsAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 5,
    1,
  );

  for (let i = 5; i >= 0; i--) {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1,
    );
    monthOrder.push(d.toLocaleString("default", { month: "short" }));
  }

  const monthlyStats: Record<string, { conducted: number; attended: number }> =
    {};
  monthOrder.forEach((m) => {
    monthlyStats[m] = { conducted: 0, attended: 0 };
  });

  (attendanceRecords || []).forEach((record) => {
    const isConducted = CONDUCTED_STATUSES.includes(record.status);
    const isAttended = ATTENDED_STATUSES.includes(record.status);

    if (isConducted) {
      totalConducted++;
      if (isAttended) totalAttended++;

      const recordDate = new Date(record.markedAt);

      if (recordDate >= sixMonthsAgo) {
        const monthName = recordDate.toLocaleString("default", {
          month: "short",
        });
        if (monthlyStats[monthName]) {
          monthlyStats[monthName].conducted++;
          if (isAttended) monthlyStats[monthName].attended++;
        }
      }
    }
  });

  const overallPercentage =
    totalConducted === 0
      ? 0
      : Math.round((totalAttended / totalConducted) * 100);

  const attendanceChartData = monthOrder.map((month) => ({
    month,
    value:
      monthlyStats[month].conducted === 0
        ? 0
        : Math.round(
            (monthlyStats[month].attended / monthlyStats[month].conducted) *
              100,
          ),
  }));

  const formatInr = (num: number) => num.toLocaleString("en-IN");

  return {
    studentId,
    childUserId: studentInfo.userId,
    studentName,
    branchName,
    feeTotal: formatInr(totalFee),
    feePaid: formatInr(feePaid),
    academicYear,
    attendancePercentage: overallPercentage,
    attendanceChartData,
  };
}

// Add this to your server actions file
export async function getChildUserIdForParent(userId: number) {
  // 1. Get the parent's record
  const parent = await fetchParentContext(userId);
  if (!parent || !parent.studentId) return null;

  // 2. Fetch the student's actual userId safely on the server
  const { data: studentInfo } = await supabase
    .from("students")
    .select("userId")
    .eq("studentId", parent.studentId)
    .single();

  return studentInfo?.userId || null;
}
