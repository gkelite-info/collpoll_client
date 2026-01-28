"use client";

import { fetchAdminContext } from "@/app/utils/context/adminContextAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { getAcademicSubjects } from "@/lib/helpers/admin/academicSetup/academicSubjectsAPI";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export type SubjectViewData = {
  id: number;
  subjectName: string;
  subjectCode: string;
  subjectKey: string;
  credits: number;

  education: string;
  branch: string;
  year: string;
  semester: string;
};

export default function ViewSubjects({
  onEdit,
}: {
  onEdit: (row: SubjectViewData) => void;
}) {
  const { userId } = useUser();
  const [subjects, setSubjects] = useState<SubjectViewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadSubjects();
  }, [userId]);

  const loadSubjects = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);

      const { collegeId } = await fetchAdminContext(userId);
      const res = await getAcademicSubjects(collegeId);

      if (!res.success) {
        toast.error(res.error || "Unable to load subjects. Please try again.");
        setSubjects([]);
        return;
      }

      const mapped = res.data.map((s: any) => ({
        id: s.collegeSubjectId,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        subjectKey: s.subjectKey ?? "-",
        credits: s.credits,
        education: s.collegeEducation?.collegeEducationType ?? "-",
        branch: s.collegeBranch?.collegeBranchCode ?? "-",
        year: s.collegeAcademicYear?.collegeAcademicYear ?? "-",
        semester: s.collegeSemester?.collegeSemester?.toString() ?? "-",
      }));

      setSubjects(mapped);
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong while loading subjects.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[95%] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-[#2D3748] min-h-[40vh]">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-[#2D3748]">Subject</th>
            <th className="p-3 text-left text-[#2D3748]">Subject Code</th>
            <th className="p-3 text-left text-[#2D3748]">Subject Key</th>
            <th className="p-3 text-left text-[#2D3748]">Credits</th>
            <th className="p-3 text-left text-[#2D3748]">Education</th>
            <th className="p-3 text-left text-[#2D3748]">Branch</th>
            <th className="p-3 text-left text-[#2D3748]">Year</th>
            <th className="p-3 text-left text-[#2D3748]">Sem</th>
            <th className="p-3 text-left text-[#2D3748]">Action</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={9} className="text-center p-3">
                Loading...
              </td>
            </tr>
          ) : subjects.length > 0 ? (
            subjects.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="p-3 text-[#2D3748]">{row.subjectName}</td>
                <td className="p-3 text-[#2D3748]">{row.subjectCode}</td>
                <td className="p-3 text-[#2D3748]">{row.subjectKey}</td>
                <td className="p-3 text-[#2D3748]">{row.credits}</td>
                <td className="p-3 text-[#2D3748]">{row.education}</td>
                <td className="p-3 text-[#2D3748]">{row.branch}</td>
                <td className="p-3 text-[#2D3748]">{row.year}</td>
                <td className="p-3 text-[#2D3748]">{row.semester}</td>
                <td
                  className="p-3 underline cursor-pointer text-[#16284F]"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center p-3">
                No Subjects Available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
