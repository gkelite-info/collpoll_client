"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmConflictModal from "../../admin/calendar/components/ConfirmConflictModal";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";
import AddEventModal from "./components/addEventModal";
import CalendarHeader from "./components/calendarHeader";
import CalendarGrid from "./components/calenderGrid";
import CalendarToolbar from "./components/calenderToolbar";
import { CalendarEvent } from "./types";
import { getWeekDays } from "./utils";

import { useUser } from "@/app/utils/context/UserContext";
import {
  deleteCalendarEvent,
  fetchCalendarEvents,
  notifyStudentsOfEvent,
  saveCalendarEvent,
} from "@/lib/helpers/calendar/calendarEventAPI";
import {
  fetchCalendarEventSections,
  saveCalendarEventSections,
  softDeleteCalendarEventSection,
} from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import {
  saveBulkCalendarEvent,
  saveBulkCalendarEventSections,
  saveBulkCalendarEventUnits,
  fetchBulkCalendarEvents,
  fetchBulkCalendarEventSections,
  fetchBulkCalendarEventUnits,
  softDeleteBulkCalendarEventSection,
  deleteBulkCalendarEvent,
} from "@/lib/helpers/calendar/bulkCalendarEventAPI";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { getFacultyIdByUserId } from "@/lib/helpers/faculty/facultyAPI";
import { Loader } from "../../(student)/calendar/right/timetable";
import EventDetailsModal from "./modal/EventDetailsModal";
import { fetchHrCalendarEvents } from "@/lib/helpers/Hr/calendar/hrCalendarEventsAPI";
import {
  checkSectionConflict,
  ConflictingSection,
} from "@/lib/helpers/calendar/checkSectionConflict";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { fetchFacultyContextAdmin } from "@/app/utils/context/faculty/facultyContextAPI";

export type CalendarEventPayload = {
  facultyId: number;
  subjectId: number | null;

  eventTitle: string;
  eventTopic: number | null;
  eventUnitIds?: number[];
  type: "class" | "meeting" | "exam" | "quiz";

  date: string;
  fromTime: string;
  toTime: string;
  roomNo: string;
  collegeRoomId?: number | null;
  meetingLink?: string | null;
  meetingId?: string | null;
  meetingPassword?: string | null;

  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  sectionIds: number[];

  calendarMode?: "single" | "bulk";
  fromDate?: string;
  toDate?: string;
};

