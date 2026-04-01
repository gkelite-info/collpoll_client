import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";


// @/middleware.ts
export async function middleware(request: NextRequest) {
    // 1. Create the initial response
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const host = request.headers.get("host") || "";
    const parts = host.replace(':3000', '').split(".");
    let collegeCode = "GK";

    if (parts.length >= 2) {
        if (parts[0] !== 'localhost' && parts[0] !== 'www' && parts.length > 2) {
            collegeCode = parts[0];
        } else if (parts.length === 2 && parts[0] !== 'localhost') {
            collegeCode = "GK";
        }
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Update both request and response WITHOUT overwriting the whole object
                    request.cookies.set({ name, value, ...options });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('collegeCode')
            .eq('auth_id', user.id)
            .single();

        // Use .toUpperCase() to avoid "mrecw" vs "MRECW" mismatches
        if (profile && profile.collegeCode.toUpperCase() !== collegeCode.toUpperCase()) {
            await supabase.auth.signOut();
            response.cookies.delete("auth_tokens");

            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('error', 'unauthorized_portal');
            return NextResponse.redirect(url);
        }
    }

    // This is now safely added to the response that contains the Supabase cookies
    response.cookies.set("college_code", collegeCode, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });

    return response;
}