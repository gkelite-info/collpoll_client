"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarToolbar from "./components/calenderToolbar";
import CalendarGrid from "./components/CalendarGrid";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";
import EventDetailsModal from "./components/eventDetailsModal";
import { Trash } from "@phosphor-icons/react";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  deactivateFinanceCalendarEvent,
  fetchFinanceCalendarEvents,
} from "@/lib/helpers/finance/calendar/financeCalendarAPI";
import {
  deactivateFinanceCalendarSection,
  fetchFinanceCalendarSections,
  fetchFinanceCalendarSectionsWithDetails,
} from "@/lib/helpers/finance/calendar/financeCalendarSectionsAPI";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { Loader } from "../../(student)/calendar/right/timetable";

type ManagerCalendarEvent = {
  id: string;
  calendarEventId: number;
  financeCalendarSectionId?: number;
  title: string;
  type: string;
  rawTopic: string;
  date: string;
  fromTime: string;
  toTime: string;
  startTime: string;
  endTime: string;
  branch: string;
  year: string;
  section: string;
};

type FinanceCalendarSectionDetails = {
  financeCalendarSectionId?: number;
  college_branch?:
  | { collegeBranchCode?: string }
  | { collegeBranchCode?: string }[]
  | null;
  college_academic_year?:
  | { collegeAcademicYear?: string }
  | { collegeAcademicYear?: string }[]
  | null;
  college_sections?:
  | { collegeSections?: string }
  | { collegeSections?: string }[]
  | null;
};

