"use client";
import { useEffect, useState } from "react";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { fetchSubmissionsWithStudentsByQuizId } from "@/lib/helpers/quiz/quizSubmissionAPI";
import { fetchQuizById } from "@/lib/helpers/quiz/quizAPI";
import FacultyQuizSubmissionsShimmer from "@/app/(screens)/faculty/assignments/shimmer/FacultyQuizSubmissionsShimmer";
import toast from "react-hot-toast";

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function AdminQuizSubmissions({
  quizId,
  onBack,
}: {
  quizId: number;
  onBack: () => void;
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [quizDetails, setQuizDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    Promise.all([
      fetchSubmissionsWithStudentsByQuizId(quizId),
      fetchQuizById(quizId),
    ])
      .then(([subs, quiz]) => {
        setSubmissions(subs);
        setQuizDetails(quiz);
      })
      .catch(() => {
        toast.error("Failed to load submissions");
      })
      .finally(() => setIsLoading(false));
  }, [quizId]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center lg:mb-1">
          <CaretLeftIcon
            size={22}
            weight="bold"
            className="text-[#282828] cursor-pointer"
            onClick={onBack}
          />
          <h1 className="font-bold text-2xl text-[#282828]">
            View Submissions
          </h1>
        </div>
      </div>

      {quizDetails && !isLoading && (
        <div className="bg-white rounded-md px-4 py-3 mb-3 flex items-center justify-between border-2 border-[#43C17A] shadow-sm">
          <div>
            <p className="font-bold text-[#282828] text-sm">
              {quizDetails.quizTitle}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(quizDetails.startDate)} →{" "}
              {formatDate(quizDetails.endDate)} • {quizDetails.totalMarks} Marks
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
          [1, 2, 3].map((i) => <FacultyQuizSubmissionsShimmer key={i} />)
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No submissions yet.
          </div>
        ) : (
          submissions.map((sub) => (
            <div
              key={sub.submissionId}
              className="bg-white rounded-md px-4 py-3 flex items-center justify-between border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {sub.students?.profileImage ? (
                    <img
                      src={sub.students.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-500">
                      {sub.students?.fullName?.[0] ?? "S"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-[#43C17A]">
                    {sub.students?.fullName || "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Student ID : {sub.students?.rollNumber || sub.studentId}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#282828]">
                    Total Marks :
                  </span>
                  <span className="text-xs font-bold text-white bg-[#16284F] px-3 py-1 rounded-md">
                    {sub.totalMarksObtained} / {quizDetails?.totalMarks}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Attempted on : {formatDate(sub.submittedAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
