"use client";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";

export default function ParentHolidayCalendarPage() {
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
    loadHolidays();
  }, [loadHolidays, holidayYear, collegeId]);

  return (
    <div className="bg-red-00 p-2 flex flex-col lg:pb-5 w-full max-md:p-3 max-md:bg-[#f4f5f6] min-h-screen">
      <div className="flex justify-between items-center bg-indigo-00">
        <div className="flex flex-col w-[50%] h-[100%] bg-green-00 max-lg:w-full">
          <h1 className="text-[#282828] font-bold text-2xl mb-1 max-md:text-[22px]">
            Holiday Calendar
          </h1>
          <p className="text-[#282828] text-sm max-md:hidden">
            View the complete holiday schedule for the academic year.
          </p>
        </div>
      </div>

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
    </div>
  );
}
