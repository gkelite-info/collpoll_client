import { supabase } from "@/lib/supabaseClient";

export interface FeeComponent {
  label: string;
  amount: number;
}

export interface StudentFeePlan {
  programName: string;
  type: string;
  academicYear: string;
  openingBalance: number;
  components: FeeComponent[];
  gstAmount: number;
  gstPercent: number;
  applicableFees: number;
  scholarship: number;
  totalPayable: number;
  paidTillNow: number;
  pendingAmount: number;
}

export interface StudentFeePlanWithIds extends StudentFeePlan {
  studentFeeObligationId: number;
  collegeSemesterId: number;
}

export async function fetchStudentFeePlan(
  userId: number,
): Promise<StudentFeePlanWithIds | null> {
  try {

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();

    if (studentError) {
      console.error("Supabase Error:", studentError);
      return null;
    }

    if (!student) {
      console.error("No student found for userId:", userId);
      return null;
    }

    const getFirst = (item: any) => (Array.isArray(item) ? item[0] : item);

    const eduType =
      getFirst(student.college_education)?.collegeEducationType || "Course";

    const branchCode =
      getFirst(student.college_branch)?.collegeBranchCode || "Branch";

    const sessionName =
      getFirst(student.college_session)?.sessionName || "Session";

    const defaultProgram = `${eduType} ${branchCode} - ${sessionName}`;

    const { data: academicHistory, error: academicError } = await supabase
      .from("student_academic_history")
      .select("collegeAcademicYearId, collegeSemesterId")
      .eq("studentId", student.studentId)
      .eq("isCurrent", true)
      .maybeSingle();

    const isInter = eduType.includes("Inter");

    if (!isInter && (academicError || !academicHistory)) {
      console.warn("Student missing current academic history.");
      return null;
    }

    if (academicError || !academicHistory) return null;

    let obligationQuery = supabase
      .from("student_fee_obligation")
      .select(`studentFeeObligationId, totalAmount`)
      .eq("studentId", student.studentId)
      .eq("collegeSessionId", student.collegeSessionId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .maybeSingle();

    const { data: obligation, error: obligationError } = await obligationQuery;

    // if (obligationError) {
    //   console.error("Database error during obligation fetch:", obligationError);
    //   return null;
    // }

    // if (!obligation) {
    //   console.warn("No active fee obligation found for this student.");
    //   return null;
    // }

    if (obligationError && Object.keys(obligationError).length > 0) {
      console.error("Database error during obligation fetch:", obligationError);
      return null;
    }

    if (!obligation) {
      console.warn("Failed to fetch fee plan: no active obligation found");
      return null;
    }

    const { data: feeStructs } = await supabase
      .from("college_fee_structure")
      .select("*")
      .eq("collegeId", student.collegeId)
      .eq("collegeBranchId", student.collegeBranchId)
      .eq("collegeEducationId", student.collegeEducationId)
      .eq("collegeSessionId", student.collegeSessionId)
      .eq("isActive", true)
      .order("createdAt", {
        ascending: false,
      })
      .limit(1);

    const feeStruct = feeStructs?.[0];

    if (!feeStruct) return null;

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

    const componentsList: FeeComponent[] = [];

    let gstAmount = 0;
    let subTotal = 0;

    comps?.forEach((c: any) => {
      const name = getFirst(c.fee_type_master)?.feeTypeName || "Fee";

      const amt = Number(c.amount);

      if (name.toUpperCase() === "GST") {
        gstAmount = amt;
      } else {
        componentsList.push({
          label: name,
          amount: amt,
        });

        subTotal += amt;
      }
    });

    const { data: ledgerRows } = await supabase
      .from("student_fee_ledger")
      .select("amount")
      .eq("studentFeeObligationId", obligation.studentFeeObligationId);

    const paidAmount =
      ledgerRows?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;

    const gstPercent =
      subTotal > 0 ? Math.round((gstAmount / subTotal) * 100) : 0;

    const totalFee = subTotal + gstAmount;

    const pendingAmount = totalFee - paidAmount;

    return {
      studentFeeObligationId: obligation.studentFeeObligationId,

      collegeSemesterId: academicHistory.collegeSemesterId,

      programName: defaultProgram,

      type: "Academic Fees",

      academicYear: sessionName,

      openingBalance: 0,

      components: componentsList,

      gstAmount,

      gstPercent,

      applicableFees: subTotal,

      scholarship: 0,

      totalPayable: totalFee,

      paidTillNow: paidAmount,

      pendingAmount,
    };
  } catch (err) {
    console.error("fetchStudentFeePlan error:", err);

    return null;
  }
}
