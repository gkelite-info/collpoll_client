import { supabase } from "@/lib/supabaseClient";

export type SelectUser = {
  id: number;
  userId: number;
  name: string;
  subLabel: string;
  avatar?: string | null;
  displayId?: string;
};

function mapUserToSelectUser(u: any): SelectUser {
  const profile = u.user_profile;
  const profileUrl = Array.isArray(profile) ? profile[0]?.profileUrl : profile?.profileUrl;

  const empIds = u.employee_ids;
  let displayId = Array.isArray(empIds) ? empIds[0]?.employeeId : empIds?.employeeId;

  if (!displayId && u.students) {
    const std = Array.isArray(u.students) ? u.students[0] : u.students;
    const pins = std?.student_pins;
    displayId = Array.isArray(pins) ? pins[0]?.pinNumber : pins?.pinNumber;
  }

  // Handle Parent Role linked Student ID with M/F
  if (u.role === "Parent" && u.parents) {
    const parentRecord = Array.isArray(u.parents) ? u.parents[0] : u.parents;
    if (parentRecord && parentRecord.students) {
      const linkedStudent = Array.isArray(parentRecord.students) ? parentRecord.students[0] : parentRecord.students;
      const linkedPins = linkedStudent?.student_pins;
      const linkedStudentId = Array.isArray(linkedPins) ? linkedPins[0]?.pinNumber : linkedPins?.pinNumber;

      if (linkedStudentId) {
        const genderChar = u.gender?.toLowerCase() === 'female' ? 'M' : (u.gender?.toLowerCase() === 'male' ? 'F' : '');
        displayId = genderChar ? `${linkedStudentId}/${genderChar}` : linkedStudentId;
      }
    }
  }

  let displayRole = u.role || "User";
  if (displayRole === "Finance") {
    displayRole = "FinanceExecutive";
  }

  return {
    id: u.userId, // Using userId as primary id for this generic query
    userId: u.userId,
    name: u.fullName || "",
    subLabel: displayRole,
    avatar: profileUrl || null,
    displayId: displayId || u.userId.toString(),
  };
}

export async function getAllUsersForSearch(
  collegeId: number,
  searchQuery?: string,
  limit?: number,
  offset?: number,
  includeUserId?: number | null,
  currentUserRole?: string | null
): Promise<SelectUser[]> {
  if (!collegeId) return [];

  // As per current requirements, superadmin is always excluded for all roles.
  // This may be updated later after team discussion to allow CollegeAdmin to see superadmin.
  const excludedRoles: string[] = ["superadmin"];

  let query = supabase
    .from("users")
    .select(`
      userId,
      fullName,
      role,
      gender,
      user_profile(profileUrl),
      employee_ids(employeeId),
      students(student_pins(pinNumber)),
      parents(
        students(
          student_pins(pinNumber)
        )
      )
    `)
    .eq("collegeId", collegeId)
    .eq("is_deleted", false);

  if (excludedRoles.length > 0) {
    const excludedRolesStr = excludedRoles.join(",");
    if (includeUserId) {
      query = query.or(`role.not.in.(${excludedRolesStr}),role.is.null,userId.eq.${includeUserId}`);
    } else {
      query = query.or(`role.not.in.(${excludedRolesStr}),role.is.null`);
    }
  }

  if (searchQuery) {
    const matchedUserIds = new Set<number>();

    // Check employee_ids
    const { data: empData } = await supabase
      .from("employee_ids")
      .select("userId")
      .ilike("employeeId", `%${searchQuery}%`);

    if (empData) empData.forEach(r => matchedUserIds.add(r.userId));

    // Check student_pins
    const { data: pinData } = await supabase
      .from("student_pins")
      .select("studentId")
      .ilike("pinNumber", `%${searchQuery}%`);

    if (pinData && pinData.length > 0) {
      const studentIds = pinData.map(p => p.studentId);

      const [stdData, parentData] = await Promise.all([
        supabase.from("students").select("userId").in("studentId", studentIds),
        supabase.from("parents").select("userId").in("studentId", studentIds)
      ]);

      if (stdData.data) stdData.data.forEach(r => matchedUserIds.add(r.userId));
      if (parentData.data) parentData.data.forEach(r => matchedUserIds.add(r.userId));
    }

    if (matchedUserIds.size > 0) {
      const ids = Array.from(matchedUserIds).join(',');
      query = query.or(`fullName.ilike.%${searchQuery}%,userId.in.(${ids})`);
    } else {
      query = query.ilike("fullName", `%${searchQuery}%`);
    }
  }

  query = query.order("fullName", { ascending: true, nullsFirst: false }).order("userId", { ascending: true });

  if (limit !== undefined && offset !== undefined) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(mapUserToSelectUser);
}

