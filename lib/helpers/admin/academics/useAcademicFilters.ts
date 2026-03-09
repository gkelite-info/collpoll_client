"use client";

import { useEffect, useState } from "react";
import {
  fetchEducations,
  fetchBranches,
  fetchAcademicYears,
  fetchSections,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { getSubjects } from "./getAdminAcademicsCards";

export function useAcademicFilters(userId?: number) {
  const [collegeId, setCollegeId] = useState<number | null>(null);

  const [educations, setEducations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  const [education, setEducation] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [year, setYear] = useState<any>(null);
  const [section, setSection] = useState<any>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [subject, setSubject] = useState<any | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchAdminContext(userId).then((ctx) => {
      setCollegeId(ctx.collegeId);
    });
  }, [userId]);

  useEffect(() => {
    if (!collegeId) return;
    fetchEducations(collegeId).then(setEducations);
  }, [collegeId]);

  useEffect(() => {
    if (!collegeId || !branch || !year || !section) {
      setSubjects([]);
      setSubject(null);
      return;
    }

    getSubjects(collegeId, branch.collegeBranchId, year.collegeAcademicYearId)
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, [collegeId, branch, year, section]);

  const selectEducation = async (edu: any) => {
    if (!collegeId) return;
    setEducation(edu);
    setBranch(null);
    setYear(null);
    setSection(null);

    // setBranches(await fetchBranches(collegeId!, edu.collegeEducationId));
    const branchData = await fetchBranches(collegeId, edu.collegeEducationId);
    setBranches(branchData);
    setYears([]);
    setSections([]);
  };

  const selectBranch = async (br: any) => {
    setBranch(br);
    setYear(null);
    setSection(null);

    setYears(
      await fetchAcademicYears(
        collegeId!,
        education.collegeEducationId,
        br.collegeBranchId,
      ),
    );
    setSections([]);
  };

  const selectYear = async (yr: any) => {
    setYear(yr);
    setSection(null);

    setSections(
      await fetchSections(
        collegeId!,
        education.collegeEducationId,
        branch.collegeBranchId,
        yr.collegeAcademicYearId,
      ),
    );
  };

  const resetEducation = () => {
    setEducation(null);
    setBranch(null);
    setYear(null);
    setSection(null);
    setSubject(null);
    setBranches([]);
    setYears([]);
    setSections([]);
    setSubjects([]);
  };

  return {
    educations,
    branches,
    years,
    sections,
    subjects,

    education,
    branch,
    year,
    section,
    subject,

    selectEducation,
    selectBranch,
    selectYear,
    setSection,
    setSubject,
    resetEducation,
  };
}
