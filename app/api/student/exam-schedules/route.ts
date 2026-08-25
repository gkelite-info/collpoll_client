import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

import { createClient as createAuthClient } from "@/app/utils/supabase/server";

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const academicYear = searchParams.get("academicYear");
    const isSchool = searchParams.get("isSchool") === "true";
    const branchId = searchParams.get("branchId") ? parseInt(searchParams.get("branchId")!, 10) : null;
    const semesterId = searchParams.get("semesterId") ? parseInt(searchParams.get("semesterId")!, 10) : null;
    const sectionId = searchParams.get("sectionId") ? parseInt(searchParams.get("sectionId")!, 10) : null;

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
    let subjectRows: Array<{ collegeExamScheduleId: number; examDate: string }> = [];
    
    if (scheduleIds.length > 0) {
      const sectionResult = await supabaseAdmin
        .from("college_exam_schedule_sections")
        .select("collegeExamScheduleId, collegeSectionsId")
        .in("collegeExamScheduleId", scheduleIds);
      if (!sectionResult.error) sectionRows = sectionResult.data || [];
      
      const subjectResult = await supabaseAdmin
        .from("college_exam_schedule_subjects")
        .select("collegeExamScheduleId, examDate")
        .in("collegeExamScheduleId", scheduleIds)
        .is("deletedAt", null);
      if (!subjectResult.error) subjectRows = subjectResult.data || [];
    }

    const normalizeAcademicYear = (value: string | null | undefined) =>
      (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

    const allData = (schedules || []).map((schedule) => ({
      ...schedule,
      college_exam_schedule_sections: sectionRows.filter(
        (row) => row.collegeExamScheduleId === schedule.collegeExamScheduleId,
      ),
      college_exam_schedule_subjects: subjectRows.filter(
        (row) => row.collegeExamScheduleId === schedule.collegeExamScheduleId,
      ),
    }));

    const filtered = allData.filter((s) => {
      if (
        s.academicYear && academicYear &&
        normalizeAcademicYear(s.academicYear) !== normalizeAcademicYear(academicYear)
      ) return false;
      if (isSchool) return true;
      const scheduleSectionIds = s.college_exam_schedule_sections?.map(
        (item: { collegeSectionsId: number }) => item.collegeSectionsId,
      ) || (s.collegeSectionsId ? [s.collegeSectionsId] : []);
      if (
        scheduleSectionIds.length > 0 &&
        (sectionId === null || !scheduleSectionIds.includes(sectionId))
      ) return false;
      if (s.collegeBranchId && branchId && s.collegeBranchId !== branchId) return false;
      if (s.collegeSemesterId && semesterId && s.collegeSemesterId !== semesterId) return false;
      return true;
    });

    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({ schedules: paginatedData, totalCount }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load exam schedules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
