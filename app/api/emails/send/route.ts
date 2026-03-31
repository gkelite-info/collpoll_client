import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const resend = new Resend(process.env.RESEND_API_KEY!);

const ROLE_MAP: Record<
  string,
  { table: string; idCol: string; eduCol?: string; branchCol?: string }
> = {
  student: {
    table: "students",
    idCol: "studentId",
    eduCol: "collegeEducationId",
    branchCol: "collegeBranchId",
  },
  parent: { table: "parents", idCol: "parentId" },
  faculty: {
    table: "faculty",
    idCol: "facultyId",
    eduCol: "collegeEducationId",
    branchCol: "collegeBranchId",
  },
  admin: { table: "admins", idCol: "adminId", eduCol: "collegeEducationId" },
  finance_manager: {
    table: "finance_manager",
    idCol: "financeManagerId",
    eduCol: "collegeEducationId",
  },
  collegeadmin: { table: "college_admin", idCol: "collegeAdminId" },
  hr: { table: "college_hr", idCol: "collegeHrId" },
  placement: { table: "users", idCol: "userId" },
};

function formatBodyToHTML(text: string) {
  const lines = text.split("\n");
  let html = "";
  let inQuote = false;

  for (let line of lines) {
    if (line.startsWith(">")) {
      if (!inQuote) {
        html += `<blockquote style="margin: 0 0 0 0.8ex; border-left: 1px #ccc solid; padding-left: 1ex; color: #555;">`;
        inQuote = true;
      }
      html += line.substring(1).trim() + "<br />";
    } else {
      if (inQuote) {
        html += "</blockquote>";
        inQuote = false;
      }
      html += line + "<br />";
    }
  }

  if (inQuote) html += "</blockquote>";
  return html;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      collegeId,
      audience,
      manualEmail,
      filters,
      cc,
      subject,
      description,
      senderName,
      senderAddress,
    } = body;

    const formattedHtmlBody = formatBodyToHTML(description);

    let targetUsers: { userId: number; email: string }[] = [];
    let validUserIds: number[] | null = null;

    const hasAcademicFilters = !!(
      filters.edu ||
      filters.branch ||
      filters.year ||
      filters.sem ||
      filters.sec
    );

    if (audience) {
      const roleKey = audience.toLowerCase().replace(/\s/g, "");

      if (hasAcademicFilters) {
        if (roleKey === "student" || roleKey === "parent") {
          let studentQ = supabase
            .from("students")
            .select("userId, studentId")
            .eq("collegeId", collegeId);

          if (filters.edu)
            studentQ = studentQ.eq("collegeEducationId", filters.edu);
          if (filters.branch)
            studentQ = studentQ.eq("collegeBranchId", filters.branch);

          if (filters.year || filters.sem || filters.sec) {
            let histQ = supabase
              .from("student_academic_history")
              .select("studentId")
              .eq("isCurrent", true);
            if (filters.year)
              histQ = histQ.eq("collegeAcademicYearId", filters.year);
            if (filters.sem) histQ = histQ.eq("collegeSemesterId", filters.sem);
            if (filters.sec) histQ = histQ.eq("collegeSectionsId", filters.sec);

            const { data: histData } = await histQ;
            studentQ = studentQ.in(
              "studentId",
              (histData as any[])?.map((h) => h.studentId) || [],
            );
          }

          const { data: stuData } = await studentQ;

          if (roleKey === "student") {
            validUserIds = (stuData as any[])?.map((s) => s.userId) || [];
          } else if (roleKey === "parent") {
            const validStudentIds =
              (stuData as any[])?.map((s) => s.studentId) || [];
            if (validStudentIds.length > 0) {
              const { data: parentData } = await supabase
                .from("parents")
                .select("userId")
                .in("studentId", validStudentIds);
              validUserIds = (parentData as any[])?.map((p) => p.userId) || [];
            } else {
              validUserIds = [];
            }
          }
        } else if (ROLE_MAP[roleKey] && roleKey !== "placement") {
          const config = ROLE_MAP[roleKey];
          let roleQuery = supabase
            .from(config.table)
            .select(`userId, ${config.idCol}`)
            .eq("collegeId", collegeId);

          if (filters.edu && config.eduCol)
            roleQuery = roleQuery.eq(config.eduCol, filters.edu);
          if (filters.branch && config.branchCol)
            roleQuery = roleQuery.eq(config.branchCol, filters.branch);

          if (roleKey === "faculty" && (filters.year || filters.sec)) {
            let secQ = supabase
              .from("faculty_sections")
              .select("facultyId")
              .eq("isActive", true);
            if (filters.year)
              secQ = secQ.eq("collegeAcademicYearId", filters.year);
            if (filters.sec) secQ = secQ.eq("collegeSectionsId", filters.sec);
            const { data: secData } = await secQ;
            roleQuery = roleQuery.in(
              "facultyId",
              (secData as any[])?.map((f) => f.facultyId) || [],
            );
          }

          const { data: permitted } = await roleQuery;
          validUserIds = (permitted as any[])?.map((u) => u.userId) || [];
        }
      }

      let userQuery = supabase
        .from("users")
        .select("userId, email")
        .eq("collegeId", collegeId)
        .eq("role", audience);

      if (validUserIds !== null) {
        if (validUserIds.length === 0)
          return NextResponse.json({
            success: true,
            count: 0,
            message: "No matching users found.",
          });
        userQuery = userQuery.in("userId", validUserIds);
      }

      const { data: usersData } = await userQuery;
      if (usersData) targetUsers = [...targetUsers, ...(usersData as any[])];
    }

    if (manualEmail) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("userId, email")
        .eq("email", manualEmail)
        .single();
      targetUsers.push(
        existingUser
          ? (existingUser as any)
          : { userId: 0, email: manualEmail },
      );
    }

    const uniqueUsers = Array.from(
      new Map(targetUsers.map((item) => [item.email, item])).values(),
    );
    if (uniqueUsers.length === 0)
      return NextResponse.json(
        { error: "No recipients found." },
        { status: 404 },
      );

    const realUserIds = uniqueUsers
      .map((u) => u.userId)
      .filter((id) => id !== 0);
    let preferences: any[] = [];

    if (realUserIds.length > 0) {
      const { data: prefData, error: prefError } = await supabase
        .from("user_preferences")
        .select("userId, email_alerts")
        .in("userId", realUserIds);

      if (!prefError && prefData) {
        preferences = prefData;
      } else if (prefError) {
        console.error("Failed to fetch preferences:", prefError);
      }
    }

    const optedInUsers = uniqueUsers.filter((user) => {
      if (user.userId === 0) return true;

      const userPref = preferences.find((p) => p.userId === user.userId);
      return userPref ? userPref.email_alerts !== false : true;
    });

    if (optedInUsers.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "All recipients have opted out of email alerts.",
      });
    }

    const now = new Date().toISOString();
    const queueData = uniqueUsers
      .filter((u) => u.userId !== 0)
      .map((user) => ({
        userId: user.userId,
        email: user.email,
        subject,
        body: formattedHtmlBody,
        status: "pending",
        isRead: user.email === senderAddress ? true : false,
        createdAt: now,
        updatedAt: now,
        senderName: senderName || "System Notifications",
        senderAddress: senderAddress || "noreply@tektoncampus.edu",
      }));

    if (queueData.length > 0) {
      const { error: dbError } = await supabase
        .from("email_queue")
        .insert(queueData);
      if (dbError) throw dbError;
    }

    const ccArray = cc ? cc.split(",").map((e: string) => e.trim()) : [];

    const BATCH_SIZE = 100;

    const emailPayloads = optedInUsers.map((u) => ({
      from: "Tekton Campus <vamshivadla@gkeliteinfo.com>",
      to: [u.email],
      cc: ccArray,
      subject,
      html: formattedHtmlBody,
    }));

    const chunks: (typeof emailPayloads)[] = [];
    for (let i = 0; i < emailPayloads.length; i += BATCH_SIZE) {
      chunks.push(emailPayloads.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      const { error: emailError } = await resend.batch.send(chunk);
      if (emailError) throw emailError;
    }

    return NextResponse.json({ success: true, count: optedInUsers.length });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
