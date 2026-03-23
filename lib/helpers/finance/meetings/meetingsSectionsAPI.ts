import { supabase } from "@/lib/supabaseClient";

export type FinanceMeetingSectionRow = {
  financeMeetingSectionsId: number;
  financeMeetingId: number;
  collegeEducationId: number;
  collegeBranchId: number | null;
  collegeAcademicYearId: number | null;
  collegeSectionsId: number | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function fetchFinanceMeetingSections(financeMeetingId: number) {
  const { data, error } = await supabase
    .from("finance_meetings_sections")
    .select(
      `
      financeMeetingSectionsId,
      financeMeetingId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSectionsId,
      createdBy,
      createdAt,
      updatedAt,
      deletedAt
    `,
    )
    .eq("financeMeetingId", financeMeetingId)
    .is("deletedAt", null)
    .order("financeMeetingSectionsId", { ascending: true });

  if (error) {
    console.error("fetchFinanceMeetingSections error:", error);
    throw error;
  }

  return data ?? [];
}

export async function saveFinanceMeetingSection(
  payload: {
    id?: number;
    financeMeetingId: number;
    collegeEducationId: number;
    collegeBranchId?: number | null;
    collegeAcademicYearId?: number | null;
    collegeSectionsId?: number | null;
  },
  financeManagerId: number,
) {
  const now = new Date().toISOString();
  if (payload.id) {
    const { data, error } = await supabase
      .from("finance_meetings_sections")
      .update({
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId ?? null,
        collegeAcademicYearId: payload.collegeAcademicYearId ?? null,
        collegeSectionsId: payload.collegeSectionsId ?? null,
        updatedAt: now,
      })
      .eq("financeMeetingSectionsId", payload.id)
      .select("financeMeetingSectionsId")
      .single();

    if (error) {
      console.error("updateFinanceMeetingSection error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      financeMeetingSectionsId: data.financeMeetingSectionsId,
    };
  } else {
    const { data, error } = await supabase
      .from("finance_meetings_sections")
      .insert({
        financeMeetingId: payload.financeMeetingId,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId ?? null,
        collegeAcademicYearId: payload.collegeAcademicYearId ?? null,
        collegeSectionsId: payload.collegeSectionsId ?? null,
        createdBy: financeManagerId,
        createdAt: now,
        updatedAt: now,
      })
      .select("financeMeetingSectionsId")
      .single();
    if (error) {
      console.error("insertFinanceMeetingSection error:", error);
      return { success: false, error };
    }
    return {
      success: true,
      financeMeetingSectionsId: data.financeMeetingSectionsId,
    };
  }
}

export async function deleteFinanceMeetingSection(
  financeMeetingSectionsId: number,
) {
  const { error } = await supabase
    .from("finance_meetings_sections")
    .update({
      deletedAt: new Date().toISOString(),
    })
    .eq("financeMeetingSectionsId", financeMeetingSectionsId);

  if (error) {
    console.error("deleteFinanceMeetingSection error:", error);
    return { success: false };
  }

  return { success: true };
}

export async function deleteAllFinanceMeetingSections(
  financeMeetingId: number,
) {
  const { error } = await supabase
    .from("finance_meetings_sections")
    .update({
      deletedAt: new Date().toISOString(),
    })
    .eq("financeMeetingId", financeMeetingId)
    .is("deletedAt", null);

  if (error) {
    console.error("deleteAllFinanceMeetingSections error:", error);
    return { success: false };
  }
  return { success: true };
}

export async function syncFinanceMeetingParticipantsAndEmails(
  financeMeetingId: number,
  collegeId: number,
  inAppNotification: boolean,
  emailNotification: boolean,
) {
  const now = new Date().toISOString();

  const { data: meeting } = await supabase
    .from("finance_meetings")
    .select("*")
    .eq("financeMeetingId", financeMeetingId)
    .single();

  if (!meeting) return { success: false };

  const { data: colMeeting } = await supabase
    .from("college_meetings")
    .select("collegeMeetingId")
    .match({
      meetingLink: meeting.meetingLink,
      date: meeting.date,
      fromTime: meeting.fromTime,
    })
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!colMeeting) return { success: false };

  let userIdsToSync: number[] = [];

  if (meeting.role === "Admin") {
    const { data: admins } = await supabase
      .from("admins")
      .select("userId")
      .eq("collegeId", collegeId);
    if (admins) userIdsToSync = admins.map((a) => a.userId);
  } else {
    const { data: sections } = await supabase
      .from("finance_meetings_sections")
      .select("collegeSectionsId")
      .eq("financeMeetingId", financeMeetingId);
    const sectionIds =
      sections?.map((s) => s.collegeSectionsId).filter(Boolean) || [];

    if (sectionIds.length > 0) {
      if (meeting.role === "Faculty") {
        const { data } = await supabase
          .from("faculty_sections")
          .select("faculty(userId)")
          .in("collegeSectionsId", sectionIds);
        if (data)
          userIdsToSync = data
            .map((f: any) => f.faculty?.userId)
            .filter(Boolean);
      } else if (meeting.role === "Student" || meeting.role === "Parent") {
        const { data } = await supabase
          .from("students")
          .select("userId, parentId")
          .in("collegeSectionsId", sectionIds);
        if (data) {
          userIdsToSync =
            meeting.role === "Student"
              ? data.map((s) => s.userId)
              : data.map((s) => s.parentId).filter(Boolean);
        }
      }
    }
  }

  userIdsToSync = [...new Set(userIdsToSync)];
  if (userIdsToSync.length === 0) return { success: true };

  const participantRows = userIdsToSync.map((uid) => ({
    collegeMeetingId: colMeeting.collegeMeetingId,
    userId: uid,
    role: meeting.role,
    notifiedInApp: inAppNotification,
    notifiedEmail: emailNotification,
    createdAt: now,
    updatedAt: now,
  }));

  await supabase.from("college_meeting_participants").insert(participantRows);

  if (emailNotification) {
    const { data: users } = await supabase
      .from("users")
      .select("userId, email, fullName")
      .in("userId", userIdsToSync);

    if (users) {
      const emailQueueRows = [];
      const resendEmailsToFire = [];

      const emailHtmlBody = `
                <h3>Meeting Invitation: ${meeting.title}</h3>
                <p>You have been invited to a meeting scheduled on <strong>${meeting.date}</strong> at <strong>${meeting.fromTime.slice(0, 5)}</strong>.</p>
                <p><strong>Agenda:</strong> ${meeting.description}</p>
                <p><strong>Join here:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>
            `;

      for (const user of users) {
        emailQueueRows.push({
          userId: user.userId,
          email: user.email,
          subject: `Invitation: ${meeting.title}`,
          body: emailHtmlBody,
          status: "sent",
          isRead: false,
          senderName: "Finance Department",
          createdAt: now,
          updatedAt: now,
        });

        resendEmailsToFire.push(user.email);
      }

      if (emailQueueRows.length > 0) {
        await supabase.from("email_queue").insert(emailQueueRows);
      }

      if (resendEmailsToFire.length > 0) {
        try {
          await fetch("/api/meetings/send-invites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: resendEmailsToFire,
              subject: `Invitation: ${meeting.title}`,
              html: emailHtmlBody,
            }),
          });
        } catch (e) {
          console.error("Failed to trigger Resend:", e);
        }
      }
    }
  }

  return { success: true };
}