const CalendarShimmer = () => (
  <div className="h-[600px] lg:h-[700px] xl:h-[750px] 2xl:h-[850px] animate-pulse bg-white">
    <div className="flex min-h-[60px] border-b border-gray-200">
      <div className="w-20 min-w-20 border-r border-gray-200 p-3">
        <div className="h-8 rounded bg-gray-200" />
      </div>
      <div className="grid flex-1 grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-center border-r border-gray-200 p-4 last:border-r-0"
          >
            <div className="h-4 w-14 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex min-h-[720px]">
      <div className="w-20 min-w-20 border-r border-gray-200">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-[120px] border-b border-gray-100 p-3">
            <div className="mx-auto h-3 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-6">
        {Array.from({ length: 6 }).map((_, columnIndex) => (
          <div key={columnIndex} className="relative border-r border-gray-100 last:border-r-0">
            <div className="absolute left-3 right-3 top-10 h-36 rounded bg-gray-200" />
            {columnIndex % 2 === 0 && (
              <div className="absolute left-3 right-3 top-64 h-28 rounded bg-gray-100" />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const getWeekDays = (startDate: Date) => {
  const days = [];
  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Find the Monday of the week
  const monday = new Date(startDate);
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

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const activeMainTab = tabQuery === "Holidays" ? "Holidays" : "Academics";

  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] =
    useState<ManagerCalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] =
    useState<ManagerCalendarEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [eventToDelete, setEventToDelete] =
    useState<ManagerCalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ManagerCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const { financeManagerId, loading: fmLoading } = useFinanceManager();
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

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const loadEvents = useCallback(async () => {
    if (fmLoading) return;
    if (!financeManagerId) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const fetchedEvents = await fetchFinanceCalendarEvents(financeManagerId);

      const eventGroups = await Promise.all(
        fetchedEvents.map(async (ev): Promise<ManagerCalendarEvent[]> => {
          const sections = await fetchFinanceCalendarSectionsWithDetails(
            ev.financeCalendarId,
          );
          let branch = "All";
          let year = "All";
          let section = "All";

          if (sections.length > 0) {
            const firstSec = sections[0] as FinanceCalendarSectionDetails;

            const branchData = Array.isArray(firstSec.college_branch)
              ? firstSec.college_branch[0]
              : firstSec.college_branch;
            branch = branchData?.collegeBranchCode || "All";

            const yearData = Array.isArray(firstSec.college_academic_year)
              ? firstSec.college_academic_year[0]
              : firstSec.college_academic_year;
            year = yearData?.collegeAcademicYear || "All";

            const secData = Array.isArray(firstSec.college_sections)
              ? firstSec.college_sections[0]
              : firstSec.college_sections;
            section = secData?.collegeSections || "All";
          }

          const createEvent = (
            sectionName: string,
            financeCalendarSectionId?: number,
          ): ManagerCalendarEvent => ({
            id: financeCalendarSectionId
              ? `${ev.financeCalendarId}-${financeCalendarSectionId}`
              : ev.financeCalendarId.toString(),
            calendarEventId: ev.financeCalendarId,
            financeCalendarSectionId,
            title: ev.eventTitle,
            type: ev.eventTopic.toLowerCase() || "meeting",
            rawTopic: ev.eventTopic,
            date: ev.date,
            fromTime: ev.fromTime,
            toTime: ev.toTime,
            startTime: `${ev.date}T${ev.fromTime}`,
            endTime: `${ev.date}T${ev.toTime}`,
            branch,
            year,
            section: sectionName,
          });

          if (sections.length === 0) {
            return [createEvent(section)];
          }

          return sections.map((sec: FinanceCalendarSectionDetails, index) => {
            const secData = Array.isArray(sec.college_sections)
              ? sec.college_sections[0]
              : sec.college_sections;

            return createEvent(
              secData?.collegeSections || `Section ${index + 1}`,
              sec.financeCalendarSectionId,
            );
          });
        }),
      );

      setEvents(eventGroups.flat());
    } catch (error) {
      console.error("Error loading calendar events:", error);
      toast.error("Failed to load calendar events");
    } finally {
      setIsLoading(false);
    }
  }, [financeManagerId, fmLoading]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      const result = eventToDelete.financeCalendarSectionId
        ? await deactivateFinanceCalendarSection(
          eventToDelete.financeCalendarSectionId,
        )
        : await deactivateFinanceCalendarEvent(eventToDelete.calendarEventId);

      if (!result.success) {
        throw new Error("Failed to delete event");
      }

      if (eventToDelete.financeCalendarSectionId) {
        const remainingSections = await fetchFinanceCalendarSections(
          eventToDelete.calendarEventId,
        );

        if (remainingSections.length === 0) {
          await deactivateFinanceCalendarEvent(eventToDelete.calendarEventId);
        }
      }

      toast.success("Event removed successfully");
      setDeleteSuccess(true);

      setTimeout(() => {
        setEventToDelete(null);
        setIsDeleting(false);
        setDeleteSuccess(false);
        loadEvents();
      }, 1000);
    } catch {
      toast.error("Failed to delete event");
      setIsDeleting(false);
      setDeleteSuccess(false);
    }
  };

  return (
    <main className="p-2 relative">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">
            {activeMainTab === "Holidays" ? "Holiday Calendar" : "Calendar Overview"}
          </h1>
          <p className="text-black text-sm">
            {activeMainTab === "Holidays"
              ? "View the complete holiday schedule for the academic year."
              : "Stay organized and on track with your personalised calendar"}
          </p>
        </div>
        <CourseScheduleCard style="w-[320px]" isVisibile={false} />
      </section>

      <div className="flex gap-3 mb-5 mt-2">
        <button
          onClick={() => router.push("/finance/calendar")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Academics" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Academics Calendar
        </button>
        <button
          onClick={() => router.push("/finance/calendar?tab=Holidays")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Holiday Calendar
        </button>
      </div>

      {activeMainTab === "Holidays" ? (
        <div>
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
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4">
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
          </div>

          <AddEventModal
            isOpen={isModalOpen}
            editData={eventToEdit}
            onSuccess={loadEvents}
            onClose={() => {
              setIsModalOpen(false);
              setEventToEdit(null);
            }}
          />

          <div className="w-full h-[80vh] bg-[#f3f4f6] text-gray-800 mt-4">
            {isLoading || fmLoading ? (
              <CalendarShimmer />
            ) : (
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
            )}
          </div>
        </>
      )}

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
                disabled={isDeleting || deleteSuccess}
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting || deleteSuccess}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-sm cursor-pointer disabled:bg-red-400"
              >
                {deleteSuccess
                  ? "Deleted"
                  : isDeleting
                    ? "Deleting..."
                    : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function FinanceManagerCalendarPage() {
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
