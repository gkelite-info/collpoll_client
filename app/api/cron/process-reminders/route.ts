import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const now = new Date().toISOString();

    const { data: pendingJobs, error: jobsError } = await supabase
      .from("meeting_remainder_jobs")
      .select("*")
      .eq("status", "pending")
      .lte("runAt", now);

    if (jobsError) throw jobsError;
    if (!pendingJobs || pendingJobs.length === 0) {
      return NextResponse.json(
        { message: "No pending jobs to process" },
        { status: 200 },
      );
    }

    console.log(`Found ${pendingJobs.length} jobs to process.`);

    for (const job of pendingJobs) {
      const { data: meeting } = await supabase
        .from("college_meetings")
        .select("title, description, date, fromTime, meetingLink")
        .eq("collegeMeetingId", job.collegeMeetingId)
        .single();

      if (!meeting) {
        await supabase
          .from("meeting_remainder_jobs")
          .update({ status: "completed" })
          .eq("remainderJobId", job.remainderJobId);
        continue;
      }

      const { data: participants } = await supabase
        .from("college_meeting_participants")
        .select("userId, notifiedInApp, notifiedEmail, users(email)")
        .eq("collegeMeetingId", job.collegeMeetingId)
        .is("deletedAt", null);

      if (!participants || participants.length === 0) {
        await supabase
          .from("meeting_remainder_jobs")
          .update({ status: "completed" })
          .eq("remainderJobId", job.remainderJobId);
        continue;
      }

      const notificationsToInsert = [];
      const emailsToInsert = [];

      for (const participant of participants) {
        const userEmail = Array.isArray(participant.users)
          ? (participant.users[0] as any)?.email
          : (participant.users as any)?.email;

        if (participant.notifiedInApp) {
          notificationsToInsert.push({
            userId: participant.userId,
            title: `Meeting Reminder: ${meeting.title}`,
            message: `Reminder: You have an upcoming meeting starting at ${meeting.fromTime.slice(0, 5)}.\n\nLink: ${meeting.meetingLink}`,
            type: "Meeting",
            referenceId: job.collegeMeetingId,
            isRead: false,
            createdAt: now,
            updatedAt: now,
          });
        }

        if (participant.notifiedEmail && userEmail) {
          emailsToInsert.push({
            userId: participant.userId,
            email: userEmail,
            subject: `Reminder: ${meeting.title}`,
            body: `
                            <h3>Meeting Reminder</h3>
                            <p>You have an upcoming meeting scheduled today at <strong>${meeting.fromTime.slice(0, 5)}</strong>.</p>
                            <p><strong>Agenda:</strong> ${meeting.description}</p>
                            <p><strong>Join here:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>
                        `,
            status: "pending",
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      if (notificationsToInsert.length > 0) {
        const { error: notifErr } = await supabase
          .from("notifications")
          .insert(notificationsToInsert);
        if (notifErr) console.error("Notification Insert Error:", notifErr);
      }

      if (emailsToInsert.length > 0) {
        const { error: emailErr } = await supabase
          .from("email_queue")
          .insert(emailsToInsert);
        if (emailErr) console.error("Email Insert Error:", emailErr);
      }

      await supabase
        .from("meeting_remainder_jobs")
        .update({ status: "completed", updatedAt: now })
        .eq("remainderJobId", job.remainderJobId);
    }

    return NextResponse.json({
      success: true,
      processedCount: pendingJobs.length,
    });
  } catch (error: any) {
    console.error("Cron processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
