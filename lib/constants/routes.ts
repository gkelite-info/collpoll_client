/**
 * Protected Routing Configuration
 * Defines roles, public routes, auth routes, and role-based landing pages
 * Production-ready and scalable for SaaS applications
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super-Admin",
  COLLEGE_ADMIN: "College-Admin",
  FINANCE: "Finance",
  HR: "HR",
  PLACEMENT: "Placement",
  PARENT: "Parent",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

/**
 * Public routes accessible to everyone (authenticated or not)
 * Pattern: paths that don't require authentication
 */
export const PUBLIC_ROUTES = ["/login", "/signup", "/verify-email"];

/**
 * Auth-only routes - if user is logged in, redirect to their dashboard
 * Pattern: routes that should redirect authenticated users
 */
export const AUTH_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

/**
 * Protected routes requiring authentication
 * Pattern: all routes except those in PUBLIC_ROUTES
 */
export const PROTECTED_ROUTES = [
  "/student",
  "/admin",
  "/faculty",
  "/super-admin",
  "/college-admin",
  "/finance",
  "/hr",
  "/placement",
  "/parent",
  "/profile",
];

/**
 * Routes that should not trigger redirects (construction, error pages, etc.)
 */
export const EXEMPTED_ROUTES = [
  "/construction",
  "/api",
  "/_next",
  "/public",
  "/favicon.ico",
];

/**
 * Routes that need role-based portal protection check
 * These routes require fetching user profile to validate access
 * Sub-routes like /profile/settings don't need this check
 * Note: "/" is NOT here because it would match all paths with startsWith
 * Instead, we check specific role portals
 */
export const ROLE_PROTECTED_PORTALS = [
<<<<<<< Updated upstream
=======
  // "/",
>>>>>>> Stashed changes
  "/admin",
  "/faculty",
  "/super-admin",
  "/college-admin",
  "/finance",
  "/hr",
  "/placement",
  "/parent",
];

/**
 * Legacy Student Routes (unprotected URLs that need role-based protection)
 * These are old student routes without /student prefix
 * Must be protected to ensure only students can access them
 * Will be checked by middleware for student role
 */
export const LEGACY_STUDENT_ROUTES = [
  "/stu_dashboard",
  "/attendance",
  "/academics",
  "/calendar",
  "/assignments",
  "/projects",
  "/student-progress",
  "/stu_placements",
  "/meetings",
  "/drive",
  "/payments",
  "/settings"
];

/**
 * Routes that need authentication but NOT role-based protection
 * These won't trigger profile fetch or portal validation
 */
export const AUTH_PROTECTED_ROUTES = [
  "/profile",
  "/settings",
  "/notifications",
  "/help",
];

/**
 * Role-based landing pages after login
 * Maps each role to their default dashboard/home page
 */
export const ROLE_LANDING_PAGES: Record<UserRole, string> = {
  [ROLES.STUDENT]: "/stu_dashboard",
  [ROLES.FACULTY]: "/faculty",
  [ROLES.ADMIN]: "/admin",
  [ROLES.SUPER_ADMIN]: "/super-admin",
  [ROLES.COLLEGE_ADMIN]: "/college-admin",
  [ROLES.FINANCE]: "/finance",
  [ROLES.HR]: "/hr",
  [ROLES.PLACEMENT]: "/placement",
  [ROLES.PARENT]: "/parent",
};

/**
 * All protected role portals
 * Used to detect when a user accesses a different role's portal
 */
export const ROLE_PORTALS = Object.values(ROLE_LANDING_PAGES);

// ============================================================================
// ROUTE UTILITIES
// ============================================================================

/**
 * Check if a route is public (no auth required)
 */
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

/**
 * Check if a route is auth-only (should redirect logged-in users)
 */
export const isAuthOnlyRoute = (pathname: string): boolean => {
  return AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route));
};

/**
 * Check if a route is protected (requires authentication)
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
};

/**
 * Check if a route should be exempted from protection checks
 */
export const isExemptedRoute = (pathname: string): boolean => {
  return EXEMPTED_ROUTES.some((route) => pathname.includes(route));
};

/**
 * Check if a pathname belongs to a specific role's portal
 */
export const isRolePortalPath = (pathname: string, role: UserRole): boolean => {
  const landingPage = ROLE_LANDING_PAGES[role];
  return pathname.startsWith(landingPage);
};

/**
 * Get the landing page for a given role
 */
export const getLandingPageForRole = (role: UserRole | null): string => {
  if (!role || !ROLE_LANDING_PAGES[role]) {
    return "/login"; // Fallback if role is invalid
  }
  return ROLE_LANDING_PAGES[role];
};

/**
 * Normalize role string (handle variations in role names)
 */
export const normalizeRole = (role: string | null): UserRole | null => {
  if (!role) return null;

  const roleMap: Record<string, UserRole> = {
    student: ROLES.STUDENT,
    faculty: ROLES.FACULTY,
    admin: ROLES.ADMIN,
    "super-admin": ROLES.SUPER_ADMIN,
    superadmin: ROLES.SUPER_ADMIN,
    "college-admin": ROLES.COLLEGE_ADMIN,
    collegeadmin: ROLES.COLLEGE_ADMIN,
    finance: ROLES.FINANCE,
    hr: ROLES.HR,
    collegehr: ROLES.HR, // Map CollegeHr to HR portal
    placement: ROLES.PLACEMENT,
    parent: ROLES.PARENT,
  };

  return roleMap[role.toLowerCase().trim()] || null;
};

/**
 * Validate if a role is valid
 */
export const isValidRole = (role: any): role is UserRole => {
  return Object.values(ROLES).includes(role);
};

/**
 * Check if route needs role-based portal protection (profile fetch)
 * Optimizes middleware to skip unnecessary database queries
 */
export const needsRolePortalProtection = (pathname: string): boolean => {
  return ROLE_PROTECTED_PORTALS.some((portal) => pathname.startsWith(portal));
};

/**
 * Check if route is auth-protected but doesn't need role validation
 * Examples: /profile, /settings, /notifications
 */
export const isAuthProtectedRoute = (pathname: string): boolean => {
  return AUTH_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
};
