"use client";

import { useState, ReactNode, useEffect } from "react";
import { Calendar, FolderOpen, Gear, House, Note } from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";
import { CurrencyCircleDollar } from "@phosphor-icons/react/dist/ssr";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

export default function FinanceNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");

  const items: NavItem[] = [
    {
      icon: (isActive) => (
        <House size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Home",
      path: "/finance",
    },
    {
      icon: (isActive) => (
        <Calendar size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Finance / Analytics",
      path: "/finance/finance-analytics",
    },

    {
      icon: (isActive) => (
        <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Drive",
      path: "/finance/drive",
    },
    {
      icon: (isActive) => (
        <Note size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Meetings / Calendar",
      path: "/finance/meetings-calendar",
    },
    {
      icon: (isActive) => (
        <CurrencyCircleDollar
          size={18}
          weight={isActive ? "fill" : "regular"}
        />
      ),
      label: "Add Fee Structure",
      path: "/finance/add-fee-structure",
    },
    {
      icon: (isActive) => (
        <Gear size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Settings",
      path: "/finance/settings",
    },
  ];

  useEffect(() => {
    if (pathname === "/finance") {
      setActive("Home");
      return;
    }

    // Keep Home active for this specific route
    if (pathname === "/finance/finance-analytics/students") {
      setActive("Home");
      return;
    }

    // Activate Finance / Analytics for deeper nested routes
    if (
      pathname.startsWith("/finance/finance-analytics") &&
      pathname !== "/finance/finance-analytics/students"
    ) {
      setActive("Finance / Analytics");
      return;
    }

    // Fallback: exact match
    const current = items.find((item) => item.path === pathname);
    if (current) {
      setActive(current.label);
    }
  }, [pathname]);

  return (
    <div className="bg-[#43C17A] flex flex-col items-center h-full w-full rounded-tr-3xl shadow-md">
      <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
        Logo
      </div>

      <div className="flex flex-col items-start w-full h-full lg:gap-[11px] pt-4 pl-4">
        {items.map((item, index) => {
          const isActive = active === item.label;

          return (
            <div
              key={index}
              onClick={() => {
                setActive(item.label);
                if (item.path) router.push(item.path);
              }}
              className={`flex relative items-center gap-3 w-full pl-4  py-2 rounded-l-full cursor-pointer transition-all duration-300
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
