import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface FacultyAssignmentHierarchy {
  collegeEducationId: number;
  educationType: string;
  branches: {
    collegeBranchId: number;
    branchCode: string;
    years: {
      collegeAcademicYearId: number;
      yearName: string;
      semesters: {
        collegeSemesterId: number;
        semesterName: string;
        subjects: {
          collegeSubjectId: number;
          subjectName: string;
          sections: {
            collegeSectionsId: number;
            sectionName: string;
          }[];
        }[];
      }[];
    }[];
  }[];
}

export const fetchFacultyAssignmentsHierarchy = async (
  facultyId: number
): Promise<FacultyAssignmentHierarchy[]> => {
  if (!facultyId) return [];

  const { data, error } = await supabase
    .from("faculty_sections")
    .select(`
      collegeSubjectId,
      collegeSectionsId,
      college_sections!inner (
        collegeSections
      ),
      college_subjects!inner (
        subjectName,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        college_education ( collegeEducationType ),
        college_branch ( collegeBranchCode ),
        college_academic_year ( collegeAcademicYear ),
        college_semester ( collegeSemester )
      )
    `)
    .eq("facultyId", facultyId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("fetchFacultyAssignmentsHierarchy error:", error);
    throw error;
  }

  const flatData = data ?? [];

  // Grouping logic to build the hierarchy
  const hierarchyMap = new Map<number, FacultyAssignmentHierarchy>();

  flatData.forEach((row: any) => {
    const subjectData = Array.isArray(row.college_subjects) ? row.college_subjects[0] : row.college_subjects;
    const sectionData = Array.isArray(row.college_sections) ? row.college_sections[0] : row.college_sections;

    if (!subjectData) return;

    const eduId = subjectData.collegeEducationId;
    const eduData = Array.isArray(subjectData.college_education) ? subjectData.college_education[0] : subjectData.college_education;
    const educationType = eduData?.collegeEducationType || "Unknown";

    const branchId = subjectData.collegeBranchId || 0;
    const branchData = Array.isArray(subjectData.college_branch) ? subjectData.college_branch[0] : subjectData.college_branch;
    const branchCode = branchData?.collegeBranchCode || "N/A";

    const yearId = subjectData.collegeAcademicYearId || 0;
    const yearData = Array.isArray(subjectData.college_academic_year) ? subjectData.college_academic_year[0] : subjectData.college_academic_year;
    const yearName = yearData?.collegeAcademicYear || `Year ${yearId}`;

    const semId = subjectData.collegeSemesterId || 0;
    const semData = Array.isArray(subjectData.college_semester) ? subjectData.college_semester[0] : subjectData.college_semester;
    const semesterName = semData?.collegeSemester ? `Sem ${semData.collegeSemester}` : "N/A";

    const subId = row.collegeSubjectId;
    const subName = subjectData.subjectName || "Unknown";

    const secId = row.collegeSectionsId;
    const secName = sectionData?.collegeSections || "N/A";

    // 1. Education
    if (!hierarchyMap.has(eduId)) {
      hierarchyMap.set(eduId, {
        collegeEducationId: eduId,
        educationType,
        branches: [],
      });
    }
    const eduNode = hierarchyMap.get(eduId)!;

    // 2. Branch
    let branchNode = eduNode.branches.find((b) => b.collegeBranchId === branchId);
    if (!branchNode) {
      branchNode = { collegeBranchId: branchId, branchCode, years: [] };
      eduNode.branches.push(branchNode);
    }

    // 3. Year
    let yearNode = branchNode.years.find((y) => y.collegeAcademicYearId === yearId);
    if (!yearNode) {
      yearNode = { collegeAcademicYearId: yearId, yearName, semesters: [] };
      branchNode.years.push(yearNode);
    }

    // 4. Semester
    let semNode = yearNode.semesters.find((s) => s.collegeSemesterId === semId);
    if (!semNode) {
      semNode = { collegeSemesterId: semId, semesterName, subjects: [] };
      yearNode.semesters.push(semNode);
    }

    // 5. Subject
    let subNode = semNode.subjects.find((s) => s.collegeSubjectId === subId);
    if (!subNode) {
      subNode = { collegeSubjectId: subId, subjectName: subName, sections: [] };
      semNode.subjects.push(subNode);
    }

    // 6. Section
    let secNode = subNode.sections.find((s) => s.collegeSectionsId === secId);
    if (!secNode) {
      subNode.sections.push({ collegeSectionsId: secId, sectionName: secName });
    }
  });

  return Array.from(hierarchyMap.values());
};

export const useFacultyAssignmentsHierarchy = (facultyId: number | null | undefined) => {
  return useQuery({
    queryKey: ["faculty-assignments-hierarchy", facultyId],
    queryFn: () => fetchFacultyAssignmentsHierarchy(facultyId!),
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000,
  });
};
