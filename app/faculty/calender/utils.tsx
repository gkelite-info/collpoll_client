// src/components/calendar/utils.ts
import { CalendarEvent, WeekDay } from "./types";

// --- Position Calculation ---
export const getEventStyle = (event: CalendarEvent) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  // Set start of day to 8:00 AM
  const startOfDay = new Date(start);
  startOfDay.setHours(8, 0, 0, 0);

  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  const minutesFromStart =
    (start.getTime() - startOfDay.getTime()) / (1000 * 60);
  const PIXELS_PER_MIN = 2;

  return {
    top: `${minutesFromStart * PIXELS_PER_MIN}px`,
    height: `${durationMinutes * PIXELS_PER_MIN}px`,
  };
};

// --- Date Helpers ---

// Get the Monday-Friday dates for the week containing 'currentDate'
export const getWeekDays = (currentDate: Date): WeekDay[] => {
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)

  // Adjust to get Monday (if Sunday (0), go back 6 days, else go back day-1)
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const week: WeekDay[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    week.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), // "MON"
      date: d.getDate(),
      fullDate: d.toISOString().split("T")[0], // "2023-10-24" for comparing
    });
  }
  return week;
};

// Format "2023-10-24" + "14:30" into ISO string
export const combineDateAndTime = (
  dateStr: string,
  timeStr: string
): string => {
  if (!dateStr || !timeStr) return new Date().toISOString();
  // Create a date object from input
  const d = new Date(dateStr + "T" + timeStr);
  return d.toISOString();
};
