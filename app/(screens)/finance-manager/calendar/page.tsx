"use client";
import { useState, useMemo } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarToolbar from "./components/calenderToolbar";
import CalendarGrid from "./components/CalendarGrid";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";
import EventDetailsModal from "./components/eventDetailsModal";
import { STATIC_CALENDAR_EVENTS } from "./financeManagerCalendarData";
import { Trash } from "@phosphor-icons/react";

const getWeekDays = (startDate: Date) => {
  const days = [];
  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Find the Monday of the week
  let monday = new Date(startDate);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday
  monday.setDate(diff);

  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    const fullDate = date.toISOString().split("T")[0];

    days.push({
      day: dayNames[i],
      date: date.getDate(),
      fullDate,
    });
  }

  return days;
};

export default function FinanceManagerCalendarPage() {
  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 16));

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const events = STATIC_CALENDAR_EVENTS;

  // WEEK NAVIGATION CARROTS
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
    <main className="p-4 relative">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">
            Calendar & Events
          </h1>
          <p className="text-black text-sm">
            Stay organized and on track with your personalised calendar
          </p>
        </div>
        <CourseScheduleCard style="w-[320px]" />
      </section>

      <div className="flex justify-between items-center">
        <CalendarToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentDate={currentDate}
          onMonthYearChange={(month, year) => {
            const updated = new Date(currentDate);
            updated.setMonth(month);
            updated.setFullYear(year);
            setCurrentDate(updated);
          }}
        />
        <CalendarHeader onAddClick={() => setIsModalOpen(true)} />

        <AddEventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
        <CalendarGrid
          events={events}
          weekDays={weekDays}
          activeTab={activeTab}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onDeleteRequest={(event) => setEventToDelete(event)}
          onEventClick={(event) => {
            setSelectedEvent(event);
            setShowDetails(true);
          }}
        />
      </div>

      {/* EVENT DETAILS MODAL */}
      <EventDetailsModal
        open={showDetails}
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false);
          setSelectedEvent(null);
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-[400px] rounded-xl flex flex-col p-6 text-center shadow-2xl">
            <div className="mx-auto bg-red-100 rounded-full p-3 mb-4">
              <Trash size={32} className="text-red-600" weight="fill" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Event
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {eventToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEventToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
