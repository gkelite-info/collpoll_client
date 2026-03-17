"use client";

import { useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { findActiveNavItem } from "@/lib/helpers/navbar/routeMatchingUtils";

export type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

interface GenericNavbarProps {
  items: NavItem[];
  customActiveLogic?: (pathname: string, item: NavItem) => boolean;
}

/**
 * Generic Navbar Component
 * Reusable navbar component that can be used across all roles
 * Reduces code duplication and ensures consistent behavior
 */
export default function GenericNavbar({
  items,
  customActiveLogic,
}: GenericNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");

  useEffect(() => {
    if (customActiveLogic) {
      // Use custom logic if provided (e.g., for finance analytics)
      const activeItem = items.find((item) =>
        customActiveLogic(pathname, item)
      );
      if (activeItem) setActive(activeItem.label);
    } else {
      // Use default route matching
      const activeLabel = findActiveNavItem(pathname, items);
      setActive(activeLabel || "");
    }
  }, [pathname, items, customActiveLogic]);

  const handleNavClick = (item: NavItem) => {
    setActive(item.label);
    if (item.path) router.push(item.path);
  };

  return (
    <div className="bg-[#43C17A] flex flex-col items-center h-full w-full rounded-tr-3xl shadow-md pt-5 focus:outline-none">
      <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
        Logo
      </div>

      <div className="flex flex-col items-start w-full h-full lg:gap-[11px] pt-4 pl-4 overflow-y-auto pb-3 focus:outline-none">
        {items.map((item, index) => {
          const isActive = active === item.label;

          return (
            <div
              key={index}
              onClick={() => handleNavClick(item)}
              className={`flex relative items-center gap-3 w-full pl-4 py-2 rounded-l-full cursor-pointer transition-all duration-300
                before:transition-all before:duration-300
                after:transition-all after:duration-300
                ${
                  isActive
                    ? "bg-[#F4F4F4] text-[#43C17A] activeNav"
                    : "text-white hover:bg-[#50D689]/30"
                }
              `}
            >
              <div className={`${isActive ? "text-[#43C17A]" : "text-white"}`}>
                {item.icon(isActive)}
              </div>

              <p
                className={`text-sm font-medium ${
                  isActive ? "text-[#43C17A]" : "text-white"
                }`}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
