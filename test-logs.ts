import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  try {
    const { data: logs, error } = await adminSupabase
      .from("device_attendance_logs")
      .select("*")
      .order("deviceAttendanceLogId", { ascending: false })
      .limit(5);
      
    console.log("LOGS:", JSON.stringify({ logs, error }, null, 2));

    const { data: att, error: err2 } = await adminSupabase
      .from("attendance_record")
      .select("*")
      .order("attendanceRecordId", { ascending: false })
      .limit(5);

    console.log("ATTENDANCE:", JSON.stringify({ att, error: err2 }, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
