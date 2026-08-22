"use client";

import { CaretLeftIcon } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { useInstitutionTerminology } from "@/app/utils/hooks/useInstitutionTerminology";
import FacultyLabCard, {
  type LabManual,
} from "@/app/(screens)/faculty/assignments/components/FacultyLabCard";
import FacultyDiscussionShimmer from "@/app/(screens)/faculty/assignments/shimmer/discussionShimmer";
import ConfirmDeleteModal from "@/app/(screens)/faculty/assignments/components/confirmDeleteModal";
import {
  deleteLabManual,
  fetchLabManualsForStaff,
  getLabManualPublicUrl,
} from "@/lib/helpers/faculty/facultyLabManualHelper";
import TabNavigation from "./tabNavigation";
import AdminLabForm from "./adminLabForm";
import DiscussionDeptCard from "./discussionDeptCard";
import DiscussionCourseCard from "./discussionCourseCard";
import { DiscussionDeptCardSkeleton } from "./shimmers/DiscussionDeptCardSkeleton";
import { DiscussionCourseCardSkeleton } from "./shimmers/courseCardSkeleton";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { fetchQuizFilterOptions } from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";
import { fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import {
  fetchAdminLabDepartments,
  fetchAdminLabSubjects,
} from "@/lib/helpers/admin/assignments/adminLabAPI";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import TaskPanel, { Task } from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  fetchFacultyTasksByFacultyId,
  saveFacultyTask,
} from "@/lib/helpers/faculty/facultyTasks";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type AdminLabRow = {
  labManualId: number;
  labTitle: string;
  collegeSubjectId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
  pdfUrl: string;
  description?: string | null;
  fileSize?: number;
  createdAt: string;
  college_subjects?: {
    subjectName?: string | null;
  } | null;
  college_sections?: {
    sectionName?: string | null;
    collegeSections?: string | null;
  } | null;
};

const ITEMS_PER_PAGE = 9;

const typeIcons: Record<string, string> = {
  class: "/class.png",
  exam: "/exam.png",
  meeting: "/meeting.png",
  holiday: "/calendar-3d.png",
  event: "/event.png",
  notice: "/clip.png",
  result: "/result.jpg",
  timetable: "/timetable.png",
  placement: "/placement.png",
  emergency: "/emergency.png",
  finance: "/finance.jpg",
  other: "/others.png",
};

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

type AdminLabRightPanelProps = {
  facultyTasks: Task[];
  facultyId?: number;
  collegeSubjectId?: number;
  loadingTasks: boolean;
  announcements: any[];
  onSaveTask: (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number,
  ) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  currentAnnouncementsView: "my" | "others";
  onAnnouncementsViewChange: (view: "my" | "others") => void;
  refreshAnnouncements: () => Promise<void>;
};

function AdminLabRightPanel({
  facultyTasks,
  facultyId,
  collegeSubjectId,
  loadingTasks,
  announcements,
  onSaveTask,
  onDeleteTask,
  currentAnnouncementsView,
  onAnnouncementsViewChange,
  refreshAnnouncements,
}: AdminLabRightPanelProps) {
  return (
    <div className="w-[32%] p-2 h-full flex flex-col">
      <WorkWeekCalendar />
      <TaskPanel
        role="faculty"
        facultyTasks={facultyTasks}
        facultyId={facultyId}
        collegeSubjectId={collegeSubjectId}
        loading={loadingTasks}
        onAddTask={() => {}}
        onSaveTask={onSaveTask}
        onDeleteTask={onDeleteTask}
      />
      <AnnouncementsCard
        announceCard={announcements}
        height="80vh"
        currentView={currentAnnouncementsView}
        onViewChange={onAnnouncementsViewChange}
        refreshAnnouncements={refreshAnnouncements}
      />
    </div>
  );
}

