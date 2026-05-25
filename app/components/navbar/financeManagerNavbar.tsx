"use client";

import { ReactNode, useMemo } from "react";
import {
  CalendarCheck,
  CalendarDots,
  ChartLine,
  CheckCircle,
  FolderOpen,
  Gear,
  Headset,
  House,
  Laptop,
  SmileyIcon,
  UsersThree,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

type FinanceManagerNavbarProps = {
  onClose?: () => void;
};

export default function FinanceManagerNavbar({
  onClose,
}: FinanceManagerNavbarProps) {
  const pathname = usePathname();
  const iconSize = 18;
  const base = "/finance-manager";

  const items: NavItem[] = useMemo(
    () => [
      {
        icon: (isActive) => (
          <House size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Home",
        path: base,
      },
      {
        icon: (isActive) => (
          <ChartLine size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Finance / Analytics",
        path: `${base}/finance-analytics`,
      },
      {
        icon: (isActive) => (
          <CalendarDots size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Calendar",
        path: `${base}/calendar`,
      },
      {
        icon: (isActive) => (
          <CalendarCheck
            size={iconSize}
            weight={isActive ? "fill" : "regular"}
          />
        ),
        label: "Leave Request",
        path: `${base}/leave-request`,
      },
      {
        icon: (isActive) => (
          <UsersThree size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Club",
        path: `${base}/club`,
      },
      {
        icon: (isActive) => (
          <FolderOpen size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Drive",
        path: `${base}/drive`,
      },
      {
        icon: (isActive) => (
          <Laptop size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Meetings",
        path: `${base}/meetings`,
      },
      {
        icon: (isActive) => (
          <CheckCircle size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "My Attendance",
        path: `${base}/my-attendance`,
      },
      {
        icon: (isActive) => <SmileyIcon size={18} weight={isActive ? "fill" : "regular"} />,
        label: "Wellbeing",
        path: `${base}/wellbeing`,
      },
      {
        icon: (isActive) => (
          <Gear size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Settings",
        path: `${base}/settings`,
      },
    ],
    [],
  );

  const isActivePath = (itemPath: string) => {
    if (itemPath === base) return pathname === base || pathname.startsWith("/profile");
    return pathname.startsWith(itemPath);
  };

  return (
    <div className="flex h-full w-full flex-col items-center rounded-tr-3xl bg-[#43C17A] text-white shadow-md">
      <div className="flex h-[10%] min-h-19.5 w-full items-center justify-center rounded-br-3xl text-lg font-bold">
        College Logo
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-start gap-2.75 overflow-y-auto w-full pt-4 pl-4 pb-5">
        {items.map((item) => {
          const active = isActivePath(item.path);
          const isWellBeing = item.label === "Well being / Support";

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => onClose?.()}
              className={`relative flex w-full items-center gap-3 rounded-l-full py-2 pl-4 text-sm font-medium transition-all duration-300 before:transition-all before:duration-300 after:transition-all after:transition-all md:text-base lg:text-sm ${active
                ? "activeNav bg-[#F4F4F4] text-[#43C17A] focus:outline-none"
                : "text-white hover:bg-[#50D689]/30 focus:outline-none"
                } ${isWellBeing ? "pr-4" : ""}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center ${active ? "text-[#43C17A]" : "text-white"
                  }`}
              >
                {item.icon(active)}
              </span>
              <span className={`min-w-0 flex-1 ${isWellBeing ? "whitespace-normal wrap-break-word leading-tight" : "truncate"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}