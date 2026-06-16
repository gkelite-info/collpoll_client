"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Chalkboard,
  CheckCircle,
  ClipboardText,
  BookOpenText,
  FileText,
} from "@phosphor-icons/react";
import ResultsDropdown from "./resultsDropdown";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

interface ClassResultRow {
  id: string;
  year: string;
  section: string;
  students: number;
  status: "PUBLISHED";
}

const staticClasses: ClassResultRow[] = [
  { id: "1", year: "2nd Year", section: "A", students: 62, status: "PUBLISHED" },
  { id: "2", year: "1st Year", section: "B", students: 58, status: "PUBLISHED" },
  { id: "3", year: "2nd Year", section: "C", students: 54, status: "PUBLISHED" },
  { id: "4", year: "3rd Year", section: "A", students: 60, status: "PUBLISHED" },
  { id: "5", year: "4th Year", section: "B", students: 65, status: "PUBLISHED" },
  { id: "6", year: "1st Year", section: "A", students: 57, status: "PUBLISHED" },
  { id: "7", year: "3rd Year", section: "C", students: 59, status: "PUBLISHED" },
  { id: "8", year: "2nd Year", section: "B", students: 61, status: "PUBLISHED" },
  { id: "9", year: "4th Year", section: "A", students: 63, status: "PUBLISHED" },
  { id: "10", year: "1st Year", section: "C", students: 55, status: "PUBLISHED" },
  { id: "11", year: "2nd Year", section: "D", students: 52, status: "PUBLISHED" },
  { id: "12", year: "3rd Year", section: "B", students: 58, status: "PUBLISHED" },
  { id: "13", year: "4th Year", section: "C", students: 64, status: "PUBLISHED" },
  { id: "14", year: "1st Year", section: "D", students: 50, status: "PUBLISHED" },
  { id: "15", year: "2nd Year", section: "A", students: 62, status: "PUBLISHED" },
  { id: "16", year: "3rd Year", section: "D", students: 56, status: "PUBLISHED" },
  { id: "17", year: "4th Year", section: "D", students: 61, status: "PUBLISHED" },
  { id: "18", year: "2nd Year", section: "B", students: 58, status: "PUBLISHED" },
  { id: "19", year: "3rd Year", section: "A", students: 62, status: "PUBLISHED" },
  { id: "20", year: "1st Year", section: "B", students: 59, status: "PUBLISHED" },
  { id: "21", year: "2nd Year", section: "C", students: 55, status: "PUBLISHED" },
  { id: "22", year: "4th Year", section: "A", students: 60, status: "PUBLISHED" },
  { id: "23", year: "3rd Year", section: "C", students: 57, status: "PUBLISHED" },
  { id: "24", year: "1st Year", section: "A", students: 61, status: "PUBLISHED" },
  { id: "25", year: "2nd Year", section: "D", students: 53, status: "PUBLISHED" },
  { id: "26", year: "4th Year", section: "B", students: 66, status: "PUBLISHED" },
  { id: "27", year: "3rd Year", section: "B", students: 59, status: "PUBLISHED" },
  { id: "28", year: "1st Year", section: "C", students: 54, status: "PUBLISHED" },
  { id: "29", year: "2nd Year", section: "A", students: 60, status: "PUBLISHED" },
  { id: "30", year: "4th Year", section: "C", students: 62, status: "PUBLISHED" },
];

export default function ResultsManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedSection, setSelectedSection] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sectionOptions = [
    { label: "All Sections", value: "all" },
    { label: "Section A", value: "A" },
    { label: "Section B", value: "B" },
    { label: "Section C", value: "C" },
    { label: "Section D", value: "D" },
  ];

  const filteredData = useMemo(() => {
    let data = staticClasses;
    if (selectedSection !== "all") {
      data = data.filter((item) => item.section === selectedSection);
    }
    return data;
  }, [selectedSection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (row: ClassResultRow) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "results");
    params.set("view", "details");
    params.set("year", row.year);
    params.set("section", row.section);
    params.set("students", String(row.students));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

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
          {/* <button
            onClick={() => toast.success("Redirecting to results upload portal...")}
            className="flex items-center gap-2 bg-[#007A48] hover:bg-[#006038] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <UploadSimple size={18} weight="bold" />
            <span>UPLOAD RESULTS</span>
          </button> */}

          <div className="flex items-center gap-3 bg-[#004d33] text-white px-4 py-2 rounded-lg shadow-sm">
            <div className="bg-[#ffffff20] p-1.5 rounded-md text-white">
              <BookOpenText size={18} weight="fill" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-green-300 font-medium leading-none">
                Assigned Subject
              </p>
              <p className="text-xs md:text-sm font-bold mt-0.5 leading-none">DBMS</p>
            </div>
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
            <p className="text-2xl font-bold text-gray-800">3</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
          <div className="bg-[#E6FBEA] text-[#43C17A] p-3 rounded-xl">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Results Uploaded</p>
            <p className="text-2xl font-bold text-gray-800">2</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-xl shadow-sm">
          <div className="bg-[#FFE0E0] text-[#FF3B30] p-3 rounded-xl">
            <ClipboardText size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Pending Uploads</p>
            <p className="text-2xl font-bold text-gray-800">1</p>
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
                      {row.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-medium text-gray-600">
                      {row.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm font-medium text-gray-600">
                      {row.students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
                        PUBLISHED
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
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
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
