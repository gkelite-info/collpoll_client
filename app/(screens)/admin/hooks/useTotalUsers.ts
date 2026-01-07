"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RoleCounts = {
  ADMIN: number;
  FACULTY: number;
  STUDENT: number;
  PARENT: number;
};

type DepartmentRow = {
  departmentId: number;
  departmentName: string;
  faculty: number;
  students: number;
  total: number;
};

export function useTotalUsers() {
  const [roles, setRoles] = useState<RoleCounts>({
    ADMIN: 0,
    FACULTY: 0,
    STUDENT: 0,
    PARENT: 0,
  });

  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const roleResults = await Promise.all(
          ["Admin", "Faculty", "Student", "Parent"].map(async (role) => {
            const { count, error } = await supabase
              .from("users")
              .select("*", { count: "exact", head: true })
              .eq("role", role)
              .eq("is_deleted", false);

            if (error) throw error;

            return { role, count: count ?? 0 };
          })
        );

        setRoles({
          ADMIN: roleResults.find((r) => r.role === "Admin")?.count ?? 0,
          FACULTY: roleResults.find((r) => r.role === "Faculty")?.count ?? 0,
          STUDENT: roleResults.find((r) => r.role === "Student")?.count ?? 0,
          PARENT: roleResults.find((r) => r.role === "Parent")?.count ?? 0,
        });

        /* ===============================
           DEPARTMENT OVERVIEW
        =============================== */

        const { data, error } = await supabase.from("departments").select(`
            departmentId,
            departmentName,
            student_academic_profiles(count),
            faculty_profiles(count)
          `);

        if (error) throw error;

        const deptCounts: DepartmentRow[] =
          data?.map((d: any) => {
            const students = d.student_academic_profiles?.[0]?.count ?? 0;
            const faculty = d.faculty_profiles?.[0]?.count ?? 0;

            return {
              departmentId: d.departmentId,
              departmentName: d.departmentName,
              students,
              faculty,
              total: students + faculty,
            };
          }) ?? [];

        setDepartments(deptCounts);
      } catch (e) {
        console.error("Total users load failed", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    roles,
    departments,
    loading,
  };
}
