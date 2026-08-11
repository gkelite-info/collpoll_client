// @ts-nocheck
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { FaAngleLeft, FaPlus } from "react-icons/fa6";
import SelectionModal, { SelectionItem } from "./modals/SelectionModal";
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFacultySections,
  fetchFacultySubjects,
  fetchFacultyYears,
  fetchFacultyBranches,
} from "@/lib/helpers/faculty/facultyAPI";
import toast from "react-hot-toast";
import { FacultySectionRow } from "@/lib/helpers/faculty/facultysectionsAPI";
import {
  addProjectFiles,
  uploadProjectFile,
} from "@/lib/helpers/projects/projectFiles";
import { addStudentsToProject } from "@/lib/helpers/projects/projectTeamMembers";
import { addMentorsToProject } from "@/lib/helpers/projects/projectMentors";
import { saveProject } from "@/lib/helpers/projects/project";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { FilterDropdown } from "../../admin/assignments/components/filterDropdown";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export type ProjectPayload = {
  title: string;
  description: string;
  year: string;
  subject: string;
  section: string;
  domain: string[];
  marks: number | string;
  startDate: string;
  endDate: string;
  mentorIds: number[];
  studentIds: number[];
  fileUrls: string[];
  files: File[];
};

type FacultyOption = {
  id: number | string;
  name: string;
  image?: string;
};

export interface AddProjectFormProps {
  onCancel: () => void;
  college_branch: string | null;
  collegeAcademicYear: string | null;
  faculty_edu_type: string | null;
}

