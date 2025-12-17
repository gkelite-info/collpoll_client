import { CalendarEvent } from "./types";

export const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 AM",
  "1:00 PM",
];

export const WEEK_DAYS = [
  { day: "MON", date: 24 },
  { day: "TUE", date: 25 },
  { day: "WED", date: 26 },
  { day: "THU", date: 27 },
  { day: "FRI", date: 28 },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Class 10 Teach Design Principles",
    type: "event",
    day: "MON",
    startTime: "2023-10-24T08:00:00",
    endTime: "2023-10-24T09:00:00",
  },
  {
    id: "2",
    title: "Class 10 Teach Design Principles",
    type: "exam",
    day: "MON",
    startTime: "2023-10-24T10:00:00",
    endTime: "2023-10-24T11:00:00",
  },
  // Tuesday
  {
    id: "3",
    title: "Class 10 Teach Design Principles",
    type: "class",
    day: "TUE",
    startTime: "2023-10-25T08:00:00",
    endTime: "2023-10-25T09:00:00",
  },
  {
    id: "4",
    title: "Class 10 Teach Design Principles",
    type: "event",
    day: "TUE",
    startTime: "2023-10-25T11:00:00",
    endTime: "2023-10-25T12:00:00",
  },
  // Wednesday
  {
    id: "5",
    title: "Class 10 Teach Design Principles",
    type: "exam",
    day: "WED",
    startTime: "2023-10-26T10:00:00",
    endTime: "2023-10-26T11:00:00",
  },
  {
    id: "6",
    title: "Class 10 Teach Design Principles",
    type: "exam",
    day: "WED",
    startTime: "2023-10-26T12:00:00",
    endTime: "2023-10-26T13:00:00",
  },
  // Thursday
  {
    id: "7",
    title: "Class 10 Teach Design Principles",
    type: "exam",
    day: "THU",
    startTime: "2023-10-27T08:00:00",
    endTime: "2023-10-27T09:00:00",
  },
  // Friday
  {
    id: "8",
    title: "Class 10 Teach Design Principles",
    type: "class",
    day: "FRI",
    startTime: "2023-10-28T08:00:00",
    endTime: "2023-10-28T09:00:00",
  },
  {
    id: "9",
    title: "Class 10 Teach Design Principles",
    type: "event",
    day: "FRI",
    startTime: "2023-10-28T11:00:00",
    endTime: "2023-10-28T12:00:00",
  },
];
