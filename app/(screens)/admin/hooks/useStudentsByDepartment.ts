import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useStudentsByDepartment(departmentId: number) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("student_academic_profiles")
        .select(
          `
          rollNumber,
          semester,
          users (
            userId,
            fullName
          )
        `
        )
        .eq("departmentId", departmentId);

      setStudents(data ?? []);
      setLoading(false);
    }

    load();
  }, [departmentId]);

  return { students, loading };
}
