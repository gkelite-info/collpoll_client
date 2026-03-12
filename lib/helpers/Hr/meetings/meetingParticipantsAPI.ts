import { supabase } from "@/lib/supabaseClient";

export type HrMeetingParticipantRow = {
    hrMeetingParticipantId: number;
    hrMeetingId: number;
    userId: number;
    role: "Faculty" | "Admin" | "Finance" | "Placement";
    notifiedInApp: boolean;
    notifiedEmail: boolean;
    createdAt: string;
    updatedAt: string;
};


export async function fetchMeetingParticipants(meetingId: number) {

  const { data, error } = await supabase
    .from("hr_meeting_participants")
    .select(`
      userId,
      role,
      users (
        fullName
      )
    `)
    .eq("hrMeetingId", meetingId);

  if (error) throw error;

  return (data ?? []).map((p: any) => {

    // const faculty = p.users?.faculty;

    // const facultyData =
    //   Array.isArray(faculty) ? faculty[0] : faculty;

    // const section =
    //   facultyData?.faculty_sections
    //     ? Array.isArray(facultyData.faculty_sections)
    //       ? facultyData.faculty_sections[0]
    //       : facultyData.faculty_sections
    //     : null;

    return {
      id: p.userId,
      name: p.users?.fullName ?? "Unknown",
      role: p.role,

      // branch:
      //   p.role === "Faculty"
      //     ? facultyData?.college_branch?.collegeBranchCode ?? ""
      //     : "",

      // year:
      //   p.role === "Faculty"
      //     ? section?.college_academic_year?.collegeAcademicYear ?? ""
      //     : "",

      // section:
      //   p.role === "Faculty"
      //     ? section?.college_sections?.collegeSections ?? ""
      //     : ""

      branch: "",
      year: "",
      section: ""
    };
  });
}


export async function addMeetingParticipants(
    hrMeetingId: number,
    participants: {
        userId: number;
        role: "Faculty" | "Admin" | "Finance" | "Placement";
        notifiedInApp: boolean;
        notifiedEmail: boolean;
    }[],
) {
    if (!participants.length) {
        return { success: true };
    }

    const rows = participants.map((p) => ({
        hrMeetingId,
        userId: p.userId,
        role: p.role,
        notifiedInApp: p.notifiedInApp,
        notifiedEmail: p.notifiedEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    const { error } = await supabase
        .from("hr_meeting_participants")
        .insert(rows);

    if (error) {
        console.error("addMeetingParticipants error:", error);
        return { success: false, error };
    }

    return { success: true };
}


export async function removeMeetingParticipant(
    hrMeetingId: number,
    userId: number,
) {
    const { error } = await supabase
        .from("hr_meeting_participants")
        .delete()
        .eq("hrMeetingId", hrMeetingId)
        .eq("userId", userId);

    if (error) {
        console.error("removeMeetingParticipant error:", error);
        return { success: false };
    }

    return { success: true };
}