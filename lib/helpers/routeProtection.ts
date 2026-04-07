/**
 * Route Protection Utilities
 * Provides helper functions for route protection checks in components and API routes
 */

import { UserRole, ROLE_LANDING_PAGES, isValidRole, normalizeRole } from "@/lib/constants/routes";

/**
 * Get user's landing page based on their role
 * Used for redirecting authenticated users
 * 
 * @param role - User's role
 * @returns Landing page pathname for the role
 */
export const getUserLandingPage = (role: string | null): string => {
    if (!role) return "/login";
    
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole || !isValidRole(normalizedRole)) {
        console.warn(`Invalid role: ${role}`);
        return "/login";
    }
    
    return ROLE_LANDING_PAGES[normalizedRole];
};

/**
 * Check if user has access to a specific route
 * Used for fine-grained access control
 * 
 * @param userRole - User's role
 * @param requiredRoles - Array of roles that can access the route
 * @returns true if user has access
 */
export const hasRouteAccess = (
    userRole: string | null,
    requiredRoles: UserRole[]
): boolean => {
    if (!userRole) return false;
    
    const normalizedRole = normalizeRole(userRole);
    if (!normalizedRole) return false;
    
    return requiredRoles.includes(normalizedRole);
};

/**
 * Check if user is in an admin or super-admin role
 * For quick admin checks
 * 
 * @param role - User's role
 * @returns true if user is admin or super-admin
 */
export const isAdminRole = (role: string | null): boolean => {
    if (!role) return false;
    
    const normalized = normalizeRole(role);
    return normalized === "Admin" || normalized === "Super-Admin" || normalized === "College-Admin";
};

/**
 * Check if user is in a staff role (non-student)
 * Useful for staff-only features
 * 
 * @param role - User's role
 * @returns true if user is staff
 */
export const isStaffRole = (role: string | null): boolean => {
    if (!role) return false;
    
    const normalized = normalizeRole(role);
    const staffRoles = ["Admin", "Super-Admin", "College-Admin", "Faculty", "Finance", "HR", "Placement", "Parent"];
    
    return staffRoles.includes(normalized!);
};

/**
 * Build redirect URL with optional from parameter
 * Used when redirecting to role's landing page with return URL
 * 
 * @param role - User's role
 * @param fromPath - Optional original path user was trying to access
 * @returns Redirect URL
 */
export const buildRoleRedirectUrl = (role: string | null, fromPath?: string): string => {
    const landingPage = getUserLandingPage(role);
    
    if (fromPath) {
        // Store the from path for later redirect after page loads
        return `${landingPage}?from=${encodeURIComponent(fromPath)}`;
    }
    
    return landingPage;
};

/**
 * Validate role before storing in session/context
 * Prevents invalid roles from being used
 * 
 * @param role - Role to validate
 * @returns Normalized role if valid, null otherwise
 */
export const validateAndNormalizeRole = (role: any): UserRole | null => {
    const normalized = normalizeRole(role);
    
    if (!normalized || !isValidRole(normalized)) {
        return null;
    }
    
    return normalized;
};

/**
 * Get role display name (formatted for UI)
 * Converts "Super-Admin" to "Super Admin", etc.
 * 
 * @param role - User's role
 * @returns Display-friendly role name
 */
export const getRoleDisplayName = (role: string | null): string => {
    if (!role) return "User";
    
    const normalized = normalizeRole(role);
    if (!normalized) return "User";
    
    // Format: "Super-Admin" -> "Super Admin"
    return normalized
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

/**
 * Get all available role options
 * Useful for admin panels or role selection dropdowns
 * 
 * @returns Array of available roles
 */
export const getAvailableRoles = (): UserRole[] => {
    return Object.values(ROLE_LANDING_PAGES).map((page) => {
        // Extract role from landing page path
        const role = page.replace("/", "").toLowerCase();
        return normalizeRole(role) as UserRole;
    });
};

/**
 * Check if a user can access a specific feature
 * Extensible for future permission system
 * 
 * @param userRole - User's role
 * @param requiredFeature - Feature identifier
 * @returns true if user can access the feature
 */
export const canAccessFeature = (
    userRole: string | null,
    requiredFeature: string
): boolean => {
    if (!userRole) return false;
    
    const normalized = normalizeRole(userRole);
    if (!normalized) return false;
    
    // Define feature access by role
    const featureAccess: Record<UserRole, string[]> = {
        "Student": ["profile", "courses", "attendance", "grades"],
        "Faculty": ["profile", "courses", "attendance", "grades", "submissions"],
        "Admin": ["all"],
        "Super-Admin": ["all"],
        "College-Admin": ["all"],
        "Finance": ["profile", "payments", "fees", "reports"],
        "HR": ["profile", "Staff", "payroll", "attendance"],
        "Placement": ["profile", "placements", "companies", "jobs"],
        "Parent": ["profile", "student-progress", "attendance", "grades"],
    };
    
    const allowedFeatures = featureAccess[normalized];
    if (!allowedFeatures) return false;
    
    // If role has "all" access, allow any feature
    if (allowedFeatures.includes("all")) return true;
    
    return allowedFeatures.includes(requiredFeature);
};
