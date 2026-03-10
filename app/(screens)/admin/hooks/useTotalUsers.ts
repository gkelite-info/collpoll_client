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

export function useTotalUsers(
  collegeId: number | null,
  collegeEducationId: number | null,
) {
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
      if (!collegeId || !collegeEducationId) return;

      setLoading(true);
      try {
        const [
          { count: studentsCount },
          { count: facultyCount },
          { count: adminsCount },
          { count: parentsCount },
        ] = await Promise.all([
          supabase
            .from("students")
            .select("studentId", { count: "exact", head: true })
            .eq("collegeId", collegeId)
            .eq("collegeEducationId", collegeEducationId)
            .eq("isActive", true),

          supabase
            .from("faculty")
            .select("facultyId", { count: "exact", head: true })
            .eq("collegeId", collegeId)
            .eq("collegeEducationId", collegeEducationId)
            .eq("isActive", true),

          supabase
            .from("admins")
            .select("adminId", { count: "exact", head: true })
            .eq("collegeId", collegeId)
            .eq("collegeEducationId", collegeEducationId)
            .eq("is_deleted", false),

          supabase
            .from("parents")
            .select("parentId, students!inner(collegeEducationId)", {
              count: "exact",
              head: true,
            })
            .eq("collegeId", collegeId)
            .eq("students.collegeEducationId", collegeEducationId)
            .eq("is_deleted", false),
        ]);

        setRoles({
          ADMIN: adminsCount ?? 0,
          FACULTY: facultyCount ?? 0,
          STUDENT: studentsCount ?? 0,
          PARENT: parentsCount ?? 0,
        });

        const { data, error } = await supabase
          .from("college_branch")
          .select(
            `
            collegeBranchId,
            collegeBranchType,
            students(count),
            faculty(count)
          `,
          )
          .eq("collegeId", collegeId)
          .eq("collegeEducationId", collegeEducationId)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (error) throw error;

        const deptCounts: DepartmentRow[] =
          data?.map((d: any) => {
            const studentsCount =
              d.students?.[0]?.count ?? d.students?.count ?? 0;
            const facultyCount = d.faculty?.[0]?.count ?? d.faculty?.count ?? 0;

            return {
              departmentId: d.collegeBranchId,
              departmentName: d.collegeBranchType,
              students: studentsCount,
              faculty: facultyCount,
              total: studentsCount + facultyCount,
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
  }, [collegeId, collegeEducationId]);

  return { roles, departments, loading };
}
