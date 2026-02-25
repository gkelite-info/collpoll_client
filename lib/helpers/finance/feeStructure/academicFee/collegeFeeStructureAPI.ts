import { supabase } from "@/lib/supabaseClient";

export type CollegeFeeStructureRow = {
  feeStructureId: number;
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeSessionId: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function fetchAllFeeStructures(collegeId: number) {
  try {
    // 1. Fetch structures
    const { data: structures, error: structError } = await supabase
      .from("college_fee_structure")
      .select(
        `
        *,
        college_branch ( collegeBranchId, collegeBranchCode, collegeBranchType ),
        college_session ( collegeSessionId, sessionName )
      `,
      )
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .order("createdAt", { ascending: false });

    if (structError) throw structError;
    if (!structures || structures.length === 0) return [];

    // 2. Fetch components
    const structureIds = structures.map((s) => s.feeStructureId);
    const { data: components, error: compError } = await supabase
      .from("college_fee_components")
      .select(`*, fee_type_master ( feeTypeId, feeTypeName )`)
      .in("feeStructureId", structureIds)
      .eq("isActive", true);

    if (compError) throw compError;

    // 3. Merge
    return structures.map((struct) => {
      const myComps =
        components?.filter((c) => c.feeStructureId === struct.feeStructureId) ||
        [];

      const totalAmount = myComps.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      );

      // 🔥 FIX: Helper to safely get object from Array or Object
      const getJoinedData = (data: any) =>
        Array.isArray(data) ? data[0] : data;

      const branchData = getJoinedData(struct.college_branch);
      const sessionData = getJoinedData(struct.college_session);

      return {
        ...struct,
        branchName: branchData?.collegeBranchCode || "Unknown Branch",
        branchId: branchData?.collegeBranchId,

        // 🔥 FIX: Use the extracted object to get sessionName
        sessionName: sessionData?.sessionName || "Unknown Session",
        sessionId: sessionData?.collegeSessionId,

        components: myComps.map((c) => {
          // Handle joined fee type master safely too
          const typeData = getJoinedData(c.fee_type_master);
          return {
            label: typeData?.feeTypeName,
            amount: c.amount,
            typeId: c.feeTypeId,
          };
        }),
        totalAmount,
      };
    });
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    return [];
  }
}

export async function saveCollegeFeeStructure(
  payload: {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeSessionId: number; // Changed from AcademicYearId
    dueDate: string;
    lateFeePerDay: number;
    remarks?: string;
  },
  financeManagerId: number,
) {
  const now = new Date().toISOString();

  // Check existing using Session Match
  const { data: existing } = await supabase
    .from("college_fee_structure")
    .select("createdAt")
    .match({
      collegeId: payload.collegeId,
      collegeEducationId: payload.collegeEducationId,
      collegeBranchId: payload.collegeBranchId,
      collegeSessionId: payload.collegeSessionId,
    })
    .maybeSingle();

  const { data, error } = await supabase
    .from("college_fee_structure")
    .upsert(
      {
        collegeId: payload.collegeId,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeSessionId: payload.collegeSessionId,

        dueDate: payload.dueDate,
        lateFeePerDay: payload.lateFeePerDay,
        remarks: payload.remarks || null,

        createdBy: financeManagerId,
        isActive: true,
        updatedAt: now,
        createdAt: existing?.createdAt || now,
      },
      {
        // Ensure your DB unique index covers these 4 columns
        onConflict:
          "collegeId,collegeEducationId,collegeBranchId,collegeSessionId",
      },
    )
    .select("feeStructureId")
    .maybeSingle();

  if (error) {
    console.error("saveCollegeFeeStructure error:", error);
    return { success: false, error };
  }

  return { success: true, feeStructureId: data?.feeStructureId };
}
