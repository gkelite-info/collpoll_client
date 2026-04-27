"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CaretLeft, CheckCircle } from "@phosphor-icons/react";
import TabNavigation from "./tabNavigation";
import DiscussionDeptCard from "./discussionDeptCard";
import DiscussionCourseCard from "./discussionCourseCard";
import { FilterDropdown } from "./filterDropdown";
import AdminDiscussionList from "./adminDiscussionList";
import AdminDiscussionForm from "./adminDiscussionForm";
import AdminDiscussionSubmissions from "./adminDiscussionSubmissions";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import TaskPanel, { Task } from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  fetchBranchOptionsForAdmin,
  fetchCollegeBranchesForLoggedInAdmin,
} from "@/lib/helpers/admin/collegeBranchAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchAcademicYearOptionsForAdmin } from "@/lib/helpers/admin/collegeAcademicYearAPI";
import { DiscussionDeptCardSkeleton } from "./shimmers/DiscussionDeptCardSkeleton";
import { getBranchTheme } from "../utils/palette";
import {
  fetchActiveStudentCount,
  fetchPendingSubmissionsCount,
} from "@/lib/helpers/admin/studentsCountAPI";
import {
  fetchActiveFacultyData,
  fetchFacultySubjectDiscussionCount,
  fetchSubjectFacultyList,
} from "@/lib/helpers/admin/facultyCountAPI";
import { fetchActiveDiscussionCount } from "@/lib/helpers/discussionForum/activeDiscussionForumAPI";
import { DiscussionCourseCardSkeleton } from "./shimmers/courseCardSkeleton";
import TaskCardShimmer from "@/app/(screens)/faculty/shimmers/TaskCardShimmer";
import {
  fetchFacultyTasksByFacultyId,
  saveFacultyTask,
} from "@/lib/helpers/faculty/facultyTasks";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";

interface props {
  facultyId?: number;
  collegeSubjectId?: number;
}

interface StudentCountData {
  branchId: number;
  yearId: number;
  count: number;
}

interface DashboardCounts {
  branchId: number;
  yearId: number;
  studentCount: number;
  facultyCount: number;
  facultyPhotos: string[];
  discussionCount: number;
}

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

