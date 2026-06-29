"use client";

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import { AttendanceSummaryCard } from "./attendanceSummaryCard";
import { ProfileCard } from "./profileCard";
import { AssignmentsSummaryTable } from "./assignmentsSummaryTable";
import { AttendanceList } from "./attendanceBySubjectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { List, X, CaretRight, User, ArrowLeft, SpinnerGap } from "@phosphor-icons/react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { getStudentProgressData } from "@/lib/helpers/student/studentProgress/getStudentProgressData";
import { StudentProgressSkeleton } from "./shimmer/studentProgressSkeleton";
import { motion } from "framer-motion";
import Image from "next/image";
import MidExams from "../stu_dashboard/midExams";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas-pro";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

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

const Page = () => {
  const [open, setOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const { studentId } = useStudent();
  const [progressData, setProgressData] = useState<Awaited<
    ReturnType<typeof getStudentProgressData>
  > | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "exams" | "results">("progress");
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [collegeName, setCollegeName] = useState("St. Xavier's College of Excellence");
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const targetWidth = 794;
        if (parentWidth < targetWidth) {
          setScale(parentWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [selectedScheduleId]);

  const collegeAbbreviation = useMemo(() => {
    if (!collegeName) return "CO";
    return collegeName
      .split(/\s+/)
      .map(w => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [collegeName]);

  const tabs = [
    { id: "progress", label: "Student Progress" },
    { id: "exams", label: "Exam Enrollment" },
    { id: "results", label: "Results" },
  ];
  const {
    userId,
    fullName,
    profilePhoto,
    identifierId,
    loading: userLoading,
  } = useUser();
  const {
    loading: studentLoading,
    collegeId,
    collegeBranchId,
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
    college_sections,
    collegeSemester,
    collegeBranchType
  } = useStudent();

  const semesterLabel = collegeSemester
    ? `Semester ${collegeSemester}`
    : "Semester N/A";
  const isLoading = userLoading || studentLoading || progressLoading;

  useEffect(() => {
    if (!studentId) return;
    setResultsLoading(true);
    supabase
      .from("results")
      .select(`
        *,
        college_subjects (
          subjectName,
          subjectCode,
          credits
        ),
        college_exam_schedules (
          scheduleTitle,
          examType,
          fromDate,
          toDate
        )
      `)
      .eq("studentId", studentId)
      .is("deletedAt", null)
      .then(({ data, error }) => {
        if (!error && data) {
          setStudentResults(data);
        }
        setResultsLoading(false);
      });
  }, [studentId]);

  useEffect(() => {
    if (!collegeId) return;
    supabase
      .from("colleges")
      .select("collegeName")
      .eq("collegeId", collegeId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.collegeName) {
          setCollegeName(data.collegeName);
        }
      });
  }, [collegeId]);

  const schedulesWithResults = useMemo(() => {
    const schedMap = new Map<number, {
      scheduleId: number;
      scheduleTitle: string;
      semesterNum: number;
      date: string;
      sgpa: string;
      rawSemester: number;
    }>();

    studentResults.forEach(r => {
      const schedId = r.collegeExamScheduleId;
      if (schedId === null || schedId === undefined) return;

      let title = r.college_exam_schedules?.scheduleTitle || `Exam Schedule #${schedId}`;
      if (
        title === "Degree_Mid_English_–_I_results.xlsx" ||
        title === "Degree_Mid_English_-_I_results.xlsx" ||
        title.includes("Degree_Mid_English")
      ) {
        title = "Results.xlsx";
      }

      const semNum = r.collegeSemesterId || 0;

      if (!schedMap.has(schedId)) {
        const resultDate = r.updatedAt ? new Date(r.updatedAt) : new Date();
        const dateStr = `${resultDate.toLocaleString('default', { month: 'short' })} ${resultDate.getDate()}, ${resultDate.getFullYear()}`;

        schedMap.set(schedId, {
          scheduleId: schedId,
          scheduleTitle: title,
          semesterNum: semNum,
          date: dateStr,
          sgpa: "0.00",
          rawSemester: semNum
        });
      } else {
        const existing = schedMap.get(schedId)!;
        const currentUpdated = r.updatedAt ? new Date(r.updatedAt) : new Date();
        const existingDate = new Date(existing.date);
        if (currentUpdated > existingDate) {
          const dateStr = `${currentUpdated.toLocaleString('default', { month: 'short' })} ${currentUpdated.getDate()}, ${currentUpdated.getFullYear()}`;
          existing.date = dateStr;
        }
      }
    });

    const list = Array.from(schedMap.values());
    list.forEach(item => {
      const schedId = item.scheduleId;
      const schedResults = studentResults.filter(r => r.collegeExamScheduleId === schedId);
      let totalPoints = 0;
      let totalCredits = 0;
      schedResults.forEach(r => {
        const grade = r.grade || "";
        const credits = Number(r.college_subjects?.credits) || 3.0;
        totalPoints += getGradePoints(grade) * credits;
        totalCredits += credits;
      });
      item.sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    });

    list.sort((a, b) => {
      if (a.rawSemester !== b.rawSemester) {
        return a.rawSemester - b.rawSemester;
      }
      return a.scheduleId - b.scheduleId;
    });
    return list;
  }, [studentResults]);

  const selectedScheduleTitle = useMemo(() => {
    if (selectedScheduleId === null) return "";
    const found = schedulesWithResults.find(s => s.scheduleId === selectedScheduleId);
    return found ? found.scheduleTitle : `Exam Schedule #${selectedScheduleId}`;
  }, [schedulesWithResults, selectedScheduleId]);

  const selectedScheduleSemesterNum = useMemo(() => {
    if (selectedScheduleId === null) return null;
    const found = schedulesWithResults.find(s => s.scheduleId === selectedScheduleId);
    return found ? found.semesterNum : null;
  }, [schedulesWithResults, selectedScheduleId]);

  const memoRows = useMemo(() => {
    if (selectedScheduleId === null) return [];

    return studentResults
      .filter((r) => r.collegeExamScheduleId === selectedScheduleId)
      .map((r, index) => {
        const code = r.college_subjects?.subjectCode || "N/A";
        const title = r.college_subjects?.subjectName || "N/A";
        const internal = r.internalMarks !== null && r.internalMarks !== undefined ? r.internalMarks : "-";
        const external = r.externalMarks !== null && r.externalMarks !== undefined ? r.externalMarks : "-";
        const total = r.total !== null && r.total !== undefined ? r.total : "-";
        const grade = r.grade || "N/A";
        const res = grade.toUpperCase().trim() === "F" ? "F" : "P";
        const cred = r.college_subjects?.credits !== null && r.college_subjects?.credits !== undefined
          ? Number(r.college_subjects.credits).toFixed(1)
          : "3.0";

        return {
          sNo: String(index + 1).padStart(2, "0"),
          code,
          title,
          internal,
          external,
          total,
          grade,
          res,
          cred
        };
      });
  }, [studentResults, selectedScheduleId]);

  const memoSummary = useMemo(() => {
    if (memoRows.length === 0) {
      return { registered: 0, appeared: 0, passed: 0, totalCredits: "0.0", sgpa: "0.00" };
    }
    const registered = memoRows.length;
    const appeared = memoRows.length;
    const passed = memoRows.filter((r) => r.res === "P").length;
    const totalCreditsVal = memoRows.reduce((acc, r) => acc + Number(r.cred), 0);

    let totalPoints = 0;
    memoRows.forEach(r => {
      totalPoints += getGradePoints(r.grade) * Number(r.cred);
    });
    const sgpaVal = totalCreditsVal > 0 ? (totalPoints / totalCreditsVal).toFixed(2) : "0.00";

    return {
      registered,
      appeared,
      passed,
      totalCredits: totalCreditsVal.toFixed(1),
      sgpa: sgpaVal
    };
  }, [memoRows]);

  const trendBars = useMemo(() => {
    const colors = ["#CBE5DB", "#9BC1B0", "#669D85", "#34805C", "#045B37"];
    return schedulesWithResults.map((item, idx) => {
      const gpa = Number(item.sgpa);
      const height = `${(gpa / 10) * 200}px`;
      return {
        sem: item.scheduleTitle,
        cgpa: item.sgpa,
        height,
        color: colors[idx % colors.length]
      };
    });
  }, [schedulesWithResults]);

  const downloadGradesPdf = async () => {
    try {
      const element = printRef.current;
      if (!element) return;

      const clone = element.cloneNode(true) as HTMLDivElement;

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = "0";
      wrapper.style.left = "0";
      wrapper.style.width = "794px";
      wrapper.style.height = "1123px";
      wrapper.style.zIndex = "-9999";
      wrapper.style.overflow = "hidden";
      wrapper.style.pointerEvents = "none";

      clone.style.width = "794px";
      clone.style.height = "1123px";
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.padding = "0";

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0,
      });

      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`Memorandum_Of_Grades_${selectedScheduleTitle.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  useEffect(() => {
    if (userLoading || studentLoading) return;
    if (!userId) {
      setProgressLoading(false);
      return;
    }

    const safeUserId = userId;
    let mounted = true;

    async function loadProgressData() {
      setProgressLoading(true);

      try {
        const data = await getStudentProgressData(safeUserId);
        if (mounted) {
          setProgressData(data);
        }
      } catch (err: any) {
        console.error("Error loading progress data:", err);
        toast.error(`Error loading progress: ${err?.message || err}`);
      } finally {
        if (mounted) {
          setProgressLoading(false);
        }
      }
    }

    loadProgressData();

    return () => {
      mounted = false;
    };
  }, [userId, userLoading, studentLoading]);

  if (isLoading) {
    return <StudentProgressSkeleton />;
  }

  return (
    <>
      <main className="p-3 max-md:p-2 max-md:pb-7 max-md:bg-[#f4f5f6] relative overflow-hidden min-h-screen">
        <div className="flex mx-auto mb-5 justify-center">
          <div className="relative flex items-center bg-gray-100 p-1.5 rounded-full shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative cursor-pointer px-6 py-2 text-sm font-semibold z-10 transition-colors duration-200 ${activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="student-progress-tab-pill"
                    className="absolute shadow-[0_2px_8px_rgba(16,185,129,0.4)] inset-0 rounded-full -z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "progress" && (
          <>
            <section className="mb-3 max-md:mb-2">
              <div className="flex p-2 gap-3 justify-between items-center max-md:p-1 max-md:gap-2 w-full ">
                <div className="flex-1 max-w-5xl rounded-xl min-w-0 max-md:mr-2">
                  <div className="flex gap-3 max-md:gap-2 max-md:items-center max-md:overflow-x-auto scrollbar-hide max-md:pb-1">
                    <div className="max-md:shrink-0">
                      <span className="text-gray-600 text-lg font-medium max-md:text-[13px]">
                        {collegeEducationType === "Inter" ? "Group" : "Branch"}{" "}
                        :
                      </span>
                      <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide lg:ml-1 max-md:px-2 max-md:py-0.5 max-md:text-[11px] max-md:ml-1">
                        {collegeBranchCode ?? "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 max-md:gap-1 max-md:shrink-0">
                      <span className="text-gray-600 text-lg font-medium max-md:text-[13px] max-md:ml-1">
                        Year :
                      </span>
                      <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide max-md:px-2 max-md:py-0.5 max-md:text-[11px]">
                        {collegeAcademicYear ?? "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 max-md:shrink-0">
                      <span className="text-gray-600 text-lg font-medium max-md:text-[13px] max-md:ml-1">
                        Section:
                      </span>
                      <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide max-md:px-2 max-md:py-0.5 max-md:text-[11px]">
                        {college_sections ?? "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 max-md:shrink-0">
                      <span className="text-gray-600 text-lg font-medium max-md:text-[13px] max-md:ml-1">
                        Semester:
                      </span>
                      <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide max-md:px-2 max-md:py-0.5 max-md:text-[11px]">
                        {collegeSemester ?? "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className=" justify-end w-[32%] hidden lg:flex">
                  <CourseScheduleCard style="w-[320px]" />
                </div>

                <div
                  className="w-12 h-12 aspect-square rounded-full bg-[#43C17A1A] flex items-center justify-center cursor-pointer max-md:w-8 max-md:h-8 max-md:shrink-0"
                  onClick={() => setOpen(true)}
                >
                  <List
                    size={26}
                    weight="bold"
                    className="text-gray-700 max-md:w-[18px] max-md:h-[18px]"
                  />
                </div>
              </div>
            </section>

            <section className="bg-gray-100 max-md:bg-transparent grid-rows-[300px_300px] flex flex-col gap-6 max-md:gap-4">
              <article className="grid grid-cols-1 lg:grid-cols-10 gap-6 max-md:gap-4">
                <section className="bg-white rounded-2xl shadow-sm lg:col-span-6">
                  <ProfileCard
                    name={fullName ?? "Student"}
                    department={collegeBranchCode ?? "N/A"}
                    studentId={identifierId ?? "N/A"}
                    avatarUrl={
                      profilePhoto
                    }
                    attendancePercentage={
                      progressData?.overallAttendancePercentage ?? 0
                    }
                    attendanceCount={progressData?.attendedCount ?? 0}
                    absentCount={progressData?.absentCount ?? 0}
                    leaveCount={progressData?.leaveCount ?? 0}
                  />
                </section>

                <section className="bg-white rounded-2xl shadow-sm p-4 lg:col-span-4 max-md:p-3">
                  <AttendanceSummaryCard
                    percentage={progressData?.overallAttendancePercentage ?? 0}
                  />
                </section>

                <section className="bg-white rounded-2xl lg:col-span-6">
                  <AcademicPerformance
                    studentId={studentId}
                  />
                </section>

                <section className="bg-white rounded-2xl lg:col-span-4 shadow-md">
                  <AttendanceList data={progressData?.subjectAttendance || []} />
                </section>
              </article>

              <section className="bg-white rounded-2xl max-md:bg-transparent max-md:rounded-none">
                <AssignmentsSummaryTable
                  rows={progressData?.subjectProgressRows ?? []}
                  semesterLabel={semesterLabel}
                />
              </section>
            </section>

            {open && (
              <div className="fixed inset-0 z-50">
                <div
                  className="absolute inset-0 bg-black/10"
                  onClick={() => setOpen(false)}
                />

                <div className="absolute top-35 right-9 max-md:top-14 max-md:right-4">
                  <div className="bg-white rounded-xl shadow-lg min-w-[220px] border border-gray-200">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <span className="text-sm font-semibold text-gray-800">
                        Previous Sem Marks
                      </span>
                      <button onClick={() => setOpen(false)}>
                        <X
                          size={18}
                          weight="bold"
                          className="text-gray-600 cursor-pointer"
                        />
                      </button>
                    </div>

                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl">
                      Enrollment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "exams" && (
          <div className="max-w-5xl mx-auto w-full">
            <MidExams onBack={() => setActiveTab("progress")} />
          </div>
        )}

        {activeTab === "results" && (
          selectedScheduleId !== null ? (
            <div className="max-w-4xl mx-auto w-full flex flex-col pb-10">
              {/* Back Button and Download PDF Row */}
              <div className="flex items-center justify-between mb-4 w-full px-2">
                <button
                  onClick={() => setSelectedScheduleId(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold cursor-pointer transition-colors"
                >
                  <ArrowLeft size={20} weight="bold" />
                  <span>Back to Results</span>
                </button>
                <button
                  onClick={downloadGradesPdf}
                  className="bg-[#43C17A] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#35a868] transition-colors shadow-sm cursor-pointer"
                >
                  Download PDF
                </button>
              </div>

              {/* Wrapper container that scales the A4 page container */}
              <div
                ref={containerRef}
                className="w-full flex justify-center overflow-hidden py-6 bg-gray-150/40 rounded-2xl border border-gray-200/50"
              >
                <div
                  style={{
                    width: "794px",
                    height: "1123px",
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                    marginBottom: `${(scale - 1) * 1123}px`
                  }}
                  className="shrink-0 transition-transform duration-200"
                >
                  {/* Memorandum Card */}
                  <div
                    ref={printRef}
                    style={{
                      width: "794px",
                      height: "1123px",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      boxSizing: "border-box",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-200 relative overflow-hidden flex flex-col gap-6 box-border"
                  >
                    {/* Banner */}
                    <div
                      style={{
                        backgroundImage: "url('/college_banner.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        width: "100%",
                        height: "224px",
                        position: "relative",
                        flexShrink: 0
                      }}
                      className="w-full h-56 shrink-0 relative"
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%)",
                          display: "flex",
                          alignItems: "center",
                          padding: "24px"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-6 md:p-8"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px"
                          }}
                          className="flex items-center gap-4"
                        >
                          <div
                            style={{
                              border: "4px solid #43C17A",
                              borderRadius: "18px",
                              backgroundColor: "rgba(0, 0, 0, 0.3)",
                              width: "64px",
                              height: "64px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              fontWeight: 800,
                              fontSize: "20px",
                              flexShrink: 0
                            }}
                            className="border-[4px] border-[#43C17A] rounded-[18px] bg-black/30 w-16 h-16 flex items-center justify-center text-white font-extrabold text-xl shrink-0"
                          >
                            {collegeAbbreviation}
                          </div>
                          <div
                            style={{
                              color: "#ffffff"
                            }}
                            className="text-white"
                          >
                            <h2
                              style={{
                                fontSize: "24px",
                                fontWeight: 800,
                                letterSpacing: "0.025em",
                                lineHeight: 1.25
                              }}
                              className="text-lg md:text-2xl font-extrabold tracking-wide leading-tight"
                            >
                              {collegeName}
                            </h2>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "#86efac",
                                fontWeight: 500,
                                marginTop: "4px"
                              }}
                              className="text-xs md:text-sm text-green-300 font-medium mt-1"
                            >
                              Branch of {collegeBranchType ?? "BSC"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div
                      style={{
                        paddingLeft: "10mm",
                        paddingRight: "10mm",
                        paddingBottom: "15mm",
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        width: "100%",
                        flex: 1
                      }}
                      className="px-[10mm] pb-[15mm] flex flex-col gap-6 w-full flex-1"
                    >
                      {/* Results Text */}
                      <h1
                        style={{
                          fontSize: "30px",
                          fontWeight: 800,
                          color: "#16284F",
                          letterSpacing: "0.1em",
                          textAlign: "center"
                        }}
                        className="text-3xl font-extrabold text-[#16284F] tracking-widest text-center"
                      >
                        RESULTS
                      </h1>

                      {/* Student Info Card */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "24px",
                          alignItems: "flex-start"
                        }}
                        className="flex flex-col md:flex-row gap-6 items-start"
                      >
                        {/* User Icon Avatar Placeholder */}
                        <div
                          style={{
                            width: "112px",
                            height: "112px",
                            backgroundColor: "#f3f4f6",
                            border: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "12px",
                            color: "#9ca3af",
                            flexShrink: 0,
                            overflow: "hidden"
                          }}
                          className="w-28 h-28 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-xl text-gray-400 shrink-0 shadow-inner overflow-hidden"
                        >
                          {profilePhoto ? (
                            <img
                              src={profilePhoto}
                              alt="Student Avatar"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={56} weight="light" />
                          )}
                        </div>

                        {/* Student Specs */}
                        <div
                          style={{
                            flex: 1,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            rowGap: "8px",
                            columnGap: "16px",
                            fontSize: "14px"
                          }}
                          className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm"
                        >
                          <div>
                            <span style={{ color: "#6b7280", fontWeight: 500 }} className="text-gray-500 font-medium">Student ID :</span>{" "}
                            <span style={{ color: "#1f2937", fontWeight: 600 }} className="text-gray-800 font-semibold">{identifierId ?? "26228975"}</span>
                          </div>
                          <div>
                            <span style={{ color: "#6b7280", fontWeight: 500 }} className="text-gray-500 font-medium">Examination :</span>{" "}
                            <span style={{ color: "#1f2937", fontWeight: 600 }} className="text-gray-800 font-semibold">
                              {collegeEducationType ?? "Degree"}{" "}
                              {selectedScheduleSemesterNum ? `| ${selectedScheduleTitle} (Sem ${selectedScheduleSemesterNum})` : `| ${selectedScheduleTitle}`}
                            </span>
                          </div>
                          <div style={{ gridColumn: "span 2", marginTop: "4px" }} className="sm:col-span-2 mt-1">
                            <span style={{ fontSize: "20px", fontWeight: 700, color: "#16284F" }} className="text-xl font-bold text-[#16284F]">{fullName ?? "Shravani Reddy"}</span>
                          </div>
                          <div style={{ gridColumn: "span 2", marginTop: "4px", color: "#4b5563", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.025em" }} className="sm:col-span-2 mt-1 text-gray-600 font-medium uppercase tracking-wide">
                            {collegeBranchCode ?? "COMPUTER SCIENCE AND ENGINEERING (CSE)"}
                          </div>
                        </div>
                      </div>

                      {/* Memo Title */}
                      <h3
                        style={{
                          textAlign: "center",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#16284F",
                          textDecorationLine: "underline",
                          letterSpacing: "0.1em",
                          marginTop: "16px"
                        }}
                        className="text-center text-lg sm:text-xl font-bold text-[#16284F] underline tracking-widest mt-4"
                      >
                        MEMORANDUM OF GRADES
                      </h3>
                      {/* Table */}
                      <div
                        style={{
                          marginTop: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          overflow: "hidden"
                        }}
                        className="overflow-x-auto mt-2 border border-gray-300 rounded-lg"
                      >
                        <table
                          style={{
                            width: "100%",
                            textAlign: "left",
                            borderCollapse: "collapse",
                            fontSize: "12px"
                          }}
                          className="w-full text-left border-collapse text-xs sm:text-sm"
                        >
                          <thead>
                            <tr
                              style={{
                                backgroundColor: "#f9fafb",
                                color: "#374151",
                                fontWeight: 600,
                                borderBottom: "1px solid #d1d5db"
                              }}
                              className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300"
                            >
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "40px" }} className="py-2.5 px-3 border-r border-gray-300 text-center w-10">S.No</th>
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "112px" }} className="py-2.5 px-3 border-r border-gray-300 text-center w-28">SUBJECT CODE</th>
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db" }} className="py-2.5 px-3 border-r border-gray-300">SUBJECT TITLE</th>
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "80px" }} className="py-2.5 px-3 border-r border-gray-300 text-center w-20">INTERNAL</th>
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "80px" }} className="py-2.5 px-3 border-r border-gray-300 text-center w-20">EXTERNAL</th>
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "80px" }} className="py-2.5 px-3 border-r border-gray-300 text-center w-20">TOTAL</th>
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "96px" }} className="py-2.5 px-3 border-r border-gray-300 text-center w-24">Grade Secured</th>
                              <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "80px" }} className="py-2.5 px-3 border-r border-gray-300 text-center w-20">Result</th>
                              <th style={{ padding: "10px 12px", textAlign: "center", width: "80px" }} className="py-2.5 px-3 text-center w-20">Credits (C)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {memoRows.map((item, index) => (
                              <tr
                                key={index}
                                style={{
                                  borderBottom: "1px solid #d1d5db",
                                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb"
                                }}
                                className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50/50"
                              >
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-700">
                                  {item.sNo}
                                </td>
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#4b5563" }} className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-600">
                                  {item.code}
                                </td>
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", fontWeight: 600, color: "#1f2937" }} className="py-2.5 px-3 border-r border-gray-300 font-semibold text-gray-800">
                                  {item.title}
                                </td>
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-700">
                                  {item.internal}
                                </td>
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-700">
                                  {item.external}
                                </td>
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-700">
                                  {item.total}
                                </td>
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontWeight: 700, color: "#374151" }} className="py-2.5 px-3 border-r border-gray-300 text-center font-bold text-gray-700">
                                  {item.grade}
                                </td>
                                <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontWeight: 700, color: item.res === "P" ? "#16a34a" : "#dc2626" }} className={`py-2.5 px-3 border-r border-gray-300 text-center font-bold ${item.res === "P" ? "text-green-600" : "text-red-600"}`}>
                                  {item.res}
                                </td>
                                <td style={{ padding: "10px 12px", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-3 text-center font-mono text-gray-700">
                                  {item.cred}
                                </td>
                              </tr>
                            ))}
                            <tr
                              style={{
                                backgroundColor: "#f9fafb",
                                fontWeight: 600,
                                borderTop: "1px solid #d1d5db"
                              }}
                              className="bg-gray-50 font-semibold border-t border-gray-300"
                            >
                              <td colSpan={3} style={{ padding: "12px 16px", borderRight: "1px solid #d1d5db", fontSize: "12px", color: "#374151" }} className="py-3 px-4 border-r border-gray-300 text-xs text-gray-700">
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", fontWeight: "bold" }}>
                                  <div>SUBJECTS REGISTERED : {String(memoSummary.registered).padStart(2, '0')}</div>
                                  <div>APPEARED : {String(memoSummary.appeared).padStart(2, '0')}</div>
                                  <div>PASSED : {String(memoSummary.passed).padStart(2, '0')}</div>
                                </div>
                              </td>
                              <td style={{ borderRight: "1px solid #d1d5db" }} className="border-r border-gray-300"></td>
                              <td style={{ borderRight: "1px solid #d1d5db" }} className="border-r border-gray-300"></td>
                              <td style={{ borderRight: "1px solid #d1d5db" }} className="border-r border-gray-300"></td>
                              <td style={{ borderRight: "1px solid #d1d5db" }} className="border-r border-gray-300"></td>
                              <td style={{ borderRight: "1px solid #d1d5db", textAlign: "right", paddingRight: "8px", fontSize: "12px", fontWeight: "bold", color: "#6b7280" }} className="border-r border-gray-300 text-right pr-2 text-xs font-bold text-gray-500">
                                TOTAL CREDITS:
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "center", fontFamily: "monospace", fontWeight: "bold", color: "#374151" }} className="py-2.5 px-3 text-center font-mono font-bold text-gray-700">
                                {memoSummary.totalCredits}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* SGPA Summary Block */}
                      <div
                        style={{
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "12px",
                          backgroundColor: "#f9fafb",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#374151",
                          marginTop: "8px"
                        }}
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 mt-2"
                      >
                        Semester Grade Point Average(SGPA) = {memoSummary.sgpa}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-10">
              {/* Header */}
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-2xl font-bold text-[#282828]">
                  My Results
                </h2>
                <p className="text-xs text-gray-500 font-semibold tracking-wide">
                  Academic Performance record for student ID : {identifierId ?? "2021BCS044"}
                </p>
              </div>

              {/* Results Table Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-6">
                {/* Table Header */}
                <div className="grid grid-cols-4 items-center text-center py-3 border-b border-gray-100 text-[10px] sm:text-xs font-bold text-gray-400 tracking-wider">
                  <div className="text-left pl-4 sm:pl-8">EXAM SCHEDULE</div>
                  <div>RELEASE DATE</div>
                  <div>SGPA</div>
                  <div className="text-right pr-4 sm:pr-8">ACTION</div>
                </div>

                {/* Table Rows */}
                {resultsLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-10">
                    <SpinnerGap size={24} className="animate-spin text-[#007a4b]" />
                    <p className="text-xs font-semibold">Loading results...</p>
                  </div>
                ) : schedulesWithResults.length > 0 ? (
                  schedulesWithResults.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-4 items-center text-center py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="text-left pl-4 sm:pl-8 flex flex-col items-start min-w-0">
                        <span className="text-sm font-bold text-[#007a4b] break-words line-clamp-2 max-w-full">
                          {row.scheduleTitle}
                        </span>
                        {row.semesterNum > 0 && (
                          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            Semester {row.semesterNum}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        {row.date}
                      </div>
                      <div className="flex justify-center">
                        <span className="bg-[#F4F5F6] border border-gray-200 px-2.5 py-0.5 rounded text-xs font-semibold text-gray-600">
                          {row.sgpa}
                        </span>
                      </div>
                      <div className="text-right pr-4 sm:pr-8">
                        <button
                          onClick={() => setSelectedScheduleId(row.scheduleId)}
                          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#007a4b] hover:text-[#005f3a] transition-colors cursor-pointer"
                        >
                          <span>View Marks Memo</span>
                          <CaretRight size={14} weight="bold" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-10 text-xs sm:text-sm">
                    No results have been uploaded yet.
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6">
                <h3 className="text-xl font-bold text-[#282828]">
                  SGPA Performance Trend
                </h3>

                <div className="flex items-end justify-around h-72 border-b border-gray-100 pb-2 w-full max-w-3xl mx-auto px-4">
                  {trendBars.length > 0 ? (
                    trendBars.map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-end h-full w-16 sm:w-20">
                        <span className="text-xs sm:text-sm font-mono text-gray-400 mb-2">
                          {bar.cgpa}
                        </span>
                        <div
                          className="w-10 sm:w-14 rounded-t-lg transition-all duration-300 shadow-sm hover:shadow"
                          style={{
                            height: bar.height,
                            backgroundColor: bar.color,
                          }}
                        />
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 mt-4 text-center truncate max-w-full" title={bar.sem}>
                          {bar.sem}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-20 text-xs sm:text-sm">
                      No performance data available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </>
  );
};

export default Page;
