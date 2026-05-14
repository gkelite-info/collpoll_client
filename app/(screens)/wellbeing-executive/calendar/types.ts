export type CalendarEventType = "class" | "meeting" | "exam" | "quiz";

export type CalendarEvent = {
  id: string;
  dayIndex: number;
  startHour: number;
  duration: number;
  time: string;
  title: string;
  topic?: string;
  participants?: string;
  type: CalendarEventType;
  branch?: string;
  year?: string;
  section?: string;
};

export type WeekDay = {
  label: string;
  date: number;
  fullDate: string;
};
