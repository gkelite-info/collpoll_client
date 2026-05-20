import React from "react";
import { IconProps } from "@phosphor-icons/react";

export interface CardProps {
  value: React.ReactNode | string;
  label: string;
  bgColor: string; // Restored original prop
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
  // Extract icon and inject color/weight safely
  const styledIcon = React.cloneElement(icon, {
    className: iconColor,
    weight: "fill",
  } as IconProps);

  return (
    <div
      className={`rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 flex flex-col justify-between h-[105px] md:h-[130px] w-full text-gray-900 ${bgColor}`}
    >
      {/* Icon Box */}
      <div
        className={`w-8 h-8 md:w-10 md:h-10 aspect-square rounded-md md:rounded-lg flex items-center justify-center shrink-0 ${iconBgColor}`}
      >
        {React.cloneElement(styledIcon, {
          className: `w-4 h-4 md:w-6 md:h-6 ${iconColor}`,
        })}
      </div>

      {/* Text Area */}
      <div className="mt-auto">
        <div className="text-[18px] md:text-3xl font-bold leading-none truncate">
          {value}
        </div>
        <div className="text-[10px] md:text-sm font-medium text-gray-600 mt-1 truncate">
          {label}
        </div>
      </div>
    </div>
  );
}
