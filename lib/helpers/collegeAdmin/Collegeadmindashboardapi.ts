import { supabase } from "@/lib/supabaseClient";

export type AdminDetail = {
  adminId: number;
  fullName: string;
  email: string;
  mobile: string;
  gender: string;
  createdAt: string;
  collegeEducationId: number;
  eduType: string;
  branchCount: number;
  isActive: boolean;
};

export type EduTypeStat = {
  collegeEducationId: number;
  eduType: string;
  adminCount: number;
  branchCount: number;
};

export type DashboardStats = {
  educationTypeCount: number;
  totalAdmins: number;
  totalBranches: number;
  totalUsers: number;
  eduTypeStats: EduTypeStat[];
  adminDetails: AdminDetail[];
};

export async function fetchCollegeAdminDashboardStats(
  collegeId: number
): Promise<DashboardStats> {

  // Run all 4 queries in parallel
  const [eduRes, adminsRes, branchRes, usersRes] = await Promise.all([

    // 1. All education types for this college
    supabase
      .from("college_education")
      .select("collegeEducationId, collegeEducationType")
      .eq("collegeId", collegeId)
      .eq("isActive", true),

    // 2. All admins for this college + their education type name
    supabase
      .from("admins")
      .select(`
        adminId,
        fullName,
        email,
        mobile,
        gender,
        createdAt,
        collegeEducationId,
        is_deleted,
        college_education ( collegeEducationType )
      `)
      .eq("collegeId", collegeId)
      .eq("is_deleted", false),

    // 3. All branches for this college
    supabase
      .from("college_branch")
      .select("collegeBranchId, collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("isActive", true),

    // 4. Total users count for this college (all roles)
    supabase
      .from("users")
      .select("userId", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("is_deleted", false),
  ]);

  if (eduRes.error)     throw eduRes.error;
  if (adminsRes.error)  throw adminsRes.error;
  if (branchRes.error)  throw branchRes.error;
  if (usersRes.error)   throw usersRes.error;

  const eduList    = eduRes.data    ?? [];
  const adminList  = adminsRes.data ?? [];
  const branchList = branchRes.data ?? [];
  const totalUsers = usersRes.count ?? 0;

  // Build per-eduType stats
  const eduTypeStats: EduTypeStat[] = eduList.map((edu) => ({
    collegeEducationId: edu.collegeEducationId,
    eduType:            edu.collegeEducationType,
    adminCount:  adminList.filter((a) => a.collegeEducationId === edu.collegeEducationId).length,
    branchCount: branchList.filter((b) => b.collegeEducationId === edu.collegeEducationId).length,
  }));

  // Format admin details — attach branchCount for their eduType
  const adminDetails: AdminDetail[] = adminList.map((a: any) => {
    const eduStat = eduTypeStats.find(
      (e) => e.collegeEducationId === a.collegeEducationId
    );
    return {
      adminId:            a.adminId,
      fullName:           a.fullName,
      email:              a.email,
      mobile:             a.mobile,
      gender:             a.gender ?? "—",
      createdAt:          new Date(a.createdAt).toLocaleDateString("en-IN"),
      collegeEducationId: a.collegeEducationId,
      eduType:            (a.college_education as any)?.collegeEducationType ?? "N/A",
      branchCount:        eduStat?.branchCount ?? 0,
      isActive:           true,
    };
  });

  return {
    educationTypeCount: eduList.length,
    totalAdmins:        adminList.length,
    totalBranches:      branchList.length,
    totalUsers,
    eduTypeStats,
    adminDetails,
  };
}
