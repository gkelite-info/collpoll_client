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
    size: 20,
    className: iconColor,
    weight: "fill",
  } as IconProps);

  return (
    <div
      className={`rounded-md shadow-sm p-3 flex flex-col gap-6 text-gray-900 h-full ${bgColor}`}
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center  ${iconBgColor}`}
      >
        {styledIcon}
      </div>

      <div>
        <div className="text-xl font-semibold leading-none mb-2">{value}</div>
        <div className="text-[14px] font-medium text-gray-700 mt-1 leading-tight">
          {label}
        </div>
      </div>
    </div>
  );
}
