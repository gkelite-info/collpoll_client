import React from "react";

import { IconProps } from "@phosphor-icons/react";

export interface CardProps {
  value: React.ReactNode;
  label: string;
  bgColor: string;
  icon: React.ReactElement<IconProps>;
  iconBgColor: string;
  iconColor: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function CardComponent({
  value,
  label,
  bgColor,
  icon,
  iconBgColor,
  iconColor,
  onClick,
  selected = false,
}: CardProps) {
  const styledIcon = React.cloneElement(icon, {
    size: 24,
    className: iconColor,
    weight: "fill",
  } as IconProps);

  return (
    <div
      onClick={onClick}
      className={`rounded-lg shadow-md px-3.5 py-3 flex flex-col justify-between h-[135px] w-full text-[#282828] transition-shadow duration-200 ${bgColor} ${onClick ? "cursor-pointer hover:shadow-lg" : ""} ${selected ? "ring-2 ring-inset ring-[#43C17A] shadow-lg" : ""}`}
    >
      <div
        className={`w-10 h-10 aspect-square rounded-lg flex items-center justify-center mb-2 ${iconBgColor}`}
      >
        {styledIcon}
      </div>
      <div className="text-lg font-semibold leading-none mt-1">{value}</div>
      <div className="text-base landscape:text-base md:text-base landscape:md:text-sm text-[#515151] mt-1">{label}</div>
    </div>
  );
}
