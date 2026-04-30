"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  StudentProgressBranch,
  StudentProgressSection,
  StudentProgressSemester,
  StudentProgressSubject,
  StudentProgressYear,
} from "./studentProgressDropdowns";
import {
  fetchStudentProgressBranches,
  fetchStudentProgressSections,
  fetchStudentProgressSemesters,
  fetchStudentProgressSubjects,
  fetchStudentProgressYears,
} from "./studentProgressDropdowns";

type StudentProgressFiltersArgs = {
  collegeId: number | null;
  collegeEducationId: number | null;
};

export function useStudentProgressFilters({
  collegeId,
  collegeEducationId,
}: StudentProgressFiltersArgs) {
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [branches, setBranches] = useState<StudentProgressBranch[]>([]);
  const [years, setYears] = useState<StudentProgressYear[]>([]);
  const [semesters, setSemesters] = useState<StudentProgressSemester[]>([]);
  const [sections, setSections] = useState<StudentProgressSection[]>([]);
  const [subjects, setSubjects] = useState<StudentProgressSubject[]>([]);

  const [selectedBranch, setSelectedBranch] =
    useState<StudentProgressBranch | null>(null);
  const [selectedYear, setSelectedYear] = useState<StudentProgressYear | null>(
    null,
  );
  const [selectedSemester, setSelectedSemester] =
    useState<StudentProgressSemester | null>(null);
  const [selectedSection, setSelectedSection] =
    useState<StudentProgressSection | null>(null);
  const [selectedSubject, setSelectedSubject] =
    useState<StudentProgressSubject | null>(null);

  const activeBranchIds = useMemo(
    () =>
      selectedBranch
        ? [selectedBranch.collegeBranchId]
        : branches.map((branch) => branch.collegeBranchId),
    [branches, selectedBranch],
  );

  const activeYearIds = useMemo(
    () =>
      selectedYear
        ? [selectedYear.collegeAcademicYearId]
        : years.map((year) => year.collegeAcademicYearId),
    [selectedYear, years],
  );

  const activeSemesterIds = useMemo(
    () =>
      selectedSemester
        ? [selectedSemester.collegeSemesterId]
        : semesters.map((semester) => semester.collegeSemesterId),
    [selectedSemester, semesters],
  );

  const activeSectionIds = useMemo(
    () =>
      selectedSection
        ? [selectedSection.collegeSectionsId]
        : sections.map((section) => section.collegeSectionsId),
    [sections, selectedSection],
  );

  const activeSubjectIds = useMemo(
    () =>
      selectedSubject
        ? [selectedSubject.collegeSubjectId]
        : subjects.map((subject) => subject.collegeSubjectId),
    [selectedSubject, subjects],
  );

  useEffect(() => {
    if (!collegeId || !collegeEducationId) return;

    let mounted = true;
    setBranchesLoading(true);

    fetchStudentProgressBranches(collegeId, collegeEducationId)
      .then((data) => {
        if (!mounted) return;
        setBranches(data);
      })
      .catch((error) => {
        console.error("Failed to load student progress branches", error);
        if (!mounted) return;
        setBranches([]);
      })
      .finally(() => {
        if (!mounted) return;
        setBranchesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [collegeEducationId, collegeId]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId) return;

    let mounted = true;
    setYearsLoading(true);

    fetchStudentProgressYears(collegeId, collegeEducationId, activeBranchIds)
      .then((data) => {
        if (!mounted) return;
        setYears(data);
      })
      .catch((error) => {
        console.error("Failed to load student progress years", error);
        if (!mounted) return;
        setYears([]);
      })
      .finally(() => {
        if (!mounted) return;
        setYearsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeBranchIds, collegeEducationId, collegeId]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId) return;

    let mounted = true;
    setSemestersLoading(true);

    fetchStudentProgressSemesters(collegeId, collegeEducationId, activeYearIds)
      .then((data) => {
        if (!mounted) return;
        setSemesters(data);
      })
      .catch((error) => {
        console.error("Failed to load student progress semesters", error);
        if (!mounted) return;
        setSemesters([]);
      })
      .finally(() => {
        if (!mounted) return;
        setSemestersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeYearIds, collegeEducationId, collegeId]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId) return;

    let mounted = true;
    setSectionsLoading(true);

    fetchStudentProgressSections(
      collegeId,
      collegeEducationId,
      activeBranchIds,
      activeYearIds,
      activeSemesterIds,
    )
      .then((data) => {
        if (!mounted) return;
        setSections(data);
      })
      .catch((error) => {
        console.error("Failed to load student progress sections", error);
        if (!mounted) return;
        setSections([]);
      })
      .finally(() => {
        if (!mounted) return;
        setSectionsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [
    activeBranchIds,
    activeSemesterIds,
    activeYearIds,
    collegeEducationId,
    collegeId,
  ]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId) return;

    let mounted = true;
    setSubjectsLoading(true);

    fetchStudentProgressSubjects(
      collegeId,
      collegeEducationId,
      activeBranchIds,
      activeYearIds,
      activeSemesterIds,
      activeSectionIds,
    )
      .then((data) => {
        if (!mounted) return;
        setSubjects(data);
      })
      .catch((error) => {
        console.error("Failed to load student progress subjects", error);
        if (!mounted) return;
        setSubjects([]);
      })
      .finally(() => {
        if (!mounted) return;
        setSubjectsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [
    activeBranchIds,
    activeSectionIds,
    activeSemesterIds,
    activeYearIds,
    collegeEducationId,
    collegeId,
  ]);

  const selectBranch = (branch: StudentProgressBranch | null) => {
    setSelectedBranch(branch);
    setSelectedYear(null);
    setSelectedSemester(null);
    setSelectedSection(null);
    setSelectedSubject(null);
  };

  const selectYear = (year: StudentProgressYear | null) => {
    setSelectedYear(year);
    setSelectedSemester(null);
    setSelectedSection(null);
    setSelectedSubject(null);
  };

  const selectSemester = (semester: StudentProgressSemester | null) => {
    setSelectedSemester(semester);
    setSelectedSection(null);
    setSelectedSubject(null);
  };

  const selectSection = (section: StudentProgressSection | null) => {
    setSelectedSection(section);
    setSelectedSubject(null);
  };

  const selectSubject = (subject: StudentProgressSubject | null) => {
    setSelectedSubject(subject);
  };

  return {
    filtersLoading:
      branchesLoading ||
      yearsLoading ||
      semestersLoading ||
      sectionsLoading ||
      subjectsLoading,
    branches,
    years,
    semesters,
    sections,
    subjects,
    selectedBranch,
    selectedYear,
    selectedSemester,
    selectedSection,
    selectedSubject,
    activeBranchIds,
    activeYearIds,
    activeSemesterIds,
    activeSectionIds,
    activeSubjectIds,
    selectBranch,
    selectYear,
    selectSemester,
    selectSection,
    selectSubject,
  };
}
