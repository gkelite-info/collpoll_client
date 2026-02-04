import { supabase } from "@/lib/supabaseClient";

export async function fetchAdminDepartmentStats(collegeId: number) {
  try {
    // 1. Fetch active Faculty Sections
    const { data: sections, error } = await supabase
      .from("faculty_sections")
      .select(
        `
        facultyId,
        collegeSubjectId,
        collegeAcademicYearId,
        college_academic_year (collegeAcademicYear),
        college_sections (
          collegeBranchId,
          college_branch (collegeBranchCode, collegeBranchType)
        ),
        faculty (fullName, userId, email)
      `,
      )
      .eq("isActive", true);

    if (error) throw error;

    // 2. Fetch Active Students for real counts
    const { data: students } = await supabase
      .from("students")
      .select("collegeBranchId")
      .eq("collegeId", collegeId)
      .eq("isActive", true);

    const studentCounts = new Map<number, number>();
    students?.forEach((s) => {
      studentCounts.set(
        s.collegeBranchId,
        (studentCounts.get(s.collegeBranchId) || 0) + 1,
      );
    });

    // 3. Group by Branch-Year
    const grouped = new Map();

    sections.forEach((item: any) => {
      const sectionObj = Array.isArray(item.college_sections)
        ? item.college_sections[0]
        : item.college_sections;
      const branchObj = sectionObj?.college_branch;
      const branchCode = branchObj?.collegeBranchCode;
      const branchId = sectionObj?.collegeBranchId;
      const year = item.college_academic_year?.collegeAcademicYear;

      if (!branchCode || !year) return;

      const key = `${branchCode}-${year}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          name: branchCode,
          deptCode: branchCode,
          year: year,
          facultySet: new Set(),
          subjectIds: new Set<number>(), // <--- Properly initialized here
          studentCount: studentCounts.get(branchId) || 0,
        });
      }

      const group = grouped.get(key);
      group.subjectIds.add(item.collegeSubjectId);
      if (item.faculty) group.facultySet.add(JSON.stringify(item.faculty));
    });

    // 4. Final aggregation with Dynamic Assignment check
    const result = await Promise.all(
      Array.from(grouped.values()).map(async (g) => {
        const uniqueFaculty = Array.from(g.facultySet).map((f: any) =>
          JSON.parse(f),
        );
        const subIds = Array.from(g.subjectIds) as number[];

        // Count Subjects in this group that have at least one Active Assignment
        let activeSubjectsCount = 0;
        if (subIds.length > 0) {
          const { data: assignments } = await supabase
            .from("assignments")
            .select("subjectId")
            .in("subjectId", subIds)
            .eq("status", "Active")
            .eq("is_deleted", false);

          // Get unique subjects from the assignments found
          activeSubjectsCount = new Set(assignments?.map((a) => a.subjectId))
            .size;
        }

        return {
          id: g.id,
          name: g.name,
          deptCode: g.deptCode,
          year: g.year,
          ...getDeptColor(g.name),
          totalStudents: g.studentCount,
          activeSubjects: activeSubjectsCount, // <--- Now Dynamic
          issuesRaised: 0,
          facultyCount: uniqueFaculty.length,
          facultyList: uniqueFaculty,
        };
      }),
    );

    return { data: result, error: null };
  } catch (err: any) {
    console.error("Admin Dept Fetch Error:", err);
    return { data: [], error: err.message };
  }
}

function getDeptColor(code: string) {
  const map: any = {
    CSE: { text: "#FF767D", color: "#FFB4B8", bgColor: "#FFF5F5" },
    ECE: { text: "#FF9F7E", color: "#F3D3C8", bgColor: "#FFF9DB" },
    EEE: { text: "#F8CF64", color: "#F3E2B6", bgColor: "#FFF9DB" },
    IT: { text: "#66EEFA", color: "#BCECF0", bgColor: "#E7F5FF" },
  };
  return map[code] || { text: "#282828", color: "#E0E0E0", bgColor: "#F9F9F9" };
}
