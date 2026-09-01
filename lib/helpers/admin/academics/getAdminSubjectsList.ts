import { supabase } from "@/lib/supabaseClient";
import { CardProps } from "@/app/(screens)/admin/academics/components/subjectCards";

export async function getAdminSubjectsList(
  collegeId: number,
  sectionId: number,
): Promise<{ subjects: CardProps[]; meta: { title: string; year: string } }> {
  try {
    // ---------------------------------------------------------
    // STEP 1: Fetch Section Info
    // ---------------------------------------------------------
    const { data: rawSectionData, error: sectionError } = await supabase
      .from("college_sections")
      .select(
        `
        collegeSectionsId,
        collegeSections,
        collegeBranchId,
        collegeAcademicYearId,
        college_branch ( collegeBranchCode ),
        college_academic_year ( collegeAcademicYear )
      `,
      )
      .eq("collegeSectionsId", sectionId)
      .eq("collegeId", collegeId)
      .maybeSingle();

    if (sectionError || !rawSectionData) {
      console.error("Section Fetch Error:", sectionError);
      return {
        subjects: [],
        meta: { title: "Section Not Found", year: "N/A" },
      };
    }

    const sectionData = rawSectionData as any;

    const branchObj = Array.isArray(sectionData.college_branch)
      ? sectionData.college_branch[0]
      : sectionData.college_branch;

    const yearObj = Array.isArray(sectionData.college_academic_year)
      ? sectionData.college_academic_year[0]
      : sectionData.college_academic_year;

    const branchName = branchObj?.collegeBranchCode ?? "Unknown";
    const yearName = yearObj?.collegeAcademicYear ?? "N/A";
    const sectionName = sectionData.collegeSections ?? "";

    const branchId = sectionData.collegeBranchId;
    const academicYearId = sectionData.collegeAcademicYearId;

    let subjectsQuery = supabase
      .from("college_subjects")
      .select(
        `
        collegeSubjectId,
        subjectName,
        credits,
        collegeSemesterId,
        college_semester ( collegeSemester ),
        college_subject_units (
            collegeSubjectUnitId,
            unitNumber,
            unitTitle,
            startDate,
            endDate,
            completionPercentage,
            collegeSectionsId,
            isActive,
            college_subject_unit_topics (
                collegeSubjectUnitTopicId,
                topicTitle,
                isCompleted,
                displayOrder,
                isActive,
                collegeSectionsId
            )
        )
      `,
      )
      .eq("collegeAcademicYearId", academicYearId)
      .eq("collegeId", collegeId)
      .eq("isActive", true);

    // Schools don't have branches, so only filter by branchId when it exists
    if (branchId != null) {
      subjectsQuery = subjectsQuery.eq("collegeBranchId", branchId);
    }

    const { data: subjectsData, error: subjectsError } = await subjectsQuery;

    if (subjectsError) {
      console.error("Subjects Fetch Error:", subjectsError);
      return { subjects: [], meta: { title: "Error", year: "N/A" } };
    }

    // ---------------------------------------------------------
    // STEP 3: Fetch Faculty Assignments
    // ---------------------------------------------------------
    const { data: facultyAssignments } = await supabase
      .from("faculty_sections")
      .select(
        `
        collegeSubjectId,
        faculty (
          fullName,
          email,
          users:userId (
            user_profile (
              profileUrl,
              is_deleted
            )
          )
        )
      `,
      )
      .eq("collegeSectionsId", sectionId)
      .eq("isActive", true);

    const facultyMap: Record<number, any> = {};
    if (facultyAssignments) {
      facultyAssignments.forEach((item: any) => {
        facultyMap[item.collegeSubjectId] = item.faculty;
      });
    }

    // ---------------------------------------------------------
    // STEP 4: Merge & Calculate Progress
    // ---------------------------------------------------------
    const cards: CardProps[] = (subjectsData || []).map((subject: any) => {
      const faculty = facultyMap[subject.collegeSubjectId];

      const rawUnits = (subject.college_subject_units || []).filter(
        (unit: any) =>
          unit.isActive !== false &&
          (unit.collegeSectionsId == null || unit.collegeSectionsId === sectionId),
      );
      const unitsByNumber = new Map<number, any>();
      rawUnits.forEach((unit: any) => {
        const existing = unitsByNumber.get(unit.unitNumber);
        if (
          !existing ||
          (existing.collegeSectionsId == null && unit.collegeSectionsId != null)
        ) {
          unitsByNumber.set(unit.unitNumber, unit);
        }
      });
      const units = Array.from(unitsByNumber.values());
      // Sort units by Unit Number (1, 2, 3...)
      units.sort((a: any, b: any) => (a.unitNumber || 0) - (b.unitNumber || 0));

      // --- DATE LOGIC UPDATED ---
      // 1. Helper to format date
      const formatDate = (dateString: string | null) => {
        if (!dateString) return "TBD";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "TBD";

        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${mm}-${dd}-${yyyy}`;
      };

      // 2. Get First Unit Start Date and Last Unit End Date
      const firstUnit = units.length > 0 ? units[0] : null;
      const lastUnit = units.length > 0 ? units[units.length - 1] : null;

      const fromDate = firstUnit ? formatDate(firstUnit.startDate) : "TBD";
      const toDate = lastUnit ? formatDate(lastUnit.endDate) : "TBD";

      // --- Topics Logic ---
      let subjectTotalTopics = 0;
      let subjectCompletedTopics = 0;
      let nextLessonName: string | null = null;
      let hasFoundNext = false;
      let hasAnyTopics = false;
      const unitPercentages: number[] = [];

      // Process topics inside units
      units.forEach((u: any) => {
        const rawTopics = (u.college_subject_unit_topics || []).filter(
          (topic: any) =>
            topic.isActive !== false &&
            (topic.collegeSectionsId == null || topic.collegeSectionsId === sectionId),
        );
        const topicsByTitle = new Map<string, any>();
        rawTopics.forEach((topic: any) => {
          const key = topic.topicTitle?.trim().toLowerCase() || String(topic.collegeSubjectUnitTopicId);
          const existing = topicsByTitle.get(key);
          if (
            !existing ||
            (existing.collegeSectionsId == null && topic.collegeSectionsId != null)
          ) {
            topicsByTitle.set(key, topic);
          }
        });
        const activeTopics = Array.from(topicsByTitle.values());
        activeTopics.sort(
          (a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0),
        );

        if (activeTopics.length > 0) hasAnyTopics = true;

        const completedInUnit = activeTopics.filter(
          (topic: any) => topic.isCompleted,
        ).length;
        unitPercentages.push(
          activeTopics.length === 0
            ? 0
            : Math.round((completedInUnit / activeTopics.length) * 100),
        );

        activeTopics.forEach((t: any) => {
          subjectTotalTopics++;
          if (t.isCompleted) {
            subjectCompletedTopics++;
          } else if (!hasFoundNext) {
            nextLessonName = t.topicTitle;
            hasFoundNext = true;
          }
        });
      });

      const percentage =
        unitPercentages.length > 0
          ? Math.round(
              unitPercentages.reduce((sum, value) => sum + value, 0) /
                unitPercentages.length,
            )
          : 0;

      const profileData = faculty?.users?.user_profile;
      const profiles = Array.isArray(profileData) ? profileData : [profileData];
      const activeProfile = profiles.find(
        (profile: any) => profile && !profile.is_deleted,
      );

      return {
        subjectId: subject.collegeSubjectId,
        facultyName: faculty?.fullName || "Not Assigned",
        facultyProfile: activeProfile?.profileUrl || "",
        subjectTitle: subject.subjectName,
        year: branchId ? `${branchName} - ${sectionName}` : `Section - ${sectionName}`,
        semester: Array.isArray(subject.college_semester)
          ? subject.college_semester[0]?.collegeSemester ?? null
          : subject.college_semester?.collegeSemester ?? null,
        units: units.length,
        topicsCovered: subjectCompletedTopics,
        topicsTotal: subjectTotalTopics,
        nextLesson: hasFoundNext
          ? nextLessonName!
          : hasAnyTopics
            ? "Completed"
            : "No Topics",
        percentage: percentage,
        students: 0,
        fromDate, // First Unit Start Date
        toDate, // Last Unit End Date
        credits: subject.credits,
      } as CardProps;
    });

    return {
      subjects: cards,
      meta: {
        title: branchId ? `${branchName} - ${sectionName}` : `Section - ${sectionName}`,
        year: yearName,
      },
    };
  } catch (error) {
    console.error("Helper Critical Error:", error);
    return { subjects: [], meta: { title: "Error", year: "N/A" } };
  }
}