export const useAddProjectForm = ({
  onCancel,
  college_branch,
  collegeAcademicYear,
  faculty_edu_type,
}: AddProjectFormProps) => {
  const {
    collegeId: facultyCollegeId,
    facultyId: contextFacultyId,
    role,
  } = useFaculty();
  const { collegeId: adminCollegeId, adminId } = useAdmin();
  const { role: userRole, collegeEducationType } = useUser();

  const router = useRouter();
  const searchParams = useSearchParams();

  const facultyIdFromParams = searchParams.get("facultyId");
  const selectedYearId = searchParams.get("yearId");
  const selectedSubjectId = searchParams.get("subjectId");

  const resolvedFacultyId =
    contextFacultyId ??
    (facultyIdFromParams ? Number(facultyIdFromParams) : null);
  const resolvedCollegeId = facultyCollegeId ?? adminCollegeId;

  const isAdmin = userRole === "Admin";

  const [availableYears, setAvailableYears] = useState<
    { id: number; label: string }[]
  >([]);
  const [availableSubjects, setAvailableSubjects] = useState<
    { id: number; label: string }[]
  >([]);
  const [availableSections, setAvailableSections] = useState<
    FacultySectionRow[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [domainInput, setDomainInput] = useState("");
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState<SelectionItem[]>([]);
  const [selectedMentors, setSelectedMentors] = useState<SelectionItem[]>([]);

  const [formData, setFormData] = useState<ProjectPayload & { branch: string }>(
    {
      title: "",
      description: "",
      domain: [],
      marks: "" as unknown as number,
      startDate: "",
      endDate: "",
      mentorIds: [],
      studentIds: [],
      fileUrls: [],
      files: [],
      branch: "",
      year: "",
      subject: "",
      section: "",
    },
  );

  const handleChange = <K extends keyof (ProjectPayload & { branch: string })>(
    field: K,
    value: (ProjectPayload & { branch: string })[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isSchool = isSchoolEducation(faculty_edu_type);
  const isInter =
    faculty_edu_type === "Inter" ||
    faculty_edu_type === "BIEAP" ||
    faculty_edu_type === "TSBIE";

  const queryClient = useQueryClient();

  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["formProjectsBranches", resolvedFacultyId, isSchool],
    queryFn: async () => {
      if (!resolvedFacultyId || isSchool) return [];
      return await fetchFacultyBranches(resolvedFacultyId);
    },
    enabled: !!resolvedFacultyId && !isSchool,
    staleTime: 1000 * 60 * 5,
  });

  const { data: years = [], isLoading: yearsLoading } = useQuery({
    queryKey: ["formProjectsYears", resolvedFacultyId, isSchool, formData.branch],
    queryFn: async () => {
      if (!resolvedFacultyId) return [];
      if (!isSchool && formData.branch) {
        return await fetchFacultyYears(
          resolvedFacultyId,
          parseInt(formData.branch),
        );
      }
      return await fetchFacultyYears(resolvedFacultyId);
    },
    enabled: !!resolvedFacultyId && (isSchool || !!formData.branch),
    staleTime: 1000 * 60 * 5,
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["projectsSubjects", resolvedFacultyId, formData.year],
    queryFn: async () => {
      if (!resolvedFacultyId || !formData.year) return [];
      return await fetchFacultySubjects(
        resolvedFacultyId,
        parseInt(formData.year),
      );
    },
    enabled: !!resolvedFacultyId && !!formData.year,
    staleTime: 1000 * 60 * 5,
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: [
      "projectsSections",
      resolvedFacultyId,
      formData.year,
      formData.subject,
    ],
    queryFn: async () => {
      if (!resolvedFacultyId || !formData.year || !formData.subject) return [];
      return await fetchFacultySections(
        resolvedFacultyId,
        parseInt(formData.year),
        parseInt(formData.subject),
      );
    },
    enabled: !!resolvedFacultyId && !!formData.year && !!formData.subject,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (branches.length === 1 && !formData.branch) {
      setFormData((prev) => ({ ...prev, branch: branches[0].id.toString() }));
    } else if (
      formData.branch &&
      !branches.some((b) => b.id.toString() === formData.branch)
    ) {
      setFormData((prev) => ({ ...prev, branch: "" }));
    }
  }, [branches]);

  useEffect(() => {
    if (years.length > 0) {
      const selected = (selectedYearId && selectedYearId !== "All")
        ? years.find((y) => y.id === Number(selectedYearId))
        : years.length === 1
          ? years[0]
          : null;
      if (selected && !formData.year) {
        setFormData((prev) => ({ ...prev, year: selected.id.toString() }));
      } else if (
        formData.year &&
        !years.some((y) => y.id.toString() === formData.year)
      ) {
        setFormData((prev) => ({ ...prev, year: "" }));
      }
    } else if (years.length === 0 && formData.year) {
      setFormData((prev) => ({ ...prev, year: "" }));
    }
  }, [years, selectedYearId]);

  useEffect(() => {
    if (subjects.length > 0) {
      const selected = (selectedSubjectId && selectedSubjectId !== "All")
        ? subjects.find((s) => s.id === Number(selectedSubjectId))
        : subjects.length === 1
          ? subjects[0]
          : null;
      if (selected && !formData.subject) {
        setFormData((prev) => ({ ...prev, subject: selected.id.toString() }));
      } else if (
        formData.subject &&
        !subjects.some((s) => s.id.toString() === formData.subject)
      ) {
        setFormData((prev) => ({ ...prev, subject: "" }));
      }
    } else if (subjects.length === 0 && formData.subject) {
      setFormData((prev) => ({ ...prev, subject: "" }));
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (sections.length > 0) {
      const uniqueSections = Array.from(
        new Map(
          sections.map((sec) => [sec.college_sections?.collegeSectionsId, sec])
        ).values()
      );
      
      const firstSectionId =
        uniqueSections.length === 1
          ? uniqueSections[0].college_sections?.collegeSectionsId.toString() ?? ""
          : "";
          
      if (firstSectionId && !formData.section) {
        setFormData((prev) => ({ ...prev, section: firstSectionId }));
      } else if (
        formData.section &&
        !sections.some(
          (s) =>
            s.college_sections?.collegeSectionsId.toString() ===
            formData.section,
        )
      ) {
        setFormData((prev) => ({ ...prev, section: "" }));
      }
    } else if (sections.length === 0 && formData.section) {
      setFormData((prev) => ({ ...prev, section: "" }));
    }
  }, [sections]);

  const fetchMentorItems = useCallback(
    async (searchQuery: string, page: number) => {
      if (!resolvedCollegeId) return { data: [], hasMore: false };
      try {
        const response = await fetchFilteredFaculties({
          collegeId: resolvedCollegeId,
          searchQuery,
          page,
          limit: 10,
        });

        return {
          data: response.data.map((faculty: any) => ({
            id: Number(faculty.id),
            name: faculty.name,
            image: faculty.image,
          })),
          hasMore: response.hasMore ?? false,
        };
      } catch (error) {
        console.error("Failed to load mentors", error);
        return { data: [], hasMore: false };
      }
    },
    [resolvedCollegeId],
  );

  const fetchStudentItems = useCallback(
    async (searchQuery: string, page: number) => {
      if (!resolvedCollegeId) {
        return { data: [], hasMore: false };
      }

      try {
        const yearId = formData.year ? parseInt(formData.year) : undefined;
        const sectionId = formData.section ? parseInt(formData.section) : undefined;

        const response = await fetchStudentsWithProfile(
          Number(resolvedCollegeId),
          {
            ...(yearId && !isNaN(yearId) ? { yearId } : {}),
            ...(sectionId && !isNaN(sectionId) ? { sectionId } : {}),
            searchQuery,
            page,
            limit: 10,
          },
        );
        return {
          data: response.data.map((student: any) => ({
            id: Number(student.studentId),
            name: student.users?.fullName || `Student ${student.studentId}`,
            image: student.users?.user_profile?.[0]?.profileUrl,
          })),
          hasMore: response.hasMore ?? false,
        };
      } catch (error) {
        console.error("Failed to load students:", error);
        return { data: [], hasMore: false };
      }
    },
    [resolvedCollegeId, formData.year, formData.section],
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles?.length > 0) {
      const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "zip"];
      const validFiles = Array.from(droppedFiles).filter((file) =>
        allowedExtensions.includes(
          file.name.split(".").pop()?.toLowerCase() || "",
        ),
      );
      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          files: [...prev.files, ...validFiles],
          fileUrls: [...prev.fileUrls, ...validFiles.map((f) => f.name)],
        }));
      } else {
        alert("Invalid file type. Please upload PDF, JPG, PNG, or ZIP.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const newFiles = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        fileUrls: [...prev.fileUrls, ...newFiles.map((f) => f.name)],
      }));
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== indexToRemove),
      fileUrls: prev.fileUrls.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleAddDomain = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && domainInput.trim()) {
      e.preventDefault();
      
      const newDomains = domainInput
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d !== "");

      const uniqueNewDomains = newDomains.filter(
        (d) => !formData.domain.includes(d)
      );

      if (uniqueNewDomains.length > 0) {
        handleChange("domain", [...formData.domain, ...uniqueNewDomains]);
      }
      setDomainInput("");
    }
  };

  const removeDomain = (domainToRemove: string) => {
    handleChange(
      "domain",
      formData.domain.filter((d) => d !== domainToRemove),
    );
  };

  const handleSaveProject = async () => {
    const pendingDomains = domainInput
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");

    const uniquePendingDomains = pendingDomains.filter(
      (d) => !formData.domain.includes(d)
    );

    const domainValues = [...formData.domain, ...uniquePendingDomains];

    if (!formData.title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (domainValues.length === 0) {
      toast.error("Please add at least one domain.");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Project description is required.");
      return;
    }
    if (!formData.year) {
      toast.error("Please select a year.");
      return;
    }
    if (!formData.subject) {
      toast.error("Please select a subject.");
      return;
    }
    if (!formData.section) {
      toast.error("Please select a section.");
      return;
    }
    if (formData.studentIds.length === 0) {
      toast.error("Please assign at least one team member.");
      return;
    }
    if (formData.mentorIds.length === 0) {
      toast.error("Please assign at least one mentor.");
      return;
    }
    if (formData.marks === "" || Number(formData.marks) <= 0) {
      toast.error("Please enter valid marks.");
      return;
    }
    if (!formData.startDate) {
      toast.error("Please select a start date.");
      return;
    }
    if (!formData.endDate) {
      toast.error("Please select an to date.");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("To date must be greater than or equal to from date.");
      return;
    }
    if (!resolvedCollegeId) {
      toast.error("College context is not loaded.");
      return;
    }
    if (!resolvedFacultyId) {
      toast.error("Faculty context is not loaded.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating project...");

    try {
      const projectResult = await saveProject({
        title: formData.title,
        description: formData.description,
        domain: domainValues,
        marks: formData.marks === "" ? 0 : Number(formData.marks),
        startDate: formData.startDate,
        endDate: formData.endDate,
        collegeId: resolvedCollegeId,
        facultyId: resolvedFacultyId,
        adminId: isAdmin ? adminId : null,
        collegeAcademicYearId: Number(formData.year),
        collegeSubjectId: Number(formData.subject),
        collegeSectionsId: Number(formData.section),
      });

      if (!projectResult.success || !projectResult.projectId) {
        throw new Error("Failed to create project");
      }

      const newId = projectResult.projectId;
      const uploadedUrls: string[] = [];

      for (const file of formData.files) {
        const result = await uploadProjectFile(newId, file);
        if (result.success) uploadedUrls.push(result.publicUrl);
        else console.warn("File upload failed for:", file.name);
      }

      const [teamRes, mentorRes, fileRes] = await Promise.all([
        addStudentsToProject(newId, formData.studentIds),
        addMentorsToProject(newId, formData.mentorIds),
        addProjectFiles(newId, uploadedUrls),
      ]);

      if (teamRes.success && mentorRes.success && fileRes.success) {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        toast.success("Project and all details saved!", { id: loadingToast });

        // Clear form immediately for instant UX feedback
        setFormData({
          title: "",
          description: "",
          year: "",
          subject: "",
          section: "",
          domain: [],
          marks: "",
          startDate: "",
          endDate: "",
          mentorIds: [],
          studentIds: [],
          fileUrls: [],
          files: [],
        });
        setDomainInput("");
        setSelectedMentors([]);
        setSelectedStudents([]);

        onCancel();
      } else {
        toast.error("Project saved, but some team/mentor data failed.", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("handleSaveProject error:", error);
      toast.error("Something went wrong during save.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSaveProject,
    domainInput,
    setDomainInput,
    handleAddDomain,
    removeDomain,
    handleFileChange,
    removeFile,
    handleDrag,
    handleDrop,
    isDragging,
    setIsDragging,
    fileInputRef,
    loading,
    isMentorModalOpen,
    setIsMentorModalOpen,
    isStudentModalOpen,
    setIsStudentModalOpen,
    selectedMentors,
    setSelectedMentors,
    selectedStudents,
    setSelectedStudents,
    fetchMentorItems,
    fetchStudentItems,
    branches,
    years,
    subjects,
    sections,
    isBranchesLoading: branchesLoading,
    isYearsLoading: yearsLoading,
    isSubjectsLoading: subjectsLoading,
    isSectionsLoading: sectionsLoading,
    isAdmin,
    isInter,
    isSchool,
    resolvedCollegeId,
    setFormData,
    onCancel,
    college_branch,
    collegeAcademicYear,
    faculty_edu_type,
  };
};
