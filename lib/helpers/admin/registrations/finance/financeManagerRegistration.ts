import { supabase } from "@/lib/supabaseClient";

export type FinanceManagerType = "executive" | "manager";

export type CreateFinanceManagerPayload = {
  userId: number;
  collegeId: number;
  collegeEducationId: number;
  createdBy: number;
  type?: FinanceManagerType;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createFinanceManager = async (
  payload: CreateFinanceManagerPayload,
) => {
  const financeManagerType = payload.type ?? "executive";
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
      type: financeManagerType,
    })
    .select("financeManagerId")
    .single();

  if (error) {
    throw new Error(
      error.message ||
        `Finance manager registration failed for type "${financeManagerType}".`,
      { cause: error },
    );
  }
  return data.financeManagerId as number;
};
