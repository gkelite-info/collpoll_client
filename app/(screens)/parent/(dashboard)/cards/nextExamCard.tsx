"use client";

import { Books, Calendar } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

type NextExamProps = {
  date: string;
  subject: string;
};

export default function NextExamCard({ date, subject }: NextExamProps) {
  const t = useTranslations("Dashboard.parent");

  return (
    <div className="bg-white h-[180px] lg:h-[200px] w-full lg:w-[32%] rounded-lg p-2.5 lg:p-2 flex flex-col gap-2 shadow-md">
      <div className="w-full lg:w-[85%] h-[20%] flex items-center justify-start lg:justify-between gap-2">
        <div className="bg-[#F9EFDE] rounded-lg p-1.5 lg:p-1 shrink-0">
          <Books
            className="w-4 h-4 lg:w-[22px] lg:h-[22px]"
            weight="fill"
            color="#E6BD71"
          />
        </div>
        <h4 className="text-[13px] lg:text-lg font-medium text-[#282828] truncate">
          {t("Next Exam Date")}
        </h4>
      </div>

      <div className="bg-yellow-00 w-full h-[80%] flex flex-col items-center justify-center gap-3 lg:gap-4">
        <div className="bg-[#EBF6E4] w-[95%] lg:w-[70%] h-[55%] lg:h-[60%] rounded-lg flex flex-col items-center justify-center gap-1.5 lg:gap-2 p-1.5 shadow-sm border border-[#A2D884]/20">
          <div className="bg-[#A2D884] rounded-full h-8 w-8 lg:h-9 lg:w-9 flex items-center justify-center shrink-0">
            <Calendar className="w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] text-white" />
          </div>
          <p className="text-[#16284F] font-medium text-[10px] lg:text-sm truncate w-full text-center">
            {t("Date :")}{" "}
            <span className="text-[#A2D884] font-medium ml-0.5">
              {date || t("NA")}
            </span>
          </p>
        </div>
        <div className="bg-red-00 w-full text-center px-1">
          <p className="text-[#16284F] font-medium text-[10px] lg:text-xs truncate">
            {t("Subject -")}{" "}
            <span className="text-[#604DDC] font-medium ml-0.5">
              {subject || t("NA")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
