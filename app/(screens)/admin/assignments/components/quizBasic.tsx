"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft, CaretRight, CheckCircle } from "@phosphor-icons/react";
import TabNavigation from "./tabNavigation";
import DiscussionDeptCard from "./discussionDeptCard";
import DiscussionCourseCard from "./discussionCourseCard";
import { FilterDropdown } from "./filterDropdown";

import AdminQuizList from "./adminQuizList";
import AdminQuizForm from "./adminQuizForm";
import AdminAddQuestions from "./adminAddQuestions";
import AdminQuizSubmissions from "./adminQuizSubmissions";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AdminQuizResumeBanner from "./adminQuizResumeBanner";

import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";

import TaskModal from "@/app/components/modals/taskModal";
import toast from "react-hot-toast";
import type { Task } from "@/app/utils/taskPanel";
import { fetchFacultyTasksByFacultyId, saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { supabase } from "@/lib/supabaseClient";
import TaskCardShimmer from "@/app/(screens)/faculty/shimmers/TaskCardShimmer";

import {
  fetchAdminQuizDepartments,
  fetchAdminQuizSubjects,
  fetchQuizFilterOptions,
} from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";
import { DiscussionDeptCardSkeleton } from "./shimmers/DiscussionDeptCardSkeleton";
import { DiscussionCourseCardSkeleton } from "./shimmers/courseCardSkeleton";

// --- Shimmer Components ---
const DeptCardShimmer = () => (
  <div className="bg-white rounded-[10px] p-4 shadow-sm border-l-[8px] border-gray-200 flex flex-col h-[184px] animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      <div className="h-6 bg-gray-200 rounded-full w-12"></div>
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="flex -space-x-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
          ></div>
        ))}
      </div>
    </div>
    <div className="flex justify-between items-center mb-6">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded-full w-8"></div>
    </div>
    <div className="flex justify-between items-center mt-auto">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const CourseCardShimmer = () => (
  <div className="bg-white w-auto rounded-[10px] p-5 shadow-sm border border-gray-100 flex flex-col animate-pulse h-[256px]">
    <div className="text-center mb-4">
      <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-px w-full bg-gray-200" />
    </div>
    <div className="flex items-center gap-3 mb-5 px-1">
      <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
    <div className="flex flex-col gap-3 mb-6 px-1">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded-full w-6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded-full w-6"></div>
      </div>
    </div>
    <div className="h-10 bg-gray-200 rounded-full w-full mt-auto"></div>
  </div>
);
// --------------------------



