import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";


// @/middleware.ts
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const host = request.headers.get("host") || "";
    const parts = host.replace(':3000', '').split(".");

    let currentUrlCode = "GK";
    const isSubdomain = parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost';

    if (isSubdomain) {
        currentUrlCode = parts[0].toUpperCase();
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({ name, value, ...options });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: any) {
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
        if (profile) {
            const userCode = profile.collegeCode.toUpperCase();

            // LOGIC A: If user is GK but NOT on the main domain, send them to main domain
            if (userCode === "GK" && isSubdomain) {
                // Redirect to https://tektoncampus.com + their current path
                const mainDomain = `https://tektoncampus.com${request.nextUrl.pathname}${request.nextUrl.search}`;
                return NextResponse.redirect(mainDomain);
            }

            // LOGIC B: If user is NOT GK and tries to access a portal that isn't theirs
            if (userCode !== currentUrlCode) {
                await supabase.auth.signOut();
                response.cookies.delete("auth_tokens");

                const url = request.nextUrl.clone();
                url.pathname = '/login';
                url.searchParams.set('error', 'unauthorized_portal');
                return NextResponse.redirect(url);
            }
        }
    }

    // This is now safely added to the response that contains the Supabase cookies
    response.cookies.set("college_code", currentUrlCode, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};