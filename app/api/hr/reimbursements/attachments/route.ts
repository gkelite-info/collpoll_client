import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAuthClient } from "@/app/utils/supabase/server";

const EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET = "employee-expense-attachments";

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

function normalizeExpenseAttachmentPath(filePath: string) {
  const trimmedPath = filePath.trim();
  const bucketSegment = `/${EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET}/`;

  try {
    const url = new URL(trimmedPath);
    const bucketIndex = url.pathname.indexOf(bucketSegment);
    if (bucketIndex >= 0) {
      return decodeURIComponent(url.pathname.slice(bucketIndex + bucketSegment.length));
    }
  } catch {
    // Most rows store a plain storage object key rather than a full URL.
  }

  const pathWithoutQuery = trimmedPath.split("?")[0].replace(/^\/+/, "");
  const prefixedBucket = `${EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET}/`;

  return decodeURIComponent(
    pathWithoutQuery.startsWith(prefixedBucket)
      ? pathWithoutQuery.slice(prefixedBucket.length)
      : pathWithoutQuery,
  );
}

async function authorizeCollegeUser(collegeId: number) {
  const authClient = await createAuthClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: appUser, error: userError } = await supabaseAdmin
    .from("users")
    .select("userId, collegeId")
    .eq("auth_id", user.id)
    .eq("collegeId", collegeId)
    .maybeSingle();

  if (userError || !appUser) {
    throw new Error("Forbidden");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attachmentId = Number(searchParams.get("attachmentId"));
    const collegeId = Number(searchParams.get("collegeId"));

    if (!attachmentId || !collegeId) {
      return NextResponse.json(
        { error: "attachmentId and collegeId are required" },
        { status: 400 },
      );
    }

    await authorizeCollegeUser(collegeId);

    const { data: attachment, error: attachmentError } = await supabaseAdmin
      .from("employee_expense_attachments")
      .select("expenseAttachmentId, employeeExpenseReportId, fileName, fileUrl, fileType")
      .eq("expenseAttachmentId", attachmentId)
      .maybeSingle();

    if (attachmentError) throw attachmentError;
    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const { data: report, error: reportError } = await supabaseAdmin
      .from("employee_expense_reports")
      .select("employeeExpenseReportId, collegeId")
      .eq("employeeExpenseReportId", attachment.employeeExpenseReportId)
      .eq("collegeId", collegeId)
      .is("deletedAt", null)
      .maybeSingle();

    if (reportError) throw reportError;
    if (!report) {
      return NextResponse.json({ error: "Attachment not found for this college" }, { status: 404 });
    }

    const storagePath = normalizeExpenseAttachmentPath(attachment.fileUrl);
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET)
      .download(storagePath);

    if (downloadError || !fileData) {
      return NextResponse.json(
        {
          error: downloadError?.message || "Object not found",
          storagePath,
        },
        { status: 404 },
      );
    }

    return new NextResponse(fileData, {
      headers: {
        "Content-Type": attachment.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to download attachment" },
      { status: 500 },
    );
  }
}
