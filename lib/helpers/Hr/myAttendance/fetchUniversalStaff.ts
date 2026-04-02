import { supabase } from "@/lib/supabaseClient";

export interface UniversalProfileData {
  id: number | string;
  userId: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  gender: string;
  joiningDate: string | null;
  experience: number | null;
  image: string | null;
}

const ROLE_TABLE_MAP: Record<string, { tableName: string; idColumn: string }> =
  {
    faculty: { tableName: "faculty", idColumn: "facultyId" },
    admin: { tableName: "admins", idColumn: "adminId" },
    collegeadmin: { tableName: "college_admins", idColumn: "collegeAdminId" },
    collegehr: { tableName: "college_hr", idColumn: "collegeHrId" },
    financemanager: {
      tableName: "finance_managers",
      idColumn: "financeManagerId",
    },
  };

const normalizeRole = (role: string) =>
  role.toLowerCase().replace(/[-_ ]/g, "");

export const fetchUniversalStaffProfile = async (
  userId: string | number,
  roleStr?: string | null,
): Promise<UniversalProfileData | null> => {
  try {
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select(
        `
    *,
    user_profile ( profileUrl )
  `,
      )
      .eq("userId", userId)
      .single();

    if (userErr || !user) throw new Error("User not found in base table");

    const normalizedRole = normalizeRole(roleStr || user.role || "");
    const roleConfig = ROLE_TABLE_MAP[normalizedRole];

    let tableId: number | string = user.userId;

    if (roleConfig) {
      const { data: roleData, error: roleErr } = await supabase
        .from(roleConfig.tableName)
        .select(roleConfig.idColumn)
        .eq("userId", userId)
        .maybeSingle();

      if (!roleErr && roleData) {
        tableId = (roleData as Record<string, any>)[roleConfig.idColumn];
      }
    }

    return {
      id: tableId,
      userId: user.userId,
      name: user.fullName || "Unknown",
      email: user.email || "N/A",
      mobile: user.mobile || "N/A",
      role: user.role || "Staff",
      department: user.collegeCode || "Administration",
      gender: user.gender || "N/A",
      joiningDate: user.dateOfJoining
        ? new Date(user.dateOfJoining).toLocaleDateString("en-GB")
        : "Not Provided",
      experience: user.professionalExperienceYears || null,
      image: user.user_profile?.[0]?.profileUrl,
    };
  } catch (error) {
    console.error("Error fetching universal staff profile:", error);
    return null;
  }
};
