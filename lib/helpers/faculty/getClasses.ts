"use server";

import { supabase } from "@/lib/supabaseClient";

interface CalendarEventDB {
  calendarEventId: number;
  eventTitle: string;
  eventTopic: string | null;
  type: string;
  date: string;
  fromTime: string;
  toTime: string;
  section: string;
  roomNo: string;

  semester: string[];
  department: { name: string }[];
  degree: string;
  year: number;
}

export interface UpcomingLesson {
  id: string;
  title: string;
  description: string;
  fromTime: string;
  toTime: string;
  section?: string;
  date?: string;
  roomNo?: string;
  semester: string[];
  department: { name: string }[];
  degree: string;
  year: number;
}

function convertTo12HourFormat(time: string): string {
  if (!time) return "";
  const [hour, minute, second] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hour, minute, second);
  const hours12 = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours12}:${minutes} ${ampm}`;
}

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  const suffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${day}${suffix(day)} ${month} ${year}`;
}

function parseSectionName(sectionString: string): string {
  let sectionName = "N/A";
  try {
    const parsed = JSON.parse(sectionString);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const firstItem = parsed[0];
      sectionName = firstItem.name ? firstItem.name : firstItem;
    } else {
      sectionName = parsed;
    }
  } catch {
    sectionName = sectionString;
  }
  return sectionName;
}

async function getFacultyIdByUserId(userId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from("faculty")
    .select("facultyId")
    .eq("userId", userId)
    .single();

  if (error || !data) {
    console.error("Faculty lookup failed:", error);
    return null;
  }
  return data.facultyId;
}

export async function getUpcomingClasses(
  userId: number
): Promise<UpcomingLesson[]> {
  const facultyId = await getFacultyIdByUserId(userId);

  if (!facultyId) return [];

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("calendarEvent")
    .select("*")
    .eq("type", "class")
    .eq("facultyId", facultyId)
    .order("date", { ascending: true })
    .order("fromTime", { ascending: true });

  if (error || !data) {
    console.error("Error fetching classes:", error);
    return [];
  }

  return data.map((event: CalendarEventDB) => {
    const sectionName = parseSectionName(event.section);

    return {
      id: event.calendarEventId.toString(),
      title: event.eventTitle,
      description: event.eventTopic || `Class for ${sectionName}`,
      fromTime: convertTo12HourFormat(event.fromTime),
      toTime: convertTo12HourFormat(event.toTime),
      date: formatDate(event.date),
      roomNo: event.roomNo,
      section: sectionName,
      semester: event.semester,
      department: event.department,
      degree: event.degree,
      year: event.year,
    };
  });
}

export async function getClassDetails(
  classId: string
): Promise<UpcomingLesson | null> {
  const { data, error } = await supabase
    .from("calendarEvent")
    .select("*")
    .eq("calendarEventId", classId)
    .single();

  if (error || !data) {
    console.error("Error fetching class details:", error);
    return null;
  }

  const event = data as CalendarEventDB;
  const sectionName = parseSectionName(event.section);

  return {
    id: event.calendarEventId.toString(),
    title: event.eventTitle,
    description: event.eventTopic || `Class for ${sectionName}`,
    fromTime: convertTo12HourFormat(event.fromTime),
    toTime: convertTo12HourFormat(event.toTime),
    date: formatDate(event.date),
    roomNo: event.roomNo,
    section: sectionName,
    semester: event.semester,
    department: event.department,
    degree: event.degree,
    year: event.year,
  };
}
