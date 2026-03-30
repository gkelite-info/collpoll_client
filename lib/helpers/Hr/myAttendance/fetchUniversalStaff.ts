import { supabase } from "@/lib/supabaseClient";

export interface UniversalProfileData {
  id: number | string; // The specific table ID (e.g., facultyId)
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

// ── 1. THE DYNAMIC CONFIGURATION DICTIONARY ─────────────────────────────
// If you add a new role next year, just add it here. Zero logic changes needed.
const ROLE_TABLE_MAP: Record<string, { tableName: string; idColumn: string }> =
  {
    faculty: { tableName: "faculty", idColumn: "facultyId" },
    admin: { tableName: "admins", idColumn: "adminId" },
    collegeadmin: { tableName: "college_admins", idColumn: "collegeAdminId" }, // Update table name if different in your DB
    collegehr: { tableName: "college_hr", idColumn: "collegeHrId" },
    financemanager: {
      tableName: "finance_managers",
      idColumn: "financeManagerId",
    },
  };

// Normalizes strings: "College-Admin", "collegeAdmin", "College Admin" all become "collegeadmin"
const normalizeRole = (role: string) =>
  role.toLowerCase().replace(/[-_ ]/g, "");

// ── 2. THE UNIVERSAL FETCHER ────────────────────────────────────────────
export const fetchUniversalStaffProfile = async (
  userId: string | number,
  roleStr?: string | null,
): Promise<UniversalProfileData | null> => {
  try {
    // A. Fetch Base User Data (Exists for everyone)
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select(
        "userId, fullName, email, mobile, role, gender, dateOfJoining, professionalExperienceYears, collegeCode",
      )
      .eq("userId", userId)
      .single();

    if (userErr || !user) throw new Error("User not found in base table");

    const normalizedRole = normalizeRole(roleStr || user.role || "");
    const roleConfig = ROLE_TABLE_MAP[normalizedRole];

    let tableId: number | string = user.userId; // Safe fallback

    // B. Dynamically query the specific role table without if/else logic
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

    // C. Return the standardized profile
    return {
      id: tableId, // This is now dynamically facultyId, adminId, etc.
      userId: user.userId,
      name: user.fullName || "Unknown",
      email: user.email || "N/A",
      mobile: user.mobile || "N/A",
      role: user.role || "Staff",
      department: user.collegeCode || "Administration", // Using collegeCode as the branch/dept
      gender: user.gender || "N/A",
      joiningDate: user.dateOfJoining
        ? new Date(user.dateOfJoining).toLocaleDateString("en-GB")
        : "Not Provided",
      experience: user.professionalExperienceYears || null,
      image: null,
    };
  } catch (error) {
    console.error("Error fetching universal staff profile:", error);
    return null;
  }
};
