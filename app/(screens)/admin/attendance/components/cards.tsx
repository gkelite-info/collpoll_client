"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type CardProps = {
  style?: string;
  icon: ReactNode;
  value: string | number;
  label: string;
  iconBgColor?: string;
  iconColor?: string;
  underlineValue?: boolean;
  totalPercentage?: string | number;
  to?: string;
  onClick?: () => void;
};

export default function CardComponent({
  style = "bg-white h-32 w-44",
  icon,
  value,
  label,
  to,
  iconBgColor = "#FFFFFF",
  iconColor = "#000000",
  underlineValue = false,
  totalPercentage,
  onClick,
}: CardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (to) router.push(to);
  };
  return (
    <div
      onClick={handleClick}
      className={`rounded-lg p-3 h-32 ${style} flex flex-col justify-around shadow-sm 
        ${to ? "cursor-pointer hover:scale-[1.02] transition-all" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div
          className="w-9 h-8 rounded-sm flex items-center justify-center"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          {icon}
        </div>

        {totalPercentage !== undefined && (
          <div className="flex items-baseline gap-1">
            <span
              className="text-lg font-semibold"
              style={{ color: iconBgColor }}
            >
              {totalPercentage}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[#282828] text-lg font-semibold">{value}</p>
        <span className="text-[#282828] text-sm">{label}</span>
      </div>
    </div>
  );
}