export default function DiscussionForumBasic({
  facultyId: propFacultyId,
  collegeSubjectId,
}: props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const subjectId = searchParams.get("subjectId");
  const action = searchParams.get("action");
  const discussionId = searchParams.get("discussionId");
  const { userId, collegeEducationId, collegeEducationType } = useAdmin();

  const facultyIdFromUrl = searchParams.get("facultyId");
  const facultyId =
    propFacultyId || (facultyIdFromUrl ? Number(facultyIdFromUrl) : undefined);

  const [branchOptions, setBranchOptions] = useState<
    { id: number; name: string; code: string }[]
  >([]);

  const [yearOptions, setYearOptions] = useState<
    { id: number | string; label: string }[]
  >([]);

  const [allBranchYears, setAllBranchYears] = useState<any[]>([]);

  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");

  const [branchLoading, setBranchLoading] = useState(false);
  const [yearLoading, setYearLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [studentCounts, setStudentCounts] = useState<StudentCountData[]>([]);
  const [countsData, setCountsData] = useState<DashboardCounts[]>([]);
  const [courseList, setCourseList] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const discussionView = searchParams.get("discussionView") || "active";
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [facultyTasks, setFacultyTasks] = useState<Task[]>([]);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const { collegeId, role } = useUser();
  const [view, setView] = useState<"my" | "others">("my");
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!facultyId) return;
    fetchTasks();
  }, [facultyId]);

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
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchData = async () => {
    try {
      if (!collegeId || !userId || !role) return;

      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

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

  const handleSaveFacultyTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number,
  ) => {
    try {
      const res = await saveFacultyTask(
        {
          facultyTaskId: taskId,
          collegeSubjectId: collegeSubjectId!,
          taskTitle: payload.title,
          description: payload.description,
          date: payload.dueDate,
          time: payload.dueTime,
        },
        facultyId!,
      );

      if (!res.success) throw new Error("Save failed");

      await fetchTasks();
    } catch (err) {
      console.error("HANDLE SAVE ERROR:", err);
      toast.error("Failed to save task");
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    await fetchTasks();
  };

  useEffect(() => {
    const loadCourses = async () => {
      const yearIdFromParams = searchParams.get("yearId");
      const branchIdFromParams = searchParams.get("branchId");

      if (dept && yearIdFromParams) {
        setCourseLoading(true);
        const data = await fetchSubjectFacultyList(
          Number(yearIdFromParams),
          Number(branchIdFromParams),
        );

        const uniqueCoursesMap = new Map();
        data.forEach((course: any) => {
          const key = `${course.subjectId}-${course.facultyId}`;
          if (!uniqueCoursesMap.has(key)) {
            uniqueCoursesMap.set(key, course);
          }
        });
        const uniqueData = Array.from(uniqueCoursesMap.values());

        const courseListWithCounts = await Promise.all(
          uniqueData.map(async (course: any) => {
            const fId = Number(course.facultyId);
            const sId = Number(course.subjectId);

            const [activeCount, pendingCount] = await Promise.all([
              fetchFacultySubjectDiscussionCount(fId, sId),
              fetchPendingSubmissionsCount(fId, sId),
            ]);

            return {
              ...course,
              activeQuiz: activeCount,
              pendingSubmissions: pendingCount,
            };
          }),
        );

        setCourseList(courseListWithCounts);
        setCourseLoading(false);
      }
    };
    loadCourses();
  }, [dept, searchParams]);

  useEffect(() => {
    const loadBranches = async () => {
      if (!userId || !collegeEducationId) return;

      try {
        setBranchLoading(true);

        const branches = await fetchBranchOptionsForAdmin(
          userId,
          collegeEducationId,
        );

        setBranchOptions(
          branches.map((b) => ({
            id: b.collegeBranchId,
            name: b.name,
            code: b.code,
          })),
        );
      } catch (err) {
        console.error("Failed to load branches", err);
      } finally {
        setBranchLoading(false);
      }
    };

    loadBranches();
  }, [userId, collegeEducationId]);

  useEffect(() => {
    const loadBranchCards = async () => {
      if (!userId || !collegeEducationId) return;

      try {
        const data = await fetchCollegeBranchesForLoggedInAdmin(
          userId,
          collegeEducationId,
        );

        setBranches(data);
      } catch (err) {
        console.error("Failed to load branch cards", err);
      }
    };

    loadBranchCards();
  }, [userId, collegeEducationId]);

  useEffect(() => {
    const loadAllData = async () => {
      if (!userId || !branches.length) return;

      try {
        setYearLoading(true);
        const allYearsRequests = branches.map(async (b) => {
          const years = await fetchAcademicYearOptionsForAdmin(
            userId,
            b.collegeBranchId,
          );
          return years.map((y) => ({
            branchId: b.collegeBranchId,
            name: b.collegeBranchCode,
            yearId: y.value,
            year: y.label,
          }));
        });

        const results = await Promise.all(allYearsRequests);
        const flatCombinations = results.flat();

        // 🟢 Fixed: Explicitly store valid cross-matched combinations
        setAllBranchYears(flatCombinations);

        if (branchFilter !== "All") {
          const branchYears = flatCombinations.filter(
            (c) => String(c.branchId) === branchFilter,
          );
          setYearOptions(
            branchYears.map((y) => ({ id: y.yearId, label: y.year })),
          );
        } else {
          const uniqueLabels = Array.from(
            new Set(flatCombinations.map((c) => c.year)),
          );
          setYearOptions(
            uniqueLabels.map((label: any) => ({ id: label, label })),
          );
        }
      } catch (e) {
        console.error("Failed to load years", e);
      } finally {
        setYearLoading(false);
      }
    };

    loadAllData();
  }, [branchFilter, userId, branches]);

  const handleBackToDepartments = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dept");
    params.delete("year");
    router.push(`?${params.toString()}`);
  };

  const isInnerScreen =
    action === "createDiscussion" ||
    action === "editDiscussion" ||
    action === "viewSubmissions" ||
    !!subjectId;

  const renderInnerContent = () => {
    if (action === "createDiscussion" || action === "editDiscussion") {
      return (
        <AdminDiscussionForm
          discussionId={discussionId ? Number(discussionId) : undefined}
        />
      );
    }
    if (action === "viewSubmissions") {
      const sectionId = Number(searchParams.get("sectionId") ?? "0");
      const title = searchParams.get("discussionTitle") ?? "";
      const description = searchParams.get("discussionDescription") ?? "";

      return (
        <AdminDiscussionSubmissions
          discussionId={discussionId}
          discussionTitle={title}
          discussionDescription={description}
        />
      );
    }
    if (subjectId) {
      return <AdminDiscussionList subjectId={subjectId} />;
    }
    return null;
  };

  // 🟢 Fixed: Rebuilt filtering to strictly rely on explicit branch/year combinations
  const filteredCards = useMemo(() => {
    return allBranchYears.filter((card) => {
      const matchesBranch =
        branchFilter === "All" || String(card.branchId) === branchFilter;
      const matchesYear =
        yearFilter === "All" ||
        (branchFilter === "All"
          ? card.year === yearFilter
          : String(card.yearId) === yearFilter);
      return matchesBranch && matchesYear;
    });
  }, [allBranchYears, branchFilter, yearFilter]);

  useEffect(() => {
    const getCounts = async () => {
      if (!collegeEducationId || filteredCards.length === 0) return;
      setCountsData((prev) => {
        return prev;
      });

      try {
        const promises = filteredCards.map(async (card) => {
          const [sCount, fData, dCount] = await Promise.all([
            fetchActiveStudentCount(
              collegeEducationId,
              card.branchId,
              card.yearId,
            ),
            fetchActiveFacultyData(
              collegeEducationId,
              card.branchId,
              card.yearId,
            ),
            fetchActiveDiscussionCount(card.branchId, card.yearId),
          ]);

          return {
            branchId: card.branchId,
            yearId: card.yearId,
            studentCount: sCount,
            facultyCount: fData.count,
            facultyPhotos: fData.photos,
            discussionCount: dCount,
          };
        });

        const results = await Promise.all(promises);
        setCountsData(results);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    const timer = setTimeout(() => {
      getCounts();
    }, 300);

    return () => clearTimeout(timer);
  }, [filteredCards, collegeEducationId]);

  return (
    <div className="flex flex-col m-4 w-full mx-auto p-2">
      <TabNavigation />

      {!isInnerScreen ? (
        !dept ? (
          <>
            <div className="flex flex-wrap items-center gap-6 mt-1 mb-5">
              <FilterDropdown
                label="Branch"
                value={branchFilter}
                options={[
                  { label: "All", value: "All" },
                  ...branchOptions.map((b) => ({
                    label: b.code,
                    value: String(b.id),
                  })),
                ]}
                onChange={(val) => {
                  setBranchFilter(val);
                  if (val === "All") {
                    setYearFilter("All");
                  }
                }}
              />
              <FilterDropdown
                label="Year"
                value={yearFilter}
                disabled={yearLoading}
                options={
                  yearLoading
                    ? [{ label: "Loading...", value: "loading" }]
                    : [
                        { label: "All", value: "All" },
                        ...yearOptions.map((y) => ({
                          label: y.label,
                          value: String(y.id),
                        })),
                      ]
                }
                onChange={(val) => {
                  if (val !== "loading") setYearFilter(val);
                }}
              />
            </div>

            <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto ">
                {branchLoading || yearLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <DiscussionDeptCardSkeleton key={i} />
                    ))
                  : filteredCards.length > 0
                    ? filteredCards.map((card, idx) => {
                        const branchTheme = getBranchTheme(card.name);

                        const cardData = countsData.find(
                          (c) =>
                            c.branchId === card.branchId &&
                            c.yearId === card.yearId,
                        );

                        return (
                          <DiscussionDeptCard
                            key={`${card.branchId}-${card.year}-${idx}`}
                            name={card.name}
                            year={card.year}
                            branchId={card.branchId}
                            yearId={card.yearId}
                            text={branchTheme.text}
                            color={branchTheme.color}
                            bgColor={branchTheme.bgColor}
                            activeText="Active discussions forums"
                            activeCount={
                              cardData ? String(cardData.discussionCount) : "0"
                            }
                            students={cardData ? cardData.studentCount : 0}
                            facultyCount={cardData ? cardData.facultyCount : 0}
                            facultyPhotos={
                              cardData ? cardData.facultyPhotos : []
                            }
                          />
                        );
                      })
                    : Array.from({ length: 6 }).map((_, i) => (
                        <DiscussionDeptCardSkeleton key={i} />
                      ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-[calc(100vh-200px)] rounded-xl flex flex-col">
              <div className="flex items-center mb-6">
                <button
                  onClick={handleBackToDepartments}
                  className="flex cursor-pointer items-center justify-center p-2 pl-0 hover:text-gray-600 transition-colors"
                >
                  <CaretLeft
                    size={20}
                    weight="bold"
                    className="text-[#282828] active:scale-90"
                  />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  {collegeEducationType} {dept} - {year}
                </h2>
              </div>

              <div className="bg-pink-00 gap-5 w-full mx-auto">
                {courseLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <DiscussionCourseCardSkeleton key={i} />
                    ))}
                  </div>
                ) : courseList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                    {courseList.map((course) => (
                      <DiscussionCourseCard
                        key={`${course.id}-${course.facultyId}`}
                        {...course}
                        subject={course.subject}
                        facultyName={course.facultyName}
                        avatar={course.avatar}
                        facultyId={course.facultyId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 italic">
                      No subjects or faculty assigned to this branch yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex w-full gap-4 mt-2">
          <div className="flex-1 min-w-0">{renderInnerContent()}</div>

          <div className="w-[32%] p-2 h-full flex flex-col ">
            <WorkWeekCalendar />
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
                collegeSubjectId={collegeSubjectId}
                onAddTask={() => setOpenTaskModal(true)}
                onSaveTask={handleSaveFacultyTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
            <AnnouncementsCard
              announceCard={announcements}
              height="80vh"
              onViewChange={(v) => setView(v)}
              refreshAnnouncements={fetchData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
