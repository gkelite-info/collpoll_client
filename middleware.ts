// import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import { NextRequest, NextResponse } from "next/server";


// // @/middleware.ts
// export async function middleware(request: NextRequest) {
//     let response = NextResponse.next({
//         request: { headers: request.headers },
//     });

//     const host = request.headers.get("host") || "";
//     const cleanHost = host.replace(':3000', '');
//     const parts = cleanHost.split(".");

//     let currentUrlCode = "GK";

//     const isLocalhost = host.includes('localhost');
//     const isSubdomain = isLocalhost
//         ? (parts.length >= 2 && parts[0] !== 'localhost')
//         : (parts.length > 2 && parts[0] !== 'www');

//     if (isSubdomain) {
//         currentUrlCode = parts[0].toUpperCase();
//     }

//     console.log("Middleware identified portal as:", currentUrlCode);

//     const supabase = createServerClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//         {
//             cookies: {
//                 get(name: string) {
//                     return request.cookies.get(name)?.value;
//                 },
//                 set(name: string, value: string, options: any) {
//                     request.cookies.set({ name, value, ...options });
//                     response.cookies.set({ name, value, ...options });
//                 },
//                 remove(name: string, options: any) {
//                     request.cookies.set({ name, value: '', ...options });
//                     response.cookies.set({ name, value: '', ...options });
//                 },
//             },
//         }
//     );

//     const { data: { user } } = await supabase.auth.getUser();

//     if (user) {
//         const { data: profile } = await supabase
//             .from('users')
//             .select('collegeCode')
//             .eq('auth_id', user.id)
//             .single();

//         // Use .toUpperCase() to avoid "mrecw" vs "MRECW" mismatches
//         if (profile) {
//             const userCode = (profile?.collegeCode || "").toUpperCase();

//             if (!userCode) {
//                 await supabase.auth.signOut();
//                 const url = request.nextUrl.clone();
//                 url.pathname = '/login';
//                 return NextResponse.redirect(url);
//             }

//             if (userCode === "GK" && isSubdomain) {
//                 // Redirect to https://tektoncampus.com + their current path
//                 const mainDomain = `https://tektoncampus.com${request.nextUrl.pathname}${request.nextUrl.search}`;
//                 return NextResponse.redirect(mainDomain);
//             }

//             // if (userCode !== currentUrlCode) {
//             //     console.log("MIDDLEWARE REJECTED:", userCode, "vs", currentUrlCode);
//             //     await supabase.auth.signOut();
//             //     response.cookies.delete("auth_tokens");

//             //     const url = request.nextUrl.clone();
//             //     url.pathname = '/login';
//             //     url.searchParams.set('error', 'unauthorized_portal');
//             //     return NextResponse.redirect(url);
//             // }
//         }
//     }

//     // This is now safely added to the response that contains the Supabase cookies
//     response.cookies.set("college_code", currentUrlCode, {
//         httpOnly: true,
//         sameSite: "lax",
//         path: "/",
//     });

//     return response;
// }

// export const config = {
//     matcher: [
//         '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//     ],
// };


import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const host = request.headers.get("host") || "";
    const parts = host.replace(':3000', '').split(".");

    // --- 1. Robust Subdomain Detection ---
    let currentUrlCode = "GK";
    const isLocalhost = host.includes('localhost');

    // On localhost: mrecw.localhost -> parts is ["mrecw", "localhost"] (length 2)
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

        console.log(`DEBUG: User belongs to ID ${profile?.collegeId} with Code (${userCode})`);

        if (profile) {
            if (userCode !== urlCode && request.nextUrl.pathname !== '/login') {
                // Bypass for localhost "GK" issues
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