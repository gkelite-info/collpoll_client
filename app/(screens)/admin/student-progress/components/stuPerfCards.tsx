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
    size: 24,
    className: iconColor,
    weight: "fill",
  } as IconProps);

  return (
    <div
      className={`rounded-lg shadow-md px-3.5 py-3 flex flex-col justify-between h-[130px] w-[200px] text-gray-900 ${bgColor}`}
    >
      <div
        className={`w-10 h-10 aspect-square rounded-lg flex items-center justify-center mb-2 ${iconBgColor}`}
      >
        {styledIcon}
      </div>
      <div className="text-3xl font-semibold leading-none mt-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
    </div>
  );
}
