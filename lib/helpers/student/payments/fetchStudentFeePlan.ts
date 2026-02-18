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

export async function fetchStudentFeePlan(
  userId: number,
): Promise<StudentFeePlan | null> {
  try {
    // 1. Get Student Details + Session Relation
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(
        `
        studentId, collegeId, collegeBranchId, collegeEducationId, collegeSessionId,
        college_education ( collegeEducationType ),
        college_branch ( collegeBranchCode ),
        college_session ( sessionName )
      `,
      )
      .eq("userId", userId)
      .single();

    if (studentError || !student) return null;

    const getFirst = (item: any) => (Array.isArray(item) ? item[0] : item);
    const eduType =
      getFirst(student.college_education)?.collegeEducationType || "Course";
    const branchCode =
      getFirst(student.college_branch)?.collegeBranchCode || "Branch";
    const sessionName =
      getFirst(student.college_session)?.sessionName || "Unknown Session";
    const defaultProgram = `${eduType} ${branchCode} - ${sessionName}`;

    // 2. Fetch Fee Structure (NO NESTED JOIN to bypass missing FK error)
    const { data: feeStructs, error: feeError } = await supabase
      .from("college_fee_structure")
      .select("*")
      .eq("collegeId", student.collegeId)
      .eq("collegeBranchId", student.collegeBranchId)
      .eq("collegeEducationId", student.collegeEducationId)
      .eq("collegeSessionId", student.collegeSessionId)
      .eq("isActive", true)
      .order("createdAt", { ascending: false })
      .limit(1);

    const feeStruct = feeStructs?.[0];

    // 🔥 IF NO FEE STRUCTURE IS FOUND, RETURN NULL (Triggers empty state)
    if (feeError || !feeStruct) {
      return null;
    }

    // 3. Explicitly Fetch Components
    const { data: comps } = await supabase
      .from("college_fee_components")
      .select(`*, fee_type_master ( feeTypeName )`)
      .eq("feeStructureId", feeStruct.feeStructureId)
      .eq("isActive", true);

    const componentsList: FeeComponent[] = [];
    let gstAmount = 0;
    let subTotal = 0;

    if (comps) {
      comps.forEach((c: any) => {
        const name = getFirst(c.fee_type_master)?.feeTypeName || "Fee";
        const amt = Number(c.amount);

        if (name.toUpperCase() === "GST") {
          gstAmount = amt;
        } else {
          componentsList.push({ label: name, amount: amt });
          subTotal += amt;
        }
      });
    }

    const gstPercent =
      subTotal > 0 ? Math.round((gstAmount / subTotal) * 100) : 0;
    const totalFee = subTotal + gstAmount;
    const paidAmount = 0;

    return {
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
      pendingAmount: totalFee - paidAmount,
    };
  } catch (err) {
    console.error("fetchStudentFeePlan error:", err);
    return null;
  }
}
