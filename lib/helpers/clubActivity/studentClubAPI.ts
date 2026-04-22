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