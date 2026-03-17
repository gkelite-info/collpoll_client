import { supabase } from "@/lib/supabaseClient";
 
export type PersonalDetailsRow = {
  personalDetailsId: number;
  userId: number;
  workStatus: "experience" | "fresher";
  currentCity: string;
  is_deleted: boolean | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
 
export async function fetchPersonalDetails(userId: number) {
  const { data, error } = await supabase
    .from("personal_details")
    .select(`
      personalDetailsId,
      userId,
      workStatus,
      currentCity,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
    .eq("userId", userId)
    .is("deletedAt", null)
    .single();
 
  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null };
    }
    console.error("fetchPersonalDetails error:", error);
    throw error;
  }
 
  return { success: true, data };
}
 
export async function fetchExistingPersonalDetails(userId: number) {
  const { data, error } = await supabase
    .from("personal_details")
    .select("personalDetailsId")
    .eq("userId", userId)
    .is("deletedAt", null)
    .single();
 
  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null };
    }
    throw error;
  }
 
  return { success: true, data };
}
 
export async function savePersonalDetails(
  payload: {
    personalDetailsId?: number;
    userId: number;
    workStatus: "experience" | "fresher";
    currentCity: string;
  }
) {
  const now = new Date().toISOString();
 
  const upsertPayload: any = {
    userId: payload.userId,
    workStatus: payload.workStatus,
    currentCity: payload.currentCity.trim(),
    updatedAt: now,
  };
 
  if (!payload.personalDetailsId) {
    upsertPayload.createdAt = now;
 
    const { data, error } = await supabase
      .from("personal_details")
      .insert([upsertPayload])
      .select("personalDetailsId")
      .single();
 
    if (error) {
      console.error("savePersonalDetails create error:", error);
      return { success: false, error };
    }
 
    return {
      success: true,
      personalDetailsId: data.personalDetailsId,
    };
  }
 
  const { error } = await supabase
    .from("personal_details")
    .update(upsertPayload)
    .eq("personalDetailsId", payload.personalDetailsId);
 
  if (error) {
    console.error("savePersonalDetails update error:", error);
    return { success: false, error };
  }
 
  return {
    success: true,
    personalDetailsId: payload.personalDetailsId,
  };
}
 
export async function deletePersonalDetails(personalDetailsId: number) {
  const { error } = await supabase
    .from("personal_details")
    .update({
      is_deleted: true,
      deletedAt: new Date().toISOString(),
    })
    .eq("personalDetailsId", personalDetailsId);
 
  if (error) {
    console.error("deletePersonalDetails error:", error);
    return { success: false };
  }
 
  return { success: true };
}
 
export async function fetchAllPersonalDetails() {
  const { data, error } = await supabase
    .from("personal_details")
    .select(`
      personalDetailsId,
      userId,
      workStatus,
      currentCity,
      createdAt,
      updatedAt
    `)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });
 
  if (error) {
    console.error("fetchAllPersonalDetails error:", error);
    throw error;
  }
 
  return data ?? [];
}