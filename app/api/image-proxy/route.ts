import { createClient as createAuthClient } from "@/app/utils/supabase/server";

export async function GET(req: Request) {
  const authClient = await createAuthClient();
  const {
      data: { user },
      error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
      return new Response("Unauthorized. You must be logged in.", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response("Failed to fetch image", { status: 500 });
  }
}
