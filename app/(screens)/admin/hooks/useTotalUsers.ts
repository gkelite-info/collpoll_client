"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAdminUserRoleCounts, type AdminUserRoleCounts } from "@/lib/helpers/admin/dashboard";

type DepartmentRow = {
  departmentId: number;
  departmentName: string;
  collegeEducationId: number;
  faculty: number;
  students: number;
  total: number;
};

export function useTotalUsers(
  collegeId: number | null,
  collegeEducationId: number | null,
) {
  const [roles, setRoles] = useState<AdminUserRoleCounts>({
    ADMIN: 0,
    FACULTY: 0,
    STUDENT: 0,
    PARENT: 0,
    FINANCE: 0,
    FINANCE_MANAGER: 0,
    ACCOUNTANT: 0,
    COLLEGE_HR: 0,
    PLACEMENT_OFFICER: 0,
    WELLBEING_EXECUTIVE: 0,
    WELLBEING_MANAGER: 0,
    GROUND_STAFF: 0,
  });

  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!collegeId) return;

      setLoading(true);
      try {
        setRoles(await getAdminUserRoleCounts(collegeId));

        let branchQuery = supabase
          .from("college_branch")
          .select(
            `
            collegeBranchId,
            collegeBranchType,
            collegeEducationId,
            students(count),
            faculty(count)
          `,
          )
          .eq("collegeId", collegeId)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (collegeEducationId) {
          branchQuery = branchQuery.eq("collegeEducationId", collegeEducationId);
        }

        const { data, error } = await branchQuery;

        if (error) throw error;

        const deptCounts: DepartmentRow[] =
          data?.map((d: any) => {
            const studentsCount =
              d.students?.[0]?.count ?? d.students?.count ?? 0;
            const facultyCount = d.faculty?.[0]?.count ?? d.faculty?.count ?? 0;

            return {
              departmentId: d.collegeBranchId,
              departmentName: d.collegeBranchType,
              collegeEducationId: d.collegeEducationId,
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
