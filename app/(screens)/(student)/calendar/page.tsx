"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarRight from "./right/page";
import CalendarLeft from "./left/page";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [extraInfo, setExtraInfo] = useState({
    quizzes: 0,
    assignments: 0,
    discussions: 0,
  });

  const t = useTranslations("Calendar.student");

  return (
    <>
      <div className="bg-red-00 p-2 flex flex-col lg:pb-5 w-full max-md:p-3 max-md:bg-[#f4f5f6] min-h-screen">
        <div className="flex justify-between items-center bg-indigo-00">
          <div className="flex flex-col w-[50%] h-[100%] bg-green-00 max-lg:w-full">
            <h1 className="text-[#282828] font-bold text-2xl mb-1 max-md:text-[22px]">
              {t("Calendar")}
            </h1>
            <p className="text-[#282828] text-sm max-md:hidden">
              {t(
                "Stay organized and keep track of your weekly schedule with ease",
              )}
            </p>
          </div>
          <div className="flex justify-end w-[32%] bg-yellow-00 max-lg:hidden">
            <CourseScheduleCard style="w-[320px]" />
          </div>
        </div>

        <div className="mt-5 gap-4 flex w-full max-lg:flex-col max-md:mt-3 pb-7">
          <div className="lg:w-[42%] max-lg:w-full">
            <CalendarLeft
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
              setExtraInfo={setExtraInfo}
            />
          </div>
          <div className="lg:w-[58%] max-lg:w-full">
            <CalendarRight selectedDate={selectedDate} extraInfo={extraInfo} />
          </div>
        </div>
      </div>
    </>
  );
}
