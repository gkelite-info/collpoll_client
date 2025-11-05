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
  totalPercentage? : string | number
}

export default function CardComponent({
  style = "bg-white h-32 w-44",
  icon,
  value,
  label,
  iconBgColor = "#FFFFFF",
  iconColor = "#000000",
  underlineValue = false,
  totalPercentage
}: CardProps) {
  return (
    <>
      <div
        className={`rounded-lg p-3 ${style} flex flex-col justify-between shadow-sm`}
      >
        {/* <div
          className="w-9 h-8 rounded-sm flex items-center justify-center mb-2"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          {icon}
        </div> */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div
            className="w-9 h-8 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: iconBgColor, color: iconColor }}
          >
            {icon}
          </div>

          {totalPercentage !== undefined && (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold" style={{color : iconBgColor}}>
                {totalPercentage}
              </span>
            </div>
          )}
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
