import { supabase } from "@/lib/supabaseClient";

export type SelectUser = {
  id: number;
  userId: number;
  name: string;
  subLabel: string;
  avatar?: string | null;
};

export async function getCollegeUsers(
  role: "Admin" | "Faculty" | "Finance",
  collegeId: number,
  educationTypeId?: number,
  searchQuery?: string,
): Promise<SelectUser[]> {
  if (!collegeId) return [];

  // ================= ADMIN =================
  if (role === "Admin") {
    let query = supabase
      .from("admins")
      .select(
        `
        adminId,
        userId,
        fullName,
        collegeEducation:collegeEducationId(collegeEducationType),
        users:userId(
          user_profile(profileUrl)
        )
      `,
      )
      .eq("collegeId", collegeId)
      .eq("is_deleted", false);

    if (educationTypeId)
      query = query.eq("collegeEducationId", educationTypeId);
    if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((a: any) => {
      const profile = a.users?.user_profile;
      const profileUrl = Array.isArray(profile)
        ? profile[0]?.profileUrl
        : profile?.profileUrl;
      return {
        id: a.adminId,
        userId: a.userId,
        name: a.fullName,
        subLabel: a.collegeEducation?.collegeEducationType ?? "",
        avatar: profileUrl || null,
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
          user_profile(profileUrl)
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
      return {
        id: f.financeManagerId,
        userId: f.userId,
        name: f.users?.fullName ?? "",
        subLabel: f.collegeEducation?.collegeEducationType ?? "",
        avatar: profileUrl || null,
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
          collegeSections:collegeSectionsId(collegeSections)
        ),
        users:userId(
          user_profile(profileUrl)
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
      const sections =
        f.faculty_sections
          ?.map((s: any) => s.collegeSections?.collegeSections)
          .filter(Boolean) || [];
      const profile = f.users?.user_profile;
      const profileUrl = Array.isArray(profile)
        ? profile[0]?.profileUrl
        : profile?.profileUrl;

      return {
        id: f.facultyId,
        userId: f.userId,
        name: f.fullName,
        subLabel: `${f.collegeEducation?.collegeEducationType ?? ""} - ${f.collegeBranch?.collegeBranchCode ?? ""} - ${sections.join(", ")}`,
        avatar: profileUrl || null,
      };
    });
  }

  return [];
}
