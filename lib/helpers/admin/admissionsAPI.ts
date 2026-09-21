import { supabase } from "@/lib/supabaseClient";
import { fetchBranchOptionsDirectly } from "@/lib/helpers/admin/collegeBranchAPI";

/**
 * Fetches global admission settings for a college
 */
export async function fetchGlobalAdmissionSettings(collegeId: number) {
  const { data, error } = await supabase
    .from("college_admission_settings")
    .select("*")
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) { 
    console.error("Error fetching global admission settings:", error);
  }

  return data;
}

/**
 * Fetches the course admissions configurations
 */
export async function fetchCourseAdmissions(collegeId: number) {
  const { data, error } = await supabase
    .from("college_course_admissions")
    .select("*")
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (error) {
    console.error("Error fetching course admissions:", error);
    return [];
  }

  return data;
}

/**
 * Upsert global admissions settings
 */
export async function upsertGlobalAdmissionsStatus(collegeId: number, adminId: number, isOpen: boolean) {
  // First check if exists
  const existing = await fetchGlobalAdmissionSettings(collegeId);
  const now = new Date().toISOString();

  if (existing) {
    const { data, error } = await supabase
      .from("college_admission_settings")
      .update({ isAdmissionsOpen: isOpen, updatedAt: now })
      .eq("collegeAdmissionSettingsId", existing.collegeAdmissionSettingsId)
      .select();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("college_admission_settings")
      .insert({
        collegeId,
        isAdmissionsOpen: isOpen,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      })
      .select();

    if (error) throw error;
    return data;
  }
}

/**
 * Helper to get a single course admission setting
 */
export async function getCourseAdmissionSetting(collegeBranchId: number) {
  const { data, error } = await supabase
    .from("college_course_admissions")
    .select("*")
    .eq("collegeBranchId", collegeBranchId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error("Error fetching course admission setting:", error);
  }

  return data;
}

/**
 * Upsert course admission status or fee
 */
export async function upsertCourseAdmissionConfig(
  collegeId: number,
  adminId: number,
  collegeBranchId: number,
  updates: { isAdmissionsOpen?: boolean; admissionFee?: number }
) {
  const existing = await getCourseAdmissionSetting(collegeBranchId);
  const now = new Date().toISOString();

  if (existing) {
    const payload: any = { updatedAt: now };
    if (updates.isAdmissionsOpen !== undefined) payload.isAdmissionsOpen = updates.isAdmissionsOpen;
    if (updates.admissionFee !== undefined) payload.admissionFee = updates.admissionFee;

    const { data, error } = await supabase
      .from("college_course_admissions")
      .update(payload)
      .eq("courseAdmissionId", existing.courseAdmissionId)
      .select();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("college_course_admissions")
      .insert({
        collegeId,
        collegeBranchId,
        isAdmissionsOpen: updates.isAdmissionsOpen ?? false,
        admissionFee: updates.admissionFee ?? 0,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      })
      .select();

    if (error) throw error;
    return data;
  }
}

/**
 * Fetches the branches (courses) for a college.
 * Used to get the base list of courses for the UI.
 */
export async function fetchAdmissionsCourses(collegeId: number) {
  return fetchBranchOptionsDirectly(collegeId, null);
}
