"use client";

import { useState, ReactNode, useEffect } from "react";
import {
  BookOpenText,
  BuildingOffice,
  Calendar,
  CheckCircle,
  ClipboardText,
  CurrencyCircleDollar,
  FolderOpen,
  Gear,
  GraduationCap,
  House,
  Note,
  Student,
} from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");

  const items: NavItem[] = [
    {
      icon: (isActive) => (
        <House size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Home",
      path: "/admin",
    },
    {
      icon: (isActive) => (
        <Calendar size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Calendar",
      path: "/admin/calendar",
    },
    {
      icon: (isActive) => (
        <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Attendance",
      path: "/admin/attendance",
    },
    {
      icon: (isActive) => (
        <Note size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Assignments",
      path: "/admin/assignments",
    },
    {
      icon: (isActive) => (
        <GraduationCap size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Academics",
      path: "/admin/academics",
    },
    {
      icon: (isActive) => (
        <Student size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Student Progress",
      path: "/admin/student-progress",
    },
    {
      icon: (isActive) => (
        <ClipboardText size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Projects",
      path: "/admin/projects",
<<<<<<< Updated upstream
    },
    {
      icon: (isActive) => (
        <BookOpenText size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Academic Setup",
      path: "/admin/academic-setup",
=======
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <BuildingOffice size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Placements",
      path: "/admin/placements",
    },
    {
      icon: (isActive) => (
        <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Drive",
      path: "/admin/drive",
    },
    // {
    //     icon: (isActive) => (
    //         <CurrencyCircleDollar
    //             size={18}
    //             weight={isActive ? "fill" : "regular"}
    //         />
    //     ),
    //     label: "Payments",
    //     path: "/payments",
    // },
    {
      icon: (isActive) => (
        <Gear size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Settings",
      path: "/admin/settings",
    },
  ];

  useEffect(() => {
    const current = items.find((item) => item.path === pathname);
    if (current) setActive(current.label);
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
                ${isActive
                  ? "bg-[#F4F4F4] text-[#43C17A] activeNav"
                  : "text-white hover:bg-[#50D689]/30"
                }
              `}
            >
              <div className={`${isActive ? "text-[#43C17A]" : "text-white"}`}>
                {item.icon(isActive)}
              </div>

              <p
                className={`text-sm font-medium ${isActive ? "text-[#43C17A]" : "text-white"
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