const convertTo24Hour = (time12h: string) => {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, "0")}:${minutes}:00`;
};

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const activeMainTab = tabQuery === "Holidays" ? "Holidays" : "Academics";

  const [hrEvents, setHrEvents] = useState<CalendarEvent[]>([]);

  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const fetchIdRef = useRef(0);
  const [pendingEvent, setPendingEvent] = useState<CalendarEventPayload | null>(
    null,
  );
  const [showConflictModal, setShowConflictModal] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null,
  );
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [degreeOptions, setDegreeOptions] = useState<any[]>([]);
  const { userId, role, collegeId } = useUser();
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [conflictDetails, setConflictDetails] = useState<ConflictingSection[]>(
    [],
  );

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const weekDays = getWeekDays(currentDate);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

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

  const loadHrEvents = async () => {
    if (!collegeId) return;
    try {
      const data = await fetchHrCalendarEvents(collegeId);
      const mappedEvents: CalendarEvent[] = data.map((e: any) => ({
        id: `hr-${e.hrCalendarEventId}`,
        calendarEventId: e.hrCalendarEventId,
        sectionId: 0,
        type: "meeting",
        startTime: `${e.eventDate}T${convertTo24Hour(e.fromTime)}`,
        endTime: `${e.eventDate}T${convertTo24Hour(e.toTime)}`,
        title: e.title,
        subjectName: e.topic,
        day: new Date(e.eventDate)
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        rawFormData: {
          roomNo: e.roomNo,
          topicId: null,
        },
      }));
      setHrEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to load HR events", err);
    }
  };

  const loadCalendarEvents = async (month: number, year: number) => {
    if (!facultyId) return;
    const currentFetchId = ++fetchIdRef.current;

    try {
      setLoading(true);

      const startStr = new Date(year, month, -7).toISOString().split('T')[0];
      const endStr = new Date(year, month + 1, 7).toISOString().split('T')[0];

      const [rows, bulkRows] = await Promise.all([
        fetchCalendarEvents({
          facultyId,
          startDate: startStr,
          endDate: endStr
        }),
        fetchBulkCalendarEvents({
          facultyId,
          startDate: startStr,
          endDate: endStr
        })
      ]);

      if (currentFetchId !== fetchIdRef.current) return;

      if ((!rows || rows.length === 0) && (!bulkRows || bulkRows.length === 0)) {
        setEvents([]);
        return;
      }

      let educationId = null;
      let branchId = null;
      let academicYearId = null;

      try {
        const facultyCtx = await fetchFacultyContextAdmin({ facultyId });
        educationId = facultyCtx?.collegeEducationId;
        branchId = facultyCtx?.collegeBranchId;
        academicYearId = facultyCtx?.academicYearIds?.[0];
      } catch (err) {
        console.warn("Failed to fetch faculty context:", err);
      }

      if (!educationId || !branchId || !academicYearId) {
        const firstEventSections = rows.length > 0
          ? await fetchCalendarEventSections(rows[0].calendarEventId)
          : bulkRows.length > 0
            ? await fetchBulkCalendarEventSections(bulkRows[0].bulkCalendarEventId)
            : [];

        if (!firstEventSections || firstEventSections.length === 0) {
          setEvents([]);
          return;
        }

        educationId = firstEventSections[0].collegeEducationId;
        branchId = firstEventSections[0].collegeBranchId;
        academicYearId = firstEventSections[0].collegeAcademicYearId;
      }

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
        branches.map((b: any) => [b.collegeBranchId, b.collegeBranchCode]),
      );

      const yearMap = new Map<number, string>(
        academicYears.map((y: any) => [
          y.collegeAcademicYearId,
          y.collegeAcademicYear,
        ]),
      );

      const sectionNameMap = new Map<number, string>(
        allSections.map((s: any) => [s.collegeSectionsId, s.collegeSections]),
      );

      const sectionMap = new Map<number, number[]>();

      await Promise.all(
        rows.map(async (row: any) => {
          const sections = await fetchCalendarEventSections(
            row.calendarEventId,
          );
          sectionMap.set(
            row.calendarEventId,
            (sections ?? []).map((s: any) => s.collegeSectionId),
          );
        }),
      );

      const bulkSectionMap = new Map<number, number[]>();
      await Promise.all(
        bulkRows.map(async (row: any) => {
          const sections = await fetchBulkCalendarEventSections(
            row.bulkCalendarEventId,
          );
          bulkSectionMap.set(
            row.bulkCalendarEventId,
            (sections ?? []).map((s: any) => s.collegeSectionId),
          );
        }),
      );

      const expandedEvents: CalendarEvent[] = [];

      rows.forEach((row: any) => {
        const startTime = `${row.date}T${row.fromTime}`;
        const endTime = `${row.date}T${row.toTime}`;

        const sectionIds = sectionMap.get(row.calendarEventId) ?? [];

        const safelyExtractedTopic =
          row.college_subject_unit_topics?.topicTitle ||
          (Array.isArray(row.college_subject_unit_topics)
            ? row.college_subject_unit_topics[0]?.topicTitle
            : null);

        sectionIds.forEach((sectionId) => {
          expandedEvents.push({
            id: `${row.calendarEventId}-${sectionId}`,

            title:
              row.type === "meeting"
                ? row.meetingTitle || "Meeting"
                : (safelyExtractedTopic ?? ""),

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

            sectionId: sectionId,

            rawFormData: {
              subjectId: row.subject,
              topicId: row.eventTopic,
              topicTitle: safelyExtractedTopic,
              roomNo: row.college_rooms?.roomNo ?? "",
              collegeRoomId: row.collegeRoomId,
              meetingLink: row.meetingLink,
              meetingId: row.meetingId,
              meetingPassword: row.meetingPassword,
            },
          });
        });
      });

      bulkRows.forEach((row: any) => {
        const fromDateObj = new Date(row.fromDate);
        const toDateObj = new Date(row.toDate);
        const sectionIds = bulkSectionMap.get(row.bulkCalendarEventId) ?? [];

        const units = row.bulk_calendar_event_units?.map((u: any) =>
          u.college_subject_units?.unitTitle
        ).filter(Boolean).join(", ") || "-";

        for (let d = new Date(fromDateObj); d <= toDateObj; d.setDate(d.getDate() + 1)) {
          if (d.getDay() === 0) continue;

          const dateStr = d.toISOString().split('T')[0];
          const startTime = `${dateStr}T${row.fromTime}`;
          const endTime = `${dateStr}T${row.toTime}`;

          sectionIds.forEach((sectionId) => {
            expandedEvents.push({
              id: `bulk-${row.bulkCalendarEventId}-${sectionId}-${dateStr}`,

              title:
                row.type === "meeting"
                  ? row.meetingTitle || "Meeting"
                  : units,

              type: row.type,
              subjectName: row.college_subjects?.subjectName ?? "-",
              subjectKey: row.college_subjects?.subjectKey ?? "",

              day: new Date(dateStr)
                .toLocaleDateString("en-US", { weekday: "short" })
                .toUpperCase(),

              startTime,
              endTime,

              branch: branchMap.get(branchId) ?? "",
              year: yearMap.get(academicYearId) ?? "",
              section: sectionNameMap.get(sectionId) ?? "",

              calendarEventId: row.bulkCalendarEventId,

              sectionId: sectionId,

              rawFormData: {
                subjectId: row.subject,
                topicId: null,
                topicTitle: null,
                roomNo: row.college_rooms?.roomNo ?? "",
                collegeRoomId: row.collegeRoomId,
                meetingLink: row.meetingLink,
                meetingId: row.meetingId,
                meetingPassword: row.meetingPassword,
                fromDate: row.fromDate,
                toDate: row.toDate,
              },
            });
          });
        }
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
    loadCalendarEvents(currentMonth, currentYear);
    loadHrEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId, collegeId, currentMonth, currentYear]);

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
    payload: CalendarEventPayload,
    ignoreEventId?: number,
  ): Promise<boolean> => {
    if (!facultyId || !collegeId) return false;

    const conflicts = await checkSectionConflict({
      collegeId,
      date: payload.calendarMode === "bulk" ? undefined : payload.date,
      fromDate: payload.calendarMode === "bulk" ? payload.fromDate : undefined,
      toDate: payload.calendarMode === "bulk" ? payload.toDate : undefined,
      fromTime: payload.fromTime,
      toTime: payload.toTime,
      collegeEducationId: payload.collegeEducationId,
      collegeBranchId: payload.collegeBranchId,
      collegeAcademicYearId: payload.collegeAcademicYearId,
      collegeSemesterId: payload.collegeSemesterId,
      sectionIds: payload.sectionIds,
      ignoreEventId: payload.calendarMode === "bulk" ? undefined : ignoreEventId,
      ignoreBulkEventId: payload.calendarMode === "bulk" ? ignoreEventId : undefined,
    });

    if (conflicts.length > 0) {
      setConflictDetails(conflicts);
      return true;
    }

    setConflictDetails([]);
    return false;
  };

  const handleSaveEvent = async (
    payload: CalendarEventPayload,
  ): Promise<{ success: boolean }> => {
    if (!facultyId) {
      toast.error("Faculty not found");
      return { success: false };
    }

    const conflict = await hasDbConflict(
      payload,
      editingEventId ? Number(editingEventId) : undefined,
    );
    if (conflict) {
      setPendingEvent(payload);
      setShowConflictModal(true);
      return { success: false };
    }

    setIsSaving(true);

    try {
      if (payload.calendarMode === "bulk") {
        const eventRes = await saveBulkCalendarEvent({
          bulkCalendarEventId: editingEventId ? Number(editingEventId) : undefined,
          facultyId,
          subjectId: payload.subjectId ?? null,
          eventTitle: payload.eventTitle,
          type: payload.type as any,
          fromDate: payload.fromDate!,
          toDate: payload.toDate!,
          collegeRoomId: payload.collegeRoomId ?? null,
          fromTime: payload.fromTime,
          toTime: payload.toTime,
          meetingLink: payload.meetingLink ?? null,
          meetingId: payload.meetingId ?? null,
          meetingPassword: payload.meetingPassword ?? null,
        });

        if (!eventRes.success) {
          toast.error("Failed to save bulk event");
          return { success: false };
        }

        const bulkCalendarEventId = eventRes.bulkCalendarEventId!;

        const sectionRes = await saveBulkCalendarEventSections(bulkCalendarEventId, {
          collegeEducationId: payload.collegeEducationId,
          collegeBranchId: payload.collegeBranchId,
          collegeAcademicYearId: payload.collegeAcademicYearId,
          collegeSemesterId: payload.collegeSemesterId,
          sectionIds: payload.sectionIds,
        });

        if (!sectionRes.success) {
          toast.error("Failed to save sections for bulk event");
          return { success: false };
        }

        const unitRes = await saveBulkCalendarEventUnits(
          bulkCalendarEventId,
          payload.eventUnitIds ?? []
        );

        if (!unitRes.success) {
          toast.error("Failed to save units for bulk event");
          return { success: false };
        }

        setIsModalOpen(false);
        setEditingEventId(null);
        setEventForm(null);
        setFormMode("create");
        await loadCalendarEvents(currentMonth, currentYear);
        return { success: true };
      }

      const eventRes = await saveCalendarEvent({
        calendarEventId: editingEventId ? Number(editingEventId) : undefined,
        collegeId: collegeId!,
        facultyId,
        subjectId: payload.subjectId ?? null,
        eventTopic: payload.eventTopic,
        eventTitle: payload.eventTitle,
        type: payload.type,
        date: payload.date,
        collegeRoomId: payload.collegeRoomId ?? 0,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        meetingLink: payload.meetingLink ?? null,
        meetingId: payload.meetingId ?? null,
        meetingPassword: payload.meetingPassword ?? null,
      });

      if (!eventRes.success) {
        toast.error("Failed to save event");
        return { success: false };
      }

      const calendarEventId = eventRes.calendarEventId;


      await saveCalendarEventSections(calendarEventId, {
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSemesterId: payload.collegeSemesterId,
        sectionIds: payload.sectionIds,
      });

      if (!editingEventId) {
        await notifyStudentsOfEvent(calendarEventId, payload);
      }

      setIsModalOpen(false);
      setEditingEventId(null);
      setEventForm(null);
      setFormMode("create");

      await loadCalendarEvents(currentMonth, currentYear);

      return { success: true };
    } catch (err) {
      console.error("handleSaveEvent failed", err);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  const handleConflictCancel = () => {
    setPendingEvent(null);
    setShowConflictModal(false);
  };

  const confirmAddEvent = async () => {
    if (!pendingEvent || !facultyId) return;

    setShowConflictModal(false);
    setIsSaving(true);

    try {
      if (pendingEvent.calendarMode === "bulk") {
        const eventRes = await saveBulkCalendarEvent({
          bulkCalendarEventId: editingEventId ? Number(editingEventId) : undefined,
          facultyId,
          subjectId: pendingEvent.subjectId ?? null,
          eventTitle: pendingEvent.eventTitle,
          type: pendingEvent.type as any,
          fromDate: pendingEvent.fromDate!,
          toDate: pendingEvent.toDate!,
          collegeRoomId: pendingEvent.collegeRoomId ?? null,
          fromTime: pendingEvent.fromTime,
          toTime: pendingEvent.toTime,
          meetingLink: pendingEvent.meetingLink ?? null,
          meetingId: pendingEvent.meetingId ?? null,
          meetingPassword: pendingEvent.meetingPassword ?? null,
        });

        if (!eventRes.success) {
          toast.error("Failed to save bulk event");
          return;
        }

        const bulkCalendarEventId = eventRes.bulkCalendarEventId!;

        const sectionRes = await saveBulkCalendarEventSections(bulkCalendarEventId, {
          collegeEducationId: pendingEvent.collegeEducationId,
          collegeBranchId: pendingEvent.collegeBranchId,
          collegeAcademicYearId: pendingEvent.collegeAcademicYearId,
          collegeSemesterId: pendingEvent.collegeSemesterId,
          sectionIds: pendingEvent.sectionIds,
        });

        if (!sectionRes.success) {
          toast.error("Failed to save sections for bulk event");
          return;
        }

        const unitRes = await saveBulkCalendarEventUnits(
          bulkCalendarEventId,
          pendingEvent.eventUnitIds ?? []
        );

        if (!unitRes.success) {
          toast.error("Failed to save units for bulk event");
          return;
        }

        toast.success("Bulk event saved despite conflict ⚠️");

        setPendingEvent(null);
        setIsModalOpen(false);
        setEditingEventId(null);
        setEventForm(null);
        setFormMode("create");
        await loadCalendarEvents(currentMonth, currentYear);
        return;
      }

      const eventRes = await saveCalendarEvent({
        calendarEventId: editingEventId ? Number(editingEventId) : undefined,
        collegeId: collegeId!,
        facultyId,
        subjectId: pendingEvent.subjectId ?? null,
        eventTopic: pendingEvent.eventTopic,
        eventTitle: pendingEvent.eventTitle,
        type: pendingEvent.type,
        date: pendingEvent.date,
        collegeRoomId: pendingEvent.collegeRoomId ?? 0,
        fromTime: pendingEvent.fromTime,
        toTime: pendingEvent.toTime,
        meetingLink: pendingEvent.meetingLink ?? null,
        meetingId: pendingEvent.meetingId ?? null,
        meetingPassword: pendingEvent.meetingPassword ?? null,
      });

      if (!eventRes.success) {
        toast.error("Failed to save event");
        return;
      }

      const calendarEventId = eventRes.calendarEventId;

      if (editingEventId) {
        const existingSections =
          await fetchCalendarEventSections(calendarEventId);
        await Promise.all(
          (existingSections ?? []).map((s: any) =>
            softDeleteCalendarEventSection(calendarEventId, s.collegeSectionId),
          ),
        );
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

      await loadCalendarEvents(currentMonth, currentYear);
    } catch (err) {
      console.error("confirmAddEvent error", err);
      toast.error("Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    setIsDeleteLoading(true);
    try {
      const isBulk = event.id.startsWith("bulk-");

      if (isBulk) {
        const bulkCalendarEventId = event.calendarEventId;
        const sectionId = event.sectionId;

        await softDeleteBulkCalendarEventSection(bulkCalendarEventId, sectionId);

        const remaining = await fetchBulkCalendarEventSections(bulkCalendarEventId);

        // Exclude the one we just soft deleted which has isActive = false or deletedAt != null
        // But fetchBulkCalendarEventSections currently doesn't filter by deletedAt?
        // Wait, supabase query `is("deletedAt", null)` needs to be added if it isn't.
        // If there are no more active sections, delete the event
        const activeRemaining = remaining.filter((r: any) => !r.deletedAt);
        if (!activeRemaining || activeRemaining.length === 0) {
          await deleteBulkCalendarEvent(bulkCalendarEventId);
        }
      } else {
        const calendarEventId = event.calendarEventId;
        const sectionId = event.sectionId;

        await softDeleteCalendarEventSection(calendarEventId, sectionId);

        const remaining = await fetchCalendarEventSections(calendarEventId);

        if (!remaining || remaining.length === 0) {
          await deleteCalendarEvent(calendarEventId);
        }
      }

      await loadCalendarEvents(currentMonth, currentYear);
      toast.success("Section deleted successfully");
    } catch (err) {
      toast.error("Failed to delete section");
      console.error(err);
    } finally {
      setIsDeleteLoading(false);
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

    const isBulk = event.id.startsWith("bulk-");

    let dbSectionIds: number[] = [];
    let semesterId: number | null = null;
    let dbUnitIds: number[] = [];
    try {
      if (isBulk) {
        const rows = await fetchBulkCalendarEventSections(event.calendarEventId);
        dbSectionIds = (rows ?? []).map((r: any) => r.collegeSectionId);
        semesterId = rows?.[0]?.collegeSemesterId ?? null;
        const units = await fetchBulkCalendarEventUnits(event.calendarEventId);
        dbUnitIds = (units ?? []).map((u: any) => u.collegeSubjectUnitId);
      } else {
        const rows = await fetchCalendarEventSections(event.calendarEventId);
        dbSectionIds = (rows ?? []).map((r: any) => r.collegeSectionId);
        semesterId = rows?.[0]?.collegeSemesterId ?? null;
      }
    } catch (err) {
      console.warn("⚠️ Sections/Units fetch failed", err);
    }

    setEventForm({
      title: event.title ?? "",
      subjectId: event.rawFormData?.subjectId ?? null,
      topicId: event.rawFormData?.topicId ?? null,
      roomNo: event.rawFormData?.roomNo ?? "",
      collegeRoomId: event.rawFormData?.collegeRoomId ?? null,
      meetingLink: event.rawFormData?.meetingLink ?? "",
      meetingId: event.rawFormData?.meetingId ?? "",
      meetingPassword: event.rawFormData?.meetingPassword ?? "",

      date: startDate,
      fromDate: event.rawFormData?.fromDate ?? startDate,
      toDate: event.rawFormData?.toDate ?? startDate,

      startHour: start.hour,
      startMinute: start.minute,
      startPeriod: start.period,

      endHour: end.hour,
      endMinute: end.minute,
      endPeriod: end.period,

      sectionIds: dbSectionIds,
      semesterId,
      unitIds: dbUnitIds,

      type: event.type,
      calendarMode: isBulk ? "bulk" : "single",
    });

    setIsModalOpen(true);
  };

  return (
    <main className="p-1.5 md:p-2.5 lg:p-4">
      <section className="bg-indigo-00 flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">
            {activeMainTab === "Holidays" ? "Holiday Calendar" : "Calendar & Events"}
          </h1>
          <p className="text-black text-sm">
            {activeMainTab === "Holidays"
              ? "View the complete holiday schedule for the academic year."
              : "Stay organized and on track with your personalised calendar"}
          </p>
        </div>

        <CourseScheduleCard style="w-[320px] hidden md:flex lg:flex" />
      </section>

      <div className="flex gap-3 mb-5">
        <button
          onClick={() => router.push("/faculty/calendar")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Academics" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Academics Calendar
        </button>
        <button
          onClick={() => router.push("/faculty/calendar?tab=Holidays")}
          className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Holiday Calendar
        </button>
      </div>

      {activeMainTab === "Holidays" ? (
        isFetchingHolidays ? (
          <HolidayCalendarShimmer />
        ) : (
          <HolidayCalendar
            holidays={holidays}
            year={holidayYear}
            setYear={setHolidayYear}
            onRefresh={loadHolidays}
            readOnly={true}
          />
        )
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4">
            <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <CalendarHeader
              currentDate={currentDate}
              onMonthYearChange={(month, year) => {
                setCurrentDate(new Date(year, month, 1));
              }}
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
            <div className="w-full h-[80vh] bg-[#f3f4f6] text-gray-800">
              <CalendarGrid
                events={events}
                weekDays={weekDays}
                activeTab={activeTab}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onDeleteRequest={(event) => setEventToDelete(event)}
                onEditRequest={(event) => handleEditEvent(event)}
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setShowDetails(true);
                }}
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
                conflictDetails={conflictDetails}
              />

              <ConfirmDeleteModal
                open={!!eventToDelete}
                onCancel={() => setEventToDelete(null)}
                onConfirm={async () => {
                  if (eventToDelete) await handleDeleteEvent(eventToDelete);
                  setEventToDelete(null);
                }}
                isDeleting={isDeleteLoading}
              />
            </div>
          )}
        </>
      )}
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
