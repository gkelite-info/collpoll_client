import { supabase } from "@/lib/supabaseClient";

export async function fetchFacultyForSubject(collegeSubjectId: number) {
  const { data, error } = await supabase
    .from("faculty_sections")
    .select("facultyId, faculty(fullName, userId, collegeId)")
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("isActive", true)
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.faculty) {
    return null;
  }

  const fac = Array.isArray(data.faculty) ? data.faculty[0] : data.faculty;

  const { data: empData } = await supabase
    .from("employee_ids")
    .select("employeeId")
    .eq("userId", fac.userId)
    .eq("collegeId", fac.collegeId)
    .eq("isActive", true)
    .maybeSingle();

  return {
    facultyId: data.facultyId,
    fullName: fac.fullName,
    identifierId: empData?.employeeId || null,
  };
}

export async function fetchAdminQuizzesBySubject(
  collegeSubjectId: number,
  status: "Draft" | "Active" | "Completed",
  dateStr?: string
) {
  let query = supabase
    .from("quizzes")
    .select(
      `
            quizId, quizTitle, totalMarks, startDate, endDate, status,
            faculty ( fullName ),
            college_subjects ( subjectName ),
            college_sections ( collegeSections ),
            quiz_questions ( questionId )
        `,
    )
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("status", status)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0).toISOString();
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();

    query = query
      .lte("startDate", endOfDay)
      .gte("endDate", startOfDay);
  }

  const { data } = await query.order("createdAt", { ascending: false });

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  }

  return (data || []).map((quiz: any) => {
    const fac = getFirst(quiz.faculty);
    const sub = getFirst(quiz.college_subjects);
    const sec = getFirst(quiz.college_sections);

    return {
      id: quiz.quizId,
      title: quiz.quizTitle,
      subtitle: `${sub?.subjectName || "-"} • ${sec?.collegeSections || "-"}`,
      duration: `${formatDate(quiz.startDate)} → ${formatDate(quiz.endDate)}`,
      totalQuestions: quiz.quiz_questions?.length || 0,
      totalMarks: quiz.totalMarks,
      status: quiz.status,
      facultyName: fac?.fullName || "Unassigned",
    };
  });
}

export async function fetchFacultiesByCollege(collegeId: number) {
  const { data, error } = await supabase
    .from("faculty")
    .select("facultyId, fullName")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("fetchFacultiesByCollege error:", error);
    throw error;
  }
  return data ?? [];
}

