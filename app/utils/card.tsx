// "use client";

// import { useRouter } from "next/navigation";
// import { ReactNode } from "react";
// import WipOverlay from "./WipOverlay";

// type CardProps = {
//   style?: string;
//   inlineStyle?: object;
//   isActive?: boolean;
//   textSize?: string;
//   icon: ReactNode;
//   value: React.ReactNode;
//   label: string;
//   iconBgColor?: string;
//   iconColor?: string;
//   underlineValue?: boolean;
//   totalPercentage?: string | number;
//   to?: string;
//   onClick?: () => void;
// };

// export default function CardComponent({
//   style = "bg-white h-32 w-44",
//   inlineStyle,
//   isActive,
//   textSize,
//   icon,
//   value,
//   label,
//   to,
//   iconBgColor = "#FFFFFF",
//   iconColor = "#000000",
//   underlineValue = false,
//   totalPercentage,
//   onClick,
// }: CardProps) {
//   const router = useRouter();

//   const handleClick = () => {
//     if (onClick) {
//       onClick();
//       return;
//     }
//     if (to) router.push(to);
//   };

//   return (
//     <div
//       onClick={handleClick}
//       style={{ ...inlineStyle }}
//       className={`relative rounded-lg p-3 h-fit md:h-32 lg:h-32 ${style} flex flex-col justify-between shadow-sm
//         ${to || onClick ? "cursor-pointer hover:scale-[1.02] transition-all" : ""}`}
//     >
//       <div className="hidden md:flex lg:flex items-center justify-between gap-3 mb-2">
//         <div
//           className="w-9 h-8 rounded-sm flex items-center justify-center"
//           style={{ backgroundColor: iconBgColor, color: iconColor }}
//         >
//           {icon}
//         </div>

//         {totalPercentage !== undefined && (
//           <div className="flex items-baseline gap-1">
//             <span
//               className="text-lg font-semibold"
//               style={{ color: iconBgColor }}
//             >
//               {totalPercentage}
//             </span>
//           </div>
//         )}
//       </div>

//       <div
//         className={`hidden md:block lg:block ${isActive ? "text-[#ffffff]" : "text-[#282828]"} ${textSize} text-lg font-semibold`}
//       >
//         {value}
//       </div>

//       <span
//         className={`hidden md:block lg:block ${isActive ? "text-[#ffffff]" : "text-[#282828]"} ${textSize}`}
//       >
//         {label}
//       </span>

//       {/* Mobile View */}
//       <div className="flex md:hidden lg:hidden items-center justify-start gap-3 mb-2">
//         <div
//           className="w-9 h-8 rounded-sm flex items-center justify-center"
//           style={{ backgroundColor: iconBgColor, color: iconColor }}
//         >
//           {icon}
//         </div>

//         {/* {totalPercentage !== undefined && (
//           <div className="flex items-baseline gap-1">
//             <span
//               className="text-lg font-semibold"
//               style={{ color: iconBgColor }}
//             >
//               {totalPercentage}
//             </span>
//           </div>
//         )} */}
//         <div className="flex flex-col">
//           <div
//             className={`block md:hidden lg:hidden ${isActive ? "text-[#ffffff]" : "text-[#282828]"} ${textSize} text-lg font-semibold`}
//           >
//             {value}
//           </div>

//           <span
//             className={`block md:hidden lg:hidden ${isActive ? "text-[#ffffff]" : "text-[#282828]"} ${textSize}`}
//           >
//             {label}
//           </span>
//         </div>
//       </div>
//       {/* Mobile View */}
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import WipOverlay from "./WipOverlay";

type CardProps = {
  style?: string;
  inlineStyle?: object;
  isActive?: boolean;
  textSize?: string;
  icon: ReactNode;
  value: React.ReactNode;
  label: string;
  iconBgColor?: string;
  iconColor?: string;
  underlineValue?: boolean;
  totalPercentage?: string | number;
  to?: string;
  onClick?: () => void;
  iconStyle?: string;
};

export default function CardComponent({
  style = "bg-white h-32 w-full",
  inlineStyle,
  isActive,
  textSize,
  icon,
  value,
  label,
  to,
  iconBgColor = "#FFFFFF",
  iconColor = "#000000",
  underlineValue = false,
  totalPercentage,
  onClick,
  iconStyle

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
      style={{ ...inlineStyle }}
      className={`relative rounded-lg p-3 h-fit md:h-32 lg:h-32 ${style} flex flex-col justify-between shadow-sm max-md:w-full max-md:h-auto max-md:p-2.5 max-md:justify-center
        ${to || onClick ? "cursor-pointer hover:scale-[1.02] transition-all" : ""}`}
    >
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex lg:flex items-center justify-between gap-3 mb-2">
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

      <div
        className={`hidden md:block lg:block ${isActive ? "text-[#ffffff]" : "text-[#282828]"} ${textSize} text-lg font-semibold`}
      >
        {value}
      </div>

      <span
        className={`hidden md:block lg:block ${isActive ? "text-[#ffffff]" : "text-[#282828]"} ${textSize}`}
      >
        {label}
      </span>

      {/* MOBILE VIEW */}
      <div className="flex md:hidden lg:hidden items-center justify-start gap-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          {icon}
        </div>

        <div className="flex flex-col">
          <div
            className={`block md:hidden lg:hidden ${isActive ? "text-[#ffffff]" : "text-[#282828]"} ${textSize} text-[15px] font-bold leading-tight`}
          >
            {value}
          </div>

          <span
            className={`block md:hidden lg:hidden mt-0.5 ${isActive ? "text-[#ffffff]" : "text-[#515151]"} ${textSize} text-[11px] leading-tight`}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
