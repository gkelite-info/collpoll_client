"use client";
import { useState, useEffect, useCallback } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarToolbar from "./components/calenderToolbar";
import CalendarGrid from "./components/CalendarGrid";
import { getWeekDays } from "../../faculty/calendar/utils";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { Trash } from "@phosphor-icons/react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

import {
  fetchFinanceCalendarEvents,
  deactivateFinanceCalendarEvent,
} from "@/lib/helpers/finance/calendar/financeCalendarAPI";
import { fetchFinanceCalendarSectionsWithDetails } from "@/lib/helpers/finance/calendar/financeCalendarSectionsAPI";
import toast from "react-hot-toast";
import EventDetailsModal from "./components/eventDetailsModal";

export default function FinanceCalendarPage() {
  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { financeManagerId, loading: fmLoading } = useFinanceManager();
  const weekDays = getWeekDays(currentDate);

  const loadEvents = useCallback(async () => {
    if (fmLoading) return;
    if (!financeManagerId) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const createdBy = financeManagerId;
      const fetchedEvents = await fetchFinanceCalendarEvents(createdBy);

      const formattedEvents = await Promise.all(
        fetchedEvents.map(async (ev) => {
          const sections = await fetchFinanceCalendarSectionsWithDetails(
            ev.financeCalendarId,
          );
          let branch = "All",
            year = "All",
            section = "All";

          if (sections.length > 0) {
            const firstSec = sections[0] as any;

            const branchData = Array.isArray(firstSec.college_branch)
              ? firstSec.college_branch[0]
              : firstSec.college_branch;
            branch = branchData?.collegeBranchCode || "All";

            const yearData = Array.isArray(firstSec.college_academic_year)
              ? firstSec.college_academic_year[0]
              : firstSec.college_academic_year;
            year = yearData?.collegeAcademicYear || "All";

            const sectionList = sections
              .map((sec: any) => {
                const secData = Array.isArray(sec.college_sections)
                  ? sec.college_sections[0]
                  : sec.college_sections;
                return secData?.collegeSections;
              })
              .filter(Boolean);

            section = sectionList.length > 0 ? sectionList.join(", ") : "All";
          }

          return {
            id: ev.financeCalendarId.toString(),
            calendarEventId: ev.financeCalendarId,
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
            section,
          };
        }),
      );
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error loading calendar events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [financeManagerId, fmLoading]);

  useEffect(() => {
    loadEvents();
  }, [currentDate, loadEvents]);

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

  // DELETE LOGIC SEAMLESS
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      await deactivateFinanceCalendarEvent(eventToDelete.calendarEventId);

      toast.success("Event removed successfully");
      setDeleteSuccess(true);

      setTimeout(() => {
        setEventToDelete(null);
        setIsDeleting(false);
        setDeleteSuccess(false);
        loadEvents(); // SEAMLESS REFRESH
      }, 1500);
    } catch (err) {
      toast.error("Failed to delete event");
      setIsDeleting(false);
      setDeleteSuccess(false);
    }
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

      <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
        {isLoading || fmLoading ? (
          <div className="flex flex-col items-center justify-center h-[600px] lg:h-[700px] xl:h-[750px] 2xl:h-[850px] text-emerald-600 font-medium animate-pulse">
            <Loader />
          </div>
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
