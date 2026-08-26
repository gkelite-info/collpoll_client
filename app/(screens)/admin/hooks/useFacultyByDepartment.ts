import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFacultyByDepartment(
  departmentId: number,
  yearId: number | null,
  shouldFetch: boolean,
  sectionId: number | null,
  collegeId: number,
  collegeEducationId: number,
  page: number = 1,
  limit: number = 10,
) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!shouldFetch || !collegeId || !collegeEducationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [legacyResult, assignmentResult, branchResult] = await Promise.all([
        supabase.from("faculty").select("facultyId")
          .eq("collegeId", collegeId).eq("collegeEducationId", collegeEducationId)
          .eq("collegeBranchId", departmentId).eq("isActive", true).is("deletedAt", null),
        supabase.from("faculty_sections")
          .select("facultyId, collegeSubjectId, collegeSectionsId, collegeAcademicYearId, college_sections!inner(collegeEducationId, collegeBranchId)")
          .eq("college_sections.collegeEducationId", collegeEducationId)
          .eq("college_sections.collegeBranchId", departmentId)
          .eq("isActive", true).is("deletedAt", null),
        supabase.from("college_branch").select("collegeBranchCode, collegeBranchType")
          .eq("collegeBranchId", departmentId).maybeSingle(),
      ]);

      if (assignmentResult.error) console.error("Failed to load faculty assignments", assignmentResult.error);
      const scopedAssignments = (assignmentResult.data ?? []).filter((assignment: any) =>
        (!yearId || assignment.collegeAcademicYearId === yearId) &&
        (!sectionId || assignment.collegeSectionsId === sectionId),
      );
      const facultyIds = [...new Set([
        ...(legacyResult.data ?? []).map((item) => item.facultyId),
        ...scopedAssignments.map((item: any) => item.facultyId),
      ])];

      if (!facultyIds.length) {
        if (mounted) { setFaculty([]); setTotalCount(0); setLoading(false); }
        return;
      }

      const { data, count, error } = await supabase.from("faculty").select(`
        facultyId, collegeId, fullName, email, role, userId, mobile,
        collegeEducationId, collegeBranchId, gender,
        users!faculty_userId_fkey (
          dateOfJoining, professionalExperienceYears, gender,
          user_profile!left (profileUrl)
        )
      `, { count: "exact" })
        .eq("collegeId", collegeId).in("facultyId", facultyIds)
        .eq("isActive", true).is("deletedAt", null)
        .order("fullName", { ascending: true }).range(from, to);

      if (error || !data) {
        console.error("Failed to load faculty", error);
        if (mounted) { setFaculty([]); setTotalCount(0); setLoading(false); }
        return;
      }

      const pageFacultyIds = data.map((item: any) => item.facultyId);
      const pageAssignments = scopedAssignments.filter((assignment: any) => pageFacultyIds.includes(assignment.facultyId));
      const subjectIds = [...new Set(pageAssignments.map((assignment: any) => assignment.collegeSubjectId).filter(Boolean))];
      const { data: subjectRows, error: subjectError } = subjectIds.length
        ? await supabase.from("college_subjects").select("collegeSubjectId, subjectName").in("collegeSubjectId", subjectIds)
        : { data: [], error: null };
      if (subjectError) console.error("Failed to load subject names", subjectError);

      const subjectNameById = new Map((subjectRows ?? []).map((subject: any) => [
        subject.collegeSubjectId, String(subject.subjectName).replace(/_/g, " "),
      ]));
      const subjectsByFaculty = new Map<number, string[]>();
      pageAssignments.forEach((assignment: any) => {
        const subjectName = subjectNameById.get(assignment.collegeSubjectId);
        if (!subjectName) return;
        const names = subjectsByFaculty.get(assignment.facultyId) ?? [];
        if (!names.includes(subjectName)) names.push(subjectName);
        subjectsByFaculty.set(assignment.facultyId, names);
      });

      const branchLabel = branchResult.data?.collegeBranchCode ?? branchResult.data?.collegeBranchType ?? "Not assigned";
      const mapped = data.map((row: any) => ({
        ...row,
        collegeBranchCode: branchLabel,
        designation: row.role || "Faculty",
        subject: subjectsByFaculty.get(row.facultyId)?.join(", ") || "Not assigned",
        dateOfJoining: row.users?.dateOfJoining ?? null,
        experienceYears: row.users?.professionalExperienceYears ?? null,
        gender: row.users?.gender ?? row.gender ?? null,
        users: {
          userId: row.userId, fullName: row.fullName, email: row.email,
          avatar: Array.isArray(row.users?.user_profile)
            ? row.users.user_profile[0]?.profileUrl ?? null
            : row.users?.user_profile?.profileUrl ?? null,
        },
      }));
      if (mounted) { setFaculty(mapped); setTotalCount(count ?? 0); setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [departmentId, yearId, shouldFetch, sectionId, collegeId, collegeEducationId, page, limit]);

  return { faculty, loading, totalCount };
}
