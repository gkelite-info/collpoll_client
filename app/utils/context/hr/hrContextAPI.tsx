import { supabase } from "@/lib/supabaseClient";

type HrJoin = {
  collegeHrId: number;
  userId: number;
  collegeId: number;
};

export async function fetchHrContext(userId: number) {
  const { data: hr, error } = await supabase
    .from("college_hr")
    .select(`
      collegeHrId,
      userId,
      collegeId
    `)
    .eq("userId", userId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .single<HrJoin>();

  if (error) throw error;

  return {
    collegeHrId: hr.collegeHrId,
    userId: hr.userId,
    collegeId: hr.collegeId,
  };
}