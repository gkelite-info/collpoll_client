"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  NotePencil,
  FloppyDisk,
  PaperPlaneRight,
  DownloadSimple,
  FunnelSimple,
} from "@phosphor-icons/react";
import ResultsDropdown from "./resultsDropdown";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { downloadSamplePDF } from "../utils/downloadHelper";
import toast from "react-hot-toast";

interface StudentGradeRow {
  studentId: string;
  studentName: string;
  subjectCode: string;
  gradeSecured: "A+" | "A" | "B+" | "B" | "F";
  gradePoints: number;
  results: "P" | "F";
  credits: string;
  section: string;
}

export default function MemorandumOfGrades() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const examType = searchParams.get("examType") || "Mid Term";
  const semester = searchParams.get("semester") || "I Semester";

  const [selectedSection, setSelectedSection] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const sectionOptions = [
    { label: "All Sections", value: "all" },
    { label: "Section A", value: "A" },
    { label: "Section B", value: "B" },
    { label: "Section C", value: "C" },
  ];

  const staticGrades: StudentGradeRow[] = [
    { studentId: "208234", studentName: "Elena Rodriguez", subjectCode: "PHY-701", gradeSecured: "A+", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208235", studentName: "Adrian Sterling", subjectCode: "PHY-701", gradeSecured: "B", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208236", studentName: "Marcus Chen", subjectCode: "PHY-702", gradeSecured: "F", gradePoints: 2, results: "F", credits: "3.0", section: "C" },
    { studentId: "208237", studentName: "Sophia Loren", subjectCode: "PHY-701", gradeSecured: "A", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208238", studentName: "Jameson Blake", subjectCode: "PHY-703", gradeSecured: "B+", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208239", studentName: "Isabella Martinez", subjectCode: "PHY-701", gradeSecured: "A+", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208240", studentName: "Liam Henderson", subjectCode: "PHY-702", gradeSecured: "B", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208241", studentName: "Olivia Vance", subjectCode: "PHY-701", gradeSecured: "F", gradePoints: 2, results: "F", credits: "3.0", section: "C" },
    { studentId: "208242", studentName: "Ethan Hunt", subjectCode: "PHY-703", gradeSecured: "A", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208243", studentName: "Lucas Scott", subjectCode: "PHY-701", gradeSecured: "B+", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208244", studentName: "Charlotte Bronte", subjectCode: "PHY-701", gradeSecured: "A+", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208245", studentName: "Daniel Craig", subjectCode: "PHY-702", gradeSecured: "B", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208246", studentName: "Emma Watson", subjectCode: "PHY-701", gradeSecured: "A", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208247", studentName: "Alexander Great", subjectCode: "PHY-703", gradeSecured: "B+", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208248", studentName: "Zoe Saldana", subjectCode: "PHY-701", gradeSecured: "A+", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208249", studentName: "Ryan Gosling", subjectCode: "PHY-702", gradeSecured: "F", gradePoints: 2, results: "F", credits: "3.0", section: "C" },
    { studentId: "208250", studentName: "Chloe Grace", subjectCode: "PHY-701", gradeSecured: "B", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208251", studentName: "William Shakespeare", subjectCode: "PHY-703", gradeSecured: "A", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
    { studentId: "208252", studentName: "Penelope Cruz", subjectCode: "PHY-701", gradeSecured: "B+", gradePoints: 6, results: "P", credits: "3.0", section: "B" },
    { studentId: "208253", studentName: "Gabriel Garcia", subjectCode: "PHY-702", gradeSecured: "A+", gradePoints: 6, results: "P", credits: "3.0", section: "A" },
  ];

  const filteredGrades = useMemo(() => {
    let data = staticGrades;
    if (selectedSection !== "all") {
      data = data.filter((item) => item.section === selectedSection);
    }
    return data;
  }, [selectedSection]);

  const paginatedGrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGrades.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGrades, currentPage]);

  const tableColumns = [
    { title: "Student ID", key: "studentId" },
    { title: "Student Name", key: "studentName" },
    { title: "Subject Code", key: "subjectCode" },
    { title: "Grade Secured", key: "gradeSecured" },
    { title: "Grade Points", key: "gradePoints" },
    { title: "Results", key: "results" },
    { title: "Credits", key: "credits" },
  ];

  const tableDataFormatted = useMemo(() => {
    return paginatedGrades.map((row) => {
      let gradeColor = "text-gray-700";
      if (row.gradeSecured === "A+" || row.gradeSecured === "A") {
        gradeColor = "text-[#43C17A] font-bold";
      } else if (row.gradeSecured === "F") {
        gradeColor = "text-[#FF3B30] font-bold";
      } else {
        gradeColor = "text-blue-700 font-bold";
      }

      const resultBadge =
        row.results === "P" ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
            P
          </span>
        ) : (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFE0E0] text-[#FF3B30]">
            F
          </span>
        );

      return {
        studentId: (
          <button className="text-[#43C17A] font-bold hover:underline cursor-pointer">
            {row.studentId}
          </button>
        ),
        studentName: (
          <span className="text-gray-800 font-medium">{row.studentName}</span>
        ),
        subjectCode: (
          <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded text-xs font-semibold">
            {row.subjectCode}
          </span>
        ),
        gradeSecured: (
          <span className={gradeColor}>{row.gradeSecured}</span>
        ),
        gradePoints: (
          <span className={`font-semibold ${row.gradeSecured === "F" ? "text-red-600" : "text-gray-700"}`}>
            {row.gradePoints}
          </span>
        ),
        results: resultBadge,
        credits: <span className="text-[#43C17A] font-bold">{row.credits}</span>,
      };
    });
  }, [paginatedGrades]);

  const handleSectionFilterChange = (value: string) => {
    setSelectedSection(value);
    setCurrentPage(1);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "details");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full space-y-6">
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-sm">
        <Image
          src="/college_banner.png"
          alt="College Campus Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="border-[4px] border-[#43C17A] rounded-[18px] bg-black/30 w-16 h-16 flex items-center justify-center text-white font-extrabold text-xl shrink-0">
              SX
            </div>
            <div className="text-white">
              <h2 className="text-lg md:text-2xl font-extrabold tracking-wide leading-tight">
                St. Xavier's College of Excellence
              </h2>
              <p className="text-xs md:text-sm text-green-300 font-medium mt-1">
                Faculty of Science • Department of Applied Physics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
          >
            <ArrowLeft size={24} weight="bold" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#43C17A]">
              Memorandum of Grades
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Previewing parsed data for {semester} - Autumn 2024
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success("Edit mode enabled. You can now edit grades.")}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#43C17A] hover:bg-[#E6FBEA] text-xs md:text-sm font-bold text-[#43C17A] rounded-lg transition-colors bg-white shadow-sm cursor-pointer"
          >
            <NotePencil size={16} />
            <span>Edit Data</span>
          </button>
          <button
            onClick={() => toast.success("Draft saved successfully!")}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#43C17A] hover:bg-[#E6FBEA] text-xs md:text-sm font-bold text-[#43C17A] rounded-lg transition-colors bg-white shadow-sm cursor-pointer"
          >
            <FloppyDisk size={16} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => toast.success("Results published successfully!")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007A48] hover:bg-[#006038] text-xs md:text-sm font-bold text-white rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <PaperPlaneRight size={16} weight="fill" />
            <span>Publish Results</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
            <ResultsDropdown
              options={sectionOptions}
              selectedValue={selectedSection}
              onChange={handleSectionFilterChange}
              align="left"
              icon={<FunnelSimple size={16} />}
            />
            <span className="text-xs md:text-sm font-bold text-gray-700">
              Showing {filteredGrades.length} Students
            </span>
          </div>

          <button
            onClick={() => {
              downloadSamplePDF();
              toast.success("Exporting grades report as PDF...");
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-[#43C17A] hover:bg-[#E6FBEA] rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <DownloadSimple size={16} weight="bold" />
            <span>Export as PDF</span>
          </button>
        </div>

        <div className="px-4">
          <TableComponent
            columns={tableColumns}
            tableData={tableDataFormatted}
            stickyHeader={true}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredGrades.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          roundedBottom="rounded-b-2xl"
        />
      </div>
    </div>
  );
}
