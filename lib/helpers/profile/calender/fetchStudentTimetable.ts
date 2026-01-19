import { supabase } from "@/lib/supabaseClient";

export async function fetchStudentTimetableByDate({
    date,
    degree,
    year,
    department,
}: {
    date: string;
    degree: string;
    year: string;
    department: string;
}) {
    console.log("📌 Timetable query params:", {
        date,
        degree,
        year,
        department,
    });

    const { data, error } = await supabase
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
        .eq("degree", degree)
        .eq("year", year)
        .eq("is_deleted", false)
        .order("fromTime", { ascending: true });

    const filtered = (data ?? []).filter(item =>
        item.department === null ||
        (Array.isArray(item.department) &&
            (item.department.length === 0 || item.department.includes(department)))
    );


    if (error) {
        console.error("❌ Timetable fetch error:", error);
        return [];
    }

    console.log("✅ Supabase raw data:", data);

    return (data ?? []).map((item: any) => ({
        calendarEventId: item.calendarEventId,
        fromTime: item.fromTime,
        toTime: item.toTime,
        eventTitle: item.eventTitle,
        eventTopic: item.eventTopic,
        roomNo: item.roomNo,
        facultyName: item.faculty?.fullName ?? "Faculty",
    }));
}
