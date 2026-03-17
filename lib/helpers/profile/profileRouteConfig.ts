/**
 * Profile Route Configuration
 * Centralized configuration for profile routing across all roles
 * This ensures consistency and easy maintenance across the application
 */

export type UserRole =
  | "Student"
  | "Faculty"
  | "Admin"
  | "CollegeAdmin"
  | "Finance"
  | "CollegeHr"
  | "Parent"
  | "SuperAdmin"
  | "Placement";

export const ROLE_PROFILE_ROUTES: Record<UserRole, string> = {
  Student: "/profile",
  Faculty: "/profile",
  Admin: "/profile",
  CollegeAdmin: "/profile",
  Finance: "/profile",
  CollegeHr: "/profile",
  Parent: "/profile",
  SuperAdmin: "/profile",
  Placement: "/profile",
};

/**
 * Get the profile route for a specific role
 * @param role - The user role
 * @returns The profile route path
 */
export const getProfileRoute = (role: UserRole | null | undefined): string => {
  if (!role) return "/profile";
  return ROLE_PROFILE_ROUTES[role as UserRole] || "/profile";
};

/**
 * Determine if a role should have access to resume
 * Only Student role can access resume functionality
 */
export const canAccessResume = (role: any): boolean => {
  if (!role) return false;
  // Only Student has access to resume tab
  return role === "Student";
};

/**
 * Check if current route matches profile page
 * Handles both exact matches and profile pages with query parameters
 */
export const isProfilePageActive = (pathname: string): boolean => {
  return pathname === "/profile" || pathname.startsWith("/profile");
};
