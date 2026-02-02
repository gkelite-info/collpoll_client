import { supabase } from "@/lib/supabaseClient";
import { UserBasicData } from "../upsertFaculty";

export const persistUser = async (
  isNewUser: boolean,
  basicData: UserBasicData,
  targetUserId: number | null,
  timestamp: string,
) => {
  const fullMobile = `${basicData.mobileCode}${basicData.mobileNumber}`;
  let finalUserId = targetUserId;

  if (isNewUser) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: basicData.email,
      password: basicData.password!,
      options: {
        data: { full_name: basicData.fullName, role: basicData.role },
      },
    });

    if (authError) throw authError;
    const authId = authData.user?.id;
    if (!authId) throw new Error("Authentication failed");

    const { data: existing } = await supabase
      .from("users")
      .select("userId")
      .eq("auth_id", authId)
      .maybeSingle();
    if (existing) throw new Error("User already exists.");

    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        fullName: basicData.fullName,
        email: basicData.email,
        mobile: fullMobile,
        role: basicData.role,
        gender: basicData.gender,
        auth_id: authId,
        collegeId: basicData.collegeIntId,
        collegePublicId: basicData.collegePublicId,
        collegeCode: basicData.collegeCode,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .select("userId")
      .single();

    if (userError) throw userError;
    finalUserId = newUser.userId;
  } else {
    await supabase
      .from("users")
      .update({
        fullName: basicData.fullName,
        email: basicData.email,
        mobile: fullMobile,
        gender: basicData.gender,
        updatedAt: timestamp,
      })
      .eq("userId", targetUserId);
  }

  return finalUserId;
};
