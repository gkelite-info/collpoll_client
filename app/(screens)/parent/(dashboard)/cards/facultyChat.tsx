"use client";

import { ChatCircleDots } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

type SubjectProgressCard = {
  image: string;
  professor: string;
  subject: string;
};

type SubjectProgressCardProps = {
  props: SubjectProgressCard[];
};

const DefaultAvatarSmall = () => (
  <div className="h-10 w-10 lg:h-14 lg:w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
    <svg
      className="w-5 h-5 lg:w-7 lg:h-7"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

export default function FacultyChat({ props }: SubjectProgressCardProps) {
  const t = useTranslations("Dashboard.parent");

  return (
    <div className="bg-white h-full lg:h-64 rounded-lg w-full lg:w-[49%] p-4 shadow-md flex flex-col gap-2 min-h-[280px] lg:min-h-0">
      <div className="flex justify-between items-center mb-1 lg:mb-0">
        <h6 className="text-[#282828] font-semibold text-sm lg:text-base">
          {t("Faculty Chat")}
        </h6>
      </div>

      <div className="bg-red-00 flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar pr-1">
        {props.map((item, index) => (
          <div
            className="bg-[#E8F6E2] h-14 lg:h-16.75 rounded-full flex items-center px-2 py-1.5 lg:py-2 gap-2 shrink-0"
            key={index}
          >
            <div className="rounded-full flex items-center justify-center shrink-0">
              <DefaultAvatarSmall />
            </div>

            <div className="h-full flex-1 flex flex-col items-start justify-center min-w-0 pr-1">
              <p className="text-[#282828] font-medium text-[13px] lg:text-md truncate w-full">
                {t("Prof")} {item.professor}
              </p>
              <p className="text-[#282828] text-[10px] lg:text-sm truncate w-full">
                {item.subject}
              </p>
            </div>

            <div className="bg-[#A1D683] rounded-full h-10 w-10 lg:h-14 lg:w-14 flex items-center justify-center shrink-0">
              <ChatCircleDots
                size={24}
                className="lg:hidden text-white"
                weight="fill"
              />
              <ChatCircleDots
                size={32}
                className="hidden lg:block text-white"
                weight="fill"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
