"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AddEventModal from "./components/AddEventModal";
import CalendarGrid from "./components/calendarGrid";
import CalendarHeader from "./components/calendarHeader";
import CalendarToolbar from "./components/calendarToolbar";
import EventDetailsModal from "./modal/EventDetailsModal";
import type { CalendarEvent, WeekDay } from "./types";
import { useUser } from "@/app/utils/context/UserContext";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { Loader } from "../../(student)/calendar/right/timetable";

const getWeekDays = (baseDate: Date): WeekDay[] => {
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);

    return {
      label: date
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      date: date.getDate(),
      fullDate: date.toISOString().split("T")[0],
    };
  });
};

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const activeMainTab = tabQuery === "Holidays" ? "Holidays" : "Academics";

  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 14));

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
    if (activeMainTab === "Holidays") {
      loadHolidays();
    }
  }, [activeMainTab, loadHolidays, holidayYear, collegeId]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const weekDays = getWeekDays(currentDate);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleMonthYearChange = (month: number, year: number) => {
    setCurrentDate((previousDate) => {
      const nextDate = new Date(previousDate);
      nextDate.setFullYear(year);
      nextDate.setMonth(month);
      return nextDate;
    });
  };

  return (
    <main className="min-h-full bg-[#F4F4F4] p-2">
      <section className="mb-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">
            {activeMainTab === "Holidays" ? "Holiday Calendar" : "Academic Calendar"}
          </h1>
          <p className="mt-2 text-sm text-black">
            {activeMainTab === "Holidays"
              ? "View the complete holiday schedule for the academic year."
              : "Stay organized and on track with your personalised calendar"}
          </p>
        </div>

        <CourseScheduleCard style="w-[300px]" isVisibile={false} />
      </section>

      <div className="flex gap-3 mb-5 mt-2">
        <button
          onClick={() => router.push("/wellbeing-executive/calendar")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Academics" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Academic Calendar
        </button>
        <button
          onClick={() => router.push("/wellbeing-executive/calendar?tab=Holidays")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Holiday Calendar
        </button>
      </div>

      {activeMainTab === "Holidays" ? (
        <div>
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
        <>
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4">
            <CalendarToolbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentDate={currentDate}
              onMonthYearChange={handleMonthYearChange}
            />
            <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
          </div>

          <div className="w-full h-[80vh] bg-[#f3f4f6] text-gray-800 mt-4">
            <CalendarGrid
              weekDays={weekDays}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setShowDetails(true);
              }}
            />
          </div>
        </>
      )}

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EventDetailsModal
        open={showDetails}
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false);
          setSelectedEvent(null);
        }}
      />
    </main>
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
