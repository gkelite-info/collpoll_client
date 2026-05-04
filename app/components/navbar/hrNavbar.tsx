"use client";
import { useState, ReactNode, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  FolderOpen,
  Gear,
  House,
  Laptop,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

export default function HrNavbar() {
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const t = useTranslations("Navbars");

  const items: NavItem[] = [
    {
      icon: (isActive) => (
        <House size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Home"),
      path: "/hr",
    },
    {
      icon: (isActive) => (
        <Calendar size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Calendar"),
      path: "/hr/calendar",
    },
    {
      icon: (isActive) => (
        <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Attendance"),
      path: "/hr/attendance",
    },
    {
      icon: (isActive) => (
        <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Drive"),
      path: "/hr/drive",
    },
    {
      icon: (isActive) => (
        <Laptop size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Meetings"),
      path: "/hr/meetings",
    },
    {
      icon: (isActive) => (
        <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("My Attendance"),
      path: "/hr/MyAttendance",
    },
    {
      icon: (isActive) => (
        <Gear size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Settings"),
      path: "/hr/settings",
    },
  ];

  useEffect(() => {
    const current = items.find((item) => item.path === pathname);
    if (current) setActive(current.label);
  }, [pathname, items]);

  return (
    <div className="bg-[#43C17A] flex flex-col items-center h-full w-full rounded-tr-3xl shadow-md focus:outline-none">
      <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
        Logo
      </div>

      <div className="flex flex-col items-start w-full h-full lg:gap-[11px] pt-4 pl-4 lg:pb-5 overflow-y-auto focus:outline-none">
        {items.map((item) => {
          const isActive = active === item.label;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex relative items-center gap-3 w-full pl-4  py-2 rounded-l-full cursor-pointer transition-all duration-300
                before:transition-all before:duration-300
                after:transition-all after:duration-300
                ${
                  isActive
                    ? "bg-[#F4F4F4] text-[#43C17A] activeNav focus:outline-none"
                    : "text-white hover:bg-[#50D689]/30 focus:outline-none"
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
