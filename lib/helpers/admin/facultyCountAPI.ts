import { supabase } from "@/lib/supabaseClient";

// export async function fetchActiveFacultyData(
//     collegeEducationId: number,
//     collegeBranchId: number,
//     collegeAcademicYearId: number
// ) {
//     try {
//         const { data, error } = await supabase
//             .from("faculty_sections")
//             .select(`
//                 facultyId,
//                 faculty!inner(
//                     userId, 
//                     collegeEducationId, 
//                     collegeBranchId, 
//                     isActive,
//                     user:users!inner(
//                         profile:user_profile(profileUrl)
//                     )
//                 )
//             `)
//             .eq("collegeAcademicYearId", collegeAcademicYearId)
//             .eq("isActive", true)
//             .is("deletedAt", null)
//             .eq("faculty.collegeEducationId", collegeEducationId)
//             .eq("faculty.collegeBranchId", collegeBranchId)
//             .eq("faculty.isActive", true)
//             .is("faculty.deletedAt", null);

//         if (error) {
//             console.error("fetchActiveFacultyData error:", JSON.stringify(error, null, 2));
//             return { count: 0, photos: [] };
//         }

//         const uniqueFacultyIds = new Set(data.map(item => item.facultyId));

//         const photos = data
//             .map(item => {
//                 const facultyData = Array.isArray(item.faculty) ? item.faculty[0] : item.faculty;

//                 const userData = Array.isArray(facultyData?.user) ? facultyData.user[0] : facultyData?.user;

//                 const profileData = Array.isArray(userData?.profile) ? userData.profile[0] : userData?.profile;

//                 return profileData?.profileUrl;
//             })
//             .filter((url): url is string => !!url)
//             .filter((value, index, self) => self.indexOf(value) === index)
//             .slice(0, 4);

//         return {
//             count: uniqueFacultyIds.size,
//             photos: photos
//         };
//     } catch (err) {
//         console.error("Unexpected error fetching faculty data:", err);
//         return { count: 0, photos: [] };
//     }
// }

export async function fetchActiveFacultyData(
    collegeEducationId: number,
    collegeBranchId: number,
    collegeAcademicYearId: number
) {
    try {
        // ✅ Step 1: Lightweight — just get facultyIds from sections
        const { data: sectionData, error: sectionError } = await supabase
            .from("faculty_sections")
            .select("facultyId")
            .eq("collegeAcademicYearId", collegeAcademicYearId)
            .eq("isActive", true)
            .is("deletedAt", null);

        if (sectionError || !sectionData?.length) return { count: 0, photos: [] };

        const uniqueFacultyIds = [...new Set(sectionData.map((s: any) => s.facultyId))];

        // ✅ Step 2: Filter by branch + education — no joins
        const { data: facultyData, error: facultyError } = await supabase
            .from("faculty")
            .select("facultyId, userId")
            .in("facultyId", uniqueFacultyIds)
            .eq("collegeEducationId", collegeEducationId)
            .eq("collegeBranchId", collegeBranchId)
            .eq("isActive", true)
            .is("deletedAt", null);

        if (facultyError || !facultyData?.length) return { count: 0, photos: [] };

        const userIds = facultyData.map((f: any) => f.userId).filter(Boolean);

        // ✅ Step 3: Get photos separately — simple flat query
        const { data: profileData } = await supabase
            .from("user_profile")
            .select("userId, profileUrl")
            .in("userId", userIds)
            .eq("is_deleted", false);

        const profileMap = new Map(
            (profileData ?? []).map((p: any) => [p.userId, p.profileUrl])
        );

        const photos = facultyData
            .map((f: any) => profileMap.get(f.userId))
            .filter((url): url is string => !!url)
            .slice(0, 4);

        return {
            count: facultyData.length,
            photos,
        };

    } catch (err) {
        console.error("Unexpected error fetching faculty data:", err);
        return { count: 0, photos: [] };
    }
}

export async function fetchProfilesByUserIds(userIds: number[]) {
    const { data, error } = await supabase
        .from("user_profile")
        .select("profileUrl, userId")
        .in("userId", userIds)
        .eq("is_deleted", false);

    if (error) return [];
    return data;
}

