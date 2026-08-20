"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Chalkboard,
  CheckCircle,
  ClipboardText,
  BookOpenText,
  FileText,
  CaretDown,
  DownloadSimple,
} from "@phosphor-icons/react";
import ResultsDropdown from "./resultsDropdown";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useUser } from "@/app/utils/context/UserContext";
import * as XLSX from "xlsx";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getFacultyResultsOverview } from "@/lib/helpers/faculty/results/getFacultyResultsOverview";
import { ResultsManagementSkeleton } from "../shimmer/StudentProgressSkeleton";

export default function ResultsManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    facultyId,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    faculty_edu_type,
    college_branch,
  } = useFaculty();
  const { collegeEducationType } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);

  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("filterSubject") || searchParams.get("subject") || "");
  const [selectedSection, setSelectedSection] = useState(searchParams.get("filterSection") || "all");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "facultyResultsOverview",
      collegeId,
      collegeEducationId,
      collegeBranchId,
      facultyId,
      isSchool,
      selectedSubject,
      selectedSection,
      currentPage,
      itemsPerPage,
    ],
    queryFn: async () => {
      if (!collegeId || !facultyId || !collegeEducationId) {
        return { items: [], totalCount: 0, totalUploaded: 0, totalPending: 0, subjects: [], sections: [] };
      }
      return await getFacultyResultsOverview({
        collegeId,
        collegeEducationId,
        collegeBranchId: collegeBranchId ?? null,
        facultyId,
        isSchool,
        subjectName: selectedSubject,
        sectionName: selectedSection,
        page: currentPage,
        pageSize: itemsPerPage,
        branchName: isSchool ? "N/A" : (college_branch || "N/A"),
      });
    },
    enabled: !!collegeId && !!facultyId && !!collegeEducationId,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });

  const uniqueSubjects = data?.subjects || [];
  const uniqueSections = data?.sections || [];

  useEffect(() => {
    if (uniqueSubjects.length > 0 && !selectedSubject) {
      const defaultSubject = uniqueSubjects[0];
      setSelectedSubject(defaultSubject);
      
      // Also sync it to URL so it doesn't get lost on refresh
      const params = new URLSearchParams(searchParams.toString());
      params.set("filterSubject", defaultSubject);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [uniqueSubjects, selectedSubject, searchParams, pathname, router]);

  const assignedSubject =
    selectedSubject ||
    (uniqueSubjects.length > 0 ? uniqueSubjects[0] : "No Subject Assigned");

  const sectionOptions = useMemo(() => {
    return [
      { label: "All Sections", value: "all" },
      ...uniqueSections.map((s) => ({ label: `Section ${s}`, value: s })),
    ];
  }, [uniqueSections]);

  const paginatedData = data?.items || [];
  const totalItems = data?.totalCount || 0;
  
  const assignedClassesCount = data?.totalCount || 0;
  const resultsUploadedCount = data?.totalUploaded || 0;
  const pendingUploadsCount = data?.totalPending || 0;

  const downloadExcelTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      
      // Simulating a slightly heavy template generation or network fetch
      await new Promise(resolve => setTimeout(resolve, 800));

      const wsData = [
        ["Roll No", "Internal Marks", "External Marks", "Total", "Grade"],
        ["STU001", 20, 70, 90, "A+"],
        ["STU002", 18, 65, 83, "A"],
        ["STU003", 15, 45, 60, "B"],
        ["STU004", 10, 20, 30, "F"]
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = [
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Results_Template");
      XLSX.writeFile(wb, "Student_Results_Template.xlsx");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const updateFiltersInUrl = (subject: string, section: string, page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filterSubject", subject);
    params.set("filterSection", section);
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    setCurrentPage(1);
    updateFiltersInUrl(assignedSubject, value, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateFiltersInUrl(assignedSubject, selectedSection, newPage);
  };

  const handleViewDetails = (row: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "results");
    params.set("view", "details");
    params.set("year", row.year);
    params.set("section", row.section);
    params.set("students", String(row.students));
    if (!isSchool) {
      params.set("branch", row.branch || "N/A");
      if (row.branchId) {
        params.set("branchId", String(row.branchId));
      }
    }
    params.set("subject", assignedSubject);
    params.set("sectionId", String(row.sectionId));
    params.set("academicYearId", String(row.academicYearId));
    params.set("semesterId", String(row.semesterId));
    params.set("examType", row.examType);
    params.set("collegeExamScheduleId", String(row.collegeExamScheduleId));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleUploadResultsRow = (row: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "results");
    params.set("view", "upload");
    params.set("year", row.year);
    params.set("section", row.section);
    params.set("students", String(row.students));
    if (!isSchool) {
      params.set("branch", row.branch || "N/A");
      if (row.branchId) {
        params.set("branchId", String(row.branchId));
      }
    }
    params.set("subject", assignedSubject);
    params.set("sectionId", String(row.sectionId));
    params.set("academicYearId", String(row.academicYearId));
    params.set("semesterId", String(row.semesterId));
    params.set("examType", row.examType);
    params.set("collegeExamScheduleId", String(row.collegeExamScheduleId));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return <ResultsManagementSkeleton isSchool={isSchool} />;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[#282828] text-2xl font-bold">Results Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and publish student results for assigned classes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadExcelTemplate}
            disabled={isDownloadingTemplate}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm transition-colors ${
              isDownloadingTemplate
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-[#107c41] hover:bg-[#0b592e] text-white cursor-pointer"
            }`}
          >
            <div className="bg-[#ffffff20] p-1.5 rounded-md text-white">
              <DownloadSimple size={18} weight="bold" className={isDownloadingTemplate ? "animate-pulse" : ""} />
            </div>
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-wider text-white/80 font-medium leading-none">
                {isDownloadingTemplate ? "Preparing..." : "Format"}
              </p>
              <p className="text-xs md:text-sm font-bold mt-0.5 leading-none">
                {isDownloadingTemplate ? "Downloading..." : "Excel Template"}
              </p>
            </div>
          </button>

          <div ref={subjectDropdownRef} className="relative">
            <button
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              className="flex items-center gap-3 bg-[#004d33] hover:bg-[#003825] text-white px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <div className="bg-[#ffffff20] p-1.5 rounded-md text-white">
                <BookOpenText size={18} weight="fill" />
              </div>
              <div className="text-left pr-2">
                <p className="text-[9px] uppercase tracking-wider text-green-300 font-medium leading-none">
                  Assigned Subject
                </p>
                <p className="text-xs md:text-sm font-bold mt-0.5 leading-none">
                  {assignedSubject}
                </p>
              </div>
              <CaretDown
                size={14}
                className={`text-green-300 transition-transform duration-200 ${isSubjectDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>
            {isSubjectDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="py-0 max-h-[300px] overflow-y-auto">
                  {uniqueSubjects.map((subjectName) => (
                    <button
                      key={subjectName}
                      onClick={() => {
                        setSelectedSubject(subjectName);
                        setCurrentPage(1);
                        updateFiltersInUrl(subjectName, "all", 1);
                        setIsSubjectDropdownOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-xs md:text-sm transition-colors cursor-pointer ${selectedSubject === subjectName
                        ? "bg-[#004d33] text-white font-semibold"
                        : "text-gray-700 hover:bg-[#004d33]/10 hover:text-[#004d33]"
                        }`}
                    >
                      {subjectName}
                    </button>
                  ))}
                  {uniqueSubjects.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No subjects available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="bg-[#E6FBEA] text-[#43C17A] p-3 rounded-xl shrink-0">
            <Chalkboard size={24} weight="fill" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-500">Assigned Classes</p>
            {isFetching ? (
              <div className="h-7 md:h-8 w-12 md:w-16 animate-pulse rounded-lg bg-gray-200" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">{assignedClassesCount}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="bg-[#E6FBEA] text-[#43C17A] p-3 rounded-xl shrink-0">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-500">Results Uploaded</p>
            {isFetching ? (
              <div className="h-7 md:h-8 w-12 md:w-16 animate-pulse rounded-lg bg-gray-200" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">{resultsUploadedCount}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="bg-[#FFE0E0] text-[#FF3B30] p-3 rounded-xl shrink-0">
            <ClipboardText size={24} weight="fill" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-500">Pending Uploads</p>
            {isFetching ? (
              <div className="h-7 md:h-8 w-12 md:w-16 animate-pulse rounded-lg bg-gray-200" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">{pendingUploadsCount}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-150 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-[#007A48]" weight="fill" />
            <h2 className="text-sm md:text-base font-bold text-gray-800">
              Class Results Overview
            </h2>
          </div>
          <ResultsDropdown
            options={sectionOptions}
            selectedValue={selectedSection}
            onChange={handleSectionChange}
          />
        </div>

        <div className="w-full overflow-x-auto relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Exam Type
                </th>
                {!isSchool && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {collegeEducationType === "Inter" ? "Group" : "Branch"}
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-150">
              {isFetching ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={`shimmer-${i}`} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-4 w-28 bg-gray-200 rounded mx-auto" />
                    </td>
                    {!isSchool && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-5 w-24 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-semibold text-gray-800">
                      {row.examType}
                    </td>
                    {!isSchool && (
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-semibold text-gray-700">
                        {row.branch}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-semibold text-gray-700">
                      {row.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-medium text-gray-600">
                      {row.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-medium text-gray-600">
                      {row.students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {row.status === "UPLOADED" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
                          UPLOADED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF4E5] text-[#FF9800]">
                          NOT UPLOADED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {row.status === "UPLOADED" ? (
                          <>
                            <button
                              onClick={() => handleUploadResultsRow(row)}
                              className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs md:text-sm font-bold transition-colors cursor-pointer shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleViewDetails(row)}
                              className="inline-flex items-center justify-center px-4 py-1.5 border border-[#43C17A] rounded-lg text-xs md:text-sm font-bold text-[#43C17A] hover:bg-[#E6FBEA] transition-colors cursor-pointer"
                            >
                              View
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUploadResultsRow(row)}
                              className="inline-flex items-center justify-center px-4 py-1.5 bg-[#43C17A] text-white hover:bg-[#38A166] rounded-lg text-xs md:text-sm font-bold transition-colors cursor-pointer shadow-sm"
                            >
                              Upload
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isSchool ? 6 : 7} className="px-6 py-10 text-center text-sm text-gray-500">
                    {isLoading ? "Loading..." : "No classes found matching the criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          itemsPerPageOptions={[5, 10, 20, 50]}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
          roundedBottom="rounded-b-2xl"
          alwaysShow
        />
      </div>
    </div>
  );
}
