import { supabase } from "@/lib/supabaseClient";

export type SelectUser = {
  id: number;
  userId: number;
  name: string;
  subLabel: string;
};

export async function getCollegeUsers(
  role: "Admin" | "Faculty" | "Finance",
  collegeId: number
): Promise<SelectUser[]> {
  if (!collegeId) {
    return [];
  }
  if (role === "Admin") {
    const { data, error } = await supabase
      .from("admins")
      .select(`
        adminId,
        userId,
        fullName,
        collegeEducation:collegeEducationId(
          collegeEducationType
        )
      `)
      .eq("collegeId", collegeId)
      .eq("is_deleted", false);

    if (error) {
      console.error(" Admin fetch error:", error);
      throw error;
    }

    const mapped = (data || []).map((a: any) => ({
      id: a.adminId,
      userId: a.userId,
      name: a.fullName,
      subLabel: a.collegeEducation?.collegeEducationType ?? "",
    }));

    return mapped;
  }

  if (role === "Finance") {

    console.log("Fetching finance managers...");

    const { data, error } = await supabase
      .from("finance_manager")
      .select(`
        financeManagerId,
        userId,
        users(
          fullName
        ),
        collegeEducation:collegeEducationId(
          collegeEducationType
        )
      `)
      .eq("collegeId", collegeId)
      .eq("is_deleted", false);

    if (error) {
      console.error(" Finance fetch error:", error);
      throw error;
    }

    const mapped = (data || []).map((f: any) => ({
      id: f.financeManagerId,
      userId: f.userId,
      name: f.users?.fullName ?? "",
      subLabel: f.collegeEducation?.collegeEducationType ?? "",
    }));

    return mapped;
  }

  if (role === "Faculty") {
    const { data, error } = await supabase
      .from("faculty")
      .select(`
        facultyId,
        userId,
        fullName,
        collegeEducation:collegeEducationId(
          collegeEducationType
        ),
        collegeBranch:collegeBranchId(
          collegeBranchCode
        ),
        faculty_sections(
          collegeSections:collegeSectionsId(
            collegeSections
          )
        )
      `)
      .eq("collegeId", collegeId)
      .eq("isActive", true);

    if (error) {
      console.error(" Faculty fetch error:", error);
      throw error;
    }

    const mapped = (data || []).map((f: any) => {

      const sections =
        f.faculty_sections?.map(
          (s: any) => s.collegeSections?.collegeSections
        ).filter(Boolean) || [];

      const sectionLabel = sections.join(", ");

      const branch = f.collegeBranch?.collegeBranchCode ?? "";
      const edu = f.collegeEducation?.collegeEducationType ?? "";

      return {
        id: f.facultyId,
        userId: f.userId,
        name: f.fullName,
        subLabel: `${edu} - ${branch} - ${sectionLabel}`,
      };
    });

    return mapped;
  }
  return [];
}