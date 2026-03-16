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

const ITEMS_PER_PAGE = 10;

function AssignmentsLeftContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "assignments";
  const activeView = (searchParams.get("view") as "active" | "previous") || "active";
  const quizView = (searchParams.get("quizView") as "active" | "drafts" | "completed") || "active";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Assignment | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleMainTabChange = (tab: "assignments" | "quiz") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab === "assignments") {
      params.set("view", "active");
    }
    if (tab === "quiz") {
      params.set("quizView", "active");
    }
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
    <div className="w-[68%] p-2 flex flex-col">
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
        </h1>
        <p className="text-[#282828] text-sm">
          {activeTab === "assignments"
            ? "Create, manage, and evaluate assignments for your students efficiently."
            : "Design, organize, and publish quizzes to assess your students effectively."}
        </p>
      </div>

      <div className="w-full flex flex-col flex-1 min-h-[500px]">
        <div className="flex flex-col gap-3 items-start h-full w-full">
          <div className="flex justify-between w-full">
            {activeTab === "assignments" ? (
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
            ) : (
              <div className="flex w-full gap-3 mt-1 items-center">
                <button
                  onClick={() => handleQuizViewChange("active")}
                  className={`px-8 py-2 cursor-pointer rounded-md font-bold text-sm transition-colors ${quizView === "active" ? "bg-[#43C17A] text-white" : "bg-[#D5FFE7] text-[#43C17A]"}`}
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
                  className="ml-auto text-sm text-white cursor-pointer bg-[#16284F] px-6 py-2 rounded-md font-bold hover:bg-[#102040] transition-colors"
                >
                  Create Quiz
                </button>
              </div>
            )}
          </div>

          <div className="h-[164vh] overflow-y-auto w-full">
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
              <div className="grid grid-cols-2 gap-4 pb-10">
                {quizView === "active" && STATIC_ACTIVE_QUIZZES.map((quiz) => (
                  <FacultyQuizCard key={quiz.id} data={quiz} />
                ))}

                {quizView === "drafts" && STATIC_DRAFT_QUIZZES.map((quiz) => (
                  <FacultyQuizCard key={quiz.id} data={quiz} />
                ))}

                {quizView === "completed" && STATIC_COMPLETED_QUIZZES.map((quiz) => (
                  <FacultyQuizCard key={quiz.id} data={quiz} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
