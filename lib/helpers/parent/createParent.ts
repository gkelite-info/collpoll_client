import { supabase } from "@/lib/supabaseClient";

type CreateParentPayload = {
  studentId: number;
  fullName: string;
  email: string;
  mobile: string;
  role: "FATHER" | "MOTHER" | "GUARDIAN";
  collegePublicId: string;
  collegeCode?: string;
  createdBy: number;
};

export async function createParent(payload: CreateParentPayload) {
  const now = new Date().toISOString();

  const { data: parent, error } = await supabase
    .from("parents")
    .insert({
      studentId: payload.studentId,
      fullName: payload.fullName,
      email: payload.email,
      mobile: payload.mobile,
      role: payload.role,
      collegePublicId: payload.collegePublicId,
      collegeCode: payload.collegeCode ?? null,
      createdBy: payload.createdBy,
      is_deleted: false,

      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) throw error;

  return parent;
}
