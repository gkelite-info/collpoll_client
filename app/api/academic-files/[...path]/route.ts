import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

import { createClient as createAuthClient } from "@/app/utils/supabase/server";

const LAB_MANUALS_BUCKET = "faculty_lab_manuals";
const ALLOWED_ROLES = new Set(["Student", "Faculty", "Admin"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const authClient = await createAuthClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: appUser, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (userError || !appUser || !ALLOWED_ROLES.has(appUser.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { path } = await params;
  if (!path.length || path.some((segment) => !segment || segment === "." || segment === "..")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  const filePath = path.join("/");
  const { data, error } = await authClient.storage
    .from(LAB_MANUALS_BUCKET)
    .createSignedUrl(filePath, 60);

  if (error || !data) {
    return new NextResponse("File not found or unauthorized", { status: 404 });
  }

  try {
    const response = await fetch(data.signedUrl);
    if (!response.ok) {
      return new NextResponse("File not found", { status: response.status });
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Unable to load file", { status: 502 });
  }
}
