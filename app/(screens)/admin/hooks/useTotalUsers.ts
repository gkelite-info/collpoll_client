"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchRoleMembers, ROLE_ALIASES, type DashboardRoleKey } from "@/lib/helpers/admin/totalUserMembers";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import type { AdminUserRoleCounts } from "@/lib/helpers/admin/dashboard";

type DepartmentRow = {
  departmentId: number;
  departmentName: string;
  collegeEducationId: number;
  collegeAcademicYearId: number | null;
  school: boolean;
  faculty: number;
  students: number;
  total: number;
};
const EMPTY_COUNTS: AdminUserRoleCounts = { ADMIN: 0, FACULTY: 0, STUDENT: 0, PARENT: 0, FINANCE: 0, FINANCE_MANAGER: 0, ACCOUNTANT: 0, COLLEGE_HR: 0, PLACEMENT_OFFICER: 0, WELLBEING_EXECUTIVE: 0, WELLBEING_MANAGER: 0, GROUND_STAFF: 0 };

export function useTotalUsers(
  collegeId: number | null,
  collegeEducationId: number | null,
  branchOrYearId: number | null = null,
  page = 1,
  pageSize = 10,
  isSchoolContext = false
) {
  const [roles, setRoles] = useState<AdminUserRoleCounts>(EMPTY_COUNTS);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!collegeId) { if (mounted) setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const branchScope = { collegeId, educationId: collegeEducationId, branchId: isSchoolContext ? null : branchOrYearId };
        let branchQuery = supabase.from("college_branch").select("collegeBranchId, collegeBranchType, collegeEducationId")
          .eq("collegeId", collegeId).eq("isActive", true).is("deletedAt", null);
        let educationQuery = supabase.from("college_education").select("collegeEducationId, collegeEducationType")
          .eq("collegeId", collegeId).eq("isActive", true).is("deletedAt", null);
        let yearQuery = supabase.from("college_academic_year").select("collegeAcademicYearId, collegeAcademicYear, collegeEducationId")
          .eq("collegeId", collegeId).eq("isActive", true).is("deletedAt", null);

        if (collegeEducationId) {
          branchQuery = branchQuery.eq("collegeEducationId", collegeEducationId);
          educationQuery = educationQuery.eq("collegeEducationId", collegeEducationId);
          yearQuery = yearQuery.eq("collegeEducationId", collegeEducationId);
        }

        const [branchResult, educationResult, yearResult, counts] = await Promise.all([
          branchQuery.order("collegeBranchId"),
          educationQuery.order("collegeEducationId"),
          yearQuery.order("collegeAcademicYearId"),
          Promise.all((Object.keys(ROLE_ALIASES) as DashboardRoleKey[]).map(async (role) => [role, (await fetchRoleMembers(role, branchScope, 1, 10, true)).count] as const)),
        ]);
        if (branchResult.error) throw branchResult.error;
        if (educationResult.error) throw educationResult.error;
        if (yearResult.error) throw yearResult.error;

        const schoolIds = new Set((educationResult.data ?? []).filter((education) => isSchoolEducation(education.collegeEducationType)).map((education) => education.collegeEducationId));
        const schoolYears = (yearResult.data ?? []).filter((year) => schoolIds.has(year.collegeEducationId));

        const collegeGroups = (branchResult.data ?? [])
          .filter((branch) => !schoolIds.has(branch.collegeEducationId))
          .filter((branch) => !branchOrYearId || isSchoolContext ? true : branch.collegeBranchId === branchOrYearId)
          .map((branch) => ({
            departmentId: branch.collegeBranchId,
            departmentName: branch.collegeBranchType,
            collegeEducationId: branch.collegeEducationId,
            collegeAcademicYearId: null as number | null,
            school: false,
          }));

        const schoolEducationRows = (educationResult.data ?? []).filter((education) => schoolIds.has(education.collegeEducationId));
        const schoolYearGroups = schoolYears
          .filter((year) => !branchOrYearId || !isSchoolContext ? true : year.collegeAcademicYearId === branchOrYearId)
          .map((year) => ({
            departmentId: -year.collegeAcademicYearId,
            departmentName: year.collegeAcademicYear,
            collegeEducationId: year.collegeEducationId,
            collegeAcademicYearId: year.collegeAcademicYearId,
            school: true,
          }));

        // Fallback for school educations that have no academic years set up yet
        const schoolEmptyFallback = schoolEducationRows
          .filter((edu) => !schoolYears.some((y) => y.collegeEducationId === edu.collegeEducationId))
          .map((edu) => ({
            departmentId: -edu.collegeEducationId,
            departmentName: edu.collegeEducationType,
            collegeEducationId: edu.collegeEducationId,
            collegeAcademicYearId: null as number | null,
            school: true,
          }));

        const groups = [...collegeGroups, ...schoolYearGroups, ...schoolEmptyFallback];
        const scopeCounts = Object.fromEntries(counts) as AdminUserRoleCounts;

        const pagedGroups = groups.slice((page - 1) * pageSize, page * pageSize);
        const rows = await Promise.all(pagedGroups.map(async (group) => {
          if (group.school && group.collegeAcademicYearId) {
            const [facSec, stuHist] = await Promise.all([
              supabase.from("faculty_sections")
                .select("facultyId, faculty!inner(collegeId, isActive, deletedAt)")
                .eq("collegeAcademicYearId", group.collegeAcademicYearId)
                .eq("faculty.collegeId", collegeId)
                .eq("faculty.isActive", true).is("faculty.deletedAt", null)
                .eq("isActive", true).is("deletedAt", null),
              supabase.from("student_academic_history")
                .select("studentId, students!inner(collegeId, isActive, deletedAt)")
                .eq("collegeAcademicYearId", group.collegeAcademicYearId)
                .eq("students.collegeId", collegeId)
                .eq("students.isActive", true).is("students.deletedAt", null)
                .eq("isCurrent", true),
            ]);
            const facultyCount = new Set((facSec.data ?? []).map((f: any) => f.facultyId)).size;
            const studentsCount = new Set((stuHist.data ?? []).map((s: any) => s.studentId)).size;
            return { ...group, faculty: facultyCount, students: studentsCount, total: facultyCount + studentsCount };
          }

          const groupScope = { collegeId, educationId: group.collegeEducationId, branchId: group.school ? null : group.departmentId };
          if (groupScope.educationId === collegeEducationId && groupScope.branchId === branchOrYearId && !group.school) {
            return { ...group, faculty: scopeCounts.FACULTY, students: scopeCounts.STUDENT, total: scopeCounts.FACULTY + scopeCounts.STUDENT };
          }
          const [faculty, students] = await Promise.all([fetchRoleMembers("FACULTY", groupScope, 1, 10, true), fetchRoleMembers("STUDENT", groupScope, 1, 10, true)]);
          return { ...group, faculty: faculty.count, students: students.count, total: faculty.count + students.count };
        }));

        if (mounted) { setRoles(scopeCounts); setDepartments(rows); setTotalDepartments(groups.length); }
      } catch (err) {
        console.error("Total users load failed", err);
        if (mounted) { setError("Unable to load user counts. Please try again."); setDepartments([]); setTotalDepartments(0); }
      } finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, [collegeId, collegeEducationId, branchOrYearId, page, pageSize, isSchoolContext]);
  return { roles, departments, totalDepartments, loading, error };
}
