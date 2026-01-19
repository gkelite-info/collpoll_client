import { supabase } from "@/lib/supabaseClient";

export async function fetchStudentTimetableByDate({
  date,
  degree,
  year,
  department,
}: {
  date: string;
  degree?: string;
  year?: string;
  department?: string;
}) {
  let query = supabase
    .from("calendarEvent")
    .select(`
      calendarEventId,
      fromTime,
      toTime,
      eventTitle,
      eventTopic,
      roomNo,
      department,
      faculty:facultyId ( fullName )
    `)
    .eq("date", date)
    .eq("is_deleted", false);

  if (degree) query = query.eq("degree", degree);
  if (year) query = query.eq("year", year);

  const { data, error } = await query.order("fromTime", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  const filtered = department
    ? (data ?? []).filter(item =>
        Array.isArray(item.department) &&
        item.department.some((d: any) => d.name === department)
      )
    : data ?? [];

  return filtered.map((item: any) => ({
    fromTime: item.fromTime,
    toTime: item.toTime,
    eventTitle: item.eventTitle,
    eventTopic: item.eventTopic,
    roomNo: item.roomNo,
    facultyName: item.faculty?.fullName ?? "Faculty",
  }));
}
