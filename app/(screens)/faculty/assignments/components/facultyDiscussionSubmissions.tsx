"use client";

import { CaretLeft, FilePdf, User } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddMarksModal from "./addMarksModal";
import { fetchFacultyDiscussionSubmissions } from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";
import { formatFileName } from "@/app/utils/formatFileName";
import { fetchDiscussionById } from "@/lib/helpers/discussionForum/discussionForumAPI";
import SubmissionShimmer from "@/app/(screens)/admin/assignments/components/shimmers/submissionShimmer";
import { Pagination } from "./pagination"; // 🟢 IMPORT REUSABLE PAGINATION COMPONENT

interface Props {
  discussionId: string | null;
  discussionSectionId?: number;
}

const ITEMS_PER_PAGE = 10;

export default function FacultyDiscussionSubmissions({
  discussionId,
  discussionSectionId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // 🟢 PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discussion, setDiscussion] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (!discussionId) return;

    fetchDiscussionById(Number(discussionId)).then((data) => {
      if (data) {
        setDiscussion({
          title: data.title,
          description: data.description,
        });
      }
    });
  }, [discussionId]);

  const loadSubmissions = () => {
    if (!discussionId) return;

    setLoading(true);
    // 🟢 USING THE PAGINATED HELPER
    fetchFacultyDiscussionSubmissions(
      Number(discussionId),
      currentPage,
      ITEMS_PER_PAGE,
    )
      .then(({ data, totalCount }) => {
        setSubmissions(data);
        setTotalCount(totalCount);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load submissions.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmissions();
  }, [discussionId, discussionSectionId, currentPage]); // Re-fetch on page change

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    params.delete("discussionId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openMarksModal = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col mx-auto h-full pb-10 w-full">
      <div className="flex items-center gap-1 mb-5 text-[#282828] hover:text-black transition-colors">
        <CaretLeft
          size={24}
          weight="bold"
          onClick={handleBack}
          className="cursor-pointer"
        />
        <h1 className="font-bold text-xl md:text-2xl">
          Manage student discussion submissions.
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-[#282828]">
            {discussion?.title || "Discussion"}
          </h2>
          <p className="text-sm text-gray-600">
            {" "}
            {discussion?.description || "—"}
          </p>
        </div>
        <div className="bg-[#43C17A] text-white px-4 py-2 rounded-md font-bold text-sm">
          Total Files Uploaded : {loading ? "…" : totalCount}
        </div>
      </div>

      {loading ? (
        <SubmissionShimmer />
      ) : error ? (
        <div className="text-center py-10 text-red-500 font-medium">
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 italic">
          No submissions yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
          {submissions.map((submission) => (
            <div
              key={submission.studentId}
              className="bg-white overflow-x-auto rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-3"
            >
              <div className="flex-shrink-0 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative flex items-center justify-center">
                  {submission.profiles?.avatar_url ? (
                    <img
                      src={submission.profiles.avatar_url}
                      alt={submission.profiles.full_name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User size={20} weight="bold" className="text-gray-500" />
                  )}
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#43C17A] font-bold text-base">
                    {submission.profiles?.full_name || "Unknown Student"}
                  </h3>

                  {submission.marksObtained !== undefined &&
                  submission.marksObtained !== null ? (
                    <div
                      className="bg-[#43C17A] text-white text-xs font-bold px-4 py-1.5 rounded-md min-w-[70px] text-center cursor-pointer hover:bg-[#34a362] transition-colors"
                      onClick={() => openMarksModal(submission)}
                      title="Edit Marks"
                    >
                      {submission.marksObtained} / {submission.totalMarks}
                    </div>
                  ) : (
                    <button
                      onClick={() => openMarksModal(submission)}
                      className="bg-[#16284F] text-white text-xs font-bold px-4 py-1.5 rounded-md cursor-pointer hover:bg-[#102040] transition-colors min-w-[70px]"
                    >
                      Add Marks
                    </button>
                  )}
                </div>

                <div className="flex justify-between mt-2">
                  <div className="flex flex-col gap-2 text-sm">
                    <div>
                      <span className="font-bold text-[#282828]">
                        Student ID :{" "}
                      </span>
                      <span className="text-gray-600">
                        {submission.studentId}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[#282828]">
                        Section :{" "}
                      </span>
                      <span className="text-gray-600">
                        {submission.profiles?.section || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-[13px] items-end w-[350px]">
                    <div className="w-full text-right">
                      <span className="font-bold text-[#282828]">
                        Submitted on :{" "}
                      </span>
                      <span className="text-gray-600">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center w-full justify-end">
                      <span className="font-bold text-[#282828] mr-2 flex-shrink-0">
                        Files :
                      </span>

                      <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[280px]">
                        {submission.files.map((file: any) => (
                          <a
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-[#FE000008] text-red-600 hover:text-red-700 hover:bg-[#FE000015] px-2 py-1 rounded-md transition-colors whitespace-nowrap flex-shrink-0"
                            title={formatFileName(file.url)}
                          >
                            <FilePdf
                              size={15}
                              weight="fill"
                              className="flex-shrink-0"
                            />
                            <span className="truncate max-w-[100px] text-xs font-medium">
                              {formatFileName(file.url)}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 🟢 DB PAGINATION COMPONENT */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-center pb-4">
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <AddMarksModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onSuccess={loadSubmissions}
        />
      )}
    </div>
  );
}
