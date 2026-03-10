import { supabase } from "@/lib/supabaseClient";

export const createCollegeHR = async (hrData: {
  userId: number;
  collegeId: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}) => {
  const { data, error } = await supabase
    .from("college_hr")
    .insert([hrData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create College HR entry.");
  }

  return data;
};
