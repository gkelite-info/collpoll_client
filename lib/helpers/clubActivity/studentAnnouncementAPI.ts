import { supabase } from "@/lib/supabaseClient";

export async function fetchAnnouncements(clubId: number, cursor?: string, limit: number = 20, signal?: AbortSignal) {
    let query = supabase
        .from("club_announcements")
        .select(`
            *,
            authorStudent:students!club_announcements_authorStudentId_fkey(users(fullName, user_profile(profileUrl))),
            authorFaculty:faculty!club_announcements_authorFacultyId_fkey(users(fullName, user_profile(profileUrl)))
        `)
        .eq("clubId", clubId)
        .eq("is_deleted", false)
        .order("createdAt", { ascending: false })
        .limit(limit);

    if (cursor) query = query.lt("createdAt", cursor);

    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// export async function postStudentAnnouncement(clubId: number, collegeId: number, studentId: number, role: string, message: string) {
//     const now = new Date().toISOString();

//     const { data: insertData, error: insertError } = await supabase
//         .from("club_announcements")
//         .insert({
//             clubId,
//             collegeId,
//             message,
//             authorStudentId: studentId,
//             authorFacultyId: null,
//             authorRole: role,
//             createdAt: now,
//             updatedAt: now
//         })
//         .select("announcementId")
//         .single();

//     if (insertError) throw insertError;

//     const { data, error } = await supabase
//         .from("club_announcements")
//         .select(`
//             *,
//             authorStudent:students!club_announcements_authorStudentId_fkey(users(fullName, user_profile(profileUrl))),
//             authorFaculty:faculty!club_announcements_authorFacultyId_fkey(users(fullName, user_profile(profileUrl)))
//         `)
//         .eq("announcementId", insertData.announcementId)
//         .single();

//     if (error) throw error;
//     return data;
// }

export async function postStudentAnnouncement(clubId: number, collegeId: number, studentId: number, role: string, message: string) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("club_announcements")
        .insert({
            clubId,
            collegeId,
            message,
            authorStudentId: studentId,
            authorFacultyId: null,
            authorRole: role,
            createdAt: now,
            updatedAt: now
        })
        .select(`
            *,
            authorStudent:students!club_announcements_authorStudentId_fkey(users(fullName, user_profile(profileUrl))),
            authorFaculty:faculty!club_announcements_authorFacultyId_fkey(users(fullName, user_profile(profileUrl)))
        `)
        .single();

    if (error) {
        console.error("Post Announcement Error:", error);
        throw error;
    }
    return data;
}

export async function updateAnnouncement(announcementId: number, newMessage: string) {
    const { error } = await supabase
        .from("club_announcements")
        .update({ message: newMessage, updatedAt: new Date().toISOString() })
        .eq("announcementId", announcementId);
    if (error) throw error;
}

export async function deleteAnnouncement(announcementId: number) {
    const { error } = await supabase
        .from("club_announcements")
        .update({ is_deleted: true, deletedAt: new Date().toISOString() })
        .eq("announcementId", announcementId);
    if (error) throw error;
}