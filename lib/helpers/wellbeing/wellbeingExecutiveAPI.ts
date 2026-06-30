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
  professionalExperienceYears?: number;
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
  professionalExperienceYears?: number;
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
  userId?: number | null;
  profileUrl?: string | null;
  is_deleted?: boolean | null;
  deletedAt?: string | null;
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

export type GroundStaffMemberListItem = {
  id: number;
  groundStaffId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  staffId: string;
  designation: string;
  dateOfJoining: string | null;
  image: string;
  categoryId: number;
  subCategoryId: number;
};

export type GroundStaffAttendanceStatus = "present" | "absent" | "late" | "leave";

export type GroundStaffAttendanceListItem = {
  groundStaffAttendanceId: number;
  staffId: number;
  date: string;
  status: GroundStaffAttendanceStatus;
  checkIn: string;
  checkOut: string;
  workHours: string;
};

export type GroundStaffAttendancePayload = {
  staffId: number;
  date: string;
  status: GroundStaffAttendanceStatus;
  checkIn?: string | null;
  checkOut?: string | null;
  workHours?: string | null;
  markedBy?: number | null;
};

export type CollegeTimingBreak = {
  breakId: number;
  startTime: string;
  endTime: string;
};

export type CollegeTimingForDate = {
  collegeTimingId: number;
  dayOfWeek: string;
  isOpen: boolean;
  openAt: string | null;
  lunchFrom: string | null;
  lunchTo: string | null;
  closeAt: string | null;
  breaks: CollegeTimingBreak[];
};

const getSingleRelation = <T,>(relation: T | T[] | null | undefined) =>
  Array.isArray(relation) ? relation[0] : relation;

type GroundStaffUserRelation = {
  userId?: number | null;
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
  dateOfJoining?: string | null;
  isActive?: boolean | null;
  is_deleted?: boolean | null;
  user_profile?: UserProfileRow | UserProfileRow[] | null;
  employee_ids?: EmployeeIdRow | EmployeeIdRow[] | null;
};

type GroundStaffSubCategoryRelation = {
  subCategoryName?: string | null;
};

type GroundStaffBaseRow = {
  groundStaffId: number;
  userId: number;
  categoryId: number;
  subCategoryId: number;
  users?: GroundStaffUserRelation | GroundStaffUserRelation[] | null;
  wellbeing_sub_categories?: GroundStaffSubCategoryRelation | GroundStaffSubCategoryRelation[] | null;
};

const getEmployeeId = (employeeIds: EmployeeIdRow | EmployeeIdRow[] | null | undefined) =>
  Array.isArray(employeeIds) ? employeeIds[0]?.employeeId ?? "" : employeeIds?.employeeId ?? "";

const fetchProfileUrlsByUserIds = async (userIds: number[]) => {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));

  if (!uniqueUserIds.length) {
    return new Map<number, string>();
  }

  const { data, error } = await supabase
    .from("user_profile")
    .select("userId, profileUrl, is_deleted, deletedAt")
    .in("userId", uniqueUserIds)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (error) {
    console.error("fetchProfileUrlsByUserIds error:", error);
    return new Map<number, string>();
  }

  return ((data ?? []) as UserProfileRow[]).reduce((map, row) => {
    if (row.userId && row.profileUrl) {
      map.set(row.userId, row.profileUrl);
    }

    return map;
  }, new Map<number, string>());
};

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

const getDayOfWeekFromDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][parsed.getDay()];
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

