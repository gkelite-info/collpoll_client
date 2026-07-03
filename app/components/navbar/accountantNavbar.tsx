"use client";

import { ReactNode, useMemo } from "react";
import {
  Alarm,
  CalendarCheck,
  CalendarDots,
  ChartLine,
  CheckCircle,
  FolderOpen,
  Gear,
  Headset,
  House,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
  activePaths?: string[];
};

type AccountantNavbarProps = {
  onClose?: () => void;
};

export default function AccountantNavbar({ onClose }: AccountantNavbarProps) {
  const pathname = usePathname();
  const base = "/accountant";
  const iconSize = 18;

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
          <CalendarDots size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Expense Categories",
        path: `${base}/expense-categories`,
      },
      {
        icon: (isActive) => (
          <ChartLine size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Analytics",
        path: `${base}/analytics`,
      },
      {
        icon: (isActive) => (
          <CalendarDots size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Calendar / Meeting",
        path: `${base}/calendar`,
        activePaths: [`${base}/calendar`, `${base}/meetings`],
      },
      {
        icon: (isActive) => (
          <Alarm size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Reminder",
        path: `${base}/reminder`,
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
          <FolderOpen size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Drive",
        path: `${base}/drive`,
      },
      {
        icon: (isActive) => (
          <CheckCircle size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "My Attendance",
        path: `${base}/my-attendance`,
      },
      {
        icon: (isActive) => (
          <Headset size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Well being / Support",
        path: `${base}/wellbeing-support`,
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
    const item = items.find((entry) => entry.path === itemPath);
    if (itemPath === base) return pathname === base || pathname.startsWith("/profile");
    if (item?.activePaths) {
      return item.activePaths.some((activePath) => pathname.startsWith(activePath));
    }
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
          const canWrap =
            item.label === "Well being / Support" ||
            item.label === "Calendar / Meeting";

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => onClose?.()}
              className={`relative flex w-full items-center gap-3 rounded-l-full py-2 pl-4 text-sm font-medium transition-all duration-300 before:transition-all before:duration-300 after:transition-all after:duration-300 md:text-base lg:text-sm ${
                active
                  ? "activeNav bg-[#F4F4F4] text-[#43C17A] focus:outline-none"
                  : "text-white hover:bg-[#50D689]/30 focus:outline-none"
              } ${canWrap ? "pr-4" : ""}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                  active ? "text-[#43C17A]" : "text-white"
                }`}
              >
                {item.icon(active)}
              </span>
              <span
                className={`min-w-0 flex-1 ${
                  canWrap ? "whitespace-normal break-words leading-tight" : "truncate"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
