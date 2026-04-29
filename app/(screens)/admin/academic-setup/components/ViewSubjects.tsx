"use client";

import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getAcademicSubjects,
  deleteAcademicSubject,
} from "@/lib/helpers/admin/academicSetup/academicSubjectsAPI";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "./pagination";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

export type SubjectViewData = {
  id: number;
  subjectName: string;
  subjectCode: string;
  subjectKey: string;
  credits: number;
  image: string | null;

  education: string;
  branch: string;
  year: string;
  semester: string;
};

const ITEMS_PER_PAGE = 10;

type SubjectRowResponse = {
  collegeSubjectId: number;
  subjectName: string;
  subjectCode: string;
  subjectKey: string | null;
  credits: number;
  image: string | null;
  collegeEducation?: { collegeEducationType?: string | null } | null;
  collegeBranch?: { collegeBranchCode?: string | null } | null;
  collegeAcademicYear?: { collegeAcademicYear?: string | null } | null;
  collegeSemester?: { collegeSemester?: string | number | null } | null;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const getSubjectInitials = (subjectName: string) => {
  const parts = subjectName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "SU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

export default function ViewSubjects({
  onEdit,
}: {
  onEdit: (row: SubjectViewData) => void;
}) {
  const { userId } = useUser();
  const [subjects, setSubjects] = useState<SubjectViewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { collegeEducationType, collegeEducationId } = useAdmin();

  useEffect(() => {
    if (!userId) return;
    loadSubjects();
  }, [userId, collegeEducationId]);

  const loadSubjects = async () => {
    if (!userId || !collegeEducationId) return;
    try {
      setIsLoading(true);

      const { collegeId } = await fetchAdminContext(userId);
      const res = await getAcademicSubjects(collegeId, collegeEducationId);

      if (!res.success) {
        toast.error(res.error || "Unable to load subjects. Please try again.");
        setSubjects([]);
        return;
      }

      const mapped = res.data.map((s: SubjectRowResponse) => ({
        id: s.collegeSubjectId,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        subjectKey: s.subjectKey ?? "-",
        credits: s.credits,
        image: s.image ?? null,
        education: s.collegeEducation?.collegeEducationType ?? "-",
        branch: s.collegeBranch?.collegeBranchCode ?? "-",
        year: s.collegeAcademicYear?.collegeAcademicYear ?? "-",
        semester: s.collegeSemester?.collegeSemester?.toString() ?? "-",
      }));

      setSubjects(mapped);
      setCurrentPage(1);
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error) || "Something went wrong while loading subjects.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (subjectId: number) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;

    try {
      setIsLoading(true);
      const res = await deleteAcademicSubject(subjectId);
      if (res.success) {
        toast.success("Subject deleted successfully!");
        loadSubjects();
      } else {
        toast.error("Failed to delete subject.");
        setIsLoading(false);
      }
    } catch {
      toast.error("Failed to delete subject.");
      setIsLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSubjects = subjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const tableColumnCount = collegeEducationType === "Inter" ? 9 : 10;

  return (
    <div className="w-[95%] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <div className="flex-1 overflow-x-auto min-h-[40vh]">
        <table className="w-full text-sm text-[#2D3748]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-[#2D3748]">Subject Image</th>
              <th className="p-3 text-left text-[#2D3748]">Subject</th>
              <th className="p-3 text-left text-[#2D3748]">Subject Code</th>
              <th className="p-3 text-left text-[#2D3748]">Subject Key</th>
              <th className="p-3 text-left text-[#2D3748]">Credits</th>
              <th className="p-3 text-left text-[#2D3748]">Education</th>
              <th className="p-3 text-left text-[#2D3748]">
                {collegeEducationType === "Inter" ? "Group" : "Branch"}
              </th>
              <th className="p-3 text-left text-[#2D3748]">Year</th>
              {!(collegeEducationType === "Inter") && (
                <th className="p-3 text-left text-[#2D3748]">Sem</th>
              )}
              <th className="p-3 text-left text-[#2D3748]">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={tableColumnCount} className="text-center p-3 h-[30vh]">
                  <Loader />
                </td>
              </tr>
            ) : currentSubjects.length > 0 ? (
              currentSubjects.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                >
                  <td className="p-3">
                    <div className="flex items-center">
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={row.subjectName}
                          className="h-10 w-10 rounded-lg border border-[#DCE7E2] object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling as HTMLDivElement | null;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="h-10 w-10 rounded-lg border border-[#CBEBD8] bg-gradient-to-br from-[#DFF7E8] to-[#BCEFD1] text-xs font-semibold text-[#16284F] items-center justify-center"
                        style={{ display: row.image ? "none" : "flex" }}
                      >
                        {getSubjectInitials(row.subjectName)}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-[#2D3748]">{row.subjectName}</td>
                  <td className="p-3 text-[#2D3748]">{row.subjectCode}</td>
                  <td className="p-3 text-[#2D3748]">{row.subjectKey}</td>
                  <td className="p-3 text-[#2D3748]">{row.credits}</td>
                  <td className="p-3 text-[#2D3748]">{row.education}</td>
                  <td className="p-3 text-[#2D3748]">{row.branch}</td>
                  <td className="p-3 text-[#2D3748]">{row.year}</td>
                  {!(collegeEducationType === "Inter") && (
                    <td className="p-3 text-[#2D3748]">{row.semester}</td>
                  )}
                  <td className="p-3">
                    <span
                      className="underline cursor-pointer text-[#16284F] hover:text-[#43C17A] transition-colors mr-3"
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </span>
                    <span
                      className="underline cursor-pointer text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableColumnCount} className="text-center p-3 h-[30vh]">
                  No subjects available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={subjects.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
