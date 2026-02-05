export type EventType = "meeting" | "class" | "exam" | "quiz";

export interface CalendarEvent {
  id: string;
  calendarEventId: number;
  title: string;
  type: EventType;
  startTime: string;
  endTime: string;
  day: string;
  branch?: string;
  year?: string;
  section?: string;
  rawFormData?: any;
}

export interface WeekDay {
  day: string;
  date: number;
  fullDate: string;
}
