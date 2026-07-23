import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    const bucketAndFilePath = pathSegments.join("/");
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        return new NextResponse("Server configuration error", { status: 500 });
    }

    const targetUrl = `${supabaseUrl}/storage/v1/object/public/${bucketAndFilePath}`;
    
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
