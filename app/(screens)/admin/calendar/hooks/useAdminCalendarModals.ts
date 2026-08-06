import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarEvent } from "../types";
import {
  saveCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/helpers/calendar/calendarEventAPI";
import {
  saveBulkCalendarEvent,
  saveBulkCalendarEventSections,
  saveBulkCalendarEventUnits,
  softDeleteBulkCalendarEventSection,
  deleteBulkCalendarEvent,
  fetchBulkCalendarEventSections,
  fetchBulkCalendarEventUnits,
} from "@/lib/helpers/calendar/bulkCalendarEventAPI";
import {
  fetchCalendarEventSections,
  softDeleteCalendarEventSection,
  saveCalendarEventSections,
} from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import { checkSectionConflict, ConflictingSection } from "@/lib/helpers/calendar/checkSectionConflict";

export const useAdminCalendarModals = (
  faculty: { id: string },
  collegeId: number | null,
  loadEvents: () => Promise<any> | void
) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<ConflictingSection[]>([]);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<any | null>(null);

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
        return { success: false };
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
          return { success: false };
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
        queryClient.invalidateQueries({ queryKey: ["adminCalendarEvents"] });
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
        queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
        return { success: true };
      }

      const eventRes = await saveCalendarEvent({
        calendarEventId: editingEventId ? Number(editingEventId) : undefined,
        collegeId: collegeId!,
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
        return { success: false };
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
      queryClient.invalidateQueries({ queryKey: ["adminCalendarEvents"] });
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
      return { success: true };
    } catch (err) {
      console.error("ADMIN SAVE EVENT FAILED", err);
      toast.error("Failed to save event");
      return { success: false };
    } finally {
      setIsSaving(false);
    }
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
        queryClient.invalidateQueries({ queryKey: ["adminCalendarEvents"] });
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
        queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
        setEditingEventId(null);
        setEventForm(null);
        setFormMode("create");
        setIsModalOpen(false);
        setPendingEvent(null);
        return;
      }

      const eventRes = await saveCalendarEvent({
        calendarEventId: editingEventId ? Number(editingEventId) : undefined,
        collegeId: collegeId!,
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
        toast.error("Failed to save event", { id: "admin-save-event-error" });
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

      toast.success("Event saved despite conflict ⚠️", { id: "admin-event-saved-conflict" });

      await loadEvents();
      queryClient.invalidateQueries({ queryKey: ["adminCalendarEvents"] });
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
      setEditingEventId(null);
      setEventForm(null);
      setFormMode("create");
      setIsModalOpen(false);
      setPendingEvent(null);
    } catch (err) {
      toast.error("Failed to save event", { id: "admin-save-event-exception" });
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
    let educationId: number | null = null;
    let branchId: number | null = null;
    let academicYearId: number | null = null;
    try {
      if (isBulk) {
        const rows = await fetchBulkCalendarEventSections(event.calendarEventId);
        dbSectionIds = (rows ?? []).map((r: any) => r.collegeSectionId);
        semesterId = rows?.[0]?.collegeSemesterId ?? null;
        educationId = rows?.[0]?.collegeEducationId ?? null;
        branchId = rows?.[0]?.collegeBranchId ?? null;
        academicYearId = rows?.[0]?.collegeAcademicYearId ?? null;
        const units = await fetchBulkCalendarEventUnits(event.calendarEventId);
        dbUnitIds = (units ?? []).map((u: any) => u.collegeSubjectUnitId);
      } else {
        const rows = await fetchCalendarEventSections(event.calendarEventId);
        dbSectionIds = (rows ?? []).map((r: any) => r.collegeSectionId);
        semesterId = rows?.[0]?.collegeSemesterId ?? null;
        educationId = rows?.[0]?.collegeEducationId ?? null;
        branchId = rows?.[0]?.collegeBranchId ?? null;
        academicYearId = rows?.[0]?.collegeAcademicYearId ?? null;
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
      educationId,
      branchId,
      academicYearId,

      type: event.type,
      calendarMode: isBulk ? "bulk" : "single",
    });

    setIsModalOpen(true);
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
      queryClient.invalidateQueries({ queryKey: ["adminCalendarEvents"] });
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
      toast.success("Event deleted successfully.", { id: "admin-delete-event-success" });
      return true;
    } catch (err) {
      console.error("ADMIN DELETE FAILED", err);
      toast.error("Failed to delete event.", { id: "admin-delete-event-error" });
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

  return {
    isModalOpen,
    setIsModalOpen,
    showConflictModal,
    conflictDetails,
    eventToDelete,
    setEventToDelete,
    eventForm,
    setEventForm,
    editingEventId,
    setEditingEventId,
    isSaving,
    formMode,
    setFormMode,
    isDeleting,
    selectedEvent,
    setSelectedEvent,
    showDetails,
    setShowDetails,
    pendingEvent,
    setPendingEvent,

    handleSaveEvent,
    confirmAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleConflictCancel,
    closeAddEventModal
  };
};
