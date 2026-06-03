import { supabase } from "@/lib/supabaseClient";

type AdminJoin = {
  adminId: number;
  userId: number;
  collegeId: number;
  collegePublicId: string;
  collegeCode: string;
  collegeEducationId: number | null;

  college: {
    collegeCode: string;
  };
  college_education: {
    collegeEducationType: string;
  } | null;
};

type AdminEducationTypeJoin = {
  collegeEducationId: number;
  college_education: {
    collegeEducationType: string;
  } | null;
};

export async function fetchAdminContext(userId: number | null) {
  const { data: admin, error } = await supabase
    .from("admins")
    .select(`
      adminId,
      userId,
      collegeId,
      collegePublicId,
      collegeEducationId,

      college:collegeId!inner (
        collegeCode
      ),
      college_education:collegeEducationId (
        collegeEducationType
      )
    `)
    .eq("userId", userId)
    .is("deletedAt", null)
    .single<AdminJoin>();

  if (error) throw error;

  const { data: adminEducationTypes, error: educationError } = await supabase
    .from("admin_education_types")
    .select(`
      collegeEducationId,
      college_education:collegeEducationId (
        collegeEducationType
      )
    `)
    .eq("adminId", admin.adminId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .order("adminEducationTypeId", { ascending: true })
    .returns<AdminEducationTypeJoin[]>();

  if (educationError) throw educationError;

  const primaryEducation = adminEducationTypes?.[0] ?? null;

  return {
    adminId: admin.adminId,
    userId: admin.userId,
    collegeId: admin.collegeId,
    collegePublicId: admin.collegePublicId,
    collegeCode: admin.college.collegeCode,
    collegeEducationId: primaryEducation?.collegeEducationId ?? admin.collegeEducationId,
    collegeEducationType:
      primaryEducation?.college_education?.collegeEducationType ??
      admin.college_education?.collegeEducationType ??
      null,
  };
}
