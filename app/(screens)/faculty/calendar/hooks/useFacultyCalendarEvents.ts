"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCalendarEvents } from "@/lib/helpers/calendar/calendarEventAPI";
import {
  fetchBulkCalendarEvents,
  fetchBulkCalendarEventSections,
  fetchAllBulkCalendarEventSections,
} from "@/lib/helpers/calendar/bulkCalendarEventAPI";
import { fetchHrCalendarEvents } from "@/lib/helpers/Hr/calendar/hrCalendarEventsAPI";
import { fetchFacultyContextAdmin } from "@/app/utils/context/faculty/facultyContextAPI";
import { 
  fetchCalendarEventSections,
  fetchAllCalendarEventSections,
} from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { CalendarEvent } from "../types";

const convertTo24Hour = (time12h: string) => {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, "0")}:${minutes}:00`;
};

export const useFacultyCalendarEvents = (
  facultyId: number | null,
  collegeId: number | null,
  currentMonth: number,
  currentYear: number,
  activeTab: string
) => {
  const fetchFacultyCalendarData = async () => {
    if (!facultyId || !collegeId) return { events: [], hrEvents: [] };

    const startStr = new Date(currentYear, currentMonth, -7).toISOString().split("T")[0];
    const endStr = new Date(currentYear, currentMonth + 1, 7).toISOString().split("T")[0];

    const typesFilter = activeTab === "All" ? undefined : [activeTab];

    const [rows, bulkRows, hrData] = await Promise.all([
      fetchCalendarEvents({
        facultyId,
        startDate: startStr,
        endDate: endStr,
        types: typesFilter,
      }),
      fetchBulkCalendarEvents({
        facultyId,
        startDate: startStr,
        endDate: endStr,
        types: typesFilter,
      }),
      fetchHrCalendarEvents(collegeId),
    ]);

    let fetchedHrEvents: CalendarEvent[] = [];
    try {
      fetchedHrEvents = (hrData || []).map((e: any) => ({
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
    } catch (err) {
      console.error("Failed to map HR events", err);
    }

    if ((!rows || rows.length === 0) && (!bulkRows || bulkRows.length === 0)) {
      return { events: [], hrEvents: fetchedHrEvents };
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
      const firstEventSections =
        rows.length > 0
          ? await fetchCalendarEventSections(rows[0].calendarEventId)
          : bulkRows.length > 0
          ? await fetchBulkCalendarEventSections(bulkRows[0].bulkCalendarEventId)
          : [];

      if (!firstEventSections || firstEventSections.length === 0) {
        return { events: [], hrEvents: fetchedHrEvents };
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
      branches.map((b: any) => [b.collegeBranchId, b.collegeBranchCode])
    );

    const yearMap = new Map<number, string>(
      academicYears.map((y: any) => [
        y.collegeAcademicYearId,
        y.collegeAcademicYear,
      ])
    );

    const sectionNameMap = new Map<number, string>(
      allSections.map((s: any) => [s.collegeSectionsId, s.collegeSections])
    );

    const sectionMap = new Map<number, number[]>();
    if (rows.length > 0) {
      const eventIds = rows.map((r: any) => r.calendarEventId);
      const allSections = await fetchAllCalendarEventSections(eventIds);
      allSections.forEach((s: any) => {
        const sections = sectionMap.get(s.calendarEventId) || [];
        sections.push(s.collegeSectionId);
        sectionMap.set(s.calendarEventId, sections);
      });
    }

    const bulkSectionMap = new Map<number, number[]>();
    if (bulkRows.length > 0) {
      const bulkEventIds = bulkRows.map((r: any) => r.bulkCalendarEventId);
      const allBulkSections = await fetchAllBulkCalendarEventSections(bulkEventIds);
      allBulkSections.forEach((s: any) => {
        const sections = bulkSectionMap.get(s.bulkCalendarEventId) || [];
        sections.push(s.collegeSectionId);
        bulkSectionMap.set(s.bulkCalendarEventId, sections);
      });
    }

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
              : safelyExtractedTopic ?? "",

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

      const units =
        row.bulk_calendar_event_units
          ?.map((u: any) => u.college_subject_units?.unitTitle)
          .filter(Boolean)
          .join(", ") || "-";

      for (
        let d = new Date(fromDateObj);
        d <= toDateObj;
        d.setDate(d.getDate() + 1)
      ) {
        if (d.getDay() === 0) continue;

        const dateStr = d.toISOString().split("T")[0];
        const startTime = `${dateStr}T${row.fromTime}`;
        const endTime = `${dateStr}T${row.toTime}`;

        sectionIds.forEach((sectionId) => {
          expandedEvents.push({
            id: `bulk-${row.bulkCalendarEventId}-${sectionId}-${dateStr}`,

            title: row.type === "meeting" ? row.meetingTitle || "Meeting" : units,

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

    return { events: expandedEvents, hrEvents: fetchedHrEvents };
  };

  const { data: calendarData, isLoading } = useQuery({
    queryKey: [
      "facultyCalendarEvents",
      facultyId,
      currentMonth,
      currentYear,
      activeTab,
    ],
    queryFn: fetchFacultyCalendarData,
    enabled: !!facultyId && !!collegeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    events: calendarData?.events || [],
    hrEvents: calendarData?.hrEvents || [],
    isLoading,
  };
};
