"use client";

import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getAcademicSubjects,
  deleteAcademicSubject,
  fetchSubjectFilters
} from "@/lib/helpers/admin/academicSetup/academicSubjectsAPI";
import { fetchAdminAcademicFilters } from "@/lib/helpers/admin/academicSetupAPI";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "./pagination";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import ConfirmDeleteModal from "../../calendar/components/ConfirmDeleteModal";

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

const TableShimmer = ({ isSchool, isInter }: { isSchool: boolean, isInter: boolean }) => {
  const columnCount = isSchool ? 5 : (isInter ? 8 : 9);
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-gray-50 last:border-b-0 animate-pulse">
          <td className="p-3"><div className="h-10 w-10 bg-gray-200 rounded-lg"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          {!isSchool && <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>}
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          {!isSchool && <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>}
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
          {!isSchool && !isInter && <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>}
          <td className="p-3">
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
    <div className="h-10 bg-gray-200 rounded-md w-48"></div>
  </div>
);

export default function ViewSubjects({
  onEdit,
}: {
  onEdit: (row: SubjectViewData) => void;
}) {
  const { userId } = useUser();
  const [subjects, setSubjects] = useState<SubjectViewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { collegeEducationType, adminId } = useAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);
  const isInter = collegeEducationType === "Inter";
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Filters State
  const [educationFilter, setEducationFilter] = useState<string>("All");
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  
  const [filterOptions, setFilterOptions] = useState<{ educations: any[], branches: any[], years: any[], subjects: any[] }>({
    educations: [],
    branches: [],
    years: [],
    subjects: []
  });
  const [isFetchingFilters, setIsFetchingFilters] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      if (!adminId) return;
      setIsFetchingFilters(true);
      const { collegeId } = await fetchAdminContext(userId!);
      const res = await fetchAdminAcademicFilters(adminId);
      const subjects = await fetchSubjectFilters(collegeId);
      setFilterOptions({ ...res, subjects });
      setIsFetchingFilters(false);
    };
    fetchFilters();
  }, [adminId, userId]);

  useEffect(() => {
    if (!userId) return;
    loadSubjects();
  }, [userId]);

  const loadSubjects = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);

      const { collegeId } = await fetchAdminContext(userId);

      const res = await getAcademicSubjects(
        collegeId, 
        currentPage, 
        ITEMS_PER_PAGE, 
        educationFilter, 
        branchFilter, 
        yearFilter, 
        subjectFilter
      );

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
      setTotalItems(res.total || 0);
    } catch (error: unknown) {
      toast.error(
        getErrorMessage("Something went wrong while loading subjects.")
      );
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadSubjects();
  }, [currentPage, educationFilter, branchFilter, yearFilter, subjectFilter]);

  const handleDelete = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubjectId) return;

    try {
      setIsDeleting(true);
      const res = await deleteAcademicSubject(selectedSubjectId);
      if (res.success) {
        setOpenDeleteModal(false);
        setSelectedSubjectId(null);
        loadSubjects();
        toast.success("Subject deleted successfully!");
      } else {
        toast.error("Failed to delete subject.");
        setIsDeleting(false);
      }
    } catch {
      toast.error("Failed to delete subject.");
      setIsDeleting(false);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSubjects = subjects;
  
  const tableColumnCount = isSchool ? 5 : (isInter ? 8 : 9);

  return (
    <div className="w-[95%] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
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
                setSubjectFilter("All");
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
                  setSubjectFilter("All");
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
              onChange={(val) => { 
                setYearFilter(val as string); 
                setSubjectFilter("All");
                setCurrentPage(1); 
              }}
              disabled={isSchool ? educationFilter === "All" : branchFilter === "All"}
              placeholder="Year"
              widthClassName="w-48"
            />
            
            <CustomDropdown
              label="Subject"
              value={subjectFilter}
              options={[
                { value: "All", label: "All" },
                ...Array.from(
                  new Set(
                    filterOptions.subjects
                      .filter(s => {
                        const edu = filterOptions.educations.find(e => e.collegeEducationType === educationFilter);
                        if (!edu && educationFilter !== "All") return false;
                        
                        if (educationFilter !== "All" && s.collegeEducationId !== edu?.collegeEducationId) return false;
                        
                        if (!isSchool && branchFilter !== "All") {
                          const branch = filterOptions.branches.find(b => b.collegeBranchCode === branchFilter && b.collegeEducationId === edu?.collegeEducationId);
                          if (!branch || s.collegeBranchId !== branch.collegeBranchId) return false;
                        }
                        
                        if (yearFilter !== "All") {
                           const branch = filterOptions.branches.find(b => b.collegeBranchCode === branchFilter && b.collegeEducationId === edu?.collegeEducationId);
                           const year = filterOptions.years.find(y => y.collegeAcademicYear === yearFilter && y.collegeEducationId === edu?.collegeEducationId && (!isSchool ? y.collegeBranchId === branch?.collegeBranchId : true));
                           if (!year || s.collegeAcademicYearId !== year.collegeAcademicYearId) return false;
                        }
                        
                        return true;
                      })
                      .map(s => s.subjectName)
                  )
                ).filter(Boolean).map(s => ({ value: s, label: s }))
              ]}
              onChange={(val) => { setSubjectFilter(val as string); setCurrentPage(1); }}
              disabled={yearFilter === "All"}
              placeholder="Subject Name"
              widthClassName="w-48"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar min-h-[40vh]">
        <table className="w-full text-sm text-[#2D3748]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Subject Image</th>
              <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Subject</th>
              <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Subject Code</th>
              <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Subject Key</th>
              {!isSchool && <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Credits</th>}
              <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Education</th>
              {!isSchool && (
                <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">
                  {educationFilter === "Inter" ? "Group" : "Branch"}
                </th>
              )}
              <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Year</th>
              {!isSchool && !isInter && (
                <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Sem</th>
              )}
              <th className="p-3 text-left text-[#2D3748] whitespace-nowrap">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableShimmer isSchool={isSchool} isInter={isInter} />
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
                  {!isSchool && <td className="p-3 text-[#2D3748]">{row.credits}</td>}
                  <td className="p-3 text-[#2D3748]">{row.education}</td>
                  {!isSchool && <td className="p-3 text-[#2D3748]">{row.branch}</td>}
                  <td className="p-3 text-[#2D3748]">{row.year}</td>
                  {!isSchool && !(collegeEducationType === "Inter") && (
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

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        alwaysShow={true}
      />

      <ConfirmDeleteModal
        open={openDeleteModal}
        onCancel={() => {
          setOpenDeleteModal(false);
          setSelectedSubjectId(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete"
        name="subject"
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
      />
    </div>
  );
}
