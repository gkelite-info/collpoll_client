"use client";

import { useEffect, useState, useRef } from "react";
import {
  fetchEducations,
  fetchBranches,
  fetchAcademicYears,
  fetchSections,
  fetchSubjects,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { getSubjects } from "./getAdminAcademicsCards";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export function useAcademicFilters(
  input?: number | { userId?: number; collegeId?: number | null; configuredSubjects?: boolean }
) {
  const configuredSubjects = typeof input === "object" && input.configuredSubjects === true;
  const requestVersion = useRef(0);
  const sectionRequestVersion = useRef(0);
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

    let cancelled = false;
    setSubjects([]);
    setSubject(null);
    const request = configuredSubjects
      ? fetchSubjects(collegeId, education.collegeEducationId, branch?.collegeBranchId ?? null, year.collegeAcademicYearId)
      : getSubjects(
      collegeId,
      branch?.collegeBranchId ?? null,
      year.collegeAcademicYearId,
      section?.collegeSectionsId ?? null
    );
    request
      .then((data) => { if (!cancelled) setSubjects(data); })
      .catch(() => { if (!cancelled) setSubjects([]); });
    return () => { cancelled = true; };
  }, [collegeId, education, branch, year, section, configuredSubjects]);

  const selectEducation = async (edu: any) => {
    if (!collegeId || !edu) return;
    const version = ++requestVersion.current;
    ++sectionRequestVersion.current;
    setBranches([]);
    setYears([]);
    setSections([]);
    setSubjects([]);
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
      if (version !== requestVersion.current) return;
      setYears(yearsData);
      setSections([]);
    } else {
      const branchData = await fetchBranches(collegeId, edu.collegeEducationId);
      if (version !== requestVersion.current) return;
      setBranches(branchData);
      setYears([]);
      setSections([]);
    }
  };

  const selectBranch = async (br: any) => {
    const version = ++requestVersion.current;
    ++sectionRequestVersion.current;
    setYears([]);
    setSections([]);
    setSubjects([]);
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

    if (version !== requestVersion.current) return;
    setYears(yearsData);
    setSections([]);
  };

  const selectYear = async (yr: any) => {
    const version = ++sectionRequestVersion.current;
    setSections([]);
    setSubjects([]);
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

    if (version !== sectionRequestVersion.current) return;
    setSections(sectionsData);
  };

  const resetEducation = () => {
    ++requestVersion.current;
    ++sectionRequestVersion.current;
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
