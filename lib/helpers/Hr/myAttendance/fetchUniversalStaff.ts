import { supabase } from "@/lib/supabaseClient";

export interface UniversalProfileData {
  id: number | string;
  identifierId: string | null;
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
    collegeadmin: { tableName: "college_admin", idColumn: "collegeAdminId" },
    collegehr: { tableName: "college_hr", idColumn: "collegeHrId" },
    financemanager: {
      tableName: "finance_manager",
      idColumn: "financeManagerId",
    },
    accountant: {
      tableName: "accountants",
      idColumn: "accountantId",
    },
    placementofficer: {
      tableName: "placement_employee",
      idColumn: "placementEmployeeId",
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
    let identifierId: string | null = null;

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

    if (normalizedRole === "student") {
      const { data: studentRow } = await supabase
        .from("students")
        .select("studentId")
        .eq("userId", user.userId)
        .is("deletedAt", null)
        .maybeSingle();

      if (studentRow?.studentId) {
        const { data: pinRow } = await supabase
          .from("student_pins")
          .select("pinNumber")
          .eq("studentId", studentRow.studentId)
          .eq("collegeId", user.collegeId)
          .eq("isActive", true)
          .is("deletedAt", null)
          .maybeSingle();
        identifierId = pinRow?.pinNumber ?? null;
      }
    } else {
      const { data: empRow } = await supabase
        .from("employee_ids")
        .select("employeeId")
        .eq("userId", user.userId)
        .eq("collegeId", user.collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .maybeSingle();
      identifierId = empRow?.employeeId ?? null;
    }

    return {
      id: identifierId ?? tableId,
      identifierId,
      userId: user.userId,
      name: user.fullName || "Unknown",
      email: user.email || "N/A",
      mobile: user.mobile || "N/A",
      role: user.role || "Staff",
      department: user.collegeBranchCode || user.department || user.collegeCode || "-",
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
