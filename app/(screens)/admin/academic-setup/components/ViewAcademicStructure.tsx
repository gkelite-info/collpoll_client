"use client";

import { useEffect, useState } from "react";
import { fetchAdminBranchesWithDetails } from "@/lib/helpers/admin/academicSetupAPI";
import { deleteAcademicSetup } from "@/lib/helpers/admin/academicSetup/academicSetupMasterAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { Pagination } from "./pagination";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import toast from "react-hot-toast";

export type AcademicViewData = {
  id: string;
  degree: string;
  dept: string;
  branch: string;
  // year: any[];
  year: string;
  sections: any[];
  batch?: string;
};

const ITEMS_PER_PAGE = 10;

export default function ViewAcademicStructure({
  onEdit,
}: {
  onEdit: (row: AcademicViewData) => void;
}) {
  const { adminId, loading: adminLoading } = useAdmin();
  const [data, setData] = useState<AcademicViewData[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<AcademicViewData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { collegeId, collegeEducationType } = useAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);

  useEffect(() => {
    const loadData = async () => {
      if (adminLoading || !adminId) return;
      setIsFetching(true);

      const response = await fetchAdminBranchesWithDetails(adminId, currentPage, ITEMS_PER_PAGE);
      setData(response.data);
      setTotalItems(response.total);
      // setCurrentPage(1);
      setIsFetching(false);
    };

    loadData();
  }, [adminId, adminLoading, currentPage, refreshTrigger]);

  const handleDeleteClick = (row: AcademicViewData) => {
    setRowToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete || !collegeId) return;

    setIsDeleting(true);
    try {
      const response = await deleteAcademicSetup(rowToDelete.id, isSchool, collegeId);
      
      if (!response.success) {
        if (response.reason === "DEPENDENCIES_EXIST") {
          toast.error("This year has few registrations of faculty and students", { id: "delete-academic-setup" });
        } else {
          toast.error("Failed to delete the academic setup", { id: "delete-academic-setup" });
        }
      } else {
        toast.success("Academic setup deleted successfully", { id: "delete-academic-setup" });
        setIsDeleteModalOpen(false);
        setRowToDelete(null);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while deleting", { id: "delete-academic-setup" });
    } finally {
      setIsDeleting(false);
    }
  };

  // const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-[85%] mx-auto bg-white rounded-md border overflow-hidden flex flex-col">
      <div className="min-h-[420px] overflow-y-auto w-full ">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left">Education Type</th>
              {!isSchool && <th className="p-4 text-left">{collegeEducationType === "Inter" ? "Group Code" : "Branch Code"}</th>}
              <th className="p-4 text-left">Year</th>
              {!isSchool && <th className="p-4 text-left">Batch</th>}
              <th className="p-4 text-left">Sections</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isFetching ? (
              <tr>
                <td
                  colSpan={12}
                  className="p-8 text-center text-gray-400 h-[300px]"
                >
                  <Loader />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400 h-[300px]"
                >
                  No academic structures found.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 text-gray-800 transition border-b border-gray-50 last:border-b-0"
                >
                  <td className="p-4">{row.degree}</td>
                  {!isSchool && <td className="p-4">{row.dept}</td>}

                  <td className="p-4">{row.year || "-"}</td>

                  {!isSchool && <td className="p-4">{row.batch || "-"}</td>}

                  <td className="p-4">
                    {!row.sections || row.sections.length === 0
                      ? "-"
                      // : row.sections.map((s: any) => s.name || s).join(", ")}
                      : row.sections.join(", ")}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-[#16284F] cursor-pointer hover:text-emerald-500 font-semibold underline transition-colors"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 cursor-pointer hover:text-red-700 font-semibold underline transition-colors"
                        onClick={() => handleDeleteClick(row)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isFetching && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {isDeleteModalOpen && rowToDelete && (
        <ConfirmDeleteModal
          open={isDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setRowToDelete(null);
          }}
          isDeleting={isDeleting}
          name={rowToDelete.year || rowToDelete.branch || rowToDelete.degree}
          title="Delete Academic Setup"
        />
      )}
    </div>
  );
}
