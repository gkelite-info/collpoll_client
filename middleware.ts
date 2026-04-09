import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import {
    isAuthOnlyRoute,
    isExemptedRoute,
    isProtectedRoute,
    isAuthProtectedRoute,
    needsRolePortalProtection,
    ROLE_PORTALS,
    getLandingPageForRole,
    normalizeRole,
    isValidRole,
    LEGACY_STUDENT_ROUTES,
} from "@/lib/constants/routes";

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


    if (!user) {
        const isLegacyStudentRoute = LEGACY_STUDENT_ROUTES.some(
            route => pathname === route || pathname.startsWith(route + '?')
        );

        if (isProtectedRoute(pathname) || isAuthProtectedRoute(pathname) || isLegacyStudentRoute) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("from", pathname);
            return NextResponse.redirect(url);
        }
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

        if (!profile || profileError || (profile as any)?.role !== 'Student') {
            if (profile && (profile as any)?.role) {
                const normalizedRole = normalizeRole((profile as any)?.role);
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

        const rawCollegeCode = (profile as any)?.colleges?.collegeCode;
        const userRole = (profile as any)?.role;

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
                const normalizedRole = normalizeRole(userRole);
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

            const normalizedRole = normalizeRole(userRole);
            if (!normalizedRole || !isValidRole(normalizedRole)) {
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                return NextResponse.redirect(url);
            }

            const userLandingPage = getLandingPageForRole(normalizedRole);

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
                const userRole = (profile as any)?.role;
                const normalizedRole = normalizeRole(userRole);

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
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};