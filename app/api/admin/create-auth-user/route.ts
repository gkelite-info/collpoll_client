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

const supabaseSignup = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
);

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");

        const {
            data: { user },
            error: verifyError,
        } = await supabaseAdmin.auth.getUser(token);

        if (verifyError || !user) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        const body = await req.json();
        const { action } = body;

        if (action === "create") {
            const { email, password, fullName, role, emailRedirectTo } = body;

            if (!email || !password) {
                return NextResponse.json(
                    { error: "email and password are required" },
                    { status: 400 },
                );
            }

            console.info("[create-auth-user] sending signup confirmation", {
                email,
                role,
                emailRedirectTo,
            });

            const { data, error } = await supabaseSignup.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, role },
                    emailRedirectTo,
                },
            });

            if (error) {
                console.error("[create-auth-user] signup confirmation failed", {
                    email,
                    role,
                    message: error.message,
                    status: error.status,
                });

                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            if (!data.user?.id) {
                return NextResponse.json(
                    { error: "Signup succeeded but no auth user id was returned" },
                    { status: 500 },
                );
            }

            return NextResponse.json({ success: true, authId: data.user.id });
        }

        if (action === "delete") {
            const { authId } = body;

            if (!authId) {
                return NextResponse.json(
                    { error: "authId is required" },
                    { status: 400 },
                );
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(authId);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err: any) {
        console.error("[create-auth-user]", err);
        return NextResponse.json(
            { error: err?.message || "Internal server error" },
            { status: 500 },
        );
    }
}
