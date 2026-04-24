import { supabase } from "@/lib/supabaseClient";
// You can re-use fetchAnnouncements, updateAnnouncement, and deleteAnnouncement from the student API here, 
// or duplicate them if you want strict separation. Here is the specific Faculty Post function:

export async function postFacultyAnnouncement(clubId: number, collegeId: number, facultyId: number, role: string, message: string) {
    const { data, error } = await supabase
        .from("club_announcements")
        .insert({
            clubId,
            collegeId,
            message,
            authorStudentId: null,
            authorFacultyId: facultyId,
            authorRole: role
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}