"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

import EventDetailsModal from "./modal/EventDetailsModal";
import ConfirmConflictModal from "../../admin/calendar/components/ConfirmConflictModal";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";
import CalendarToolbar from "./components/calendarToolbar";
import CalendarHeader from "./components/calendarHeader";
import CalendarGrid from "./components/calendarGrid";
import AddEventModal from "./components/AddEventModal";
import WipOverlay from "@/app/utils/WipOverlay";
import { useUser } from "@/app/utils/context/UserContext";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { Loader } from "../../(student)/calendar/right/timetable";

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

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const activeMainTab = tabQuery === "Holidays" ? "Holidays" : "Academics";

  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>(MOCK_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());

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
      setIsModalOpen(false);
    }
  };

  return (
    <main className="relative overflow-hidden p-4 bg-[#f3f4f6] min-h-screen">
      {/* <WipOverlay fullHeight={true} /> */}
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">Calendar & Events</h1>
          <p className="text-black text-sm">Stay organized and on track with your personalised calendar</p>
        </div>
        <CourseScheduleCard style="w-[320px]" isVisibile={false} />
      </section>

      <div className="flex gap-3 mb-5 mt-2">
        <button
          onClick={() => router.push("/wellbeing-manager/calendar")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Academics" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Academics Calendar
        </button>
        <button
          onClick={() => router.push("/wellbeing-manager/calendar?tab=Holidays")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Holiday Calendar
        </button>
      </div>

      {activeMainTab === "Holidays" ? (
        <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative rounded-xl p-4">
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
        </>
      )}

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

export default function Page() {
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