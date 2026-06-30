import { supabase } from "@/lib/supabaseClient";

export type CreateAccountantPayload = {
  userId: number;
  collegeId: number;
  collegeEducationId?: number | null;
  createdBy: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createAccountant = async (
  payload: CreateAccountantPayload,
) => {
  const { data, error } = await supabase
    .from("accountants")
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
    .select("accountantId")
    .single();

  if (error) {
    throw new Error(
      error.message || `Accountant registration failed.`,
      { cause: error },
    );
  }
  return data.accountantId as number;
};

export const upsertAccountantEducationTypes = async (payload: {
  accountantId: number;
  collegeEducationIds: number[];
}) => {
  if (!payload.collegeEducationIds || payload.collegeEducationIds.length === 0) {
    return;
  }
  
  const now = new Date().toISOString();
  const rows = payload.collegeEducationIds.map((collegeEducationId) => ({
    accountantId: payload.accountantId,
    collegeEducationId,
    isActive: true,
    is_deleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  const { error } = await supabase
    .from("accountant_education_types")
    .upsert(rows, {
      onConflict: "accountantId,collegeEducationId",
    });

  if (error) {
    throw new Error(
      error.message || "Accountant education types creation failed.",
      { cause: error },
    );
  }
};
