import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface DepartmentOverview {
  departmentId: number;
  name: string;
  faculty: number;
  students: number;
  total: number;
}

export function useDepartmentsOverview() {
  const [departments, setDepartments] = useState<DepartmentOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("departments").select(`
          departmentId,
          departmentName,
          faculty_profiles(count),
          student_academic_profiles(count)
        `);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const mapped =
        data?.map((d: any) => {
          const faculty = d.faculty_profiles?.[0]?.count ?? 0;
          const students = d.student_academic_profiles?.[0]?.count ?? 0;

          return {
            departmentId: d.departmentId,
            name: d.departmentName,
            faculty,
            students,
            total: faculty + students,
          };
        }) ?? [];

      setDepartments(mapped);
      setLoading(false);
    }

    load();
  }, []);

  return { departments, loading };
}
