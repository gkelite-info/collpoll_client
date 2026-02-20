"use client";

import { useState, useEffect } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarToolbar from "./components/calenderToolbar";
import CalendarGrid from "./components/CalendarGrid";
import { getWeekDays } from "../../faculty/calendar/utils";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { fetchFinanceCalendarEvents } from "@/lib/helpers/finance/calendar/financeCalendarAPI";
import { fetchFinanceCalendarSectionsWithDetails } from "@/lib/helpers/finance/calendar/financeCalendarSectionsAPI";

// 1. Import your custom hook (adjust the path to match your folder structure)

export default function FinanceCalendarPage() {
  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Destructure the ID and loading state from your context
  const { financeManagerId, loading: fmLoading } = useFinanceManager();

  const weekDays = getWeekDays(currentDate);

  useEffect(() => {
    const loadEvents = async () => {
      // 3. Prevent fetching if the context is still loading or if no user is found
      if (fmLoading) return;

      if (!financeManagerId) {
        setEvents([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 4. Use the dynamic ID from the logged-in user
        const createdBy = financeManagerId;
        const fetchedEvents = await fetchFinanceCalendarEvents(createdBy);

        const formattedEvents = await Promise.all(
          fetchedEvents.map(async (ev) => {
            const sections = await fetchFinanceCalendarSectionsWithDetails(
              ev.financeCalendarId,
            );

            let branch = "All";
            let year = "All";
            let section = "All";

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

              const sectionData = Array.isArray(firstSec.college_sections)
                ? firstSec.college_sections[0]
                : firstSec.college_sections;
              section = sectionData?.collegeSections || "All";
            }

            return {
              id: ev.financeCalendarId.toString(),
              calendarEventId: ev.financeCalendarId,
              title: ev.eventTitle,
              type: ev.eventTopic.toLowerCase() || "meeting",
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
    };

    loadEvents();
  }, [currentDate, financeManagerId, fmLoading]); // 5. Add context variables to the dependency array

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
    <main className="p-4">
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
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      <div className=" bg-white  shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {isLoading || fmLoading ? (
          <div className="flex items-center justify-center h-[400px] 2xl:h-[700px] text-gray-500 font-medium">
            Loading your schedule...
          </div>
        ) : (
          <CalendarGrid
            events={events}
            weekDays={weekDays}
            onEditRequest={(event) => {
              setIsModalOpen(true);
            }}
          />
        )}
      </div>
    </main>
  );
}