export async function fetchSubjectFacultyList(collegeAcademicYearId: number, collegeBranchId: number) {
    try {
        const { data, error } = await supabase
            .from("faculty_sections")
            .select(`
                facultySectionId,
                collegeSubjectId,
                facultyId,
                college_sections!inner (
                    collegeBranchId
                )
            `)
            .eq("collegeAcademicYearId", collegeAcademicYearId)
            .eq("college_sections.collegeBranchId", collegeBranchId)
            .eq("isActive", true)
            .is("deletedAt", null);

        if (error) {
            console.error("fetchSubjectFacultyList error:", JSON.stringify(error, null, 2));
            return [];
        }

        if (!data || data.length === 0) return [];

        const subjectIds = [...new Set(data.map((d: any) => d.collegeSubjectId))];
        const facultyIds = [...new Set(data.map((d: any) => d.facultyId))];

        const today = new Date().toISOString();

        const [subjectsRes, facultyRes, projectsRes] = await Promise.all([
            supabase
                .from("college_subjects")
                .select("collegeSubjectId, subjectName")
                .in("collegeSubjectId", subjectIds),

            supabase
                .from("faculty")
                .select(`
                    facultyId,
                    fullName,
                    users (
                        user_profile (
                            profileUrl
                        )
                    )
                `)
                .in("facultyId", facultyIds)
                .eq("isActive", true),

            supabase
                .from("projects")
                .select("projectId, facultyId, endDate")
                .in("facultyId", facultyIds)
                .is("deletedAt", null)
                .gte("endDate", today),
        ]);


        const subjectsMap = new Map(
            (subjectsRes.data || []).map((s: any) => [s.collegeSubjectId, s.subjectName])
        );

        const facultyMap = new Map(
            (facultyRes.data || []).map((f: any) => [f.facultyId, f])
        );

        const activeProjectCountMap = new Map<number, number>();
        (projectsRes.data || []).forEach((p: any) => {
            const prev = activeProjectCountMap.get(p.facultyId) ?? 0;
            activeProjectCountMap.set(p.facultyId, prev + 1);
        });

        return data.map((item: any) => {
            const faculty = facultyMap.get(item.facultyId);
            const profile = faculty?.users?.user_profile?.[0];

            return {
                id: item.facultySectionId,
                subject: subjectsMap.get(item.collegeSubjectId) || "Unknown Subject",
                subjectId: item.collegeSubjectId,
                facultyName: faculty?.fullName || "No Faculty Assigned",
                facultyId: item.facultyId || "N/A",
                avatar: profile?.profileUrl || null,
                activeQuiz: activeProjectCountMap.get(item.facultyId) ?? 0,
                pendingSubmissions: 0
            };
        });

    } catch (err) {
        console.error("Unexpected error:", err);
        return [];
    }
}

export async function fetchFacultySubjectDiscussionCount(
    facultyId: number,
    collegeSubjectId: number
) {
    try {
        const today = new Date().toISOString().split("T")[0];

        const { count, error } = await supabase
            .from("discussion_forum")
            .select(`
        discussionId,
        discussion_forum_sections!inner (
          college_sections!inner (
            faculty_sections!inner (
              collegeSubjectId
            )
          )
        )
      `, { count: "exact", head: true })
            .eq("createdBy", facultyId)
            .eq("discussion_forum_sections.college_sections.faculty_sections.collegeSubjectId", collegeSubjectId)
            .eq("isActive", true)
            .eq("is_deleted", false)
            .gte("deadline", today);

        if (error) return 0;
        return count || 0;
    } catch (err) {
        return 0;
    }
}

export async function fetchDiscussionsByFacultyAndSubject(facultyId: number, subjectId: number) {
    try {
        const { data, error } = await supabase
            .from("discussion_forum")
            .select(`
                "discussionId",
                "title",
                "description",
                "deadline",
                "isActive",
                "createdBy",
                "is_deleted",
                "createdAt",
                discussion_file_uploads (
                    "discussionFileUploadId",
                    "fileUrl",
                    "isActive",
                    "is_deleted"
                )
            `)
            .eq("createdBy", facultyId)
            .eq("is_deleted", false)
            .eq("discussion_file_uploads.is_deleted", false)
            .order("createdAt", { ascending: false });

        if (error) {
            console.error("Supabase Database Error:", error.message);
            return [];
        }

        return data || [];

    } catch (err) {
        console.error("Unexpected helper error:", err);
        return [];
    }
}

export async function fetchDiscussionById(discussionId: number) {
    try {
        const { data, error } = await supabase
            .from("discussion_forum")
            .select(`
        "discussionId",
        title,
        description
      `)
            .eq(`"discussionId"`, discussionId)
            // .eq("is_deleted", false)
            .maybeSingle();

        if (error) {
            console.error("fetchDiscussionById error:", error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Unexpected fetchDiscussionById error:", err);
        return null;
    }
}

export async function fetchActiveProjectCountByBranchYear(
    collegeId: number,
    collegeBranchId: number,
    collegeAcademicYearId: number
): Promise<number> {
    const today = new Date().toISOString();

    const { data: facultyData, error: facultyError } = await supabase
        .from("faculty")
        .select("facultyId")
        .eq("collegeBranchId", collegeBranchId)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (facultyError || !facultyData?.length) return 0;

    const facultyIds = facultyData.map((f: any) => f.facultyId);

    const { data: sectionData, error: sectionError } = await supabase
        .from("faculty_sections")
        .select("facultyId")
        .in("facultyId", facultyIds)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (sectionError || !sectionData?.length) return 0;

    const activeFacultyIds = [...new Set(sectionData.map((s: any) => s.facultyId))];

    const { count, error: projectError } = await supabase
        .from("projects")
        .select("projectId", { count: "exact", head: true })
        .in("facultyId", activeFacultyIds)
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
        .gte("endDate", today);

    if (projectError) return 0;

    return count ?? 0;
}