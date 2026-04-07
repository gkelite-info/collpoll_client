import { supabase } from "@/lib/supabaseClient";

export async function fetchFacultyForSubject(collegeSubjectId: number) {
  const { data, error } = await supabase
    .from("faculty_sections")
    .select("facultyId, faculty(fullName)")
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("isActive", true)
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.faculty) {
    return null;
  }

  const fac = Array.isArray(data.faculty) ? data.faculty[0] : data.faculty;

  return {
    facultyId: data.facultyId,
    fullName: fac.fullName,
  };
}

export async function fetchAdminQuizzesBySubject(
  collegeSubjectId: number,
  status: "Draft" | "Active" | "Completed",
) {
  const { data } = await supabase
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
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

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

// 2. UPDATED: Accepts filters and pagination from the frontend
export async function fetchAdminQuizDepartments(
  collegeId: number,
  collegeEducationId: number,
  branchFilter: string = "All",
  yearFilter: string = "All",
  page: number = 1,
  limit: number = 9, // Fits perfectly in a 3-column grid
) {
  // DB-Level Filtering (Saves immense memory and processing)
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
      .from("college_subjects")
      .select("collegeSubjectId, collegeBranchId, collegeAcademicYearId")
      .eq("collegeId", collegeId)
      .eq("isActive", true),
    supabase
      .from("quizzes")
      .select("collegeSubjectId")
      .eq("status", "Active")
      .eq("isActive", true),
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

      const branchFaculty =
        faculty?.filter((f) => f.collegeBranchId === branch.collegeBranchId) ||
        [];
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

  // 3. Server-side Pagination Slicing
  const totalCount = results.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    data: paginatedResults,
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
}

// export async function fetchAdminQuizSubjects(
//   collegeId: number,
//   branchId: number,
//   yearId: number,
// ) {
//   const [
//     { data: subjects },
//     { data: history },
//     { data: students },
//     { data: facultyAssignments },
//   ] = await Promise.all([
//     supabase
//       .from("college_subjects")
//       .select(
//         `
//             collegeSubjectId, subjectName, subjectCode,
//             quizzes ( quizId, status, facultyId, quiz_submissions ( submissionId ) )
//         `,
//       )
//       .eq("collegeId", collegeId)
//       .eq("collegeBranchId", branchId)
//       .eq("collegeAcademicYearId", yearId)
//       .eq("isActive", true),
//     supabase
//       .from("student_academic_history")
//       .select("studentId")
//       .eq("collegeAcademicYearId", yearId)
//       .eq("isCurrent", true),
//     supabase
//       .from("students")
//       .select("studentId")
//       .eq("collegeBranchId", branchId)
//       .eq("isActive", true),
//     supabase
//       .from("faculty_sections")
//       .select(
//         `
//             collegeSubjectId, facultyId, faculty ( fullName )
//         `,
//       )
//       .eq("collegeAcademicYearId", yearId)
//       .eq("isActive", true),
//   ]);

//   const validStudentIds = new Set(students?.map((s) => s.studentId) || []);
//   const totalStudents =
//     history?.filter((h) => validStudentIds.has(h.studentId)).length || 0;

//   const subjectFacultyMap = new Map();
//   facultyAssignments?.forEach((fa: any) => {
//     if (!subjectFacultyMap.has(fa.collegeSubjectId)) {
//       const fac = Array.isArray(fa.faculty) ? fa.faculty[0] : fa.faculty;
//       if (fac) {
//         subjectFacultyMap.set(fa.collegeSubjectId, {
//           id: fa.facultyId,
//           name: fac.fullName,
//         });
//       }
//     }
//   });

//   return (subjects || []).map((sub: any, index: number) => {
//     const activeQuizzes =
//       sub.quizzes?.filter((q: any) => q.status === "Active") || [];
//     const pendingCount = activeQuizzes.reduce(
//       (acc: number, q: any) => acc + (q.quiz_submissions?.length || 0),
//       0,
//     );

//     const assignedFaculty = subjectFacultyMap.get(sub.collegeSubjectId);

//     return {
//       id: sub.collegeSubjectId,
//       subject: sub.subjectName,
//       facultyName: assignedFaculty ? assignedFaculty.name : "Unassigned",
//       facultyId: assignedFaculty ? String(assignedFaculty.id) : "-",
//       avatar: `https://i.pravatar.cc/100?img=${(index * 7 + 12) % 70}`,
//       activeQuiz: activeQuizzes.length,
//       pendingSubmissions: pendingCount,
//     };
//   });
// }

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
      .eq("isActive", true),
    supabase
      .from("student_academic_history")
      .select("studentId")
      .eq("collegeAcademicYearId", yearId)
      .eq("isCurrent", true),
    supabase
      .from("students")
      .select("studentId")
      .eq("collegeBranchId", branchId)
      .eq("isActive", true),
    supabase
      .from("faculty_sections")
      .select(
        `
            collegeSubjectId, facultyId, faculty ( fullName, users:userId ( user_profile ( profileUrl ) ) )
        `,
      )
      .eq("collegeAcademicYearId", yearId)
      .eq("isActive", true),
  ]);

  const validStudentIds = new Set(students?.map((s) => s.studentId) || []);
  const totalStudents =
    history?.filter((h) => validStudentIds.has(h.studentId)).length || 0;

  const subjectFacultyMap = new Map();
  facultyAssignments?.forEach((fa: any) => {
    if (!subjectFacultyMap.has(fa.collegeSubjectId)) {
      const fac = Array.isArray(fa.faculty) ? fa.faculty[0] : fa.faculty;
      if (fac) {
        // Extract the dynamic profile picture
        const profile = fac.users?.user_profile;
        const profileUrl = Array.isArray(profile)
          ? profile[0]?.profileUrl
          : profile?.profileUrl;

        subjectFacultyMap.set(fa.collegeSubjectId, {
          id: fa.facultyId,
          name: fac.fullName,
          avatar: profileUrl || null, // Store dynamic avatar
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

    const assignedFaculty = subjectFacultyMap.get(sub.collegeSubjectId);

    return {
      id: sub.collegeSubjectId,
      subject: sub.subjectName,
      facultyName: assignedFaculty ? assignedFaculty.name : "Unassigned",
      facultyId: assignedFaculty ? String(assignedFaculty.id) : "-",
      avatar: assignedFaculty?.avatar
        ? assignedFaculty.avatar
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedFaculty?.name || "Unassigned")}&background=random&color=fff`,
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
