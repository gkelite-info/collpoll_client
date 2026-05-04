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
  <div className="lg:h-14 lg:w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

export default function FacultyChat({ props }: SubjectProgressCardProps) {
  const t = useTranslations("Dashboard.parent"); // Hook
  return (
    <>
      <div className="bg-white h-64 rounded-lg w-[49%] p-4 shadow-md flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h6 className="text-[#282828] font-semibold">{t("Faculty Chat")}</h6>
        </div>
        <div className="bg-red-00 flex flex-col gap-2 overflow-y-auto">
          {props.map((item, index) => (
            <div
              className="bg-[#E8F6E2] lg:h-16.75 rounded-full flex items-center px-2 py-2 gap-1"
              key={index}
            >
              <div className="rounded-full lg:h-14 lg:w-14 flex items-center justify-center">
                <DefaultAvatarSmall />
              </div>
              <div className="h-full lg:w-[60%] flex flex-col items-start justify-center pl-1">
                <p className="text-[#282828] font-medium text-md">
                  {t("Prof")} {item.professor}
                </p>
                <p className="text-[#282828] text-sm">{item.subject}</p>
              </div>
              <div className="bg-[#A1D683] rounded-full lg:h-14 lg:w-14 flex items-center justify-center">
                <ChatCircleDots
                  size={32}
                  weight="fill"
                  className="text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
