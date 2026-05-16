import { CalendarEvent } from "./types";


export const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    calendarEventId: 1,
    title: "DBMS - Normalization",
    type: "class",
    day: "MON",
    startTime: "2026-03-02T09:00:00",
    endTime: "2026-03-02T10:00:00",
    branch: "CSE",
    year: "2nd Year",
    section: "A",
    subjectName: "Database Management Systems",
  },
  {
    id: "2",
    calendarEventId: 2,
    title: "Parent Meeting",
    type: "meeting",
    day: "TUE",
    startTime: "2026-03-03T11:00:00",
    endTime: "2026-03-03T12:00:00",
    branch: "CSE",
    year: "2nd Year",
    section: "A",
  },
  {
    id: "3",
    calendarEventId: 3,
    title: "Mid Exam - Unit 1",
    type: "exam",
    day: "WED",
    startTime: "2026-03-04T10:00:00",
    endTime: "2026-03-04T11:30:00",
    branch: "CSE",
    year: "2nd Year",
    section: "B",
  },
];