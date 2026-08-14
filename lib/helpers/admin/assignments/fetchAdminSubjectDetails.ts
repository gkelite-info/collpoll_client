import { supabase } from "@/lib/supabaseClient";

export async function fetchAdminSubjectDetails(
  collegeId: number,
  branchCode: string,
  yearName: string,
  page: number = 1,
  limit: number = 10,
  collegeEducationId?: number,
  subjectFilter: string = "All",
  facultyFilter: string = "All",
) {
  try {
    let branchQuery = supabase
      .from("college_branch")
      .select("collegeBranchId")
      .eq("collegeBranchCode", branchCode)
      .eq("collegeId", collegeId);

    if (collegeEducationId) {
      branchQuery = branchQuery.eq("collegeEducationId", collegeEducationId);
    }

    const { data: branchData } = await branchQuery.maybeSingle();

    let yearQuery = supabase
      .from("college_academic_year")
      .select("collegeAcademicYearId")
      .eq("collegeAcademicYear", yearName)
      .eq("collegeId", collegeId);

    if (collegeEducationId) {
      yearQuery = yearQuery.eq("collegeEducationId", collegeEducationId);
    }
    if (branchData?.collegeBranchId) {
      yearQuery = yearQuery.eq("collegeBranchId", branchData.collegeBranchId);
    }

    const { data: yearData } = await yearQuery.maybeSingle();

    // School education types do not have a branch row; their class is stored as
    // the academic year. College flows still require the existing branch match.
    if ((!branchData && !collegeEducationId) || !yearData)
      return { data: [], count: 0, error: "Invalid Branch or Year" };

    const { data: rawSections, error: fetchError } = await supabase
      .from("faculty_sections")
      .select(
        `
        facultySectionId,
        facultyId,
        collegeSubjectId,
        collegeSectionsId,
        faculty:facultyId (fullName, userId, email),
        college_subjects:collegeSubjectId (subjectName, subjectCode)
      `,
      )
      .eq("collegeAcademicYearId", yearData.collegeAcademicYearId);

    if (fetchError) throw fetchError;

    const groupedMap = new Map();

    rawSections?.forEach((item: any) => {
      const compositeKey = `${item.facultyId}-${item.collegeSubjectId}`;

      if (!groupedMap.has(compositeKey)) {
        groupedMap.set(compositeKey, {
          ...item,
          sectionIds: [item.collegeSectionsId],
        });
      } else {
        const existing = groupedMap.get(compositeKey);
        existing.sectionIds.push(item.collegeSectionsId);
      }
    });

    const uniquePairs = Array.from(groupedMap.values());
    const subjectOptions = [
      "All",
      ...Array.from(
        new Set(
          uniquePairs
            .map((item: any) => {
              const subject = Array.isArray(item.college_subjects)
                ? item.college_subjects[0]
                : item.college_subjects;
              return subject?.subjectName;
            })
            .filter(Boolean),
        ),
      ).sort((a, b) => String(a).localeCompare(String(b))),
    ];
    const facultyOptions = [
      "All",
      ...Array.from(
        new Set(
          uniquePairs
            .filter((item: any) => {
              if (subjectFilter === "All") return true;
              const subject = Array.isArray(item.college_subjects)
                ? item.college_subjects[0]
                : item.college_subjects;
              return subject?.subjectName === subjectFilter;
            })
            .map((item: any) => {
              const faculty = Array.isArray(item.faculty)
                ? item.faculty[0]
                : item.faculty;
              return faculty?.fullName;
            })
            .filter(Boolean),
        ),
      ).sort((a, b) => String(a).localeCompare(String(b))),
    ];

    const filteredPairs = uniquePairs.filter((item: any) => {
      const subject = Array.isArray(item.college_subjects)
        ? item.college_subjects[0]
        : item.college_subjects;
      const faculty = Array.isArray(item.faculty)
        ? item.faculty[0]
        : item.faculty;
      return (
        (subjectFilter === "All" || subject?.subjectName === subjectFilter) &&
        (facultyFilter === "All" || faculty?.fullName === facultyFilter)
      );
    });
    const totalCount = filteredPairs.length;

    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedPairs = filteredPairs.slice(from, to);

    const subjectIds = [...new Set(paginatedPairs.map(p => p.collegeSubjectId))];
    const facultyIds = [...new Set(paginatedPairs.map(p => p.facultyId))];
    const userIds = [...new Set(paginatedPairs.map(p => {
      const fac = Array.isArray(p.faculty) ? p.faculty[0] : p.faculty;
      return fac?.userId;
    }).filter(Boolean))];

    const [assignmentsRes, profilesRes, empIdsRes] = await Promise.all([
      subjectIds.length > 0
        ? supabase.from("assignments").select("subjectId, createdBy").in("subjectId", subjectIds).in("createdBy", facultyIds).eq("status", "Active").eq("is_deleted", false)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? supabase.from("user_profile").select("userId, profileUrl").in("userId", userIds).eq("is_deleted", false)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? supabase.from("employee_ids").select("userId, employeeId").in("userId", userIds).eq("isActive", true).eq("collegeId", collegeId)
        : Promise.resolve({ data: [] })
    ]);

    const assignmentCounts = new Map<string, number>();
    assignmentsRes.data?.forEach(a => {
      const key = `${a.createdBy}-${a.subjectId}`;
      assignmentCounts.set(key, (assignmentCounts.get(key) || 0) + 1);
    });

    const profileMap = new Map<number, string>();
    profilesRes.data?.forEach(p => {
      if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
    });

    const empIdMap = new Map<number, string>();
    empIdsRes.data?.forEach(e => {
      if (e.employeeId) empIdMap.set(e.userId, e.employeeId);
    });

    const result = paginatedPairs.map((item: any) => {
      const fac = Array.isArray(item.faculty) ? item.faculty[0] : item.faculty;
      const sub = Array.isArray(item.college_subjects) ? item.college_subjects[0] : item.college_subjects;
      const userId = fac?.userId;

      return {
        uniqueId: `${item.facultyId}-${sub?.subjectCode}`,
        id: item.collegeSubjectId,
        subject: sub?.subjectName || "Unknown Subject",
        instructorName: fac?.fullName || "Unknown Faculty",
        instructorId: item.facultyId,
        employeeId: empIdMap.get(userId) || "N/A",
        profileUrl: profileMap.get(userId) || "",
        // Maintained avatarUrl for legacy fallback if needed
        avatarUrl: profileMap.get(userId),
        activeAssignments: assignmentCounts.get(`${item.facultyId}-${item.collegeSubjectId}`) || 0,
        pendingSubmissions: 0,
        issuesRaised: 0,
      };
    });

    return {
      data: result,
      count: totalCount,
      subjectOptions,
      facultyOptions,
      error: null,
    };
  } catch (err: any) {
    console.error("Admin Subject Fetch Error:", err);
    return {
      data: [],
      count: 0,
      subjectOptions: ["All"],
      facultyOptions: ["All"],
      error: err.message,
    };
  }
}