export default function QuizBasic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { collegeId, collegeEducationId: defaultEducationId, collegeEducationType: defaultEducationType } = useAdmin();
  const { userId } = useUser();
  const [educations, setEducations] = useState<any[]>([]);
  const [education, setEducation] = useState<any>(null);

  const currentEducationId = education?.collegeEducationId ?? defaultEducationId;
  const currentEducationType = education?.collegeEducationType ?? defaultEducationType;

  const selectEducation = (edu: any) => {
    setEducation(edu);
  };

  useEffect(() => {
    if (collegeId) {
      fetchEducations(collegeId).then(setEducations);
    }
  }, [collegeId]);

  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const branchIdParam = searchParams.get("branchId");
  const yearIdParam = searchParams.get("yearId");

  const subjectId = searchParams.get("subjectId");
  const action = searchParams.get("action");
  const quizId = searchParams.get("quizId");
  const facultyIdParam = searchParams.get("facultyId");
  const facultyId = facultyIdParam ? Number(facultyIdParam) : undefined;

  const [facultyTasks, setFacultyTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("others");
  const [facultyUserId, setFacultyUserId] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!facultyId) return;
    try {
      setLoadingTasks(true);
      const data = await fetchFacultyTasksByFacultyId(facultyId);
      const formatted: Task[] = data.map((t) => ({
        facultyTaskId: t.facultyTaskId,
        title: t.taskTitle,
        description: t.description,
        time: t.time || "",
        date: t.date || "",
      }));
      setFacultyTasks(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchAnnouncementsData = async (uid: string) => {
    if (!collegeId || !uid) return;
    try {
      const res = await fetchCollegeAnnouncements({
        collegeId: Number(collegeId),
        userId: uid,
        role: "faculty",
        view,
        page: 1,
        limit: 20,
      });

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

      const formatRole = (r: string) => r?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

      const formatted = res.data.map((item: any) => ({
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
          view === "my"
            ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
            : `By ${formatRole(item.createdByRole)}`,
      }));

      setAnnouncements(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!facultyId) return;
    fetchTasks();
    const getUserId = async () => {
      const { data } = await supabase.from("faculty").select("userId").eq("facultyId", facultyId).single();
      if (data?.userId) {
        setFacultyUserId(String(data.userId));
        fetchAnnouncementsData(String(data.userId));
      }
    };
    getUserId();
  }, [facultyId, view, collegeId]);

  const handleSaveFacultyTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number
  ) => {
    try {
      const res = await saveFacultyTask(
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
        facultyId!
      );

      if (!res.success) throw new Error("Save failed");

      await fetchTasks();
      setOpenTaskModal(false);
    } catch (err) {
      console.error("HANDLE SAVE ERROR:", err);
      toast.error("Failed to save task");
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    await fetchTasks();
  };

  const [yearFilter, setYearFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [branchOptions, setBranchOptions] = useState([
    { label: "All", value: "All" },
  ]);
  const [yearOptions, setYearOptions] = useState([
    { label: "All", value: "All" },
  ]);

  const [dynamicDepts, setDynamicDepts] = useState<any[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!collegeId || !currentEducationId) return;
    fetchQuizFilterOptions(collegeId, currentEducationId).then((res) => {
      setBranchOptions(res.branchOptions);
      setYearOptions(res.yearOptions);
    });
  }, [collegeId, currentEducationId]);

  useEffect(() => {
    if (!collegeId || !currentEducationId || branchIdParam) return;
    setIsLoading(true);
    fetchAdminQuizDepartments(
      collegeId,
      currentEducationId,
      branchFilter,
      yearFilter,
      page,
      9,
    )
      .then((res) => {
        setDynamicDepts(res.data);
        setTotalPages(res.totalPages);
      })
      .finally(() => setIsLoading(false));
  }, [
    collegeId,
    currentEducationId,
    branchIdParam,
    branchFilter,
    yearFilter,
    page,
  ]);

  useEffect(() => {
    if (!collegeId || !branchIdParam || !yearIdParam) return;
    setIsLoading(true);
    fetchAdminQuizSubjects(
      collegeId,
      Number(branchIdParam),
      Number(yearIdParam),
    )
      .then(setDynamicCourses)
      .finally(() => setIsLoading(false));
  }, [collegeId, branchIdParam, yearIdParam]);

  const handleBackToDepartments = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dept");
    params.delete("year");
    params.delete("branchId");
    params.delete("yearId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const isInnerScreen =
    action === "createQuiz" ||
    action === "editQuiz" ||
    action === "addQuestions" ||
    action === "viewQuizSubmissions" ||
    !!subjectId;

  const renderInnerContent = () => {
    if (action === "createQuiz" || action === "editQuiz") {
      return (
        <div className="flex flex-col h-full">
          <AdminQuizForm
            onCancel={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("action");
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
          <AdminQuizResumeBanner
            subjectId={Number(subjectId)}
            margintop="lg:mt-5"
          />
        </div>
      );
    }
    if (action === "addQuestions") {
      return (
        <AdminAddQuestions
          quizId={Number(quizId)}
          onBack={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("action", "createQuiz");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
      );
    }
    if (action === "viewQuizSubmissions") {
      return (
        <AdminQuizSubmissions
          quizId={Number(quizId)}
          onBack={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            params.delete("quizId");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
      );
    }
    if (subjectId) {
      return <AdminQuizList subjectId={subjectId} selectedDate={selectedDate} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col m-4 w-full mx-auto p-2 ">
      <TabNavigation />

      {!isInnerScreen ? (
        !branchIdParam ? (
          <>
            <div className="flex flex-wrap items-center gap-6 mt-1 mb-5">
              <FilterDropdown
                label="Education"
                value={currentEducationId?.toString() ?? ""}
                options={educations.map((e) => ({
                  label: e.collegeEducationType,
                  value: e.collegeEducationId.toString()
                }))}
                onChange={(val) => {
                  const edu = educations.find((e) => e.collegeEducationId === +val);
                  if (edu) {
                    selectEducation(edu);
                    setBranchFilter("All");
                    setYearFilter("All");
                    setPage(1);
                  }
                }}
              />
              <FilterDropdown
                label={currentEducationType === "Inter" ? "Group" : "Branch"}
                value={branchFilter}
                options={branchOptions}
                onChange={(val) => {
                  setBranchFilter(val);
                  setPage(1);
                }}
              />
              <FilterDropdown
                label="Year"
                value={yearFilter}
                options={yearOptions}
                onChange={(val) => {
                  setYearFilter(val);
                  setPage(1);
                }}
              />
            </div>

            <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {isLoading ? (
                  <>
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                  </>
                ) : (
                  dynamicDepts.map((deptCard, idx) => (
                    <DiscussionDeptCard
                      key={idx}
                      {...deptCard}
                      activeText="Active Subjects with Quiz"
                    />
                  ))
                )}
              </div>

              {/* Dynamic Pagination Component */}
              {!isLoading && totalPages > 1 && (
                <div className="flex justify-center pb-4 shrink-0 pt-6">
                  <div className="flex items-center gap-2">
                    {/* Prev */}
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Previous page"
                      className={`
          p-2 rounded-md text-sm font-medium
          border border-gray-200
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:ring-offset-1
          ${page === 1
                          ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
                        }
        `}
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>

                    {/* Pages */}
                    <div className="flex items-center gap-2 max-w-[60vw] overflow-x-auto scrollbar-hide">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            aria-current={page === p ? "page" : undefined}
                            className={`
              px-3 py-1 rounded-md text-sm font-medium
              border
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:ring-offset-1
              ${page === p
                                ? "bg-[#16284F] text-white border-[#16284F]"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 cursor-pointer"
                              }
            `}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Next */}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      aria-label="Next page"
                      className={`
          p-2 rounded-md text-sm font-medium
          border border-gray-200
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:ring-offset-1
          ${page === totalPages
                          ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
                        }
        `}
                    >
                      <CaretRight size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="min-h-[calc(100vh-200px)] rounded-xl flex flex-col">
              <div className="flex items-center gap-1 mb-6">
                <button
                  onClick={handleBackToDepartments}
                  className="flex cursor-pointer items-center justify-center p-2 pl-0 hover:text-gray-600 transition-colors"
                >
                  <CaretLeft
                    size={20}
                    weight="bold"
                    className="text-[#282828] cursor-pointer active:scale-90"
                  />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  {dept} - {year}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {isLoading ? (
                  <>
                    <DiscussionCourseCardSkeleton />
                    <DiscussionCourseCardSkeleton />
                    <DiscussionCourseCardSkeleton />
                  </>
                ) : dynamicCourses.length === 0 ? (
                  <div className="col-span-full w-full text-center py-20 text-gray-400">
                    No subjects found.
                  </div>
                ) : (
                  dynamicCourses.map((course) => (
                    <DiscussionCourseCard
                      key={course.id}
                      {...course}
                      activeLabel="Active Quiz"
                      buttonText="View Quiz"
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex w-full gap-4 mt-2">
          <div className="flex-1 min-w-0">{renderInnerContent()}</div>

          <div className="w-[32%] p-2 h-full flex flex-col">
            <WorkWeekCalendar
              activeDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            {loadingTasks ? (
              <div className="bg-white mt-5 rounded-md shadow-md p-4 min-h-[345px]">
                <div className="flex justify-between items-center mb-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 rounded-full p-1 w-8 h-8" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
                <TaskCardShimmer />
                <TaskCardShimmer />
                <TaskCardShimmer />
              </div>
            ) : facultyTasks.length === 0 ? (
              <div className="bg-white mt-5 rounded-md shadow-md p-4 min-h-[345px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#E7F7EE] rounded-full p-1">
                      <CheckCircle size={22} weight="fill" color="#43C17A" />
                    </div>
                    <p className="text-[#282828] font-medium">My Tasks</p>
                  </div>
                  <button
                    onClick={() => setOpenTaskModal(true)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#43C17A] text-[#43C17A] text-xs font-medium hover:bg-[#43C17A] hover:text-white transition cursor-pointer"
                  >
                    + Add Task
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-gray-400">No tasks available</p>
                </div>
              </div>
            ) : (
              <TaskPanel
                role="faculty"
                facultyTasks={facultyTasks}
                facultyId={facultyId}
                collegeSubjectId={subjectId ? Number(subjectId) : undefined}
                onAddTask={() => setOpenTaskModal(true)}
                onSaveTask={handleSaveFacultyTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
            <AnnouncementsCard
              announceCard={announcements}
              height="80vh"
              currentView={view}
              onViewChange={(v) => setView(v as "my" | "others")}
              refreshAnnouncements={async () => { if (facultyUserId) await fetchAnnouncementsData(facultyUserId); }}
            />
          </div>
        </div>
      )}

      <TaskModal
        open={openTaskModal}
        role="faculty"
        facultyId={facultyId}
        collegeSubjectId={subjectId ? Number(subjectId) : undefined}
        defaultValues={null}
        onClose={() => setOpenTaskModal(false)}
        onSave={handleSaveFacultyTask}
      />
    </div>
  );
}
