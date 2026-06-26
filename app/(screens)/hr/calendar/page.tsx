"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Trash, CircleNotch } from "@phosphor-icons/react";
import CalendarToolbar from "./components/calenderToolbar";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";
import CalendarGrid from "./components/CalenderGrid";
import EventDetailsModal from "./components/eventDetailsModal";
import HolidayCalendar from "./components/HolidayCalendar";
import AddHolidayModal from "./components/AddHolidayModal";
import HolidayCalendarShimmer from "./components/HolidayCalendarShimmer";

import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  deactivateHrCalendarEvent,
  fetchHrCalendarEvents,
} from "@/lib/helpers/Hr/calendar/hrCalendarEventsAPI";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { Loader } from "../../(student)/calendar/right/timetable";

const convertTo24Hour = (time12h: string) => {
  const [time, modifier] = time12h.split(" ");
  let hours = time.split(":")[0];
  const minutes = time.split(":")[1];
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, "0")}:${minutes}:00`;
};

export default function FinanceCalendarPage() {
  return (
    <Suspense fallback={<div className="p-4"><Loader /></div>}>
      <FinanceCalendarPageContent />
    </Suspense>
  );
}

function FinanceCalendarPageContent() {
  const { collegeId, loading: ctxLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabQuery = searchParams.get("tab");
  const initialTab = tabQuery === "Holidays" ? "Holidays" : "All Scheduled";
  
  const [activeTab, setActiveTabState] = useState(initialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const [isFetchingEvents, setIsFetchingEvents] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Holidays State
  const [holidays, setHolidays] = useState<CollegeHoliday[]>([]);
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());
  const [holidayToEdit, setHolidayToEdit] = useState<CollegeHoliday | null>(null);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);

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
    if (activeTab === "Holidays") {
      loadHolidays();
    }
  }, [activeTab, loadHolidays, holidayYear, collegeId]);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
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
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
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
      <div className="flex flex-col gap-4 mb-1">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-black text-xl font-semibold">
              Calendar & Events
            </h1>
            <p className="text-black text-sm">
              Stay organized and on track with your personalised calendar
            </p>
          </div>
          <div className="hidden md:block w-[140px]">
            <CourseScheduleCard style="w-full" isVisibile={false} fullWidth={true} />
          </div>
        </section>

        <div className="flex md:hidden justify-between items-center w-full">
          <div>
            {activeTab === "Holidays" ? (
              <CalendarHeader onAddClick={() => setIsAddHolidayModalOpen(true)} />
            ) : (
              <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
            )}
          </div>
          <div className="w-[140px]">
            <CourseScheduleCard style="w-full" isVisibile={false} fullWidth={true} />
          </div>
        </div>

        <div className="flex justify-between items-center w-full">
          <div className="w-full md:w-auto overflow-x-auto">
            <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="hidden md:block">
            {activeTab === "Holidays" ? (
              <CalendarHeader onAddClick={() => setIsAddHolidayModalOpen(true)} />
            ) : (
              <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
            )}
          </div>
        </div>
      </div>
        <AddEventModal
          isOpen={isModalOpen}
          editData={eventToEdit}
          events={events}
          onSuccess={loadEvents}
          onClose={() => {
            setIsModalOpen(false);
            setEventToEdit(null);
          }}
        />
        <AddHolidayModal
          isOpen={isAddHolidayModalOpen}
          onClose={() => {
            setIsAddHolidayModalOpen(false);
            setHolidayToEdit(null);
          }}
          onSuccess={loadHolidays}
          year={holidayYear}
          editData={holidayToEdit}
        />
      {activeTab === "Holidays" ? (
        (isFetchingHolidays || ctxLoading) ? (
          <HolidayCalendarShimmer />
        ) : (
          <HolidayCalendar
            holidays={holidays}
            year={holidayYear}
            setYear={setHolidayYear}
            onRefresh={loadHolidays}
            onEditRequest={(holiday) => {
              setHolidayToEdit(holiday);
              setIsAddHolidayModalOpen(true);
            }}
          />
        )
      ) : (
        <div className="relative bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden rounded-lg">
          {(ctxLoading || isFetchingEvents || (activeTab === "Holidays" && isFetchingHolidays)) && (
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
      )}

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
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-sm cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <CircleNotch
                      size={18}
                      weight="bold"
                      className="animate-spin mr-2"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
