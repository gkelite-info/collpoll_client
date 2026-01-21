export type EventType = "meeting" | "class" | "exam" | "quiz";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: string;
  endTime: string;
  day: string;
  rawFormData?: any;
}

export interface WeekDay {
  day: string;
  date: number;
  fullDate: string;
}
