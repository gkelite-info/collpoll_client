"use client";
import React from "react";
import { IconProps } from "@phosphor-icons/react";

export interface CardProps {
  value: string;
  label: string;
  bgColor: string;
  icon: React.ReactElement<IconProps>;
  iconBgColor: string;
  iconColor: string;
}

export default function CardComponent({
  value,
  label,
  bgColor,
  icon,
  iconBgColor,
  iconColor,
}: CardProps) {
  const styledIcon = React.cloneElement(icon, {
    className: iconColor,
    weight: "fill",
  } as IconProps);

  return (
    <div
      className={`rounded-xl shadow-sm px-3 md:px-4 py-3 md:py-4 flex items-center md:flex-col md:items-start justify-start md:justify-between h-[80px] md:h-[130px] w-full text-gray-900 ${bgColor}`}
    >
      <div
        className={`w-10 h-10 md:w-10 md:h-10 shrink-0 rounded-lg flex items-center justify-center ${iconBgColor} mr-3 md:mr-0 md:mb-4`}
      >
        {React.cloneElement(styledIcon, {
          className: `w-5 h-5 ${iconColor}`,
        })}
      </div>

      <div className="flex flex-col justify-center text-left">
        <div className="text-[17px] md:text-2xl font-bold leading-none mb-0.5 md:mb-2">
          {value}
        </div>
        <div className="text-[11px] md:text-sm font-medium text-gray-700 leading-tight truncate">
          {label}
        </div>
      </div>
    </div>
  );
}
