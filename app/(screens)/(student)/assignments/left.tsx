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
import QuizCard, { AttemptedQuizCard } from "./components/quizCard";
import QuizViewAnswersScreen from "./components/quizViewAnswersScreen";
import QuizPerformanceModal from "./components/quizPerformanceModal";
import QuizAttemptScreen from "./components/QuizAttemptScreen";
import StudentDiscussionCard from "./components/studentDiscussionCard";
import { StudentDiscussionUploadModal, StudentDiscussionDetailsModal } from "./components/studentDiscussionModals";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { fetchActiveDiscussionsForStudent, fetchCompletedDiscussionsForStudent } from "@/lib/helpers/student/assignments/discussionForum/studentDiscussionAPI";
import { fetchStudentDiscussionUploads } from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";
import { fetchActiveQuizzesForStudent, fetchAttemptedQuizzesForStudent } from "@/lib/helpers/quiz/quizAPI";
import { fetchSubmissionDetails, getStudentAttemptCount } from "@/lib/helpers/quiz/quizSubmissionAPI";
import { QuizCardSkeletonGroup } from "./components/QuizCardShimmer";
import { StudentDiscussionCardSkeletonGroup } from "./components/StudentDiscussionCardShimmer";
import { AssignmentCardSkeletonGroup } from "./assignmentcard";


