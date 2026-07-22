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
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export function useAcademicFilters(
  input?: number | { userId?: number; collegeId?: number | null }
) {
  const parsedUserId = typeof input === "number" ? input : input?.userId;
  const parsedCollegeId = typeof input === "object" ? input?.collegeId : null;

  const [collegeId, setCollegeId] = useState<number | null>(parsedCollegeId ?? null);

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
    if (parsedCollegeId) {
      setCollegeId(parsedCollegeId);
      return;
    }
    if (!parsedUserId) return;

    let isMounted = true;
    fetchAdminContext(parsedUserId).then((ctx) => {
      if (isMounted && ctx?.collegeId) {
        setCollegeId(ctx.collegeId);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [parsedUserId, parsedCollegeId]);

  useEffect(() => {
    if (!collegeId) return;
    fetchEducations(collegeId).then(setEducations).catch(() => setEducations([]));
  }, [collegeId]);

  useEffect(() => {
    if (!collegeId || !education || !year) {
      setSubjects([]);
      setSubject(null);
      return;
    }

    const isSchool = isSchoolEducation(education?.collegeEducationType);
    if (!isSchool && !branch) {
      setSubjects([]);
      setSubject(null);
      return;
    }

    getSubjects(
      collegeId,
      branch?.collegeBranchId ?? null,
      year.collegeAcademicYearId,
      section?.collegeSectionsId ?? null
    )
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, [collegeId, education, branch, year, section]);

  const selectEducation = async (edu: any) => {
    if (!collegeId || !edu) return;
    setEducation(edu);
    setBranch(null);
    setYear(null);
    setSection(null);
    setSubject(null);

    const isSchool = isSchoolEducation(edu?.collegeEducationType);
    if (isSchool) {
      setBranches([]);
      const yearsData = await fetchAcademicYears(
        collegeId,
        edu.collegeEducationId,
        null
      );
      setYears(yearsData);
      setSections([]);
    } else {
      const branchData = await fetchBranches(collegeId, edu.collegeEducationId);
      setBranches(branchData);
      setYears([]);
      setSections([]);
    }
  };

  const selectBranch = async (br: any) => {
    setBranch(br);
    setYear(null);
    setSection(null);
    setSubject(null);

    if (!br || !education || !collegeId) {
      setYears([]);
      setSections([]);
      return;
    }

    const yearsData = await fetchAcademicYears(
      collegeId,
      education.collegeEducationId,
      br.collegeBranchId,
    );

    setYears(yearsData);
    setSections([]);
  };

  const selectYear = async (yr: any) => {
    setYear(yr);
    setSection(null);
    setSubject(null);

    if (!yr || !education || !collegeId) {
      setSections([]);
      return;
    }

    const sectionsData = await fetchSections(
      collegeId,
      education.collegeEducationId,
      branch?.collegeBranchId ?? null,
      yr.collegeAcademicYearId,
    );

    setSections(sectionsData);
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
