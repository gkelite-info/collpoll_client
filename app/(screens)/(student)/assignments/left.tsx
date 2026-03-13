"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import AssignmentCard from "./components/card";
import { supabase } from "@/lib/supabaseClient";
import { fetchAssignmentsForStudent } from "@/lib/helpers/student/assignments/assignmentsAPI";
import { getSubmissionForAssignment } from "@/lib/helpers/student/assignments/insertAssignmentSubmission";
import { Loader } from "../calendar/right/timetable";
import { CaretLeft, CaretRight, } from "@phosphor-icons/react";
import AssignmentsRight from "./right";
import QuizCard, { AttemptedQuizCard, QuizAttemptScreen, STATIC_ATTEMPTED_QUIZZES, STATIC_ONGOING_QUIZZES } from "./components/quizCard";

function AssignmentsLeftContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const activeQuizId = searchParams.get("quizId");
    const activeTab = searchParams.get("tab") || "assignments";
    const activeView = (searchParams.get("view") as "active" | "previous") || "active";
    const quizView = (searchParams.get("quizView") as "ongoing" | "attempted") || "ongoing";

    const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
    const [previousAssignments, setPreviousAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const rowsPerPage = 8;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    const handleTabChange = (tab: "assignments" | "quiz") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        params.delete("action");
        params.delete("quizId");

        params.set("tab", tab);
        if (tab === "assignments") {
            params.set("view", "active");
        }
        if (tab === "quiz") {
            params.set("quizView", "ongoing");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleViewChange = (view: "active" | "previous") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", view);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleQuizViewChange = (view: "ongoing" | "attempted") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("quizView", view);
        router.push(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        loadAssignments();
    }, [activeView, currentPage]);

    async function loadAssignments() {
        try {
            setLoading(true);

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error("User not authenticated");
            }

            const { data: userRow, error: userErr } = await supabase
                .from("users")
                .select("userId, role")
                .eq("auth_id", user.id)
                .eq("is_deleted", false)
                .single();

            if (userErr || !userRow || userRow.role !== "Student") {
                throw new Error("Invalid student user");
            }

            const { data: student } = await supabase
                .from("students")
                .select("studentId, collegeBranchId")
                .eq("userId", userRow.userId)
                .is("deletedAt", null)
                .single();

            if (!student) {
                throw new Error("Student record not found");
            }

            const { data: academic } = await supabase
                .from("student_academic_history")
                .select("collegeAcademicYearId, collegeSectionsId")
                .eq("studentId", student.studentId)
                .eq("isCurrent", true)
                .is("deletedAt", null)
                .single();

            if (!academic) {
                throw new Error("Academic context not found");
            }

            const res = await fetchAssignmentsForStudent(
                {
                    collegeBranchId: student.collegeBranchId,
                    collegeAcademicYearId: academic.collegeAcademicYearId,
                    collegeSectionsId: academic.collegeSectionsId,
                },
                currentPage,
                rowsPerPage,
                activeView
            );


            if (!res.success) {
                throw new Error(res.error);
            }

            setTotalRecords(res.totalCount);

            const todayInt = Number(formatDateToInt(new Date()));

            const formatted = await Promise.all(
                res.assignments.map(async (a: any) => {
                    const existingFilePath = await getSubmissionForAssignment(
                        a.assignmentId
                    );

                    return {
                        assignmentId: a.assignmentId,
                        status: a.status,
                        image: "/ds.jpg",
                        title: a.topicName,
                        topicName: a.topicName,
                        subjectName: a.subject?.subjectName ?? "—",
                        professor: a.faculty?.user?.fullName ?? "Faculty",
                        marksTotal: a.marks,
                        marksScored: null,
                        fromDate: convertIntToShow(a.dateAssignedInt),
                        toDate: convertIntToShow(a.submissionDeadlineInt),
                        toDateInt: a.submissionDeadlineInt,
                        existingFilePath,
                    };
                })
            );

            setActiveAssignments(
                formatted.filter((a) => a.toDateInt >= todayInt)
            );

            setPreviousAssignments(
                formatted.filter((a) => a.toDateInt < todayInt)
            );
        } catch (err) {
            console.error("Failed to load assignments:", err);
        } finally {
            setLoading(false);
        }
    }

    function convertIntToShow(intVal: number) {
        if (!intVal) return "";
        const s = intVal.toString();

        const year = s.slice(0, 4);
        const month = s.slice(4, 6);
        const day = s.slice(6, 8);

        return `${day}/${month}/${year}`;
    }

    function formatDateToInt(date: Date) {
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    }

    if (activeTab === "quiz" && action === "attempt" && activeQuizId) {
        const activeQuizData = STATIC_ONGOING_QUIZZES.find(q => q.id.toString() === activeQuizId);
        return (
            <div className="w-[68%] p-2 flex flex-col h-full">
                <QuizAttemptScreen quiz={activeQuizData} />
            </div>
        );
    }

    return (
        <div className="w-[68%] p-2 flex flex-col h-full">
            <div className="mb-4">
                <h1 className="font-bold text-2xl mb-1 flex items-center gap-2">
                    <span
                        onClick={() => handleTabChange("assignments")}
                        className={`cursor-pointer transition-colors ${activeTab === "assignments"
                            ? "text-[#43C17A]"
                            : "text-[#282828]"
                            }`}
                    >
                        Assignments
                    </span>

                    <span className="text-[#282828]">/</span>

                    <span
                        onClick={() => handleTabChange("quiz")}
                        className={`cursor-pointer transition-colors ${activeTab === "quiz"
                            ? "text-[#43C17A]"
                            : "text-[#282828]"
                            }`}
                    >
                        Quiz
                    </span>
                </h1>
                <p className="text-[#282828] text-sm">
                    {activeTab === "assignments"
                        ? "View, track, and submit your work with ease"
                        : "Attempt, Track, and Review Your Quiz Performance with Ease"}
                </p>
            </div>

            <div className="w-full flex flex-col flex-1 min-h-0">

                <div className="flex gap-4 pb-1">
                    {activeTab === "assignments" ? (
                        <>
                            <h5
                                className={`text-xs cursor-pointer pb-1 ${activeView === "active" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                                onClick={() => handleViewChange("active")}
                            >
                                Active Assignments
                            </h5>
                            <h5
                                className={`text-xs cursor-pointer pb-1 ${activeView === "previous" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                                onClick={() => handleViewChange("previous")}
                            >
                                Previous Assignments
                            </h5>
                        </>
                    ) : (
                        <>
                            <h5
                                className={`text-xs cursor-pointer pb-1 ${quizView === "ongoing" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                                onClick={() => handleQuizViewChange("ongoing")}
                            >
                                Ongoing Quizzes
                            </h5>
                            <h5
                                className={`text-xs cursor-pointer pb-1 ${quizView === "attempted" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                                onClick={() => handleQuizViewChange("attempted")}
                            >
                                Attempted Quizzes
                            </h5>
                        </>
                    )}
                </div>

                <div className="mt-4 h-[151vh] overflow-y-auto pr-1">
                    {activeTab === "assignments" && (
                        loading ? (
                            <Loader />
                        ) : (
                            <>
                                {activeView === "active" && (
                                    activeAssignments.length > 0 ? (
                                        <AssignmentCard
                                            cardProp={activeAssignments}
                                            activeView={activeView}
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-4">No active assignments available</p>
                                    )
                                )}

                                {activeView === "previous" && (
                                    previousAssignments.length > 0 ? (
                                        <div className="text-sm text-[#282828]">
                                            <AssignmentCard
                                                cardProp={previousAssignments}
                                                activeView="previous"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-4">No assignments available</p>
                                    )
                                )}
                            </>
                        )
                    )}

                    {activeTab === "quiz" && (
                        <>
                            {quizView === "ongoing" && (
                                <div className="flex flex-col">
                                    {STATIC_ONGOING_QUIZZES.map((quiz) => (
                                        <QuizCard key={quiz.id} data={quiz} />
                                    ))}
                                </div>
                            )}

                            {quizView === "attempted" && (
                                <div className="flex flex-col">
                                    {STATIC_ATTEMPTED_QUIZZES.map((quiz) => (
                                        <AttemptedQuizCard key={quiz.id} data={quiz} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {activeTab === "assignments" && totalPages > 1 && (
                    <div className="flex justify-end items-center gap-3 mt-6">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`w-9 h-9 flex items-center justify-center border rounded ${currentPage === 1
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            <CaretLeft size={18} weight="bold" className="text-[#282828]" />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 cursor-pointer rounded ${currentPage === i + 1
                                    ? "bg-[#16284F] text-white"
                                    : "border text-[#282828] hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className={`w-9 h-9 flex items-center justify-center border rounded ${currentPage === totalPages
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            <CaretRight size={18} weight="bold" className="text-[#282828]" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AssignmentsLeft() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center w-full py-10"><Loader /></div>}>
            <AssignmentsLeftContent />
        </Suspense>
    );
}


export function Assignments() {
    return (
        <div className="flex items-start justify-between">
            <AssignmentsLeft />
            <AssignmentsRight />
        </div>
    )
}