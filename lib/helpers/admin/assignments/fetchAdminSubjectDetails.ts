import { supabase } from "@/lib/supabaseClient";

export async function fetchAdminSubjectDetails(
  collegeId: number,
  branchCode: string,
  yearName: string,
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
      return { data: [], error: "Invalid Branch or Year" };

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

    const result = await Promise.all(
      uniquePairs.map(async (item: any) => {
        const fac = Array.isArray(item.faculty)
          ? item.faculty[0]
          : item.faculty;
        const sub = Array.isArray(item.college_subjects)
          ? item.college_subjects[0]
          : item.college_subjects;

        const { count } = await supabase
          .from("assignments")
          .select("*", { count: "exact", head: true })
          .eq("subjectId", item.collegeSubjectId)
          .eq("createdBy", item.facultyId)
          .eq("status", "Active")
          .eq("is_deleted", false);

        return {
          uniqueId: `${item.facultyId}-${sub?.subjectCode}`,
          id: item.collegeSubjectId,
          subject: sub?.subjectName || "Unknown Subject",
          instructorName: fac?.fullName || "Unknown Faculty",
          instructorId: item.facultyId,
          avatarUrl: `https://i.pravatar.cc/100?u=${fac?.email || item.facultyId}`,
          activeAssignments: count || 0,
          pendingSubmissions: 0,
          issuesRaised: 0,
        };
      }),
    );

    return { data: result, error: null };
  } catch (err: any) {
    console.error("Admin Subject Fetch Error:", err);
    return { data: [], error: err.message };
  }
}
