import { CalendarEvent, WeekDay } from "./types";

export const getEventStyle = (event: CalendarEvent) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

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

export const getWeekDays = (currentDate: Date): WeekDay[] => {
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();

  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const week: WeekDay[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    week.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: d.getDate(),
      fullDate: d.toISOString().split("T")[0],
    });
  }
  return week;
};

export const combineDateAndTime = (
  dateStr: string,
  timeStr: string
): string => {
  if (!dateStr || !timeStr) return new Date().toISOString();
  const d = new Date(dateStr + "T" + timeStr);
  return d.toISOString();
};
