"use client";

import { useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Trash } from "@phosphor-icons/react";
import CalendarToolbar from "./components/calenderToolbar";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";
import CalendarGrid from "./components/CalenderGrid";
import EventDetailsModal from "./components/eventDetailsModal";

export default function FinanceCalendarPage() {
  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<any>(null);

 const weekDays = [
  { day: "MON", date: 18, fullDate: "2026-02-18" },
  { day: "TUE", date: 19, fullDate: "2026-02-19" },
  { day: "WED", date: 20, fullDate: "2026-02-20" },
  { day: "THU", date: 21, fullDate: "2026-02-21" },
  { day: "FRI", date: 22, fullDate: "2026-02-22" },
  { day: "SAT", date: 23, fullDate: "2026-02-23" },
];
 
  const [events] = useState([
    {
      id: "1",
      calendarEventId: 1,
      title: "Faculty Meeting",
      type: "meeting",
      rawTopic: "Meeting",
      date: "2026-02-18",
      fromTime: "09:00",
      toTime: "10:00",
      startTime: "2026-02-18T09:00:00",
      endTime: "2026-02-18T10:00:00",
      branch: "CSE",
      year: "3",
      section: "A",
    },
    {
      id: "2",
      calendarEventId: 2,
      title: "Data Structures Class",
      type: "class",
      rawTopic: "Class",
      date: "2026-02-19",
      fromTime: "11:00",
      toTime: "12:30",
      startTime: "2026-02-19T11:00:00",
      endTime: "2026-02-19T12:30:00",
      branch: "CSE",
      year: "2",
      section: "B",
    },
    {
      id: "3",
      calendarEventId: 3,
      title: "Mid Term Exam",
      type: "exam",
      rawTopic: "Exam",
      date: "2026-02-20",
      fromTime: "10:00",
      toTime: "12:00",
      startTime: "2026-02-20T10:00:00",
      endTime: "2026-02-20T12:00:00",
      branch: "ECE",
      year: "3",
      section: "A",
    },
    {
      id: "4",
      calendarEventId: 4,
      title: "Java Quiz",
      type: "quiz",
      rawTopic: "Quiz",
      date: "2026-02-21",
      fromTime: "14:00",
      toTime: "15:00",
      startTime: "2026-02-21T14:00:00",
      endTime: "2026-02-21T15:00:00",
      branch: "IT",
      year: "1",
      section: "C",
    },
  ]);

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
          onClose={() => {
            setIsModalOpen(false);
            setEventToEdit(null);
          }}
        />
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden rounded-lg">
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
                onClick={() => setEventToDelete(null)}
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