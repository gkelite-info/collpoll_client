import { supabase } from "@/lib/supabaseClient";

const COLOR_PALETTES = [
  { bgColor: "#EFF6FF", text: "#2563EB", color: "#3B82F6" },
  { bgColor: "#F0FDF4", text: "#16A34A", color: "#22C55E" },
  { bgColor: "#FAF5FF", text: "#9333EA", color: "#A855F7" },
  { bgColor: "#FFF7ED", text: "#EA580C", color: "#F97316" },
];

export async function fetchAdminLabDepartments(
  collegeId: number,
  collegeEducationId: number,
  branchFilter: string = "All",
  yearFilter: string = "All",
  page: number = 1,
  limit: number = 9,
) {
  let branchQuery = supabase
    .from("college_branch")
    .select("*")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true);

  if (branchFilter !== "All") {
    branchQuery = branchQuery.eq("collegeBranchCode", branchFilter);
  }

  let yearQuery = supabase
    .from("college_academic_year")
    .select("*")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true);

  if (yearFilter !== "All") {
    yearQuery = yearQuery.eq("collegeAcademicYear", yearFilter);
  }

  const [
    { data: branches },
    { data: years },
    { data: faculty },
    { data: students },
    { data: history },
    { data: labs },
    { data: facultyAssignments },
  ] = await Promise.all([
    branchQuery,
    yearQuery,
    supabase
      .from("faculty")
      .select(
        "facultyId, fullName, collegeBranchId, users:userId(user_profile(profileUrl))",
      )
      .eq("collegeId", collegeId)
      .eq("isActive", true),
    supabase
      .from("students")
      .select("studentId, collegeBranchId")
      .eq("collegeId", collegeId)
      .eq("isActive", true),
    supabase
      .from("student_academic_history")
      .select("studentId, collegeAcademicYearId")
      .eq("isCurrent", true),
    supabase
      .from("faculty_lab_manuals")
      .select(`
        labManualId,
        collegeAcademicYearId,
        college_subjects!inner (
          collegeBranchId,
          collegeEducationId,
          collegeId
        )
      `)
      .eq("isActive", true)
      .is("deletedAt", null)
      .eq("college_subjects.collegeId", collegeId)
      .eq("college_subjects.collegeEducationId", collegeEducationId),
    supabase
      .from("faculty_sections")
      .select("facultyId, collegeAcademicYearId")
      .eq("isActive", true),
  ]);

  const studentBranchMap = new Map<number, number>();
  students?.forEach((student) => {
    studentBranchMap.set(student.studentId, student.collegeBranchId);
  });

  const results = [];
  let colorIndex = 0;

  for (const branch of branches || []) {
    for (const year of years || []) {
      if (
        year.collegeBranchId &&
        year.collegeBranchId !== branch.collegeBranchId
      ) {
        continue;
      }

      const validFacultyIdsForYear = new Set(
        facultyAssignments
          ?.filter(
            (assignment) =>
              assignment.collegeAcademicYearId === year.collegeAcademicYearId,
          )
          .map((assignment) => assignment.facultyId),
      );

      const branchFaculty =
        faculty?.filter(
          (item) =>
            item.collegeBranchId === branch.collegeBranchId &&
            validFacultyIdsForYear.has(item.facultyId),
        ) || [];

      const studentCount =
        history?.filter(
          (item) =>
            studentBranchMap.get(item.studentId) === branch.collegeBranchId &&
            item.collegeAcademicYearId === year.collegeAcademicYearId,
        ).length || 0;

      const labCount =
        labs?.filter((lab: any) => {
          const subject = Array.isArray(lab.college_subjects)
            ? lab.college_subjects[0]
            : lab.college_subjects;

          return (
            subject?.collegeBranchId === branch.collegeBranchId &&
            lab.collegeAcademicYearId === year.collegeAcademicYearId
          );
        }).length || 0;

      const colors = COLOR_PALETTES[colorIndex % COLOR_PALETTES.length];
      colorIndex++;

      results.push({
        branchId: branch.collegeBranchId,
        yearId: year.collegeAcademicYearId,
        name: branch.collegeBranchCode,
        year: year.collegeAcademicYear,
        facultyList: branchFaculty.map((item: any) => {
          const profile = item.users?.user_profile;
          const profileUrl = Array.isArray(profile)
            ? profile[0]?.profileUrl
            : profile?.profileUrl;

          return {
            id: item.facultyId,
            name: item.fullName,
            avatar: profileUrl || null,
          };
        }),
        students: studentCount,
        activeCount: labCount,
        ...colors,
      });
    }
  }

  const totalCount = results.length;
  const startIndex = (page - 1) * limit;

  return {
    data: results.slice(startIndex, startIndex + limit),
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
}

export async function fetchAdminLabSubjects(
  collegeId: number,
  branchId: number,
  yearId: number,
) {
  const [{ data: subjects }, { data: facultyAssignments }, { data: labs }] =
    await Promise.all([
      supabase
        .from("college_subjects")
        .select("collegeSubjectId, subjectName, subjectCode")
        .eq("collegeId", collegeId)
        .eq("collegeBranchId", branchId)
        .eq("collegeAcademicYearId", yearId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("subjectName", { ascending: true }),
      supabase
        .from("faculty_sections")
        .select(
          `
          collegeSubjectId,
          facultyId,
          faculty (
            fullName,
            users:userId (
              user_profile (
                profileUrl
              )
            )
          )
        `,
        )
        .eq("collegeAcademicYearId", yearId)
        .eq("isActive", true),
      supabase
        .from("faculty_lab_manuals")
        .select("labManualId, collegeSubjectId, collegeSectionsId")
        .eq("collegeAcademicYearId", yearId)
        .eq("isActive", true)
        .is("deletedAt", null),
    ]);

  const subjectFacultyMap = new Map();
  facultyAssignments?.forEach((assignment: any) => {
    if (subjectFacultyMap.has(assignment.collegeSubjectId)) return;

    const faculty = Array.isArray(assignment.faculty)
      ? assignment.faculty[0]
      : assignment.faculty;
    if (!faculty) return;

    const profile = faculty.users?.user_profile;
    const profileUrl = Array.isArray(profile)
      ? profile[0]?.profileUrl
      : profile?.profileUrl;

    subjectFacultyMap.set(assignment.collegeSubjectId, {
      id: assignment.facultyId,
      name: faculty.fullName,
      avatar: profileUrl || null,
    });
  });

  return (subjects || []).map((subject: any) => {
    const subjectLabs =
      labs?.filter(
        (lab: any) => lab.collegeSubjectId === subject.collegeSubjectId,
      ) || [];
    const assignedFaculty = subjectFacultyMap.get(subject.collegeSubjectId);
    const sectionCount = new Set(
      subjectLabs.map((lab: any) => lab.collegeSectionsId),
    ).size;

    return {
      id: subject.collegeSubjectId,
      subject: subject.subjectName,
      facultyName: assignedFaculty ? assignedFaculty.name : "Unassigned",
      facultyId: assignedFaculty ? String(assignedFaculty.id) : "-",
      avatar: assignedFaculty?.avatar
        ? assignedFaculty.avatar
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedFaculty?.name || "Unassigned")}&background=random&color=fff`,
      activeQuiz: subjectLabs.length,
      pendingSubmissions: sectionCount,
    };
  });
}
