import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { CalendarEvent } from "../types";
import { fetchCalendarEvents } from "@/lib/helpers/calendar/calendarEventAPI";
import {
  fetchBulkCalendarEvents,
  fetchAllBulkCalendarEventSections,
} from "@/lib/helpers/calendar/bulkCalendarEventAPI";
import {
  fetchAllCalendarEventSections,
} from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export const useAdminCalendarEvents = (
  faculty: { id: string; branch: string; year?: string },
  currentDate: Date
) => {
  const [isSchool, setIsSchool] = useState<boolean>(
    faculty.branch === "-" || !faculty.branch || faculty.year !== undefined
  );

  const fetchAdminCalendarData = async () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    firstDay.setDate(firstDay.getDate() - 7);
    lastDay.setDate(lastDay.getDate() + 7);

    const formatDateString = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const startDate = formatDateString(firstDay);
    const endDate = formatDateString(lastDay);

    // === PHASE 1: Fetch events + bulk events in parallel (2 API calls) ===
    const [rows, bulkRows] = await Promise.all([
      fetchCalendarEvents({
        facultyId: Number(faculty.id),
        startDate,
        endDate,
      }),
      fetchBulkCalendarEvents({
        facultyId: Number(faculty.id),
        startDate,
        endDate,
      }),
    ]);

    if ((!rows || rows.length === 0) && (!bulkRows || bulkRows.length === 0)) {
      return [];
    }

    // === PHASE 2: Batch-fetch all sections in parallel (2 API calls) ===
    const [allSecRows, allBulkSecRows] = await Promise.all([
      rows && rows.length > 0
        ? fetchAllCalendarEventSections(rows.map((r: any) => r.calendarEventId))
        : Promise.resolve([]),
      bulkRows && bulkRows.length > 0
        ? fetchAllBulkCalendarEventSections(bulkRows.map((r: any) => r.bulkCalendarEventId))
        : Promise.resolve([]),
    ]);

    // === PHASE 3: Extract educationId from section rows (0 API calls) ===
    const firstSec = (allSecRows && allSecRows.length > 0)
      ? allSecRows[0]
      : (allBulkSecRows && allBulkSecRows.length > 0 ? allBulkSecRows[0] : null);

    if (firstSec?.collegeEducationId) {
      try {
        const { data: eduData } = await supabase
          .from("college_education")
          .select("collegeEducationType")
          .eq("collegeEducationId", firstSec.collegeEducationId)
          .maybeSingle();
        if (eduData) {
          setIsSchool(isSchoolEducation(eduData.collegeEducationType));
        }
      } catch (e) {
        console.warn("Education type lookup failed:", e);
      }
    }

    const sectionMap = new Map<number, { id: number; name: string; branch: string; year: string }[]>();
    (allSecRows ?? []).forEach((s: any) => {
      const arr = sectionMap.get(s.calendarEventId) || [];
      arr.push({
        id: s.collegeSectionId,
        name: s.section?.collegeSections || "-",
        branch: s.branch?.collegeBranchCode || "",
        year: s.academic_year?.collegeAcademicYear || "",
      });
      sectionMap.set(s.calendarEventId, arr);
    });

    const bulkSectionMap = new Map<number, { id: number; name: string; branch: string; year: string }[]>();
    (allBulkSecRows ?? []).forEach((s: any) => {
      const arr = bulkSectionMap.get(s.bulkCalendarEventId) || [];
      arr.push({
        id: s.collegeSectionId,
        name: s.section?.collegeSections || "-",
        branch: s.branch?.collegeBranchCode || "",
        year: s.academic_year?.collegeAcademicYear || "",
      });
      bulkSectionMap.set(s.bulkCalendarEventId, arr);
    });

    const expanded: CalendarEvent[] = [];

    rows.forEach((row: any) => {
      const startTime = `${row.date}T${row.fromTime}`;
      const endTime = `${row.date}T${row.toTime}`;

      const sectionInfos = sectionMap.get(row.calendarEventId) ?? [];

      const safelyExtractedTopic =
        row.college_subject_unit_topics?.topicTitle ||
        (Array.isArray(row.college_subject_unit_topics)
          ? row.college_subject_unit_topics[0]?.topicTitle
          : null);

      sectionInfos.forEach((secInfo) => {
        expanded.push({
          id: `${row.calendarEventId}-${secInfo.id}`,
          calendarEventId: row.calendarEventId,
          sectionId: secInfo.id,

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

          branch: secInfo.branch,
          year: secInfo.year,
          section: secInfo.name,

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

        const sectionInfos = bulkSectionMap.get(row.bulkCalendarEventId) ?? [];

        const unitTitles = (row.bulk_calendar_event_units || []).map((u: any) => u.college_subject_units?.unitTitle).filter(Boolean);
        const safelyExtractedTopic = unitTitles.length > 0 ? unitTitles.join(", ") : "";

        sectionInfos.forEach((secInfo) => {
          expanded.push({
            id: `bulk-${row.bulkCalendarEventId}-${secInfo.id}-${currentDateStr}`,
            calendarEventId: row.bulkCalendarEventId,
            sectionId: secInfo.id,
  
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
  
            branch: secInfo.branch,
            year: secInfo.year,
            section: secInfo.name,
  
            rawFormData: {
              subjectId: row.college_subjects?.collegeSubjectId ?? null,
              topicId: null,
              topicTitle: safelyExtractedTopic,
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

    return expanded;
  };

  const { data: events = [], isLoading: isLoadingEvents, refetch: loadEvents, isError, error } = useQuery({
    queryKey: [
      "adminCalendarEvents",
      faculty.id,
      currentDate.getMonth(),
      currentDate.getFullYear(),
    ],
    queryFn: fetchAdminCalendarData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 15000, // 15 seconds polling
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load calendar events. Please try again.");
      console.error("ADMIN LOAD EVENTS FAILED", error);
    }
  }, [isError, error]);

  return { events, isLoadingEvents, isSchool, loadEvents };
};
