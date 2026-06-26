"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { fetchProjectSubmissionsWithStudents } from "@/lib/helpers/student/student_project_submissionsAPI";
import TableComponent from "@/app/utils/table/table";
import { Avatar } from "@/app/utils/Avatar";
import toast from "react-hot-toast";
import { decodeId } from "@/app/utils/crypto";
import AddMarksModal from "./AddMarksModal";

interface StudentSubmissionsProps {
  projectId: string | null;
}

export default function StudentSubmissions() {
  const searchParams = useSearchParams();

  const projectId = searchParams.get("projectId");

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const projectTitle = searchParams.get("title")
    ? decodeURIComponent(searchParams.get("title")!)
    : "Project Submissions";

  useEffect(() => {
    const getSubmissions = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      const decodedString = decodeId(projectId);
      const parsedProjectId = Number(decodedString);

      if (!decodedString || isNaN(parsedProjectId)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchProjectSubmissionsWithStudents(
          Number(parsedProjectId),
        );

        const formattedData = data.map((item: any, index: number) => {
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
            sno: index + 1,
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
                href={item.fileUrl}
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

        setSubmissions(formattedData);
      } catch (err) {
        toast.error("Failed to load submissions");
      } finally {
        setIsLoading(false);
      }
    };

    getSubmissions();
  }, [projectId]);

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
          <p className="text-gray-500 text-sm mt-1">
            {submissions.length} Total Submissions
          </p>
        </div>
      </div>

      <TableComponent
        columns={columns}
        tableData={submissions}
        isLoading={isLoading}
        height="60vh"
      />

      <AddMarksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        submission={selectedSubmission}
        onSave={(marks) => {
          setSubmissions((prev) =>
            prev.map((sub) => {
              if (sub.marks.props.children[0] === undefined) {
                // To properly update UI, we need to re-fetch or hack the update
              }
              // A simple way to trigger re-render is reload window or re-fetch
              return sub;
            })
          );
          // Just reload for simplicity and consistency
          window.location.reload();
        }}
      />
    </div>
  );
}
