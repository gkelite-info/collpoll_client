import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const host = request.headers.get("host") || "";
    const parts = host.replace(':3000', '').split(".");

    let currentUrlCode = "GK";
    const isLocalhost = host.includes('localhost');

    if (isLocalhost && parts.length >= 2 && parts[0] !== 'localhost') {
        currentUrlCode = parts[0].toUpperCase();
    } else if (!isLocalhost && parts.length > 2 && parts[0] !== 'www') {
        currentUrlCode = parts[0].toUpperCase();
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return request.cookies.get(name)?.value },
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
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select(`
                collegeId,
                colleges (
                    collegeCode
                )
            `)
            .eq('auth_id', user.id)
            .single();

        const rawCollegeCode = (profile as any)?.colleges?.collegeCode;

        const userCode = (rawCollegeCode || "").trim().toUpperCase();
        const urlCode = (currentUrlCode || "").trim().toUpperCase();

        if (profile) {
            if (userCode !== urlCode && request.nextUrl.pathname !== '/login') {
                if (urlCode === "GK") {
                    return response;
                }

                console.error(`MATCH FAIL: DB(${userCode}) vs URL(${urlCode})`);
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                url.searchParams.set('error', 'portal_mismatch');
                url.searchParams.set('debug_user', userCode || "CODE_NOT_FOUND_IN_JOIN");
                url.searchParams.set('debug_url', urlCode);
                return NextResponse.redirect(url);
            }
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};