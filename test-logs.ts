import { createClient } from "@supabase/supabase-js";
import { getStudentProgressData } from "./lib/helpers/student/studentProgress/getStudentProgressData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  try {
    const { data: students, error: studentError } = await adminSupabase
      .from("students")
      .select("studentId, userId, rollNo")
      .eq("isActive", true)
      .limit(5);

    if (studentError) {
      return;
    }

    for (const student of students ?? []) {
      if (!student.userId) continue;
      try {
        await getStudentProgressData(student.userId);
      } catch (err) {
      }
    }
  } catch (e) {
    console.error("Failed");
  }
})();
