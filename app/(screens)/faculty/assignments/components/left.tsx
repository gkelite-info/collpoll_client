"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import AssignmentForm from "./assignmentForm";
import AssignmentCard from "./assignmentCard";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { fetchFacultyAssignments } from "@/lib/helpers/faculty/assignment/fetchFacultyAssignments";
import { deleteFacultyAssignment } from "@/lib/helpers/faculty/assignment/deleteFacultyAssignment";
import AssignmentSkeleton from "../shimmer/assignmentShimmer";
import { Pagination } from "./pagination";
import { Pagination as AssignmentPagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import FacultyQuizCard from "./facultyQuizCard";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import FacultyDiscussionCard from "./facultyDiscussionCard";
import FacultyDiscussionForm from "./facultyDiscussionForm";
import FacultyDiscussionSubmissions from "./facultyDiscussionSubmissions";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import {
  deactivateDiscussionForum,
  fetchCompletedDiscussionsByFacultyId,
  fetchDiscussionsByFacultyId,
} from "@/lib/helpers/discussionForum/discussionForumAPI";
import FacultyDiscussionShimmer from "../shimmer/discussionShimmer";
import CalendarConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import FacultyQuizForm from "./facultyQuizForm";
import FacultyAddQuestions from "./FacultyAddQuizQuestions";
import FacultyQuizResumeBanner from "./FacultyQuizResumeBanner";
import {
  fetchQuizzesByStatus,
  autoCompleteExpiredQuizzes,
  deactivateQuiz,
  updateQuizStatus,
} from "@/lib/helpers/quiz/quizAPI";
import FacultyQuizShimmer from "../shimmer/FacultyQuizShimmer";
import FacultyQuizSubmissions from "./quizSubmissions";
import FacultyLabForm from "./facultyLabForm";
import { deleteLabManual, fetchLabManualsForStaff } from "@/lib/helpers/faculty/facultyLabManualHelper";
import FacultyLabCard from "./FacultyLabCard";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { useInstitutionTerminology } from "@/app/utils/hooks/useInstitutionTerminology";
import { useUser } from "@/app/utils/context/UserContext";

export interface Assignment {
  sectionId: string | number | readonly string[] | undefined;
  assignmentId?: number;
  image: string;
  title: string;
  description: string;
  fromDate: string | number;
  toDate: string | number;
  totalSubmissions: string;
  totalSubmitted: string;
  marks: string | number;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const ITEMS_PER_PAGE = 10;

export const getSafeSubjectName = (apiData: any, matchedSection: any) => {
  if (Array.isArray(apiData?.college_subjects)) return apiData.college_subjects[0]?.subjectName;
  if (apiData?.college_subjects?.subjectName) return apiData.college_subjects.subjectName;
  if (Array.isArray(matchedSection?.faculty_subject)) return matchedSection.faculty_subject[0]?.subjectName;
  if (matchedSection?.faculty_subject?.subjectName) return matchedSection.faculty_subject.subjectName;
  if (Array.isArray(matchedSection?.college_subjects)) return matchedSection.college_subjects[0]?.subjectName;
  if (matchedSection?.college_subjects?.subjectName) return matchedSection.college_subjects.subjectName;
  return null;
}

export const getSafeSemName = (apiData: any, matchedSection: any) => {
  let semInfo = null;
  if (Array.isArray(apiData?.college_subjects)) semInfo = apiData.college_subjects[0]?.college_semester;
  else if (apiData?.college_subjects?.college_semester) semInfo = apiData.college_subjects.college_semester;
  
  if (!semInfo) semInfo = matchedSection?.college_semester || matchedSection?.faculty_subject?.college_semester || matchedSection?.college_subjects?.college_semester;

  return Array.isArray(semInfo) ? semInfo[0]?.collegeSemester : semInfo?.collegeSemester;
}

export const getSafeEduName = (matchedSection: any) => {
  if (Array.isArray(matchedSection?.faculty_edu_type)) return matchedSection.faculty_edu_type[0]?.collegeEducationType;
  if (matchedSection?.faculty_edu_type?.collegeEducationType) return matchedSection.faculty_edu_type.collegeEducationType;
  if (Array.isArray(matchedSection?.college_education)) return matchedSection.college_education[0]?.collegeEducationType;
  if (matchedSection?.college_education?.collegeEducationType) return matchedSection.college_education.collegeEducationType;
  return null;
}

export const getSafeBranchName = (matchedSection: any) => {
  if (Array.isArray(matchedSection?.college_branch)) return matchedSection.college_branch[0]?.collegeBranchCode;
  if (matchedSection?.college_branch?.collegeBranchCode) return matchedSection.college_branch.collegeBranchCode;
  return null;
}

export const getSafeYearName = (matchedSection: any) => {
  if (Array.isArray(matchedSection?.college_academic_year)) return matchedSection.college_academic_year[0]?.collegeAcademicYear;
  if (matchedSection?.college_academic_year?.collegeAcademicYear) return matchedSection.college_academic_year.collegeAcademicYear;
  return null;
}

export const getSafeSectionName = (apiData: any, matchedSection: any) => {
  if (Array.isArray(apiData?.college_sections)) return apiData.college_sections[0]?.collegeSections;
  if (apiData?.college_sections?.collegeSections) return apiData.college_sections.collegeSections;
  if (Array.isArray(matchedSection?.college_sections)) return matchedSection.college_sections[0]?.collegeSections;
  if (matchedSection?.college_sections?.collegeSections) return matchedSection.college_sections.collegeSections;
  return null;
}

export const buildCardSubtitle = (apiData: any, matchedSection: any) => {
  const eduName = getSafeEduName(matchedSection);
  const branchName = getSafeBranchName(matchedSection);
  const yearName = getSafeYearName(matchedSection);
  const semName = getSafeSemName(apiData, matchedSection);
  const subjName = getSafeSubjectName(apiData, matchedSection);
  const secName = getSafeSectionName(apiData, matchedSection);

  const isSchool = isSchoolEducation(eduName);
  const isInter = eduName?.toUpperCase() === "INTER" || eduName?.toUpperCase() === "INTERMEDIATE";

  let parts = [];
  if (eduName) parts.push(`Education - ${eduName}`);
  if (isInter && branchName) parts.push(`Group - ${branchName}`);
  if (!isSchool && !isInter && branchName) parts.push(`Branch - ${branchName}`);
  if (yearName) parts.push(`Year - ${yearName}`);
  if (!isSchool && !isInter && semName) {
    const parsedSem = String(semName).replace(/Semester/i, "").trim() || semName;
    parts.push(`Sem - ${parsedSem}`);
  }
  if (subjName) parts.push(`Subject - ${subjName}`);
  if (secName) parts.push(`Section - ${secName}`);
  return parts.join(" • ");
}

function AssignmentsLeftContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const refreshQuiz = searchParams.get("refreshQuiz");
  const activeTab = searchParams.get("tab") || "assignments";
  const action = searchParams.get("action");
  const discussionId = searchParams.get("discussionId");
  const activeView =
    (searchParams.get("view") as "active" | "previous") || "active";
  const quizView =
    (searchParams.get("quizView") as "active" | "drafts" | "completed") ||
    "active";
  const discussionView =
    (searchParams.get("discussionView") as "active" | "completed") || "active";
  const selectedDate = searchParams.get("selectedDate");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Assignment | null>(null);

  const [assignmentPages, setAssignmentPages] = useState({
    active: 1,
    previous: 1,
  });
  const currentPage = assignmentPages[activeView];
  const [totalCount, setTotalCount] = useState(0);

  const [quizCurrentPage, setQuizCurrentPage] = useState(1);

  const [discussionCurrentPage, setDiscussionCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Discussions state handled by useQuery now
  const [deleteDiscussionId, setDeleteDiscussionId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);



  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);

  const [deleteLabId, setDeleteLabId] = useState<number | null>(null);
  const [isDeletingLab, setIsDeletingLab] = useState(false);
  const [editingLab, setEditingLab] = useState<any | null>(null);

  const [labs, setLabs] = useState<any[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labCurrentPage, setLabCurrentPage] = useState(1);
  const [labTotalCount, setLabTotalCount] = useState(0);

  // Filter States
  const [filterEducationTypeId, setFilterEducationTypeId] = useState("");
  const [filterBranchId, setFilterBranchId] = useState("");
  const [filterYearId, setFilterYearId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");

  const { 
    facultyId, 
    sections,
    collegeEducationId: mainEduId,
    faculty_edu_type: mainEduName,
    collegeBranchId: mainBranchId,
    college_branch: mainBranchName,
    loading: isFacultyContextLoading
  } = useFaculty();
  const { isSchool: isSchoolTerminology } = useInstitutionTerminology();
  const { collegeEducationType, loading: isUserContextLoading } = useUser();

  const availableEducationTypes = useMemo(() => {
    const typesMap = new Map();
    sections?.forEach((s) => {
      const eduId = s.collegeEducationId || mainEduId;
      const eduName = s.faculty_edu_type?.collegeEducationType || s.college_education?.collegeEducationType || mainEduName;
      if (eduId && eduName) {
        typesMap.set(eduId, {
          id: String(eduId),
          name: eduName,
        });
      }
    });
    return Array.from(typesMap.values());
  }, [sections, mainEduId, mainEduName]);

  const isSchool = useMemo(() => {
    if (!filterEducationTypeId) {
      if (isSchoolTerminology) return true;
      if (availableEducationTypes.length > 0) {
        return availableEducationTypes.every((e) => isSchoolEducation(e.name));
      }
      return isSchoolEducation(collegeEducationType);
    }
    const selectedEdu = availableEducationTypes.find(e => e.id === filterEducationTypeId);
    return selectedEdu ? isSchoolEducation(selectedEdu.name) : isSchoolTerminology;
  }, [filterEducationTypeId, availableEducationTypes, isSchoolTerminology, collegeEducationType]);

  useEffect(() => {
    if (availableEducationTypes.length === 1 && !filterEducationTypeId) {
      setFilterEducationTypeId(String(availableEducationTypes[0].id));
    }
  }, [availableEducationTypes, filterEducationTypeId]);

  const availableBranches = useMemo(() => {
    if (!filterEducationTypeId) return [];
    const branchesMap = new Map();
    sections?.forEach((s) => {
      const eduId = s.collegeEducationId || mainEduId;
      const branchId = s.collegeBranchId || mainBranchId;
      if (String(eduId) === filterEducationTypeId && branchId) {
        const branchName = s.college_branch?.collegeBranchCode || mainBranchName || `Branch ${branchId}`;
        branchesMap.set(branchId, {
          id: String(branchId),
          name: branchName,
        });
      }
    });
    return Array.from(branchesMap.values());
  }, [filterEducationTypeId, sections, mainEduId, mainBranchId, mainBranchName]);

  const availableYears = useMemo(() => {
    if (!filterEducationTypeId) return [];
    const yearsMap = new Map();
    sections?.forEach((s: any) => {
      const eduId = s.collegeEducationId || mainEduId;
      const branchId = s.collegeBranchId || mainBranchId;
      if (
        String(eduId) === filterEducationTypeId &&
        (isSchool || String(branchId) === filterBranchId) &&
        s.collegeAcademicYearId
      ) {
        yearsMap.set(s.collegeAcademicYearId, {
          id: String(s.collegeAcademicYearId),
          name: s.college_academic_year?.collegeAcademicYear || `Year ${s.collegeAcademicYearId}`,
        });
      }
    });
    return Array.from(yearsMap.values());
  }, [filterEducationTypeId, filterBranchId, isSchool, sections, mainEduId, mainBranchId]);

  const isInter = useMemo(() => {
    if (!filterEducationTypeId) return false;
    const selectedEdu = availableEducationTypes.find(e => e.id === filterEducationTypeId);
    if (!selectedEdu) return false;
    const name = selectedEdu.name.toUpperCase();
    return name === "INTER" || name === "INTERMEDIATE";
  }, [filterEducationTypeId, availableEducationTypes]);

  const availableSubjects = useMemo(() => {
    if (!filterYearId) return [];
    const subjectsMap = new Map();
    sections?.forEach((s: any) => {
      const eduId = s.collegeEducationId || mainEduId;
      const branchId = s.collegeBranchId || mainBranchId;
      const subjName = s.faculty_subject?.subjectName || s.college_subjects?.subjectName;
      if (
        String(eduId) === filterEducationTypeId &&
        (isSchool || String(branchId) === filterBranchId) &&
        String(s.collegeAcademicYearId) === filterYearId &&
        s.collegeSubjectId && subjName
      ) {
        subjectsMap.set(s.collegeSubjectId, {
          id: String(s.collegeSubjectId),
          name: subjName,
        });
      }
    });
    return Array.from(subjectsMap.values());
  }, [filterEducationTypeId, filterBranchId, filterYearId, isSchool, isInter, sections, mainEduId, mainBranchId]);

  const availableSections = useMemo(() => {
    if (!filterSubjectId) return [];
    const sectionsMap = new Map();
    sections?.forEach((s: any) => {
      const eduId = s.collegeEducationId || mainEduId;
      const branchId = s.collegeBranchId || mainBranchId;
      if (
        String(eduId) === filterEducationTypeId &&
        (isSchool || String(branchId) === filterBranchId) &&
        String(s.collegeAcademicYearId) === filterYearId &&
        String(s.collegeSubjectId) === filterSubjectId &&
        s.collegeSectionsId
      ) {
        sectionsMap.set(s.collegeSectionsId, {
          id: String(s.collegeSectionsId),
          name: s.college_sections?.collegeSections || `Section ${s.collegeSectionsId}`,
        });
      }
    });
    return Array.from(sectionsMap.values());
  }, [filterEducationTypeId, filterBranchId, filterYearId, filterSubjectId, isSchool, isInter, sections, mainEduId, mainBranchId]);

  useEffect(() => {
    if (availableBranches.length === 1 && !filterBranchId) {
      setFilterBranchId(String(availableBranches[0].id));
    }
  }, [availableBranches, filterBranchId]);

  useEffect(() => {
    if (availableYears.length === 1 && !filterYearId) {
      setFilterYearId(String(availableYears[0].id));
    }
  }, [availableYears, filterYearId]);

  useEffect(() => {
    if (availableSubjects.length === 1 && !filterSubjectId) {
      setFilterSubjectId(String(availableSubjects[0].id));
    }
  }, [availableSubjects, filterSubjectId]);

  useEffect(() => {
    if (availableSections.length === 1 && !filterSectionId) {
      setFilterSectionId(String(availableSections[0].id));
    }
  }, [availableSections, filterSectionId]);

  const queryClient = useQueryClient();

  const { data: quizData, isLoading: quizzesLoading } = useQuery({
    queryKey: ["quizzes", facultyId, quizView, quizCurrentPage, selectedDate, refreshQuiz, filterEducationTypeId, filterBranchId, filterYearId, filterSubjectId, filterSectionId],
    queryFn: async () => {
      if (!facultyId) return { data: [], totalCount: 0 };
      
      await autoCompleteExpiredQuizzes(facultyId);

      const statusMap: Record<string, "Active" | "Draft" | "Completed"> = {
        active: "Active",
        drafts: "Draft",
        completed: "Completed"
      };

      let matchingSections = sections || [];
      if (filterEducationTypeId) {
        matchingSections = matchingSections.filter(s => String(s.collegeEducationId || mainEduId) === filterEducationTypeId);
      }
      if (filterBranchId && !isSchool) {
        matchingSections = matchingSections.filter(s => String(s.collegeBranchId || mainBranchId) === filterBranchId);
      }
      if (filterYearId) {
        matchingSections = matchingSections.filter(s => String(s.collegeAcademicYearId) === filterYearId);
      }
      if (filterSubjectId) {
        matchingSections = matchingSections.filter(s => String(s.collegeSubjectId) === filterSubjectId);
      }
      if (filterSectionId) {
        matchingSections = matchingSections.filter(s => String(s.collegeSectionsId) === filterSectionId);
      }
      
      const isAnyFilterActive = filterEducationTypeId || filterBranchId || filterYearId || filterSubjectId || filterSectionId;
      // if filters are active but no sections match, validSectionIds should be empty array to fetch 0 results. 
      // if no filters are active, validSectionIds should be undefined to fetch all.
      const validSectionIds = isAnyFilterActive ? matchingSections.map(s => s.collegeSectionsId) : undefined;

      const filtersObj = {
        sectionIds: validSectionIds,
      };

      const result = await fetchQuizzesByStatus(
        facultyId,
        statusMap[quizView],
        quizCurrentPage,
        ITEMS_PER_PAGE,
        selectedDate || undefined,
        filtersObj
      );

      // Clear the refresh parameter if it exists
      const params = new URLSearchParams(searchParams.toString());
      if (params.has("refreshQuiz")) {
        params.delete("refreshQuiz");
        router.replace(`${pathname}?${params.toString()}`);
      }

      return result;
    },
    enabled: activeTab === "quiz" && !!facultyId,
  });

  const quizzes = quizData?.data || [];
  const quizTotalCount = quizData?.totalCount || 0;

  const { data: discussionData, isLoading: discussionsLoading } = useQuery({
    queryKey: [
      "discussions",
      facultyId,
      discussionView,
      discussionCurrentPage,
      selectedDate,
      refreshKey,
      filterEducationTypeId,
      filterBranchId,
      filterYearId,
      filterSubjectId,
      filterSectionId,
    ],
    queryFn: async () => {
      if (!facultyId) return { data: [], totalCount: 0 };

      let matchingSections = sections || [];
      if (filterEducationTypeId) {
        matchingSections = matchingSections.filter(s => String(s.collegeEducationId || mainEduId) === filterEducationTypeId);
      }
      if (filterBranchId && !isSchool) {
        matchingSections = matchingSections.filter(s => String(s.collegeBranchId || mainBranchId) === filterBranchId);
      }
      if (filterYearId) {
        matchingSections = matchingSections.filter(s => String(s.collegeAcademicYearId) === filterYearId);
      }
      if (filterSubjectId) {
        matchingSections = matchingSections.filter(s => String(s.collegeSubjectId) === filterSubjectId);
      }
      if (filterSectionId) {
        matchingSections = matchingSections.filter(s => String(s.collegeSectionsId) === filterSectionId);
      }
      
      const isAnyFilterActive = filterEducationTypeId || filterBranchId || filterYearId || filterSubjectId || filterSectionId;
      const validSectionIds = isAnyFilterActive ? matchingSections.map(s => s.collegeSectionsId) : undefined;

      const filtersObj = {
        sectionIds: validSectionIds,
      };

      if (discussionView === "active") {
        return await fetchDiscussionsByFacultyId(
          facultyId,
          discussionCurrentPage,
          ITEMS_PER_PAGE,
          selectedDate || undefined,
          filtersObj
        );
      } else {
        return await fetchCompletedDiscussionsByFacultyId(
          facultyId,
          discussionCurrentPage,
          ITEMS_PER_PAGE,
          selectedDate || undefined,
          filtersObj
        );
      }
    },
    enabled: activeTab === "discussion" && !!facultyId,
  });

  const discussions = discussionData?.data || [];
  const discussionTotalCount = discussionData?.totalCount || 0;

  async function fetchLabs() {
    if (!facultyId) return;
    try {
      setLabsLoading(true);
      const response = await fetchLabManualsForStaff({
        facultyId,
        page: labCurrentPage,
        pageSize: ITEMS_PER_PAGE,
        collegeEducationId: filterEducationTypeId ? Number(filterEducationTypeId) : undefined,
        collegeBranchId: filterBranchId ? Number(filterBranchId) : undefined,
        collegeAcademicYearId: filterYearId ? Number(filterYearId) : undefined,
        collegeSubjectId: filterSubjectId ? Number(filterSubjectId) : undefined,
        collegeSectionsId: filterSectionId ? Number(filterSectionId) : undefined,
      });

      const formatted = response.data.map((lab: any) => {
          return {
            labId: lab.labManualId,
            labTitle: lab.labTitle,
            collegeSubjectId: lab.collegeSubjectId,
            collegeAcademicYearId: lab.collegeAcademicYearId,
            collegeSectionsId: lab.collegeSectionsId,
            pdfUrl: lab.pdfUrl,
            subjectName: lab.college_subjects?.subjectName,
            sectionName:
              lab.college_sections?.sectionName ||
              lab.college_sections?.collegeSections,
            description: lab.description,
            fileName: lab.pdfUrl.split("/").pop(),
            fileSize: lab.fileSize,
            uploadedAt: lab.createdAt,
          };
        });

      setLabs(formatted);
      setLabTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch labs");
    } finally {
      setLabsLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab !== "lab") return;
    fetchLabs();
  }, [activeTab, facultyId, labCurrentPage, filterEducationTypeId, filterBranchId, filterYearId, filterSubjectId, filterSectionId]);

  const handleMainTabChange = (tab: "assignments" | "quiz" | "discussion" | "lab") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("action");
    params.delete("discussionId");

    if (tab === "assignments") params.set("view", "active");
    if (tab === "quiz") params.set("quizView", "active");
    if (tab === "discussion") params.set("discussionView", "active");

    setAssignmentPages({ active: 1, previous: 1 });
    setQuizCurrentPage(1);
    setDiscussionCurrentPage(1);
    setLabCurrentPage(1);
    setView("list");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAssignmentViewChange = (tab: "active" | "previous") => {
    if (activeView === tab) return;
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleQuizViewChange = (view: "active" | "drafts" | "completed") => {
    setQuizCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("quizView", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDiscussionViewChange = (view: "active" | "completed") => {
    setDiscussionCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("discussionView", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (activeTab !== "assignments") return;
    fetchAssignments();
  }, [activeView, currentPage, activeTab, selectedDate, filterEducationTypeId, filterBranchId, filterYearId, filterSubjectId, filterSectionId]);

  async function fetchAssignments() {
    if (!isFetchingMore) setIsLoading(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("userId")
        .eq("auth_id", auth.user.id)
        .single();

      if (!userData) return;

      const { data: facultyData } = await supabase
        .from("faculty")
        .select("facultyId")
        .eq("userId", userData.userId)
        .single();

      if (!facultyData) return;

      const dbStatus = activeView === "active" ? "Active" : "Evaluated";

      const { data, count, error } = await fetchFacultyAssignments(
        facultyData.facultyId,
        dbStatus,
        currentPage,
        ITEMS_PER_PAGE,
        selectedDate || undefined,
        {
          branchIds: filterBranchId ? [Number(filterBranchId)] : availableBranches.map((b) => Number(b.id)),
          yearId: filterYearId ? Number(filterYearId) : undefined,
          subjectId: filterSubjectId ? Number(filterSubjectId) : undefined,
          sectionId: filterSectionId ? Number(filterSectionId) : undefined,
          isSchool: isSchoolEducation(filterEducationTypeId),
        }
      );

      if (error) {
        toast.error("Failed to fetch assignments");
        return;
      }

      if (data) {
        const formatted: Assignment[] = data.map((a: any) => ({
          sectionId: a.collegeSectionsId,
          assignmentId: a.assignmentId,
          image: "/assignment.jpg",
          title: a.college_subjects?.subjectName || "Unknown Subject",
          description: a.topicName,
          fromDate: a.dateAssignedInt,
          toDate: a.submissionDeadlineInt,
          totalSubmitted: String(a.actualSubmissionsCount || 0),
          totalSubmissions: String(a.expectedStudentsCount || 0),
          marks: a.marks ? String(a.marks) : "0",
        }));
        setAssignments(formatted);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setIsFetchingMore(true);
    setAssignmentPages((pages) => ({ ...pages, [activeView]: page }));
  };

  const handleDeleteDiscussion = async () => {
    if (!deleteDiscussionId) return;
    try {
      setIsDeleting(true);
      const result = await deactivateDiscussionForum(deleteDiscussionId);
      if (result.success) {
        toast.success("Discussion deleted successfully.");
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error("Failed to delete discussion.");
      }
    } catch (error) {
      toast.error("Failed to delete discussion.");
    } finally {
      setIsDeleting(false);
      setDeleteDiscussionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteFacultyAssignment(id);
    if (!res.success) {
      toast.error("Failed to delete: " + res.error);
      return;
    }

    toast.success("Assignment deleted");

    if (assignments.length === 1 && currentPage > 1) {
      setAssignmentPages((pages) => ({
        ...pages,
        [activeView]: pages[activeView] - 1,
      }));
    } else {
      fetchAssignments();
    }
  };

  const handleEditQuiz = (quizId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("action", "editQuiz");
    params.set("quizId", String(quizId));
    router.push(`${pathname}?${params.toString()}`);
  };

  const confirmDeleteQuiz = (quizId: number) => {
    setDeleteQuizId(quizId);
  };

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deactivateQuiz(id);
      if (!res.success) throw new Error("Failed to delete quiz");
      return res;
    },
    onSuccess: () => {
      toast.success("Quiz deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setDeleteQuizId(null);
    },
    onError: () => {
      toast.error("Failed to delete quiz");
      setDeleteQuizId(null);
    }
  });

  const executeDeleteQuiz = () => {
    if (deleteQuizId) {
      deleteQuizMutation.mutate(deleteQuizId);
    }
  };

  const publishQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await updateQuizStatus(id, "Active");
      if (!res.success) throw new Error("Failed to publish quiz");
      return res;
    },
    onSuccess: () => {
      toast.success("Quiz published successfully");
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: () => {
      toast.error("Failed to publish quiz");
    }
  });

  const handlePublishQuiz = (quizId: number) => {
    publishQuizMutation.mutate(quizId);
  };

  const executeDeleteLab = async () => {
    if (!deleteLabId) return;

    try {
      setIsDeletingLab(true);

      const res = await deleteLabManual(deleteLabId);

      if (res.success) {
        toast.success("Lab manual deleted successfully");

        await fetchLabs();
      } else {
        toast.error("Failed to delete lab manual");
      }
    } catch (error) {
      console.error("Delete lab error:", error);
      toast.error("Failed to delete lab manual");
    } finally {
      setIsDeletingLab(false);
      setDeleteLabId(null);
    }
  };

  const handleEditLab = (lab: any) => {
    setEditingLab(lab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("action", "editLab");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (
    activeTab === "discussion" &&
    (action === "editDiscussion" || action === "createDiscussion")
  ) {
    return (
      <div className="w-[68%] max-md:w-full h-full p-2 max-md:p-3 max-md:pb-20 flex flex-col max-md:min-h-screen">
        <FacultyDiscussionForm
          discussionId={
            action === "editDiscussion" && discussionId
              ? Number(discussionId)
              : undefined
          }
          onSaved={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>
    );
  }

  if (activeTab === "discussion" && action === "viewSubmissions") {
    return (
      <div className="w-[68%] max-md:w-full h-full p-2 max-md:p-3 max-md:pb-20 flex flex-col max-md:min-h-screen">
        <FacultyDiscussionSubmissions discussionId={discussionId} />
      </div>
    );
  }

  if (activeTab === "lab" && (action === "createLab" || action === "editLab")) {
    return (
      <FacultyLabForm
        initialData={action === "editLab" ? editingLab : undefined}
        onSaved={() => fetchLabs()}
      />
    );
  }

  if (
    activeTab === "quiz" &&
    (action === "createQuiz" || action === "editQuiz")
  ) {
    return (
      <div className="w-[68%] max-md:w-full h-full p-2 max-md:p-3 max-md:pb-20 flex flex-col max-md:min-h-screen">
        <FacultyQuizForm
          onCancel={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            params.delete("quizId");
            router.push(`${pathname}?${params.toString()}`);
          }}
          onSaved={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            params.delete("quizId");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
        <FacultyQuizResumeBanner margintop="lg:mt-5" />
      </div>
    );
  }

  const quizId = searchParams.get("quizId");

  if (activeTab === "quiz" && action === "viewQuizSubmissions") {
    return (
      <div className="w-[68%] max-md:w-full h-full p-2 max-md:p-3 max-md:pb-20 flex flex-col max-md:min-h-screen">
        <FacultyQuizSubmissions
          quizId={quizId ? Number(quizId) : 0}
          onBack={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            params.delete("quizId");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
      </div>
    );
  }

  if (activeTab === "quiz" && action === "addQuestions") {
    return (
      <div className="w-[68%] max-md:w-full h-full p-2 max-md:p-3 max-md:pb-20 flex flex-col max-md:min-h-screen">
        <FacultyAddQuestions
          quizId={quizId ? Number(quizId) : undefined}
          onBack={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("action", "createQuiz");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
      </div>
    );
  }

  if (view === "add" || view === "edit") {
    return (
      <AssignmentForm
        initialData={editing}
        onCancel={() => {
          setEditing(null);
          setView("list");
          const params = new URLSearchParams(searchParams.toString());
          params.delete("action");
          router.push(`${pathname}?${params.toString()}`);
        }}
        onSave={() => {
          setIsLoading(true);
          fetchAssignments();
          setEditing(null);
          setView("list");
          const params = new URLSearchParams(searchParams.toString());
          params.delete("action");
          router.push(`${pathname}?${params.toString()}`);
        }}
      />
    );
  }

  const filtersBlock = (
    <div className="flex w-full gap-4 mt-2 overflow-x-auto custom-scrollbar pb-2">
      <CustomDropdown
        label="Education Type"
        options={availableEducationTypes.map(t => ({ label: t.name, value: t.id }))}
        value={filterEducationTypeId}
        onChange={(v) => {
          setFilterEducationTypeId(String(v));
          setFilterBranchId("");
          setFilterYearId("");
          setFilterSubjectId("");
          setFilterSectionId("");
          setQuizCurrentPage(1);
        }}
        placeholder="Select Education Type"
        theme="green"
        disabled={availableEducationTypes.length <= 1}
        widthClassName="min-w-[160px] shrink-0"
      />

      {!isSchool && (
        <CustomDropdown
          label={isInter ? "Group" : "Branch"}
          options={availableBranches.map(b => ({ label: b.name, value: b.id }))}
          value={filterBranchId}
          onChange={(v) => {
            setFilterBranchId(String(v));
            setFilterYearId("");
            setFilterSubjectId("");
            setFilterSectionId("");
            setQuizCurrentPage(1);
          }}
          placeholder={isInter ? "Select Group" : "Select Branch"}
          theme="green"
          disabled={!filterEducationTypeId || availableBranches.length <= 1}
          widthClassName="min-w-[160px] shrink-0"
        />
      )}

      <CustomDropdown
        label="Year"
        options={availableYears.map(y => ({ label: y.name, value: y.id }))}
        value={filterYearId}
        onChange={(v) => {
          setFilterYearId(String(v));
          setFilterSubjectId("");
          setFilterSectionId("");
          setQuizCurrentPage(1);
        }}
        placeholder="Select Year"
        theme="green"
        disabled={!filterEducationTypeId || (!isSchool && !filterBranchId) || availableYears.length <= 1}
        widthClassName="min-w-[160px] shrink-0"
      />

      <CustomDropdown
        label="Subject"
        options={availableSubjects.map(s => ({ label: s.name, value: s.id }))}
        value={filterSubjectId}
        onChange={(v) => {
          setFilterSubjectId(String(v));
          setFilterSectionId("");
          setQuizCurrentPage(1);
        }}
        placeholder="Select Subject"
        theme="green"
        disabled={!filterYearId || availableSubjects.length <= 1}
        widthClassName="min-w-[160px] shrink-0"
      />

      <CustomDropdown
        label="Section"
        options={availableSections.map(s => ({ label: s.name, value: s.id }))}
        value={filterSectionId}
        onChange={(v) => {
          setFilterSectionId(String(v));
          setQuizCurrentPage(1);
        }}
        placeholder="Select Section"
        theme="green"
        disabled={!filterSubjectId || availableSections.length <= 1}
        widthClassName="min-w-[160px] shrink-0"
      />
    </div>
  );

  return (
    <div className="w-[68%] max-md:w-full h-full p-2 max-md:p-3 max-md:pb-20 flex flex-col">
      <div className="mb-2 md:mb-4">
        {/* Mobile static text */}
        <div className="md:hidden mb-3 mt-0">
          <h1 className="font-bold text-2xl mb-1 text-[#282828]">
            {activeTab === "assignments" ? "Assignments" : activeTab === "quiz" ? "Quiz" : activeTab === "discussion" ? "Discussion forum" : "Lab"}
          </h1>
          <p className="text-[#282828] text-sm">
            {activeTab === "assignments" && "Create, manage, and evaluate assignments for your students efficiently."}
            {activeTab === "quiz" && "Design, organize, and publish quizzes to assess your students effectively."}
            {activeTab === "discussion" && "Create and manage project discussions for students."}
            {activeTab === "lab" && "Upload and manage lab manuals for your students."}
          </p>
        </div>

        {/* Desktop Tabs */}
        <h1 className="hidden md:flex font-bold text-2xl mb-1 items-center gap-2">
          <span
            onClick={() => handleMainTabChange("assignments")}
            className={`cursor-pointer transition-colors ${activeTab === "assignments" ? "text-[#43C17A]" : "text-[#282828]"}`}
          >
            Assignments
          </span>
          <span className="text-[#282828]">/</span>
          <span
            onClick={() => handleMainTabChange("quiz")}
            className={`cursor-pointer transition-colors ${activeTab === "quiz" ? "text-[#43C17A]" : "text-[#282828]"}`}
          >
            Quiz
          </span>
          <span className="text-[#282828]">/</span>
          <span
            onClick={() => handleMainTabChange("discussion")}
            className={`cursor-pointer transition-colors ${activeTab === "discussion" ? "text-[#43C17A]" : "text-[#282828]"}`}
          >
            Discussion forum
          </span>
          <span className="text-[#282828]">/</span>
          <span
            onClick={() => handleMainTabChange("lab")}
            className={`cursor-pointer transition-colors ${activeTab === "lab" ? "text-[#43C17A]" : "text-[#282828]"}`}
          >
            Lab
          </span>
        </h1>

        {/* Mobile Tabs */}
        <div className="md:hidden flex gap-5 overflow-x-auto scrollbar-hide pb-2 border-b border-gray-200 mt-2 mb-2 [&::-webkit-scrollbar]:hidden">
          <span
            onClick={() => handleMainTabChange("assignments")}
            className={`cursor-pointer pb-2 whitespace-nowrap text-sm font-bold ${activeTab === "assignments"
              ? "border-b-2 border-[#43C17A] text-[#43C17A]"
              : "border-b-2 border-transparent text-gray-500"
              }`}
          >
            Assignments
          </span>
          <span
            onClick={() => handleMainTabChange("quiz")}
            className={`cursor-pointer pb-2 text-sm font-bold ${activeTab === "quiz"
              ? "border-b-2 border-[#43C17A] text-[#43C17A]"
              : "border-b-2 border-transparent text-gray-500"
              }`}
          >
            Quiz
          </span>
          <span
            onClick={() => handleMainTabChange("discussion")}
            className={`cursor-pointer pb-2 whitespace-nowrap text-sm font-bold ${activeTab === "discussion"
              ? "border-b-2 border-[#43C17A] text-[#43C17A]"
              : "border-b-2 border-transparent text-gray-500"
              }`}
          >
            Discussion forum
          </span>
          <span
            onClick={() => handleMainTabChange("lab")}
            className={`cursor-pointer pb-2 text-sm font-bold ${activeTab === "lab"
              ? "border-b-2 border-[#43C17A] text-[#43C17A]"
              : "border-b-2 border-transparent text-gray-500"
              }`}
          >
            Lab
          </span>
        </div>

        <p className="text-[#282828] text-sm max-md:hidden">
          {activeTab === "assignments" &&
            "Create, manage, and evaluate assignments for your students efficiently."}
          {activeTab === "quiz" &&
            "Design, organize, and publish quizzes to assess your students effectively."}
          {activeTab === "discussion" &&
            "Create and manage project discussions for students."}
          {activeTab === "lab" &&
            "Upload and manage lab manuals for your students."}
        </p>
      </div>

      <div className="w-full flex flex-col flex-1 min-h-[500px]">
        <div className="flex flex-col gap-3 items-start h-full w-full">
          <div className="w-full">
            {activeTab === "assignments" && (
              <div className="flex justify-between w-full max-md:flex-col gap-2">
                <div className="hidden md:flex gap-4 pb-1">
                  <h5
                    className={`text-sm cursor-pointer pb-1 transition-all ${activeView === "active" ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                    onClick={() => handleAssignmentViewChange("active")}
                  >
                    Active Assignments
                  </h5>
                  <h5
                    className={`text-sm cursor-pointer pb-1 transition-all ${activeView === "previous" ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                    onClick={() => handleAssignmentViewChange("previous")}
                  >
                    Evaluated Assignments
                  </h5>
                </div>

                {/* Mobile Sub-tabs */}
                <div className="md:hidden flex overflow-x-auto scrollbar-hide gap-2 w-full border-b border-gray-200 mb-2 mt-0 [&::-webkit-scrollbar]:hidden">
                  <div
                    onClick={() => handleAssignmentViewChange("active")}
                    className={`whitespace-nowrap flex-1 text-center py-2 px-2 text-sm font-bold cursor-pointer ${activeView === "active"
                      ? "border-b-2 border-[#43C17A] text-[#43C17A]"
                      : "text-gray-500"
                      }`}
                  >
                    Active Assignments
                  </div>
                  <div
                    onClick={() => handleAssignmentViewChange("previous")}
                    className={`whitespace-nowrap flex-1 text-center py-2 px-2 text-sm font-bold cursor-pointer ${activeView === "previous"
                      ? "border-b-2 border-[#43C17A] text-[#43C17A]"
                      : "text-gray-500"
                      }`}
                  >
                    Evaluated Assignments
                  </div>
                </div>
                <button
                  className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-1.5 rounded-md hover:bg-[#102040] transition-colors w-fit max-md:w-full max-md:py-2.5 max-md:mt-1 font-bold shrink-0"
                  onClick={() => {
                    setView("add");
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("action", "addAssignment");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                >
                  Add Assignment
                </button>
              </div>
            )}

            {activeTab === "lab" && (
              <div className="flex justify-between w-full max-md:flex-col gap-2">
                <div className="hidden md:flex gap-4 pb-1"></div>
                <button
                  className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-1.5 rounded-md font-bold hover:bg-[#102040] transition-colors w-fit max-md:w-full max-md:py-2.5 max-md:mt-1 shrink-0 ml-auto"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("action", "createLab");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                >
                  Upload Lab Manual
                </button>
              </div>
            )}

            {(activeTab === "assignments" || activeTab === "lab") && view === "list" && filtersBlock}

            {activeTab === "quiz" && (
              <div className="w-full">
                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_1.4fr_0.7fr] w-full gap-3 mt-1 items-center">
                  <button
                    onClick={() => handleQuizViewChange("active")}
                    className={`lg:w-fit lg:px-6 lg:py-2 cursor-pointer rounded-md font-bold text-sm transition-colors ${quizView === "active" ? "bg-[#43C17A] text-white" : "bg-[#D5FFE7] text-[#43C17A]"}`}
                  >
                    Active Quizzes
                  </button>
                  <button
                    onClick={() => handleQuizViewChange("drafts")}
                    className={`px-8 py-2 cursor-pointer rounded-md font-bold text-sm transition-colors ${quizView === "drafts" ? "bg-[#43C17A] text-white" : "bg-[#D5FFE7] text-[#43C17A]"}`}
                  >
                    Drafts
                  </button>
                  <button
                    onClick={() => handleQuizViewChange("completed")}
                    className={`px-8 py-2 cursor-pointer rounded-md font-bold text-sm transition-colors ${quizView === "completed" ? "bg-[#43C17A] text-white" : "bg-[#D5FFE7] text-[#43C17A]"}`}
                  >
                    Completed Quizzes
                  </button>
                  <button
                    className="text-sm text-white cursor-pointer bg-[#16284F] lg:w-fit lg:px-3 py-2 rounded-md font-bold transition-colors"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("action", "createQuiz");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                  >
                    Create Quiz
                  </button>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden flex flex-col w-full gap-3 mt-1">
                  <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1 [&::-webkit-scrollbar]:hidden w-full border-b border-gray-200">
                    <div
                      onClick={() => handleQuizViewChange("active")}
                      className={`whitespace-nowrap px-4 py-2 text-sm font-bold cursor-pointer ${quizView === "active"
                        ? "border-b-2 border-[#43C17A] text-[#43C17A]"
                        : "text-gray-500"
                        }`}
                    >
                      Active Quizzes
                    </div>
                    <div
                      onClick={() => handleQuizViewChange("drafts")}
                      className={`whitespace-nowrap px-4 py-2 text-sm font-bold cursor-pointer ${quizView === "drafts"
                        ? "border-b-2 border-[#43C17A] text-[#43C17A]"
                        : "text-gray-500"
                        }`}
                    >
                      Drafts
                    </div>
                    <div
                      onClick={() => handleQuizViewChange("completed")}
                      className={`whitespace-nowrap px-4 py-2 text-sm font-bold cursor-pointer ${quizView === "completed"
                        ? "border-b-2 border-[#43C17A] text-[#43C17A]"
                        : "text-gray-500"
                        }`}
                    >
                      Completed Quizzes
                    </div>
                  </div>
                    <button
                      className="w-full text-sm text-white cursor-pointer bg-[#16284F] px-4 py-2.5 rounded-md font-bold hover:bg-[#102040] transition-colors"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("action", "createQuiz");
                        router.push(`${pathname}?${params.toString()}`);
                      }}
                    >
                      Create Quiz
                    </button>
                  </div>
                  
                  {/* Filters block for Quiz tab */}
                  {view === "list" && filtersBlock}
                </div>
              )}

            {activeTab === "discussion" && (
              <div className="flex justify-between w-full max-md:flex-col gap-2">
                <div className="hidden md:flex gap-4 pb-1">
                  <h5
                    className={`text-sm cursor-pointer pb-1 transition-all ${discussionView === "active" ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                    onClick={() => handleDiscussionViewChange("active")}
                  >
                    Active Discussions
                  </h5>
                  <h5
                    className={`text-sm cursor-pointer pb-1 transition-all ${discussionView === "completed" ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                    onClick={() => handleDiscussionViewChange("completed")}
                  >
                    Completed Discussions
                  </h5>
                </div>

                {/* Mobile Sub-tabs */}
                <div className="md:hidden flex overflow-x-auto scrollbar-hide gap-2 w-full border-b border-gray-200 mb-2 mt-0 [&::-webkit-scrollbar]:hidden">
                  <div
                    onClick={() => handleDiscussionViewChange("active")}
                    className={`whitespace-nowrap flex-1 text-center py-2 px-2 text-sm font-bold cursor-pointer ${discussionView === "active"
                      ? "border-b-2 border-[#43C17A] text-[#43C17A]"
                      : "text-gray-500"
                      }`}
                  >
                    Active Discussions
                  </div>
                  <div
                    onClick={() => handleDiscussionViewChange("completed")}
                    className={`whitespace-nowrap flex-1 text-center py-2 px-2 text-sm font-bold cursor-pointer ${discussionView === "completed"
                      ? "border-b-2 border-[#43C17A] text-[#43C17A]"
                      : "text-gray-500"
                      }`}
                  >
                    Completed Discussions
                  </div>
                </div>

                <button
                  className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-1.5 rounded-md font-bold hover:bg-[#102040] transition-colors w-fit max-md:w-full max-md:py-2.5 max-md:mt-1 shrink-0"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("action", "createDiscussion");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                >
                  Create Discussion
                </button>
              </div>
            )}

            {activeTab === "discussion" && view === "list" && filtersBlock}          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full pr-1">
            {activeTab === "assignments" &&
              (isLoading || isFacultyContextLoading || isUserContextLoading ? (
                <div className="w-full">
                  {[1, 2, 3].map((i) => (
                    <AssignmentSkeleton key={i} />
                  ))}
                </div>
              ) : assignments.length === 0 ? (
                <div className="w-full py-10 text-center text-gray-500">
                  No assignments found.
                </div>
              ) : (
                <div className="relative w-full">
                  {isFetchingMore && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                      <div className="w-8 h-8 border-4 border-[#43C17A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  <AssignmentCard
                    cardProp={assignments}
                    activeView={activeView}
                    onEdit={(a) => {
                      setEditing(a);
                      setView("edit");
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("action", "editAssignment");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    onDelete={handleDelete}
                  />
                </div>
              ))}

            {activeTab === "quiz" && (
              <div className="flex flex-col min-h-full pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FacultyQuizResumeBanner />
                  </div>

                  {isFacultyContextLoading || isUserContextLoading || quizzesLoading ? (
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <FacultyQuizShimmer key={i} />
                      ))}
                    </div>
                  ) : (
                    <>
                      {quizzes.length === 0 ? (
                        <div className="col-span-2 py-10 text-center text-gray-500 text-sm">
                          No {quizView} quizzes found.
                        </div>
                      ) : (
                        quizzes.map((quiz: any) => {
                          const matchedSection = sections?.find((s: any) => s.collegeSectionsId === quiz.collegeSectionsId) as any;
                          const quizData = quiz as any;
                          
                          const subtitleStr = buildCardSubtitle(quizData, matchedSection);

                          return (
                          <FacultyQuizCard
                            key={quiz.quizId}
                            data={{
                              quizId: quiz.quizId,
                              title: quiz.quizTitle,
                              subtitle: subtitleStr,
                              duration: `${formatDate(quiz.startDate)} → ${formatDate(quiz.endDate)}`,
                              totalQuestions: quiz.quiz_questions?.length ?? 0,
                              totalMarks: quiz.totalMarks,
                              status: quiz.status,
                            }}
                            onViewSubmissions={
                              quizView !== "drafts"
                                ? (quizId) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("action", "viewQuizSubmissions");
                                    params.set("quizId", String(quizId));
                                    router.push(`${pathname}?${params.toString()}`);
                                  }
                                : undefined
                            }
                            onEdit={quizView !== "completed" ? handleEditQuiz : undefined}
                            onDelete={quizView !== "completed" ? confirmDeleteQuiz : undefined}
                            onPublish={quizView === "drafts" ? handlePublishQuiz : undefined}
                          />
                        );
                        })
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "discussion" && (
              <div className="flex flex-col gap-4 pb-10">
                {discussionView === "active" &&
                  (discussionsLoading || isFacultyContextLoading || isUserContextLoading ? (
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3].map((i) => <FacultyDiscussionShimmer key={i} />)}
                    </div>
                  ) : discussions.length === 0 ? (
                    <div className="w-full py-10 text-center text-gray-500">
                      No active discussions found.
                    </div>
                  ) : (
                    <>
                      {discussions.map((discussion, idx) => {
                        const matchedSection = sections?.find((s: any) => s.collegeSectionsId === discussion.collegeSectionsId) as any;
                        
                        const subtitleStr = buildCardSubtitle(discussion, matchedSection);

                        return (
                          <FacultyDiscussionCard
                            key={`${discussion.discussionId}-${discussion.collegeSectionsId || idx}`}
                            data={{
                              ...discussion,
                              subtitle: subtitleStr
                            }}
                            discussionView="active"
                            onDelete={(id) => setDeleteDiscussionId(id)}
                          />
                        );
                      })}
                    </>
                  ))}

                {discussionView === "completed" &&
                  (discussionsLoading || isFacultyContextLoading || isUserContextLoading ? (
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3].map((i) => <FacultyDiscussionShimmer key={i} />)}
                    </div>
                  ) : discussions.length === 0 ? (
                    <div className="w-full py-10 text-center text-gray-500">
                      No completed discussions found.
                    </div>
                  ) : (
                    <>
                      {discussions.map((discussion, idx) => {
                        const matchedSection = sections?.find((s: any) => s.collegeSectionsId === discussion.collegeSectionsId) as any;
                        
                        const subtitleStr = buildCardSubtitle(discussion, matchedSection);

                        return (
                          <FacultyDiscussionCard
                            key={`${discussion.discussionId}-${discussion.collegeSectionsId || idx}`}
                            data={{
                              ...discussion,
                              subtitle: subtitleStr
                            }}
                            discussionView="completed"
                          />
                        );
                      })}
                    </>
                  ))}

              </div>
            )}

            {activeTab === "lab" && (
              <div className="flex flex-col gap-4 pb-2">
                {labsLoading || isFacultyContextLoading || isUserContextLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => <FacultyDiscussionShimmer key={i} />)}
                  </div>
                ) : labs.length === 0 ? (
                  <div className="w-full py-10 text-center text-gray-500">
                    No lab manuals uploaded yet.
                  </div>
                ) : (
                  <>
                    {labs.map((lab) => (
                      <FacultyLabCard
                        key={lab.labId}
                        data={lab}
                        onDelete={(labId) => setDeleteLabId(labId)}
                        onEdit={handleEditLab}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-full pt-3 pb-2 mt-auto border-t border-gray-100 flex justify-center z-10 bg-[#f4f4f9] rounded-b-lg">
            {activeTab === "assignments" && totalCount > 0 && (
              <AssignmentPagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                disabled={isFetchingMore}
                alwaysShow
              />
            )}
            
            {activeTab === "quiz" && (
              <AssignmentPagination
                currentPage={quizCurrentPage}
                totalItems={quizTotalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setQuizCurrentPage}
                alwaysShow
              />
            )}
            
            {activeTab === "discussion" && (
              <AssignmentPagination
                currentPage={discussionCurrentPage}
                totalItems={discussionTotalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setDiscussionCurrentPage}
                alwaysShow
              />
            )}
            
            {activeTab === "lab" && (
              <AssignmentPagination
                currentPage={labCurrentPage}
                totalItems={labTotalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setLabCurrentPage}
                alwaysShow
              />
            )}
          </div>
        </div>
      </div>

      <CalendarConfirmDeleteModal
        open={!!deleteDiscussionId}
        onConfirm={handleDeleteDiscussion}
        onCancel={() => setDeleteDiscussionId(null)}
        isDeleting={isDeleting}
        title="Delete"
        name="Discussion"
        customDescription={
          <>
            Are you sure you want to delete discussion <span className="font-bold text-slate-800">{deleteDiscussionId ? `"${discussions.find((d: any) => d.discussionId === deleteDiscussionId)?.title || 'discussion'}"` : "discussion"}</span>? This action is permanent and cannot be undone.
          </>
        }
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
      />

      <CalendarConfirmDeleteModal
        open={!!deleteQuizId}
        onConfirm={executeDeleteQuiz}
        onCancel={() => setDeleteQuizId(null)}
        isDeleting={deleteQuizMutation.isPending || false}
        title="Delete"
        name="Quiz"
        customDescription={
          <>
            Are you sure you want to delete quiz <span className="font-bold text-slate-800">{deleteQuizId ? `"${quizzes.find((q: any) => q.quizId === deleteQuizId)?.quizTitle || 'quiz'}"` : "quiz"}</span>? This action is permanent and cannot be undone.
          </>
        }
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
      />

      <CalendarConfirmDeleteModal
        open={!!deleteLabId}
        onConfirm={executeDeleteLab}
        onCancel={() => setDeleteLabId(null)}
        isDeleting={isDeletingLab}
        title="Delete"
        name="Lab Manual"
        customDescription={
          <>
            Are you sure you want to delete lab manual <span className="font-bold text-slate-800">{deleteLabId ? `"${labs.find((l: any) => l.labId === deleteLabId)?.labTitle || 'lab manual'}"` : "lab manual"}</span>? This action is permanent and cannot be undone.
          </>
        }
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
      />
    </div>
  );
}

export default function AssignmentsLeft() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full h-[50vh]">
          <Loader />
        </div>
      }
    >
      <AssignmentsLeftContent />
    </Suspense>
  );
}
