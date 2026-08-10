"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { fetchProjectSubmissionsWithStudents, fetchProjectContextDetails } from "@/lib/helpers/student/student_project_submissionsAPI";
import { getSecureAttachmentUrl } from "@/lib/helpers/projects/projectFiles";
import TableComponent from "@/app/utils/table/table";
import { Avatar } from "@/app/utils/Avatar";
import toast from "react-hot-toast";
import { decodeId } from "@/app/utils/crypto";
import AddMarksModal from "./AddMarksModal";
import { Pagination } from "../../admin/academic-setup/components/pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface StudentSubmissionsProps {
  projectId: string | null;
}

export default function StudentSubmissions() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const projectId = searchParams.get("projectId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const projectTitle = searchParams.get("title")
    ? decodeURIComponent(searchParams.get("title")!)
    : "Project Submissions";

  const branchName = searchParams.get("branchName");
  const yearName = searchParams.get("yearName");

  const decodedString = projectId ? decodeId(projectId) : null;
  const parsedProjectId = decodedString ? Number(decodedString) : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projectSubmissions", parsedProjectId, page],
    queryFn: async () => {
      if (!parsedProjectId || isNaN(parsedProjectId)) {
        return { data: [], total: 0 };
      }
      return await fetchProjectSubmissionsWithStudents(parsedProjectId, page, limit);
    },
    enabled: !!parsedProjectId && !isNaN(parsedProjectId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: projectContext } = useQuery({
    queryKey: ["projectContext", parsedProjectId],
    queryFn: async () => {
      if (!parsedProjectId || isNaN(parsedProjectId)) return null;
      return await fetchProjectContextDetails(parsedProjectId);
    },
    enabled: !!parsedProjectId && !isNaN(parsedProjectId),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const contextAny = projectContext as any;
  const subjectName = Array.isArray(contextAny?.college_subjects) 
    ? contextAny?.college_subjects[0]?.subjectName 
    : contextAny?.college_subjects?.subjectName;
    
  const sectionName = Array.isArray(contextAny?.college_sections) 
    ? contextAny?.college_sections[0]?.collegeSections 
    : contextAny?.college_sections?.collegeSections;

  if (isError) {
    toast.error("Failed to load submissions", { id: "submissions-error" });
  }

  const submissionsData = data?.data || [];
  const totalItems = data?.total || 0;

  const formattedSubmissions = submissionsData.map((item: any, index: number) => {
    const student = item.students;
    const user = student?.users;

    const profileData = student?.users?.user_profile;
    const profileUrl = Array.isArray(profileData)
      ? profileData[0]?.profileUrl
      : profileData?.profileUrl;

    const rollData = student?.student_pins;
    const pinNumber = Array.isArray(rollData)
      ? rollData[0]?.pinNumber
      : rollData?.pinNumber;

    return {
      sno: (page - 1) * limit + index + 1,
      photo: (
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mx-auto border border-gray-100">
          <Avatar src={profileUrl} alt="" size={30} />
        </div>
      ),
      name: user?.fullName || "Unknown Student",
      rollNo: pinNumber || "N/A",
      date: item.updatedAt
        ? format(new Date(item.updatedAt), "dd MMM yyyy")
        : "N/A",
      file: (
        <a
          href={getSecureAttachmentUrl(item.fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-800 font-semibold hover:underline"
        >
          View
        </a>
      ),
      marks: (
        <button
          onClick={() => {
            setSelectedSubmission({
              id: item.studentProjectSubmissionId,
              name: user?.fullName || "Unknown Student",
              rollNo: pinNumber || "N/A",
              submittedOn: item.updatedAt
                ? format(new Date(item.updatedAt), "dd/MM/yyyy")
                : "N/A",
              totalMarks: item.projects?.marks || 0,
              obtainedMarks: item.marksObtained,
            });
            setIsModalOpen(true);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            item.marksObtained !== null && item.marksObtained !== undefined
              ? "bg-[#16a34a] text-white hover:bg-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {item.marksObtained !== null && item.marksObtained !== undefined
            ? `${item.marksObtained} / ${item.projects?.marks || 0}`
            : "Add Marks"}
        </button>
      ),
    };
  });

  const columns = [
    { title: "S.No", key: "sno" },
    { title: "Photo", key: "photo" },
    { title: "Name", key: "name" },
    { title: "Roll No", key: "rollNo" },
    { title: "Submission Date", key: "date" },
    { title: "File", key: "file" },
    { title: "Marks", key: "marks" },
  ];

  return (
    <div className=" rounded-2xl md:rounded-3xl md:px-6 lg:min-h-[480px]">
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h2 className="text-[#16a34a] text-xl md:text-2xl font-bold">
            {projectTitle}
          </h2>
          <div className="flex gap-2 mt-3 mb-2 flex-wrap">
            {branchName && (
              <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {branchName}
              </div>
            )}
            {yearName && (
              <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {yearName}
              </div>
            )}
            {subjectName && (
              <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {subjectName}
              </div>
            )}
            {sectionName && (
              <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                Section: {sectionName}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {totalItems} Total Submissions
          </p>
        </div>
      </div>

      <TableComponent
        columns={columns}
        tableData={formattedSubmissions}
        isLoading={isLoading}
        height="60vh"
      />

      {!isLoading && (
        <div className="mt-2 flex justify-center w-full pb-4">
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={(newPage) => setPage(newPage)}
            alwaysShow={true}
          />
        </div>
      )}

      <AddMarksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        submission={selectedSubmission}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ["projectSubmissions", parsedProjectId] });
        }}
      />
    </div>
  );
}
