"use client";

import { useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

import EventDetailsModal from "./modal/EventDetailsModal";
import ConfirmConflictModal from "../../admin/calendar/components/ConfirmConflictModal";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";
import CalendarToolbar from "./components/calendarToolbar";
import CalendarHeader from "./components/calendarHeader";
import CalendarGrid from "./components/calendarGrid";
import AddEventModal from "./components/AddEventModal";

// --- STATIC MOCK DATA ---
const MOCK_EVENTS = [
  {
    id: "1",
    calendarEventId: 101,
    title: "Class 10 Principles",
    type: "class",
    subjectName: "Design Theory",
    startTime: "2026-02-23T09:00:00",
    endTime: "2026-02-23T10:30:00",
    branch: "CSE",
    year: "3rd Year",
    section: "A",
    rawFormData: { roomNo: "101", topicId: 1 }
  }
];

export default function Page() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>(MOCK_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal & Event State
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // --- HANDLERS ---
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

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Static Save Logic
  const handleSaveEvent = (payload: any) => {
    // In static mode, we trigger the conflict modal just to show the UI
    if (payload.eventTitle?.toLowerCase().includes("conflict")) {
      setShowConflictModal(true);
      setIsModalOpen(false);
    } else {
      console.log("Saving Event:", payload);
      setIsModalOpen(false);
    }
  };

  return (
    <main className="p-4 bg-[#f3f4f6] min-h-screen">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">Calendar & Events</h1>
          <p className="text-black text-sm">Stay Organized And On Track With Your Personalised Calendar</p>
        </div>
        <CourseScheduleCard style="w-[320px]" isVisibile={false} />
      </section>

      <div className="flex justify-between">
        <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CalendarHeader
          onAddClick={() => {
            setFormMode("create");
            setEventForm(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <div className="w-full mt-2">
        <CalendarGrid
          events={events}
          activeTab={activeTab}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onDeleteRequest={setEventToDelete}
          onEditRequest={(event: any) => {
            setFormMode("edit");
            setEventForm(event.rawFormData);
            setIsModalOpen(true);
          }}
          onEventClick={(event: any) => {
            setSelectedEvent(event);
            setShowDetails(true);
          }}
        />
      </div>

      {/* --- ALL MODALS (STATIC VERSION) --- */}

      <EventDetailsModal
        open={showDetails}
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false);
          setSelectedEvent(null);
        }}
      />

      <AddEventModal
        isOpen={isModalOpen}
        initialData={eventForm}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        mode={formMode}
        isSaving={false}
      />

      <ConfirmConflictModal
        open={showConflictModal}
        onConfirm={() => setShowConflictModal(false)}
        onCancel={() => {
          setShowConflictModal(false);
          setIsModalOpen(true);
        }}
      />

      <ConfirmDeleteModal
        open={!!eventToDelete}
        onCancel={() => setEventToDelete(null)}
        onConfirm={() => {
          if (eventToDelete) handleDeleteEvent(eventToDelete.id);
          setEventToDelete(null);
        }}
      />
    </main>
  );
}