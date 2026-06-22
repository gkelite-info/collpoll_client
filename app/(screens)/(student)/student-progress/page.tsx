"use client";

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import { AttendanceSummaryCard } from "./attendanceSummaryCard";
import { ProfileCard } from "./profileCard";
import { AssignmentsSummaryTable } from "./assignmentsSummaryTable";
import { AttendanceList } from "./attendanceBySubjectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { List, X, CaretRight, User, ArrowLeft } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { getStudentProgressData } from "@/lib/helpers/student/studentProgress/getStudentProgressData";
import { StudentProgressSkeleton } from "./shimmer/studentProgressSkeleton";
import { motion } from "framer-motion";
import MidExams from "../stu_dashboard/midExams";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const Page = () => {
  const [open, setOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const { studentId } = useStudent();
  const [progressData, setProgressData] = useState<Awaited<
    ReturnType<typeof getStudentProgressData>
  > | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "exams" | "results">("progress");
  const [selectedMemo, setSelectedMemo] = useState<string | null>(null);

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
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
    college_sections,
    collegeSemester,
  } = useStudent();

  const semesterLabel = collegeSemester
    ? `Semester ${collegeSemester}`
    : "Semester N/A";
  const isLoading = userLoading || studentLoading || progressLoading;

  const downloadGradesPdf = () => {
    const doc = new jsPDF();

    // Top border line
    doc.setFillColor(67, 193, 122); // #43C17A
    doc.rect(0, 0, 210, 6, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(22, 40, 79); // #16284F
    doc.text("RESULTS", 105, 30, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MEMORANDUM OF GRADES", 105, 42, { align: "center" });

    // Student Specs
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");

    doc.text(`Student ID : ${identifierId ?? "26228975"}`, 14, 55);
    doc.text(`Examination : B.Tech | ${selectedMemo} Semester`, 140, 55);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 40, 79);
    doc.text(fullName ?? "Shravani Reddy", 14, 63);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(collegeBranchCode ?? "COMPUTER SCIENCE AND ENGINEERING (CSE)", 14, 70);

    // Table mapping
    const tableHeaders = ["S.No", "SUBJECT CODE", "SUBJECT TITLE", "Grade Secured", "Grade Point (G)", "Result", "Credits (C)"];
    const rows = [
      ["01", "1577BB", "CRYPTOGRAPHY & NETWORK SECURITY", "B", "6", "P", "3.0"],
      ["02", "1577BB", "DATA MINING", "B", "6", "P", "3.0"],
      ["03", "1577BB", "CLOUD COMPUTING", "B", "6", "P", "3.0"],
      ["04", "1577BB", "SOFTWARE PROCESS & PROJECT MANAGEMENT", "B", "6", "P", "3.0"],
      ["05", "1577BB", "REMOTE SENSING & GIS", "B", "6", "P", "3.0"],
      ["06", "1577BB", "CRYPTOGRAPHY & NETWORK SECURITY LAB", "B", "6", "P", "3.0"],
      ["07", "1577BB", "INDUSTRIAL ORIENTED MINI PROJECT / SUMMER INTERNSHIP", "B", "6", "P", "3.0"],
      ["08", "1577BB", "SEMINAR", "B", "6", "P", "3.0"],
      ["09", "1577BB", "PROJECT STAGE", "B", "6", "P", "3.0"]
    ];

    autoTable(doc, {
      startY: 78,
      head: [tableHeaders],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [22, 40, 79] }, // #16284F
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "center", cellWidth: 28 },
        2: { halign: "left" },
        3: { halign: "center", cellWidth: 24 },
        4: { halign: "center", cellWidth: 28 },
        5: { halign: "center", cellWidth: 20 },
        6: { halign: "center", cellWidth: 20 }
      }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    // Footer Table Data / Summary
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("SUBJECTS REGISTERED: 09     APPEARED: 09     PASSED: 09     TOTAL CREDITS: 21.0", 14, finalY);

    // SGPA Card
    doc.setFillColor(244, 245, 246);
    doc.rect(14, finalY + 6, 182, 10, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, finalY + 6, 182, 10, "D");
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Semester Grade Point Average(SGPA) = 7.0", 18, finalY + 12);

    doc.save(`Memorandum_Of_Grades_${selectedMemo}.pdf`);
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
        {/* Tabs navigation */}
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

                    {/* Semester */}
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
          selectedMemo ? (
            <div className="max-w-4xl mx-auto w-full flex flex-col pb-10">
              {/* Back Button */}
              <button
                onClick={() => setSelectedMemo(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold mb-4 cursor-pointer self-start transition-colors"
              >
                <ArrowLeft size={20} weight="bold" />
                <span>Back to Results</span>
              </button>

              {/* Memorandum Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 flex flex-col gap-6 w-full relative overflow-hidden">
                {/* Decorative border line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#43C17A]"></div>

                {/* Top Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#16284F] text-white flex items-center justify-center font-bold text-lg">
                      C
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold text-[#16284F] tracking-widest">
                    RESULTS
                  </h1>
                  <button
                    onClick={downloadGradesPdf}
                    className="bg-[#43C17A] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#35a868] transition-colors shadow-sm cursor-pointer"
                  >
                    Download PDF
                  </button>
                </div>

                <hr className="border-gray-200 my-2" />

                {/* Student Info Card */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* User Icon Avatar Placeholder */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-xl text-gray-400 shrink-0 shadow-inner">
                    <User size={56} weight="light" />
                  </div>

                  {/* Student Specs */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">Student ID :</span>{" "}
                      <span className="text-gray-800 font-semibold">{identifierId ?? "26228975"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Examination :</span>{" "}
                      <span className="text-gray-800 font-semibold">B.Tech | {selectedMemo} Semester</span>
                    </div>
                    <div className="sm:col-span-2 mt-1">
                      <span className="text-xl font-bold text-[#16284F]">{fullName ?? "Shravani Reddy"}</span>
                    </div>
                    <div className="sm:col-span-2 mt-1 text-gray-600 font-medium uppercase tracking-wide">
                      {collegeBranchCode ?? "COMPUTER SCIENCE AND ENGINEERING (CSE)"}
                    </div>
                  </div>
                </div>

                {/* Memo Title */}
                <h3 className="text-center text-lg sm:text-xl font-bold text-[#16284F] underline tracking-widest mt-4">
                  MEMORANDUM OF GRADES
                </h3>

                {/* Table */}
                <div className="overflow-x-auto mt-2 border border-gray-300 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
                        <th className="py-2.5 px-3 border-r border-gray-300 text-center w-12">S.No</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-center w-28">SUBJECT CODE</th>
                        <th className="py-2.5 px-3 border-r border-gray-300">SUBJECT TITLE</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-center w-24">Grade Secured</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-center w-28">Grade Point (G)</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-center w-20">Result</th>
                        <th className="py-2.5 px-3 text-center w-20">Credits (C)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { code: "1577BB", title: "CRYPTOGRAPHY & NETWORK SECURITY", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "DATA MINING", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "CLOUD COMPUTING", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "SOFTWARE PROCESS & PROJECT MANAGEMENT", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "REMOTE SENSING & GIS", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "CRYPTOGRAPHY & NETWORK SECURITY LAB", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "INDUSTRIAL ORIENTED MINI PROJECT / SUMMER INTERNSHIP", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "SEMINAR", grade: "B", pt: "6", res: "P", cred: "3.0" },
                        { code: "1577BB", title: "PROJECT STAGE", grade: "B", pt: "6", res: "P", cred: "3.0" },
                      ].map((item, index) => (
                        <tr key={index} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-700">
                            {String(index + 1).padStart(2, "0")}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-600">
                            {item.code}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-300 font-semibold text-gray-800">
                            {item.title}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-300 text-center font-bold text-gray-700">
                            {item.grade}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-300 text-center font-mono text-gray-700">
                            {item.pt}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-300 text-center font-bold text-green-600">
                            {item.res}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-gray-700">
                            {item.cred}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold border-t border-gray-300">
                        <td colSpan={3} className="py-2.5 px-4 border-r border-gray-300 text-xs text-gray-700">
                          <span className="mr-4">SUBJECTS REGISTERED : 09</span>
                          <span className="mr-4">APPEARED : 09</span>
                          <span className="mr-4">PASSED : 09</span>
                          <span>TOTAL</span>
                        </td>
                        <td className="border-r border-gray-300"></td>
                        <td className="border-r border-gray-300"></td>
                        <td className="border-r border-gray-300"></td>
                        <td className="py-2.5 px-3 text-center font-mono text-gray-700">21.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SGPA Summary Block */}
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 mt-2">
                  Semester Grade Point Average(SGPA) = 7.0
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
                  <div className="text-left pl-4 sm:pl-8">SEMESTER</div>
                  <div>RELEASE DATE</div>
                  <div>CGPA</div>
                  <div className="text-right pr-4 sm:pr-8">ACTION</div>
                </div>

                {/* Table Rows */}
                {[
                  { sem: "SEM 1", date: "Jan 14, 2026", cgpa: "8.92" },
                  { sem: "SEM 2", date: "Jan 14, 2026", cgpa: "8.92" },
                  { sem: "SEM 3", date: "Jan 14, 2026", cgpa: "8.92" },
                  { sem: "SEM 4", date: "Jan 14, 2026", cgpa: "8.92" },
                  { sem: "SEM 5", date: "Jan 14, 2026", cgpa: "8.92" },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 items-center text-center py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="text-left pl-4 sm:pl-8 text-sm font-bold text-[#007a4b]">
                      {row.sem}
                    </div>
                    <div className="text-sm text-gray-700">
                      {row.date}
                    </div>
                    <div className="flex justify-center">
                      <span className="bg-[#F4F5F6] border border-gray-200 px-2.5 py-0.5 rounded text-xs font-semibold text-gray-600">
                        {row.cgpa}
                      </span>
                    </div>
                    <div className="text-right pr-4 sm:pr-8">
                      <button
                        onClick={() => setSelectedMemo(row.sem)}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#007a4b] hover:text-[#005f3a] transition-colors cursor-pointer"
                      >
                        <span>View Marks Memo</span>
                        <CaretRight size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6">
                <h3 className="text-xl font-bold text-[#282828]">
                  CGPA Performance Trend
                </h3>

                <div className="flex items-end justify-around h-72 border-b border-gray-100 pb-2 w-full max-w-3xl mx-auto px-4">
                  {[
                    { sem: "SEM I", cgpa: "8.2", height: "180px", color: "#CBE5DB" },
                    { sem: "SEM II", cgpa: "8.4", height: "185px", color: "#9BC1B0" },
                    { sem: "SEM III", cgpa: "8.5", height: "187px", color: "#669D85" },
                    { sem: "SEM IV", cgpa: "9.1", height: "200px", color: "#34805C" },
                    { sem: "SEM V", cgpa: "8.9", height: "196px", color: "#045B37" },
                  ].map((bar, idx) => (
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
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 mt-4 tracking-wider">
                        {bar.sem}
                      </span>
                    </div>
                  ))}
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
