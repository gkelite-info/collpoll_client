import { supabase } from "@/lib/supabaseClient";

export async function getAdminClubDetailsByIdAPI(clubId: number) {
    const { data: clubData, error } = await supabase
        .from("clubs")
        .select(`
            clubId,
            title,
            imageUrl,
            president:students!clubs_presidentStudentId_fkey(users(fullName, user_profile(profileUrl))),
            vicePresident:students!clubs_vicePresidentStudentId_fkey(users(fullName, user_profile(profileUrl))),
            responsibleFaculty:faculty!clubs_responsibleFacultyId_fkey(users(fullName, user_profile(profileUrl))),
            mentors:club_mentors(is_deleted, faculty(facultyId, users(fullName, user_profile(profileUrl))))
        `)
        .eq("clubId", clubId)
        .eq("is_deleted", false)
        .maybeSingle();

    if (error) throw new Error("Failed to fetch club data");
    if (!clubData) return null;

    const formatUser = (userNode: any, defaultRole: string, id?: string) => {
        const profileData = userNode?.users?.user_profile;
        const avatarUrl = Array.isArray(profileData) ? profileData[0]?.profileUrl : profileData?.profileUrl;
        return {
            id: id || "0",
            name: userNode?.users?.fullName || "Not Assigned",
            avatar: avatarUrl || null,
            role: defaultRole
        };
    };

    return {
        id: clubData.clubId.toString(),
        name: clubData.title,
        logo: clubData.imageUrl,
        president: formatUser(clubData.president, "president"),
        vicePresident: formatUser(clubData.vicePresident, "vicepresident"),
        responsibleFaculty: formatUser(clubData.responsibleFaculty, "responsiblefaculty"),
        mentors: (clubData.mentors || [])
            .filter((m: any) => !m.is_deleted && m.faculty)
            .map((m: any) => formatUser(m.faculty, "mentor", m.faculty.facultyId.toString()))
    };
}