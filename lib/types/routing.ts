/**
 * Type definitions for protected routing system
 * Ensures type safety across the application
 */

import { ROLES } from "../constants/routes";


/**
 * User role type - ensures only valid roles are used
 */
export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * User profile with role information
 */
export interface UserProfile {
  userId: number;
  auth_id: string;
  fullName: string;
  email: string;
  role: UserRole | null;
  collegeId: number;
  isActive: boolean;
}

/**
 * Login response type
 */
export interface LoginResponse {
  success: boolean;
  error?: string;
  session?: {
    access_token: string;
    refresh_token: string;
  };
  user?: Partial<UserProfile>;
}

/**
 * Route access check result
 */
export interface RouteAccessResult {
  hasAccess: boolean;
  redirectTo?: string;
  reason?: "not_authenticated" | "invalid_role" | "wrong_portal" | "inactive";
}

/**
 * Feature access check result
 */
export interface FeatureAccessResult {
  hasAccess: boolean;
  feature: string;
  role: UserRole | null;
  message?: string;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  isPublic: boolean;
  isAuthOnly: boolean;
  isProtected: boolean;
  requiredRoles?: UserRole[];
}

/**
 * Redirect options
 */
export interface RedirectOptions {
  from?: string;
  error?: string;
  message?: string;
}
