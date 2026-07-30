"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { supabase } from "@/lib/supabaseClient";
import { fetchFacultyContextAdmin, fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";

export const useAddEventModalData = (
  collegeId: number | null | undefined,
  facultyId: number | null | undefined,
  educationId: number | undefined,
  branchId: number | undefined,
  academicYearId: number | undefined,
  semester: number | undefined,
  subjectId: number | undefined
) => {
  // 1. Fetch the robust faculty context using TanStack Query
  const { data: facultyCtxRaw, isLoading: isFacultyLoading } = useQuery({
    queryKey: ["adminFacultyCtx", facultyId],
    queryFn: async () => {
      if (!facultyId) return null;
      // First get the admin context to find the userId
      const adminCtx = await fetchFacultyContextAdmin({ facultyId });
      // Then fetch the full rich context identical to what the faculty side uses
      return await fetchFacultyContext(adminCtx.userId);
    },
    enabled: !!facultyId,
  });

  const facultyCtx = facultyCtxRaw ? {
    collegeEducationId: facultyCtxRaw.collegeEducationId,
    collegeBranchId: facultyCtxRaw.collegeBranchId,
    subjectIds: facultyCtxRaw.subjectIds || [],
    sections: facultyCtxRaw.sections || [],
    academicYearIds: facultyCtxRaw.academicYearIds || [],
    faculty_edu_type: facultyCtxRaw.faculty_edu_type,
  } : null;

  const isSingleSubject = facultyCtx ? facultyCtx.subjectIds.length <= 1 : true;

  // Extract unique IDs from assigned sections to populate dropdowns accurately for multi-subject
  let assignedEducationIds = facultyCtx ? Array.from(new Set(facultyCtx.sections.map(s => s.collegeEducationId).filter(Boolean))) : [];
  if (assignedEducationIds.length === 0 && facultyCtx?.collegeEducationId) {
    assignedEducationIds = [facultyCtx.collegeEducationId];
  }
  
  let assignedBranchIds = facultyCtx ? Array.from(new Set(
    facultyCtx.sections
      .filter(s => s.collegeEducationId === educationId || s.collegeEducationId == null)
      .map(s => s.collegeBranchId)
      .filter(Boolean)
  )) : [];
  if (assignedBranchIds.length === 0 && facultyCtx?.collegeBranchId) {
    assignedBranchIds = [facultyCtx.collegeBranchId];
  }
  
  const assignedYearIds = facultyCtx ? Array.from(new Set(
    facultyCtx.sections
      .filter(s => 
        (s.collegeEducationId === educationId || s.collegeEducationId == null) && 
        (s.collegeBranchId === branchId || s.collegeBranchId == null)
      )
      .map(s => s.collegeAcademicYearId)
      .filter(Boolean)
  )) : [];

  const { data: educations = [] } = useQuery({
    queryKey: ["academicDropdowns", "education", collegeId, assignedEducationIds],
    queryFn: async () => {
      if (!collegeId) return [];
      const data = await fetchAcademicDropdowns({ type: "education", collegeId });
      return (data ?? []).filter(e => assignedEducationIds.includes(e.collegeEducationId));
    },
    enabled: !!collegeId && assignedEducationIds.length > 0,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["academicDropdowns", "branch", collegeId, educationId, assignedBranchIds],
    queryFn: async () => {
      if (!collegeId || !educationId) return [];
      const data = await fetchAcademicDropdowns({ type: "branch", collegeId, educationId });
      return (data ?? []).filter(b => assignedBranchIds.includes(b.collegeBranchId));
    },
    enabled: !!collegeId && !!educationId,
  });

  const { data: academicYears = [] } = useQuery({
    queryKey: ["academicDropdowns", "academicYear", collegeId, educationId, branchId, assignedYearIds],
    queryFn: async () => {
      if (!collegeId || !educationId) return [];
      const data = await fetchAcademicDropdowns({
        type: "academicYear",
        collegeId,
        educationId,
        branchId: branchId || undefined,
      });
      return (data ?? []).filter(y => assignedYearIds.includes(y.collegeAcademicYearId));
    },
    enabled: !!collegeId && !!educationId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["assignedSubjects", collegeId, educationId, branchId, academicYearId, semester, facultyCtx?.subjectIds],
    queryFn: async () => {
      if (!collegeId || !facultyCtx?.subjectIds?.length) return [];
      
      let validSubjectIds = facultyCtx.subjectIds;
      if (!isSingleSubject) {
        const eduType = educations.find(e => e.collegeEducationId === educationId)?.collegeEducationType || facultyCtx.faculty_edu_type;
        const isCollege = eduType !== "Inter";
        
        if (!educationId || !academicYearId) return [];
        if (isCollege && !semester) return [];
        if (isCollege && branches.length > 0 && !branchId) return [];

        validSubjectIds = facultyCtx.sections
          .filter(s => 
            s.collegeEducationId === educationId &&
            s.collegeAcademicYearId === academicYearId &&
            (s.collegeBranchId === branchId || s.collegeBranchId === null)
          )
          .map(s => s.collegeSubjectId);
      }

      if (validSubjectIds.length === 0) return [];

      let query = supabase
        .from("college_subjects")
        .select("collegeSubjectId, subjectName, collegeAcademicYearId, collegeSemesterId, collegeEducationId, collegeBranchId")
        .eq("collegeId", collegeId)
        .in("collegeSubjectId", validSubjectIds)
        .eq("isActive", true)
        .is("deletedAt", null);

      if (semester) {
        query = query.eq("collegeSemesterId", semester);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!collegeId && !!facultyCtx?.subjectIds?.length,
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["academicDropdowns", "semester", collegeId, educationId, branchId, academicYearId],
    queryFn: async () => {
      if (!collegeId || !educationId || !academicYearId) return [];
      
      const eduType = educations.find(e => e.collegeEducationId === educationId)?.collegeEducationType || facultyCtx?.faculty_edu_type;
      if (eduType === "Inter") return [];

      return (await fetchAcademicDropdowns({
        type: "semester",
        collegeId,
        educationId,
        branchId: branchId || undefined,
        academicYearId,
      })) ?? [];
    },
    enabled: !!collegeId && !!educationId && !!academicYearId,
  });

  const { data: sections = [], isFetching: isSectionsFetching } = useQuery<any[]>({
    queryKey: ["academicDropdowns", "section", collegeId, educationId, branchId, academicYearId, subjectId],
    queryFn: async () => {
      if (!collegeId || !educationId || !academicYearId || !subjectId || !facultyCtx) return [];
      const allSections = await fetchAcademicDropdowns({
        type: "section",
        collegeId,
        educationId,
        branchId: branchId || undefined,
        academicYearId,
      });

      const assignedSectionIds = facultyCtx.sections
        .filter((s: any) => s.collegeSubjectId === subjectId)
        .map((s: any) => s.collegeSectionsId);

      return (allSections ?? []).filter((s: any) => assignedSectionIds.includes(s.collegeSectionsId));
    },
    enabled: !!collegeId && !!educationId && !!academicYearId && !!subjectId && !!facultyCtx,
  });

  const { data: topics = [] } = useQuery({
    queryKey: ["subjectTopics", collegeId, subjectId],
    queryFn: async () => {
      if (!collegeId || !subjectId) return [];
      const { data, error } = await supabase
        .from("college_subject_unit_topics")
        .select("collegeSubjectUnitTopicId, topicTitle")
        .eq("collegeSubjectId", subjectId)
        .eq("collegeId", collegeId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!collegeId && !!subjectId,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["subjectUnits", collegeId, subjectId],
    queryFn: async () => {
      if (!collegeId || !subjectId) return [];
      const { data, error } = await supabase
        .from("college_subject_units")
        .select("collegeSubjectUnitId, unitTitle, unitNumber")
        .eq("collegeSubjectId", subjectId)
        .eq("collegeId", collegeId)
        .order("unitNumber", { ascending: true });
      
      if (error) throw error;
      const unitsData = data ?? [];
      unitsData.sort((a, b) => Number(a.unitNumber) - Number(b.unitNumber));
      return unitsData;
    },
    enabled: !!collegeId && !!subjectId,
  });

  return {
    facultyCtx,
    isFacultyLoading,
    isSingleSubject,
    educations,
    branches,
    academicYears,
    semesters,
    sections,
    isSectionsFetching,
    subjects,
    topics,
    units,
  };
};
