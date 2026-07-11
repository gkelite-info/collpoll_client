import { supabase } from "@/lib/supabaseClient";

export type FinanceManagerType = "executive" | "manager";

export type CreateFinanceManagerPayload = {
  userId: number;
  collegeId: number;
  collegeEducationId?: number | null;
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
      collegeEducationId: null,
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

export const upsertFinanceManagerEducationTypes = async (payload: {
  financeManagerId: number;
  collegeEducationIds: number[];
}) => {
  const now = new Date().toISOString();
  const rows = payload.collegeEducationIds.map((collegeEducationId) => ({
    financeManagerId: payload.financeManagerId,
    collegeEducationId,
    isActive: true,
    is_deleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  const { error } = await supabase
    .from("finance_manager_education_types")
    .upsert(rows, {
      onConflict: "financeManagerId,collegeEducationId",
    });

  if (error) {
    throw new Error(
      error.message || "Finance manager education types creation failed.",
      { cause: error },
    );
  }
};
