"use client";

import { useEffect, useState } from "react";
import { fetchAdminBranchesWithDetails, fetchAdminAcademicFilters } from "@/lib/helpers/admin/academicSetupAPI";
import { deleteAcademicSetup } from "@/lib/helpers/admin/academicSetup/academicSetupMasterAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { CustomDropdown } from "@/app/components/CustomDropdown";
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

const TableShimmer = ({ isSchool }: { isSchool: boolean }) => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-gray-50 last:border-b-0 animate-pulse">
          <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
          {!isSchool && <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>}
          <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
          {!isSchool && <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>}
          <td className="p-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
          <td className="p-4">
             <div className="flex items-center gap-3">
                <div className="h-4 bg-gray-200 rounded w-10"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
             </div>
          </td>
        </tr>
      ))}
    </>
  );
};

const DropdownShimmer = () => (
  <div className="flex gap-4 mb-4 animate-pulse">
    <div className="h-10 bg-gray-200 rounded-md w-48"></div>
    <div className="h-10 bg-gray-200 rounded-md w-48"></div>
    <div className="h-10 bg-gray-200 rounded-md w-48"></div>
  </div>
);

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

  // Filters State
  const [educationFilter, setEducationFilter] = useState<string>("All");
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  
  const [filterOptions, setFilterOptions] = useState<{ educations: any[], branches: any[], years: any[] }>({
    educations: [],
    branches: [],
    years: []
  });
  const [isFetchingFilters, setIsFetchingFilters] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      if (adminLoading || !adminId) return;
      setIsFetchingFilters(true);
      const res = await fetchAdminAcademicFilters(adminId);
      setFilterOptions(res);
      setIsFetchingFilters(false);
    };
    fetchFilters();
  }, [adminId, adminLoading]);

  useEffect(() => {
    const loadData = async () => {
      if (adminLoading || !adminId) return;
      setIsFetching(true);

      const response = await fetchAdminBranchesWithDetails(
        adminId, 
        currentPage, 
        ITEMS_PER_PAGE, 
        educationFilter, 
        branchFilter, 
        yearFilter
      );
      
      setData(response.data);
      setTotalItems(response.total);
      setIsFetching(false);
    };

    loadData();
  }, [adminId, adminLoading, currentPage, refreshTrigger, educationFilter, branchFilter, yearFilter]);

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

  // const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-[85%] mx-auto bg-white rounded-md border overflow-hidden flex flex-col">
      {/* Filters Section */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        {isFetchingFilters ? (
          <DropdownShimmer />
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <CustomDropdown
              label="Education Type"
              value={educationFilter}
              options={[{ value: "All", label: "All" }, ...Array.from(new Set(filterOptions.educations.map(e => e.collegeEducationType))).filter(Boolean).map(e => ({ value: e, label: e }))]}
              onChange={(val) => { 
                setEducationFilter(val as string); 
                setBranchFilter("All");
                setYearFilter("All");
                setCurrentPage(1); 
              }}
              placeholder="Education Type"
              widthClassName="w-48"
            />
            
            {!isSchool && (
              <CustomDropdown
                label={educationFilter === "Inter" ? "Group" : "Branch"}
                value={branchFilter}
                options={[
                  { value: "All", label: "All" },
                  ...Array.from(
                    new Set(
                      filterOptions.branches
                        .filter(b => {
                          if (educationFilter === "All") return true;
                          const edu = filterOptions.educations.find(e => e.collegeEducationType === educationFilter);
                          return edu && b.collegeEducationId === edu.collegeEducationId;
                        })
                        .map(b => b.collegeBranchCode)
                    )
                  ).filter(Boolean).map(b => ({ value: b, label: b }))
                ]}
                onChange={(val) => { 
                  setBranchFilter(val as string); 
                  setYearFilter("All");
                  setCurrentPage(1); 
                }}
                disabled={educationFilter === "All"}
                placeholder={educationFilter === "Inter" ? "Group" : "Branch"}
                widthClassName="w-48"
              />
            )}
            
            <CustomDropdown
              label="Year"
              value={yearFilter}
              options={[
                { value: "All", label: "All" },
                ...Array.from(
                  new Set(
                    filterOptions.years
                      .filter(y => {
                        const edu = filterOptions.educations.find(e => e.collegeEducationType === educationFilter);
                        if (!edu && educationFilter !== "All") return false;
                        
                        if (educationFilter !== "All" && y.collegeEducationId !== edu?.collegeEducationId) return false;
                        
                        if (!isSchool && branchFilter !== "All") {
                          const branch = filterOptions.branches.find(b => b.collegeBranchCode === branchFilter && b.collegeEducationId === edu?.collegeEducationId);
                          if (!branch || y.collegeBranchId !== branch.collegeBranchId) return false;
                        }
                        
                        return true;
                      })
                      .map(y => y.collegeAcademicYear)
                  )
                ).filter(Boolean).map(y => ({ value: y, label: y }))
              ]}
              onChange={(val) => { setYearFilter(val as string); setCurrentPage(1); }}
              disabled={isSchool ? educationFilter === "All" : branchFilter === "All"}
              placeholder="Year"
              widthClassName="w-48"
            />
          </div>
        )}
      </div>

      <div className="min-h-[420px] overflow-y-auto overflow-x-auto custom-scrollbar w-full ">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left whitespace-nowrap">Education Type</th>
              {!isSchool && <th className="p-4 text-left whitespace-nowrap">{educationFilter === "Inter" ? "Group" : "Branch"}</th>}
              <th className="p-4 text-left whitespace-nowrap">Year</th>
              {!isSchool && <th className="p-4 text-left whitespace-nowrap">Batch</th>}
              <th className="p-4 text-left whitespace-nowrap">Sections</th>
              <th className="p-4 text-left whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isFetching ? (
              <TableShimmer isSchool={isSchool} />
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

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        alwaysShow={true}
      />

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
