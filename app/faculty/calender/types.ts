import { Icon } from "@phosphor-icons/react";

export type EventType = "event" | "class" | "exam" | "holiday";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: string;
  endTime: string;
  day: string; // 'MON', 'TUE', etc.
}

// src/components/calendar/types.ts
export interface WeekDay {
  day: string; // "MON"
  date: number; // 24
  fullDate: string; // "2023-10-24" (New field for matching)
}
// ... rest of your types
