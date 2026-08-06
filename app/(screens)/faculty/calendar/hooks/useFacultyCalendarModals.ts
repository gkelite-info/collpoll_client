"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { CalendarEventPayload } from "../page";
import { CalendarEvent } from "../types";
import {
  checkSectionConflict,
  ConflictingSection,
} from "@/lib/helpers/calendar/checkSectionConflict";
import {
  saveBulkCalendarEvent,
  saveBulkCalendarEventSections,
  saveBulkCalendarEventUnits,
  softDeleteBulkCalendarEventSection,
  fetchBulkCalendarEventSections,
  deleteBulkCalendarEvent,
  fetchBulkCalendarEventUnits,
} from "@/lib/helpers/calendar/bulkCalendarEventAPI";
import {
  saveCalendarEvent,
  deleteCalendarEvent,
  notifyStudentsOfEvent,
} from "@/lib/helpers/calendar/calendarEventAPI";

import {
  saveCalendarEventSections,
  softDeleteCalendarEventSection,
  fetchCalendarEventSections,
} from "@/lib/helpers/calendar/calendarEventSectionsAPI";

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

export const useFacultyCalendarModals = (
  facultyId: number | null,
  collegeId: number | null
) => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<CalendarEventPayload | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [eventForm, setEventForm] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [conflictDetails, setConflictDetails] = useState<ConflictingSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  const hasDbConflict = async (
    payload: CalendarEventPayload,
    ignoreEventId?: number
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
    payload: CalendarEventPayload
  ): Promise<{ success: boolean }> => {
    if (!facultyId) {
      toast.error("Faculty not found");
      return { success: false };
    }

    const conflict = await hasDbConflict(
      payload,
      editingEventId ? Number(editingEventId) : undefined
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
          if ((eventRes as any).conflict) {
            toast.error((eventRes as any).error || "This exact event already exists.");
          } else {
            toast.error("Failed to save bulk event");
          }
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
        queryClient.invalidateQueries({ queryKey: ["facultyCalendarEvents"] });
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
        queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
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
        if ((eventRes as any).conflict) {
          toast.error((eventRes as any).error || "This exact event already exists.");
        } else {
          toast.error("Failed to save event");
        }
        return { success: false };
      }

      const calendarEventId = eventRes.calendarEventId!;


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

      queryClient.invalidateQueries({ queryKey: ["facultyCalendarEvents"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });

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
          if ((eventRes as any).conflict) {
            toast.error((eventRes as any).error || "This exact event already exists.");
          } else {
            toast.error("Failed to save bulk event");
          }
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
        queryClient.invalidateQueries({ queryKey: ["facultyCalendarEvents"] });
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
        queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
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
        if ((eventRes as any).conflict) {
          toast.error((eventRes as any).error || "This exact event already exists.");
        } else {
          toast.error("Failed to save event");
        }
        return;
      }

      const calendarEventId = eventRes.calendarEventId!;

      if (editingEventId) {
        const existingSections = await fetchCalendarEventSections(calendarEventId);
        await Promise.all(
          (existingSections ?? []).map((s: any) =>
            softDeleteCalendarEventSection(calendarEventId, s.collegeSectionId)
          )
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

      queryClient.invalidateQueries({ queryKey: ["facultyCalendarEvents"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
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

      queryClient.invalidateQueries({ queryKey: ["facultyCalendarEvents"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
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
      educationId,
      branchId,
      academicYearId,
      unitIds: dbUnitIds,

      type: event.type,
      calendarMode: isBulk ? "bulk" : "single",
    });

    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    pendingEvent,
    showConflictModal,
    setShowConflictModal,
    eventForm,
    setEventForm,
    editingEventId,
    setEditingEventId,
    conflictDetails,
    isSaving,
    formMode,
    setFormMode,
    selectedEvent,
    setSelectedEvent,
    showDetails,
    setShowDetails,
    isDeleteLoading,
    eventToDelete,
    setEventToDelete,
    handleSaveEvent,
    handleConflictCancel,
    confirmAddEvent,
    handleDeleteEvent,
    closeAddEventModal,
    handleEditEvent,
  };
};
