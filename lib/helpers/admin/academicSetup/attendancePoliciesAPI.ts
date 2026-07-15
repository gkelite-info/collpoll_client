import { supabase } from "@/lib/supabaseClient";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

const isSupabaseErrorLike = (error: unknown): error is SupabaseErrorLike =>
  typeof error === "object" && error !== null && "message" in error;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (isSupabaseErrorLike(error)) return error.message || "Something went wrong";
  return "Something went wrong";
};

const getAttendancePolicyErrorMessage = (error: unknown) => {
  if (isSupabaseErrorLike(error)) {
    if (error.code === "23505") {
      return "Attendance criteria already exists for this branch, year, and semester.";
    }

    if (error.code === "42501") {
      return "You do not have permission to save attendance criteria. Please check the RLS policy.";
    }
  }

  return "Failed to save attendance criteria. Please try again.";
};

export type AttendancePolicyPayload = {
  collegeAttendancePolicyId?: number;
  collegeEducationId: number;
  collegeBranchId: number | null;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  minAttendance: number;
  createdBy: number;
};

export type AttendancePolicyRow = {
  collegeAttendancePolicyId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  minAttendance: number;
  education: string;
  branch: string;
  year: string;
  semester: string;
};

type AttendancePolicyResult =
  | { success: true; data: unknown }
  | { success: false; error: string };

type PolicyQueryRow = {
  collegeAttendancePolicyId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  minAttendance: number;
  collegeEducation?: { collegeEducationType?: string | null } | null;
  collegeBranch?: {
    collegeBranchType?: string | null;
    collegeBranchCode?: string | null;
  } | null;
  collegeAcademicYear?: { collegeAcademicYear?: string | null } | null;
  collegeSemester?: { collegeSemester?: string | number | null } | null;
};

export const fetchAttendancePolicies = async (
  collegeEducationIds: number[],
) => {
  try {
    if (collegeEducationIds.length === 0) {
      return { success: true, data: [] as AttendancePolicyRow[] };
    }

    const { data, error } = await supabase
      .from("college_attendance_policies")
      .select(
        `
        collegeAttendancePolicyId,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        minAttendance,
        collegeEducation:college_education (collegeEducationType),
        collegeBranch:college_branch (collegeBranchType, collegeBranchCode),
        collegeAcademicYear:college_academic_year (collegeAcademicYear),
        collegeSemester:college_semester (collegeSemester)
      `,
      )
      .in("collegeEducationId", collegeEducationIds)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    const rows = ((data ?? []) as PolicyQueryRow[]).map((row) => ({
      collegeAttendancePolicyId: row.collegeAttendancePolicyId,
      collegeEducationId: row.collegeEducationId,
      collegeBranchId: row.collegeBranchId,
      collegeAcademicYearId: row.collegeAcademicYearId,
      collegeSemesterId: row.collegeSemesterId,
      minAttendance: row.minAttendance,
      education: row.collegeEducation?.collegeEducationType ?? "-",
      branch:
        row.collegeBranch?.collegeBranchType ||
        row.collegeBranch?.collegeBranchCode ||
        "-",
      year: row.collegeAcademicYear?.collegeAcademicYear ?? "-",
      semester: String(row.collegeSemester?.collegeSemester ?? "-"),
    }));

    return { success: true, data: rows };
  } catch (error: unknown) {
    console.error("fetchAttendancePolicies error:", error);
    return {
      success: false,
      data: [] as AttendancePolicyRow[],
      error: getErrorMessage(error) || "Failed to fetch attendance policies",
    };
  }
};

export const upsertAttendancePolicy = async (
  payload: AttendancePolicyPayload,
): Promise<AttendancePolicyResult> => {
  try {
    const now = new Date().toISOString();
    const { collegeAttendancePolicyId, ...rest } = payload;
    const formattedData = {
      ...rest,
      minAttendance: Number(payload.minAttendance),
      isActive: true,
      is_deleted: false,
      deletedAt: null,
      updatedAt: now,
    };

    if (collegeAttendancePolicyId) {
      let query = supabase
        .from("college_attendance_policies")
        .select("collegeAttendancePolicyId")
        .eq("collegeAcademicYearId", payload.collegeAcademicYearId)
        .neq("collegeAttendancePolicyId", collegeAttendancePolicyId);

      if (payload.collegeBranchId === null) {
        query = query.is("collegeBranchId", null);
      } else {
        query = query.eq("collegeBranchId", payload.collegeBranchId);
      }

      if (payload.collegeSemesterId === null) {
        query = query.is("collegeSemesterId", null);
      } else {
        query = query.eq("collegeSemesterId", payload.collegeSemesterId);
      }

      const { data: duplicatePolicies, error: duplicateError } = await query.limit(1);

      if (duplicateError) throw duplicateError;

      if (duplicatePolicies && duplicatePolicies.length > 0) {
        return {
          success: false,
          error:
            "Attendance criteria already exists for this branch, year, and semester.",
        };
      }

      const { data, error } = await supabase
        .from("college_attendance_policies")
        .update(formattedData)
        .eq("collegeAttendancePolicyId", collegeAttendancePolicyId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }

    const insertResult = await supabase
      .from("college_attendance_policies")
      .insert({
        ...formattedData,
        createdAt: now,
      })
      .select()
      .single();

    if (!insertResult.error) {
      return { success: true, data: insertResult.data };
    }

    if (insertResult.error.code !== "23505") {
      throw insertResult.error;
    }

    let existingQuery = supabase
      .from("college_attendance_policies")
      .select("collegeAttendancePolicyId")
      .eq("collegeAcademicYearId", payload.collegeAcademicYearId);

    if (payload.collegeBranchId === null) {
      existingQuery = existingQuery.is("collegeBranchId", null);
    } else {
      existingQuery = existingQuery.eq("collegeBranchId", payload.collegeBranchId);
    }

    if (payload.collegeSemesterId === null) {
      existingQuery = existingQuery.is("collegeSemesterId", null);
    } else {
      existingQuery = existingQuery.eq("collegeSemesterId", payload.collegeSemesterId);
    }

    const { data: existingPolicies, error: existingError } = await existingQuery.limit(1);

    if (existingError || !existingPolicies || existingPolicies.length === 0) {
      throw existingError || insertResult.error;
    }

    const existingPolicy = existingPolicies[0];

    const { data, error } = await supabase
      .from("college_attendance_policies")
      .update(formattedData)
      .eq(
        "collegeAttendancePolicyId",
        existingPolicy.collegeAttendancePolicyId,
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    if (!isSupabaseErrorLike(error) || error.code !== "23505") {
      console.error(
        "upsertAttendancePolicy error:",
        JSON.stringify(error, null, 2),
      );
    }

    return {
      success: false,
      error: getAttendancePolicyErrorMessage(error),
    };
  }
};

export const deleteAttendancePolicy = async (
  collegeAttendancePolicyId: number,
) => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("college_attendance_policies")
      .update({
        isActive: false,
        is_deleted: true,
        deletedAt: now,
        updatedAt: now,
      })
      .eq("collegeAttendancePolicyId", collegeAttendancePolicyId);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("deleteAttendancePolicy error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to delete attendance policy",
    };
  }
};
