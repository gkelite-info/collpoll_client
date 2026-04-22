import { supabase } from "@/lib/supabaseClient";

export async function getFacultyClubDetailsAPI(facultyId: number) {
    let targetClubId = null;
    
    const { data: respFacultyClub } = await supabase
        .from("clubs")
        .select("clubId")
        .eq("responsibleFacultyId", facultyId)
        .eq("is_deleted", false)
        .limit(1)
        .maybeSingle();

    if (respFacultyClub) {
        targetClubId = respFacultyClub.clubId;
    } else {
        const { data: mentorClub } = await supabase
            .from("club_mentors")
            .select("clubId")
            .eq("facultyId", facultyId)
            .eq("is_deleted", false)
            .limit(1)
            .maybeSingle();
            
        if (mentorClub) targetClubId = mentorClub.clubId;
    }

    if (!targetClubId) return null;
    const { data: clubData, error } = await supabase
        .from("clubs")
        .select(`
            clubId,
            title,
            imageUrl,
            president:students!clubs_presidentStudentId_fkey(
                users(fullName, user_profile(profileUrl))
            ),
            vicePresident:students!clubs_vicePresidentStudentId_fkey(
                users(fullName, user_profile(profileUrl))
            ),
            responsibleFaculty:faculty!clubs_responsibleFacultyId_fkey(
                users(fullName, user_profile(profileUrl))
            ),
            mentors:club_mentors(
                is_deleted,
                faculty(facultyId, users(fullName, user_profile(profileUrl)))
            )
        `)
        .eq("clubId", targetClubId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching faculty club details:", error.message || error);
        throw new Error("Failed to load club details");
    }

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
        president: formatUser(clubData.president, "President"),
        vicePresident: formatUser(clubData.vicePresident, "Vice President"),
        responsibleFaculty: formatUser(clubData.responsibleFaculty, "Responsible Faculty"),
        mentors: (clubData.mentors || [])
            .filter((m: any) => !m.is_deleted && m.faculty)
            .map((m: any) => formatUser(m.faculty, "Mentor", m.faculty.facultyId.toString()))
    };
}