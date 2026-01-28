import { supabase } from "@/lib/supabaseClient";

export type SubjectDBPayload = {
  collegeSubjectId?: number;
  subjectName: string;
  subjectCode: string;
  subjectKey?: string | null;
  credits: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
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
      supabase
        .from("college_branch")
        .select("collegeBranchCode")
        .eq("collegeBranchId", collegeBranchId)
        .single(),
      supabase
        .from("college_academic_year")
        .select("collegeAcademicYear")
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .single(),
      supabase
        .from("college_semester")
        .select("collegeSemester")
        .eq("collegeSemesterId", collegeSemesterId)
        .single(),
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
  const { data: edu, error: eduErr } = await supabase
    .from("college_education")
    .select("collegeEducationId")
    .eq("collegeEducationType", education)
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .single();
  if (eduErr || !edu) throw new Error("Education not found");

  const { data: br, error: brErr } = await supabase
    .from("college_branch")
    .select("collegeBranchId")
    .eq("collegeBranchCode", branch)
    .eq("collegeEducationId", edu.collegeEducationId)
    .is("deletedAt", null)
    .single();
  if (brErr || !br) throw new Error("Branch not found");

  const { data: yr, error: yrErr } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId")
    .eq("collegeAcademicYear", year)
    .eq("collegeBranchId", br.collegeBranchId)
    .is("deletedAt", null)
    .single();
  if (yrErr || !yr) throw new Error("Academic year not found");

  const { data: sem, error: semErr } = await supabase
    .from("college_semester")
    .select("collegeSemesterId")
    .eq("collegeSemester", Number(semester))
    .eq("collegeAcademicYearId", yr.collegeAcademicYearId)
    .is("deletedAt", null)
    .single();
  if (semErr || !sem) throw new Error("Semester not found");

  return {
    collegeEducationId: edu.collegeEducationId,
    collegeBranchId: br.collegeBranchId,
    collegeAcademicYearId: yr.collegeAcademicYearId,
    collegeSemesterId: sem.collegeSemesterId,
  };
};

export const getAcademicSubjects = async (collegeId: number) => {
  const { data, error } = await supabase
    .from("college_subjects")
    .select(
      `
      collegeSubjectId, subjectName, subjectCode, subjectKey, credits,
      collegeEducation:college_education (collegeEducationType),
      collegeBranch:college_branch (collegeBranchCode),
      collegeAcademicYear:college_academic_year (collegeAcademicYear),
      collegeSemester:college_semester (collegeSemester)
    `,
    )
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

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
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch subject" };
  }
};

export const upsertAcademicSubject = async (payload: SubjectDBPayload) => {
  try {
    const now = new Date().toISOString();
    const { collegeSubjectId, ...rest } = payload;

    const formattedData = {
      ...rest,
      subjectCode: payload.subjectCode.toUpperCase(),
      subjectKey: payload.subjectKey ? payload.subjectKey.toUpperCase() : null,
      credits: Number(payload.credits),
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
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    console.error("upsertAcademicSubject error:", err);
    return { success: false, error: err.message || "Failed to save subject" };
  }
};
