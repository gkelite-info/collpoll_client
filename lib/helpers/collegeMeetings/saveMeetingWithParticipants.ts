import { supabase } from "@/lib/supabaseClient";

export async function saveMeetingWithParticipants(
  payload: {
    id?: number;
    collegeId: number;
    title: string;
    date: string;
    fromTime: string;
    toTime: string;
    type: string;
    agenda: string;
    organizer: string;
    meetingLink?: string;
    platform?: string;
    zoomId?: string;
    zoomPassword?: string;
    participants: { userId: number; role: string }[];
  },
  userId: number
) {
  const now = new Date().toISOString();

  let meetingId = payload.id;

  if (payload.id) {
    const { data, error } = await supabase
      .from("college_meetings")
      .update({
        title: payload.title,
        date: payload.date,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        type: payload.type,
        agenda: payload.agenda,
        description: payload.agenda ? payload.agenda.substring(0, 250) : "",
        organizer: payload.organizer,
        meetingLink: payload.meetingLink || "",
        platform: payload.platform || "googlemeet",
        zoomId: payload.zoomId || null,
        zoomPassword: payload.zoomPassword || null,
        updatedAt: now,
      })
      .eq("collegeMeetingId", payload.id)
      .select("collegeMeetingId")
      .single();

    if (error) {
      console.error("update meeting error:", error);
      return { success: false, error };
    }
  } else {
    const { data, error } = await supabase
      .from("college_meetings")
      .insert({
        collegeId: payload.collegeId,
        title: payload.title,
        date: payload.date,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        type: payload.type,
        agenda: payload.agenda,
        description: payload.agenda ? payload.agenda.substring(0, 250) : "",
        organizer: payload.organizer,
        meetingLink: payload.meetingLink || "",
        platform: payload.platform || "googlemeet",
        zoomId: payload.zoomId || null,
        zoomPassword: payload.zoomPassword || null,
        createdBy: userId,
        isActive: true,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      })
      .select("collegeMeetingId")
      .single();

    if (error) {
      console.error("insert meeting error:", error?.message, error?.details, error?.hint, error);
      return { success: false, error };
    }
    meetingId = data.collegeMeetingId;
  }

  if (meetingId) {
    // Clear old participants if updating
    if (payload.id) {
      await supabase
        .from("college_meeting_participants")
        .delete()
        .eq("collegeMeetingId", meetingId);
    }

    // Insert new participants
    if (payload.participants && payload.participants.length > 0) {
      const userIds = payload.participants.map((p) => p.userId);
      const { data: usersData } = await supabase
        .from("users")
        .select("userId, role")
        .in("userId", userIds);

      const roleMap = new Map<number, string>();
      if (usersData) {
        usersData.forEach((u: any) => roleMap.set(u.userId, u.role || "Faculty"));
      }

      const mapToValidRole = (rawRole: string) => {
        if (!rawRole) return "Faculty";
        
        const validRoles = ["Faculty", "Admin", "Student", "Parent", "Finance", "Placement"];
        if (validRoles.includes(rawRole)) return rawRole;
        
        const normalized = rawRole.replace(/[\s_-]/g, "").toLowerCase();
        
        if (normalized === "collegeadmin") return "Admin";
        if (normalized === "collegehr") return "Admin";
        if (normalized === "wellbeingexecutive" || normalized === "wellbeingmanager") return "Admin";
        
        if (normalized === "placementofficer" || normalized === "placementemployee") return "Placement";
        
        if (normalized === "financemanager" || normalized === "financeexecutive" || normalized === "accountant") return "Finance";
        
        // Fallback to 'Faculty' as it's a known valid enum value
        return "Faculty";
      };

      const participantRows = payload.participants.map((p) => {
        let rawRole = roleMap.get(p.userId) || "Faculty";
        let actualRole = mapToValidRole(rawRole);
        return {
          collegeMeetingId: meetingId,
          userId: p.userId,
          role: actualRole,
          notifiedInApp: false,
          notifiedEmail: false,
          createdAt: now,
          updatedAt: now,
        };
      });

      const { error: partError } = await supabase
        .from("college_meeting_participants")
        .insert(participantRows);

      if (partError) {
        console.error("insert participants error:", partError?.message, partError?.details, partError?.hint, partError);
      }
    }
  }

  return { success: true, collegeMeetingId: meetingId };
}
