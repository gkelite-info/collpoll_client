"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useState } from "react";
import { CALENDAR_EVENTS } from "./calenderData";
import AddEventModal from "./components/addEventModal";
import CalendarHeader from "./components/calendarHeader";
import CalendarGrid from "./components/calenderGrid";
import CalendarToolbar from "./components/calenderToolbar";
import { CalendarEvent } from "./types";
import { combineDateAndTime, getWeekDays } from "./utils";

export default function Page() {
  // 💡 STATE: Set initial tab to "All" to match filter logic
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State: The list of ALL events (unfiltered)
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);

  // State: The currently viewed date (defaults to today)
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate the 5 days for the grid based on currentDate
  const weekDays = getWeekDays(currentDate);

  // --- Week Navigation Handlers ---

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

  // --- Event Handler ---

  const handleSaveEvent = (data: any) => {
    // 1. Convert the raw strings from Modal into ISO strings
    const startISO = combineDateAndTime(data.date, data.startTime);
    const endISO = combineDateAndTime(data.date, data.endTime);

    // 2. Create the event object
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      type: data.type,
      day: new Date(data.date)
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      startTime: startISO,
      endTime: endISO,
    };

    // 3. Add to state
    setEvents([...events, newEvent]);

    // 4. Jump to the date of the new event
    setCurrentDate(new Date(data.date));
  };

  return (
    <main className="p-4">
      <section className="flex justify-between items-center mb-4">
        <div className="flex items-start justify-center">
          <div>
            <div className="flex">
              <h1 className="text-black text-xl font-semibold">
                Calendar & Events
              </h1>
            </div>
            <p className="text-black text-sm">
              Stay Organized And On Track With Your Personalised Calendar
            </p>
          </div>
        </div>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>
      <div className="flex justify-between">
        {/* Pass activeTab and setActiveTab to the Toolbar */}
        <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
      </div>

      <div className="w-full min-h-screen bg-[#f3f4f6] text-gray-800">
        <CalendarGrid
          events={events} // Pass the UNFILTERED list
          weekDays={weekDays}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          activeTab={activeTab} // Pass the active filter state
        />

        <AddEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
        />
      </div>
    </main>
  );
}
