import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import {
    isAuthOnlyRoute,
    isExemptedRoute,
    isProtectedRoute,
    isAuthProtectedRoute,
    needsRolePortalProtection,
    getLandingPageForRole,
    normalizeRole,
    isValidRole,
    LEGACY_STUDENT_ROUTES,
    isPublicRoute
} from "@/lib/constants/routes";

type MiddlewareUserProfile = {
    userId?: number;
    collegeId?: number;
    role?: string | null;
    colleges?: { collegeCode?: string | null } | null;
};

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const pathname = request.nextUrl.pathname;

    if (isExemptedRoute(pathname)) {
        return response;
    }

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
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();


    // if (!user) {
    //     const isLegacyStudentRoute = LEGACY_STUDENT_ROUTES.some(
    //         route => pathname === route || pathname.startsWith(route + '?')
    //     );

    //     if (isProtectedRoute(pathname) || isAuthProtectedRoute(pathname) || isLegacyStudentRoute) {
    //         const url = request.nextUrl.clone();
    //         url.pathname = "/login";
    //         url.searchParams.set("from", pathname);
    //         return NextResponse.redirect(url);
    //     }
    //     return response;
    // }

    if (!user) {
        // [CHANGED] If the route is NOT a public route (/login, /signup), kick them to login.
        // Because exempted routes (/api, /_next) are caught earlier, this safely catches random URLs like /ramu.
        if (!isPublicRoute(pathname)) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("from", pathname);
            return NextResponse.redirect(url);
        }
        
        // If it IS a public route, let them through
        return response;
    }

    const isLegacyStudentRoute = LEGACY_STUDENT_ROUTES.some(
        route => pathname === route || pathname.startsWith(route + '?')
    );

    if (isLegacyStudentRoute) {
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('auth_id', user.id)
            .single();

        const profileData = profile as MiddlewareUserProfile | null;

        if (!profileData || profileError || profileData.role !== 'Student') {
            if (profileData?.role) {
                const normalizedRole = normalizeRole(profileData.role);
                if (normalizedRole && isValidRole(normalizedRole)) {
                    const url = request.nextUrl.clone();
                    url.pathname = getLandingPageForRole(normalizedRole);
                    return NextResponse.redirect(url);
                }
            }
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return response;
    }

    if (isAuthOnlyRoute(pathname) || needsRolePortalProtection(pathname)) {
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select(`
                userId,
                collegeId,
                role,
                colleges (
                    collegeCode
                )
            `)
            .eq('auth_id', user.id)
            .single();

        if (!profile || profileError) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        const profileData = profile as MiddlewareUserProfile;
        const rawCollegeCode = profileData.colleges?.collegeCode;
        const userRole = profileData.role;

        const userCode = (rawCollegeCode || "").trim().toUpperCase();
        const urlCode = (currentUrlCode || "").trim().toUpperCase();

        if (userCode !== urlCode && pathname !== '/login') {
            if (urlCode !== "GK") {
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                url.searchParams.set('error', 'portal_mismatch');
                return NextResponse.redirect(url);
            }
        }

        if (isAuthOnlyRoute(pathname)) {
            if (userRole) {
                const normalizedRole = normalizeRole(userRole ?? null);
                if (normalizedRole && isValidRole(normalizedRole)) {
                    const landingPage = getLandingPageForRole(normalizedRole);
                    const url = request.nextUrl.clone();
                    url.pathname = landingPage;
                    url.search = '';
                    return NextResponse.redirect(url);
                }
            }
            return response;
        }

        if (needsRolePortalProtection(pathname)) {
            if (!userRole) {
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                return NextResponse.redirect(url);
            }

            const normalizedRole = normalizeRole(userRole ?? null);
            if (!normalizedRole || !isValidRole(normalizedRole)) {
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                return NextResponse.redirect(url);
            }

            const userLandingPage = getLandingPageForRole(normalizedRole);

            if (normalizedRole === "WellbeingExecutive" || normalizedRole === "WellbeingManager") {
                const wellbeingRoleTypes =
                    normalizedRole === "WellbeingManager"
                        ? "wellbeingManager"
                        : "wellbeingExecutive";

                const { data: wellbeingRows, error: wellbeingError } = await supabase
                    .from("well_beings")
                    .select("wellBeingId")
                    .eq("userId", profileData.userId)
                    .eq("collegeId", profileData.collegeId)
                    .eq("roleType", wellbeingRoleTypes)
                    .eq("isActive", true)
                    .eq("is_deleted", false)
                    .is("deletedAt", null)
                    .limit(1);

                if (wellbeingError || !wellbeingRows?.length) {
                    const url = request.nextUrl.clone();
                    url.pathname = "/construction";
                    url.searchParams.set("error", "wellbeing_access_inactive");
                    return NextResponse.redirect(url);
                }
            }

            if (!pathname.startsWith(userLandingPage)) {
                const url = request.nextUrl.clone();
                url.pathname = userLandingPage;
                url.search = '';
                return NextResponse.redirect(url);
            }
            return response;
        }
        return response;
    } else if (isAuthProtectedRoute(pathname)) {

        if (pathname === '/settings' || pathname.match(/^\/settings(\?|$)/)) {
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('auth_id', user.id)
                .single();

            if (profile && !profileError) {
                const profileData = profile as MiddlewareUserProfile;
                const userRole = profileData.role;
                const normalizedRole = normalizeRole(userRole ?? null);

                if (normalizedRole && isValidRole(normalizedRole)) {
                    const landingPage = getLandingPageForRole(normalizedRole);
                    const url = request.nextUrl.clone();
                    url.pathname = `${landingPage}/settings`;
                    return NextResponse.redirect(url);
                }
            }
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }


        return response;
    } else if (isProtectedRoute(pathname)) {
        return response;
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
