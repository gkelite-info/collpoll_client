"use client";

import { CaretLeft, FilePdf } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import AddMarksModal from "./addMarksModal";
import { fetchFacultyDiscussionSubmissions } from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";
import { formatFileName } from "@/app/utils/formatFileName";
import { fetchDiscussionById } from "@/lib/helpers/discussionForum/discussionForumAPI";
import { Pagination } from "./pagination";
import { Avatar } from "@/app/utils/Avatar";
import { useQuery } from "@tanstack/react-query";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { buildCardSubtitle } from "./left";

interface Props {
  discussionId: string | null;
  discussionSectionId?: number;
}

const ITEMS_PER_PAGE = 10;

const getSecureUrl = (url: string) => {
  if (!url) return url;
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx !== -1) return `/api/files/${url.slice(idx + marker.length)}`;
  return url;
};

const TableRowShimmer = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
    </td>
    <td className="py-4 px-4 text-right">
      <div className="h-8 w-20 bg-gray-200 rounded ml-auto"></div>
    </td>
  </tr>
);

export default function FacultyDiscussionSubmissions({
  discussionId,
  discussionSectionId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: discussion, isLoading: loadingDiscussion } = useQuery({
    queryKey: ["discussionDetails", discussionId],
    queryFn: async () => {
      if (!discussionId) return null;
      return await fetchDiscussionById(Number(discussionId));
    },
    enabled: !!discussionId,
  });

  const { data, isLoading: loadingSubmissions, error: queryError, refetch } = useQuery({
    queryKey: ["facultyDiscussionSubmissions", discussionId, currentPage],
    queryFn: async () => {
      if (!discussionId) return { data: [], totalCount: 0 };
      return await fetchFacultyDiscussionSubmissions(
        Number(discussionId),
        currentPage,
        ITEMS_PER_PAGE,
      );
    },
    enabled: !!discussionId,
  });

  const submissions = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const isLoading = loadingSubmissions || loadingDiscussion;
  const error = queryError ? "Failed to load submissions." : null;

  const { sections } = useFaculty();
  
  const matchedSection = discussion 
    ? sections?.find((s: any) => s.collegeSectionsId === (discussionSectionId || (Array.isArray(discussion?.discussion_forum_sections) ? discussion?.discussion_forum_sections[0]?.collegeSectionsId : null))) 
    : null;
    
  const subtitle = discussion ? buildCardSubtitle(discussion, matchedSection) : "";

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

      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex flex-col mb-6">
        <div className="flex justify-between items-center mb-3">
          {loadingDiscussion ? (
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-[#282828]">
                {discussion?.title || "Discussion"}
              </h2>
              {subtitle && (
                <p className="text-sm font-medium text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div className="bg-[#43C17A] text-white px-4 py-2 rounded-md font-bold text-sm shrink-0 ml-4 h-fit">
            Total Files Uploaded : {loadingSubmissions ? "…" : totalCount}
          </div>
        </div>

        <div className="w-full">
          {loadingDiscussion ? (
            <div className="h-16 w-full bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <div className="max-h-[180px] overflow-y-auto w-full pr-2 custom-scrollbar">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {discussion?.description || "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-center py-10 text-red-500 font-medium">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col flex-1 overflow-hidden min-h-[400px]">
          <div className="w-full overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-sm text-[#282828] border-collapse min-w-[700px]">
              <thead className="bg-[#F8F9FA] text-[#818181] font-medium sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-bold border-b border-gray-100 rounded-tl-xl w-[40%]">Student Details</th>
                  <th className="py-3 px-4 font-bold border-b border-gray-100 w-[20%]">Submitted On</th>
                  <th className="py-3 px-4 font-bold border-b border-gray-100 w-[25%]">Files</th>
                  <th className="py-3 px-4 font-bold border-b border-gray-100 rounded-tr-xl text-right w-[15%]">Marks</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowShimmer key={i} />)
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400 italic">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission.studentId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative flex items-center justify-center shrink-0">
                            <Avatar src={submission.profiles.avatar_url} size={40} alt={submission.profiles.full_name} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[#43C17A] font-bold text-sm">
                              {submission.profiles?.full_name || "Unknown Student"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Student ID : {submission.profiles?.rollNumber || submission.studentId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Section : {submission.profiles?.section || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <p className="text-sm text-gray-600 font-medium pt-1">
                          {new Date(submission.submittedAt).toLocaleDateString("en-GB")}
                        </p>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-col gap-2 max-w-[280px]">
                          {submission.files?.map((file: any) => (
                            <a
                              key={file.id}
                              href={getSecureUrl(file.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-[#FE000008] text-red-600 hover:text-red-700 hover:bg-[#FE000015] px-2 py-1 rounded-md transition-colors w-fit max-w-full"
                              title={formatFileName(file.url)}
                            >
                              <FilePdf size={15} weight="fill" className="shrink-0" />
                              <span className="truncate text-xs font-medium">
                                {formatFileName(file.url)}
                              </span>
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-right pt-4">
                        {submission.marksObtained !== undefined && submission.marksObtained !== null ? (
                          <button
                            className="bg-[#43C17A] text-white text-xs font-bold px-4 py-1.5 rounded-md min-w-[70px] text-center cursor-pointer hover:bg-[#34a362] transition-colors ml-auto"
                            onClick={() => openMarksModal(submission)}
                            title="Edit Marks"
                          >
                            {submission.marksObtained} / {submission.totalMarks}
                          </button>
                        ) : (
                          <button
                            onClick={() => openMarksModal(submission)}
                            className="bg-[#16284F] text-white text-xs font-bold px-4 py-1.5 rounded-md cursor-pointer hover:bg-[#102040] transition-colors min-w-[70px] ml-auto"
                          >
                            Add Marks
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center p-4 border-t border-gray-100 mt-auto shrink-0 bg-white">
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              alwaysShow={true}
            />
          </div>
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
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
