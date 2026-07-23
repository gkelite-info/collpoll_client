"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Eye,
  DownloadSimple,
  Clock,
  CheckCircle,
  WarningCircle,
  UploadSimple,
} from "@phosphor-icons/react";
import ResultsDropdown from "./resultsDropdown";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { downloadSamplePDF } from "../utils/downloadHelper";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";

interface UploadHistoryRow {
  id: string;
  examType: string;
  semester: string;
  semesterId: number;
  uploadedOn: string;
  students: number;
  status: "Published" | "Draft";
}

export default function ClassResultDetails() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const year = searchParams.get("year") || "3rd Year";
  const section = searchParams.get("section") || "A";
  const totalStudents = Number(searchParams.get("students")) || 62;
  const branch = searchParams.get("branch") || "CSE";
  const subject = searchParams.get("subject") || "DBMS";

  const [selectedSemester, setSelectedSemester] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const semesterOptions = [
    { label: "All Semesters", value: "all" },
    { label: "I Semester", value: "Semester 1" },
    { label: "II Semester", value: "Semester 2" },
    { label: "III Semester", value: "Semester 3" },
    { label: "IV Semester", value: "Semester 4" },
  ];

  const { sections: facultySections, collegeId, collegeEducationId, collegeBranchId } = useFaculty();
  const [examHistory, setExamHistory] = useState<UploadHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId || !collegeEducationId) {
      setLoading(false);
      return;
    }

    async function loadExamSchedules() {
      setLoading(true);
      try {
        const sectionId = searchParams.get("sectionId");
        const academicYearId = searchParams.get("academicYearId");

        // 1. Fetch exam schedules for college
        const { data: schedules, error: scheduleError } = await supabase
          .from("college_exam_schedules")
          .select("*")
          .eq("collegeId", collegeId)
          .eq("collegeEducationId", collegeEducationId)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (scheduleError) throw scheduleError;

        // 2. Fetch students for this section to count them
        let students: any[] = [];
        if (sectionId && academicYearId && collegeId) {
          const result = await fetchStudentsWithProfile(collegeId, {
            sectionId: Number(sectionId),
            yearId: Number(academicYearId),
            fetchAll: true,
          });
          students = result.data;
        }

        const studentIds = students.map((s: any) => s.studentId);

        // 3. Resolve subjectId
        const subjectName = searchParams.get("subject") || "";
        let targetSubjectId = facultySections.find(s => s.faculty_subject?.subjectName === subjectName)?.collegeSubjectId;
        if (!targetSubjectId && collegeBranchId) {
          const { data: subData } = await supabase
            .from("college_subjects")
            .select("collegeSubjectId")
            .eq("subjectName", subjectName)
            .eq("collegeBranchId", collegeBranchId)
            .is("deletedAt", null)
            .maybeSingle();
          targetSubjectId = subData?.collegeSubjectId;
        }

        // 4. Map schedules to history rows
        const mappedHistory: UploadHistoryRow[] = [];

        for (const s of (schedules || [])) {
          const isSpecificMatch =
            s.collegeBranchId === collegeBranchId &&
            s.academicYear === year &&
            s.collegeSectionsId === Number(sectionId);

          const isGeneralMatch =
            (!s.collegeBranchId) &&
            (!s.academicYear || s.academicYear === "") &&
            (!s.collegeSectionsId);

          if (!isSpecificMatch && !isGeneralMatch) continue;

          const semId = s.collegeSemesterId || Number(searchParams.get("semesterId") || 1);
          let isUploaded = false;

          if (studentIds.length > 0 && targetSubjectId) {
            const { data: results } = await supabase
              .from("results")
              .select("studentId")
              .in("studentId", studentIds)
              .eq("subjectId", targetSubjectId)
              .eq("collegeExamScheduleId", s.collegeExamScheduleId)
              .limit(1);
            isUploaded = !!(results && results.length > 0);
          }

          if (!isUploaded) continue; // Only display uploaded ones!

          let uploadedOn = "-";
          if (studentIds.length > 0 && targetSubjectId) {
            const { data: results } = await supabase
              .from("results")
              .select("createdAt")
              .in("studentId", studentIds)
              .eq("subjectId", targetSubjectId)
              .eq("collegeExamScheduleId", s.collegeExamScheduleId)
              .order("createdAt", { ascending: false })
              .limit(1);
            if (results && results.length > 0 && results[0].createdAt) {
              const d = new Date(results[0].createdAt);
              uploadedOn = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
            }
          }

          mappedHistory.push({
            id: s.collegeExamScheduleId.toString(),
            examType: s.scheduleTitle || s.examType || "Exam",
            semester: s.collegeSemesterId ? `Semester ${s.collegeSemesterId}` : "General",
            semesterId: semId,
            uploadedOn,
            students: students.length || totalStudents,
            status: "Published"
          });
        }


        setExamHistory(mappedHistory);
      } catch (error) {
        console.error("Failed to load exam history:", error);
      } finally {
        setLoading(false);
      }
    }

    loadExamSchedules();
  }, [collegeId, collegeEducationId, collegeBranchId, year, searchParams, facultySections]);

  const filteredHistory = useMemo(() => {
    let data = examHistory;
    if (selectedSemester !== "all") {
      data = data.filter((item) => item.semester === selectedSemester);
    }
    return data;
  }, [examHistory, selectedSemester]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const handleSemesterFilterChange = (value: string) => {
    setSelectedSemester(value);
    setCurrentPage(1);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("year");
    params.delete("section");
    params.delete("students");
    params.delete("branch");
    params.delete("subject");
    params.delete("sectionId");
    params.delete("academicYearId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleUploadResults = (row: UploadHistoryRow) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "upload");
    params.set("semesterId", String(row.semesterId));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleViewResult = (row: UploadHistoryRow) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "grades");
    params.set("examType", row.examType);
    params.set("semester", row.semester);
    params.set("semesterId", String(row.semesterId));
    params.set("collegeExamScheduleId", row.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div>
          <h1 className="text-[#282828] text-2xl font-bold">Class Result Details</h1>
          <p className="text-gray-600 text-sm mt-1">
            View and manage all result uploads for the selected class.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-6">
        <div className="bg-[#E6FBEA] text-[#43C17A] p-4 rounded-full self-start md:self-center mx-auto">
          <GraduationCap size={32} weight="fill" />
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Class Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-1">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Subject</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{subject}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Branch</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{branch}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Year</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{year}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Section</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{section}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Students</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold text-[#43C17A]">
          Previous Uploads History
        </h2>
        {/* <ResultsDropdown
          options={semesterOptions}
          selectedValue={selectedSemester}
          onChange={handleSemesterFilterChange}
        /> */}
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Examination Type
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Uploaded On
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-150">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((row, index) => {
                  const absoluteIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">
                        {absoluteIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-xs md:text-sm font-semibold text-gray-800">
                        {row.examType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-600">
                        {row.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-600">
                        {row.uploadedOn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-600">
                        {row.students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {row.status === "Published" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
                            <CheckCircle size={12} weight="fill" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFFDE6] text-[#E5B800]">
                            <WarningCircle size={12} weight="fill" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewResult(row)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white transition-colors shadow-sm cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>View Result</span>
                          </button>
                          {/* <button
                            onClick={() => {
                              downloadSamplePDF();
                              toast.success("Downloading PDF document...");
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white transition-colors shadow-sm cursor-pointer"
                          >
                            <DownloadSimple size={14} />
                            <span>Download PDF</span>
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No history found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredHistory.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          roundedBottom="rounded-b-2xl"
        />
      </div>

      {/*
      <div className="bg-[#F4FAF6] border border-[#D5EFE0] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          <div className="bg-[#E6FBEA] text-[#43C17A] p-3 rounded-xl">
            <UploadSimple size={24} weight="bold" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-gray-800">Need to update results?</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              You can re-upload new results. The latest published results will be visible to students.
            </p>
          </div>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 border border-[#43C17A] text-[#43C17A] hover:bg-[#E6FBEA] rounded-lg text-xs md:text-sm font-semibold transition-colors bg-white shrink-0">
          Upload New Results
        </button>
      </div>
      */}
    </div>
  );
}
