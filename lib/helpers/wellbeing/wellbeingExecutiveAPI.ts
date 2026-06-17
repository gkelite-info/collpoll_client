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
  categoryIds?: number[];
  subCategoryIds?: number[];
  staffRole?: "Wellbeing Executive" | "Ground Staff";
  collegeEducationId?: number | null;
  collegeBranchId?: number | null;
  collegeBranchIds?: number[];
  collegeAcademicYearId?: number | null;
  collegeSectionsId?: number | null;
  collegeDetails?: {
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSectionsId: number;
  }[];
  byManager: number;
  registrationType: string;
  hostelBlock?: string;
  buildingNumber?: string;
  hostelType?: string;
};

export type GroundStaffPayload = {
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
  subCategoryId: number;
  registrationType: string;
  hostelType?: string | null;
  collegeEducationId: number;
  createdBy: number;
};

type UserProfileRow = {
  profileUrl?: string | null;
  is_deleted?: boolean | null;
};

type EmployeeIdRow = {
  employeeId?: string | null;
};

type WellbeingUserRelation = {
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
  user_profile?: UserProfileRow | UserProfileRow[] | null;
  employee_ids?: EmployeeIdRow | EmployeeIdRow[] | null;
};

type WellbeingBaseRow = {
  wellBeingId: number;
  userId: number;
  users?: WellbeingUserRelation | WellbeingUserRelation[] | null;
};

type AssignedCategoryRow = {
  wellBeingId: number;
  categoryId: number;
};

type WellbeingExecutiveListItem = {
  id: number;
  name: string;
  email?: string;
  staffId: string;
  role: "Executive";
  image: string;
  categoryId: number;
};

const getSingleRelation = <T,>(relation: T | T[] | null | undefined) =>
  Array.isArray(relation) ? relation[0] : relation;

const fetchAssignedCategoriesByWellBeingIds = async (wellBeingIds: number[]) => {
  if (!wellBeingIds.length) {
    return new Map<number, number[]>();
  }

  const { data, error } = await supabase
    .from("wellbeing_assigned_categories")
    .select("wellBeingId, categoryId")
    .in("wellBeingId", wellBeingIds)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (error) {
    throw error;
  }

  return ((data ?? []) as AssignedCategoryRow[]).reduce((map, row) => {
    const existing = map.get(row.wellBeingId) ?? [];
    existing.push(row.categoryId);
    map.set(row.wellBeingId, existing);
    return map;
  }, new Map<number, number[]>());
};

const insertAssignedCategory = async (
  wellBeingId: number,
  categoryId: number,
  timestamp: string,
) => {
  const { error } = await supabase
    .from("wellbeing_assigned_categories")
    .upsert(
      {
        wellBeingId,
        categoryId,
        isActive: true,
        is_deleted: false,
        deletedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      { onConflict: "wellBeingId,categoryId" },
    );

  if (error) {
    throw new Error(error.message || "Wellbeing category assignment failed");
  }
};

const rollbackWellbeingExecutiveCreate = async (
  userId: number | null,
  wellBeingId: number | null,
) => {
  if (wellBeingId) {
    await supabase
      .from("wellbeing_assigned_categories")
      .delete()
      .eq("wellBeingId", wellBeingId);
    await supabase
      .from("wellbeing_college_details")
      .delete()
      .eq("wellBeingId", wellBeingId);
    await supabase
      .from("wellbeing_hostel_details")
      .delete()
      .eq("wellBeingId", wellBeingId);
    await supabase
      .from("well_beings")
      .delete()
      .eq("wellBeingId", wellBeingId);
  }

  if (userId) {
    await supabase.from("employee_ids").delete().eq("userId", userId);
    await supabase.from("user_profile").delete().eq("userId", userId);
    await supabase.from("users").delete().eq("userId", userId);
  }
};

const rollbackGroundStaffCreate = async (
  userId: number | null,
  groundStaffId: number | null,
) => {
  if (groundStaffId) {
    await supabase.from("ground_staff").delete().eq("groundStaffId", groundStaffId);
  }

  if (userId) {
    await supabase.from("employee_ids").delete().eq("userId", userId);
    await supabase.from("user_profile").delete().eq("userId", userId);
    await supabase.from("users").delete().eq("userId", userId);
  }
};

const toGroundStaffRegistrationType = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "hostel") return "hostel";
  if (normalized === "both") return "both";
  return "college";
};

const toGroundStaffHostelType = (registrationType: string, hostelType?: string | null) => {
  const normalizedRegistrationType = toGroundStaffRegistrationType(registrationType);
  if (normalizedRegistrationType === "college") return null;
  return hostelType?.trim() || null;
};

