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

function applyNoStoreHeaders(response: NextResponse) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    return response;
}

function redirectNoStore(request: NextRequest, pathname: string, search?: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search ?? "";
    return applyNoStoreHeaders(NextResponse.redirect(url));
}

type UserRouteProfile = {
    userId?: number
    role: string | null;
    collegeId?: number | null;
    colleges?: {
        collegeCode?: string | null;
    } | null;
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

    applyNoStoreHeaders(response);


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
            return applyNoStoreHeaders(NextResponse.redirect(url));
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

        const userProfile = profile as UserRouteProfile | null;

        if (!userProfile || profileError || userProfile.role !== 'Student') {
            if (userProfile?.role) {
                const normalizedRole = normalizeRole(userProfile.role);
                if (normalizedRole && isValidRole(normalizedRole)) {
                    const url = request.nextUrl.clone();
                    url.pathname = getLandingPageForRole(normalizedRole);
                    url.search = '';
                    return applyNoStoreHeaders(NextResponse.redirect(url));
                }
            }
            return redirectNoStore(request, "/login");
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
            return redirectNoStore(request, "/login");
        }

        const userProfile = profile as UserRouteProfile;
        const rawCollegeCode = userProfile.colleges?.collegeCode;
        const userRole = userProfile.role;

        const userCode = (rawCollegeCode || "").trim().toUpperCase();
        const urlCode = (currentUrlCode || "").trim().toUpperCase();

        if (userCode !== urlCode && pathname !== '/login') {
            if (urlCode !== "GK") {
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                url.searchParams.set('error', 'portal_mismatch');
                return applyNoStoreHeaders(NextResponse.redirect(url));
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
                    return applyNoStoreHeaders(NextResponse.redirect(url));
                }
            }
            return response;
        }

        if (needsRolePortalProtection(pathname)) {
            if (!userRole) {
                return redirectNoStore(request, "/login");
            }

            const normalizedRole = normalizeRole(userRole ?? null);
            if (!normalizedRole || !isValidRole(normalizedRole)) {
                return redirectNoStore(request, "/login");
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
                    .eq("userId", userProfile.userId)
                    .eq("collegeId", userProfile.collegeId)
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

            if (normalizedRole === "Accountant") {
                const { data: accountantRows, error: accountantError } = await supabase
                    .from("accountants")
                    .select("accountantId")
                    .eq("userId", userProfile.userId)
                    .eq("collegeId", userProfile.collegeId)
                    .eq("isActive", true)
                    .eq("is_deleted", false)
                    .is("deletedAt", null)
                    .limit(1);

                if (accountantError || !accountantRows?.length) {
                    const url = request.nextUrl.clone();
                    url.pathname = "/construction";
                    url.searchParams.set("error", "accountant_access_inactive");
                    return NextResponse.redirect(url);
                }
            }

            let actualLandingPage = userLandingPage;
            if (normalizedRole === "College-Admin") {
                let isSchoolStr = request.cookies.get("isSchool")?.value;

                if (!isSchoolStr) {
                    const { data: eduData } = await supabase
                        .from("college_education")
                        .select("collegeEducationType")
                        .eq("collegeId", userProfile.collegeId)
                        .eq("isActive", true);
                        
                    const isSchoolBool = eduData?.some((e: any) => {
                        const type = e.collegeEducationType;
                        return type ? ["CBSE", "SSC", "ICSE", "ISC", "IB"].includes(type.trim().toUpperCase()) : false;
                    }) || false;
                    
                    isSchoolStr = String(isSchoolBool);
                    response.cookies.set("isSchool", isSchoolStr, { path: "/" });
                }

                if (isSchoolStr === "true") {
                    actualLandingPage = "/school-admin";
                }
            }

            if (!pathname.startsWith(actualLandingPage)) {
                const url = request.nextUrl.clone();
                const wrongBasePath = actualLandingPage === "/school-admin" ? "/college-admin" : "/school-admin";
                
                if (pathname.startsWith(wrongBasePath)) {
                   let replacedPath = pathname.replace(wrongBasePath, actualLandingPage);
                   if (actualLandingPage === "/school-admin") {
                       replacedPath = replacedPath.replace("/institution-management", "/school-management");
                   } else {
                       replacedPath = replacedPath.replace("/school-management", "/institution-management");
                   }
                   url.pathname = replacedPath;
                } else {
                   url.pathname = actualLandingPage;
                   url.search = '';
                }
                return applyNoStoreHeaders(NextResponse.redirect(url));
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
                const userRole = (profile as UserRouteProfile).role;
                const normalizedRole = normalizeRole(userRole);

                if (normalizedRole && isValidRole(normalizedRole)) {
                    const landingPage = getLandingPageForRole(normalizedRole);
                    const url = request.nextUrl.clone();
                    url.pathname = `${landingPage}/settings`;
                    url.search = '';
                    return applyNoStoreHeaders(NextResponse.redirect(url));
                }
            }
            return redirectNoStore(request, "/login");
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
