/**
 * Navbar Route Matching Utilities
 * Provides consistent route matching logic across all navigation bars
 */

/**
 * Determines if a route is currently active based on pathname
 * Handles exact matches and nested route matching
 */
export const isRouteActive = (
  pathname: string,
  itemPath: string,
  options?: {
    exact?: boolean;
    checkNestedRoutes?: boolean;
  }
): boolean => {
  const {
    exact = false,
    checkNestedRoutes = true,
  } = options || {};

  // Exact match
  if (pathname === itemPath) {
    return true;
  }

  if (exact) {
    return false;
  }

  // Check nested routes (e.g., /admin/calendar matches /admin/calendar/details)
  if (checkNestedRoutes && itemPath !== "/" && pathname.startsWith(itemPath)) {
    const nextChar = pathname[itemPath.length];
    return nextChar === "/" || nextChar === "?" || nextChar === undefined;
  }

  return false;
};

/**
 * Find the active nav item from a list
 */
export const findActiveNavItem = (
  pathname: string,
  items: Array<{ label: string; path: string }>
): string | undefined => {
  // First try exact matches (faster)
  const exactMatch = items.find((item) => isRouteActive(pathname, item.path, { exact: true }));
  if (exactMatch) return exactMatch.label;

  // Then try nested route matches
  const nestedMatch = items.find((item) =>
    isRouteActive(pathname, item.path, { exact: false, checkNestedRoutes: true })
  );
  return nestedMatch?.label;
};
