// import Image from "next/image";
// import { ReactNode } from "react";

// interface NotificationBannerProps {
//     message: ReactNode;
//     imageSrc?: string;
//     imageAlt?: string;
//     className?: string;
// }

// export default function AiAttendanceNotificationBanner({
//     message,
//     imageSrc,
//     imageAlt = "Notification illustration",
//     className = "",
// }: NotificationBannerProps) {
//     return (
//         <div
//             style={{ background: "linear-gradient(90deg, #FBF5FD 0%, #CBB1FF 100%)" }}
//             className={`flex flex-col md:flex-row w-full items-center rounded-xl px-4 py-3 relative shadow-sm min-h-[80px] ${className}`}
//         >
//             {/* {imageSrc && ( */}
//             <div className="absolute lg:-bottom-2 left-4 z-10">
//                 <Image
//                     src='/ai-bot.png'
//                     alt={imageAlt}
//                     width={80}
//                     height={80}
//                     unoptimized={true}
//                     className="h-22 w-25 object-contain"
//                 />
//             </div>
//             {/* )} */}

//             <div className="lg:ml-30 lg:mt-2 text-sm font-medium text-[#4A329A] leading-relaxed relative z-20">
//                 {message}
//             </div>
//         </div>
//     );
// }

"use client";
import Image from "next/image";
import { ReactNode } from "react";

interface NotificationBannerProps {
  message: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export default function AiAttendanceNotificationBanner({
  message,
  imageAlt = "Notification illustration",
  className = "",
}: NotificationBannerProps) {
  return (
    <div
      style={{ background: "linear-gradient(90deg, #FBF5FD 0%, #CBB1FF 100%)" }}
      className={`flex flex-row w-full items-center rounded-xl px-4 py-3 relative shadow-sm min-h-[80px] ${className}`}
    >
      <div className="absolute -bottom-1 left-2 md:left-4 md:-bottom-2 z-10 shrink-0">
        <Image
          src="/ai-bot.png"
          alt={imageAlt}
          width={80}
          height={80}
          unoptimized={true}
          className="h-16 w-16 md:h-22 md:w-25 object-contain"
        />
      </div>

      <div className="ml-16 md:ml-28 lg:ml-32 text-xs md:text-sm font-medium text-[#4A329A] leading-relaxed relative z-20">
        {message}
      </div>
    </div>
  );
}
