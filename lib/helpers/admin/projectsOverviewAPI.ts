import { supabase } from "@/lib/supabaseClient";

export interface CardKey {
    branchId: number | null;
    yearId: number;
}

function makeKey(branchId: number | null, yearId: number): string {
    return `${branchId ?? "null"}-${yearId}`;
}

/**
 * Batch fetch student counts for multiple branch/year combinations.
 * Replaces N individual calls to fetchActiveStudentCount with 1 query.
 */
export async function getBatchStudentCounts(
    collegeEducationId: number,
    cards: CardKey[]
): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    if (cards.length === 0) return result;

    try {
        const yearIds = [...new Set(cards.map((c) => c.yearId))];

        let query = supabase
            .from("students")
            .select(`
                studentId,
                collegeBranchId,
                student_academic_history!inner(collegeAcademicYearId, isCurrent)
            `)
            .eq("collegeEducationId", collegeEducationId)
            .eq("isActive", true)
            .eq("status", "Active")
            .is("deletedAt", null)
            .eq("student_academic_history.isCurrent", true)
            .is("student_academic_history.deletedAt", null)
            .in("student_academic_history.collegeAcademicYearId", yearIds);

        const { data, error } = await query;

        if (error) {
            console.error("getBatchStudentCounts error:", error);
            return result;
        }

        // Group and count by branchId + yearId
        for (const student of data ?? []) {
            const histories = Array.isArray(student.student_academic_history)
                ? student.student_academic_history
                : [student.student_academic_history];

            for (const hist of histories) {
                const key = makeKey(student.collegeBranchId, hist.collegeAcademicYearId);
                result.set(key, (result.get(key) ?? 0) + 1);
            }
        }
    } catch (err) {
        console.error("Unexpected error in getBatchStudentCounts:", err);
    }

    return result;
}

/**
 * Batch fetch faculty data (count + photos) for multiple branch/year combinations.
 * Replaces N individual calls to fetchActiveFacultyData (each making 3 queries) with 3 total queries.
 */
export async function getBatchFacultyData(
    collegeEducationId: number,
    cards: CardKey[]
): Promise<Map<string, { count: number; photos: string[] }>> {
    const result = new Map<string, { count: number; photos: string[] }>();
    if (cards.length === 0) return result;

    try {
        const yearIds = [...new Set(cards.map((c) => c.yearId))];

        // Step 1 & 2: Get faculty_sections and faculty in parallel
        const [sectionResult, facultyResult] = await Promise.all([
            supabase
                .from("faculty_sections")
                .select("facultyId, collegeAcademicYearId")
                .in("collegeAcademicYearId", yearIds)
                .eq("isActive", true)
                .is("deletedAt", null),
            supabase
                .from("faculty")
                .select("facultyId, userId, collegeBranchId")
                .eq("collegeEducationId", collegeEducationId)
                .eq("isActive", true)
                .is("deletedAt", null)
        ]);

        const { data: sectionData, error: sectionError } = sectionResult;
        const { data: facultyData, error: facultyError } = facultyResult;

        if (sectionError || !sectionData?.length) return result;
        if (facultyError || !facultyData?.length) return result;
        
        // Filter facultyData to only include those present in sections
        const sectionFacultyIds = new Set(sectionData.map((s: any) => s.facultyId));
        const relevantFaculty = facultyData.filter((f: any) => sectionFacultyIds.has(f.facultyId));

        // Step 3: Get all profile photos (single query)
        const userIds = [...new Set(relevantFaculty.map((f: any) => f.userId).filter(Boolean))];
        const { data: profileData } = await supabase
            .from("user_profile")
            .select("userId, profileUrl")
            .in("userId", userIds)
            .eq("is_deleted", false);

        const profileMap = new Map(
            (profileData ?? []).map((p: any) => [p.userId, p.profileUrl])
        );

        // Build a map: facultyId -> { userId, branchId }
        const facultyMap = new Map(
            relevantFaculty.map((f: any) => [f.facultyId, { userId: f.userId, branchId: f.collegeBranchId }])
        );

        // Build a map: yearId -> Set<facultyId> from sections
        const yearFacultyMap = new Map<number, Set<number>>();
        for (const sec of sectionData) {
            if (!yearFacultyMap.has(sec.collegeAcademicYearId)) {
                yearFacultyMap.set(sec.collegeAcademicYearId, new Set());
            }
            yearFacultyMap.get(sec.collegeAcademicYearId)!.add(sec.facultyId);
        }

        // Now compute per-card counts
        for (const card of cards) {
            const key = makeKey(card.branchId, card.yearId);
            const facultyIdsForYear = yearFacultyMap.get(card.yearId) ?? new Set();

            const matchingFaculty: { userId: number; branchId: number | null }[] = [];
            for (const fId of facultyIdsForYear) {
                const fInfo = facultyMap.get(fId);
                if (!fInfo) continue;

                // Match branch: null === null, or exact match
                if (card.branchId === null ? fInfo.branchId === null : fInfo.branchId === card.branchId) {
                    matchingFaculty.push(fInfo);
                }
            }

            const photos = matchingFaculty
                .map((f) => profileMap.get(f.userId))
                .filter((url): url is string => !!url)
                .filter((value, index, self) => self.indexOf(value) === index)
                .slice(0, 4);

            result.set(key, { count: matchingFaculty.length, photos });
        }
    } catch (err) {
        console.error("Unexpected error in getBatchFacultyData:", err);
    }

    return result;
}

