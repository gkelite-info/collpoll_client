"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarRight from "./right/page";
import CalendarLeft from "./left/page";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@/app/utils/context/UserContext";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { Loader } from "./right/timetable";

function PageContent() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [extraInfo, setExtraInfo] = useState({
    quizzes: 0,
    assignments: 0,
    discussions: 0,
  });

  const t = useTranslations("Calendar.student");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const activeTab = tabQuery === "Holidays" ? "Holidays" : "Academics";

  const { collegeId } = useUser();
  const [holidays, setHolidays] = useState<CollegeHoliday[]>([]);
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);

  const loadHolidays = useCallback(async () => {
    if (!collegeId) return;
    setIsFetchingHolidays(true);
    try {
      const data = await fetchCollegeHolidays(collegeId, holidayYear);
      setHolidays(data || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setIsFetchingHolidays(false);
    }
  }, [collegeId, holidayYear]);

  useEffect(() => {
    if (activeTab === "Holidays") {
      loadHolidays();
    }
  }, [activeTab, loadHolidays, holidayYear, collegeId]);

  return (
    <>
      <div className="bg-red-00 p-2 flex flex-col lg:pb-5 w-full max-md:p-3 max-md:bg-[#f4f5f6] min-h-screen">
        <div className="flex justify-between items-center bg-indigo-00">
          <div className="flex flex-col w-[50%] h-[100%] bg-green-00 max-lg:w-full">
            <h1 className="text-[#282828] font-bold text-2xl mb-1 max-md:text-[22px]">
              {activeTab === "Holidays" ? "Holiday Calendar" : t("Calendar")}
            </h1>
            <p className="text-[#282828] text-sm max-md:hidden">
              {activeTab === "Holidays"
                ? "View the complete holiday schedule for the academic year."
                : t("Stay organized and keep track of your weekly schedule with ease")}
            </p>
          </div>
          <div className="flex justify-end w-[32%] bg-yellow-00 max-lg:hidden">
            <CourseScheduleCard style="w-[320px]" />
          </div>
        </div>

        <div className="flex gap-3 mt-4 mb-2">
          <button
            onClick={() => router.push("/calendar")}
            className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeTab === "Academics" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Academic Schedule
          </button>
          <button
            onClick={() => router.push("/calendar?tab=Holidays")}
            className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Holiday Calendar
          </button>
        </div>

        {activeTab === "Holidays" ? (
          <div className="mt-3 w-full">
            {isFetchingHolidays ? (
              <HolidayCalendarShimmer />
            ) : (
              <HolidayCalendar
                holidays={holidays}
                year={holidayYear}
                setYear={setHolidayYear}
                onRefresh={loadHolidays}
                readOnly={true}
              />
            )}
          </div>
        ) : (
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
        )}
      </div>
    </>
  );
}

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6]">
          <Loader />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