export async function getUsersByIds(
  collegeId: number,
  userIds: number[]
): Promise<SelectUser[]> {
  if (!collegeId || !userIds || userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("users")
    .select(`
      userId,
      fullName,
      role,
      gender,
      user_profile(profileUrl),
      employee_ids(employeeId),
      students(student_pins(pinNumber)),
      parents(
        students(
          student_pins(pinNumber)
        )
      )
    `)
    .eq("collegeId", collegeId)
    .in("userId", userIds);

  if (error) throw error;

  return (data || []).map(mapUserToSelectUser);
}


export async function getCollegeUsers(
  role: "Admin" | "Faculty" | "Finance" | "Student",
  collegeId: number,
  educationTypeId?: number,
  searchQuery?: string,
  isSchool = false,
): Promise<SelectUser[]> {
  if (!collegeId) return [];

  // ================= ADMIN =================
  if (role === "Admin") {
    let assignedSchoolAdminIds: number[] | null = null;
    if (isSchool && educationTypeId) {
      const { data: assignments, error: assignmentError } = await supabase
        .from("admin_education_types")
        .select("adminId")
        .eq("collegeEducationId", educationTypeId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null);

      if (assignmentError) throw assignmentError;
      assignedSchoolAdminIds = [
        ...new Set((assignments ?? []).map((assignment) => Number(assignment.adminId))),
      ];
    }

    let query = supabase
      .from("admins")
      .select(
        `
        adminId,
        userId,
        fullName,
        collegeEducation:collegeEducationId(collegeEducationType),
        users:userId(
          user_profile(profileUrl),
          employee_ids(employeeId)
        )
      `,
      )
      .eq("collegeId", collegeId)
      .eq("is_deleted", false);

    if (assignedSchoolAdminIds?.length) {
      query = query.or(
        `collegeEducationId.eq.${educationTypeId},adminId.in.(${assignedSchoolAdminIds.join(",")})`,
      );
    } else if (assignedSchoolAdminIds) {
      query = query.eq("collegeEducationId", educationTypeId!);
    } else if (educationTypeId) {
      query = query.eq("collegeEducationId", educationTypeId);
    }
    if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((a: any) => {
      const profile = a.users?.user_profile;
      const profileUrl = Array.isArray(profile)
        ? profile[0]?.profileUrl
        : profile?.profileUrl;
      const empIds = a.users?.employee_ids;
      const empId = Array.isArray(empIds) ? empIds[0]?.employeeId : empIds?.employeeId;

      return {
        id: a.adminId,
        userId: a.userId,
        name: a.fullName,
        subLabel: role,
        avatar: profileUrl || null,
        displayId: empId || a.userId.toString(),
      };
    });
  }

  // ================= FINANCE =================
  if (role === "Finance") {
    let query = supabase
      .from("finance_manager")
      .select(
        `
        financeManagerId,
        userId,
        users!inner(
          fullName,
          user_profile(profileUrl),
          employee_ids(employeeId)
        ),
        collegeEducation:collegeEducationId(collegeEducationType)
      `,
      )
      .eq("collegeId", collegeId)
      .eq("is_deleted", false);

    if (educationTypeId)
      query = query.eq("collegeEducationId", educationTypeId);
    if (searchQuery) query = query.ilike("users.fullName", `%${searchQuery}%`);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((f: any) => {
      const profile = f.users?.user_profile;
      const profileUrl = Array.isArray(profile)
        ? profile[0]?.profileUrl
        : profile?.profileUrl;
      const empIds = f.users?.employee_ids;
      const empId = Array.isArray(empIds) ? empIds[0]?.employeeId : empIds?.employeeId;

      return {
        id: f.financeManagerId,
        userId: f.userId,
        name: f.users?.fullName ?? "",
        subLabel: role === "Finance" ? "FinanceExecutive" : role,
        avatar: profileUrl || null,
        displayId: empId || f.userId.toString(),
      };
    });
  }

  // ================= FACULTY =================
  if (role === "Faculty") {
    let query = supabase
      .from("faculty")
      .select(
        `
        facultyId,
        userId,
        fullName,
        collegeEducation:collegeEducationId(collegeEducationType),
        collegeBranch:collegeBranchId(collegeBranchCode),
        faculty_sections(
          collegeSections:collegeSectionsId(collegeSections),
          collegeAcademicYear:collegeAcademicYearId(collegeAcademicYear)
        ),
        users:userId(
          user_profile(profileUrl),
          employee_ids(employeeId)
        )
      `,
      )
      .eq("collegeId", collegeId)
      .eq("isActive", true);

    if (educationTypeId)
      query = query.eq("collegeEducationId", educationTypeId);
    if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((f: any) => {
      const profile = f.users?.user_profile;
      const profileUrl = Array.isArray(profile)
        ? profile[0]?.profileUrl
        : profile?.profileUrl;
      const empIds = f.users?.employee_ids;
      const empId = Array.isArray(empIds) ? empIds[0]?.employeeId : empIds?.employeeId;

      return {
        id: f.facultyId,
        userId: f.userId,
        name: f.fullName,
        subLabel: role,
        avatar: profileUrl || null,
        displayId: empId || f.userId.toString(),
      };
    });
  }

  // ================= STUDENT =================
  if (role === "Student") {
    let query = supabase
      .from("students")
      .select(`
        studentId,
        userId,
        fullName,
        collegeEducation:collegeEducationId(collegeEducationType),
        collegeBranch:collegeBranchId(collegeBranchCode),
        collegeAcademicYear:collegeAcademicYearId(collegeAcademicYear),
        collegeSections:collegeSectionsId(collegeSections),
        student_pins(pinNumber),
        users:userId(
          user_profile(profileUrl)
        )
      `)
      .eq("collegeId", collegeId)
      .eq("isActive", true);

    if (educationTypeId)
      query = query.eq("collegeEducationId", educationTypeId);
    if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((s: any) => {
      const profile = s.users?.user_profile;
      const profileUrl = Array.isArray(profile)
        ? profile[0]?.profileUrl
        : profile?.profileUrl;

      const pins = s.student_pins;
      const pin = Array.isArray(pins) ? pins[0]?.pinNumber : pins?.pinNumber;

      return {
        id: s.studentId,
        userId: s.userId,
        name: s.fullName,
        subLabel: role,
        avatar: profileUrl || null,
        displayId: pin || s.userId.toString(),
      };
    });
  }

  return [];
}
