// "use client";

// import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
// import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
// import { useUser } from "@/app/utils/context/UserContext";
// import { getAcademicSubjects } from "@/lib/helpers/admin/academicSetup/academicSubjectsAPI";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { Pagination } from "./pagination";
// import { useAdmin } from "@/app/utils/context/admin/useAdmin";

// export type SubjectViewData = {
//   id: number;
//   subjectName: string;
//   subjectCode: string;
//   subjectKey: string;
//   credits: number;

//   education: string;
//   branch: string;
//   year: string;
//   semester: string;
// };

// const ITEMS_PER_PAGE = 10;

// export default function ViewSubjects({
//   onEdit,
// }: {
//   onEdit: (row: SubjectViewData) => void;
// }) {
//   const { userId } = useUser();
//   const [subjects, setSubjects] = useState<SubjectViewData[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const { collegeEducationType, collegeEducationId } = useAdmin();

//   useEffect(() => {
//     if (!userId) return;
//     loadSubjects();
//   }, [userId, collegeEducationId]);

//   const loadSubjects = async () => {
//     if (!userId || !collegeEducationId) return;
//     try {
//       setIsLoading(true);

//       const { collegeId } = await fetchAdminContext(userId);
//       const res = await getAcademicSubjects(collegeId, collegeEducationId);

//       if (!res.success) {
//         toast.error(res.error || "Unable to load subjects. Please try again.");
//         setSubjects([]);
//         return;
//       }

//       const mapped = res.data.map((s: any) => ({
//         id: s.collegeSubjectId,
//         subjectName: s.subjectName,
//         subjectCode: s.subjectCode,
//         subjectKey: s.subjectKey ?? "-",
//         credits: s.credits,
//         education: s.collegeEducation?.collegeEducationType ?? "-",
//         branch: s.collegeBranch?.collegeBranchCode ?? "-",
//         year: s.collegeAcademicYear?.collegeAcademicYear ?? "-",
//         semester: s.collegeSemester?.collegeSemester?.toString() ?? "-",
//       }));

//       setSubjects(mapped);
//       setCurrentPage(1);
//     } catch (err: any) {
//       toast.error(
//         err.message || "Something went wrong while loading subjects.",
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const currentSubjects = subjects.slice(
//     startIndex,
//     startIndex + ITEMS_PER_PAGE,
//   );

//   return (
//     <div className="w-[95%] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
//       <div className="flex-1 overflow-x-auto min-h-[40vh]">
//         <table className="w-full text-sm text-[#2D3748]">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left text-[#2D3748]">Subject</th>
//               <th className="p-3 text-left text-[#2D3748]">Subject Code</th>
//               <th className="p-3 text-left text-[#2D3748]">Subject Key</th>
//               <th className="p-3 text-left text-[#2D3748]">Credits</th>
//               <th className="p-3 text-left text-[#2D3748]">Education</th>
//               <th className="p-3 text-left text-[#2D3748]">{collegeEducationType === "Inter" ? "Group" : "Branch"}</th>
//               <th className="p-3 text-left text-[#2D3748]">Year</th>
//               {!(collegeEducationType === "Inter") && (
//                 <th className="p-3 text-left text-[#2D3748]">Sem</th>
//               )}
//               <th className="p-3 text-left text-[#2D3748]">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {isLoading ? (
//               <tr>
//                 <td colSpan={9} className="text-center p-3 h-[30vh]">
//                   <Loader />
//                 </td>
//               </tr>
//             ) : currentSubjects.length > 0 ? (
//               currentSubjects.map((row) => (
//                 <tr
//                   key={row.id}
//                   className="hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
//                 >
//                   <td className="p-3 text-[#2D3748]">{row.subjectName}</td>
//                   <td className="p-3 text-[#2D3748]">{row.subjectCode}</td>
//                   <td className="p-3 text-[#2D3748]">{row.subjectKey}</td>
//                   <td className="p-3 text-[#2D3748]">{row.credits}</td>
//                   <td className="p-3 text-[#2D3748]">{row.education}</td>
//                   <td className="p-3 text-[#2D3748]">{row.branch}</td>
//                   <td className="p-3 text-[#2D3748]">{row.year}</td>
//                   <td className="p-3 text-[#2D3748]">{row.semester}</td>
//                   <td
//                     className="p-3 underline cursor-pointer text-[#16284F] hover:text-[#43C17A] transition-colors"
//                     onClick={() => onEdit(row)}
//                   >
//                     Edit
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={9} className="text-center p-3 h-[30vh]">
//                   No subjects available.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {!isLoading && (
//         <Pagination
//           currentPage={currentPage}
//           totalItems={subjects.length}
//           itemsPerPage={ITEMS_PER_PAGE}
//           onPageChange={setCurrentPage}
//         />
//       )}
//     </div>
//   );
// }

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

  education: string;
  branch: string;
  year: string;
  semester: string;
};

const ITEMS_PER_PAGE = 10;

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
      setCurrentPage(1);
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong while loading subjects.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 NEW: Handle Delete
  const handleDelete = async (subjectId: number) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;

    try {
      setIsLoading(true);
      const res = await deleteAcademicSubject(subjectId);
      if (res.success) {
        toast.success("Subject deleted successfully!");
        loadSubjects(); // Reload the list
      } else {
        toast.error(res.error);
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error("Failed to delete subject.");
      setIsLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSubjects = subjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="w-[95%] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <div className="flex-1 overflow-x-auto min-h-[40vh]">
        <table className="w-full text-sm text-[#2D3748]">
          <thead className="bg-gray-100">
            <tr>
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
                <td colSpan={9} className="text-center p-3 h-[30vh]">
                  <Loader />
                </td>
              </tr>
            ) : currentSubjects.length > 0 ? (
              currentSubjects.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                >
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
                <td colSpan={9} className="text-center p-3 h-[30vh]">
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
