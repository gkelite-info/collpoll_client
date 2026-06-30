import { NextResponse } from "next/server";
import { runAttendanceFinalization } from "@/lib/helpers/devices/attendanceFinalizationHelper";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetDate, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing user context." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: dbUser } = await supabase
        .from("users")
        .select("role, collegeId")
        .eq("userId", userId)
        .eq("is_deleted", false)
        .maybeSingle();

    if (!dbUser || !["admin", "collegeadmin", "collegehr"].includes(dbUser.role.toLowerCase())) {
        return NextResponse.json({ error: "Forbidden: Only HR or Admin can re-finalize attendance" }, { status: 403 });
    }

    if (!targetDate) {
        return NextResponse.json({ error: "targetDate is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const result = await runAttendanceFinalization(targetDate, dbUser.collegeId);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
