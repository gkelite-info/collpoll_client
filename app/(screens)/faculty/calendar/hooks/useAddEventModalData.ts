"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { supabase } from "@/lib/supabaseClient";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export const useAddEventModalData = (
  userId: number | null | undefined,
  collegeId: number | null | undefined,
  educationId: number | undefined,
  branchId: number | undefined,
  academicYearId: number | undefined,
  semester: number | undefined,
  subjectId: number | undefined
) => {
  const facultyCtxRaw = useFaculty();
  const isFacultyLoading = facultyCtxRaw.loading;
  
  // Transform it to not rely on the potentially null collegeEducationId
  // The 'sections' array contains all registered teaching assignments
  const facultyCtx = {
    collegeEducationId: facultyCtxRaw.collegeEducationId,
    collegeBranchId: facultyCtxRaw.collegeBranchId,
    subjectIds: facultyCtxRaw.subjectIds || [],
    sections: facultyCtxRaw.sections || [],
    academicYearIds: facultyCtxRaw.academicYearIds || [],
    faculty_edu_type: facultyCtxRaw.faculty_edu_type,
  };

  const isSingleSubject = facultyCtx.subjectIds.length <= 1;

  // Extract unique IDs from assigned sections to populate dropdowns accurately for multi-subject
  let assignedEducationIds = Array.from(new Set(facultyCtx.sections.map(s => s.collegeEducationId).filter(Boolean)));
  if (assignedEducationIds.length === 0 && facultyCtx.collegeEducationId) {
    assignedEducationIds = [facultyCtx.collegeEducationId];
  }
  let assignedBranchIds = Array.from(new Set(
    facultyCtx.sections
      .filter(s => s.collegeEducationId === educationId || s.collegeEducationId == null)
      .map(s => s.collegeBranchId)
      .filter(Boolean)
  ));
  if (assignedBranchIds.length === 0 && facultyCtx.collegeBranchId) {
    assignedBranchIds = [facultyCtx.collegeBranchId];
  }
  const assignedYearIds = Array.from(new Set(
    facultyCtx.sections
      .filter(s => 
        (s.collegeEducationId === educationId || s.collegeEducationId == null) && 
        (s.collegeBranchId === branchId || s.collegeBranchId == null)
      )
      .map(s => s.collegeAcademicYearId)
      .filter(Boolean)
  ));

  const { data: educations = [] } = useQuery({
    queryKey: ["academicDropdowns", "education", collegeId, assignedEducationIds],
    queryFn: async () => {
      if (!collegeId) return [];
      const data = await fetchAcademicDropdowns({ type: "education", collegeId });
      // Filter to assigned educations based on faculty sections
      return (data ?? []).filter(e => assignedEducationIds.includes(e.collegeEducationId));
    },
    enabled: !!collegeId,
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
    queryKey: ["assignedSubjects", collegeId, educationId, branchId, academicYearId, semester, facultyCtx.subjectIds],
    queryFn: async () => {
      if (!collegeId || !facultyCtx.subjectIds?.length) return [];
      
      // Filter the subjects that match the currently selected dropdowns for multi-subject faculty
      let validSubjectIds = facultyCtx.subjectIds;
      if (!isSingleSubject) {
        const eduType = educations.find(e => e.collegeEducationId === educationId)?.collegeEducationType || facultyCtx.faculty_edu_type;
        const isSchool = isSchoolEducation(eduType);
        const isCollege = !isSchool && eduType !== "Inter";
        
        // Force selecting upstream fields before showing subjects
        if (!educationId || !academicYearId) return [];
        if (isCollege && !semester) return [];
        if (!isSchool && branches.length > 0 && !branchId) return [];

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
    enabled: !!collegeId && !!facultyCtx.subjectIds?.length,
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["academicDropdowns", "semester", collegeId, educationId, branchId, academicYearId],
    queryFn: async () => {
      if (!collegeId || !educationId || !academicYearId) return [];
      
      const eduType = educations.find(e => e.collegeEducationId === educationId)?.collegeEducationType || facultyCtx.faculty_edu_type;
      const isSchool = isSchoolEducation(eduType);
      if (isSchool || eduType === "Inter") return []; // Schools and Inter don't have semesters

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
      if (!collegeId || !educationId || !academicYearId || !subjectId) return [];
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
    enabled: !!collegeId && !!educationId && !!academicYearId && !!subjectId,
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
