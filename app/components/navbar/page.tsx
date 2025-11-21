"use client";

import { useState, ReactNode, useEffect } from "react";
import {
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
<<<<<<< Updated upstream
} from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");
=======
} from "@phosphor-icons/react"
import { ReactNode } from "react"
import { useRouter } from "next/navigation"

type NavItem = {
  icon: (isActive: boolean) => ReactNode
  label: string
  path: string;
}

export default function Navbar() {
  const router = useRouter();
  const [active, setActive] = useState("Home");
>>>>>>> Stashed changes

  const items: NavItem[] = [
    {
      icon: (isActive) => (
        <House size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Home",
<<<<<<< Updated upstream
      path: "/",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <Calendar size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Calendar",
<<<<<<< Updated upstream
      path: "/calendar",
=======
      path: "attendance"
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Attendance",
<<<<<<< Updated upstream
      path: "/attendance",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <Note size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Assignments",
<<<<<<< Updated upstream
      path: "/assignments",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <GraduationCap size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Academics",
<<<<<<< Updated upstream
      path: "/academics",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <Student size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Student Progress",
<<<<<<< Updated upstream
      path: "/student-progress",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <ClipboardText size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Projects",
<<<<<<< Updated upstream
      path: "/projects",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <BuildingOffice size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Placements",
<<<<<<< Updated upstream
      path: "/placements",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Drive",
<<<<<<< Updated upstream
      path: "/drive",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <CurrencyCircleDollar size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Payments",
<<<<<<< Updated upstream
      path: "/payments",
=======
      path: ""
>>>>>>> Stashed changes
    },
    {
      icon: (isActive) => (
        <Gear size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Settings",
<<<<<<< Updated upstream
      path: "/settings",
=======
      path: ""
>>>>>>> Stashed changes
    },
  ];

  useEffect(() => {
    const current = items.find((item) => item.path === pathname);
    if (current) setActive(current.label);
  }, [pathname]);

  return (
    <div className="bg-[#43C17A] flex flex-col items-center h-full w-[220px] rounded-tr-3xl rounded-br-3xl shadow-md">
      <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
        Logo
      </div>

      <div className="flex flex-col items-start w-full h-[90%] gap-3 pt-4">
        {items.map((item, index) => {
          const isActive = active === item.label;

          return (
            <div
              key={index}
              onClick={() => {
                setActive(item.label);
                if (item.path) router.push(item.path);
              }}
              className={`flex items-center gap-3 w-[90%] mx-auto px-4 py-2 rounded-full cursor-pointer transition-all duration-300
                ${isActive
                  ? "bg-white text-[#43C17A]"
                  : "text-white hover:bg-[#50D689]/30"
                }
              `}
            >
              <div className={`${isActive ? "text-[#43C17A]" : "text-white"}`}>
                {item.icon(isActive)}
              </div>
<<<<<<< Updated upstream

              <p className={`text-sm font-medium ${isActive ? "text-[#43C17A]" : "text-white"}`}>
=======
              <p
                className={`text-sm font-medium ${isActive ? "text-[#43C17A]" : "text-white"
                  }`}
              >
>>>>>>> Stashed changes
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
