import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const editableRequesterRoles = new Set(["CollegeHr"]);

type StatusPayload = {
  employeeLeaveRequestId?: number;
  status?: "approved" | "rejected";
  collegeAdminId?: number;
  userId?: number;
};

export async function PATCH(request: NextRequest) {
  try {
    const payload = (await request.json()) as StatusPayload;
    const { employeeLeaveRequestId, status, collegeAdminId, userId } = payload;
    
    const isSchool = request.cookies.get("isSchool")?.value === "true";
    const adminLabel = isSchool ? "School Admin" : "College Admin";

    if (!employeeLeaveRequestId || !status || !collegeAdminId || !userId) {
      return NextResponse.json(
        { error: "Missing required status update fields." },
        { status: 400 },
      );
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "Invalid leave status." },
        { status: 400 },
      );
    }

    const { data: collegeAdmin, error: collegeAdminError } =
      await supabaseAdmin
        .from("college_admin")
        .select("collegeAdminId, userId, collegeId")
        .eq("collegeAdminId", collegeAdminId)
        .eq("userId", userId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .maybeSingle();

    if (collegeAdminError) throw collegeAdminError;

    if (!collegeAdmin?.collegeId) {
      return NextResponse.json(
        { error: `${adminLabel} session was not found.` },
        { status: 403 },
      );
    }

    const { data: leaveRequest, error: leaveRequestError } =
      await supabaseAdmin
        .from("employee_leave_requests")
        .select("employeeLeaveRequestId, collegeId, role")
        .eq("employeeLeaveRequestId", employeeLeaveRequestId)
        .eq("collegeId", collegeAdmin.collegeId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .maybeSingle();

    if (leaveRequestError) throw leaveRequestError;

    if (!leaveRequest) {
      const institutionLabel = isSchool ? "school" : "college";
      return NextResponse.json(
        { error: `Leave request was not found for this ${institutionLabel}.` },
        { status: 404 },
      );
    }

    if (!editableRequesterRoles.has(leaveRequest.role as string)) {
      const hrLabel = isSchool ? "School HR" : "College HR";
      return NextResponse.json(
        { error: `Only ${hrLabel} leave requests can be edited.` },
        { status: 403 },
      );
    }

    const { data: tag, error: tagError } = await supabaseAdmin
      .from("employee_leave_request_tags")
      .select("employeeLeaveRequestTagId")
      .eq("employeeLeaveRequestId", employeeLeaveRequestId)
      .eq("taggedUserId", userId)
      .eq("taggedRole", "CollegeAdmin")
      .eq("is_deleted", false)
      .maybeSingle();

    if (tagError) throw tagError;

    if (!tag) {
      return NextResponse.json(
        { error: `This leave request is not tagged to this ${adminLabel}.` },
        { status: 403 },
      );
    }

    const { data, error: updateError } = await supabaseAdmin
      .from("employee_leave_requests")
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq("employeeLeaveRequestId", employeeLeaveRequestId)
      .select("employeeLeaveRequestId, status")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[college-admin-status]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update leave status.",
      },
      { status: 500 },
    );
  }
}
