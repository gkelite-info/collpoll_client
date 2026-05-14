"use client";

import { useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AddEventModal from "./components/AddEventModal";
import CalendarGrid from "./components/calendarGrid";
import CalendarHeader from "./components/calendarHeader";
import CalendarToolbar from "./components/calendarToolbar";
import EventDetailsModal from "./modal/EventDetailsModal";
import type { CalendarEvent, WeekDay } from "./types";

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

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 14));
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

  return (
    <main className="min-h-full bg-[#F4F4F4] p-2 md:p-4">
      <section className="mb-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">
            Calendar & Events
          </h1>
          <p className="mt-2 text-sm text-black">
            Stay organized and on track with your personalised calendar
          </p>
        </div>

        <CourseScheduleCard style="w-[240px]" isVisibile={false} />
      </section>

      <div className="-mt-1 flex items-end justify-between">
        <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
      </div>

      <CalendarGrid
        weekDays={weekDays}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onEventClick={(event) => {
          setSelectedEvent(event);
          setShowDetails(true);
        }}
      />

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
