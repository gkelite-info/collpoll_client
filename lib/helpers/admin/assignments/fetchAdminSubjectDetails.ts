import { supabase } from "@/lib/supabaseClient";

export async function fetchAdminSubjectDetails(
  collegeId: number,
  branchCode: string,
  yearName: string,
  page: number = 1,
  limit: number = 10,
) {
  try {
    const { data: branchData } = await supabase
      .from("college_branch")
      .select("collegeBranchId")
      .eq("collegeBranchCode", branchCode)
      .eq("collegeId", collegeId)
      .maybeSingle();

    const { data: yearData } = await supabase
      .from("college_academic_year")
      .select("collegeAcademicYearId")
      .eq("collegeAcademicYear", yearName)
      .eq("collegeId", collegeId)
      .eq("collegeBranchId", branchData?.collegeBranchId)
      .maybeSingle();

    if (!branchData || !yearData)
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
    const totalCount = uniquePairs.length;

    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedPairs = uniquePairs.slice(from, to);

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

    return { data: result, count: totalCount, error: null };
  } catch (err: any) {
    console.error("Admin Subject Fetch Error:", err);
    return { data: [], count: 0, error: err.message };
  }
}