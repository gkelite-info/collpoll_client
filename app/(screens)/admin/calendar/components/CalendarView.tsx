"use client";

import { useEffect, useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarGrid from "./calenderGrid";
import CalendarHeader from "./calendarHeader";
import CalendarToolbar from "./calenderToolbar";
import AddEventModal from "./addEventModal";
import { CalendarEvent } from "../types";
import { combineDateAndTime, getWeekDays } from "../utils";
import ConfirmConflictModal from "./ConfirmConflictModal";
import { CaretLeft } from "@phosphor-icons/react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import toast from "react-hot-toast";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";
import { fetchCalendarEvents, deleteCalendarEvent, saveCalendarEvent } from "@/lib/helpers/calendar/calendarEventAPI";
import { fetchCalendarEventSections, softDeleteCalendarEventSection, saveCalendarEventSections } from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import {
  fetchBulkCalendarEvents,
  fetchBulkCalendarEventSections,
  saveBulkCalendarEvent,
  saveBulkCalendarEventSections,
  saveBulkCalendarEventUnits,
  softDeleteBulkCalendarEventSection,
  deleteBulkCalendarEvent,
  fetchBulkCalendarEventUnits
} from "@/lib/helpers/calendar/bulkCalendarEventAPI";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { useUser } from "@/app/utils/context/UserContext";
import EventDetailsModal from "@/app/(screens)/faculty/calendar/modal/EventDetailsModal";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { fetchFacultyContextAdmin } from "@/app/utils/context/faculty/facultyContextAPI";

import {
  checkSectionConflict,
  ConflictingSection,
} from "@/lib/helpers/calendar/checkSectionConflict";

interface Props {
  faculty: {
    name: string;
    id: string;
    employeeId: string;
    branch: string;
    year?: string;
  };
  onBack: () => void;
}

export default function CalendarView({ faculty, onBack }: Props) {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pendingEvent, setPendingEvent] = useState<any | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const [conflictDetails, setConflictDetails] = useState<ConflictingSection[]>(
    [],
  );

  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null,
  );
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [degreeOptions, setDegreeOptions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const { collegeId } = useUser();
  const [lastFetchedMonth, setLastFetchedMonth] = useState<string>("");

  const weekDays = getWeekDays(currentDate);

  useEffect(() => {
    loadEvents();
    // loadDegrees();
  }, [faculty.id]);

  useEffect(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthKey = `${year}-${month}`;

    // Only hit the database if we moved to a new month/year
    if (lastFetchedMonth !== monthKey) {
      loadEvents(month, year);
      setLastFetchedMonth(monthKey);
    }
  }, [faculty.id, currentDate.getMonth(), currentDate.getFullYear()]);

  const loadDegrees = async () => {
    try {
      const data = await fetchCollegeDegrees();
      setDegreeOptions(data);
    } catch {
      toast.error("Failed to load degrees");
    }
  };

  const loadEvents = async (
    month: number = currentDate.getMonth(),
    year: number = currentDate.getFullYear()
  ) => {
    setIsLoadingEvents(true);

    try {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      firstDay.setDate(firstDay.getDate() - 7);
      lastDay.setDate(lastDay.getDate() + 7);

      const startDate = firstDay.toISOString().split("T")[0];
      const endDate = lastDay.toISOString().split("T")[0];

      const rows = await fetchCalendarEvents({
        facultyId: Number(faculty.id),
        startDate,
        endDate,
      });

      const bulkRows = await fetchBulkCalendarEvents({
        facultyId: Number(faculty.id),
        startDate,
        endDate,
      });

      if ((!rows || rows.length === 0) && (!bulkRows || bulkRows.length === 0)) {
        setEvents([]);
        return;
      }

      let educationId = null;
      let branchId = null;
      let academicYearId = null;

      try {
        const facultyCtx = await fetchFacultyContextAdmin({ facultyId: Number(faculty.id) });
        educationId = facultyCtx?.collegeEducationId;
        branchId = facultyCtx?.collegeBranchId;
        academicYearId = facultyCtx?.academicYearIds?.[0];
      } catch (err) {
        console.warn("Failed to fetch faculty context admin:", err);
      }

      if (!educationId || !branchId || !academicYearId) {
        let firstEventSections = null;
        if (rows && rows.length > 0) {
          firstEventSections = await fetchCalendarEventSections(rows[0].calendarEventId);
        } else if (bulkRows && bulkRows.length > 0) {
          firstEventSections = await fetchBulkCalendarEventSections(bulkRows[0].bulkCalendarEventId);
        }

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

      const sections = await fetchAcademicDropdowns({
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

      const sectionMapName = new Map<number, string>(
        sections.map((s: any) => [s.collegeSectionsId, s.collegeSections]),
      );

      const sectionMap = new Map<number, number[]>();
      await Promise.all(
        rows.map(async (row: any) => {
          const secRows = await fetchCalendarEventSections(row.calendarEventId);
          sectionMap.set(
            row.calendarEventId,
            (secRows ?? []).map((s: any) => s.collegeSectionId),
          );
        }),
      );

      const bulkSectionMap = new Map<number, number[]>();
      await Promise.all(
        bulkRows.map(async (row: any) => {
          const secRows = await fetchBulkCalendarEventSections(row.bulkCalendarEventId);
          bulkSectionMap.set(
            row.bulkCalendarEventId,
            (secRows ?? []).map((s: any) => s.collegeSectionId),
          );
        }),
      );

      const expanded: CalendarEvent[] = [];

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
          expanded.push({
            id: `${row.calendarEventId}-${sectionId}`,
            calendarEventId: row.calendarEventId,
            sectionId: sectionId,

            subjectName: row.college_subjects?.subjectName ?? "-",
            subjectKey: row.college_subjects?.subjectKey ?? "",

            title:
              row.type === "meeting"
                ? row.meetingTitle || "Meeting"
                : (safelyExtractedTopic ?? ""),

            type: row.type,

            day: new Date(row.date)
              .toLocaleDateString("en-US", { weekday: "short" })
              .toUpperCase(),

            startTime,
            endTime,

            branch: branchMap.get(branchId) ?? "",
            year: yearMap.get(academicYearId) ?? "",
            section: sectionMapName.get(sectionId) ?? "",

            rawFormData: {
              subjectId: row.college_subjects?.collegeSubjectId ?? null,
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
        const eventStart = Math.max(firstDay.getTime(), new Date(row.fromDate).getTime());
        const eventEnd = Math.min(lastDay.getTime(), new Date(row.toDate).getTime());
        
        for (let d = new Date(eventStart); d <= new Date(eventEnd); d.setDate(d.getDate() + 1)) {
          if (d.getDay() === 0) continue; // Skip Sundays
          
          const currentDateStr = d.toLocaleDateString("en-CA");
          const startTime = `${currentDateStr}T${row.fromTime}`;
          const endTime = `${currentDateStr}T${row.toTime}`;

          const sectionIds = bulkSectionMap.get(row.bulkCalendarEventId) ?? [];

          const unitTitles = (row.bulk_calendar_event_units || []).map((u: any) => u.college_subject_units?.unitTitle).filter(Boolean);
          const safelyExtractedTopic = unitTitles.length > 0 ? unitTitles.join(", ") : "";

          sectionIds.forEach((sectionId) => {
            expanded.push({
              id: `bulk-${row.bulkCalendarEventId}-${sectionId}-${currentDateStr}`,
              calendarEventId: row.bulkCalendarEventId,
              sectionId: sectionId,
  
              subjectName: row.college_subjects?.subjectName ?? "-",
              subjectKey: row.college_subjects?.subjectKey ?? "",
  
              title:
                row.type === "meeting"
                  ? row.meetingTitle || "Meeting"
                  : (safelyExtractedTopic || "Multiple Units"),
  
              type: row.type,
  
              day: new Date(currentDateStr)
                .toLocaleDateString("en-US", { weekday: "short" })
                .toUpperCase(),
  
              startTime,
              endTime,
  
              branch: branchMap.get(branchId) ?? "",
              year: yearMap.get(academicYearId) ?? "",
              section: sectionMapName.get(sectionId) ?? "",
  
              rawFormData: {
                subjectId: row.college_subjects?.collegeSubjectId ?? null,
                topicId: null,
                topicTitle: safelyExtractedTopic,
                roomNo: row.college_rooms?.roomNo ?? "",
                collegeRoomId: row.collegeRoomId,
                meetingLink: row.meetingLink,
                meetingId: row.meetingId,
                meetingPassword: row.meetingPassword,
              },
            });
          });
        }
      });

      setEvents(expanded);
    } catch (err) {
      console.error("ADMIN LOAD EVENTS FAILED", err);
      toast.error("Failed to load calendar events");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const hasDbConflict = async (
    payload: any,
    ignoreEventId?: number,
  ): Promise<boolean> => {
    if (!collegeId) return false;

    try {
      const conflicts = await checkSectionConflict({
        collegeId: collegeId!,
        date: payload.calendarMode === "bulk" ? undefined : payload.date,
        fromDate: payload.calendarMode === "bulk" ? payload.fromDate : undefined,
        toDate: payload.calendarMode === "bulk" ? payload.toDate : undefined,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        collegeEducationId: payload.educationId,
        collegeBranchId: payload.branchId,
        collegeAcademicYearId: payload.academicYearId,
        collegeSemesterId: payload.semester,
        sectionIds: payload.sections.map((s: any) => s.collegeSectionId),
        ignoreEventId: payload.calendarMode === "bulk" ? undefined : ignoreEventId,
        ignoreBulkEventId: payload.calendarMode === "bulk" ? ignoreEventId : undefined,
      });

      if (conflicts.length > 0) {
        setConflictDetails(conflicts);
        return true;
      }

      setConflictDetails([]);
      return false;
    } catch (err) {
      console.error("ADMIN CONFLICT CHECK FAILED", err);
      return false;
    }
  };

  const handleSaveEvent = async (data: any) => {
    try {
      setIsSaving(true);
      const conflict = await hasDbConflict(
        data,
        editingEventId ? Number(editingEventId) : undefined,
      );

      if (conflict) {
        setPendingEvent(data);
        setShowConflictModal(true);
        return;
      }

      if (data.calendarMode === "bulk") {
        const eventRes = await saveBulkCalendarEvent({
          bulkCalendarEventId: editingEventId ? Number(editingEventId) : undefined,
          facultyId: Number(data.facultyId),
          subjectId: data.subjectId ?? null,
          eventTitle: data.meetingTitle || (data.type === 'meeting' ? 'Meeting' : ''),
          type: data.type,
          fromDate: data.fromDate,
          toDate: data.toDate,
          collegeRoomId: data.collegeRoomId ?? null,
          fromTime: data.fromTime,
          toTime: data.toTime,
          meetingLink: data.meetingLink ?? null,
          meetingId: data.meetingId ?? null,
          meetingPassword: data.meetingPassword ?? null,
        });

        if (!eventRes.success) {
          toast.error("Failed to save bulk event");
          return;
        }

        const bulkCalendarEventId = eventRes.bulkCalendarEventId!;

        await saveBulkCalendarEventSections(bulkCalendarEventId, {
          collegeEducationId: data.educationId,
          collegeBranchId: data.branchId,
          collegeAcademicYearId: data.academicYearId,
          collegeSemesterId: data.semester,
          sectionIds: data.sections.map((s: any) => s.collegeSectionId),
        });

        await saveBulkCalendarEventUnits(bulkCalendarEventId, data.eventUnitIds ?? []);

        toast.success(editingEventId ? "Bulk Event updated successfully" : "Bulk Event created successfully");
        setIsModalOpen(false);
        setEditingEventId(null);
        setEventForm(null);
        setFormMode("create");
        await loadEvents();
        return;
      }

      const eventRes = await saveCalendarEvent({
        calendarEventId: editingEventId ? Number(editingEventId) : undefined,

        facultyId: Number(data.facultyId),

        subjectId: data.subjectId ?? null,
        eventTopic: data.eventTopic ?? null,
        eventTitle: data.meetingTitle,
        type: data.type,

        date: data.date,
        collegeRoomId: data.collegeRoomId,
        fromTime: data.fromTime,
        toTime: data.toTime,

        meetingLink: data.meetingLink ?? null,
        meetingId: data.meetingId ?? null,
        meetingPassword: data.meetingPassword ?? null,
      });

      if (!eventRes.success) {
        toast.error("Failed to save event");
        return;
      }

      const calendarEventId = eventRes.calendarEventId;

      if (editingEventId) {
        const sections = await fetchCalendarEventSections(
          Number(editingEventId),
        );

        for (const s of sections) {
          await softDeleteCalendarEventSection(
            Number(editingEventId),
            s.collegeSectionId,
          );
        }
      }

      await saveCalendarEventSections(calendarEventId, {
        collegeEducationId: data.educationId,
        collegeBranchId: data.branchId,
        collegeAcademicYearId: data.academicYearId,
        collegeSemesterId: data.semester,
        sectionIds: data.sections.map((s: any) => s.collegeSectionId),
      });

      toast.success(
        editingEventId
          ? "Event updated successfully"
          : "Event created successfully",
      );

      setIsModalOpen(false);
      setEditingEventId(null);
      setEventForm(null);
      setFormMode("create");

      await loadEvents();
    } catch (err) {
      console.error("ADMIN SAVE EVENT FAILED", err);
      toast.error("Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    if (!event.calendarEventId) return;
    setEditingEventId(String(event.calendarEventId));
    setFormMode("edit");

    const startDate = event.startTime.split("T")[0];
    const start24 = event.startTime.split("T")[1].slice(0, 5);
    const end24 = event.endTime.split("T")[1].slice(0, 5);

    const parse24To12 = (time24: string) => {
      const [hStr, mStr] = time24.split(":");
      let h = Number(hStr);
      const minute = mStr;
      const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      return { hour: String(h).padStart(2, "0"), minute, period };
    };

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
      calendarEventId: event.calendarEventId,
      facultyId: faculty.id,

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
      sections: dbSectionIds.map((id) => ({ collegeSectionsId: id, collegeSections: "" })), // Mock format if needed by modal
      semesterId,
      unitIds: dbUnitIds,

      type: event.type,
      calendarMode: isBulk ? "bulk" : "single",
    });

    setIsModalOpen(true);
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

  const confirmAddEvent = async () => {
    if (!pendingEvent) return;

    setShowConflictModal(false);
    setIsSaving(true);

    try {
      if (pendingEvent.calendarMode === "bulk") {
        const eventRes = await saveBulkCalendarEvent({
          bulkCalendarEventId: editingEventId ? Number(editingEventId) : undefined,
          facultyId: Number(faculty.id),
          subjectId: pendingEvent.subjectId ?? null,
          eventTitle: pendingEvent.meetingTitle || (pendingEvent.type === 'meeting' ? 'Meeting' : ''),
          type: pendingEvent.type,
          fromDate: pendingEvent.fromDate,
          toDate: pendingEvent.toDate,
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

        await saveBulkCalendarEventSections(bulkCalendarEventId, {
          collegeEducationId: pendingEvent.educationId,
          collegeBranchId: pendingEvent.branchId,
          collegeAcademicYearId: pendingEvent.academicYearId,
          collegeSemesterId: pendingEvent.semester,
          sectionIds: pendingEvent.sections.map((s: any) => s.collegeSectionId),
        });

        await saveBulkCalendarEventUnits(bulkCalendarEventId, pendingEvent.eventUnitIds ?? []);
        
        toast.success("Bulk Event saved despite conflict ⚠️");
        await loadEvents();
        setEditingEventId(null);
        setEventForm(null);
        setFormMode("create");
        setIsModalOpen(false);
        setPendingEvent(null);
        return;
      }

      const eventRes = await saveCalendarEvent({
        calendarEventId: editingEventId ? Number(editingEventId) : undefined,

        facultyId: Number(faculty.id),

        subjectId: pendingEvent.subjectId ?? null,
        eventTopic: pendingEvent.eventTopic ?? null,
        eventTitle: pendingEvent.meetingTitle,

        type: pendingEvent.type,
        date: pendingEvent.date,
        collegeRoomId: pendingEvent.collegeRoomId,
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
        const sections = await fetchCalendarEventSections(
          Number(editingEventId),
        );
        for (const s of sections) {
          await softDeleteCalendarEventSection(
            Number(editingEventId),
            s.collegeSectionId,
          );
        }
      }

      await saveCalendarEventSections(calendarEventId, {
        collegeEducationId: pendingEvent.educationId,
        collegeBranchId: pendingEvent.branchId,
        collegeAcademicYearId: pendingEvent.academicYearId,
        collegeSemesterId: pendingEvent.semester,
        sectionIds: pendingEvent.sections.map((s: any) => s.collegeSectionId),
      });

      toast.success("Event saved despite conflict ⚠️");

      await loadEvents();
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

  const handleDeleteEvent = async (event?: CalendarEvent | null) => {
    if (!event || !event.calendarEventId) return false;
    setIsDeleting(true);
    try {
      const isBulk = event.id.startsWith("bulk-");
      
      if (isBulk) {
        const bulkCalendarEventId = event.calendarEventId;
        const sectionId = event.sectionId;

        await softDeleteBulkCalendarEventSection(bulkCalendarEventId, sectionId!);

        const remaining = await fetchBulkCalendarEventSections(bulkCalendarEventId);
        
        const activeRemaining = remaining.filter((r: any) => !r.deletedAt);
        if (!activeRemaining || activeRemaining.length === 0) {
          await deleteBulkCalendarEvent(bulkCalendarEventId);
        }
      } else {
        const calendarEventId = event.calendarEventId;
        const sectionId = event.sectionId;

        await softDeleteCalendarEventSection(calendarEventId, sectionId!);

        const remaining = await fetchCalendarEventSections(calendarEventId);

        if (!remaining || remaining.length === 0) {
          await deleteCalendarEvent(calendarEventId);
        }
      }

      await loadEvents();
      toast.success("Event deleted successfully.");
      return true;
    } catch (err) {
      console.error("ADMIN DELETE FAILED", err);
      toast.error("Failed to delete event.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConflictCancel = () => {
    setShowConflictModal(false);
    setPendingEvent(null);
    setIsSaving(false);
  };

  const closeAddEventModal = () => {
    setIsModalOpen(false);
    setEventForm(null);
  };

  return (
    <main>
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-black flex items-center">
            <CaretLeft
              size={23}
              onClick={onBack}
              className="cursor-pointer -ml-1.5"
            />{" "}
            Calendar & Events
          </h1>
          <p className="text-sm text-[#282828] mt-1">
            Viewing Calendar for faculty:{" "}
            <span className="font-semibold">{faculty.name}</span> (
            {faculty.branch}){" "}
            <span className="font-semibold"> facultyId - {faculty.employeeId}</span>
          </p>
        </div>
        <CourseScheduleCard
          style="w-[320px]"
          department={faculty.branch}
          year={faculty.year}
          isVisibile={false}
        />
      </section>

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4">
        <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CalendarHeader
          currentDate={currentDate}
          onMonthYearChange={(month, year) => {
            setCurrentDate(new Date(year, month, 1));
          }}
          onAddClick={() => {
            setEditingEventId(null);
            setEventForm(null);
            setFormMode("create");
            setIsModalOpen(true);
          }}
        />
      </div>

      {isLoadingEvents ? (
        <div className="flex justify-center items-center h-[300px]">
          <Loader />
        </div>
      ) : (
        <CalendarGrid
          events={events}
          weekDays={weekDays}
          activeTab={activeTab}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onDeleteRequest={setEventToDelete}
          onEditRequest={handleEditEvent}
          onEventClick={(event) => {
            setSelectedEvent(event);
            setShowDetails(true);
          }}
        />
      )}

      <AddEventModal
        isOpen={isModalOpen}
        value={{ ...eventForm, facultyId: faculty.id }}
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
        isDeleting={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setEventToDelete(null);
        }}
        onConfirm={async () => {
          if (!eventToDelete) return;
          const success = await handleDeleteEvent(eventToDelete);
          if (success) {
            setEventToDelete(null);
          }
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
    </main>
  );
}
