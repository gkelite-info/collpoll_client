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

export type StudentProgressFaculty = {
  facultyId: number;
  fullName: string;
};

export async function fetchStudentProgressFaculty(
  collegeId: number,
  collegeEducationId: number,
  academicYearIds: number[],
  subjectIds: number[],
  sectionIds: number[],
) {
  if (!academicYearIds.length || !subjectIds.length || !sectionIds.length) return [];

  const { data: selectedSections, error: selectedSectionsError } = await supabase
    .from("college_sections")
    .select("collegeSections")
    .in("collegeSectionsId", sectionIds);
  if (selectedSectionsError) throw selectedSectionsError;

  const sectionNames = Array.from(
    new Set((selectedSections ?? []).map((row) => row.collegeSections).filter(Boolean)),
  );
  if (!sectionNames.length) return [];

  const { data: matchingSections, error: matchingSectionsError } = await supabase
    .from("college_sections")
    .select("collegeSectionsId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .in("collegeAcademicYearId", academicYearIds)
    .in("collegeSections", sectionNames);
  if (matchingSectionsError) throw matchingSectionsError;

  const matchingSectionIds = (matchingSections ?? []).map(
    (row) => row.collegeSectionsId,
  );
  if (!matchingSectionIds.length) return [];

  const { data: registrations, error: registrationsError } = await supabase
    .from("faculty_sections")
    .select("facultyId")
    .eq("collegeEducationId", collegeEducationId)
    .in("collegeAcademicYearId", academicYearIds)
    .in("collegeSubjectId", subjectIds)
    .in("collegeSectionsId", matchingSectionIds)
    .eq("isActive", true)
    .is("deletedAt", null);
  if (registrationsError) throw registrationsError;

  const facultyIds = Array.from(
    new Set((registrations ?? []).map((row) => row.facultyId)),
  );
  if (!facultyIds.length) return [];

  const { data, error } = await supabase
    .from("faculty")
    .select("facultyId, fullName")
    .in("facultyId", facultyIds)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("fullName", { ascending: true });
  if (error) throw error;

  return (data ?? []) as StudentProgressFaculty[];
}

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
  subjectIds: number[] = [],
) {
  if (!academicYearIds.length) {
    return [];
  }

  // School flow: faculty registration is the source of truth for which
  // sections are registered for a class + subject combination.
  if (subjectIds.length) {
    const { data: registrationRows, error: registrationError } = await supabase
      .from("faculty_sections")
      .select(`
        collegeSectionsId,
        collegeEducationId,
        college_sections:collegeSectionsId (
          collegeSectionsId,
          collegeSections,
          collegeId,
          collegeEducationId,
          isActive,
          deletedAt
        )
      `)
      .eq("collegeEducationId", collegeEducationId)
      .in("collegeAcademicYearId", academicYearIds)
      .in("collegeSubjectId", subjectIds)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (registrationError) throw registrationError;

    const registeredSectionNames = new Set<string>();
    (registrationRows ?? []).forEach((row: any) => {
      const section = Array.isArray(row.college_sections)
        ? row.college_sections[0]
        : row.college_sections;
      if (
        !section ||
        section.collegeId !== collegeId ||
        section.collegeEducationId !== collegeEducationId
      ) {
        return;
      }
      if (section.collegeSections) {
        registeredSectionNames.add(section.collegeSections);
      }
    });

    if (!registeredSectionNames.size) return [];

    // A faculty registration can still reference a soft-deleted section after
    // Academic Setup recreates the same named section. Resolve that registered
    // name to its current active row so downstream student queries use the
    // valid section ID.
    const { data: activeSectionRows, error: activeSectionsError } =
      await supabase
        .from("college_sections")
        .select("collegeSectionsId, collegeSections")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .in("collegeAcademicYearId", academicYearIds)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeSections", { ascending: true });

    if (activeSectionsError) throw activeSectionsError;

    return (activeSectionRows ?? [])
      .filter((section) => registeredSectionNames.has(section.collegeSections))
      .map((section) => ({
        collegeSectionsId: section.collegeSectionsId,
        collegeSections: section.collegeSections,
      }))
      .sort((a, b) =>
      a.collegeSections.localeCompare(b.collegeSections),
      );
  }

  let historyQuery = supabase
    .from("student_academic_history")
    .select("collegeSectionsId")
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .in("collegeAcademicYearId", academicYearIds);

  if (semesterIds.length) {
    historyQuery = historyQuery.in("collegeSemesterId", semesterIds);
  }

  const { data: historyRows, error: historyError } = await historyQuery;

  if (historyError) throw historyError;

  const sectionIds = Array.from(
    new Set(
      (historyRows ?? [])
        .map((row) => row.collegeSectionsId)
        .filter((value): value is number => typeof value === "number"),
    ),
  );

  if (!sectionIds.length && !subjectIds.length) {
    return [];
  }

  let eligibleSectionIds = sectionIds;
  if (subjectIds.length) {
    const { data: facultySectionRows, error: facultySectionError } =
      await supabase
        .from("faculty_sections")
        .select("collegeSectionsId")
        .in("collegeSubjectId", subjectIds)
        .in("collegeAcademicYearId", academicYearIds)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (facultySectionError) throw facultySectionError;
    // School sections are assigned through faculty_sections. The
    // college_sections row itself may not carry the class/year relation, so
    // use the same source as the faculty Student Progress screen.
    eligibleSectionIds = Array.from(
      new Set(
        (facultySectionRows ?? [])
          .map((row) => row.collegeSectionsId)
          .filter((value): value is number => typeof value === "number"),
      ),
    );
  }

  if (!eligibleSectionIds.length) return [];

  let query = supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .in("collegeSectionsId", eligibleSectionIds)
    .order("collegeSections", { ascending: true });

  if (collegeBranchIds.length) {
    query = query.in("collegeBranchId", collegeBranchIds);
  }

  if (academicYearIds.length && !subjectIds.length) {
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
  allowWithoutSections: boolean = false,
) {
  if (!sectionIds.length && !allowWithoutSections) {
    return [];
  }

  let facultySectionsQuery = supabase
    .from("faculty_sections")
    .select("collegeSubjectId")
    .eq("isActive", true)
    .is("deletedAt", null);

  if (sectionIds.length) {
    facultySectionsQuery = facultySectionsQuery.in(
      "collegeSectionsId",
      sectionIds,
    );
  }

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
