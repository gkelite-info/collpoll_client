"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useEffect, useState } from "react";
import { CALENDAR_EVENTS } from "./calenderData";
import AddEventModal from "./components/addEventModal";
import CalendarHeader from "./components/calendarHeader";
import CalendarGrid from "./components/calenderGrid";
import CalendarToolbar from "./components/calenderToolbar";
import { CalendarEvent } from "./types";
import {
  combineDateAndTime,
  getWeekDays,
  hasTimeConflict,
} from "./utils";
import ConfirmConflictModal from "../../admin/calendar/components/ConfirmConflictModal";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { upsertCalendarEvent } from "@/lib/helpers/calendar/calendarEvent";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";
import { getFacultyIdByUserId } from "@/lib/helpers/faculty/faculty";

export default function Page() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pendingEvent, setPendingEvent] = useState<CalendarEvent | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [degreeOptions, setDegreeOptions] = useState<any[]>([]);
  const weekDays = getWeekDays(currentDate);
  const { userId, role } = useUser();
  const [facultyId, setFacultyId] = useState<number | null>(null);

  useEffect(() => {
    if (!userId || role !== "Faculty") return;

    const loadFacultyId = async () => {
      try {
        const id = await getFacultyIdByUserId(userId);
        setFacultyId(id);
      } catch (err) {
        toast.error("Faculty record not found");
        console.error("FACULTY LOOKUP FAILED", err);
      }
    };

    loadFacultyId();
  }, [userId, role]);

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

  useEffect(() => {
    const loadDegrees = async () => {
      try {
        const data = await fetchCollegeDegrees();
        setDegreeOptions(data);
      } catch (err) {
        toast.error("LOAD DEGREES FAILED");
        console.error("LOAD DEGREES FAILED", err);
      }
    };

    loadDegrees();
  }, []);



  // const handleSaveEvent = (data: any) => {
  //   const start = combineDateAndTime(data.date, data.startTime);
  //   const end = combineDateAndTime(data.date, data.endTime);

  //   if (editingEventId) {
  //     setEvents((prev) =>
  //       prev.map((e) =>
  //         e.id === editingEventId
  //           ? {
  //             ...e,
  //             title: data.title,
  //             type: data.type,
  //             startTime: start,
  //             endTime: end,
  //             day: new Date(data.date)
  //               .toLocaleDateString("en-US", { weekday: "short" })
  //               .toUpperCase(),
  //             rawFormData: data,
  //           }
  //           : e
  //       )
  //     );

  //     setEditingEventId(null);
  //     setEventForm(null);
  //     setIsModalOpen(false);
  //     return;
  //   }

  //   const newEvent: CalendarEvent = {
  //     id: crypto.randomUUID(),
  //     title: data.title,
  //     type: data.type,
  //     day: new Date(data.date)
  //       .toLocaleDateString("en-US", { weekday: "short" })
  //       .toUpperCase(),
  //     startTime: start,
  //     endTime: end,
  //     rawFormData: data,
  //   };

  //   // const sameDayEvents = events.filter((e) =>
  //   //   e.startTime.startsWith(data.date)
  //   // );
  //   const sameDayEvents = events.filter(
  //     (e) =>
  //       e.startTime.startsWith(data.date) &&
  //       e.id !== editingEventId
  //   );

  //   setEventForm(data);

  //   if (hasTimeConflict(sameDayEvents, start, end)) {
  //     setPendingEvent(newEvent);
  //     setShowConflictModal(true);
  //     setIsModalOpen(false);
  //     return;
  //   }

  //   setEvents((prev) => [...prev, newEvent]);
  //   setEventForm(null);
  //   setIsModalOpen(false);
  // };

  const handleSaveEvent = async (data: any) => {
    try {
      if (!facultyId) {
        toast.error("faculty profile not found");
        return;
      }
      const start = combineDateAndTime(data.date, data.startTime);
      const end = combineDateAndTime(data.date, data.endTime);

      const payload = {
        facultyId: facultyId,
        eventTitle: data.title,
        eventTopic: data.topic,
        type: data.type,
        date: data.date,
        roomNo: data.roomNo,
        fromTime: data.startTime,
        toTime: data.endTime,
        degree: data.degree,
        department: data.departments,
        year: data.year?.toString() ?? "",
        semester: Array.isArray(data.semester)
          ? data.semester
          : data.semester
            ? [data.semester]
            : [],
        section: data.sections,
      };

      const res = await upsertCalendarEvent(payload);

      if (!res.success) {
        toast.error(res.error || "Failed to save event");
        return;
      }

      const newEvent: CalendarEvent = {
        id: res.data.calendarEventId,
        title: data.title,
        type: data.type,
        day: new Date(data.date)
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        startTime: start,
        endTime: end,
        rawFormData: data,
      };

      setEvents((prev) => [...prev, newEvent]);
      setIsModalOpen(false);
      toast.success("Event saved successfully 🎉");
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const confirmAddEvent = () => {
    if (pendingEvent) {
      setEvents((prev) => [...prev, pendingEvent]);
    }
    setPendingEvent(null);
    setShowConflictModal(false);
  };


  const handleConflictCancel = () => {
    setPendingEvent(null);
    setShowConflictModal(false);
    setIsModalOpen(true);
  };


  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };


  const closeAddEventModal = () => {
    setIsModalOpen(false);
    setEventForm(null);
    setEditingEventId(null);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEventId(event.id);

    const startDate = event.startTime.split("T")[0];
    const startTime = event.startTime.split("T")[1].slice(0, 5);
    const endTime = event.endTime.split("T")[1].slice(0, 5);

    setEventForm({
      title: event.title,
      topic: event.rawFormData?.topic ?? "",
      roomNo: event.rawFormData?.roomNo ?? "",
      departments: event.rawFormData?.departments ?? [],
      sections: event.rawFormData?.sections ?? [],
      year: event.rawFormData?.year ?? null,
      semester: event.rawFormData?.semester ?? "",
      type: event.type,
      date: startDate,
      startTime,
      endTime,
    });

    setIsModalOpen(true);
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

      <div className="flex justify-between">
        <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CalendarHeader
          onAddClick={() => {
            setEditingEventId(null);
            setEventForm(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <div className="w-full min-h-screen bg-[#f3f4f6] text-gray-800">
        <CalendarGrid
          events={events}
          weekDays={weekDays}
          activeTab={activeTab}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onDeleteRequest={setEventToDelete}
          onEditRequest={handleEditEvent}
        />

        <AddEventModal
          isOpen={isModalOpen}
          value={eventForm}
          initialData={eventForm}
          onClose={closeAddEventModal}
          onSave={handleSaveEvent}
          degreeOptions={degreeOptions}
        />

        <ConfirmConflictModal
          open={showConflictModal}
          onConfirm={confirmAddEvent}
          onCancel={handleConflictCancel}
        />

        <ConfirmDeleteModal
          open={!!eventToDelete}
          onCancel={() => setEventToDelete(null)}
          onConfirm={() => {
            if (eventToDelete) {
              handleDeleteEvent(eventToDelete.id);
            }
            setEventToDelete(null);
          }}
        />
      </div>
    </main>
  );
}

