"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import CalendarGridShimmer from "@/app/utils/shimmers/CalendarGridShimmer";
import CalendarHeader from "./components/calendarHeader";
import CalendarGrid from "./components/calenderGrid";
import CalendarToolbar from "./components/calenderToolbar";
import { getWeekDays } from "./utils";

import { useUser } from "@/app/utils/context/UserContext";
import { getFacultyIdByUserId } from "@/lib/helpers/faculty/facultyAPI";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays } from "@/lib/helpers/Hr/holidays/holidayAPI";

import { useFacultyCalendarEvents } from "./hooks/useFacultyCalendarEvents";
import { useFacultyCalendarModals } from "./hooks/useFacultyCalendarModals";
import FacultyCalendarModals from "./components/FacultyCalendarModals";

export type CalendarEventPayload = {
  facultyId: number;
  subjectId: number | null;
  eventTitle: string;
  eventTopic: number | null;
  eventUnitIds?: number[];
  type: "class" | "meeting" | "exam" | "quiz";
  date: string;
  fromTime: string;
  toTime: string;
  roomNo: string;
  collegeRoomId?: number | null;
  meetingLink?: string | null;
  meetingId?: string | null;
  meetingPassword?: string | null;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  sectionIds: number[];
  calendarMode?: "single" | "bulk";
  fromDate?: string;
  toDate?: string;
};

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const activeMainTab = tabQuery === "Holidays" ? "Holidays" : "Academics";

  const { userId, role, collegeId, loading: userLoading } = useUser();
  const { data: facultyId, isLoading: isFacultyIdLoading } = useQuery({
    queryKey: ["facultyId", userId],
    queryFn: async () => {
      try {
        return await getFacultyIdByUserId(userId!);
      } catch (err) {
        toast.error("Faculty record not found");
        console.error("FACULTY LOOKUP FAILED", err);
        return null;
      }
    },
    enabled: !!userId && role === "Faculty" && !userLoading,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const [activeTab, setActiveTab] = useState("All");
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [degreeOptions, setDegreeOptions] = useState<any[]>([]);

  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());

  const { data: holidaysData, isLoading: isFetchingHolidays, refetch: refetchHolidays } = useQuery({
    queryKey: ["collegeHolidays", collegeId, holidayYear],
    queryFn: async () => {
      if (!collegeId) return [];
      const data = await fetchCollegeHolidays(collegeId, holidayYear);
      return data || [];
    },
    enabled: !!collegeId && activeMainTab === "Holidays",
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const holidays = holidaysData || [];

  const { events, isLoading } = useFacultyCalendarEvents(
    facultyId,
    collegeId,
    currentMonth,
    currentYear,
    activeTab
  );

  const modalsState = useFacultyCalendarModals(facultyId, collegeId);

  const weekDays = getWeekDays(currentDate);

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  return (
    <main className="p-1.5 md:p-2.5 lg:p-4">
      <section className="bg-indigo-00 flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">
            {activeMainTab === "Holidays" ? "Holiday Calendar" : "Calendar & Events"}
          </h1>
          <p className="text-black text-sm">
            {activeMainTab === "Holidays"
              ? "View the complete holiday schedule for the academic year."
              : "Stay organized and on track with your personalised calendar"}
          </p>
        </div>

        <CourseScheduleCard style="w-[320px] hidden md:flex lg:flex" />
      </section>

      <div className="flex gap-3 mb-5">
        <button
          onClick={() => router.push("/faculty/calendar")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Academics" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Academics Calendar
        </button>
        <button
          onClick={() => router.push("/faculty/calendar?tab=Holidays")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Holiday Calendar
        </button>
      </div>

      {activeMainTab === "Holidays" ? (
        isFetchingHolidays || userLoading ? (
          <HolidayCalendarShimmer />
        ) : (
          <HolidayCalendar
            holidays={holidays}
            year={holidayYear}
            setYear={setHolidayYear}
            onRefresh={() => refetchHolidays()}
            readOnly={true}
          />
        )
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4">
            <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <CalendarHeader
              currentDate={currentDate}
              onMonthYearChange={(month, year) => {
                setCurrentDate(new Date(year, month, 1));
              }}
              onAddClick={() => {
                modalsState.setEditingEventId(null);
                modalsState.setFormMode("create");
                modalsState.setEventForm(null);
                modalsState.setIsModalOpen(true);
              }}
            />
          </div>

          <div className="w-full h-[80vh] bg-[#f3f4f6] text-gray-800">
            {isLoading || isFacultyIdLoading || userLoading ? (
              <CalendarGridShimmer />
            ) : (
              <>
                <CalendarGrid
                  events={events}
                  weekDays={weekDays}
                  activeTab={activeTab}
                  onPrevWeek={handlePrevWeek}
                  onNextWeek={handleNextWeek}
                  onDeleteRequest={(event) => modalsState.setEventToDelete(event)}
                  onEditRequest={(event) => modalsState.handleEditEvent(event)}
                  onEventClick={(event) => {
                    modalsState.setSelectedEvent(event);
                    modalsState.setShowDetails(true);
                  }}
                />

                <FacultyCalendarModals
                  {...modalsState}
                  degreeOptions={degreeOptions}
                />
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="p-1.5 md:p-2.5 lg:p-4">
          <section className="bg-indigo-00 flex justify-between items-center mb-4">
            <div>
              <h1 className="text-black text-xl font-semibold">Calendar & Events</h1>
              <p className="text-black text-sm">Stay organized and on track with your personalised calendar</p>
            </div>
          </section>

          <div className="flex gap-3 mb-5">
            <button className="px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm bg-[#43C17A] text-white">
              Academics Calendar
            </button>
            <button className="px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm bg-white text-gray-600 border border-gray-200">
              Holiday Calendar
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4 animate-pulse">
            <div className="w-64 h-10 bg-gray-200 rounded-xl" />
            <div className="w-72 h-10 bg-gray-200 rounded-xl" />
          </div>

          <div className="w-full h-[80vh] bg-[#f3f4f6] text-gray-800">
            <CalendarGridShimmer />
          </div>
        </main>
      }
    >
      <PageContent />
    </Suspense>
  );
}
