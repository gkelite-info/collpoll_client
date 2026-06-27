import { supabase } from "@/lib/supabaseClient";
import {
  SaveAttendanceParams,
  BulkMarkParams,
  calcDerivedFields,
  todayDate
} from "./staffAttendanceTypes";

export async function saveAttendance(
  params: SaveAttendanceParams,
): Promise<void> {
  const today = params.date || todayDate();
  const now = new Date().toISOString();

  const checkInVal = params.checkIn || null;
  const checkOutVal = params.checkOut || null;

  // Fetch user's collegeId
  const { data: userData } = await supabase
    .from("users")
    .select("collegeId")
    .eq("userId", params.userId)
    .single();

  const collegeId = userData?.collegeId || 0;

  // Fetch policy directly via supabase client to avoid backend dependencies in the browser
  const { data: policyData } = await supabase
    .from("staff_attendance_policies")
    .select("graceMinutes")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .maybeSingle();

  const graceMinutes = policyData?.graceMinutes ?? 15;

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = days[new Date(today).getDay()];

  const { data: timingData } = await supabase
    .from("college_timings")
    .select("isOpen, openAt, closeAt")
    .eq("collegeId", collegeId)
    .eq("dayOfWeek", dayOfWeek)
    .eq("is_deleted", false)
    .maybeSingle();

  const shiftStartStr = timingData?.isOpen && timingData.openAt ? timingData.openAt : "09:00";
  const shiftEndStr = timingData?.isOpen && timingData.closeAt ? timingData.closeAt : "17:00";

  const { totalMinutes, lateByMinutes, earlyOutMinutes } = calcDerivedFields(
    checkInVal,
    checkOutVal,
    shiftStartStr,
    shiftEndStr,
    graceMinutes
  );

  let attendanceDailyId = params.attendanceDailyId;

  if (!attendanceDailyId) {
    const { data: existing } = await supabase
      .from("attendance_daily")
      .select("attendanceDailyId")
      .eq("userId", params.userId)
      .eq("attendanceDate", today)
      .maybeSingle();

    if (existing?.attendanceDailyId) {
      attendanceDailyId = existing.attendanceDailyId;
    }
  }

  if (!attendanceDailyId) {
    const insertStatus = params.status
      ? params.status.toUpperCase()
      : checkInVal
        ? lateByMinutes > 0
          ? "LATE"
          : "PRESENT"
        : "ABSENT";

    const { data: upserted, error: upsertError } = await supabase
      .from("attendance_daily")
      .upsert(
        {
          userId: params.userId,
          attendanceDate: today,
          checkIn: checkInVal,
          checkOut: checkOutVal,
          totalMinutes,
          status: insertStatus,
          lateByMinutes,
          earlyOutMinutes,
          classesTaken: params.classesTaken ?? 0,
          isManual: true,
          markedBy: params.collegeHrId,
          markedReason: params.reason || null,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "userId,attendanceDate" },
      )
      .select("attendanceDailyId")
      .single();

    if (upsertError) throw new Error(upsertError.message);

    const { error: adjError } = await supabase
      .from("attendance_adjustments")
      .insert({
        attendanceDailyId: upserted.attendanceDailyId,
        oldCheckIn: null,
        oldCheckOut: null,
        newCheckIn: checkInVal,
        newCheckOut: checkOutVal,
        reason: params.reason || null,
        adjustedBy: params.collegeHrId,
      });

    if (adjError) throw new Error(adjError.message);
    return;
  }

  const editPayload: Record<string, unknown> = {
    totalMinutes,
    lateByMinutes,
    earlyOutMinutes,
    classesTaken: params.classesTaken ?? 0,
    updatedAt: now,
  };

  if (params.status) editPayload.status = params.status.toUpperCase();
  if (checkInVal !== null) editPayload.checkIn = checkInVal;
  if (checkOutVal !== null) editPayload.checkOut = checkOutVal;

  const { error: updateError } = await supabase
    .from("attendance_daily")
    .update(editPayload)
    .eq("attendanceDailyId", attendanceDailyId);

  if (updateError) throw new Error(updateError.message);

  const { data: existingAdj, error: fetchAdjError } = await supabase
    .from("attendance_adjustments")
    .select("adjustmentId, newCheckIn, newCheckOut")
    .eq("attendanceDailyId", attendanceDailyId)
    .order("adjustmentId", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchAdjError) throw new Error(fetchAdjError.message);

  if (existingAdj) {
    const { error: adjUpdateError } = await supabase
      .from("attendance_adjustments")
      .update({
        oldCheckIn: existingAdj.newCheckIn ?? null,
        oldCheckOut: existingAdj.newCheckOut ?? null,
        newCheckIn: checkInVal,
        newCheckOut: checkOutVal,
        reason: params.reason || null,
        adjustedBy: params.collegeHrId,
      })
      .eq("adjustmentId", existingAdj.adjustmentId);

    if (adjUpdateError) throw new Error(adjUpdateError.message);
  } else {
    const { error: adjInsertError } = await supabase
      .from("attendance_adjustments")
      .insert({
        attendanceDailyId: attendanceDailyId,
        oldCheckIn: params.rawCheckIn ?? null,
        oldCheckOut: params.rawCheckOut ?? null,
        newCheckIn: checkInVal,
        newCheckOut: checkOutVal,
        reason: params.reason || null,
        adjustedBy: params.collegeHrId,
      });

    if (adjInsertError) throw new Error(adjInsertError.message);
  }
}