export default function AdminLabBasic() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { adminId, collegeId, collegeEducationId: defaultEducationId, collegeEducationType: defaultEducationType } = useAdmin();
  const { isSchool } = useInstitutionTerminology();
  const action = searchParams.get("action");
  const branchIdParam = searchParams.get("branchId");
  const yearIdParam = searchParams.get("yearId");
  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const subjectId = searchParams.get("subjectId");
  const sectionIdParam = searchParams.get("sectionId");
  const facultyIdParam = searchParams.get("facultyId");
  const facultyId =
    facultyIdParam && facultyIdParam !== "-" ? Number(facultyIdParam) : undefined;
  const { userId, role } = useUser();

  const [labs, setLabs] = useState<LabManual[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deptCards, setDeptCards] = useState<any[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptPage, setDeptPage] = useState(1);
  const [deptTotalCount, setDeptTotalCount] = useState(0);
  const [subjectCards, setSubjectCards] = useState<any[]>([]);
  const [subjectPage, setSubjectPage] = useState(1);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [branchOptions, setBranchOptions] = useState([
    { label: "All", value: "All" },
  ]);
  const [yearOptions, setYearOptions] = useState([
    { label: "All", value: "All" },
  ]);
  const [deleteLabId, setDeleteLabId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingLab, setEditingLab] = useState<LabManual | null>(null);
  const [facultyTasks, setFacultyTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementView, setAnnouncementView] = useState<"my" | "others">(
    "others",
  );
  const [branchYearLabel, setBranchYearLabel] = useState({
    branch: "",
    year: "",
  });

  const [educations, setEducations] = useState<any[]>([]);
  const [education, setEducation] = useState<any>(null);

  const currentEducationId = education?.collegeEducationId ?? defaultEducationId;
  const currentEducationType = education?.collegeEducationType ?? defaultEducationType;

  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");

  useEffect(() => {
    if (subjectId) setSubjectFilter(subjectId);
    else setSubjectFilter("All");
  }, [subjectId]);

  useEffect(() => {
    if (sectionIdParam) setSectionFilter(sectionIdParam);
    else setSectionFilter("All");
  }, [sectionIdParam]);

  useEffect(() => {
    if (dept) setBranchFilter(dept);
    else setBranchFilter("All");
  }, [dept]);

  useEffect(() => {
    if (year) setYearFilter(year);
    else setYearFilter("All");
  }, [year]);

  useEffect(() => {
    if (!collegeId || !currentEducationId) return;

    supabase
      .from("college_subjects")
      .select(`
        collegeSubjectId, subjectName, collegeBranchId, collegeAcademicYearId,
        college_branch ( collegeBranchCode ),
        college_academic_year ( collegeAcademicYear )
      `)
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", currentEducationId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .then(({ data }) => setAllSubjects(data || []));

    supabase
      .from("college_sections")
      .select("collegeSectionsId, collegeSections, collegeBranchId, collegeAcademicYearId")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", currentEducationId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .then(({ data }) => setAllSections(data || []));
  }, [collegeId, currentEducationId]);

  const filteredSubjects = allSubjects.filter(s => {
    const bMatch = branchFilter === "All" || (Array.isArray(s.college_branch) ? s.college_branch[0]?.collegeBranchCode : s.college_branch?.collegeBranchCode) === branchFilter;
    const yMatch = yearFilter === "All" || (Array.isArray(s.college_academic_year) ? s.college_academic_year[0]?.collegeAcademicYear : s.college_academic_year?.collegeAcademicYear) === yearFilter;
    return bMatch && yMatch;
  });

  const subjectOptions = [
    { label: "All", value: "All" },
    ...filteredSubjects.map(s => ({ label: s.subjectName, value: String(s.collegeSubjectId) }))
  ];

  const selectedSubjectData = subjectFilter !== "All" ? allSubjects.find(s => String(s.collegeSubjectId) === subjectFilter) : null;

  const filteredSections = allSections.filter(s => {
    if (selectedSubjectData) {
      return s.collegeBranchId === selectedSubjectData.collegeBranchId && s.collegeAcademicYearId === selectedSubjectData.collegeAcademicYearId;
    }

    const branchMatches = branchIdParam
      ? s.collegeBranchId === Number(branchIdParam)
      : true;
    const yearMatches = yearIdParam
      ? s.collegeAcademicYearId === Number(yearIdParam)
      : true;

    return branchMatches && yearMatches;
  });

  const sectionOptions = [
    { label: "All", value: "All" },
    ...filteredSections.map(s => ({ label: s.collegeSections, value: String(s.collegeSectionsId) }))
  ];

  const handleSubjectChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "All") {
      params.delete("subjectId");
      params.delete("sectionId");
      params.delete("branchId");
      params.delete("yearId");
      params.delete("dept");
      params.delete("year");
      router.push(`${pathname}?${params.toString()}`);
    } else {
      const subj = allSubjects.find(s => String(s.collegeSubjectId) === val);
      if (subj) {
        params.set("branchId", String(subj.collegeBranchId));
        params.set("yearId", String(subj.collegeAcademicYearId));
        const branchCode = Array.isArray(subj.college_branch) ? subj.college_branch[0]?.collegeBranchCode : subj.college_branch?.collegeBranchCode;
        const yearStr = Array.isArray(subj.college_academic_year) ? subj.college_academic_year[0]?.collegeAcademicYear : subj.college_academic_year?.collegeAcademicYear;
        if (branchCode) params.set("dept", branchCode);
        if (yearStr) params.set("year", yearStr);
        params.set("subjectId", String(subj.collegeSubjectId));
        params.delete("sectionId");
        router.push(`${pathname}?${params.toString()}`);
      }
    }
  };

  const handleSectionChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "All") {
      params.delete("sectionId");
    } else {
      params.set("sectionId", val);
    }
    setCurrentPage(1);
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectEducation = (edu: any) => {
    setEducation(edu);
  };

  useEffect(() => {
    if (collegeId) {
      fetchEducations(collegeId).then(setEducations);
    }
  }, [collegeId]);

  const labSubjectSectionFilter = `${subjectId ?? ""}:${sectionIdParam ?? ""}`;
  const branchYearTitle =
    [dept || branchYearLabel.branch, year || branchYearLabel.year]
      .filter(Boolean)
      .join(" - ") || "Lab";

  async function fetchLabs() {
    if (
      !collegeId ||
      !currentEducationId ||
      !branchIdParam ||
      !yearIdParam ||
      !subjectId
    ) {
      return;
    }

    try {
      setLabsLoading(true);
      const response = await fetchLabManualsForStaff({
        collegeId,
        collegeEducationId: currentEducationId,
        collegeBranchId: Number(branchIdParam),
        collegeAcademicYearId: Number(yearIdParam),
        collegeSubjectId: Number(subjectId),
        collegeSectionsId: sectionIdParam ? Number(sectionIdParam) : undefined,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });

      const formatted = await Promise.all(
        response.data.map(async (lab: AdminLabRow) => {
          const fileUrl = await getLabManualPublicUrl(lab.pdfUrl);
          return {
            labId: lab.labManualId,
            labTitle: lab.labTitle,
            collegeSubjectId: lab.collegeSubjectId,
            collegeAcademicYearId: lab.collegeAcademicYearId,
            collegeSectionsId: lab.collegeSectionsId,
            pdfUrl: lab.pdfUrl,
            subjectName: lab.college_subjects?.subjectName || undefined,
            sectionName:
              lab.college_sections?.sectionName ||
              lab.college_sections?.collegeSections ||
              undefined,
            description: lab.description || undefined,
            fileName: lab.pdfUrl.split("/").pop() || "Lab manual.pdf",
            fileSize: lab.fileSize ?? 0,
            fileUrl: fileUrl || undefined,
            uploadedAt: lab.createdAt,
          };
        }),
      );

      setLabs(formatted);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Admin labs fetch error:", error);
      toast.error("Failed to fetch lab manuals");
    } finally {
      setLabsLoading(false);
    }
  }

  useEffect(() => {
    fetchLabs();
  }, [
    collegeId,
    currentEducationId,
    branchIdParam,
    yearIdParam,
    labSubjectSectionFilter,
    currentPage,
  ]);

  useEffect(() => {
    if (!branchIdParam && !yearIdParam) {
      setBranchYearLabel({ branch: "", year: "" });
      return;
    }

    const loadBranchYearLabel = async () => {
      const [{ data: branch }, { data: academicYear }] = await Promise.all([
        branchIdParam
          ? supabase
              .from("college_branch")
              .select("collegeBranchCode")
              .eq("collegeBranchId", Number(branchIdParam))
              .maybeSingle()
          : Promise.resolve({ data: null }),
        yearIdParam
          ? supabase
              .from("college_academic_year")
              .select("collegeAcademicYear")
              .eq("collegeAcademicYearId", Number(yearIdParam))
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      setBranchYearLabel({
        branch: branch?.collegeBranchCode || "",
        year: academicYear?.collegeAcademicYear || "",
      });
    };

    loadBranchYearLabel();
  }, [branchIdParam, yearIdParam]);

  const fetchTasks = async () => {
    if (!facultyId) {
      setFacultyTasks([]);
      setLoadingTasks(false);
      return;
    }

    try {
      setLoadingTasks(true);
      const data = await fetchFacultyTasksByFacultyId(facultyId);
      const formatted: Task[] = data.map((task) => ({
        facultyTaskId: task.facultyTaskId,
        title: task.taskTitle,
        description: task.description,
        time: task.time || "",
        date: task.date || "",
      }));
      setFacultyTasks(formatted);
    } catch (error) {
      console.error("Failed to fetch lab faculty tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [facultyId]);

  const fetchAnnouncements = async () => {
    try {
      if (!collegeId || !userId || !role) return;

      const response = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view: announcementView,
        page: 1,
        limit: 20,
      });

      setAnnouncements(
        response.data.map((item: any) => ({
          collegeAnnouncementId: item.collegeAnnouncementId,
          title: item.title,
          date: item.date,
          createdAt: item.createdAt,
          type: item.type,
          targetRoles: item.targetRoles,
          image: typeIcons[item.type] || "/clip.png",
          imgHeight: "h-10",
          cardBg: "#E8F8EF",
          imageBg: "#D3F1E0",
          professor:
            announcementView === "my"
              ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
              : `By ${formatRole(item.createdByRole)}`,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch lab announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [collegeId, userId, role, announcementView]);

  const handleSaveFacultyTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number,
  ) => {
    if (!facultyId || !subjectId) {
      toast.error("Faculty and subject are required to save task");
      return;
    }

    const response = await saveFacultyTask(
      {
        facultyTaskId: taskId,
        collegeSubjectId: Number(subjectId),
        taskTitle: payload.title,
        description: payload.description,
        date: payload.dueDate,
        time: payload.dueTime,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSectionsId: payload.collegeSectionsId,
      },
      facultyId,
    );

    if (!response.success) {
      toast.error("Failed to save task");
      throw new Error("Failed to save task");
    }

    await fetchTasks();
  };

  const handleDeleteTask = async () => {
    await fetchTasks();
  };

  useEffect(() => {
    if (!collegeId || !currentEducationId) return;
    fetchQuizFilterOptions(collegeId, currentEducationId).then((response) => {
      setBranchOptions(response.branchOptions);
      setYearOptions(response.yearOptions);
    });
  }, [collegeId, currentEducationId]);

  useEffect(() => {
    if (!collegeId || !currentEducationId || branchIdParam) return;

    setDeptLoading(true);
    fetchAdminLabDepartments(
      collegeId,
      currentEducationId,
      branchFilter,
      yearFilter,
      deptPage,
      9,
    )
      .then((response) => {
        setDeptCards(response.data);
        setDeptTotalCount(response.totalCount);
      })
      .finally(() => setDeptLoading(false));
  }, [
    collegeId,
    currentEducationId,
    branchIdParam,
    branchFilter,
    yearFilter,
    deptPage,
  ]);

  useEffect(() => {
    if (!collegeId || !branchIdParam || !yearIdParam || subjectId) return;

    setSubjectsLoading(true);
    fetchAdminLabSubjects(
      collegeId,
      Number(branchIdParam),
      Number(yearIdParam),
    )
      .then((cards) => {
        setSubjectCards(cards);
        setSubjectPage(1);
      })
      .finally(() => setSubjectsLoading(false));
  }, [collegeId, branchIdParam, yearIdParam, subjectId]);

  const paginatedSubjectCards = subjectCards.slice(
    (subjectPage - 1) * ITEMS_PER_PAGE,
    subjectPage * ITEMS_PER_PAGE,
  );

  const handleBackToDepartments = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dept");
    params.delete("year");
    params.delete("branchId");
    params.delete("yearId");
    params.delete("subjectId");
    params.delete("facultyId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBackToSubjects = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subjectId");
    params.delete("facultyId");
    params.delete("action");
    params.delete("labId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCreate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "lab");
    params.set("action", "createLab");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEdit = (lab: LabManual) => {
    setEditingLab(lab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "lab");
    params.set("action", "editLab");
    params.set("labId", String(lab.labId));
    router.push(`${pathname}?${params.toString()}`);
  };

  const executeDeleteLab = async () => {
    if (!deleteLabId) return;

    try {
      setIsDeleting(true);
      const result = await deleteLabManual(deleteLabId);
      if (!result.success) {
        toast.error("Failed to delete lab manual");
        return;
      }

      toast.success("Lab manual deleted successfully");
      if (labs.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await fetchLabs();
      }
    } catch (error) {
      console.error("Admin lab delete error:", error);
      toast.error("Failed to delete lab manual");
    } finally {
      setIsDeleting(false);
      setDeleteLabId(null);
    }
  };

  if (action === "createLab" || action === "editLab") {
    return (
      <div className="flex w-full gap-4 mt-2">
        <AdminLabForm
          initialData={action === "editLab" ? editingLab : undefined}
          onSaved={fetchLabs}
        />
        <AdminLabRightPanel
          facultyTasks={facultyTasks}
          facultyId={facultyId}
          collegeSubjectId={subjectId ? Number(subjectId) : undefined}
          loadingTasks={loadingTasks}
          announcements={announcements}
          onSaveTask={handleSaveFacultyTask}
          onDeleteTask={handleDeleteTask}
          currentAnnouncementsView={announcementView}
          onAnnouncementsViewChange={setAnnouncementView}
          refreshAnnouncements={fetchAnnouncements}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col m-4">
      <TabNavigation />

      <div className="flex w-full items-center gap-4 mt-1 mb-5 overflow-x-auto custom-scrollbar pb-2">
        <CustomDropdown
          label="Education"
          value={currentEducationId?.toString() ?? ""}
          options={educations.map((e) => ({
            label: e.collegeEducationType,
            value: e.collegeEducationId.toString(),
          }))}
          theme="green"
          widthClassName="min-w-[160px] shrink-0"
          onChange={(val) => {
            const edu = educations.find((e) => e.collegeEducationId === +val);
            if (edu) {
              selectEducation(edu);
              const params = new URLSearchParams(searchParams.toString());
              params.delete("branchId");
              params.delete("yearId");
              params.delete("dept");
              params.delete("year");
              params.delete("subjectId");
              params.delete("sectionId");
              router.push(`${pathname}?${params.toString()}`);
            }
          }}
        />
        {!isSchool && (
          <CustomDropdown
            label={currentEducationType === "Inter" ? "Group" : "Branch"}
            value={branchFilter}
            options={branchOptions}
            disabled={!currentEducationId}
            theme="green"
            widthClassName="min-w-[160px] shrink-0"
            onChange={(value) => {
              const params = new URLSearchParams(searchParams.toString());
              if (value === "All") {
                params.delete("dept");
                params.delete("branchId");
                params.delete("year");
                params.delete("yearId");
                params.delete("subjectId");
                params.delete("sectionId");
              } else {
                params.set("dept", String(value));
                params.delete("branchId");
                params.delete("yearId");
                params.delete("subjectId");
                params.delete("sectionId");
              }
              setDeptPage(1);
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
        )}
        <CustomDropdown
          label="Year"
          value={yearFilter}
          options={yearOptions}
          disabled={!currentEducationId || (!isSchool && branchFilter === "All")}
          theme="green"
          widthClassName="min-w-[160px] shrink-0"
          onChange={(value) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === "All") {
              params.delete("year");
              params.delete("yearId");
              params.delete("subjectId");
              params.delete("sectionId");
            } else {
              params.set("year", String(value));
              params.delete("yearId");
              params.delete("subjectId");
              params.delete("sectionId");
            }
            setDeptPage(1);
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
        <CustomDropdown
          label="Subject"
          value={subjectFilter}
          options={subjectOptions}
          disabled={yearFilter === "All"}
          theme="green"
          widthClassName="min-w-[160px] shrink-0"
          onChange={(val) => handleSubjectChange(String(val))}
        />
        <CustomDropdown
          label="Section"
          value={sectionFilter}
          options={sectionOptions}
          disabled={subjectFilter === "All"}
          theme="green"
          widthClassName="min-w-[160px] shrink-0"
          onChange={(val) => handleSectionChange(String(val))}
        />
      </div>

      {!branchIdParam || !yearIdParam ? (
        <>
          <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
              {deptLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <DiscussionDeptCardSkeleton key={index} />
                ))
              ) : deptCards.length === 0 ? (
                <div className="col-span-full w-full text-center py-20 text-gray-400">
                  No lab records found.
                </div>
              ) : (
                deptCards.map((card, index) => (
                  <DiscussionDeptCard
                    key={`${card.branchId}-${card.yearId}-${index}`}
                    {...card}
                    activeText="Lab manuals"
                  />
                ))
              )}
            </div>

            {!deptLoading && (
              <Pagination
                currentPage={deptPage}
                totalItems={deptTotalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setDeptPage}
                alwaysShow
                roundedBottom="rounded-xl"
              />
            )}
          </div>
        </>
      ) : !subjectId ? (
        <div className="min-h-[calc(100vh-200px)] rounded-xl flex flex-col">
          <div className="flex items-center gap-1 mb-6">
            <button
              onClick={handleBackToDepartments}
              className="flex cursor-pointer items-center justify-center p-2 pl-0 hover:text-gray-600 transition-colors"
            >
              <CaretLeftIcon
                size={20}
                weight="bold"
                className="text-[#282828] cursor-pointer active:scale-90"
              />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {branchYearTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
            {subjectsLoading ? (
              <>
                <DiscussionCourseCardSkeleton />
                <DiscussionCourseCardSkeleton />
                <DiscussionCourseCardSkeleton />
              </>
            ) : subjectCards.length === 0 ? (
              <div className="col-span-full w-full text-center py-20 text-gray-400">
                No subjects found.
              </div>
            ) : (
              paginatedSubjectCards.map((course) => (
                <DiscussionCourseCard
                  key={course.id}
                  {...course}
                  activeLabel="Lab manuals"
                  pendingLabel="Sections"
                  buttonText="View Lab"
                />
              ))
            )}
          </div>
          {!subjectsLoading && (
            <Pagination
              currentPage={subjectPage}
              totalItems={subjectCards.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setSubjectPage}
              alwaysShow
              bgClassName="bg-transparent"
            />
          )}
        </div>
      ) : (
        <div className="flex w-full gap-4 mt-2">
        <div className="w-[68%] min-h-screen rounded-xl flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <button
                onClick={handleBackToSubjects}
                className="flex cursor-pointer items-center justify-center p-2 pl-0 hover:text-gray-600 transition-colors"
              >
                <CaretLeftIcon
                  size={20}
                  weight="bold"
                  className="text-[#282828] cursor-pointer active:scale-90"
                />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {currentEducationType} {dept} - {year}
              </h2>
            </div>
            <button
              onClick={handleCreate}
              disabled={!adminId}
              className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-2 rounded-md font-bold hover:bg-[#102040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Upload Lab Manual
            </button>
          </div>

        <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto">
          {labsLoading ? (
            [1, 2, 3].map((item) => <FacultyDiscussionShimmer key={item} />)
          ) : labs.length === 0 ? (
            <div className="w-full py-10 text-center text-gray-500">
              No lab manuals uploaded yet.
            </div>
          ) : (
            labs.map((lab) => (
              <FacultyLabCard
                key={lab.labId}
                data={lab}
                onDelete={(labId) => setDeleteLabId(labId)}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>

        {!labsLoading && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            alwaysShow
            bgClassName="bg-transparent"
          />
        )}
      </div>
      <AdminLabRightPanel
        facultyTasks={facultyTasks}
        facultyId={facultyId}
        collegeSubjectId={subjectId ? Number(subjectId) : undefined}
        loadingTasks={loadingTasks}
        announcements={announcements}
        onSaveTask={handleSaveFacultyTask}
        onDeleteTask={handleDeleteTask}
        currentAnnouncementsView={announcementView}
        onAnnouncementsViewChange={setAnnouncementView}
        refreshAnnouncements={fetchAnnouncements}
      />
      </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteLabId}
        onConfirm={executeDeleteLab}
        onCancel={() => setDeleteLabId(null)}
        isDeleting={isDeleting}
        name="lab manual"
      />
    </div>
  );
}