export async function fetchGroundStaffMembers(
  collegeId: number,
  searchQuery = "",
): Promise<GroundStaffMemberListItem[]> {
  const { data, error } = await supabase
    .from("ground_staff")
    .select(`
      groundStaffId,
      userId,
      categoryId,
      subCategoryId,
      users:userId (
        userId,
        fullName,
        email,
        mobile,
        dateOfJoining,
        isActive,
        is_deleted,
        employee_ids (
          employeeId
        )
      ),
      wellbeing_sub_categories:subCategoryId (
        subCategoryName
      )
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("fetchGroundStaffMembers error:", error);
    throw error;
  }

  const rows = (data ?? []) as GroundStaffBaseRow[];
  const profileUrlsByUserId = await fetchProfileUrlsByUserIds(
    rows.map((row) => row.userId),
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  return rows.flatMap((row) => {
    const user = getSingleRelation(row.users);

    if (!user || user.is_deleted || user.isActive === false) {
      return [];
    }

    const subCategory = getSingleRelation(row.wellbeing_sub_categories);

    const staffId = getEmployeeId(user.employee_ids) || `GS${String(row.groundStaffId).padStart(3, "0")}`;
    const name = user.fullName ?? "Ground Staff";

    if (
      normalizedSearch &&
      !name.toLowerCase().includes(normalizedSearch) &&
      !staffId.toLowerCase().includes(normalizedSearch)
    ) {
      return [];
    }

    return [
      {
        id: row.groundStaffId,
        groundStaffId: row.groundStaffId,
        userId: row.userId,
        name,
        email: user.email ?? "",
        phone: user.mobile ?? "",
        staffId,
        designation: subCategory?.subCategoryName ?? "Ground Staff",
        dateOfJoining: user.dateOfJoining ?? null,
        image: profileUrlsByUserId.get(row.userId) ?? "",
        categoryId: row.categoryId,
        subCategoryId: row.subCategoryId,
      },
    ];
  });
}

export async function fetchGroundStaffAttendancesByDate(
  staffIds: number[],
  date: string,
): Promise<GroundStaffAttendanceListItem[]> {
  const uniqueStaffIds = Array.from(new Set(staffIds.filter(Boolean)));

  if (!uniqueStaffIds.length || !date) {
    return [];
  }

  const { data, error } = await supabase
    .from("ground_staff_attendances")
    .select("groundStaffAttendanceId, staffId, date, status, checkIn, checkOut, workHours")
    .in("staffId", uniqueStaffIds)
    .eq("date", date)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (error) {
    console.error("fetchGroundStaffAttendancesByDate error:", error);
    throw error;
  }

  return ((data ?? []) as {
    groundStaffAttendanceId: number;
    staffId: number;
    date: string;
    status: GroundStaffAttendanceStatus;
    checkIn?: string | null;
    checkOut?: string | null;
    workHours?: string | null;
  }[]).map((row) => ({
    groundStaffAttendanceId: row.groundStaffAttendanceId,
    staffId: row.staffId,
    date: row.date,
    status: row.status,
    checkIn: row.checkIn ?? "",
    checkOut: row.checkOut ?? "",
    workHours: row.workHours ?? "",
  }));
}

export async function fetchGroundStaffAttendancesForStaff(
  staffId: number,
  fromDate: string,
  toDate: string,
): Promise<GroundStaffAttendanceListItem[]> {
  if (!staffId || !fromDate || !toDate) {
    return [];
  }

  const { data, error } = await supabase
    .from("ground_staff_attendances")
    .select("groundStaffAttendanceId, staffId, date, status, checkIn, checkOut, workHours")
    .eq("staffId", staffId)
    .gte("date", fromDate)
    .lte("date", toDate)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .order("date", { ascending: false });

  if (error) {
    console.error("fetchGroundStaffAttendancesForStaff error:", error);
    throw error;
  }

  return ((data ?? []) as {
    groundStaffAttendanceId: number;
    staffId: number;
    date: string;
    status: GroundStaffAttendanceStatus;
    checkIn?: string | null;
    checkOut?: string | null;
    workHours?: string | null;
  }[]).map((row) => ({
    groundStaffAttendanceId: row.groundStaffAttendanceId,
    staffId: row.staffId,
    date: row.date,
    status: row.status,
    checkIn: row.checkIn ?? "",
    checkOut: row.checkOut ?? "",
    workHours: row.workHours ?? "",
  }));
}

export async function fetchCollegeTimingForDate(
  collegeId: number,
  date: string,
): Promise<CollegeTimingForDate | null> {
  const dayOfWeek = getDayOfWeekFromDate(date);

  if (!collegeId || !dayOfWeek) {
    return null;
  }

  const { data: timing, error: timingError } = await supabase
    .from("college_timings")
    .select("collegeTimingId, dayOfWeek, isOpen, openAt, lunchFrom, lunchTo, closeAt")
    .eq("collegeId", collegeId)
    .eq("dayOfWeek", dayOfWeek)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .maybeSingle();

  if (timingError) {
    console.error("fetchCollegeTimingForDate error:", timingError);
    throw timingError;
  }

  if (!timing) {
    return null;
  }

  const { data: breaks, error: breaksError } = await supabase
    .from("college_break_timings")
    .select("breakId, startTime, endTime")
    .eq("collegeTimingId", timing.collegeTimingId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (breaksError) {
    console.error("fetchCollegeTimingForDate breaks error:", breaksError);
    throw breaksError;
  }

  return {
    collegeTimingId: timing.collegeTimingId,
    dayOfWeek: timing.dayOfWeek,
    isOpen: timing.isOpen,
    openAt: timing.openAt ?? null,
    lunchFrom: timing.lunchFrom ?? null,
    lunchTo: timing.lunchTo ?? null,
    closeAt: timing.closeAt ?? null,
    breaks: ((breaks ?? []) as CollegeTimingBreak[]).map((item) => ({
      breakId: item.breakId,
      startTime: item.startTime,
      endTime: item.endTime,
    })),
  };
}

export async function upsertGroundStaffAttendances(
  payloads: GroundStaffAttendancePayload[],
) {
  if (!payloads.length) {
    return [];
  }

  const timestamp = new Date().toISOString();
  const rows = payloads.map((payload) => ({
    staffId: payload.staffId,
    date: payload.date,
    status: payload.status,
    checkIn: payload.checkIn || null,
    checkOut: payload.checkOut || null,
    workHours: payload.workHours || null,
    markedBy: payload.markedBy ?? null,
    isActive: true,
    is_deleted: false,
    deletedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  const { data, error } = await supabase
    .from("ground_staff_attendances")
    .upsert(rows, { onConflict: "staffId,date" })
    .select("groundStaffAttendanceId, staffId, date, status, checkIn, checkOut, workHours");

  if (error) {
    console.error("upsertGroundStaffAttendances error:", error);
    throw error;
  }

  return data ?? [];
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

