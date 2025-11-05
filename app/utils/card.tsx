"use client"
import { ReactNode } from "react"

type CardProps = {
  style: string | undefined
  icon: ReactNode
  value: string | number
  label: string
  iconBgColor?: string
  iconColor?: string
  underlineValue?: boolean
}

export default function CardComponent({
  style = "bg-white",
  icon,
  value,
  label,
  iconBgColor = "#FFFFFF",
  iconColor = "#000000",
  underlineValue = false,
}: CardProps) {
  return (
    <>
      <div
        className={`h-32 w-44 rounded-lg p-3 ${style} flex flex-col justify-between shadow-sm`}
      >
        <div
          className="w-9 h-8 rounded-sm flex items-center justify-center mb-4"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          {icon}
        </div>
        <p
          className={`text-[#282828] text-lg font-semibold ${
            underlineValue
              ? "underline hover:text-blue-800 cursor-pointer transition-all"
              : ""
          }`}
        >
          {value}
        </p>
        <span className="text-[#282828]">{label}</span>
      </div>
    </>
  )
}
