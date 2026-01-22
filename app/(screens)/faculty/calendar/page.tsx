"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useEffect, useState } from "react";
import AddEventModal from "./components/addEventModal";
import CalendarHeader from "./components/calendarHeader";
import CalendarGrid from "./components/calenderGrid";
import CalendarToolbar from "./components/calenderToolbar";
import { CalendarEvent } from "./types";
import { combineDateAndTime, getWeekDays, hasTimeConflict } from "./utils";
import ConfirmConflictModal from "../../admin/calendar/components/ConfirmConflictModal";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { deleteCalendarEventByFaculty, fetchCalendarEventsByFaculty, updateCalendarEvent, upsertCalendarEvent } from "@/lib/helpers/calendar/calendarEvent";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";
import { getFacultyIdByUserId } from "@/lib/helpers/faculty/faculty";

export const extractValues = (
  items?: { name: string }[]
): string[] => {
  if (!Array.isArray(items)) return [];
  return items.map((i) => i.name);
};


export default function Page() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pendingEvent, setPendingEvent] = useState<any | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [degreeOptions, setDegreeOptions] = useState<any[]>([]);
  const weekDays = getWeekDays(currentDate);
  const { userId, role } = useUser();
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

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

  const loadCalendarEvents = async () => {
    if (!facultyId) return

    try {
      setLoading(true);
      const res = await fetchCalendarEventsByFaculty(facultyId);

      if (!res.success || !res.events) {
        toast.error("Failed to load calendar events");
        return;
      }

      const formattedEvents: CalendarEvent[] = res.events.map((row: any) => {
        const startTime = `${row.date}T${row.fromTime}`;
        const endTime = `${row.date}T${row.toTime}`;

        return {
          id: row.calendarEventId.toString(),
          title: row.eventTitle,
          type: row.type,
          day: new Date(row.date)
            .toLocaleDateString("en-US", { weekday: "short" })
            .toUpperCase(),
          startTime,
          endTime,
          rawFormData: {
            topic: row.eventTopic,
            roomNo: row.roomNo,
            degree: row.degree,
            departments: extractValues(row.department),
            sections: extractValues(row.section),
            semester: extractValues(row.semester)[0],
            year: row.year,
          },
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      toast.error("Failed to loadCalendarEvents");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!facultyId) return;

    loadCalendarEvents();
  }, [facultyId]);

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

  const handleSaveEvent = async (data: any) => {
    if (!facultyId) {
      toast.error("faculty profile not found");
      return;
    }

    const conflict = await hasDbConflict(
      data.date,
      data.startTime,
      data.endTime,
      editingEventId ? Number(editingEventId) : undefined
    );

    if (conflict) {
      setPendingEvent(data);
      setShowConflictModal(true);
      setIsModalOpen(false);
      return;
    }

    const safeYear =
      ["1", "2", "3", "4"].includes(String(data.year))
        ? String(data.year)
        : "";

    const payload = {
      facultyId,
      eventTitle: data.title,
      eventTopic: data.topic,
      type: data.type,
      date: data.date,
      roomNo: data.roomNo,
      fromTime: data.startTime,
      toTime: data.endTime,
      degree: data.degree,
      department: data.departments,
      // year: data.year?.toString() ?? "",
      // year: data.year ?? null,
      year: safeYear,
      semester: data.semester ? [data.semester] : [],
      section: data.sections,
    };

    const res = await upsertCalendarEvent(
      payload,
      editingEventId ? Number(editingEventId) : undefined
    );

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    const updatedEvent: CalendarEvent = {
      id: res.data.calendarEventId.toString(),
      title: data.title,
      type: data.type,
      day: new Date(data.date)
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      startTime: `${data.date}T${data.startTime}`,
      endTime: `${data.date}T${data.endTime}`,
      rawFormData: {
        roomNo: res.data.roomNo,
        topic: res.data.topic,
        degree: res.data.degree,
        year: res.data.year,
        departments: extractValues(res.data.department),
        sections: extractValues(res.data.section),
        semester: extractValues(res.data.semester)[0] ?? "",
      },
    };

    setEvents((prev) =>
      editingEventId
        ? prev.map((e) => (e.id === editingEventId ? updatedEvent : e))
        : [...prev, updatedEvent]
    );

    setEditingEventId(null);
    setEventForm(null);
    setIsModalOpen(false);
    toast.success(editingEventId ? "Event updated ✏️" : "Event created 🎉");
  };

  const handleConflictCancel = () => {
    setPendingEvent(null);
    setShowConflictModal(false);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!facultyId) return;

    const res = await deleteCalendarEventByFaculty(
      Number(eventId),
      facultyId
    )

    if (!res.success) {
      toast.error(res.error || "Failed to delete!!");
      return
    }

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    toast.success("Event deleted successfully");
  };

  const closeAddEventModal = () => {
    setIsModalOpen(false);
    setEventForm(null);
    setEditingEventId(null);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setFormMode("edit");

    const startDate = event.startTime.split("T")[0];
    const startTime = event.startTime.split("T")[1].slice(0, 5);
    const endTime = event.endTime.split("T")[1].slice(0, 5);

    setEventForm({
      title: event.title,
      topic: event.rawFormData?.topic ?? "",
      roomNo: event.rawFormData?.roomNo ?? "",
      degree: event.rawFormData?.degree ?? "",
      departments: event.rawFormData?.departments ?? [],
      sections: event.rawFormData?.sections ?? [],
      // year: event.rawFormData?.year ?? "",
      // year: event.year,
      year: String(event.rawFormData?.year ?? ""),
      semester: event.rawFormData?.semester ?? "",
      type: event.type,
      date: startDate,
      startTime,
      endTime,
    });

    setIsModalOpen(true);
  };

  const hasDbConflict = async (
    date: string,
    startTime: string,
    endTime: string,
    ignoreEventId?: number
  ): Promise<boolean> => {
    const res = await fetchCalendarEventsByFaculty(Number(facultyId));

    if (!res.success || !res.events) return false;

    return res.events.some((e: any) => {
      if (ignoreEventId && e.calendarEventId === ignoreEventId) {
        return false;
      }

      if (e.date !== date) return false;

      const dbStart = combineDateAndTime(e.date, e.fromTime);
      const dbEnd = combineDateAndTime(e.date, e.toTime);

      return hasTimeConflict(
        [{ startTime: dbStart, endTime: dbEnd } as CalendarEvent],
        combineDateAndTime(date, startTime),
        combineDateAndTime(date, endTime)
      );
    });
  }

  const confirmAddEvent = async () => {
    if (!pendingEvent) return;

    setShowConflictModal(false);
    setIsSaving(true);

    try {
      const payload = {
        facultyId: Number(facultyId),
        eventTitle: pendingEvent.title,
        eventTopic: String(pendingEvent.topic ?? ""),
        type: pendingEvent.type as "class" | "meeting" | "exam" | "quiz",
        date: pendingEvent.date,
        roomNo: pendingEvent.roomNo?.trim(),
        fromTime: pendingEvent.startTime,
        toTime: pendingEvent.endTime,
        degree: pendingEvent.degree,
        department: pendingEvent.departments,
        // year: pendingEvent.year?.toString() ?? "",
        // year: pendingEvent.year ?? null,
        year: String(pendingEvent.year ?? ""),
        semester: pendingEvent.semester,
        section: pendingEvent.sections,
      };

      if (editingEventId) {
        await updateCalendarEvent(Number(editingEventId), payload);
        toast.success("Event updated despite conflict.");
      } else {
        await upsertCalendarEvent(payload);
        toast.success("Event created despite conflict.");
      }

      await loadCalendarEvents();

      setEditingEventId(null);
      setEventForm(null);
      setFormMode("create");
      setIsModalOpen(false);
      setPendingEvent(null);

    } catch (err) {
      toast.error("Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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
            setFormMode("create");
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
          isSaving={isSaving}
          mode={formMode}
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

