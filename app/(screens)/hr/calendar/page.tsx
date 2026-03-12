"use client";

import { useState, useEffect, useMemo } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Trash, CircleNotch } from "@phosphor-icons/react"; // NEW: Imported CircleNotch for the spinner
import CalendarToolbar from "./components/calenderToolbar";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";
import CalendarGrid from "./components/CalenderGrid";
import EventDetailsModal from "./components/eventDetailsModal";

import toast from "react-hot-toast";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import {
  deactivateHrCalendarEvent,
  fetchHrCalendarEvents,
} from "@/lib/helpers/Hr/calendar/hrCalendarEventsAPI";
import { Loader } from "../../(student)/calendar/right/timetable";

const convertTo24Hour = (time12h: string) => {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, "0")}:${minutes}:00`;
};

export default function FinanceCalendarPage() {
  const { collegeId, loading: ctxLoading } = useCollegeHr();

  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const [isFetchingEvents, setIsFetchingEvents] = useState(true);

  const weekDays = useMemo(() => {
    const week = [];
    const current = new Date(currentDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        date: d.getDate(),
        fullDate: d.toISOString().split("T")[0],
      });
    }
    return week;
  }, [currentDate]);

  const loadEvents = async () => {
    if (!collegeId) return;

    setIsFetchingEvents(true);

    try {
      const dbEvents = await fetchHrCalendarEvents(collegeId);
      const formatted = dbEvents.map((e) => ({
        ...e,
        id: String(e.hrCalendarEventId),
        calendarEventId: e.hrCalendarEventId,
        type: e.role,
        startTime: `${e.eventDate}T${convertTo24Hour(e.fromTime)}`,
        endTime: `${e.eventDate}T${convertTo24Hour(e.toTime)}`,
      }));
      setEvents(formatted);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setIsFetchingEvents(false);
    }
  };

  useEffect(() => {
    if (!ctxLoading) loadEvents();
  }, [collegeId, ctxLoading]);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    const res = await deactivateHrCalendarEvent(
      eventToDelete.hrCalendarEventId,
    );
    if (res.success) {
      toast.success("Event deleted");
      setEventToDelete(null);
      loadEvents();
    } else {
      toast.error("Failed to delete event");
    }
  };

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
            Stay Organized And On Track With Your Personalised Calendar
          </p>
        </div>
        <CourseScheduleCard style="w-[320px]" />
      </section>

      <div className="flex justify-between items-center">
        <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
        <AddEventModal
          isOpen={isModalOpen}
          editData={eventToEdit}
          onSuccess={loadEvents}
          onClose={() => {
            setIsModalOpen(false);
            setEventToEdit(null);
          }}
        />
      </div>

      <div className="relative bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden rounded-lg">
        {(ctxLoading || isFetchingEvents) && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <Loader />
            <span className="text-sm font-medium text-gray-600">
              Loading events...
            </span>
          </div>
        )}

        <CalendarGrid
          events={events}
          weekDays={weekDays}
          activeTab={activeTab}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onEditRequest={(event) => {
            setEventToEdit(event);
            setIsModalOpen(true);
          }}
          onDeleteRequest={(event) => setEventToDelete(event)}
          onEventClick={(event) => {
            setSelectedEvent(event);
            setShowDetails(true);
          }}
        />
      </div>

      <EventDetailsModal
        open={showDetails}
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false);
          setSelectedEvent(null);
        }}
      />

      {eventToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
              ?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
