import { supabase } from "@/lib/supabaseClient";

export type CreateFinanceManagerPayload = {
  userId: number;
  collegeId: number;
  collegeEducationId: number;
  createdBy: number; 
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createFinanceManager = async (
  payload: CreateFinanceManagerPayload,
) => {
  const { data, error } = await supabase
    .from("finance_manager")
    .insert({
      userId: payload.userId,
      collegeId: payload.collegeId,
      collegeEducationId: payload.collegeEducationId,
      createdBy: payload.createdBy,
      isActive: payload.isActive ?? true,
      is_deleted: false,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    })
    .select("financeManagerId")
    .single();

  if (error) throw error;
  return data.financeManagerId as number;
};
