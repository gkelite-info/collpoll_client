import { supabase } from "@/lib/supabaseClient";
import { isSchoolEducation } from "./schoolHelper";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export type SubjectDBPayload = {
  collegeSubjectId?: number;
  subjectName: string;
  subjectCode?: string; // Optional for schools
  subjectKey?: string | null;
  credits?: number | null; // Optional for schools
  image?: string | null;
  collegeEducationId: number;
  collegeBranchId: number | null;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  collegeId: number;
  createdBy: number;
};

export const resolveSubjectUIFromIds = async ({
  collegeEducationId,
  collegeBranchId,
  collegeAcademicYearId,
  collegeSemesterId,
}: {
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
}) => {
  const [{ data: edu }, { data: br }, { data: yr }, { data: sem }] =
    await Promise.all([
      supabase
        .from("college_education")
        .select("collegeEducationType")
        .eq("collegeEducationId", collegeEducationId)
        .single(),
      collegeBranchId
        ? supabase
            .from("college_branch")
            .select("collegeBranchCode")
            .eq("collegeBranchId", collegeBranchId)
            .single()
        : Promise.resolve({ data: null }),
      supabase
        .from("college_academic_year")
        .select("collegeAcademicYear")
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .single(),
      collegeSemesterId
        ? supabase
            .from("college_semester")
            .select("collegeSemester")
            .eq("collegeSemesterId", collegeSemesterId)
            .single()
        : Promise.resolve({ data: null }),
    ]);

  return {
    education: edu?.collegeEducationType ?? "",
    branch: br?.collegeBranchCode ?? "",
    year: yr?.collegeAcademicYear ?? "",
    semester: String(sem?.collegeSemester ?? ""),
  };
};

export const resolveSubjectIds = async ({
  education,
  branch,
  year,
  semester,
  collegeId,
}: {
  education: string;
  branch: string;
  year: string;
  semester: string;
  collegeId: number;
}) => {
  const isSchool = isSchoolEducation(education);

  const { data: edu, error: eduErr } = await supabase
    .from("college_education")
    .select("collegeEducationId")
    .eq("collegeEducationType", education)
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .single();
  if (eduErr || !edu) throw new Error("Education not found");

  let collegeBranchId: number | null = null;
  
  if (!isSchool) {
    const { data: br, error: brErr } = await supabase
      .from("college_branch")
      .select("collegeBranchId")
      .eq("collegeBranchCode", branch)
      .eq("collegeEducationId", edu.collegeEducationId)
      .is("deletedAt", null)
      .single();
    if (brErr || !br) throw new Error("Branch not found");
    collegeBranchId = br.collegeBranchId;
  }

  let yearQuery = supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId")
    .eq("collegeAcademicYear", year)
    .is("deletedAt", null);

  if (collegeBranchId !== null && collegeBranchId !== undefined) {
    yearQuery = yearQuery.eq("collegeBranchId", collegeBranchId);
  } else {
    yearQuery = yearQuery.is("collegeBranchId", null);
  }

  const { data: yr, error: yrErr } = await yearQuery.single();
  if (yrErr || !yr) throw new Error("Academic year not found");

  let collegeSemesterId: number | null = null;

  if (!isSchool) {
    if (education === "Inter") {
      const { data: sem } = await supabase
        .from("college_semester")
        .select("collegeSemesterId")
        .eq("collegeAcademicYearId", yr.collegeAcademicYearId)
        .limit(1)
        .single();

      collegeSemesterId = sem?.collegeSemesterId || null;
    } else {
      const { data: sem, error: semErr } = await supabase
        .from("college_semester")
        .select("collegeSemesterId")
        .eq("collegeSemester", Number(semester))
        .eq("collegeAcademicYearId", yr.collegeAcademicYearId)
        .is("deletedAt", null)
        .single();
      if (semErr || !sem) throw new Error("Semester not found");
      collegeSemesterId = sem.collegeSemesterId;
    }
  }

  return {
    collegeEducationId: edu.collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId: yr.collegeAcademicYearId,
    collegeSemesterId,
  };
};

export const getAcademicSubjects = async (
  collegeId: number,
  collegeEducationId: number | number[],
) => {
  let query = supabase
    .from("college_subjects")
    .select(
      `
      collegeSubjectId, subjectName, subjectCode, subjectKey, credits, image,
      collegeEducation:college_education (collegeEducationType),
      collegeBranch:college_branch (collegeBranchCode),
      collegeAcademicYear:college_academic_year (collegeAcademicYear),
      collegeSemester:college_semester (collegeSemester)
    `,
    )
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (Array.isArray(collegeEducationId)) {
    if (collegeEducationId.length > 0) {
      query = query.in("collegeEducationId", collegeEducationId);
    } else {
      return { success: true, data: [] };
    }
  } else if (collegeEducationId) {
    query = query.eq("collegeEducationId", collegeEducationId);
  }

  const { data, error } = await query;

  if (error) return { success: false, data: [], error: error.message };
  return { success: true, data: data ?? [] };
};

export const getAcademicSubjectById = async (collegeSubjectId: number) => {
  try {
    const { data, error } = await supabase
      .from("college_subjects")
      .select("*")
      .eq("collegeSubjectId", collegeSubjectId)
      .is("deletedAt", null)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to fetch subject",
    };
  }
};

export const upsertAcademicSubject = async (payload: SubjectDBPayload) => {
  try {
    const now = new Date().toISOString();
    const { collegeSubjectId, ...rest } = payload;

    const formattedData = {
      ...rest,
      subjectCode: payload.subjectCode ? payload.subjectCode.toUpperCase() : null,
      subjectKey: payload.subjectKey ? payload.subjectKey.toUpperCase() : null,
      credits: payload.credits ? Number(payload.credits) : null,
      image: payload.image?.trim() || null,
      updatedAt: now,
    };

    let result;

    if (collegeSubjectId) {
      const { data, error } = await supabase
        .from("college_subjects")
        .update(formattedData)
        .eq("collegeSubjectId", collegeSubjectId)
        .select()
        .single();

      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from("college_subjects")
        .insert({
          ...formattedData,
          createdAt: now,
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error("Supabase operation error:", result.error);

      let errorMessage = result.error.message;
      if (
        result.error.code === "23505" ||
        result.error.message.includes("uniq_subject_per_college_context")
      ) {
        errorMessage =
          "A subject with this Subject Code already exists in this context. Please use a unique Subject Code.";
      }

      return { success: false, error: errorMessage };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    console.error("upsertAcademicSubject error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to save subject",
    };
  }
};

export const deleteAcademicSubject = async (collegeSubjectId: number) => {
  try {
    const { error } = await supabase
      .from("college_subjects")
      .update({ deletedAt: new Date().toISOString(), isActive: false })
      .eq("collegeSubjectId", collegeSubjectId);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("deleteAcademicSubject error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to delete subject",
    };
  }
};
