"use client";
import { useEffect, useState } from "react";
import { CaretLeftIcon } from "@phosphor-icons/react";
import FacultyQuizSubmissionsShimmer from "@/app/(screens)/faculty/assignments/shimmer/FacultyQuizSubmissionsShimmer";

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

interface AdminQuizSubmissionsProps {
    quizId: number | string;
    onBack: () => void;
}

export default function AdminQuizSubmissions({ quizId, onBack }: AdminQuizSubmissionsProps) {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [quizDetails, setQuizDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setQuizDetails({
                quizTitle: "Deadlocks & Avoidance Detection",
                startDate: "2025-01-11",
                endDate: "2025-01-25",
                totalMarks: 30
            });

            setSubmissions([
                { submissionId: 1, studentId: "479210", totalMarksObtained: 28, submittedAt: "2025-01-14T10:00:00Z", students: { fullName: "Lily Tano", rollNumber: "479210", section: "A", profileImage: "https://i.pravatar.cc/100?u=1" } },
                { submissionId: 2, studentId: "479211", totalMarksObtained: 25, submittedAt: "2025-01-15T12:30:00Z", students: { fullName: "Ananya Sharma", rollNumber: "479211", section: "B", profileImage: "https://i.pravatar.cc/100?u=2" } },
                { submissionId: 3, studentId: "479212", totalMarksObtained: 22, submittedAt: "2025-01-16T14:45:00Z", students: { fullName: "Sophia Lin", rollNumber: "479212", section: "A", profileImage: "https://i.pravatar.cc/100?u=3" } },
            ]);
            setIsLoading(false);
        }, 600);

    }, [quizId]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-4">
                <div className="flex items-center lg:mb-1">
                    <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onBack} />
                    <h1 className="font-bold text-2xl text-[#282828]">View Submissions</h1>
                </div>
                <p className="text-[#282828] text-sm ">Students who have submitted the quiz.</p>
            </div>

            {quizDetails && !isLoading && (
                <div className="bg-white rounded-md px-4 py-3 mb-3 flex items-center justify-between border-2 border-[#43C17A] shadow-sm">
                    <div>
                        <p className="font-bold text-[#282828] text-sm">{quizDetails.quizTitle}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(quizDetails.startDate)} → {formatDate(quizDetails.endDate)} • {quizDetails.totalMarks} Marks
                        </p>
                    </div>
                    <div>
                        <span className="text-sm font-bold px-4 py-2 rounded-md bg-[#43C17A] text-white">
                            Total Submissions : {submissions.length}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-4 pr-1">
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <FacultyQuizSubmissionsShimmer key={i} />
                    ))
                ) : submissions.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 text-sm">No submissions yet.</div>
                ) : (
                    submissions.map((submission) => (
                        <div key={submission.submissionId} className="bg-white rounded-md px-4 py-3 flex items-center justify-between border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                    {submission.students?.profileImage ? (
                                        <img src={submission.students.profileImage} alt={submission.students?.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-gray-500">{submission.students?.fullName?.[0] ?? "S"}</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-bold text-[#43C17A]">{submission.students?.fullName || "-"}</p>
                                    <p className="text-xs text-gray-500">Student ID : {submission.students?.rollNumber || submission.studentId}</p>
                                    <p className="text-xs text-gray-500">Section : {submission.students?.section || "-"}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#282828]">Total Marks :</span>
                                    <span className="text-xs font-bold text-white bg-[#16284F] px-3 py-1 rounded-md">
                                        {submission.totalMarksObtained} / {quizDetails?.totalMarks}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">Attempted on : {formatDate(submission.submittedAt)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}