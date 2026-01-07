import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFacultyByDepartment(departmentId: number) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("faculty_profiles")
        .select(
          `
          facultyId,
          designation,
          qualification,
          experienceYears,
          users (
            userId,
            fullName,
            email
          )
        `
        )
        .eq("departmentId", departmentId);

      if (!error) {
        setFaculty(data ?? []);
      }

      setLoading(false);
    }

    load();
  }, [departmentId]);

  return { faculty, loading };
}
