"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Chalkboard,
  CheckCircle,
  ClipboardText,
  BookOpenText,
  FileText,
  UploadSimple,
  CaretDown,
} from "@phosphor-icons/react";
import ResultsDropdown from "./resultsDropdown";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";

export default function ResultsManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { sections, faculty_subject, collegeAcademicYears, college_branch, collegeId } = useFaculty();
  const { identifierId } = useUser();

  const [selectedSection, setSelectedSection] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const itemsPerPage = 10;

  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  const uniqueSubjects = useMemo(() => {
    const namesFromFacultySubject = faculty_subject?.map((s) => s.subjectName) || [];
    const namesFromSections = sections
      ?.map((sec) => sec.faculty_subject?.subjectName)
      .filter((name): name is string => !!name) || [];
    return Array.from(new Set([...namesFromFacultySubject, ...namesFromSections]));
  }, [faculty_subject, sections]);

  useEffect(() => {
    if (uniqueSubjects.length > 0 && !selectedSubject) {
      setSelectedSubject(uniqueSubjects[0]);
    }
  }, [uniqueSubjects, selectedSubject]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target as Node)) {
        setIsSubjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSections = useMemo(() => {
    if (!selectedSubject) return sections;
    return sections.filter((sec) => sec.faculty_subject?.subjectName === selectedSubject);
  }, [sections, selectedSubject]);

  useEffect(() => {
    if (collegeId && filteredSections.length > 0) {
      filteredSections.forEach(async (sec) => {
        try {
          const students = await fetchStudentsWithProfile(collegeId, {
            sectionId: sec.collegeSectionsId,
            yearId: sec.collegeAcademicYearId,
          });
          setStudentCounts(prev => ({
            ...prev,
            [sec.facultySectionId.toString()]: students.length
          }));
        } catch (error) {
          console.error("Failed to fetch students for section", error);
        }
      });
    }
  }, [collegeId, filteredSections]);

  const dynamicClasses = useMemo(() => {
    return filteredSections.map((sec) => {
      const yearObj = collegeAcademicYears.find((y) => y.collegeAcademicYearId === sec.collegeAcademicYearId);
      return {
        id: sec.facultySectionId.toString(),
        branch: college_branch || "N/A",
        year: yearObj?.collegeAcademicYear || "N/A",
        section: sec.college_sections?.collegeSections || "N/A",
        students: studentCounts[sec.facultySectionId.toString()] || 0,
        status: "NOT UPLOADED", // Static status for now
      };
    });
  }, [filteredSections, collegeAcademicYears, college_branch, studentCounts]);

  const sectionOptions = useMemo(() => {
    const uniqueSections = Array.from(new Set(dynamicClasses.map((c) => c.section)));
    return [
      { label: "All Sections", value: "all" },
      ...uniqueSections.map(s => ({ label: `Section ${s}`, value: s }))
    ];
  }, [dynamicClasses]);

  const filteredData = useMemo(() => {
    let data = dynamicClasses;
    if (selectedSection !== "all") {
      data = data.filter((item) => item.section === selectedSection);
    }
    return data;
  }, [dynamicClasses, selectedSection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (row: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "results");
    params.set("view", "details");
    params.set("year", row.year);
    params.set("section", row.section);
    params.set("students", String(row.students));
    params.set("branch", row.branch);
    params.set("subject", assignedSubject);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleUploadResults = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "results");
    params.set("view", "upload");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const assignedClassesCount = filteredSections.length;
  const resultsUploadedCount = dynamicClasses.filter(c => c.status === "UPLOADED").length; // Will be 0 currently
  const pendingUploadsCount = dynamicClasses.filter(c => c.status === "NOT UPLOADED").length;

  const assignedSubject = selectedSubject || (faculty_subject && faculty_subject.length > 0 
    ? faculty_subject[0].subjectName 
    : "No Subject Assigned");

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
            onClick={handleUploadResults}
            className="flex items-center gap-3 bg-[#004d33] hover:bg-[#003825] text-white px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <div className="bg-[#ffffff20] p-1.5 rounded-md text-white">
              <UploadSimple size={18} weight="bold" />
            </div>
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-wider text-green-300 font-medium leading-none">
                Action
              </p>
              <p className="text-xs md:text-sm font-bold mt-0.5 leading-none">Upload Results</p>
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
                className={`text-green-300 transition-transform duration-200 ${
                  isSubjectDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {isSubjectDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="py-0">
                  {uniqueSubjects.map((subjectName) => (
                    <button
                      key={subjectName}
                      onClick={() => {
                        setSelectedSubject(subjectName);
                        setIsSubjectDropdownOpen(false);
                        setSelectedSection("all");
                        setCurrentPage(1);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-xs md:text-sm transition-colors cursor-pointer ${
                        selectedSubject === subjectName
                          ? "bg-[#004d33] text-white font-semibold"
                          : "text-gray-700 hover:bg-[#004d33]/10 hover:text-[#004d33]"
                      }`}
                    >
                      {subjectName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
          <div className="bg-[#E6FBEA] text-[#43C17A] p-3 rounded-xl">
            <Chalkboard size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Assigned Classes</p>
            <p className="text-2xl font-bold text-gray-800">{assignedClassesCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
          <div className="bg-[#E6FBEA] text-[#43C17A] p-3 rounded-xl">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Results Uploaded</p>
            <p className="text-2xl font-bold text-gray-800">{resultsUploadedCount}</p>
          </div>
        </div>

        {/* Pending Uploads Card - Uncommented */}
        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
          <div className="bg-[#FFE0E0] text-[#FF3B30] p-3 rounded-xl">
            <ClipboardText size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Pending Uploads</p>
            <p className="text-2xl font-bold text-gray-800">{pendingUploadsCount}</p>
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

        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
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
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-semibold text-gray-700">
                      {row.branch}
                    </td>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF4E5] text-[#FF9800]">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetails(row)}
                        className="inline-flex items-center justify-center px-4 py-1.5 border border-[#43C17A] rounded-lg text-xs md:text-sm font-semibold text-[#43C17A] hover:bg-[#E6FBEA] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No classes found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          roundedBottom="rounded-b-2xl"
        />
      </div>
    </div>
  );
}
