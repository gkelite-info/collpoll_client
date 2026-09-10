import { supabase } from "@/lib/supabaseClient";

export async function getSchoolAcademicYearCards(
  collegeId: number,
  educationId: number,
  page: number,
  limit: number,
  search: string,
  filters: { academicYearId?: number | null; sectionId?: number | null; subjectId?: number | null },
  groupBySection = false,
) {
  let query = supabase.from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear", { count: "exact" })
    .eq("collegeId", collegeId).eq("collegeEducationId", educationId)
    .eq("isActive", true).is("deletedAt", null);
  if (filters.academicYearId) query = query.eq("collegeAcademicYearId", filters.academicYearId);
  if (search.trim()) query = query.ilike("collegeAcademicYear", `%${search.trim()}%`);
  query = query.order("collegeAcademicYearId");
  if (!groupBySection) query = query.range((page - 1) * limit, page * limit - 1);
  const { data: years, count, error } = await query;
  if (error) throw error;
  if (!years?.length) return { mappedCards: [], totalCount: count ?? 0 };
  const yearIds = years.map(y => y.collegeAcademicYearId);
  // Existing assignments can still reference a section replaced in Academic Setup.
  // Resolve those IDs only within the same school, education and academic year.
  const { data: sectionRows, error: sectionError } = await supabase.from("college_sections")
    .select("collegeSectionsId, collegeSections, collegeAcademicYearId, isActive, deletedAt")
    .eq("collegeId", collegeId).eq("collegeEducationId", educationId)
    .in("collegeAcademicYearId", yearIds);
  if (sectionError) throw sectionError;
  const activeSections = (sectionRows ?? []).filter(s => s.isActive && !s.deletedAt);
  const selectedSection = activeSections.find(s => s.collegeSectionsId === filters.sectionId);
  const matchingSectionIds = filters.sectionId
    ? (sectionRows ?? []).filter(s => selectedSection &&
      s.collegeAcademicYearId === selectedSection.collegeAcademicYearId &&
      s.collegeSections.trim().toLowerCase() === selectedSection.collegeSections.trim().toLowerCase())
      .map(s => s.collegeSectionsId)
    : [];
  let facultyQuery = supabase.from("faculty_sections")
    .select("collegeAcademicYearId, collegeSectionsId, facultyId, faculty!inner(facultyId, fullName, email, userId)")
    .or(`collegeEducationId.eq.${educationId},collegeEducationId.is.null`)
    .in("collegeAcademicYearId", yearIds)
    .eq("isActive", true).is("deletedAt", null)
    .eq("faculty.collegeId", collegeId)
    .eq("faculty.isActive", true).is("faculty.deletedAt", null);
  let studentsQuery = supabase.from("student_academic_history")
    .select("collegeAcademicYearId, collegeSectionsId, studentId, students!inner(studentId)")
    .in("collegeAcademicYearId", yearIds).eq("isCurrent", true).is("deletedAt", null)
    .eq("students.collegeId", collegeId).eq("students.isActive", true);
  if (filters.sectionId) {
    facultyQuery = facultyQuery.in("collegeSectionsId", matchingSectionIds);
    studentsQuery = studentsQuery.in("collegeSectionsId", matchingSectionIds);
  }
  if (filters.subjectId) facultyQuery = facultyQuery.eq("collegeSubjectId", filters.subjectId);
  const [facultyResult, studentsResult] = await Promise.all([facultyQuery, studentsQuery]);
  if (facultyResult.error) throw facultyResult.error;
  if (studentsResult.error) throw studentsResult.error;
  if (groupBySection) {
    const cards = activeSections
      .filter(s => !filters.sectionId || s.collegeSectionsId === filters.sectionId)
      .sort((a, b) => a.collegeAcademicYearId - b.collegeAcademicYearId ||
        a.collegeSections.localeCompare(b.collegeSections))
      .map(section => {
        const sectionIds = new Set((sectionRows ?? []).filter(s =>
          s.collegeAcademicYearId === section.collegeAcademicYearId &&
          s.collegeSections.trim().toLowerCase() === section.collegeSections.trim().toLowerCase())
          .map(s => s.collegeSectionsId));
        const faculties = new Map<number, { facultyId: number; fullName: string; email: string }>();
        for (const row of facultyResult.data ?? []) {
          if (row.collegeAcademicYearId !== section.collegeAcademicYearId || !sectionIds.has(row.collegeSectionsId)) continue;
          const faculty = Array.isArray(row.faculty) ? row.faculty[0] : row.faculty;
          if (faculty) faculties.set(faculty.facultyId, faculty);
        }
        return {
          id: String(section.collegeSectionsId),
          collegeSectionsId: section.collegeSectionsId,
          collegeAcademicYearId: section.collegeAcademicYearId,
          branchCode: "",
          section: section.collegeSections,
          year: years.find(y => y.collegeAcademicYearId === section.collegeAcademicYearId)?.collegeAcademicYear ?? "",
          totalStudents: new Set((studentsResult.data ?? []).filter(s =>
            s.collegeAcademicYearId === section.collegeAcademicYearId && sectionIds.has(s.collegeSectionsId))
            .map(s => s.studentId)).size,
          faculties: [...faculties.values()],
        };
      });
    return { mappedCards: cards.slice((page - 1) * limit, page * limit), totalCount: cards.length };
  }
  return {
    totalCount: count ?? 0,
    mappedCards: years.map(y => {
      const faculties = new Map<number, { facultyId: number; fullName: string; email: string }>();
      for (const row of facultyResult.data ?? []) {
        if (row.collegeAcademicYearId !== y.collegeAcademicYearId) continue;
        const faculty = Array.isArray(row.faculty) ? row.faculty[0] : row.faculty;
        if (faculty) faculties.set(faculty.facultyId, faculty);
      }
      return {
        id: String(y.collegeAcademicYearId),
        collegeSectionsId: null,
        collegeAcademicYearId: y.collegeAcademicYearId,
        branchCode: "",
        section: activeSections.filter(s => s.collegeAcademicYearId === y.collegeAcademicYearId &&
          (!filters.sectionId || s.collegeSectionsId === filters.sectionId))
          .map(s => s.collegeSections).sort().join(", "),
        year: y.collegeAcademicYear,
        totalStudents: new Set((studentsResult.data ?? [])
          .filter(s => s.collegeAcademicYearId === y.collegeAcademicYearId).map(s => s.studentId)).size,
        faculties: [...faculties.values()],
      };
    }),
  };
}
