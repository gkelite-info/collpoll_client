import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { createClient as createAuthenticatedClient } from "@/lib/supabaseServer";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(request: NextRequest) {
  try {
    const authenticatedClient = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await authenticatedClient.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: accountant, error: accountantError } = await admin
      .from("users")
      .select("userId, collegeId, role")
      .eq("auth_id", user.id)
      .maybeSingle();
    if (accountantError) throw accountantError;
    if (!accountant || accountant.role !== "Accountant" || !accountant.collegeId) {
      return NextResponse.json({ error: "Accountant access is required." }, { status: 403 });
    }

    const userId = Number(request.nextUrl.searchParams.get("userId"));
    const month = Number(request.nextUrl.searchParams.get("month"));
    const year = Number(request.nextUrl.searchParams.get("year"));
    if (!Number.isSafeInteger(userId) || userId <= 0) return badRequest("A valid employee user ID is required.");
    if (!Number.isSafeInteger(month) || month < 1 || month > 12) return badRequest("A valid payroll month is required.");
    if (!Number.isSafeInteger(year) || year < 2000 || year > 2100) return badRequest("A valid payroll year is required.");

    const { data: employee, error: employeeError } = await admin
      .from("users")
      .select("userId")
      .eq("userId", userId)
      .eq("collegeId", accountant.collegeId)
      .maybeSingle();
    if (employeeError) throw employeeError;
    if (!employee) return NextResponse.json({ error: "Employee was not found in this college." }, { status: 404 });

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    const { data: attendance, error: attendanceError } = await admin
      .from("attendance_daily")
      .select(`
        attendanceDailyId, userId, attendanceDate, checkIn, checkOut, totalMinutes,
        status, lateByMinutes, earlyOutMinutes, isManual, markedReason,
        attendance_adjustments (
          adjustmentId, oldCheckIn, oldCheckOut, newCheckIn, newCheckOut,
          reason, adjustedBy, createdAt, updatedAt
        )
      `)
      .eq("userId", userId)
      .gte("attendanceDate", startDate)
      .lte("attendanceDate", endDate)
      .order("attendanceDate", { ascending: true });
    if (attendanceError) throw attendanceError;

    return NextResponse.json({ attendance: attendance ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load attendance.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
