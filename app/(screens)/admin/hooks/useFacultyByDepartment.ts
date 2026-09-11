import { useEffect, useState } from "react";
import { getFacultyIds, getFacultyAssignments } from "@/lib/helpers/admin/totalUserMembers";
import { supabase } from "@/lib/supabaseClient";

export function useFacultyByDepartment(
  departmentId: number | null,
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

      const [scopedFacultyIds, scopedAssignments, branchResult] = await Promise.all([
        getFacultyIds({ collegeId, educationId: collegeEducationId, branchId: departmentId }),
        getFacultyAssignments({ collegeId, educationId: collegeEducationId, branchId: departmentId }, yearId, sectionId),
        departmentId ? supabase.from("college_branch").select("collegeBranchCode, collegeBranchType")
          .eq("collegeBranchId", departmentId).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      const facultyIds = yearId || sectionId ? [...new Set(scopedAssignments.map((assignment) => assignment.facultyId))] : scopedFacultyIds;

      if (!facultyIds.length) {
        if (mounted) { setFaculty([]); setTotalCount(0); setLoading(false); }
        return;
      }

      const { data, count, error } = await supabase.from("faculty").select(`
        facultyId, collegeId, fullName, email, role, userId, mobile,
        collegeEducationId, collegeBranchId, gender,
        users!faculty_userId_fkey!inner (
          dateOfJoining, professionalExperienceYears, gender,
          user_profile!left (profileUrl)
        )
      `, { count: "exact" })
        .eq("collegeId", collegeId).in("facultyId", facultyIds)
        .eq("isActive", true).is("deletedAt", null)
        .eq("users.isActive", true).eq("users.is_deleted", false)
        .order("fullName", { ascending: true }).range(from, to);

      if (error || !data) {
        console.error("Failed to load faculty", error);
        if (mounted) { setFaculty([]); setTotalCount(0); setLoading(false); }
        return;
      }

      const pageFacultyIds = data.map((item: any) => item.facultyId);
      const pageAssignments = scopedAssignments.filter((assignment: any) => pageFacultyIds.includes(assignment.facultyId));
      const subjectIds = [...new Set(pageAssignments.map((assignment: any) => assignment.collegeSubjectId).filter(Boolean))];
      const sectionIds = [...new Set(pageAssignments.map((assignment: any) => assignment.collegeSectionsId).filter(Boolean))];

      const [subjectRes, sectionRes] = await Promise.all([
        subjectIds.length
          ? supabase.from("college_subjects").select("collegeSubjectId, subjectName").in("collegeSubjectId", subjectIds)
          : Promise.resolve({ data: [], error: null }),
        sectionIds.length
          ? supabase.from("college_sections").select("collegeSectionsId, collegeSections").in("collegeSectionsId", sectionIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      const subjectRows = subjectRes.data ?? [];
      const sectionRows = sectionRes.data ?? [];
      if (subjectRes.error) console.error("Failed to load subject names", subjectRes.error);
      if (sectionRes.error) console.error("Failed to load section names", sectionRes.error);

      const subjectNameById = new Map((subjectRows ?? []).map((subject: any) => [
        subject.collegeSubjectId, String(subject.subjectName).replace(/_/g, " "),
      ]));
      const sectionNameById = new Map((sectionRows ?? []).map((sec: any) => [
        sec.collegeSectionsId, String(sec.collegeSections ?? "").trim(),
      ]));

      const subjectsByFaculty = new Map<number, string[]>();
      const sectionsByFaculty = new Map<number, string[]>();
      pageAssignments.forEach((assignment: any) => {
        const subjectName = subjectNameById.get(assignment.collegeSubjectId);
        if (subjectName) {
          const names = subjectsByFaculty.get(assignment.facultyId) ?? [];
          if (!names.includes(subjectName)) names.push(subjectName);
          subjectsByFaculty.set(assignment.facultyId, names);
        }
        const sectionName = sectionNameById.get(assignment.collegeSectionsId);
        if (sectionName) {
          const secNames = sectionsByFaculty.get(assignment.facultyId) ?? [];
          if (!secNames.includes(sectionName)) secNames.push(sectionName);
          sectionsByFaculty.set(assignment.facultyId, secNames);
        }
      });

      const branchLabel = branchResult.data?.collegeBranchCode ?? branchResult.data?.collegeBranchType ?? "N/A";
      const mapped = data.map((row: any) => ({
        ...row,
        collegeBranchCode: branchLabel,
        designation: row.role || "Faculty",
        subject: subjectsByFaculty.get(row.facultyId)?.join(", ") || "Not assigned",
        sections: sectionsByFaculty.get(row.facultyId)?.join(", ") || "—",
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
    load().catch((error) => {
      console.error("Failed to load faculty", error);
      if (mounted) { setFaculty([]); setTotalCount(0); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [departmentId, yearId, shouldFetch, sectionId, collegeId, collegeEducationId, page, limit]);

  return { faculty, loading, totalCount };
}
