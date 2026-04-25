import { supabase } from "@/lib/supabaseClient";

export async function joinClubAPI(clubId: number, studentId: number) {
    const now = new Date().toISOString();

    const { data: existingRequest, error: fetchError } = await supabase
        .from("club_join_requests")
        .select("clubJoinRequestId")
        .eq("clubId", clubId)
        .eq("studentId", studentId)
        .maybeSingle();

    if (fetchError) {
        throw new Error("Failed to verify existing club requests.");
    }

    if (existingRequest) {
        const { data, error } = await supabase
            .from("club_join_requests")
            .update({
                status: "pending",
                updatedAt: now,
                is_deleted: false,
            })
            .eq("clubJoinRequestId", existingRequest.clubJoinRequestId)
            .select("clubJoinRequestId")
            .single();

        if (error) throw new Error(error.message || "Failed to update join request.");
        return data;
    } else {
        const { data, error } = await supabase
            .from("club_join_requests")
            .insert({
                clubId: clubId,
                studentId: studentId,
                status: "pending",
                createdAt: now,
                updatedAt: now,
                is_deleted: false,
            })
            .select("clubJoinRequestId")
            .single();

        if (error) throw new Error(error.message || "Failed to send join request.");
        return data;
    }
}

export async function getStudentClubStatusAPI(studentId: number) {
    const { data: leadClub, error: leadError } = await supabase
        .from("clubs")
        .select("clubId")
        .eq("is_deleted", false)
        .or(`presidentStudentId.eq.${studentId},vicePresidentStudentId.eq.${studentId}`)
        .limit(1)
        .maybeSingle();

    if (leadError) console.error("Error checking leadership status:", leadError);

    if (leadClub) {
        return { requestedClubId: leadClub.clubId.toString(), status: "accepted" };
    }

    const { data: memberData, error: memberError } = await supabase
        .from("club_members")
        .select("clubId")
        .eq("studentId", studentId)
        .eq("is_deleted", false)
        .maybeSingle();

    if (memberError) console.error("Error checking membership status:", memberError);

    if (memberData) {
        return { requestedClubId: memberData.clubId.toString(), status: "accepted" };
    }

    const { data: requestData, error: requestError } = await supabase
        .from("club_join_requests")
        .select("clubId, status")
        .eq("studentId", studentId)
        .in("status", ["pending", "accepted"])
        .eq("is_deleted", false)
        .maybeSingle();

    if (requestError) console.error("Error checking request status:", requestError);

    if (requestData) {
        return { requestedClubId: requestData.clubId.toString(), status: requestData.status };
    }

    return { requestedClubId: null, status: null };
}


export async function getStudentClubDetailsAPI(studentId: number) {
    const { data: leadClub } = await supabase
        .from("clubs")
        .select("clubId, title, presidentStudentId, vicePresidentStudentId")
        .eq("is_deleted", false)
        .or(`presidentStudentId.eq.${studentId},vicePresidentStudentId.eq.${studentId}`)
        .limit(1)
        .maybeSingle();

    let targetClubId = null;
    let role = "member";
    let status = "joined";
    let clubName = "";

    if (leadClub) {
        targetClubId = leadClub.clubId;
        clubName = leadClub.title;
        role = leadClub.presidentStudentId === studentId ? "president" : "vicepresident";
    } else {
        const { data: memberClub } = await supabase
            .from("club_members")
            .select("clubId, clubs(title)")
            .eq("studentId", studentId)
            .eq("is_deleted", false)
            .limit(1)
            .maybeSingle();

        if (memberClub) {
            targetClubId = memberClub.clubId;
            const clubInfo = Array.isArray(memberClub.clubs) ? memberClub.clubs[0] : memberClub.clubs;
            clubName = clubInfo?.title || "";
        } else {
            const { data: pendingReq } = await supabase
                .from("club_join_requests")
                .select("clubId, clubs(title)")
                .eq("studentId", studentId)
                .eq("status", "pending")
                .eq("is_deleted", false)
                .limit(1)
                .maybeSingle();

            if (pendingReq) {
                targetClubId = pendingReq.clubId;
                const clubInfo = Array.isArray(pendingReq.clubs) ? pendingReq.clubs[0] : pendingReq.clubs;
                clubName = clubInfo?.title || "";
                status = "pending";
            }
        }
    }

    if (!targetClubId) return { status: "none", clubInfo: null, role: null };
    if (status === "pending") return { status: "pending", clubInfo: { name: clubName }, role: null };

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
        .eq("clubId", targetClubId)
        .maybeSingle();

    if (error || !clubData) throw new Error("Failed to fetch club data");

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

    const formattedClubInfo = {
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

    return { status: "joined", clubInfo: formattedClubInfo, role };
}