import React, { useEffect } from "react";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { useQuery } from "@tanstack/react-query";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { supabase } from "@/lib/supabaseClient";

type UseAcademicsDropdownsProps = {
  isOpen: boolean;
  collegeId: number | null | undefined;
  loading: boolean;
  facultyCtx: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  facultySubjects: any[];
};

export function useAcademicsDropdowns({
  isOpen,
  collegeId,
  loading,
  facultyCtx,
  formData,
  setFormData,
  facultySubjects,
}: UseAcademicsDropdownsProps) {
  const isEnabled = isOpen && !!collegeId && !loading && !!facultyCtx;

  // 1. Educations Query
  const { data: rawEducations = [], isLoading: eduLoading } = useQuery({
    queryKey: ["academicDropdowns", "education", collegeId],
    queryFn: () => fetchAcademicDropdowns({ type: "education", collegeId: collegeId! }),
    enabled: isEnabled,
  });
  const educations = facultyCtx?.educationIds?.length > 0
    ? rawEducations.filter((e: any) => facultyCtx.educationIds.includes(e.collegeEducationId))
    : rawEducations;

  const currentEducation = educations.find((e: any) => e.collegeEducationId === formData.educationId)?.collegeEducationType;
  const isSchool = isSchoolEducation(currentEducation);

  // 2. Branches Query
  const { data: rawBranches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["academicDropdowns", "branch", collegeId, formData.educationId],
    queryFn: () =>
      fetchAcademicDropdowns({
        type: "branch",
        collegeId: collegeId!,
        educationId: formData.educationId!,
      }),
    enabled: isEnabled && !!formData.educationId && !isSchool,
  });
  const branches = facultyCtx?.branchIds?.length > 0
    ? rawBranches.filter((b: any) => facultyCtx.branchIds.includes(b.collegeBranchId))
    : rawBranches;

  // 3. Academic Years Query
  const { data: rawAcademicYears = [], isLoading: yearsLoading } = useQuery({
    queryKey: ["academicDropdowns", "academicYear", collegeId, formData.educationId, formData.branchId],
    queryFn: () =>
      fetchAcademicDropdowns({
        type: "academicYear",
        collegeId: collegeId!,
        educationId: formData.educationId!,
        branchId: isSchool ? null : formData.branchId,
      }),
    enabled: isEnabled && !!formData.educationId && (isSchool || !!formData.branchId),
  });
  const academicYears = facultyCtx?.academicYearIds?.length > 0
    ? rawAcademicYears.filter((y: any) => facultyCtx.academicYearIds.includes(y.collegeAcademicYearId))
    : rawAcademicYears;

  // 4. Semesters Query
  const { data: semesters = [], isLoading: semestersLoading } = useQuery({
    queryKey: ["academicDropdowns", "semester", collegeId, formData.educationId, formData.branchId, formData.academicYearId],
    queryFn: () =>
      fetchAcademicDropdowns({
        type: "semester",
        collegeId: collegeId!,
        educationId: formData.educationId!,
        academicYearId: formData.academicYearId!,
        branchId: isSchool ? null : formData.branchId,
      }),
    enabled: isEnabled && !!formData.academicYearId && !isSchool && facultyCtx?.faculty_edu_type !== "Inter",
  });

  // 5. Sections Query
  const { data: rawSections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["academicDropdowns", "section", collegeId, formData.educationId, formData.branchId, formData.academicYearId],
    queryFn: async () => {
      const secs = await fetchAcademicDropdowns({
        type: "section",
        collegeId: collegeId!,
        educationId: formData.educationId!,
        academicYearId: formData.academicYearId!,
        branchId: isSchool ? null : formData.branchId,
      });
      return secs ?? [];
    },
    enabled: isEnabled && !!formData.academicYearId,
  });
  const sections = (() => {
    if (!formData.subjectId || !facultyCtx?.sections) return rawSections;
    
    // Get the exact sections assigned to this subject directly from faculty context
    const assignedSections = facultyCtx.sections
      .filter((s: any) => Number(s.collegeSubjectId) === Number(formData.subjectId))
      .map((s: any) => ({
        collegeSectionsId: s.collegeSectionsId,
        collegeSections: s.college_sections?.collegeSections || ""
      }));

    if (assignedSections.length === 0) return rawSections;
    return assignedSections;
  })();

  // 6. Subjects Query
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["academicDropdowns", "subject", collegeId, formData.educationId, formData.branchId, formData.academicYearId, formData.semester],
    queryFn: async () => {
      let query = supabase
        .from("college_subjects")
        .select("collegeSubjectId, subjectName")
        .eq("collegeId", collegeId!)
        .eq("collegeEducationId", formData.educationId!)
        .eq("collegeAcademicYearId", formData.academicYearId!)
        .in("collegeSubjectId", facultyCtx.subjectIds ?? [])
        .eq("isActive", true);

      if (!isSchool) {
        query = query.eq("collegeBranchId", formData.branchId!);
      }
      if (!isSchool && facultyCtx?.faculty_edu_type !== "Inter") {
        query = query.eq("collegeSemesterId", formData.semester!);
      }

      const { data } = await query;
      return data ?? [];
    },
    enabled: isEnabled && !!formData.academicYearId && (isSchool || !!formData.branchId) && (isSchool || facultyCtx?.faculty_edu_type === "Inter" || !!formData.semester),
  });

  const isDropdownsLoading = eduLoading || branchesLoading || yearsLoading || semestersLoading || sectionsLoading || subjectsLoading;

  // Autofill logic via separate useEffects
  useEffect(() => {
    if (educations.length === 1 && formData.educationId !== educations[0].collegeEducationId) {
      setFormData((prev: any) => ({ ...prev, educationId: educations[0].collegeEducationId }));
    }
  }, [educations, formData.educationId, setFormData]);

  useEffect(() => {
    if (branches.length === 1 && formData.branchId !== branches[0].collegeBranchId) {
      setFormData((prev: any) => ({ ...prev, branchId: branches[0].collegeBranchId }));
    }
  }, [branches, formData.branchId, setFormData]);

  useEffect(() => {
    if (academicYears.length === 1 && formData.academicYearId !== academicYears[0].collegeAcademicYearId) {
      setFormData((prev: any) => ({ ...prev, academicYearId: academicYears[0].collegeAcademicYearId }));
    }
  }, [academicYears, formData.academicYearId, setFormData]);

  useEffect(() => {
    if (semesters.length === 1 && formData.semester !== semesters[0].collegeSemesterId) {
      setFormData((prev: any) => ({ ...prev, semester: semesters[0].collegeSemesterId }));
    }
  }, [semesters, formData.semester, setFormData]);

  useEffect(() => {
    if (subjects.length === 1 && formData.collegeSubjectId !== subjects[0].collegeSubjectId) {
      setFormData((prev: any) => ({
        ...prev,
        collegeSubjectId: subjects[0].collegeSubjectId,
        subjectId: subjects[0].collegeSubjectId,
        subjectName: subjects[0].subjectName,
      }));
    }
  }, [subjects, formData.collegeSubjectId, setFormData]);

  return {
    educations,
    branches,
    academicYears,
    semesters,
    subjects,
    sections,
    isDropdownsLoading,
  };
}
