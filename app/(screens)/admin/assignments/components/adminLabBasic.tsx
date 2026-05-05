"use client";

import { CaretLeftIcon, CaretRight } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
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
import { FilterDropdown } from "./filterDropdown";
import { fetchQuizFilterOptions } from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";
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

const ITEMS_PER_PAGE = 10;

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
    },
    taskId?: number,
  ) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
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
  const { adminId, collegeId, collegeEducationId } = useAdmin();
  const action = searchParams.get("action");
  const branchIdParam = searchParams.get("branchId");
  const yearIdParam = searchParams.get("yearId");
  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const subjectId = searchParams.get("subjectId");
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
  const [deptTotalPages, setDeptTotalPages] = useState(1);
  const [subjectCards, setSubjectCards] = useState<any[]>([]);
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
    "my",
  );
  const [branchYearLabel, setBranchYearLabel] = useState({
    branch: "",
    year: "",
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const branchYearTitle =
    [dept || branchYearLabel.branch, year || branchYearLabel.year]
      .filter(Boolean)
      .join(" - ") || "Lab";

  async function fetchLabs() {
    if (
      !collegeId ||
      !collegeEducationId ||
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
        collegeEducationId,
        collegeBranchId: Number(branchIdParam),
        collegeAcademicYearId: Number(yearIdParam),
        collegeSubjectId: Number(subjectId),
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
    collegeEducationId,
    branchIdParam,
    yearIdParam,
    subjectId,
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
    if (!collegeId || !collegeEducationId) return;
    fetchQuizFilterOptions(collegeId, collegeEducationId).then((response) => {
      setBranchOptions(response.branchOptions);
      setYearOptions(response.yearOptions);
    });
  }, [collegeId, collegeEducationId]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId || branchIdParam) return;

    setDeptLoading(true);
    fetchAdminLabDepartments(
      collegeId,
      collegeEducationId,
      branchFilter,
      yearFilter,
      deptPage,
      9,
    )
      .then((response) => {
        setDeptCards(response.data);
        setDeptTotalPages(response.totalPages);
      })
      .finally(() => setDeptLoading(false));
  }, [
    collegeId,
    collegeEducationId,
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
      .then(setSubjectCards)
      .finally(() => setSubjectsLoading(false));
  }, [collegeId, branchIdParam, yearIdParam, subjectId]);

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
          onAnnouncementsViewChange={setAnnouncementView}
          refreshAnnouncements={fetchAnnouncements}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col m-4">
      <TabNavigation />

      {!branchIdParam ? (
        <>
          <div className="flex flex-wrap items-center gap-6 mt-1 mb-5">
            <FilterDropdown
              label="Branch"
              value={branchFilter}
              options={branchOptions}
              onChange={(value) => {
                setBranchFilter(value);
                setDeptPage(1);
              }}
            />
            <FilterDropdown
              label="Year"
              value={yearFilter}
              options={yearOptions}
              onChange={(value) => {
                setYearFilter(value);
                setDeptPage(1);
              }}
            />
          </div>

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

            {!deptLoading && deptTotalPages > 1 && (
              <div className="flex justify-center pb-4 shrink-0 pt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeptPage((page) => Math.max(1, page - 1))}
                    disabled={deptPage === 1}
                    className={`p-2 rounded-md text-sm font-medium border border-gray-200 transition-colors duration-150 ${
                      deptPage === 1
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    <CaretLeftIcon size={16} weight="bold" />
                  </button>

                  <div className="flex items-center gap-2 max-w-[60vw] overflow-x-auto scrollbar-hide">
                    {Array.from({ length: deptTotalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setDeptPage(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors duration-150 ${
                            deptPage === page
                              ? "bg-[#16284F] text-white border-[#16284F]"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 cursor-pointer"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setDeptPage((page) => Math.min(deptTotalPages, page + 1))
                    }
                    disabled={deptPage === deptTotalPages}
                    className={`p-2 rounded-md text-sm font-medium border border-gray-200 transition-colors duration-150 ${
                      deptPage === deptTotalPages
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
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
              subjectCards.map((course) => (
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
        </div>
      ) : (
        <div className="flex w-full gap-4 mt-2">
        <div className="w-[68%] bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col p-4">
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
                Lab Manuals for Subject
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

        {!labsLoading && totalPages > 1 && (
          <div className="flex justify-end items-center gap-3 mt-6 mb-4 max-w-[1200px] w-full mx-auto">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                currentPage === 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <CaretLeftIcon size={18} weight="bold" />
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 rounded-lg font-semibold cursor-pointer ${
                  currentPage === index + 1
                    ? "bg-[#16284F] text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                currentPage === totalPages
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
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
