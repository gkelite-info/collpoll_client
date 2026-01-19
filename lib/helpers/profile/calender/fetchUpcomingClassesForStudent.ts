import { supabase } from "@/lib/supabaseClient";

export type UpcomingClass = {
  calendarEventId: number;
  fromTime: string;
  eventTitle: string;
  eventTopic: string;
  facultyName: string;
};

export async function fetchUpcomingClassesForStudent(): Promise<UpcomingClass[]> {

  // ✅ get today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("calendarEvent")
    .select(`
      calendarEventId,
      fromTime,
      eventTitle,
      eventTopic,
      faculty:facultyId ( fullName )
    `)
    .eq("is_deleted", false)
    // ✅ ONLY ADDITION — current & future dates
    .gte("date", today)
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming classes:", error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    calendarEventId: item.calendarEventId,
    fromTime: item.fromTime,
    eventTitle: item.eventTitle,
    eventTopic: item.eventTopic,
    facultyName: item.faculty?.fullName || "Faculty",
  }));
}
