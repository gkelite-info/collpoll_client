/**
 * Custom hook for detecting active profile route
 * Ensures consistent active tab highlighting across all roles
 */

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const useActiveNavItem = (itemPath: string): boolean => {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Exact match for most routes
    if (pathname === itemPath) {
      setIsActive(true);
      return;
    }

    // Special handling for profile route - pathname is /profile but might have query params
    if (itemPath === "/profile" && pathname === "/profile") {
      setIsActive(true);
      return;
    }

    // For nested routes, check if pathname starts with item path
    if (
      itemPath !== "/" &&
      pathname.startsWith(itemPath) &&
      pathname !== itemPath
    ) {
      // Make sure it's a subpath (has / after the base path)
      const nextChar = pathname[itemPath.length];
      if (nextChar === "/" || nextChar === "?") {
        setIsActive(true);
        return;
      }
    }

    setIsActive(false);
  }, [pathname, itemPath]);

  return isActive;
};

/**
 * Hook to get the current active nav item
 * Used in navbars to set the active label
 */
export const useCurrentNavItem = (items: Array<{ label: string; path: string }>) => {
  const pathname = usePathname();
  const [active, setActive] = useState("");

  useEffect(() => {
    // Check for exact match first
    const exactMatch = items.find((item) => item.path === pathname);
    if (exactMatch) {
      setActive(exactMatch.label);
      return;
    }

    // Check for nested routes
    for (const item of items) {
      if (item.path !== "/" && pathname.startsWith(item.path)) {
        const nextChar = pathname[item.path.length];
        if (nextChar === "/" || nextChar === "?" || nextChar === undefined) {
          setActive(item.label);
          return;
        }
      }
    }

    setActive("");
  }, [pathname, items]);

  return active;
};
