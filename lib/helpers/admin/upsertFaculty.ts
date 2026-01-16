import { supabase } from "@/lib/supabaseClient";

export type UserBasicData = {
  fullName: string;
  email: string;
  mobileCode: string;
  mobileNumber: string;
  role: string;
  gender: string;
  collegeIntId: number;
  collegePublicId: string;
  password?: string;
  adminId: number;
};

export const fetchModalInitialData = async () => {
  const { data: eduDepts } = await supabase
    .from("education_departments")
    .select(
      `educationId, departments, educations (educationName, educationCode)`
    );

  const { data: subjs } = await supabase.from("subjects").select("*");

  const formattedDbData = {
    educations:
      eduDepts?.map((item: any) => ({
        id: item.educationId,
        name: item.educations.educationCode,
        code: item.educations.educationCode,
        rawDepts: item.departments,
      })) || [],
    departments:
      eduDepts?.flatMap((item: any) =>
        item.departments.map((d: any) => ({
          ...d,
          educationName: item.educations.educationName,
        }))
      ) || [],
    subjects: subjs || [],
  };

  return { formattedDbData };
};

export const persistUser = async (
  isNewUser: boolean,
  basicData: UserBasicData,
  targetUserId: number | null,
  timestamp: string
) => {
  const fullMobile = `${basicData.mobileCode}${basicData.mobileNumber}`;
  let finalUserId = targetUserId;

  if (isNewUser) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: basicData.email,
      password: basicData.password!,
      options: {
        data: {
          full_name: basicData.fullName,
          role: basicData.role,
        },
      },
    });

    if (authError) throw authError;
    const authId = authData.user?.id;

    if (!authId) throw new Error("Authentication failed: No User ID returned");

    const { data: existingUser } = await supabase
      .from("users")
      .select("userId")
      .eq("auth_id", authId)
      .maybeSingle();

    if (existingUser) {
      throw new Error(
        "A user with this email already exists. Please use the edit feature or use a different email."
      );
    }

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
        isActive: true,
        is_deleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .select("userId")
      .single();

    if (userError) throw new Error(`User DB Error: ${userError.message}`);
    finalUserId = newUser.userId;
  } else {
    const { error: updateError } = await supabase
      .from("users")
      .update({
        fullName: basicData.fullName,
        email: basicData.email,
        mobile: fullMobile,
        gender: basicData.gender,
        updatedAt: timestamp,
      })
      .eq("userId", targetUserId);

    if (updateError) throw updateError;
  }

  return finalUserId;
};

export const persistFaculty = async (
  userId: number,
  basicData: UserBasicData,
  payloads: any,
  timestamp: string,
  isEditMode: boolean
) => {
  const fullMobile = `${basicData.mobileCode}${basicData.mobileNumber}`;

  const facultyData: any = {
    userId,
    fullName: basicData.fullName,
    email: basicData.email,
    mobile: fullMobile,
    gender: basicData.gender,
    collegeId: basicData.collegeIntId,
    role: "Faculty",
    ...payloads,
    createdBy: basicData.adminId,
    createdAt: timestamp,
    updatedAt: timestamp,
    is_deleted: false,
  };

  if (isEditMode) {
    delete facultyData.createdBy;
    delete facultyData.createdAt;
  }

  const { error } = await supabase
    .from("faculty")
    .upsert(facultyData, { onConflict: "userId" });

  if (error) throw new Error(`Faculty DB Error: ${error.message}`);
};
