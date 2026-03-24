"use client";

import { useState, useEffect, Suspense } from "react";
import AssignmentForm from "./assignmentForm";
import AssignmentCard from "./assignmentCard";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { fetchFacultyAssignments } from "@/lib/helpers/faculty/assignment/fetchFacultyAssignments";
import { deleteFacultyAssignment } from "@/lib/helpers/faculty/assignment/deleteFacultyAssignment";
import AssignmentSkeleton from "../shimmer/assignmentShimmer";
import { Pagination } from "./pagination";

import FacultyQuizCard from "./facultyQuizCard";
import { STATIC_ACTIVE_QUIZZES, STATIC_DRAFT_QUIZZES, STATIC_COMPLETED_QUIZZES } from "./facultyQuizData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

import FacultyDiscussionCard from "./facultyDiscussionCard";
import FacultyDiscussionForm from "./facultyDiscussionForm";
import { STATIC_ACTIVE_DISCUSSIONS, STATIC_COMPLETED_DISCUSSIONS } from "./facultyDiscussionData";
import FacultyDiscussionSubmissions from "./facultyDiscussionSubmissions";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { deactivateDiscussionForum, fetchCompletedDiscussionsByFacultyId, fetchDiscussionsByFacultyId } from "@/lib/helpers/discussionForum/discussionForumAPI";
import FacultyDiscussionShimmer from "../shimmer/discussionShimmer";
import ConfirmDeleteModal from "./confirmDeleteModal";
import FacultyQuizForm from "./facultyQuizForm";
import FacultyAddQuestions from "./FacultyAddQuizQuestions";
import FacultyQuizResumeBanner from "./FacultyQuizResumeBanner";
import { fetchQuizzesByStatus } from "@/lib/helpers/quiz/quizAPI";
import FacultyQuizShimmer from "../shimmer/FacultyQuizShimmer";
import FacultyQuizSubmissions from "./quizSubmissions";

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
  return `${day}-${month}-${year}`;
}

const ITEMS_PER_PAGE = 10;

function AssignmentsLeftContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { facultyId } = useFaculty();

  const activeTab = searchParams.get("tab") || "assignments";
  const action = searchParams.get("action");
  const discussionId = searchParams.get("discussionId");

  const activeView = (searchParams.get("view") as "active" | "previous") || "active";
  const quizView = (searchParams.get("quizView") as "active" | "drafts" | "completed") || "active";
  const discussionView = (searchParams.get("discussionView") as "active" | "completed") || "active";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Assignment | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [completedDiscussions, setCompletedDiscussions] = useState<any[]>([]);
  const [completedDiscussionsLoading, setCompletedDiscussionsLoading] = useState(true);
  const [deleteDiscussionId, setDeleteDiscussionId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeQuizzes, setActiveQuizzes] = useState<any[]>([]);
  const [draftQuizzes, setDraftQuizzes] = useState<any[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  async function fetchQuizzes() {
    if (!facultyId) return;
    try {
      setQuizzesLoading(true);
      const [active, drafts, completed] = await Promise.all([
        fetchQuizzesByStatus(facultyId, "Active"),
        fetchQuizzesByStatus(facultyId, "Draft"),
        fetchQuizzesByStatus(facultyId, "Completed"),
      ]);
      setActiveQuizzes(active);
      setDraftQuizzes(drafts);
      setCompletedQuizzes(completed);
    } catch (err) {
      toast.error("Failed to fetch quizzes");
    } finally {
      setQuizzesLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "quiz") {
      fetchQuizzes();
    }
  }, [activeTab, facultyId]);

  async function fetchCompletedDiscussions() {
    if (!facultyId) return;
    try {
      setCompletedDiscussionsLoading(true);
      const data = await fetchCompletedDiscussionsByFacultyId(facultyId);
      setCompletedDiscussions(data);
    } catch (err) {
      toast.error("Failed to fetch completed discussions");
    } finally {
      setCompletedDiscussionsLoading(false);
    }
  }

  async function fetchDiscussions() {
    if (!facultyId) return;
    try {
      setDiscussionsLoading(true);
      const data = await fetchDiscussionsByFacultyId(facultyId);
      setDiscussions(data);
    } catch (err) {
      toast.error("Failed to fetch discussions");
      console.error("fetchDiscussions error:", err);
    } finally {
      setDiscussionsLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "discussion") {
      fetchDiscussions();
      fetchCompletedDiscussions();
    }
  }, [activeTab, facultyId, refreshKey]);

  const handleMainTabChange = (tab: "assignments" | "quiz" | "discussion") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("action");
    params.delete("discussionId");

    if (tab === "assignments") params.set("view", "active");
    if (tab === "quiz") params.set("quizView", "active");
    if (tab === "discussion") params.set("discussionView", "active");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAssignmentViewChange = (tab: "active" | "previous") => {
    if (activeView === tab) return;
    setIsLoading(true);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleQuizViewChange = (view: "active" | "drafts" | "completed") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("quizView", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDiscussionViewChange = (view: "active" | "completed") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("discussionView", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    fetchAssignments();
  }, [activeView, currentPage, activeTab]);

  async function fetchAssignments() {
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
      );

      if (error) {
        toast.error("Failed to fetch assignments");
        return;
      }

      if (data) {
        const formatted: Assignment[] = data.map((a: any) => ({
          sectionId: a.collegeSectionsId,
          assignmentId: a.assignmentId,
          image: "/ds.jpg",
          title: a.college_subjects?.subjectName || "Unknown Subject",
          description: a.topicName,
          fromDate: a.dateAssignedInt,
          toDate: a.submissionDeadlineInt,
          totalSubmissions: String(a.totalSubmissionsExpected || 0),
          totalSubmitted: "0",
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
    setCurrentPage(page);
  };

  const handleDeleteDiscussion = async () => {
    if (!deleteDiscussionId) return;
    try {
      setIsDeleting(true);
      const result = await deactivateDiscussionForum(deleteDiscussionId);
      if (result.success) {
        toast.success("Discussion deleted successfully.");
        fetchDiscussions();
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
      setCurrentPage((prev) => prev - 1);
    } else {
      fetchAssignments();
    }
  };

  if (activeTab === "discussion" && (action === "editDiscussion" || action === "createDiscussion")) {
    return (
      <div className="w-[68%] h-full p-2 flex flex-col">
        <FacultyDiscussionForm
          discussionId={action === "editDiscussion" && discussionId ? Number(discussionId) : undefined}
          onSaved={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    );
  }

  if (activeTab === "discussion" && action === "viewSubmissions") {
    return (
      <div className="w-[68%] h-full p-2 flex flex-col">
        <FacultyDiscussionSubmissions discussionId={discussionId} />
      </div>
    );
  }

  if (activeTab === "quiz" && action === "createQuiz") {
    return (
      <div className="w-[68%] h-full p-2 flex flex-col">
        <FacultyQuizForm
          onCancel={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            router.push(`${pathname}?${params.toString()}`);
          }}
          onSaved={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
        <FacultyQuizResumeBanner
          margintop="lg:mt-5"
        />
      </div>
    );
  }

  const quizId = searchParams.get("quizId");

  if (activeTab === "quiz" && action === "viewQuizSubmissions") {
    return (
      <div className="w-[68%] h-full p-2 flex flex-col">
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
      <div className="w-[68%] h-full p-2 flex flex-col">
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
        }}
        onSave={() => {
          setIsLoading(true);
          fetchAssignments();
          setEditing(null);
          setView("list");
        }}
      />
    );
  }

  return (
    <div className="w-[68%] h-full p-2 flex flex-col">
      <div className="mb-4">
        <h1 className="font-bold text-2xl mb-1 flex items-center gap-2">
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
        </h1>
        <p className="text-[#282828] text-sm">
          {activeTab === "assignments" && "Create, manage, and evaluate assignments for your students efficiently."}
          {activeTab === "quiz" && "Design, organize, and publish quizzes to assess your students effectively."}
          {activeTab === "discussion" && "Create and manage project discussions for students."}
        </p>
      </div>

      <div className="w-full flex flex-col flex-1 min-h-[500px] h-full">
        <div className="flex flex-col gap-3 items-start h-full w-full">
          <div className="flex justify-between w-full h-full">
            {activeTab === "assignments" && (
              <>
                <div className="flex gap-4 pb-1">
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
                <button
                  className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-1.5 rounded-md hover:bg-[#102040] transition-colors"
                  onClick={() => setView("add")}
                >
                  Add Assignment
                </button>
              </>
            )}

            {activeTab === "quiz" && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.4fr_0.7fr] w-full gap-3 mt-1 items-center">
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
            )}



            {activeTab === "discussion" && (
              <>
                <div className="flex gap-4 pb-1">
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
                <button
                  className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-1.5 rounded-md font-bold hover:bg-[#102040] transition-colors"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("action", "createDiscussion");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                >
                  Create Discussion
                </button>
              </>
            )}
          </div>

          <div className="max-h-[115vh] overflow-y-auto w-full">
            {activeTab === "assignments" && (
              isLoading ? (
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
                <>
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
                    }}
                    onDelete={handleDelete}
                  />

                  {totalCount > ITEMS_PER_PAGE && (
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalCount}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )
            )}

            {activeTab === "quiz" && (
              <div className="grid grid-cols-2 gap-4 pb-10 h-full">
                <div className="col-span-2">
                  <FacultyQuizResumeBanner />
                </div>

                {quizzesLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <FacultyQuizShimmer key={i} />
                    ))}
                  </>
                ) : (
                  <>
                    {quizView === "active" && (
                      activeQuizzes.length === 0 ? (
                        <div className="col-span-2 py-10 text-center text-gray-500 text-sm">
                          No active quizzes found.
                        </div>
                      ) : (
                        activeQuizzes.map((quiz) => (
                          <FacultyQuizCard
                            key={quiz.quizId}
                            data={{
                              quizId: quiz.quizId,
                              title: quiz.quizTitle,
                              subtitle: `${quiz.college_subjects?.subjectName || "-"} • ${quiz.college_sections?.collegeSections || "-"}`,
                              duration: `${formatDate(quiz.startDate)} → ${formatDate(quiz.endDate)}`,
                              totalQuestions: quiz.quiz_questions?.length ?? 0,
                              totalMarks: quiz.totalMarks,
                              status: quiz.status,
                            }}
                            onViewSubmissions={(quizId) => {
                              const params = new URLSearchParams(searchParams.toString());
                              params.set("action", "viewQuizSubmissions");
                              params.set("quizId", String(quizId));
                              router.push(`${pathname}?${params.toString()}`);
                            }}
                          />
                        ))
                      )
                    )}

                    {quizView === "drafts" && (
                      draftQuizzes.length === 0 ? (
                        <div className="col-span-2 py-10 text-center text-gray-500 text-sm">
                          No draft quizzes found.
                        </div>
                      ) : (
                        draftQuizzes.map((quiz) => (
                          <FacultyQuizCard
                            key={quiz.quizId}
                            data={{
                              quizId: quiz.quizId,
                              title: quiz.quizTitle,
                              subtitle: `${quiz.college_subjects?.subjectName || "-"} • ${quiz.college_sections?.collegeSections || "-"}`,
                              duration: `${formatDate(quiz.startDate)} → ${formatDate(quiz.endDate)}`,
                              totalQuestions: quiz.quiz_questions?.length ?? 0,
                              totalMarks: quiz.totalMarks,
                              status: quiz.status,
                            }}
                            onViewSubmissions={(quizId) => {
                              const params = new URLSearchParams(searchParams.toString());
                              params.set("action", "viewQuizSubmissions");
                              params.set("quizId", String(quizId));
                              router.push(`${pathname}?${params.toString()}`);
                            }}
                          />
                        ))
                      )
                    )}

                    {quizView === "completed" && (
                      completedQuizzes.length === 0 ? (
                        <div className="col-span-2 py-10 text-center text-gray-500 text-sm">
                          No completed quizzes found.
                        </div>
                      ) : (
                        completedQuizzes.map((quiz) => (
                          <FacultyQuizCard
                            key={quiz.quizId}
                            data={{
                              quizId: quiz.quizId,
                              title: quiz.quizTitle,
                              subtitle: `${quiz.college_subjects?.subjectName || "-"} • ${quiz.college_sections?.collegeSections || "-"}`,
                              duration: `${formatDate(quiz.startDate)} → ${formatDate(quiz.endDate)}`,
                              totalQuestions: quiz.quiz_questions?.length ?? 0,
                              totalMarks: quiz.totalMarks,
                              status: quiz.status,
                            }}
                            onViewSubmissions={(quizId) => {
                              const params = new URLSearchParams(searchParams.toString());
                              params.set("action", "viewQuizSubmissions");
                              params.set("quizId", String(quizId));
                              router.push(`${pathname}?${params.toString()}`);
                            }}
                          />
                        ))
                      )
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "discussion" && (
              <div className="flex flex-col gap-4 pb-10">
                {discussionView === "active" && (
                  discussionsLoading ? (
                    [1, 2, 3].map((i) => <FacultyDiscussionShimmer key={i} />)
                  ) : discussions.length === 0 ? (
                    <div className="w-full py-10 text-center text-gray-500">No active discussions found.</div>
                  ) : (
                    discussions.map((discussion) => (
                      <FacultyDiscussionCard
                        key={discussion.discussionId}
                        data={discussion}
                        discussionView="active"
                        onDelete={(id) => setDeleteDiscussionId(id)}
                      />
                    ))
                  )
                )}

                {discussionView === "completed" && (
                  completedDiscussionsLoading ? (
                    [1, 2, 3].map((i) => <FacultyDiscussionShimmer key={i} />)
                  ) : completedDiscussions.length === 0 ? (
                    <div className="w-full py-10 text-center text-gray-500">No completed discussions found.</div>
                  ) : (
                    completedDiscussions.map((discussion) => (
                      <FacultyDiscussionCard
                        key={discussion.discussionId}
                        data={discussion}
                        discussionView="completed"
                      />
                    ))
                  )
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        open={!!deleteDiscussionId}
        onConfirm={handleDeleteDiscussion}
        onCancel={() => setDeleteDiscussionId(null)}
        isDeleting={isDeleting}
        name="discussion"
      />
    </div>
  );
}

export default function AssignmentsLeft() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center w-full h-[50vh]"><Loader /></div>}>
      <AssignmentsLeftContent />
    </Suspense>
  );
}
