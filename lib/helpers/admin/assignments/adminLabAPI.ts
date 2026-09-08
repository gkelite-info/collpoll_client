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
  isSchool: boolean = false,
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
    { data: students },
    { data: history },
    { data: labs },
    { data: facultyAssignments },
  ] = await Promise.all([
    branchQuery,
    yearQuery,
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
      .select(`
        facultyId,
        collegeAcademicYearId,
        collegeEducationId,
        collegeBranchId,
        faculty!inner (
          facultyId,
          fullName,
          isActive,
          users:userId (user_profile(profileUrl))
        )
      `)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .eq("faculty.isActive", true)
      .is("deletedAt", null),
  ]);

  const studentBranchMap = new Map<number, number>();
  students?.forEach((student) => {
    studentBranchMap.set(student.studentId, student.collegeBranchId);
  });

  const results = [];
  let colorIndex = 0;

  const cardBranches = isSchool
    ? [{ collegeBranchId: null, collegeBranchCode: "" }]
    : branches || [];
  for (const branch of cardBranches) {
    for (const year of years || []) {
      if (
        !isSchool && year.collegeBranchId &&
        year.collegeBranchId !== branch.collegeBranchId
      ) {
        continue;
      }

      const branchFacultyMap = new Map<number, any>();
      facultyAssignments
        ?.filter(
          (assignment) =>
            assignment.collegeAcademicYearId === year.collegeAcademicYearId &&
            (isSchool || assignment.collegeBranchId === branch.collegeBranchId),
        )
        .forEach((assignment: any) => {
          const assignedFaculty = Array.isArray(assignment.faculty)
            ? assignment.faculty[0]
            : assignment.faculty;

          if (assignedFaculty?.facultyId && assignedFaculty.fullName) {
            branchFacultyMap.set(assignedFaculty.facultyId, assignedFaculty);
          }
        });
      const branchFaculty = Array.from(branchFacultyMap.values());

      const studentCount =
        history?.filter(
          (item) =>
            (isSchool ? studentBranchMap.has(item.studentId) : studentBranchMap.get(item.studentId) === branch.collegeBranchId) &&
            item.collegeAcademicYearId === year.collegeAcademicYearId,
        ).length || 0;

      const labCount =
        labs?.filter((lab: any) => {
          const subject = Array.isArray(lab.college_subjects)
            ? lab.college_subjects[0]
            : lab.college_subjects;

          return (
            (isSchool || subject?.collegeBranchId === branch.collegeBranchId) &&
            lab.collegeAcademicYearId === year.collegeAcademicYearId
          );
        }).length || 0;

      const colors = COLOR_PALETTES[colorIndex % COLOR_PALETTES.length];
      colorIndex++;

      results.push({
        branchId: branch.collegeBranchId,
        yearId: year.collegeAcademicYearId,
        name: isSchool ? year.collegeAcademicYear : branch.collegeBranchCode,
        isSchool,
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
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
}

export async function fetchAdminLabSubjects(
  collegeId: number,
  branchId: number | null,
  yearId: number,
  schoolEducationId?: number,
) {
  let subjectsQuery = supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName, subjectCode")
    .eq("collegeId", collegeId)
    .eq("collegeAcademicYearId", yearId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("subjectName", { ascending: true });
  if (schoolEducationId) {
    subjectsQuery = subjectsQuery.eq("collegeEducationId", schoolEducationId);
  } else {
    subjectsQuery = subjectsQuery.eq("collegeBranchId", branchId);
  }
  const [{ data: subjects }, { data: facultyAssignments }, { data: labs }] =
    await Promise.all([
      subjectsQuery,
      supabase
        .from("faculty_sections")
        .select(
          `
          collegeSubjectId,
          facultyId,
          faculty (
            fullName,
            userId,
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

  const facultyUserIds = [
    ...new Set(
      (facultyAssignments || [])
        .map((assignment: any) => {
          const faculty = Array.isArray(assignment.faculty)
            ? assignment.faculty[0]
            : assignment.faculty;
          return faculty?.userId;
        })
        .filter(Boolean),
    ),
  ];

  const { data: employeeIds } =
    facultyUserIds.length > 0
      ? await supabase
          .from("employee_ids")
          .select("userId, employeeId")
          .in("userId", facultyUserIds)
          .eq("isActive", true)
          .eq("collegeId", collegeId)
      : { data: [] };

  const employeeIdMap = new Map(
    (employeeIds || []).map((employee: any) => [
      employee.userId,
      employee.employeeId,
    ]),
  );

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
      employeeId: employeeIdMap.get(faculty.userId) || "N/A",
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
      employeeId: assignedFaculty?.employeeId || "N/A",
      avatar: assignedFaculty?.avatar || null,
      activeQuiz: subjectLabs.length,
      pendingSubmissions: sectionCount,
    };
  });
}
