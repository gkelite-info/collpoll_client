import { supabase } from "@/lib/supabaseClient";

export type StudentProgressBranch = {
  collegeBranchId: number;
  collegeBranchType: string;
  collegeBranchCode: string;
};

export type StudentProgressYear = {
  collegeAcademicYearId: number;
  collegeAcademicYear: string;
};

export type StudentProgressSemester = {
  collegeSemesterId: number;
  collegeSemester: number | string;
};

export type StudentProgressSection = {
  collegeSectionsId: number;
  collegeSections: string;
};

export type StudentProgressSubject = {
  collegeSubjectId: number;
  subjectName: string;
  collegeSemesterId: number | null;
};

export async function fetchStudentProgressBranches(
  collegeId: number,
  collegeEducationId: number,
) {
  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchType, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeBranchCode", { ascending: true });

  if (error) throw error;
  return (data ?? []) as StudentProgressBranch[];
}

export async function fetchStudentProgressYears(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchIds: number[],
) {
  let query = supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeAcademicYear", { ascending: true });

  if (collegeBranchIds.length) {
    query = query.in("collegeBranchId", collegeBranchIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as StudentProgressYear[];
}

export async function fetchStudentProgressSemesters(
  collegeId: number,
  collegeEducationId: number,
  academicYearIds: number[],
) {
  let query = supabase
    .from("college_semester")
    .select("collegeSemesterId, collegeSemester")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeSemester", { ascending: true });

  if (academicYearIds.length) {
    query = query.in("collegeAcademicYearId", academicYearIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as StudentProgressSemester[];
}

export async function fetchStudentProgressSections(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchIds: number[],
  academicYearIds: number[],
  semesterIds: number[],
) {
  if (!academicYearIds.length || !semesterIds.length) {
    return [];
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("student_academic_history")
    .select("collegeSectionsId")
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .in("collegeAcademicYearId", academicYearIds)
    .in("collegeSemesterId", semesterIds);

  if (historyError) throw historyError;

  const sectionIds = Array.from(
    new Set(
      (historyRows ?? [])
        .map((row) => row.collegeSectionsId)
        .filter((value): value is number => typeof value === "number"),
    ),
  );

  if (!sectionIds.length) {
    return [];
  }

  let query = supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .in("collegeSectionsId", sectionIds)
    .order("collegeSections", { ascending: true });

  if (collegeBranchIds.length) {
    query = query.in("collegeBranchId", collegeBranchIds);
  }

  if (academicYearIds.length) {
    query = query.in("collegeAcademicYearId", academicYearIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as StudentProgressSection[];
}

export async function fetchStudentProgressSubjects(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchIds: number[],
  academicYearIds: number[],
  semesterIds: number[],
  sectionIds: number[],
) {
  if (!sectionIds.length) {
    return [];
  }

  let facultySectionsQuery = supabase
    .from("faculty_sections")
    .select("collegeSubjectId")
    .in("collegeSectionsId", sectionIds)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (academicYearIds.length) {
    facultySectionsQuery = facultySectionsQuery.in(
      "collegeAcademicYearId",
      academicYearIds,
    );
  }

  const { data: facultySectionRows, error: facultySectionError } =
    await facultySectionsQuery;

  if (facultySectionError) throw facultySectionError;

  const subjectIds = Array.from(
    new Set(
      (facultySectionRows ?? [])
        .map((row) => row.collegeSubjectId)
        .filter((value): value is number => typeof value === "number"),
    ),
  );

  if (!subjectIds.length) {
    return [];
  }

  let query = supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName, collegeSemesterId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .in("collegeSubjectId", subjectIds)
    .order("subjectName", { ascending: true });

  if (collegeBranchIds.length) {
    query = query.in("collegeBranchId", collegeBranchIds);
  }

  if (academicYearIds.length) {
    query = query.in("collegeAcademicYearId", academicYearIds);
  }

  if (semesterIds.length) {
    query = query.in("collegeSemesterId", semesterIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as StudentProgressSubject[];
}