export async function fetchAdminIncompleteQuizzes(collegeSubjectId: number) {
  const { data: quizzesWithQuestions } = await supabase
    .from("quiz_questions")
    .select("quizId")
    .eq("isActive", true)
    .is("deletedAt", null);

  const quizIdsWithQuestions =
    quizzesWithQuestions?.map((q: any) => q.quizId) ?? [];

  let query = supabase
    .from("quizzes")
    .select(`quizId, quizTitle, totalMarks, startDate, endDate, status`)
    .eq("collegeSubjectId", collegeSubjectId)
    .in("status", ["Draft", "Active"])
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (quizIdsWithQuestions.length > 0) {
    query = query.not("quizId", "in", `(${quizIdsWithQuestions.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

const COLOR_PALETTES = [
  { bgColor: "#EFF6FF", text: "#2563EB", color: "#3B82F6" }, // Blue
  { bgColor: "#F0FDF4", text: "#16A34A", color: "#22C55E" }, // Green
  { bgColor: "#FAF5FF", text: "#9333EA", color: "#A855F7" }, // Purple
  { bgColor: "#FFF7ED", text: "#EA580C", color: "#F97316" }, // Orange
];

const getFirst = (item: any) => (Array.isArray(item) ? item[0] : item);

export async function fetchQuizFilterOptions(
  collegeId: number,
  collegeEducationId: number,
) {
  const [{ data: branches }, { data: years }] = await Promise.all([
    supabase
      .from("college_branch")
      .select("collegeBranchCode")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true),
    supabase
      .from("college_academic_year")
      .select("collegeAcademicYear")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true),
  ]);

  const branchOptions = [
    "All",
    ...new Set((branches || []).map((b) => b.collegeBranchCode)),
  ].map((b) => ({ label: String(b), value: String(b) }));
  const yearOptions = [
    "All",
    ...new Set((years || []).map((y) => y.collegeAcademicYear)),
  ].map((y) => ({ label: String(y), value: String(y) }));

  return { branchOptions, yearOptions };
}

export async function fetchAdminQuizDepartments(
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
  if (branchFilter !== "All")
    branchQuery = branchQuery.eq("collegeBranchCode", branchFilter);

  let yearQuery = supabase
    .from("college_academic_year")
    .select("*")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true);
  if (yearFilter !== "All")
    yearQuery = yearQuery.eq("collegeAcademicYear", yearFilter);

  const [
    { data: branches },
    { data: years },
    { data: faculty },
    { data: students },
    { data: history },
    { data: subjects },
    { data: quizzes },
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
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("students")
      .select("studentId, collegeBranchId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("student_academic_history")
      .select("studentId, collegeAcademicYearId")
      .eq("isCurrent", true),
    supabase
      .from("college_subjects")
      .select("collegeSubjectId, collegeBranchId, collegeAcademicYearId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("quizzes")
      .select("collegeSubjectId")
      .eq("status", "Active")
      .eq("isActive", true)
      .is("deletedAt", null),

    supabase
      .from("faculty_sections")
      .select("facultyId, collegeAcademicYearId")
      .eq("isActive", true)
      .is("deletedAt", null),
  ]);

  const activeSubjectIds = new Set(quizzes?.map((q) => q.collegeSubjectId));
  const studentBranchMap = new Map();
  students?.forEach((s) =>
    studentBranchMap.set(s.studentId, s.collegeBranchId),
  );

  const results = [];
  let colorIndex = 0;

  for (const branch of branches || []) {
    for (const year of years || []) {
      if (
        year.collegeBranchId &&
        year.collegeBranchId !== branch.collegeBranchId
      )
        continue;

      const validFacultyIdsForYear = new Set(
        facultyAssignments
          ?.filter(
            (fa) => fa.collegeAcademicYearId === year.collegeAcademicYearId,
          )
          .map((fa) => fa.facultyId),
      );

      const branchFaculty =
        faculty?.filter(
          (f) =>
            f.collegeBranchId === branch.collegeBranchId &&
            validFacultyIdsForYear.has(f.facultyId),
        ) || [];

      const studentCount =
        history?.filter(
          (h) =>
            studentBranchMap.get(h.studentId) === branch.collegeBranchId &&
            h.collegeAcademicYearId === year.collegeAcademicYearId,
        ).length || 0;
      const branchYearSubjects =
        subjects?.filter(
          (s) =>
            s.collegeBranchId === branch.collegeBranchId &&
            s.collegeAcademicYearId === year.collegeAcademicYearId,
        ) || [];
      const activeCount = branchYearSubjects.filter((s) =>
        activeSubjectIds.has(s.collegeSubjectId),
      ).length;

      const colors = COLOR_PALETTES[colorIndex % COLOR_PALETTES.length];
      colorIndex++;

      results.push({
        branchId: branch.collegeBranchId,
        yearId: year.collegeAcademicYearId,
        name: branch.collegeBranchCode,
        year: year.collegeAcademicYear,
        facultyList: branchFaculty.map((f: any) => {
          const profile = f.users?.user_profile;
          const profileUrl = Array.isArray(profile)
            ? profile[0]?.profileUrl
            : profile?.profileUrl;
          return {
            id: f.facultyId,
            name: f.fullName,
            avatar: profileUrl || null,
          };
        }),
        students: studentCount,
        activeCount: activeCount,
        ...colors,
      });
    }
  }

  const totalCount = results.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    data: paginatedResults,
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
}

export async function fetchAdminQuizSubjects(
  collegeId: number,
  branchId: number,
  yearId: number,
) {
  const [
    { data: subjects },
    { data: history },
    { data: students },
    { data: facultyAssignments },
  ] = await Promise.all([
    supabase
      .from("college_subjects")
      .select(
        `
            collegeSubjectId, subjectName, subjectCode,
            quizzes ( quizId, status, facultyId, quiz_submissions ( submissionId ) )
        `,
      )
      .eq("collegeId", collegeId)
      .eq("collegeBranchId", branchId)
      .eq("collegeAcademicYearId", yearId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("student_academic_history")
      .select("studentId")
      .eq("collegeAcademicYearId", yearId)
      .eq("isCurrent", true),
    supabase
      .from("students")
      .select("studentId")
      .eq("collegeBranchId", branchId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("faculty_sections")
      .select(
        `
            collegeSubjectId, facultyId, faculty ( fullName, userId, users:userId ( user_profile ( profileUrl ) ) )
        `,
      )
      .eq("collegeAcademicYearId", yearId)
      .eq("isActive", true)
      .is("deletedAt", null),
  ]);

  const facultyUserIds = [
    ...new Set(
      (facultyAssignments || [])
        .map((fa: any) => {
          const fac = Array.isArray(fa.faculty) ? fa.faculty[0] : fa.faculty;
          return fac?.userId;
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

  const validStudentIds = new Set(students?.map((s) => s.studentId) || []);
  const totalStudents =
    history?.filter((h) => validStudentIds.has(h.studentId)).length || 0;

  const subjectFacultyMap = new Map();
  facultyAssignments?.forEach((fa: any) => {
    if (!subjectFacultyMap.has(fa.collegeSubjectId)) {
      subjectFacultyMap.set(fa.collegeSubjectId, []);
    }
    const facArray = subjectFacultyMap.get(fa.collegeSubjectId);

    if (!facArray.find((f: any) => f.id === fa.facultyId)) {
      const fac = Array.isArray(fa.faculty) ? fa.faculty[0] : fa.faculty;
      if (fac) {
        const profile = fac.users?.user_profile;
        const profileUrl = Array.isArray(profile)
          ? profile[0]?.profileUrl
          : profile?.profileUrl;

        facArray.push({
          id: fa.facultyId,
          employeeId: employeeIdMap.get(fac.userId) || "N/A",
          name: fac.fullName,
          avatar: profileUrl || null,
        });
      }
    }
  });

  return (subjects || []).map((sub: any) => {
    const activeQuizzes =
      sub.quizzes?.filter((q: any) => q.status === "Active") || [];
    const pendingCount = activeQuizzes.reduce(
      (acc: number, q: any) => acc + (q.quiz_submissions?.length || 0),
      0,
    );

    const assignedFaculties = subjectFacultyMap.get(sub.collegeSubjectId) || [];
    let primaryFaculty = assignedFaculties[assignedFaculties.length - 1]; // Default to the most recently assigned if multiple
    
    if (activeQuizzes.length > 0) {
      // Find the faculty who actually created these quizzes
      const quizFacultyId = activeQuizzes[0].facultyId;
      const creator = assignedFaculties.find((f: any) => f.id === quizFacultyId);
      if (creator) {
        primaryFaculty = creator;
      }
    }

    return {
      id: sub.collegeSubjectId,
      subject: sub.subjectName,
      facultyName: primaryFaculty ? primaryFaculty.name : "Unassigned",
      facultyId: primaryFaculty ? String(primaryFaculty.id) : "-",
      employeeId: primaryFaculty?.employeeId || "N/A",
      avatar: primaryFaculty?.avatar || null,
      activeQuiz: activeQuizzes.length,
      pendingSubmissions: pendingCount,
    };
  });
}

export async function publishAdminQuiz(quizId: number) {
  const { error } = await supabase
    .from("quizzes")
    .update({ status: "Active", updatedAt: new Date().toISOString() })
    .eq("quizId", quizId);

  if (error) throw error;
  return true;
}
