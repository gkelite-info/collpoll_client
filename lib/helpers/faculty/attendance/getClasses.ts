"use server";

import { createClient } from "@/app/utils/supabase/server";

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
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hour, minute);
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

  const suffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
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

function safeGet(data: any, key: string, fallback: string = ""): string {
  if (!data) return fallback;
  if (Array.isArray(data)) {
    return data[0]?.[key] || fallback;
  }
  return data?.[key] || fallback;
}

export async function getUpcomingClasses(
  userId: number,
): Promise<UpcomingLesson[]> {
  const supabase = await createClient();

  const { data: faculty, error: facultyError } = await supabase
    .from("faculty")
    .select("facultyId")
    .eq("userId", userId)
    .single();

  if (facultyError || !faculty) {
    console.error("Faculty lookup failed", facultyError);
    return [];
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: events, error: eventsError } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId,
      date,
      fromTime,
      toTime,
      roomNo,
      type,

      topicData:college_subject_unit_topics (
        topicTitle
      ),

      subjectData:college_subjects (
        subjectName,
        subjectCode
      ),

      calendar_event_section (
        section:college_sections (collegeSections),
        branch:college_branch (collegeBranchCode),
        yearData:college_academic_year (collegeAcademicYear),
        semester:college_semester (collegeSemester),
        education:college_education (collegeEducationType)
      )
    `,
    )
    .eq("facultyId", faculty.facultyId)
    .eq("type", "class")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("fromTime", { ascending: true });

  if (eventsError) {
    console.error("Supabase Error:", eventsError);
    return [];
  }

  if (!events || events.length === 0) {
    return [];
  }

  return events.map((event: any) => {
    const sectionsData = event.calendar_event_section || [];

    const departments = Array.from(
      new Set(
        sectionsData.map((s: any) =>
          safeGet(s.branch, "collegeBranchCode", "Unknown Branch"),
        ),
      ),
    ).map((name) => ({ name: name as string }));

    const semesters = Array.from(
      new Set(
        sectionsData.map(
          (s: any) => `Sem ${safeGet(s.semester, "collegeSemester", "?")}`,
        ),
      ),
    );

    const sectionNames = Array.from(
      new Set(
        sectionsData.map((s: any) =>
          safeGet(s.section, "collegeSections", "Unknown"),
        ),
      ),
    ).join(", ");

    const firstSection = sectionsData[0];
    const degree = safeGet(
      firstSection?.education,
      "collegeEducationType",
      "B.Tech",
    );
    const yearString = safeGet(
      firstSection?.yearData,
      "collegeAcademicYear",
      "1",
    );
    const year = parseInt(yearString) || 1;

    const subjectName = safeGet(
      event.subjectData,
      "subjectName",
      "Unknown Subject",
    );

    const topicTitle = safeGet(event.topicData, "topicTitle");
    const description = topicTitle || `Class for ${sectionNames}`;

    return {
      id: event.calendarEventId.toString(),
      title: subjectName,
      description: description,
      fromTime: convertTo12HourFormat(event.fromTime),
      toTime: convertTo12HourFormat(event.toTime),
      date: formatDate(event.date),
      roomNo: event.roomNo,
      section: sectionNames,
      semester: semesters as string[],
      department: departments,
      degree: degree,
      year: year,
    };
  });
}

export async function getClassDetails(
  classId: string,
): Promise<UpcomingLesson | null> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId,
      date,
      fromTime,
      toTime,
      roomNo,
      
      topicData:college_subject_unit_topics (topicTitle),
      subjectData:college_subjects (subjectName),
      
      calendar_event_section (
        section:college_sections (collegeSections),
        branch:college_branch (collegeBranchCode),
        yearData:college_academic_year (collegeAcademicYear),
        semester:college_semester (collegeSemester),
        education:college_education (collegeEducationType)
      )
    `,
    )
    .eq("calendarEventId", classId)
    .single();

  if (error || !event) {
    console.error("Error fetching details:", error);
    return null;
  }

  const sectionsData = event.calendar_event_section || [];

  const departments = Array.from(
    new Set(
      sectionsData.map((s: any) => safeGet(s.branch, "collegeBranchCode")),
    ),
  ).map((name) => ({ name: name as string }));
  const semesters = Array.from(
    new Set(
      sectionsData.map(
        (s: any) => `Sem ${safeGet(s.semester, "collegeSemester")}`,
      ),
    ),
  );
  const sectionNames = Array.from(
    new Set(
      sectionsData.map((s: any) => safeGet(s.section, "collegeSections")),
    ),
  ).join(", ");

  const firstSection = sectionsData[0];
  const degree = safeGet(
    firstSection?.education,
    "collegeEducationType",
    "B.Tech",
  );
  const yearString = safeGet(firstSection?.yearData, "collegeAcademicYear");
  const year = parseInt(yearString) || 1;

  const subjectName = safeGet(
    event.subjectData,
    "subjectName",
    "Unknown Subject",
  );

  const topicTitle = safeGet(event.topicData, "topicTitle");
  const description = topicTitle || `Class for ${sectionNames}`;

  return {
    id: event.calendarEventId.toString(),
    title: subjectName,
    description: description,
    fromTime: convertTo12HourFormat(event.fromTime),
    toTime: convertTo12HourFormat(event.toTime),
    date: formatDate(event.date),
    roomNo: event.roomNo,
    section: sectionNames,
    semester: semesters as string[],
    department: departments,
    degree: degree,
    year: year,
  };
}
