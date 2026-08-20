import { NextRequest, NextResponse } from "next/server";
import { createClient as createAuthClient } from "@/app/utils/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const authClient = await createAuthClient();
    const {
        data: { user },
        error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
        return new NextResponse("Unauthorized. You must be logged in to view this file.", { status: 401 });
    }

    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    const bucket = pathSegments[0];
    const filePath = pathSegments.slice(1).join("/");
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        return new NextResponse("Server configuration error", { status: 500 });
    }

    let targetUrl = "";

    if (
        bucket === "progress_chat_attachments" ||
        bucket === "leave_request_chats_attachments" ||
        bucket === "employee_leave_request_chat_attachments"
    ) {
        // Securely generate a temporary signed URL server-side to fetch the private file
        const { data, error } = await authClient.storage.from(bucket).createSignedUrl(filePath, 60);
        if (error || !data) {
            return new NextResponse("File not found or unauthorized", { status: 404 });
        }
        targetUrl = data.signedUrl;
    } else {
        // Fallback for older public buckets
        targetUrl = `${supabaseUrl}/storage/v1/object/public/${pathSegments.join("/")}`;
    }
    
    try {
        const response = await fetch(targetUrl);
        
        if (!response.ok) {
            return new NextResponse("File not found", { status: response.status });
        }

        return new NextResponse(response.body, {
            status: response.status,
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("File proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
