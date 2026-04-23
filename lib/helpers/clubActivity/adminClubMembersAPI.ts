import { supabase } from "@/lib/supabaseClient";


export async function getAdminClubTitleAPI(clubId: number) {
    const { data, error } = await supabase
        .from("clubs")
        .select("title")
        .eq("clubId", clubId)
        .single();

    if (error) throw new Error("Failed to fetch club title");
    return data.title;
}

export async function getAdminClubMembersAPI(
    clubId: number,
    status: string,
    page: number = 1,
    limit: number = 20,
    searchQuery: string = "",
    filters: { eduId?: number; branchId?: number; yearId?: number }
) {
    const offset = (page - 1) * limit;

    let query = supabase
        .from("club_members")
        .select(`
            clubMemberId,
            studentId,
            joinedAt,
            removedAt,
            is_deleted,
            students!inner(
                collegeEducationId,
                collegeBranchId,
                users!inner(fullName, user_profile(profileUrl)),
                student_pins(pinNumber),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode),
                student_academic_history(
                    isCurrent,
                    collegeAcademicYearId,
                    college_academic_year(collegeAcademicYear)
                )
            )
        `, { count: "exact" })
        .eq("clubId", Number(clubId))
        .eq("is_deleted", false);

    if (status === "active") {
        query = query.eq("students.isActive", true);
    } else if (status === "inactive") {
        query = query.eq("students.isActive", false);
    }

    if (filters.eduId) query = query.eq("students.collegeEducationId", filters.eduId);
    if (filters.branchId) query = query.eq("students.collegeBranchId", filters.branchId);
    if (filters.yearId) query = query.eq("students.student_academic_history.collegeAcademicYearId", filters.yearId);

    if (searchQuery) {
        query = query.ilike("students.users.fullName", `%${searchQuery}%`);
    }

    query = query
        .order("joinedAt", { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error("Failed to load club members");

    const formattedData = data.map((member: any) => {
        const userNode = member.students?.users;
        const profileData = userNode?.user_profile;
        const avatarUrl = Array.isArray(profileData) ? profileData[0]?.profileUrl : profileData?.profileUrl;

        const pinData = Array.isArray(member.students?.student_pins)
            ? member.students?.student_pins[0]
            : member.students?.student_pins;
        const pinNumber = pinData?.pinNumber || "N/A";

        const edu = member.students?.college_education?.collegeEducationType || "-";
        const branch = member.students?.college_branch?.collegeBranchCode || "-";

        const academicHistory = member.students?.student_academic_history || [];
        const currentHistory = academicHistory.find((h: any) => h?.isCurrent) || academicHistory[0] || null;
        const year = currentHistory?.college_academic_year?.collegeAcademicYear || "-";

        let formattedDate = "-";

        if (member.joinedAt) {
            const d = new Date(member.joinedAt);
            formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        return {
            id: member.clubMemberId.toString(),
            studentId: member.studentId,
            pinNumber: pinNumber,
            name: userNode?.fullName || "Unknown",
            avatar: avatarUrl || null,
            edu: edu,
            branch: branch,
            year: year,
            date: formattedDate,
            is_deleted: member.is_deleted
        };
    });

    return { members: formattedData, totalCount: count || 0 };
}

export async function removeAdminClubMembersAPI(
    studentsData: { studentId: number; clubId: number }[],
    adminId: number
) {
    if (!studentsData || studentsData.length === 0) return;

    const timestamp = new Date().toISOString();
    const clubId = studentsData[0].clubId;
    const studentIds = studentsData.map(data => data.studentId);

    const { error: memberUpdateError } = await supabase
        .from("club_members")
        .update({
            is_deleted: true,
            removedByAdminId: adminId,
            removedAt: timestamp,
            deletedAt: timestamp
        })
        .eq("clubId", clubId)
        .in("studentId", studentIds);

    if (memberUpdateError) throw new Error("Failed to remove members");

    const { error: requestUpdateError } = await supabase
        .from("club_join_requests")
        .update({
            status: "rejected",
            updatedAt: timestamp
        })
        .eq("clubId", clubId)
        .in("studentId", studentIds);

    if (requestUpdateError) console.error("Failed to sync request status to rejected.");
}