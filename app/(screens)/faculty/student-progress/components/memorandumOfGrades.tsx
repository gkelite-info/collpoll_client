"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  SpinnerGap,
} from "@phosphor-icons/react";
import ResultsDropdown from "./resultsDropdown";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { downloadSamplePDF } from "../utils/downloadHelper";
import toast from "react-hot-toast";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { supabase } from "@/lib/supabaseClient";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";

interface StudentGradeRow {
  studentId: string;
  studentName: string;
  subjectCode: string;
  gradeSecured: string;
  gradePoints: number;
  results: "P" | "F" | "-";
  credits: string;
  section: string;
}

export default function MemorandumOfGrades() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const examType = searchParams.get("examType") || "Mid Term";
  const semester = searchParams.get("semester") || "I Semester";
  const subjectParam = searchParams.get("subject") || "N/A";
  const [collegeName, setCollegeName] = useState("St. Xavier's College of Excellence");
  const [bannerUrl, setBannerUrl] = useState("/college_banner.png");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const collegeAbbreviation = useMemo(() => {
    if (!collegeName) return "CO";
    return collegeName
      .split(/\s+/)
      .map(w => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [collegeName]);

  const subtitleText = useMemo(() => {
    if (!semester || semester.toLowerCase() === "general") {
      return `Previewing results data for ${examType}`;
    }
    return `Previewing results data for ${semester} (${examType})`;
  }, [semester, examType]);

  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    college_branch,
    sections: facultySections,
    loading: facultyLoading
  } = useFaculty();

  const branchParam = searchParams.get("branch") || college_branch || "N/A";

  const [gradesList, setGradesList] = useState<StudentGradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dynamically populate section options from facultySections
  const sectionOptions = useMemo(() => {
    const opts = [{ label: "All Sections", value: "all" }];
    const uniqueSections = Array.from(new Set(
      facultySections
        .map(fs => fs.college_sections?.collegeSections)
        .filter(Boolean)
    ));
    uniqueSections.sort().forEach(sec => {
      opts.push({ label: `Section ${sec}`, value: sec! });
    });
    return opts;
  }, [facultySections]);

  useEffect(() => {
    if (facultyLoading) return; // Wait until faculty context is loaded

    if (!collegeId || !collegeEducationId) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        // Resolve college name
        if (collegeId) {
          const { data: colData } = await supabase
            .from("colleges")
            .select("collegeName")
            .eq("collegeId", collegeId)
            .maybeSingle();
          if (colData?.collegeName) {
            setCollegeName(colData.collegeName);
          }

          const { data: mediaData } = await supabase
            .from("college_media")
            .select("bannerUrl, logoUrl")
            .eq("collegeId", collegeId)
            .is("deletedAt", null)
            .maybeSingle();
          if (mediaData) {
            if (mediaData.bannerUrl) setBannerUrl(mediaData.bannerUrl);
            if (mediaData.logoUrl) setLogoUrl(mediaData.logoUrl);
          }
        }
        const sectionId = searchParams.get("sectionId");
        const academicYearId = searchParams.get("academicYearId");
        const semesterIdNum = Number(searchParams.get("semesterId") || 1);
        const subjectName = searchParams.get("subject") || "";
        const scheduleIdParam = searchParams.get("collegeExamScheduleId");
        const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;

        // 1. Resolve subject details (id, code, credits)
        let targetSubjectId = facultySections.find(s => s.faculty_subject?.subjectName === subjectName)?.collegeSubjectId;
        let subjectCode = "";
        let credits = 3.0;

        if (targetSubjectId) {
          const { data: subData } = await supabase
            .from("college_subjects")
            .select("subjectCode, credits")
            .eq("collegeSubjectId", targetSubjectId)
            .is("deletedAt", null)
            .maybeSingle();
          if (subData) {
            subjectCode = subData.subjectCode || "";
            credits = Number(subData.credits) || 3.0;
          }
        } else if (collegeBranchId) {
          const { data: subData } = await supabase
            .from("college_subjects")
            .select("collegeSubjectId, subjectCode, credits")
            .eq("subjectName", subjectName)
            .eq("collegeBranchId", collegeBranchId)
            .is("deletedAt", null)
            .maybeSingle();
          if (subData) {
            targetSubjectId = subData.collegeSubjectId;
            subjectCode = subData.subjectCode || "";
            credits = Number(subData.credits) || 3.0;
          }
        }

        // 2. Fetch students for this section & year
        let students: any[] = [];
        if (sectionId && academicYearId && collegeId) {
          students = await fetchStudentsWithProfile(collegeId, {
            sectionId: Number(sectionId),
            yearId: Number(academicYearId),
          });
        }

        const studentIds = students.map(s => s.id);
        const pinMap = new Map<number, string>();
        const resultsMap = new Map<number, any>();

        if (studentIds.length > 0) {
          // 3. Fetch student pins
          const { data: pinRows, error: pinError } = await supabase
            .from("student_pins")
            .select("studentId, pinNumber")
            .in("studentId", studentIds)
            .eq("collegeId", collegeId)
            .eq("isActive", true)
            .is("deletedAt", null);

          if (!pinError && pinRows) {
            pinRows.forEach(p => {
              if (p.pinNumber) {
                pinMap.set(p.studentId, p.pinNumber.trim());
              }
            });
          }

          // 4. Fetch results
          if (targetSubjectId) {
            let query = supabase
              .from("results")
              .select("*")
              .in("studentId", studentIds)
              .eq("subjectId", targetSubjectId)
              .is("deletedAt", null);

            if (scheduleId) {
              query = query.eq("collegeExamScheduleId", scheduleId);
            } else {
              query = query.eq("collegeSemesterId", semesterIdNum);
            }

            const { data: resultsRows, error: resultsError } = await query;

            if (!resultsError && resultsRows) {
              resultsRows.forEach(r => {
                resultsMap.set(r.studentId, r);
              });
            }
          }
        }

        // 5. Build section map
        const sectionMap = new Map<number, string>();
        facultySections.forEach(fs => {
          if (fs.collegeSectionsId && fs.college_sections?.collegeSections) {
            sectionMap.set(fs.collegeSectionsId, fs.college_sections.collegeSections);
          }
        });

        // 6. Map students to StudentGradeRow
        const getGradePoints = (grade: string): number => {
          const g = grade.toUpperCase().trim();
          switch (g) {
            case "A+": return 10;
            case "A": return 9;
            case "B+": return 8;
            case "B": return 7;
            case "F": return 2;
            default: return 0;
          }
        };

        const isPass = (grade: string): "P" | "F" | "-" => {
          const g = grade.toUpperCase().trim();
          if (!g || g === "N/A") return "-";
          return g === "F" ? "F" : "P";
        };

        const mappedGrades: StudentGradeRow[] = students.map(s => {
          const pin = pinMap.get(s.id) || `STU-${s.id}`;
          const res = resultsMap.get(s.id);
          const historyRow = s.student_academic_history?.[0] || s.student_academic_history;
          const secIdNum = historyRow?.collegeSectionsId;
          const sectionName = secIdNum ? (sectionMap.get(secIdNum) || "") : "";

          const grade = res?.grade || "N/A";
          const gradePoints = getGradePoints(grade);
          const passFail = isPass(grade);

          return {
            studentId: pin,
            studentName: s.name,
            subjectCode: subjectCode || subjectName,
            gradeSecured: grade,
            gradePoints,
            results: passFail,
            credits: credits.toFixed(1),
            section: sectionName,
          };
        });

        setGradesList(mappedGrades);
      } catch (err) {
        console.error("Error loading grades:", err);
        toast.error("Failed to load grades");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [facultyLoading, collegeId, collegeEducationId, collegeBranchId, searchParams, facultySections]);

  const filteredGrades = useMemo(() => {
    let data = gradesList;
    if (selectedSection !== "all") {
      data = data.filter((item) => item.section === selectedSection);
    }
    return data;
  }, [gradesList, selectedSection]);

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
      } else if (row.gradeSecured !== "N/A") {
        gradeColor = "text-blue-700 font-bold";
      }

      const resultBadge =
        row.results === "P" ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
            P
          </span>
        ) : row.results === "F" ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFE0E0] text-[#FF3B30]">
            F
          </span>
        ) : (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
            -
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
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-sm bg-gray-100">
        {loading ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center p-6 md:p-8 z-20">
            <div className="flex items-center gap-4 w-full">
              <div className="w-16 h-16 rounded-[18px] bg-gray-300 shrink-0" />
              <div className="space-y-3 flex-1 max-w-md">
                <div className="h-6 w-3/4 bg-gray-300 rounded" />
                <div className="h-4 w-1/2 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Image
              src={bannerUrl}
              alt="College Campus Banner"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="border-[4px] border-[#43C17A] rounded-[18px] bg-black/30 w-16 h-16 flex items-center justify-center text-white font-extrabold text-xl shrink-0 overflow-hidden relative">
                  {logoUrl && !logoError ? (
                    <Image
                      src={logoUrl}
                      alt="College Logo"
                      fill
                      className="object-contain p-0.5"
                      onError={() => setLogoError(true)}
                      unoptimized
                    />
                  ) : (
                    collegeAbbreviation
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-lg md:text-2xl font-extrabold tracking-wide leading-tight">
                    {collegeName}
                  </h2>
                  <p className="text-xs md:text-sm text-green-300 font-medium mt-1">
                    Faculty of {subjectParam} • Branch of {branchParam}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
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
              {subtitleText}
            </p>
          </div>
        </div>

        {/* <div className="flex items-center gap-2">
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
        </div> */}
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
            {/* <ResultsDropdown
              options={sectionOptions}
              selectedValue={selectedSection}
              onChange={handleSectionFilterChange}
              align="left"
              icon={<FunnelSimple size={16} />}
            /> */}
            <span className="text-xs md:text-sm font-bold text-gray-700">
              Showing {filteredGrades.length} Students
            </span>
          </div>

          {/* <button
            onClick={() => {
              downloadSamplePDF();
              toast.success("Exporting grades report as PDF...");
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-[#43C17A] hover:bg-[#E6FBEA] rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <DownloadSimple size={16} weight="bold" />
            <span>Export as PDF</span>
          </button> */}
        </div>

        <div className="px-4 pb-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-16">
              <SpinnerGap size={36} className="animate-spin text-[#43C17A]" />
              <p className="text-sm font-semibold">Loading memorandum of grades...</p>
            </div>
          ) : (
            <TableComponent
              columns={tableColumns}
              tableData={tableDataFormatted}
              stickyHeader={true}
            />
          )}
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
