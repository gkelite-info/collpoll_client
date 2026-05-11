"use client";
import { useTranslations } from "next-intl";
import CalendarTimeTable from "./timetable";

interface CalendarRightProps {
  selectedDate: string;
  extraInfo: {
    quizzes: number;
    assignments: number;
    discussions: number;
  };
}

export default function CalendarRight({ selectedDate, extraInfo }: any) {
  const t = useTranslations("Calendar.student");
  return (
    <>
      <div className="bg-blue-00 h-full flex flex-col justify-start lg:gap-4 max-md:gap-0 w-full">
        <CalendarTimeTable
          selectedDate={selectedDate}
          height="lg:h-[580px] max-md:h-auto"
        />

        <div className="bg-white grid grid-cols-3 gap-2 lg:gap-3 rounded-lg shadow-md p-2 lg:p-3 max-md:mt-3">
          <div className="bg-pink-100 border border-pink-400 rounded-lg p-2 flex flex-col items-center justify-center text-center">
            <span className="text-2xl lg:text-3xl font-black text-black">
              {extraInfo?.quizzes || 0}
            </span>
            <span className="text-[10px] lg:text-lg font-bold text-pink-700 leading-tight">
              {t("Active")} <br /> {t("Quiz")}
            </span>
          </div>
          <div className="bg-blue-100 border border-blue-400 rounded-lg p-2 flex flex-col items-center justify-center text-center">
            <span className="text-2xl lg:text-3xl font-black text-black">
              {extraInfo?.assignments || 0}
            </span>
            <span className="text-[10px] lg:text-lg font-bold text-blue-700 leading-tight">
              {t("Active")} <br /> {t("Assignment")}
            </span>
          </div>
          <div className="bg-purple-100 border border-purple-400 rounded-lg p-2 flex flex-col items-center justify-center text-center">
            <span className="text-2xl lg:text-3xl font-black text-black">
              {extraInfo?.discussions || 0}
            </span>
            <span className="text-[10px] lg:text-lg font-bold text-purple-700 leading-tight">
              {t("Active")} <br /> {t("Discussion")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
