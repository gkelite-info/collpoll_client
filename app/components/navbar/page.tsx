"use client"
import { useState } from "react"
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

  const items: NavItem[] = [
    {
      icon: (isActive) => (
        <House size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Home",
      path: ""
    },
    {
      icon: (isActive) => (
        <Calendar size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Calendar",
      path: "attendance"
    },
    {
      icon: (isActive) => (
        <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Attendance",
      path: ""
    },
    {
      icon: (isActive) => (
        <Note size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Assignments",
      path: ""
    },
    {
      icon: (isActive) => (
        <GraduationCap size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Academics",
      path: ""
    },
    {
      icon: (isActive) => (
        <Student size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Student Progress",
      path: ""
    },
    {
      icon: (isActive) => (
        <ClipboardText size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Projects",
      path: ""
    },
    {
      icon: (isActive) => (
        <BuildingOffice size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Placements",
      path: ""
    },
    {
      icon: (isActive) => (
        <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Drive",
      path: ""
    },
    {
      icon: (isActive) => (
        <CurrencyCircleDollar
          size={18}
          weight={isActive ? "fill" : "regular"}
        />
      ),
      label: "Payments",
      path: ""
    },
    {
      icon: (isActive) => (
        <Gear size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: "Settings",
      path: ""
    },
  ]

  return (
    <div className="bg-[#43C17A] flex flex-col items-center h-full w-[220px] rounded-tr-3xl rounded-br-3xl shadow-md">
      <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
        Logo
      </div>

      <div className="flex flex-col items-start w-full h-[90%] gap-3 pt-4">
        {items.map((item, index) => {
          const isActive = active === item.label
          return (
            <div
              key={index}
              onClick={() => setActive(item.label)}
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
              <p
                className={`text-sm font-medium ${isActive ? "text-[#43C17A]" : "text-white"
                  }`}
              >
                {item.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
