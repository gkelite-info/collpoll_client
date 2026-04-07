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
        request: { headers: request.headers },
    });

    const pathname = request.nextUrl.pathname;
    
    // =========================================================
    // FAST PATH: SKIP EXEMPTED ROUTES (API, static files, etc.)
    // =========================================================
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

    // =========================================================
    // CHECK UNAUTHENTICATED ACCESS
    // =========================================================
    if (!user) {
        // User is NOT logged in
        
        // Check if trying to access legacy student routes (fast path for student routes)
        const isLegacyStudentRoute = LEGACY_STUDENT_ROUTES.some(
            route => pathname === route || pathname.startsWith(route + '?')
        );
        
        if (isProtectedRoute(pathname) || isAuthProtectedRoute(pathname) || isLegacyStudentRoute) {
            // Trying to access protected route without login -> redirect to login
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("from", pathname);
            return NextResponse.redirect(url);
        }
        // Allow access to public routes
        return response;
    }

    // =========================================================
    // USER IS LOGGED IN
    // =========================================================

    // =====================================================
    // HANDLE LEGACY STUDENT ROUTES - ROLE-BASED PROTECTION
    // =====================================================
    // Routes like /attendance, /academics, /calendar etc must be student-only
    const isLegacyStudentRoute = LEGACY_STUDENT_ROUTES.some(
        route => pathname === route || pathname.startsWith(route + '?')
    );

    if (isLegacyStudentRoute) {
        // Fetch user role to verify access
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('auth_id', user.id)
            .single();

        if (!profile || profileError || (profile as any)?.role !== 'Student') {
            // Not a student - reject access, redirect to their landing page
            if (profile && (profile as any)?.role) {
                const normalizedRole = normalizeRole((profile as any)?.role);
                if (normalizedRole && isValidRole(normalizedRole)) {
                    const url = request.nextUrl.clone();
                    url.pathname = getLandingPageForRole(normalizedRole);
                    return NextResponse.redirect(url);
                }
            }
            // No role or error - redirect to login
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        // User is a student - allow access
        return response;
    }

    // =========================================================
    // OPTIMIZATION: Only fetch profile if accessing role portals or auth-only routes
    // =========================================================
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
            // Profile doesn't exist or error occurred
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        const rawCollegeCode = (profile as any)?.colleges?.collegeCode;
        const userRole = (profile as any)?.role;

        const userCode = (rawCollegeCode || "").trim().toUpperCase();
        const urlCode = (currentUrlCode || "").trim().toUpperCase();

        // =====================================================
        // COLLEGE CODE VALIDATION (existing functionality)
        // =====================================================
        if (userCode !== urlCode && pathname !== '/login') {
            if (urlCode !== "GK") {
                // Portal code mismatch - redirect to login with error
                console.error(`MATCH FAIL: DB(${userCode}) vs URL(${urlCode})`);
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                url.searchParams.set('error', 'portal_mismatch');
                return NextResponse.redirect(url);
            }
        }

        // =====================================================
        // HANDLE AUTH-ONLY ROUTES (login, forgot-password, etc.)
        // =====================================================
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
            // If role is invalid, let them proceed (they'll get error on page)
            return response;
        }

        // =====================================================
        // HANDLE ROLE PORTAL ACCESS (only for role portals)
        // =====================================================
        if (needsRolePortalProtection(pathname)) {
            if (!userRole) {
                // No role assigned - redirect to login
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                return NextResponse.redirect(url);
            }

            const normalizedRole = normalizeRole(userRole);
            if (!normalizedRole || !isValidRole(normalizedRole)) {
                // Invalid role - redirect to login
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                return NextResponse.redirect(url);
            }

            const userLandingPage = getLandingPageForRole(normalizedRole);
            
            // Check if user is trying to access a different role's portal
            if (!pathname.startsWith(userLandingPage)) {
                const url = request.nextUrl.clone();
                url.pathname = userLandingPage;
                url.search = '';
                return NextResponse.redirect(url);
            }
        }
    } else if (isAuthProtectedRoute(pathname)) {
        // =====================================================
        // HANDLE ROLE-SPECIFIC PROTECTED ROUTES (/settings, etc.)
        // =====================================================
        // For /settings specifically, redirect to role-based path
        if (pathname === '/settings' || pathname.match(/^\/settings(\?|$)/)) {
            // Fetch user role to redirect to {role}/settings
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('auth_id', user.id)
                .single();

            if (profile && !profileError) {
                const userRole = (profile as any)?.role;
                const normalizedRole = normalizeRole(userRole);
                
                if (normalizedRole && isValidRole(normalizedRole)) {
                    // Redirect to role-specific settings page
                    const landingPage = getLandingPageForRole(normalizedRole);
                    const url = request.nextUrl.clone();
                    url.pathname = `${landingPage}/settings`;
                    // Preserve query params (like ?reset)
                    return NextResponse.redirect(url);
                }
            }
            // If profile not found or invalid role, redirect to login
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // For other auth-protected routes like /profile, /notifications, etc.
        // User is logged in, so just allow access (no role validation needed)
        return response;
    } else if (isProtectedRoute(pathname)) {
        // Other protected routes - user is logged in, allow access
        return response;
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};