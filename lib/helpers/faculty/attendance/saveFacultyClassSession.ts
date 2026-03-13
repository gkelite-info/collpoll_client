"use server";

import { saveFacultyClassSession } from "../facultyClassSessionsAPI";

export async function handleMissionClassStatus(
  classIdStr: string,
  facultyId: number,
  status: "Accepted" | "Cancel" | "Scheduled",
) {
  const eventId = parseInt(classIdStr.split("-")[0]);

  const timeNow = new Date().toTimeString().split(" ")[0];

  const payload = {
    calendarEventId: eventId,
    facultyId: facultyId,
    status: status,
    acceptedAt: timeNow,
  };

  const result = await saveFacultyClassSession(payload);

  if (!result.success) {
    return { success: false, error: "Database update failed" };
  }

  return { success: true };
}