export async function saveGroundStaff(payload: GroundStaffPayload) {
  const timestamp = new Date().toISOString();
  let createdUserId: number | null = null;
  let createdGroundStaffId: number | null = null;

  try {
    const exists = await checkEmployeeIdExists(payload.employeeId, payload.collegeId);
    if (exists) {
      return { success: false, error: "Employee ID is already taken by another employee." };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password!,
      options: {
        data: { full_name: payload.fullName, role: "GroundStaff" },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Auth user creation failed");
    }

    const authId = authData.user.id;
    const fullMobile = payload.mobileNumber
      ? `${payload.mobileCode}${payload.mobileNumber}`
      : null;

    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        fullName: payload.fullName,
        email: payload.email,
        mobile: fullMobile,
        role: "GroundStaff",
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
    const registrationType = toGroundStaffRegistrationType(payload.registrationType);
    const hostelType = toGroundStaffHostelType(registrationType, payload.hostelType);

    const { data: groundStaff, error: groundStaffError } = await supabase
      .from("ground_staff")
      .insert({
        userId: createdUserId,
        collegeId: payload.collegeId,
        categoryId: payload.categoryId,
        subCategoryId: payload.subCategoryId,
        registrationType,
        hostelType,
        collegeEducationId: payload.collegeEducationId,
        createdBy: payload.createdBy,
        isActive: true,
        is_deleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .select("groundStaffId")
      .single();

    if (groundStaffError || !groundStaff) {
      throw new Error(groundStaffError?.message || "Ground staff profile creation failed");
    }

    createdGroundStaffId = groundStaff.groundStaffId;

    await upsertIdentifier({
      userId: createdUserId,
      collegeId: payload.collegeId,
      role: "GroundStaff",
      identifierValue: payload.employeeId,
    });

    return { success: true, userId: createdUserId, groundStaffId: createdGroundStaffId };
  } catch (err: unknown) {
    if (createdUserId) {
      try {
        await rollbackGroundStaffCreate(createdUserId, createdGroundStaffId);
      } catch (rollbackError) {
        console.warn("rollback ground staff create failed:", rollbackError);
      }
    }

    let message =
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again.";
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

export async function saveWellbeingExecutive(payload: WellbeingExecutivePayload) {
  const timestamp = new Date().toISOString();
  let createdUserId: number | null = null;
  let createdWellBeingId: number | null = null;

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

    const hasCollege = payload.registrationType === "College" || payload.registrationType === "Both";
    const hasHostel = payload.registrationType === "Hostel" || payload.registrationType === "Both";

    const { data: wellbeingData, error: wellbeingError } = await supabase
      .from("well_beings")
      .insert({
        userId: createdUserId,
        collegeId: payload.collegeId,
        roleType: "wellbeingExecutive",
        registrationType: payload.registrationType.toLowerCase(),
        createdBy: null,
        isActive: true,
        is_deleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        byManager: payload.byManager,
      })
      .select("wellBeingId")
      .single();

    if (wellbeingError || !wellbeingData) {
      throw new Error(wellbeingError?.message || "Wellbeing profile creation failed");
    }

    const wellBeingId = wellbeingData.wellBeingId;
    createdWellBeingId = wellBeingId;
    const categoryIds = payload.categoryIds?.length
      ? payload.categoryIds
      : [payload.categoryId];
    await Promise.all(
      Array.from(new Set(categoryIds)).map((categoryId) =>
        insertAssignedCategory(wellBeingId, categoryId, timestamp),
      ),
    );

    if (hasCollege) {
      const hasLegacyCollegeDetail =
        payload.collegeEducationId &&
        payload.collegeBranchId &&
        payload.collegeAcademicYearId &&
        payload.collegeSectionsId;
      const collegeDetails = payload.collegeDetails?.length
        ? payload.collegeDetails
        : hasLegacyCollegeDetail
          ? [
              {
                collegeEducationId: payload.collegeEducationId,
                collegeBranchId: payload.collegeBranchId,
                collegeAcademicYearId: payload.collegeAcademicYearId,
                collegeSectionsId: payload.collegeSectionsId,
              },
            ]
          : [];

      if (collegeDetails.length) {
        const { error: detailError } = await supabase
          .from("wellbeing_college_details")
          .insert(
            collegeDetails.map((detail) => ({
              wellBeingId,
              collegeEducationId: detail.collegeEducationId,
              collegeBranchId: detail.collegeBranchId,
              collegeAcademicYearId: detail.collegeAcademicYearId,
              collegeSectionsId: detail.collegeSectionsId,
              createdAt: timestamp,
              updatedAt: timestamp,
            })),
          );

        if (detailError) {
          throw new Error(detailError.message || "Wellbeing college details creation failed");
        }
      }
    }

    if (hasHostel) {
      const { error: hostelError } = await supabase
        .from("wellbeing_hostel_details")
        .insert({
          wellBeingId,
          block: payload.hostelBlock!.trim(),
          buildingNumber: payload.buildingNumber!.trim(),
          hostelType: payload.hostelType!,
          isActive: true,
          is_deleted: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

      if (hostelError) {
        throw new Error(hostelError.message || "Wellbeing hostel details creation failed");
      }
    }



    await upsertIdentifier({
      userId: createdUserId,
      collegeId: payload.collegeId,
      role: "WellbeingExecutive",
      identifierValue: payload.employeeId,
    });

    return { success: true, userId: createdUserId };
  } catch (err: unknown) {
    if (createdUserId) {
      try {
        await rollbackWellbeingExecutiveCreate(createdUserId, createdWellBeingId);
      } catch (rollbackError) {
        console.warn("rollback wellbeing executive create failed:", rollbackError);
      }
    }

    let message =
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again.";
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

  const rows = (data ?? []) as WellbeingBaseRow[];
  const assignedByWellBeingId = await fetchAssignedCategoriesByWellBeingIds(
    rows.map((row) => row.wellBeingId),
  );

  return rows.flatMap((row): WellbeingExecutiveListItem[] => {
    const user = getSingleRelation(row.users);
    const profile = user?.user_profile;
    const activeProfile = Array.isArray(profile)
      ? profile.find((p) => !p.is_deleted)
      : (profile?.is_deleted ? null : profile);
    const profileUrl = activeProfile?.profileUrl ?? "";

    const empIds = user?.employee_ids;
    const employeeId = Array.isArray(empIds)
      ? empIds[0]?.employeeId
      : empIds?.employeeId;

    const categoryIds = assignedByWellBeingId.get(row.wellBeingId) ?? [];
    return categoryIds.map((categoryId) => ({
      id: row.userId,
      name: user?.fullName ?? "",
      staffId: employeeId ?? "",
      role: "Executive",
      image: profileUrl ?? "",
      categoryId,
    }));
  });
}

export async function fetchPaginatedWellbeingExecutives(
  collegeId: number,
  page: number,
  limit: number,
  categoryId?: number | null
): Promise<{ executives: WellbeingExecutiveListItem[]; totalCount: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("well_beings")
    .select(
      `
      wellBeingId,
      userId,
      roleType,
      isActive,
      is_deleted,
      users:userId (
        fullName,
        email,
        user_profile (
          profileUrl,
          is_deleted
        ),
        employee_ids (
          employeeId
        )
      )
    `,
      { count: "exact" }
    )
    .eq("collegeId", collegeId)
    .eq("roleType", "wellbeingExecutive")
    .eq("isActive", true)
    .eq("is_deleted", false);

  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("fetchPaginatedWellbeingExecutives error:", error);
    throw error;
  }

  const rows = (data ?? []) as WellbeingBaseRow[];
  const assignedByWellBeingId = await fetchAssignedCategoriesByWellBeingIds(
    rows.map((row) => row.wellBeingId),
  );

  const filteredRows = categoryId !== undefined && categoryId !== null
    ? rows.filter((row) =>
      (assignedByWellBeingId.get(row.wellBeingId) ?? []).includes(categoryId),
    )
    : rows;

  const paginatedRows = filteredRows.slice(from, to + 1);

  const executives = paginatedRows.flatMap((row): WellbeingExecutiveListItem[] => {
    const user = getSingleRelation(row.users);
    const profile = user?.user_profile;
    const activeProfile = Array.isArray(profile)
      ? profile.find((p) => !p.is_deleted)
      : (profile?.is_deleted ? null : profile);
    const profileUrl = activeProfile?.profileUrl ?? "";

    const empIds = user?.employee_ids;
    const employeeId = Array.isArray(empIds)
      ? empIds[0]?.employeeId
      : empIds?.employeeId;

    const categoryIds = assignedByWellBeingId.get(row.wellBeingId) ?? [];
    const visibleCategoryIds = categoryId !== undefined && categoryId !== null
      ? categoryIds.filter((id) => id === categoryId)
      : categoryIds;

    return visibleCategoryIds.map((assignedCategoryId) => ({
      id: row.userId,
      name: user?.fullName ?? "",
      email: user?.email ?? "",
      staffId: employeeId ?? "",
      role: "Executive",
      image: profileUrl ?? "",
      categoryId: assignedCategoryId,
    }));
  });

  return {
    executives,
    totalCount: filteredRows.length,
  };
}

