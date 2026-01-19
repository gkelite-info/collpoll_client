import { supabase } from "@/lib/supabaseClient";

export type UpcomingClass = {
  calendarEventId: number;
  fromTime: string;      // HH:mm
  eventTitle: string;
  eventTopic: string;
  facultyName: string;
};

// ✅ local date helper (NO UTC bug)
const getTodayLocalDate = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

export async function fetchUpcomingClassesForStudent(): Promise<UpcomingClass[]> {
  const today = getTodayLocalDate();

  console.log("📅 Fetch upcoming classes from:", today);

  const { data, error } = await supabase
    .from("calendarEvent")
    .select(`
      calendarEventId,
      date,
      fromTime,
      eventTitle,
      eventTopic,
      faculty:facultyId ( fullName )
    `)
    .eq("is_deleted", false)
    .gte("date", today)                 // ✅ today + future
    .order("date", { ascending: true }) // first by date
    .order("fromTime", { ascending: true }); // then by time

  if (error) {
    console.error("❌ Error fetching upcoming classes:", error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    calendarEventId: item.calendarEventId,
    fromTime: item.fromTime?.slice(0, 5), // ✅ remove seconds
    eventTitle: item.eventTitle,
    eventTopic: item.eventTopic,
    facultyName: item.faculty?.fullName ?? "Faculty",
  }));
}
