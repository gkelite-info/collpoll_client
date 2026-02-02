import { supabase } from "@/lib/supabaseClient";

export async function fetchAdminContext(userId: number) {
  const { data: admin, error } = await supabase
    .from("admins")
    .select("adminId, collegePublicId, collegeCode, collegeId")
    .eq("userId", userId)
    .is("deletedAt", null)
    .single();

  if (error) throw error;

  const { data: college, error: collegeErr } = await supabase
    .from("colleges")
    .select("collegeId, collegeCode")
    .eq("collegePublicId", admin.collegePublicId)
    .single();

  if (collegeErr) throw collegeErr;

  return {
    adminId: admin.adminId,
    collegeId: college.collegeId,
    collegePublicId: admin.collegePublicId,
    collegeCode: college.collegeCode,
  };
}
