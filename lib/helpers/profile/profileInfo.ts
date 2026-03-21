import { supabase } from "@/lib/supabaseClient";

const now = () => new Date().toISOString();

export async function getUserProfilePhoto(userId: number) {
  const { data, error } = await supabase
    .from("user_profile")
    .select("userProfileId, profileUrl")
    .eq("userId", userId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertUserProfilePhoto(userId: number, profileUrl: string) {
  const { data, error } = await supabase
    .from("user_profile")
    .upsert(
      {
        userId,
        profileUrl,
        updatedAt: now(),
        createdAt: now(),
        is_deleted: false,
      },
      {
        onConflict: "userId",
      }
    )
    .select("userProfileId")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserProfilePhoto(userId: number) {
  const { error } = await supabase
    .from("user_profile")
    .update({
      is_deleted: true,
      deletedAt: now(),
    })
    .eq("userId", userId)
    .eq("is_deleted", false);

  if (error) throw error;
}