function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function AssignmentsLeftContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const activeQuizId = searchParams.get("quizId");
    const activeDiscussionId = searchParams.get("discussionId");
    const activeModal = searchParams.get("modal");
    const activeTab = searchParams.get("tab") || "assignments";
    const activeView = (searchParams.get("view") as "active" | "previous") || "active";
    const quizView = (searchParams.get("quizView") as "ongoing" | "attempted") || "ongoing";
    const discussionView = (searchParams.get("discussionView") as "active" | "completed") || "active";
    const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
    const [previousAssignments, setPreviousAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const rowsPerPage = 8;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    const [discussionUploads, setDiscussionUploads] = useState<Record<string, any[]>>({});
    const { collegeSectionsId, collegeId } = useStudent();
    const [activeDiscussions, setActiveDiscussions] = useState<any[]>([]);
    const [completedDiscussions, setCompletedDiscussions] = useState<any[]>([]);
    const [discussionsLoading, setDiscussionsLoading] = useState(true);
    const { studentId } = useStudent();
    const [ongoingQuizzes, setOngoingQuizzes] = useState<any[]>([]);
    const [attemptedQuizzes, setAttemptedQuizzes] = useState<any[]>([]);
    const [quizzesLoading, setQuizzesLoading] = useState(false);
    const [quizSubTabLoading, setQuizSubTabLoading] = useState(false);
    const [discussionSubTabLoading, setDiscussionSubTabLoading] = useState(false);
    const [assignmentSubTabLoading, setAssignmentSubTabLoading] = useState(false);
    const [tabSwitchLoading, setTabSwitchLoading] = useState(false);
    const [quizRefreshKey, setQuizRefreshKey] = useState(0);
    const [quizCurrentPage, setQuizCurrentPage] = useState(1);
    const [discussionCurrentPage, setDiscussionCurrentPage] = useState(1);
    const QUIZ_PER_PAGE = 8;
    const DISCUSSION_PER_PAGE = 8;
    const MAX_ATTEMPTS = 3;
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [performanceLoading, setPerformanceLoading] = useState(false);
    const submissionId = searchParams.get("submissionId");

    useEffect(() => {
        if (activeModal === "performance" && submissionId) {
            loadPerformanceData(Number(submissionId));
        }
    }, [activeModal, submissionId]);

    async function loadPerformanceData(submissionId: number) {
        try {
            setPerformanceLoading(true);
            const answers = await fetchSubmissionDetails(submissionId);

            const correct = answers.filter((a: any) => a.isCorrect).length;
            const wrong = answers.filter((a: any) => !a.isCorrect && (a.selectedOptionId || a.writtenAnswer)).length;
            const unanswered = answers.filter((a: any) => !a.selectedOptionId && !a.writtenAnswer).length;
            const total = answers.length;

            const submission = attemptedQuizzes.find(
                (s: any) => s.submissionId === submissionId
            );
            const quiz = submission?.quizzes;

            const marksObtained = submission?.totalMarksObtained ?? 0;
            const totalMarks = quiz?.totalMarks ?? 0;
            const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

            setPerformanceData({
                id: quiz?.quizId,
                courseName: quiz?.college_subjects?.subjectName || "-",
                topic: quiz?.quizTitle || "-",
                facultyName: quiz?.faculty?.fullName || "-",
                attemptedOn: formatDate(submission?.submittedAt),
                questionsAttempted: `${submission?.answersCount ?? 0} / ${submission?.totalQuestionsCount ?? 0}`,
                attemptsUsed: `${submission?.attemptNumber} of ${MAX_ATTEMPTS}`,
                score: `${marksObtained} / ${totalMarks}`,
                bgColor: "bg-[#481451]",
                percentage,
                correct,
                wrong,
                unanswered,
                total,
                allAttemptsUsed: (submission?.attemptNumber ?? 0) >= MAX_ATTEMPTS,
            });
        } catch (err) {
            console.error("loadPerformanceData error:", err);
        } finally {
            setPerformanceLoading(false);
        }
    }

    async function loadQuizzes() {
        if (!collegeSectionsId || !studentId) return;
        try {
            setQuizzesLoading(true);
            const [ongoing, attempted] = await Promise.all([
                fetchActiveQuizzesForStudent(collegeSectionsId),
                fetchAttemptedQuizzesForStudent(studentId),
            ]);

            const ongoingWithAttempts = await Promise.all(
                ongoing.map(async (quiz: any) => {
                    const count = await getStudentAttemptCount(quiz.quizId, studentId as number);
                    return { ...quiz, attemptsLeft: MAX_ATTEMPTS - count };
                })
            );

            const filteredOngoing = ongoingWithAttempts.filter(
                (q: any) => q.attemptsLeft > 0
            );

            setOngoingQuizzes(filteredOngoing);
            setAttemptedQuizzes(attempted);
        } catch (err) {
            console.error("loadQuizzes error:", err);
        } finally {
            setQuizzesLoading(false);
        }
    }

    useEffect(() => {
        if (activeTab === "quiz") {
            loadQuizzes();
        }
    }, [activeTab, collegeSectionsId, studentId, quizRefreshKey]);

    async function loadDiscussions() {
        if (!collegeSectionsId || !studentId) return;
        try {
            setDiscussionsLoading(true);
            const [active, completed] = await Promise.all([
                fetchActiveDiscussionsForStudent(collegeSectionsId, studentId),
                fetchCompletedDiscussionsForStudent(collegeSectionsId)
            ]);

            const activeWithUploads = await Promise.all(
                active.map(async (discussion: any) => {
                    const uploads = await fetchStudentDiscussionUploads(
                        studentId,
                        discussion.discussionId
                    );
                    return { ...discussion, studentUploads: uploads };
                })
            );

            setActiveDiscussions(activeWithUploads);
            setCompletedDiscussions(completed);
        } catch (err) {
            console.error("loadDiscussions error:", err);
        } finally {
            setDiscussionsLoading(false);
        }
    }

    useEffect(() => {
        if (activeTab === "discussion" && collegeSectionsId) {
            loadDiscussions();
        }
    }, [activeTab, collegeSectionsId]);

    // Shimmer effect when switching quiz subtabs
    useEffect(() => {
        if (activeTab === "quiz") {
            setQuizSubTabLoading(true);
            const timer = setTimeout(() => {
                setQuizSubTabLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [quizView, activeTab]);

    // Shimmer effect when switching discussion subtabs
    useEffect(() => {
        if (activeTab === "discussion") {
            setDiscussionSubTabLoading(true);
            const timer = setTimeout(() => {
                setDiscussionSubTabLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [discussionView, activeTab]);

    // Shimmer effect when switching assignment subtabs
    useEffect(() => {
        if (activeTab === "assignments") {
            setAssignmentSubTabLoading(true);
            const timer = setTimeout(() => {
                setAssignmentSubTabLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeView]);

    // Shimmer effect when switching main tabs
    useEffect(() => {
        setTabSwitchLoading(true);
        const timer = setTimeout(() => {
            setTabSwitchLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const handleTabChange = (tab: "assignments" | "quiz" | "discussion") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        params.delete("action");
        params.delete("quizId");
        params.delete("discussionId");
        params.delete("modal");

        if (tab === "assignments") params.set("view", "active");
        if (tab === "quiz") params.set("quizView", "ongoing");
        if (tab === "discussion") params.set("discussionView", "active");

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

    const handleDiscussionViewChange = (view: "active" | "completed") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("discussionView", view);
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

    if (activeTab === "quiz" && activeQuizId && action === "attempt") {
        const activeQuizData = ongoingQuizzes.find(q => q.quizId.toString() === activeQuizId);
        return (
            <div className="w-[68%] p-2 flex flex-col h-full">
                <QuizAttemptScreen
                    quiz={{
                        id: activeQuizData?.quizId,
                        courseName: activeQuizData?.college_subjects?.subjectName || "-",
                        topic: activeQuizData?.quizTitle || "-",
                    }}
                    onSubmitSuccess={async () => {
                        await loadQuizzes();
                        setQuizRefreshKey(prev => prev + 1);
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("action");
                        params.delete("quizId");
                        params.set("tab", "quiz");
                        params.set("quizView", "attempted");
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                />
            </div>
        );
    }

    if (activeTab === "quiz" && action === "viewAnswers") {
        const submission = attemptedQuizzes.find(
            (s: any) => s.quizzes?.quizId?.toString() === activeQuizId
        );
        const quiz = submission?.quizzes;
        return (
            <div className="w-[68%] p-2 flex flex-col h-full">
                <QuizViewAnswersScreen
                    quiz={{
                        courseName: quiz?.college_subjects?.subjectName || "-",
                        topic: quiz?.quizTitle || "-",
                        score: `${submission?.totalMarksObtained ?? 0}/${quiz?.totalMarks ?? 0}`,
                        totalMarks: quiz?.totalMarks ?? 0,
                        totalMarksObtained: submission?.totalMarksObtained ?? 0,
                    }}
                />
            </div>
        );
    }

    const activeDiscussionData = activeDiscussionId
        ? [...activeDiscussions, ...completedDiscussions]
            .find(d => String(d.discussionId) === String(activeDiscussionId))
        : null;

    return (
        <div className="w-[68%] p-2 flex flex-col h-full">
            {activeModal === "performance" && activeQuizId && (
                performanceLoading ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <Loader />
                    </div>
                ) : performanceData ? (
                    <QuizPerformanceModal quiz={performanceData} />
                ) : null
            )}
            {activeModal === "uploadDiscussion" && activeDiscussionData && (
                <StudentDiscussionUploadModal
                    discussion={activeDiscussionData}
                    onUpload={(files) => {
                        setDiscussionUploads(prev => ({
                            ...prev,
                            [activeDiscussionData.discussionId]: files
                        }));
                    }}
                    onSuccess={loadDiscussions}
                />
            )}
            {activeModal === "viewDiscussion" && activeDiscussionData && (
                <StudentDiscussionDetailsModal discussion={activeDiscussionData} />
            )}
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
                    <span className="text-[#282828]">/</span>
                    <span onClick={() => handleTabChange("discussion")} className={`cursor-pointer transition-colors ${activeTab === "discussion" ? "text-[#43C17A]" : "text-[#282828]"}`}>
                        Discussion forum
                    </span>
                </h1>

                <p className="text-[#282828] text-sm">
                    {activeTab === "assignments" && "View, track, and submit your work with ease"}
                    {activeTab === "quiz" && "Attempt, track, and review your quiz performance with ease"}
                    {activeTab === "discussion" && "Explore project discussions, guides, and resources shared by faculty."}
                </p>
            </div>

            <div className="w-full flex flex-col flex-1 min-h-0">

                <div className="flex gap-4 pb-1">
                    {activeTab === "assignments" && (
                        <>
                            <h5 className={`text-xs cursor-pointer pb-1 ${activeView === "active" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`} onClick={() => handleViewChange("active")}>Active Assignments</h5>
                            <h5 className={`text-xs cursor-pointer pb-1 ${activeView === "previous" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`} onClick={() => handleViewChange("previous")}>Previous Assignments</h5>
                        </>
                    )}
                    {activeTab === "quiz" && (
                        <>
                            <h5 className={`text-xs cursor-pointer pb-1 ${quizView === "ongoing" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`} onClick={() => handleQuizViewChange("ongoing")}>Ongoing Quizzes</h5>
                            <h5 className={`text-xs cursor-pointer pb-1 ${quizView === "attempted" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`} onClick={() => handleQuizViewChange("attempted")}>Attempted Quizzes</h5>
                        </>
                    )}

                    {activeTab === "discussion" && (
                        <>
                            <h5
                                className={`text-xs cursor-pointer pb-1 ${discussionView === "active" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                                onClick={() => handleDiscussionViewChange("active")}
                            >
                                Active Discussions
                            </h5>
                            <h5
                                className={`text-xs cursor-pointer pb-1 ${discussionView === "completed" ? "text-[#43C17A] text-sm font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                                onClick={() => handleDiscussionViewChange("completed")}
                            >
                                Completed Discussions
                            </h5>
                        </>
                    )}
                </div>

                <div className="mt-4 h-[151vh] overflow-y-auto pr-1">
                    {activeTab === "assignments" && (
                        loading || tabSwitchLoading || assignmentSubTabLoading ? (
                            <AssignmentCardSkeletonGroup count={4} />
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
                                <div className="flex flex-col h-full">
                                    {quizzesLoading || quizSubTabLoading ? (
                                        <QuizCardSkeletonGroup count={3} />
                                    ) : ongoingQuizzes.length === 0 ? (
                                        <div className="flex items-center justify-center h-1/3">
                                            <p className="text-sm text-gray-500">No ongoing quizzes available</p>
                                        </div>
                                    ) : (
                                        ongoingQuizzes.slice((quizCurrentPage - 1) * QUIZ_PER_PAGE, quizCurrentPage * QUIZ_PER_PAGE).map((quiz, index) => {
                                            const bgColors = ["bg-[#481451]", "bg-[#182142]", "bg-[#1B1A40]", "bg-[#2E1851]", "bg-[#0A2647]"];
                                            return (
                                                <QuizCard
                                                    key={quiz.quizId}
                                                    data={{
                                                        id: quiz.quizId,
                                                        courseName: quiz.college_subjects?.subjectName || "-",
                                                        topic: quiz.quizTitle,
                                                        facultyName: quiz.faculty?.fullName || "-",
                                                        attemptsLeft: quiz.attemptsLeft,
                                                        quizDuration: `${formatDate(quiz.startDate)} → ${formatDate(quiz.endDate)}`,
                                                        // timeLimit: "-",
                                                        bgColor: bgColors[index % bgColors.length],
                                                    }}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {quizView === "attempted" && (
                                <div className="flex flex-col h-full">
                                    {quizzesLoading || quizSubTabLoading ? (
                                        <QuizCardSkeletonGroup count={3} />
                                    ) : attemptedQuizzes.length === 0 ? (
                                        <div className="flex items-center justify-center h-1/3">
                                            <p className="text-sm text-gray-500">No attempted quizzes yet</p>
                                        </div>
                                    ) : (
<<<<<<< Updated upstream
                                        attemptedQuizzes.map((submission, index) => {
=======
                                        attemptedQuizzes.slice((quizCurrentPage - 1) * QUIZ_PER_PAGE, quizCurrentPage * QUIZ_PER_PAGE).map((submission, index) => {
                                            console.log("submission:", submission);
>>>>>>> Stashed changes
                                            const bgColors = ["bg-[#481451]", "bg-[#182142]", "bg-[#1B1A40]", "bg-[#2E1851]", "bg-[#0A2647]"];
                                            const quiz = submission.quizzes;
                                            return (
                                                <AttemptedQuizCard
                                                    key={submission.submissionId}
                                                    data={{
                                                        id: quiz?.quizId,
                                                        submissionId: submission.submissionId,
                                                        courseName: quiz?.college_subjects?.subjectName || "-",
                                                        topic: quiz?.quizTitle || "-",
                                                        facultyName: quiz?.faculty?.fullName || "-",
                                                        attemptedOn: formatDate(submission.submittedAt),
                                                        questionsAttempted: `${submission.answersCount ?? 0} / ${submission.totalQuestionsCount ?? 0}`,
                                                        attemptsUsed: `${submission.attemptNumber} of ${MAX_ATTEMPTS}`,
                                                        score: `${submission.totalMarksObtained} / ${quiz?.totalMarks ?? "-"}`,
                                                        bgColor: bgColors[index % bgColors.length],
                                                        totalMarksObtained: submission.totalMarksObtained,
                                                        totalMarks: quiz?.totalMarks,
                                                        totalQuestionsCount: submission.totalQuestionsCount,
                                                        answersCount: submission.answersCount,
                                                    }}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "discussion" && (
                        <div className="flex flex-col gap-4 pb-10 h-full">
                            {discussionsLoading || discussionSubTabLoading ? (
                                <StudentDiscussionCardSkeletonGroup count={3} />
                            ) : (
                                <>
                                    {discussionView === "active" && (
                                        activeDiscussions.length === 0 ? (
                                            <div className="flex items-center justify-center h-1/3">
                                                <p className="text-sm text-gray-500">No active discussions found.</p>
                                            </div>
                                        ) : (
                                            activeDiscussions.slice((discussionCurrentPage - 1) * DISCUSSION_PER_PAGE, discussionCurrentPage * DISCUSSION_PER_PAGE).map((discussion) => (
                                                <StudentDiscussionCard
                                                    key={discussion.discussionId}
                                                    data={discussion}
                                                    uploadedFiles={discussion.studentUploads || []}
                                                    onRemoveFile={(studentDiscussionUploadId) => {
                                                        setActiveDiscussions(prev =>
                                                            prev.map(d =>
                                                                d.discussionId === discussion.discussionId
                                                                    ? {
                                                                        ...d,
                                                                        studentUploads: d.studentUploads.filter(
                                                                            (f: any) => f.studentDiscussionUploadId !== studentDiscussionUploadId
                                                                        )
                                                                    }
                                                                    : d
                                                            )
                                                        );
                                                    }}
                                                />
                                            ))
                                        )
                                    )}
                                    {discussionView === "completed" && (
                                        completedDiscussions.length === 0 ? (
                                            <div className="flex items-center justify-center h-1/3">
                                                <p className="text-sm text-gray-500">No completed discussions found.</p>
                                            </div>
                                        ) : (
                                            completedDiscussions.slice((discussionCurrentPage - 1) * DISCUSSION_PER_PAGE, discussionCurrentPage * DISCUSSION_PER_PAGE).map((discussion) => (
                                                <StudentDiscussionCard
                                                    key={discussion.discussionId}
                                                    data={discussion}
                                                    isCompleted={true}
                                                    uploadedFiles={discussionUploads[discussion.discussionId] || []}
                                                />
                                            ))
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {activeTab === "assignments" && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border cursor-pointer bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
                        >
                            <CaretLeft size={18} weight="bold" color="black" />
                        </button>
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 cursor-pointer h-9 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "bg-white text-gray-600 border hover:border-gray-300"}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <CaretRight size={18} weight="bold" color="black" />
                        </button>
                    </div>
                )}

                {activeTab === "quiz" && (() => {
                    const list = quizView === "ongoing" ? ongoingQuizzes : attemptedQuizzes;
                    const quizTotalPages = Math.ceil(list.length / QUIZ_PER_PAGE);
                    return quizTotalPages > 1 && !quizzesLoading && !quizSubTabLoading ? (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setQuizCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={quizCurrentPage === 1}
                                className="p-2 rounded-lg border cursor-pointer bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
                            >
                                <CaretLeft size={18} weight="bold" color="black" />
                            </button>
                            <div className="flex gap-1">
                                {[...Array(quizTotalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setQuizCurrentPage(i + 1)}
                                        className={`w-9 cursor-pointer h-9 rounded-lg text-sm font-bold transition-all ${quizCurrentPage === i + 1 ? "bg-[#16284F] text-white" : "bg-white text-gray-600 border hover:border-gray-300"}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setQuizCurrentPage((p) => Math.min(quizTotalPages, p + 1))}
                                disabled={quizCurrentPage === quizTotalPages}
                                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                <CaretRight size={18} weight="bold" color="black" />
                            </button>
                        </div>
                    ) : null;
                })()}

                {activeTab === "discussion" && (() => {
                    const list = discussionView === "active" ? activeDiscussions : completedDiscussions;
                    const discTotalPages = Math.ceil(list.length / DISCUSSION_PER_PAGE);
                    return discTotalPages > 1 && !discussionsLoading && !discussionSubTabLoading ? (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setDiscussionCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={discussionCurrentPage === 1}
                                className="p-2 rounded-lg border cursor-pointer bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
                            >
                                <CaretLeft size={18} weight="bold" color="black" />
                            </button>
                            <div className="flex gap-1">
                                {[...Array(discTotalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setDiscussionCurrentPage(i + 1)}
                                        className={`w-9 cursor-pointer h-9 rounded-lg text-sm font-bold transition-all ${discussionCurrentPage === i + 1 ? "bg-[#16284F] text-white" : "bg-white text-gray-600 border hover:border-gray-300"}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setDiscussionCurrentPage((p) => Math.min(discTotalPages, p + 1))}
                                disabled={discussionCurrentPage === discTotalPages}
                                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                <CaretRight size={18} weight="bold" color="black" />
                            </button>
                        </div>
                    ) : null;
                })()}
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