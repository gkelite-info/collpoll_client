import { supabase } from "../supabaseClient";

export const getStudentId = async () => {
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) return null;

   const { data, error } = await supabase
    .from("users")
    .select("userId")
    .eq("auth_id", auth.user.id)
    .single();

  if (error || !data) return null;

  return data.userId;
};