/**
 * Batch fetch active project counts for multiple branch/year combinations.
 * Replaces N individual calls to fetchActiveProjectCountByBranchYear (each making 3 queries) with 3 total queries.
 */
export async function getBatchProjectCounts(
    collegeId: number,
    cards: CardKey[]
): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    if (cards.length === 0) return result;

    try {
        const today = new Date().toISOString();
        const yearIds = [...new Set(cards.map((c) => c.yearId))];

        // Step 1 & 2: Get faculty and faculty_sections in parallel
        const [facultyResult, sectionResult] = await Promise.all([
            supabase
                .from("faculty")
                .select("facultyId, collegeBranchId")
                .eq("collegeId", collegeId)
                .eq("isActive", true)
                .is("deletedAt", null),
            supabase
                .from("faculty_sections")
                .select("facultyId, collegeAcademicYearId")
                .in("collegeAcademicYearId", yearIds)
                .eq("isActive", true)
                .is("deletedAt", null)
        ]);

        const { data: facultyData, error: facultyError } = facultyResult;
        const { data: sectionDataRaw, error: sectionError } = sectionResult;

        if (facultyError || !facultyData?.length) return result;
        if (sectionError || !sectionDataRaw?.length) return result;

        const allFacultyIds = new Set(facultyData.map((f: any) => f.facultyId));
        const sectionData = sectionDataRaw.filter((s: any) => allFacultyIds.has(s.facultyId));
        
        if (!sectionData.length) return result;

        // Build branchId map from faculty
        const facultyBranchMap = new Map(
            facultyData.map((f: any) => [f.facultyId, f.collegeBranchId])
        );

        // Build a map: key -> Set<facultyId>
        const cardFacultyMap = new Map<string, Set<number>>();
        for (const sec of sectionData) {
            const branchId = facultyBranchMap.get(sec.facultyId);
            if (branchId === undefined) continue;
            const key = makeKey(branchId, sec.collegeAcademicYearId);
            if (!cardFacultyMap.has(key)) {
                cardFacultyMap.set(key, new Set());
            }
            cardFacultyMap.get(key)!.add(sec.facultyId);
        }

        // Step 3: Get all active projects for all matched faculty (single query)
        const allMatchedFacultyIds = [...new Set(sectionData.map((s: any) => s.facultyId))];

        const { data: projectData, error: projectError } = await supabase
            .from("projects")
            .select("projectId, facultyId")
            .in("facultyId", allMatchedFacultyIds)
            .eq("collegeId", collegeId)
            .is("deletedAt", null)
            .gte("endDate", today);

        if (projectError) return result;

        // Count projects per card
        for (const project of projectData ?? []) {
            const branchId = facultyBranchMap.get(project.facultyId);
            if (branchId === undefined) continue;

            // Find which yearIds this faculty teaches in
            const yearEntries = sectionData.filter((s: any) => s.facultyId === project.facultyId);
            for (const entry of yearEntries) {
                const key = makeKey(branchId, entry.collegeAcademicYearId);
                // Only count if this card is in our requested set
                if (cardFacultyMap.has(key)) {
                    result.set(key, (result.get(key) ?? 0) + 1);
                }
            }
        }
    } catch (err) {
        console.error("Unexpected error in getBatchProjectCounts:", err);
    }

    return result;
}
