import { supabase } from "@/lib/supabaseClient";
import { achieversSupabase } from "@/lib/achieversSupabaseClient";
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

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("college_admission_settings")
      .update({ isAdmissionsOpen: isOpen, updatedAt: now })
      .eq("collegeAdmissionSettingsId", existing.collegeAdmissionSettingsId)
      .select();

    if (error) throw error;
    result = data;
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
    result = data;
  }

  // Auto-sync to Achievers DB if College 40
  if (collegeId === 40) {
    try {
      const { data: achExisting } = await achieversSupabase
        .from("college_admission_settings")
        .select("collegeAdmissionSettingsId")
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
        .maybeSingle();

      if (achExisting) {
        await achieversSupabase
          .from("college_admission_settings")
          .update({ isAdmissionsOpen: isOpen, updatedAt: now })
          .eq("collegeAdmissionSettingsId", achExisting.collegeAdmissionSettingsId);
      } else {
        await achieversSupabase
          .from("college_admission_settings")
          .insert({
            collegeId,
            isAdmissionsOpen: isOpen,
            createdBy: adminId,
            createdAt: now,
            updatedAt: now,
          });
      }
    } catch (err) {
      console.error("Failed to auto-sync global admissions to Achievers DB:", err);
    }
  }

  return result;
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

  let result;
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
    result = data;
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
    result = data;
  }

  // Auto-sync to Achievers DB if College 40
  if (collegeId === 40) {
    try {
      const achPayload: any = { updatedAt: now };
      if (updates.isAdmissionsOpen !== undefined) achPayload.isAdmissionsOpen = updates.isAdmissionsOpen;
      if (updates.admissionFee !== undefined) achPayload.admissionFee = updates.admissionFee;

      const { data: achExisting } = await achieversSupabase
        .from("college_course_admissions")
        .select("courseAdmissionId")
        .eq("collegeId", collegeId)
        .eq("collegeBranchId", collegeBranchId)
        .is("deletedAt", null)
        .maybeSingle();

      if (achExisting) {
        await achieversSupabase
          .from("college_course_admissions")
          .update(achPayload)
          .eq("courseAdmissionId", achExisting.courseAdmissionId);
      } else {
        await achieversSupabase
          .from("college_course_admissions")
          .insert({
            collegeId,
            collegeBranchId,
            isAdmissionsOpen: updates.isAdmissionsOpen ?? false,
            admissionFee: updates.admissionFee ?? 0,
            createdBy: adminId,
            createdAt: now,
            updatedAt: now,
          });
      }
    } catch (err) {
      console.error("Failed to auto-sync course admission config to Achievers DB:", err);
    }
  }

  return result;
}

/**
 * Fetches the branches (courses) for a college.
 * Used to get the base list of courses for the UI.
 */
export async function fetchAdmissionsCourses(collegeId: number) {
  return fetchBranchOptionsDirectly(collegeId, null);
}