export async function saveStatusOnly(params: {
  attendanceDailyId: number;
  userId: number;
  status: string;
  collegeHrId: number;
  date?: string;
}): Promise<void> {
  const today = params.date || todayDate();
  const now = new Date().toISOString();

  if (params.attendanceDailyId !== null && params.attendanceDailyId > 0) {
    const { error } = await supabase
      .from("attendance_daily")
      .update({ status: params.status.toUpperCase(), updatedAt: now })
      .eq("attendanceDailyId", params.attendanceDailyId);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("attendance_daily").upsert(
      {
        userId: params.userId,
        attendanceDate: today,
        status: params.status.toUpperCase(),
        isManual: true,
        markedBy: params.collegeHrId,
        lateByMinutes: 0,
        earlyOutMinutes: 0,
        classesTaken: 0,
        createdAt: now,
        updatedAt: now,
      },
      { onConflict: "userId,attendanceDate" },
    );

    if (error) throw new Error(error.message);
  }
}

export async function bulkMarkAttendance(
  params: BulkMarkParams,
): Promise<void> {
  const today = todayDate();
  const now = new Date();
  const STATUS = params.status.toUpperCase();

  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`;
  const checkInTime =
    STATUS === "PRESENT" || STATUS === "LATE" ? currentTimeStr : null;

  const { data: hrData } = await supabase
    .from("users")
    .select("collegeId")
    .eq("userId", params.collegeHrId)
    .single();

  const collegeId = hrData?.collegeId || 0;

  const { data: policyData } = await supabase
    .from("staff_attendance_policies")
    .select("graceMinutes")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .maybeSingle();

  const graceMinutes = policyData?.graceMinutes ?? 15;

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = days[new Date(today).getDay()];

  const { data: timingData } = await supabase
    .from("college_timings")
    .select("isOpen, openAt, closeAt")
    .eq("collegeId", collegeId)
    .eq("dayOfWeek", dayOfWeek)
    .eq("is_deleted", false)
    .maybeSingle();

  const shiftStartStr = timingData?.isOpen && timingData.openAt ? timingData.openAt : "09:00";
  const shiftEndStr = timingData?.isOpen && timingData.closeAt ? timingData.closeAt : "17:00";

  const { lateByMinutes } = calcDerivedFields(
    checkInTime, 
    null,
    shiftStartStr,
    shiftEndStr,
    graceMinutes
  );

  const rows = params.userIds.map((userId) => ({
    userId,
    attendanceDate: today,
    status: STATUS,
    isManual: true,
    markedBy: params.collegeHrId,
    checkIn: checkInTime,
    checkOut: null,
    totalMinutes: null,
    lateByMinutes: STATUS === "LATE" ? lateByMinutes : 0,
    earlyOutMinutes: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }));

  const { error } = await supabase
    .from("attendance_daily")
    .upsert(rows, { onConflict: "userId,attendanceDate" });

  if (error) throw new Error(error.message);
}
