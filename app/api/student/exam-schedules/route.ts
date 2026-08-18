import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

import { createClient as createAuthClient } from "@/app/utils/supabase/server";

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    const authClient = await createAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: appUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("userId, role")
      .eq("auth_id", user.id)
      .maybeSingle();
    if (userError || !appUser || appUser.role !== "Student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("collegeId, collegeEducationId")
      .eq("userId", appUser.userId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .maybeSingle();
    if (studentError || !student) {
      return NextResponse.json({ error: "Student context not found" }, { status: 404 });
    }

    const { data: schedules, error: scheduleError } = await supabaseAdmin
      .from("college_exam_schedules")
      .select("*")
      .eq("collegeId", student.collegeId)
      .eq("collegeEducationId", student.collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .order("createdAt", { ascending: false });
    if (scheduleError) throw new Error(scheduleError.message);

    const scheduleIds = (schedules || []).map((schedule) => schedule.collegeExamScheduleId);
    let sectionRows: Array<{ collegeExamScheduleId: number; collegeSectionsId: number }> = [];
    if (scheduleIds.length > 0) {
      const sectionResult = await supabaseAdmin
        .from("college_exam_schedule_sections")
        .select("collegeExamScheduleId, collegeSectionsId")
        .in("collegeExamScheduleId", scheduleIds);
      if (!sectionResult.error) sectionRows = sectionResult.data || [];
    }

    const data = (schedules || []).map((schedule) => ({
      ...schedule,
      college_exam_schedule_sections: sectionRows.filter(
        (row) => row.collegeExamScheduleId === schedule.collegeExamScheduleId,
      ),
    }));

    return NextResponse.json({ schedules: data }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load exam schedules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
