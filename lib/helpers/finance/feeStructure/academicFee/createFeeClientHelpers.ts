import { supabase } from "@/lib/supabaseClient";

export async function fetchAvailableSessions(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number,
) {
  const { data } = await supabase
    .from("college_session")
    .select("*")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("is_deleted", false)
    .order("startYear", { ascending: false });

  return data || [];
}

export async function fetchFeeStructureEditData(editId: string) {
  const { data: struct, error } = await supabase
    .from("college_fee_structure")
    .select("*")
    .eq("feeStructureId", editId)
    .single();

  if (error || !struct) return { struct: null, sessionData: null, comps: null };

  let sessionData = null;
  if (struct.collegeSessionId) {
    const { data } = await supabase
      .from("college_session")
      .select("startYear, endYear")
      .eq("collegeSessionId", struct.collegeSessionId)
      .single();
    sessionData = data;
  }

  const { data: comps } = await supabase
    .from("college_fee_components")
    .select(`*, fee_type_master ( feeTypeName )`)
    .eq("feeStructureId", editId)
    .eq("isActive", true);

  return { struct, sessionData, comps };
}

export async function fetchFinanceManagerIdByUserId(userId: number) {
  const { data } = await supabase
    .from("finance_manager")
    .select("financeManagerId")
    .eq("userId", userId)
    .single();

  return data?.financeManagerId || null;
}
