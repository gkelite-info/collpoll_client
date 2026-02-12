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

import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";
import { getFacultyIdByUserId } from "@/lib/helpers/faculty/faculty";
import {
  deleteCalendarEvent,
  fetchCalendarEvents,
  saveCalendarEvent,
} from "@/lib/helpers/calendar/calendarEventAPI";
import {
  deleteCalendarEventSections,
  fetchCalendarEventSections,
  saveCalendarEventSections,
} from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import EventDetailsModal from "./modal/EventDetailsModal";
import { Loader } from "../../(student)/calendar/right/timetable";

export type CalendarEventPayload = {
  facultyId: number;
  subjectId: number | null;


  eventTitle: string;
  eventTopic: number | null;
  type: "class" | "meeting" | "exam" | "quiz";

  date: string;
  fromTime: string;
  toTime: string;
  roomNo: string;
  meetingLink?: string | null;

  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  sectionIds: number[];
};

export default function Page() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [pendingEvent, setPendingEvent] = useState<CalendarEventPayload | null>(
    null,
  );
  const [showConflictModal, setShowConflictModal] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [degreeOptions, setDegreeOptions] = useState<any[]>([]);
  const { userId, role, collegeId } = useUser();
  const [facultyId, setFacultyId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const weekDays = getWeekDays(currentDate);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
    if (!facultyId) return;

    try {
      setLoading(true);

      const rows = await fetchCalendarEvents({ facultyId });
      if (!rows || rows.length === 0) {
        setEvents([]);
        return;
      }

      const firstEventSections = await fetchCalendarEventSections(
        rows[0].calendarEventId
      );

      if (!firstEventSections || firstEventSections.length === 0) {
        setEvents([]);
        return;
      }

      const educationId = firstEventSections[0].collegeEducationId;
      const branchId = firstEventSections[0].collegeBranchId;
      const academicYearId = firstEventSections[0].collegeAcademicYearId;

      const branches = await fetchAcademicDropdowns({
        type: "branch",
        collegeId: collegeId!,
        educationId,
      });

      const academicYears = await fetchAcademicDropdowns({
        type: "academicYear",
        collegeId: collegeId!,
        educationId,
        branchId,
      });

      const allSections = await fetchAcademicDropdowns({
        type: "section",
        collegeId: collegeId!,
        educationId,
        branchId,
        academicYearId,
      });

      const branchMap = new Map<number, string>(
        branches.map((b: any) => [
          b.collegeBranchId,
          b.collegeBranchCode,
        ])
      );

      const yearMap = new Map<number, string>(
        academicYears.map((y: any) => [
          y.collegeAcademicYearId,
          y.collegeAcademicYear,
        ])
      );

      const sectionNameMap = new Map<number, string>(
        allSections.map((s: any) => [
          s.collegeSectionsId,
          s.collegeSections,
        ])
      );

      const sectionMap = new Map<number, number[]>();

      await Promise.all(
        rows.map(async (row: any) => {
          const sections = await fetchCalendarEventSections(row.calendarEventId);
          sectionMap.set(
            row.calendarEventId,
            (sections ?? []).map((s: any) => s.collegeSectionId)
          );
        })
      );

      const expandedEvents: CalendarEvent[] = [];

      rows.forEach((row: any) => {
        const startTime = `${row.date}T${row.fromTime}`;
        const endTime = `${row.date}T${row.toTime}`;

        const sectionIds = sectionMap.get(row.calendarEventId) ?? [];

        sectionIds.forEach((sectionId) => {
          expandedEvents.push({
            id: `${row.calendarEventId}-${sectionId}`,

            title:
              row.type === "meeting"
                ? "Meeting"
                : row.college_subject_unit_topics?.topicTitle ??
                row.college_subject_unit_topics?.[0]?.topicTitle ??
                "",

            type: row.type,
            subjectName: row.college_subjects?.subjectName ?? "-",
            subjectKey: row.college_subjects?.subjectKey ?? "",

            day: new Date(row.date)
              .toLocaleDateString("en-US", { weekday: "short" })
              .toUpperCase(),

            startTime,
            endTime,

            branch: branchMap.get(branchId) ?? "",
            year: yearMap.get(academicYearId) ?? "",
            section: sectionNameMap.get(sectionId) ?? "",

            calendarEventId: row.calendarEventId,

            rawFormData: {
              topicId: row.eventTopic,
              roomNo: row.roomNo,
            },
          });
        });
      });

      setEvents(expandedEvents);
    } catch (error) {
      console.error("❌ Failed to load calendar events", error);
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!facultyId) return;
    loadCalendarEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId]);

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

  const hasDbConflict = async (
    date: string,
    startTime: string,
    endTime: string,
    ignoreEventId?: number,
  ): Promise<boolean> => {
    if (!facultyId) return false;

    const rows = await fetchCalendarEvents({ facultyId });
    if (!rows || rows.length === 0) return false;

    return rows.some((e: any) => {
      if (ignoreEventId && e.calendarEventId === ignoreEventId) return false;
      if (e.date !== date) return false;

      const dbStart = combineDateAndTime(e.date, e.fromTime);
      const dbEnd = combineDateAndTime(e.date, e.toTime);

      return hasTimeConflict(
        [{ startTime: dbStart, endTime: dbEnd } as CalendarEvent],
        combineDateAndTime(date, startTime),
        combineDateAndTime(date, endTime),
      );
    });
  };

  const handleSaveEvent = async (payload: CalendarEventPayload) => {
    if (!facultyId) {
      toast.error("Faculty not found");
      return;
    }

    const conflict = await hasDbConflict(
      payload.date,
      payload.fromTime,
      payload.toTime,
      editingEventId ? Number(editingEventId) : undefined,
    );

    if (conflict) {
      setPendingEvent(payload);
      setShowConflictModal(true);
      setIsModalOpen(false);
      return;
    }

    setIsSaving(true);

    try {
      const eventRes = await saveCalendarEvent({
        calendarEventId: editingEventId ? Number(editingEventId) : undefined, // 🔥 THIS LINE
        facultyId,
        subjectId: payload.type === "meeting" ? null : payload.subjectId ?? null,
        eventTopic: payload.eventTopic,
        type: payload.type,
        date: payload.date,
        roomNo: payload.roomNo,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        meetingLink: payload.meetingLink ?? null,
      });

      if (!eventRes.success) {
        toast.error("Failed to save event");
        return;
      }

      const calendarEventId = eventRes.calendarEventId;

      if (editingEventId) {
        await deleteCalendarEventSections(Number(editingEventId));
      }

      await saveCalendarEventSections(calendarEventId, {
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSemesterId: payload.collegeSemesterId,
        sectionIds: payload.sectionIds,
      });

      toast.success(editingEventId ? "Event updated ✏️" : "Event created 🎉");

      setIsModalOpen(false);
      setEditingEventId(null);
      setEventForm(null);
      setFormMode("create");

      await loadCalendarEvents();
    } catch (err) {
      console.error("handleSaveEvent failed", err);
      toast.error("Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConflictCancel = () => {
    setPendingEvent(null);
    setShowConflictModal(false);
    setIsModalOpen(true);
  };

  const confirmAddEvent = async () => {
    if (!pendingEvent || !facultyId) return;

    setShowConflictModal(false);
    setIsSaving(true);

    try {
      const eventRes = await saveCalendarEvent({
        facultyId,
        subjectId:
          pendingEvent.type === "meeting"
            ? null
            : pendingEvent.subjectId ?? null,
        eventTopic: pendingEvent.eventTopic,
        type: pendingEvent.type,
        date: pendingEvent.date,
        roomNo: pendingEvent.roomNo,
        fromTime: pendingEvent.fromTime,
        toTime: pendingEvent.toTime,
        meetingLink: pendingEvent.meetingLink ?? null,
      });

      if (!eventRes.success) {
        toast.error("Failed to save event");
        return;
      }

      const calendarEventId = eventRes.calendarEventId;

      if (editingEventId) {
        await deleteCalendarEventSections(Number(editingEventId));
      }

      await saveCalendarEventSections(calendarEventId, {
        collegeEducationId: pendingEvent.collegeEducationId,
        collegeBranchId: pendingEvent.collegeBranchId,
        collegeAcademicYearId: pendingEvent.collegeAcademicYearId,
        collegeSemesterId: pendingEvent.collegeSemesterId,
        sectionIds: pendingEvent.sectionIds,
      });

      toast.success("Event saved despite conflict ⚠️");

      setPendingEvent(null);
      setIsModalOpen(false);
      setEditingEventId(null);
      setEventForm(null);
      setFormMode("create");

      await loadCalendarEvents();
    } catch (err) {
      console.error("confirmAddEvent error", err);
      toast.error("Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendarEventSections(Number(eventId));
      await deleteCalendarEvent(Number(eventId));

      setEvents((prev: CalendarEvent[]) => prev.filter((e) => e.id !== eventId));
      toast.success("Event deleted successfully");
    } catch (err) {
      toast.error("Failed to delete event");
      console.error(err);
    }
  };

  const closeAddEventModal = () => {
    setIsModalOpen(false);
    setEventForm(null);
    setEditingEventId(null);
    setFormMode("create");
  };

  const parse24To12 = (time24: string) => {
    const [hStr, mStr] = time24.split(":");
    let h = Number(hStr);
    const minute = mStr;

    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;

    return {
      hour: String(h).padStart(2, "0"),
      minute,
      period,
    };
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    setEditingEventId(String(event.calendarEventId));
    setFormMode("edit");

    const startDate = event.startTime.split("T")[0];
    const start24 = event.startTime.split("T")[1].slice(0, 5);
    const end24 = event.endTime.split("T")[1].slice(0, 5);

    const start = parse24To12(start24);
    const end = parse24To12(end24);

    let dbSectionIds: number[] = [];
    try {
      const rows = await fetchCalendarEventSections(event.calendarEventId);
      dbSectionIds = (rows ?? []).map(
        (r: any) => r.collegeSectionId
      );
    } catch (err) {
      console.warn("⚠️ Sections fetch failed", err);
    }

    setEventForm({
      title: event.title ?? "",
      topicId: event.rawFormData?.topicId ?? null,
      roomNo: event.rawFormData?.roomNo ?? "",

      date: startDate,

      startHour: start.hour,
      startMinute: start.minute,
      startPeriod: start.period,

      endHour: end.hour,
      endMinute: end.minute,
      endPeriod: end.period,

      sectionIds: dbSectionIds,

      type: event.type,
    });

    setIsModalOpen(true);
  };

  return (
    <main className="p-4">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">Calendar & Events</h1>
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
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen bg-[#f3f4f6] text-gray-800">
          <CalendarGrid
            events={events}
            weekDays={weekDays}
            activeTab={activeTab}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onDeleteRequest={setEventToDelete}
            onEditRequest={handleEditEvent}
            onEventClick={
              (event) => {
                setSelectedEvent(event);
                setShowDetails(true);
              }
            }
          />

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
              if (eventToDelete) handleDeleteEvent(eventToDelete.id);
              setEventToDelete(null);
            }}
          />
        </div>
      )
      }

    </main >
  );
}