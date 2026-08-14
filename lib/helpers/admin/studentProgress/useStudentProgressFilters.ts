"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  StudentProgressBranch,
  StudentProgressFaculty,
  StudentProgressSection,
  StudentProgressSemester,
  StudentProgressSubject,
  StudentProgressYear,
} from "./studentProgressDropdowns";
import {
  fetchStudentProgressBranches,
  fetchStudentProgressFaculty,
  fetchStudentProgressSections,
  fetchStudentProgressSemesters,
  fetchStudentProgressSubjects,
  fetchStudentProgressYears,
} from "./studentProgressDropdowns";

type StudentProgressFiltersArgs = {
  collegeId: number | null;
  collegeEducationId: number | null;
  isSchool?: boolean;
};

const EMPTY_NUMBER_IDS: number[] = [];

export function useStudentProgressFilters({
  collegeId,
  collegeEducationId,
  isSchool = false,
}: StudentProgressFiltersArgs) {
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);

  const [branches, setBranches] = useState<StudentProgressBranch[]>([]);
  const [years, setYears] = useState<StudentProgressYear[]>([]);
  const [semesters, setSemesters] = useState<StudentProgressSemester[]>([]);
  const [sections, setSections] = useState<StudentProgressSection[]>([]);
  const [subjects, setSubjects] = useState<StudentProgressSubject[]>([]);
  const [faculty, setFaculty] = useState<StudentProgressFaculty[]>([]);

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
  const [selectedFaculty, setSelectedFaculty] =
    useState<StudentProgressFaculty | null>(null);

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
  const sectionSubjectIds = isSchool ? activeSubjectIds : EMPTY_NUMBER_IDS;
  const subjectSectionIds = isSchool ? EMPTY_NUMBER_IDS : activeSectionIds;
  const activeFacultyIds = useMemo(
    () => selectedFaculty ? [selectedFaculty.facultyId] : faculty.map((item) => item.facultyId),
    [faculty, selectedFaculty],
  );

  useEffect(() => {
    if (!isSchool || !collegeId || !collegeEducationId || !selectedSubject || !selectedSection) {
      setFaculty([]);
      setSelectedFaculty(null);
      return;
    }

    let mounted = true;
    setFacultyLoading(true);
    fetchStudentProgressFaculty(
      collegeId,
      collegeEducationId,
      activeYearIds,
      [selectedSubject.collegeSubjectId],
      [selectedSection.collegeSectionsId],
    )
      .then((data) => {
        if (!mounted) return;
        setFaculty(data);
        setSelectedFaculty((current) =>
          current && data.some((item) => item.facultyId === current.facultyId)
            ? current
            : null,
        );
      })
      .catch((error) => {
        console.error("Failed to load student progress faculty", error);
        if (mounted) setFaculty([]);
      })
      .finally(() => {
        if (mounted) setFacultyLoading(false);
      });

    return () => { mounted = false; };
  }, [activeYearIds, collegeEducationId, collegeId, isSchool, selectedSection, selectedSubject]);

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
      sectionSubjectIds,
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
    sectionSubjectIds,
    collegeEducationId,
    collegeId,
    isSchool,
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
      subjectSectionIds,
      isSchool,
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
    subjectSectionIds,
    activeSemesterIds,
    activeYearIds,
    collegeEducationId,
    collegeId,
    isSchool,
  ]);

  const selectBranch = (branch: StudentProgressBranch | null) => {
    setSelectedBranch(branch);
    setSelectedYear(null);
    setSelectedSemester(null);
    setSelectedSection(null);
    setSelectedSubject(null);
    setSelectedFaculty(null);
  };

  const selectYear = (year: StudentProgressYear | null) => {
    setSelectedYear(year);
    setSelectedSemester(null);
    setSelectedSection(null);
    setSelectedSubject(null);
    setSelectedFaculty(null);
  };

  const selectSemester = (semester: StudentProgressSemester | null) => {
    setSelectedSemester(semester);
    setSelectedSection(null);
    setSelectedSubject(null);
    setSelectedFaculty(null);
  };

  const selectSection = (section: StudentProgressSection | null) => {
    setSelectedSection(section);
    if (!isSchool) setSelectedSubject(null);
    setSelectedFaculty(null);
  };

  const selectSubject = (subject: StudentProgressSubject | null) => {
    setSelectedSubject(subject);
    if (isSchool) setSelectedSection(null);
    setSelectedFaculty(null);
  };

  const selectFaculty = (item: StudentProgressFaculty | null) => {
    setSelectedFaculty(item);
  };

  const rawFiltersLoading =
    branchesLoading ||
    yearsLoading ||
    semestersLoading ||
    sectionsLoading ||
    subjectsLoading;
    // faculty options are part of the dependent school filter chain.
  const filtersOrFacultyLoading = rawFiltersLoading || facultyLoading;

  const [filtersLoading, setFiltersLoading] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (filtersOrFacultyLoading) {
      setFiltersLoading(true);
    } else {
      timeout = setTimeout(() => {
        setFiltersLoading(false);
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [filtersOrFacultyLoading]);

  return {
    filtersLoading,
    branches,
    years,
    semesters,
    sections,
    subjects,
    faculty,
    selectedBranch,
    selectedYear,
    selectedSemester,
    selectedSection,
    selectedSubject,
    selectedFaculty,
    activeBranchIds,
    activeYearIds,
    activeSemesterIds,
    activeSectionIds,
    activeSubjectIds,
    activeFacultyIds,
    selectBranch,
    selectYear,
    selectSemester,
    selectSection,
    selectSubject,
    selectFaculty,
  };
}
