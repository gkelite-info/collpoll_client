import { supabase } from "@/lib/supabaseClient";
import { upsertIdentifier } from "@/lib/helpers/identifiers/upsertIdentifier";

export async function checkEmployeeIdExists(employeeId: string, collegeId: number): Promise<boolean> {
  const normalizedEmpId = employeeId.trim().toUpperCase();
  const { data, error } = await supabase
    .from("employee_ids")
    .select("employeeIdPk")
    .eq("employeeId", normalizedEmpId)
    .eq("collegeId", collegeId)
    .maybeSingle();

  if (error) {
    return false;
  }
  return !!data;
}

export type WellbeingExecutivePayload = {
  fullName: string;
  email: string;
  mobileCode: string;
  mobileNumber: string;
  gender: string;
  dateOfJoining: string;
  professionalExperienceYears: number;
  employeeId: string;
  password?: string;
  collegeId: number;
  collegePublicId: string;
  categoryId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
  byManager: number;
};

export async function saveWellbeingExecutive(payload: WellbeingExecutivePayload) {
  const timestamp = new Date().toISOString();
  let createdUserId: number | null = null;

  try {
    const exists = await checkEmployeeIdExists(payload.employeeId, payload.collegeId);
    if (exists) {
      return { success: false, error: "Employee ID is already taken by another employee." };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password!,
      options: {
        data: { full_name: payload.fullName, role: "WellbeingExecutive" },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Auth user creation failed");
    }

    const authId = authData.user.id;

    const { data: existing } = await supabase
      .from("users")
      .select("userId")
      .eq("auth_id", authId)
      .maybeSingle();
    if (existing) {
      throw new Error("User already exists.");
    }

    const fullMobile = payload.mobileNumber
      ? `${payload.mobileCode}${payload.mobileNumber}`
      : null;

    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        fullName: payload.fullName,
        email: payload.email,
        mobile: fullMobile,
        role: "WellbeingExecutive",
        gender: payload.gender,
        auth_id: authId,
        collegeId: payload.collegeId,
        collegePublicId: payload.collegePublicId,
        dateOfJoining: payload.dateOfJoining ?? null,
        professionalExperienceYears: payload.professionalExperienceYears ?? null,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .select("userId")
      .single();

    if (userError || !newUser) {
      throw new Error(userError?.message || "User creation failed");
    }

    createdUserId = newUser.userId;

    const { data: wellbeingData, error: wellbeingError } = await supabase
      .from("well_beings")
      .insert({
        userId: createdUserId,
        collegeId: payload.collegeId,
        roleType: "wellbeingExecutive",
        registrationType: "college",
        createdBy: null,
        isActive: true,
        is_deleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        categoryId: payload.categoryId,
        byManager: payload.byManager,
      })
      .select("wellBeingId")
      .single();

    if (wellbeingError || !wellbeingData) {
      throw new Error(wellbeingError?.message || "Wellbeing profile creation failed");
    }

    const wellBeingId = wellbeingData.wellBeingId;

    const { error: detailError } = await supabase
      .from("wellbeing_college_details")
      .insert({
        wellBeingId,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSectionsId: payload.collegeSectionsId,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

    if (detailError) {
      throw new Error(detailError.message || "Wellbeing college details creation failed");
    }

    await upsertIdentifier({
      userId: createdUserId,
      collegeId: payload.collegeId,
      role: "WellbeingExecutive",
      identifierValue: payload.employeeId,
    });

    return { success: true, userId: createdUserId };
  } catch (err: any) {
    if (createdUserId) {
      try {
        await supabase.from("users").delete().eq("userId", createdUserId);
      } catch (rollbackErr) {
      }
    }

    let message = err.message || "Something went wrong. Please try again.";
    const errMsg = message.toLowerCase();
    if (errMsg.includes("email")) {
      message = "This email is already registered.";
    } else if (errMsg.includes("mobile")) {
      message = "This mobile number is already in use.";
    } else if (errMsg.includes("duplicate")) {
      message = "User already exists with provided details.";
    }

    return { success: false, error: message };
  }
}

export async function fetchWellbeingExecutives(collegeId: number) {
  const { data, error } = await supabase
    .from("well_beings")
    .select(`
      wellBeingId,
      userId,
      categoryId,
      roleType,
      isActive,
      is_deleted,
      users:userId (
        fullName,
        role,
        user_profile (
          profileUrl,
          is_deleted
        ),
        employee_ids (
          employeeId
        )
      )
    `)
    .eq("collegeId", collegeId)
    .eq("roleType", "wellbeingExecutive")
    .eq("isActive", true)
    .eq("is_deleted", false);

  if (error) {
    return [];
  }

  return (data ?? []).map((row: any) => {
    const user = row.users;
    const profile = user?.user_profile;
    const activeProfile = Array.isArray(profile)
      ? profile.find((p: any) => !p.is_deleted)
      : (profile?.is_deleted ? null : profile);
    const profileUrl = activeProfile?.profileUrl ?? "";

    const empIds = user?.employee_ids;
    const employeeId = Array.isArray(empIds)
      ? empIds[0]?.employeeId
      : empIds?.employeeId;

    return {
      id: row.userId,
      name: user?.fullName ?? "",
      staffId: employeeId ?? "",
      role: "Executive",
      image: profileUrl ?? "",
      categoryId: row.categoryId,
    };
  });
}
