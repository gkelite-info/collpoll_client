/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CaretLeft } from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarGrid from "./calenderGrid";
import CalendarHeader from "./calendarHeader";
import CalendarToolbar from "./calenderToolbar";
import { CalendarEvent } from "../types";
import { getWeekDays } from "../utils";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";
import { useUser } from "@/app/utils/context/UserContext";
import CalendarGridShimmer from "@/app/utils/shimmers/CalendarGridShimmer";

import { useAdminCalendarEvents } from "../hooks/useAdminCalendarEvents";
import { useAdminCalendarModals } from "../hooks/useAdminCalendarModals";
import AdminCalendarModals from "./AdminCalendarModals";

interface Props {
  faculty: {
    name: string;
    id: string;
    employeeId: string;
    branch: string;
    year?: string;
  };
  onBack: () => void;
}

export default function CalendarView({ faculty, onBack }: Props) {
  const [activeTab, setActiveTab] = useState("All");
  const [currentDate, setCurrentDate] = useState(new Date());

  const { collegeId } = useUser();
  const weekDays = getWeekDays(currentDate);

  const { events, isLoadingEvents, isSchool, loadEvents } = useAdminCalendarEvents(faculty, currentDate);

  const modalsState = useAdminCalendarModals(
    { id: faculty.id },
    collegeId,
    loadEvents
  );

  const { data: degreeOptions = [] } = useQuery({
    queryKey: ["collegeDegrees"],
    queryFn: fetchCollegeDegrees,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

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
    <main>
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-black flex items-center">
            <CaretLeft
              size={23}
              onClick={onBack}
              className="cursor-pointer -ml-1.5 shrink-0"
            />{" "}
            Calendar & Events
          </h1>
          <p className="text-sm text-[#282828] mt-1 flex flex-wrap items-center gap-x-1">
            <span>Viewing Calendar for faculty:</span>
            <span className="font-semibold">{faculty.name}</span>
            <span
              className="inline-block max-w-[150px] sm:max-w-[250px] md:max-w-[400px] truncate align-bottom"
              title={isSchool ? (faculty.year || "—") : faculty.branch}
            >
              ({isSchool ? (faculty.year || "—") : faculty.branch})
            </span>
            <span className="font-semibold whitespace-nowrap">
              facultyId - {faculty.employeeId}
            </span>
          </p>
        </div>
        <CourseScheduleCard
          style="hidden md:flex lg:flex w-[320px]"
          department={faculty.branch}
          year={faculty.year}
          isVisibile={false}
        />
      </section>

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4">
        <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CalendarHeader
          currentDate={currentDate}
          onMonthYearChange={(month, year) => {
            setCurrentDate(new Date(year, month, 1));
          }}
          onAddClick={() => {
            modalsState.setEditingEventId(null);
            modalsState.setEventForm(null);
            modalsState.setFormMode("create");
            modalsState.setIsModalOpen(true);
          }}
        />
      </div>

      {isLoadingEvents ? (
        <CalendarGridShimmer />
      ) : (
        <CalendarGrid
          events={events}
          weekDays={weekDays}
          activeTab={activeTab}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onDeleteRequest={modalsState.setEventToDelete}
          onEditRequest={modalsState.handleEditEvent}
          onEventClick={(event) => {
            modalsState.setSelectedEvent(event);
            modalsState.setShowDetails(true);
          }}
          isSchool={isSchool}
        />
      )}

      <AdminCalendarModals
        {...modalsState}
        degreeOptions={degreeOptions}
        isSchool={isSchool}
        facultyId={faculty.id}
      />
    </main>
  );
}
