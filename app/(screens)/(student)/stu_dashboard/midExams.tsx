"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import TableComponent from "@/app/utils/table/table";
import { X, User, CaretLeftIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useUser } from "@/app/utils/context/UserContext";
import { useStudent } from "@/app/utils/context/student/useStudent";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { supabase } from "@/lib/supabaseClient";
import { getStudentProgressData } from "@/lib/helpers/student/studentProgress/getStudentProgressData";
import toast from "react-hot-toast";
import Image from "next/image";

type MidExamsProps = {
  onBack: () => void;
};

type ExamSchedule = {
  collegeExamScheduleId: number;
  scheduleTitle: string;
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number | null;
  academicYear: string | null;
  collegeSectionsId: number | null;
  collegeSemesterId: number | null;
  examType: string;
  fromDate: string | null;
  toDate: string | null;
  isActive: boolean;
};

type ExamSubject = {
  collegeExamScheduleSubjectId: number;
  collegeExamScheduleId: number;
  subjectName: string;
  examDate: string;
  time: string;
  status: string;
};

export default function MidExams({ onBack }: MidExamsProps) {
  const t = useTranslations("Dashboard.student");
  const { identifierId, fullName, profilePhoto } = useUser();
  const {
    userId,
    studentId,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeAcademicYear,
    collegeSemesterId,
    collegeSectionsId,
    subjects,
    collegeBranchCode,
    collegeBranchType,
    collegeEducationType,
  } = useStudent();

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [scheduleSubjects, setScheduleSubjects] = useState<ExamSubject[]>([]);
  const [collegeSubjectsList, setCollegeSubjectsList] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({});
  const [overallAttendance, setOverallAttendance] = useState<number>(0);
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [viewingHallTicket, setViewingHallTicket] = useState(false);

  const [scale, setScale] = useState(1);
  const [collegeName, setCollegeName] = useState("St. Xavier's College of Excellence");
  const [bannerUrl, setBannerUrl] = useState("/college_banner.png");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

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
  }, [viewingHallTicket]);

  useEffect(() => {
    if (!collegeId) return;
    setMediaLoading(true);

    Promise.all([
      supabase.from("colleges").select("collegeName").eq("collegeId", collegeId).maybeSingle(),
      supabase.from("college_media").select("bannerUrl, logoUrl").eq("collegeId", collegeId).is("deletedAt", null).maybeSingle()
    ]).then(([collegeRes, mediaRes]) => {
      if (collegeRes.data?.collegeName) {
        setCollegeName(collegeRes.data.collegeName);
      }
      if (!mediaRes.error && mediaRes.data) {
        if (mediaRes.data.bannerUrl) setBannerUrl(mediaRes.data.bannerUrl);
        if (mediaRes.data.logoUrl) setLogoUrl(mediaRes.data.logoUrl);
      }
      setMediaLoading(false);
    });
  }, [collegeId]);

  const collegeAbbreviation = useMemo(() => {
    if (!collegeName) return "CO";
    return collegeName
      .split(/\s+/)
      .map(w => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [collegeName]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId || !userId) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);

        const { data: scheduleData, error: scheduleError } = await supabase
          .from("college_exam_schedules")
          .select("*")
          .eq("collegeId", collegeId)
          .eq("collegeEducationId", collegeEducationId)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (scheduleError) throw scheduleError;

        const filtered = (scheduleData || []).filter((s) => {
          if (s.collegeBranchId && s.collegeBranchId !== collegeBranchId) return false;
          if (s.academicYear && s.academicYear !== collegeAcademicYear) return false;
          if (s.collegeSemesterId && s.collegeSemesterId !== collegeSemesterId) return false;
          if (s.collegeSectionsId && s.collegeSectionsId !== collegeSectionsId) return false;
          return true;
        });

        setSchedules(filtered);

        const progress = await getStudentProgressData(userId);
        const attStats: Record<string, number> = {};
        progress.subjectProgressRows?.forEach((row: any) => {
          attStats[row.subject.trim().toLowerCase()] = parseInt(row.attendance) || 0;
        });
        setAttendanceMap(attStats);
        setOverallAttendance(progress.overallAttendancePercentage || 0);

      } catch (err) {
        console.error("Failed to load initial exams data", err);
        toast.error("Failed to load exams list.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [collegeId, collegeEducationId, collegeBranchId, collegeAcademicYear, collegeSemesterId, collegeSectionsId, userId]);

  useEffect(() => {
    if (!selectedSchedule || !studentId) return;

    const loadEnrollmentDetails = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("college_subjects")
          .select("*")
          .eq("collegeId", collegeId)
          .eq("collegeEducationId", collegeEducationId)
          .eq("collegeBranchId", collegeBranchId)
          .eq("collegeAcademicYearId", collegeAcademicYearId)
          .is("deletedAt", null);

        if (collegeSemesterId) {
          query = query.eq("collegeSemesterId", collegeSemesterId);
        } else {
          query = query.is("collegeSemesterId", null);
        }

        const { data: subjectData, error: subjectError } = await query;

        if (subjectError) throw subjectError;
        setCollegeSubjectsList(subjectData || []);

        const { data: scheduleSubData, error: scheduleSubError } = await supabase
          .from("college_exam_schedule_subjects")
          .select("*")
          .eq("collegeExamScheduleId", selectedSchedule.collegeExamScheduleId)
          .is("deletedAt", null);

        if (scheduleSubError) throw scheduleSubError;
        setScheduleSubjects(scheduleSubData || []);

        const { data: enrollmentRows, error: enrollmentError } = await supabase
          .from("student_exam_enrollments")
          .select("subjectName")
          .eq("studentId", studentId)
          .eq("collegeExamScheduleId", selectedSchedule.collegeExamScheduleId)
          .is("deletedAt", null);

        if (enrollmentError) throw enrollmentError;

        const enrolled = (enrollmentRows || []).map((r) => r.subjectName.trim().toLowerCase());
        setEnrolledSubjects(enrolled);

      } catch (err: any) {
        console.error("Failed to load exam subjects/enrollment", err);
        toast.error("Failed to load exam details: " + (err?.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadEnrollmentDetails();
  }, [selectedSchedule, studentId, collegeId, collegeEducationId, collegeBranchId, collegeAcademicYearId, collegeSemesterId]);

  const confirmEnrollment = async () => {
    if (!studentId || !selectedSchedule || !selectedSubject) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("student_exam_enrollments")
        .insert({
          studentId,
          collegeExamScheduleId: selectedSchedule.collegeExamScheduleId,
          subjectName: selectedSubject.subjectName,
          collegeSemesterId: collegeSemesterId,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Successfully enrolled in " + selectedSubject.subjectName);
      setEnrolledSubjects((prev) => [...prev, selectedSubject.subjectName.trim().toLowerCase()]);
      setShowConfirmModal(false);
      setSelectedSubject(null);
    } catch (err) {
      console.error("Failed to enroll in exam subject", err);
      toast.error("Enrollment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadHallTicketPdf = async () => {
    if (!selectedSchedule) return;

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
      pdf.save(`${selectedSchedule.scheduleTitle.replace(/\s+/g, "_")}_Hall_Ticket.pdf`);
      toast.success("Hall Ticket downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const isScheduleExpired = useMemo(() => {
    if (!selectedSchedule?.toDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const toDateObj = new Date(selectedSchedule.toDate);
    toDateObj.setHours(0, 0, 0, 0);
    return toDateObj.getTime() < today.getTime();
  }, [selectedSchedule]);

  const columns = [
    { title: t("Subject"), key: "subject" },
    { title: t("Attendance"), key: "attendance" },
    { title: t("Actions"), key: "actions" },
  ];

  const tableData = collegeSubjectsList.map((item) => {
    const key = item.subjectName.trim().toLowerCase();
    const isEnrolled = enrolledSubjects.includes(key);
    const attendance = attendanceMap[key] ?? 0;

    return {
      subject: item.subjectName,

      attendance: (
        <div className="flex items-center justify-center gap-0.5">
          <p
            className={`text-xs font-medium ${attendance >= 75 ? "text-green-500" : "text-red-500"
              }`}
          >
            {attendance}%
          </p>
          <p className="text-xs">/100%</p>
        </div>
      ),

      actions: (
        <div className="flex items-center justify-center">
          {isEnrolled ? (
            <div className="rounded-md bg-gray-100 border border-gray-200 px-3 py-1 cursor-not-allowed">
              <p className="text-gray-400 text-sm font-semibold">
                ENROLLED
              </p>
            </div>
          ) : isScheduleExpired ? (
            <div className="rounded-md bg-gray-200 text-gray-400 text-sm font-semibold px-3 py-1 cursor-not-allowed">
              {t("CLOSED")}
            </div>
          ) : attendance >= 75 ? (
            <button
              onClick={() => {
                setSelectedSubject(item);
                setShowConfirmModal(true);
              }}
              className="rounded-md bg-[#43C17A] hover:bg-[#35a868] text-white text-sm font-semibold px-3 py-1 cursor-pointer transition-colors"
            >
              {t("ENROLL")}
            </button>
          ) : (
            <div className="rounded-md bg-gray-200 text-gray-400 text-sm font-semibold px-3 py-1 cursor-not-allowed">
              {t("NOT ELIGIBLE")}
            </div>
          )}
        </div>
      ),
    };
  });

  if (viewingHallTicket && selectedSchedule) {
    return (
      <div className="max-w-4xl mx-auto w-full flex flex-col pb-10">
        <div className="flex flex-row justify-between items-center mb-6">
          <button
            onClick={() => setViewingHallTicket(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold cursor-pointer transition-colors"
          >
            <CaretLeftIcon size={20} weight="bold" />
            <span>Back to Enrollment</span>
          </button>
          <button
            onClick={downloadHallTicketPdf}
            className="bg-[#43C17A] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#35a868] transition-colors shadow-sm cursor-pointer"
          >
            Download PDF
          </button>
        </div>

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
              <div
                style={{
                  backgroundImage: `url('${bannerUrl}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  width: "100%",
                  height: "224px",
                  position: "relative",
                  flexShrink: 0
                }}
                className="w-full h-56 shrink-0 relative"
              >
                {mediaLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      zIndex: 20
                    }}
                    className="absolute inset-0 bg-white/20 animate-pulse z-20"
                  />
                )}
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
                        flexShrink: 0,
                        overflow: "hidden",
                        position: "relative"
                      }}
                      className="border-[4px] border-[#43C17A] rounded-[18px] bg-black/30 w-16 h-16 flex items-center justify-center text-white font-extrabold text-xl shrink-0 overflow-hidden relative"
                    >
                      {mediaLoading ? (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                            zIndex: 10
                          }}
                          className="absolute inset-0 bg-white/20 animate-pulse z-10"
                        />
                      ) : logoUrl && !logoError ? (
                        <Image
                          src={logoUrl}
                          alt="College Logo"
                          fill
                          className="object-cover"
                          onError={() => setLogoError(true)}
                          unoptimized
                        />
                      ) : (
                        collegeAbbreviation
                      )}
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
                        Branch of {collegeBranchType ?? "Bachelor Of Science"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingLeft: "15mm",
                  paddingRight: "15mm",
                  paddingBottom: "15mm",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  width: "100%",
                  boxSizing: "border-box",
                  flex: 1
                }}
                className="px-[15mm] pb-[15mm] flex flex-col gap-6 w-full flex-1"
              >
                <h1
                  style={{
                    fontSize: "30px",
                    fontWeight: 800,
                    color: "#16284F",
                    letterSpacing: "0.1em",
                    textAlign: "center",
                    margin: "0"
                  }}
                  className="text-3xl font-extrabold text-[#16284F] tracking-widest text-center"
                >
                  HALL TICKET
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "24px",
                    alignItems: "center",
                    boxSizing: "border-box",
                    width: "100%"
                  }}
                  className="flex flex-row gap-6 items-center"
                >
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

                  <div
                    style={{
                      flex: 1,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      rowGap: "8px",
                      columnGap: "16px",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                    className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm"
                  >
                    <div>
                      <span style={{ color: "#6b7280", fontWeight: 500 }} className="text-gray-500 font-medium">Student ID :</span>{" "}
                      <span style={{ color: "#1f2937", fontWeight: 600 }} className="text-gray-800 font-semibold">{identifierId ?? "N/A"}</span>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", fontWeight: 500 }} className="text-gray-500 font-medium">Examination :</span>{" "}
                      <span style={{ color: "#1f2937", fontWeight: 600 }} className="text-gray-800 font-semibold">
                        {collegeEducationType ?? "Degree"} | {selectedSchedule.scheduleTitle}
                      </span>
                    </div>
                    <div style={{ gridColumn: "span 2", marginTop: "4px" }} className="sm:col-span-2 mt-1">
                      <span style={{ fontSize: "20px", fontWeight: 700, color: "#16284F" }} className="text-xl font-bold text-[#16284F]">{fullName ?? "N/A"}</span>
                    </div>
                    <div style={{ gridColumn: "span 2", marginTop: "4px", color: "#4b5563", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.025em" }} className="sm:col-span-2 mt-1 text-gray-600 font-medium uppercase tracking-wide">
                      {collegeBranchCode ?? "CSE"} - Year {collegeAcademicYear ?? "2"}
                    </div>
                  </div>
                </div>

                <h3
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#16284F",
                    textDecorationLine: "underline",
                    letterSpacing: "0.1em",
                    marginTop: "16px",
                    margin: "16px 0 0 0"
                  }}
                  className="text-center text-lg sm:text-xl font-bold text-[#16284F] underline tracking-widest mt-4"
                >
                  MEMORANDUM OF SUBJECTS
                </h3>

                <div
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    width: "100%"
                  }}
                  className="overflow-x-auto border border-gray-300 rounded-lg mt-2"
                >
                  <table
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                      boxSizing: "border-box"
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
                        <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "50px" }} className="py-2.5 px-4 border-r border-gray-300 w-16 text-center">S.No</th>
                        <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "130px" }} className="py-2.5 px-4 border-r border-gray-300 w-32">Subject Code</th>
                        <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db" }} className="py-2.5 px-4 border-r border-gray-300">Subject Name</th>
                        <th style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "120px" }} className="py-2.5 px-4 border-r border-gray-300 text-center w-36">Exam Date</th>
                        <th style={{ padding: "10px 12px", textAlign: "center", width: "120px" }} className="py-2.5 px-4 text-center w-36">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...collegeSubjectsList]
                        .sort((a, b) => {
                          const keyA = (a.subjectKey || "").trim().toLowerCase();
                          const keyB = (b.subjectKey || "").trim().toLowerCase();
                          return keyA.localeCompare(keyB);
                        })
                        .map((row, idx) => {
                          const matchingScheduleSubject = scheduleSubjects.find(
                            (s) => s.subjectName.trim().toLowerCase() === row.subjectName.trim().toLowerCase()
                          );
                          const isEnrolled = enrolledSubjects.includes(row.subjectName.trim().toLowerCase());

                          return (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: "1px solid #d1d5db",
                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb"
                              }}
                              className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50/50"
                            >
                              <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-4 border-r border-gray-300 text-center font-mono text-gray-600">
                                {String(idx + 1).padStart(2, "0")}
                              </td>
                              <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-4 border-r border-gray-300 font-mono text-gray-600">
                                {row.subjectCode || "N/A"}
                              </td>
                              <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", fontWeight: 600, color: isEnrolled ? "#1f2937" : "#ef4444" }} className={`py-2.5 px-4 border-r border-gray-300 font-semibold ${!isEnrolled ? "text-red-500" : "text-gray-800"}`}>
                                {row.subjectName}
                              </td>
                              <td style={{ padding: "10px 12px", borderRight: "1px solid #d1d5db", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-4 border-r border-gray-300 text-center font-mono text-gray-700">
                                {isEnrolled && matchingScheduleSubject ? matchingScheduleSubject.examDate : "-"}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "center", fontFamily: "monospace", color: "#374151" }} className="py-2.5 px-4 text-center font-mono text-gray-700">
                                {isEnrolled && matchingScheduleSubject ? matchingScheduleSubject.time : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      <tr
                        style={{
                          backgroundColor: "#f9fafb",
                          fontWeight: 600,
                          borderTop: "1px solid #d1d5db"
                        }}
                        className="bg-gray-50 border-t border-gray-300 font-bold text-gray-700 text-xs"
                      >
                        <td colSpan={3} style={{ padding: "12px 16px", borderRight: "1px solid #d1d5db", fontSize: "11px", color: "#374151" }} className="py-2.5 px-4 border-r border-gray-300">
                          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", fontWeight: "bold" }}>
                            <span>SUBJECTS REGISTERED: {String(enrolledSubjects.length).padStart(2, '0')}</span>
                            <span style={{ marginRight: "16px" }}>TOTAL SUBJECTS: {String(collegeSubjectsList.length).padStart(2, '0')}</span>
                          </div>
                        </td>
                        <td colSpan={2} style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", color: "#16a34a", fontWeight: "bold", letterSpacing: "0.05em" }} className="py-2.5 px-4 text-center text-green-600 font-extrabold uppercase tracking-wider">
                          HALL TICKET STATUS: ACTIVE
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "12px", boxSizing: "border-box", width: "100%" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: 850, color: "#1f2937", letterSpacing: "0.05em", textAlign: "center", marginBottom: "10px", margin: "0 0 10px 0" }} className="text-center text-[11px] font-bold text-gray-800 tracking-wider">
                    INSTRUCTIONS TO CANDIDATES
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", boxSizing: "border-box", width: "100%" }}>
                    {[
                      { num: "1", title: "Arrival Policy", text: "Candidates must report to the examination hall at least 30 minutes before the scheduled start time. Late entry beyond 15 minutes is strictly prohibited." },
                      { num: "2", title: "Identification", text: "A valid College ID card and this Hall Ticket are mandatory for entry. Digital versions on mobile devices will not be accepted." },
                      { num: "3", title: "Prohibited Items", text: "Mobile phones, smartwatches, tablets, and any other electronic communication devices are strictly banned inside the examination hall." },
                      { num: "4", title: "Stationery", text: "Candidates are permitted to bring only transparent stationery items. Borrowing or sharing of materials during the examination is not allowed." },
                      { num: "5", title: "Academic Integrity", text: "Any form of malpractice, copying, or possession of unauthorized notes will lead to immediate disqualification and disciplinary action." },
                      { num: "6", title: "Submission", text: "All answer sheets must be handed over to the invigilator before leaving the examination hall." }
                    ].map((inst, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#4b5563", lineHeight: "1.4", boxSizing: "border-box", width: "100%" }}>
                        <span style={{ fontWeight: "bold", flexShrink: 0 }}>{inst.num}.</span>
                        <span style={{ flex: 1 }}>
                          <strong style={{ color: "#374151" }}>{inst.title}</strong>: {inst.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSchedule) {
    const formattedFromDate = selectedSchedule.fromDate
      ? new Date(selectedSchedule.fromDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "-";

    return (
      <div className="relative flex flex-col items-start justify-start gap-3 w-full animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <CaretLeftIcon
            size={22}
            weight="bold"
            onClick={() => setSelectedSchedule(null)}
            className="text-[#282828] cursor-pointer"
          />
          <h3 className="text-[#282828] text-lg font-semibold">
            {selectedSchedule.scheduleTitle} Enrollment
          </h3>
        </div>

        <p className="text-sm text-[#515151]">
          Enroll for your upcoming exams starting {formattedFromDate}.
        </p>

        <div className="bg-white rounded-lg p-3 shadow-md w-full flex flex-col gap-3 mt-0.5">
          <div className="flex items-center gap-3">
            <div className="w-[18%] min-w-[120px]">
              <h6 className="text-[#282828] text-md">Exam start date</h6>
            </div>
            <div className="rounded-full bg-[#E5F6EC] px-3 py-1.5">
              <p className="text-[#43C17A] font-medium">{formattedFromDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[18%] min-w-[120px]">
              <h6 className="text-[#282828] text-md">Exam type</h6>
            </div>
            <div className="rounded-full bg-[#E5F6EC] px-3 py-1.5">
              <p className="text-[#43C17A] font-medium">
                {selectedSchedule.examType} ({collegeBranchCode ?? "CSE"} Year {collegeAcademicYear ?? "2"})
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-[20%] min-w-[125px]">
              <h6 className="text-[#282828] text-md">{t("Note")}</h6>
            </div>
            <p className="text-[#282828] text-md font-medium text-gray-700">
              {t("You’re eligible to enroll if your attendance ≥ 75%")}
            </p>
          </div>
        </div>

        <div className="bg-white w-full rounded-lg p-3 shadow-md mt-2 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[#282828] font-medium">
              {t("Select Subjects to Enroll")}
            </h5>
            <button
              onClick={() => setViewingHallTicket(true)}
              className="rounded-lg bg-[#E5F6EC] hover:bg-[#d4f2df] px-3 py-1.5 text-[#43C17A] font-medium cursor-pointer transition-colors text-sm"
            >
              {t("Hall Ticket")}
            </button>
          </div>

          <TableComponent columns={columns} tableData={tableData} />
        </div>

        {showConfirmModal && selectedSubject && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSubject(null);
                }}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Confirm Enrollment
                </h3>
                <p className="text-sm text-gray-500">
                  Once confirmed, this subject will be added to your hall ticket.
                </p>

                <div className="flex flex-col gap-2.5 mt-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div className="flex gap-2">
                    <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Subject:</span>
                    <span className="text-sm text-gray-700">{selectedSubject.subjectName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Subject Code:</span>
                    <span className="text-sm font-mono text-gray-700">
                      {selectedSubject.subjectCode || "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Attendance:</span>
                    <span className="text-sm text-gray-700">
                      {attendanceMap[selectedSubject.subjectName.trim().toLowerCase()] ?? 0}%
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Status:</span>
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                      ✅ Eligible
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 w-full">
                  <button
                    onClick={confirmEnrollment}
                    className="w-[49%] bg-[#43C17A] text-white py-2.5 rounded-lg font-bold hover:bg-[#35a868] transition-colors cursor-pointer shadow-sm text-sm text-center"
                  >
                    Confirm Enrollment
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedSubject(null);
                    }}
                    className="w-[49%] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-start justify-start gap-4 w-full animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <CaretLeftIcon
          size={22}
          weight="bold"
          onClick={onBack}
          className="text-[#282828] cursor-pointer"
        />
        <h3 className="text-[#282828] text-lg font-semibold">Exams</h3>
      </div>

      <p className="text-sm text-[#515151]">
        Select an exam schedule to enroll in subjects or view your hall ticket.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[180px] animate-pulse"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
              </div>
              <div className="flex justify-end mt-4">
                <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
              </div>
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl p-8 w-full text-center border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-medium text-sm">No exam schedules available for your branch/semester.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {schedules.map((sch) => {
            const formattedFrom = sch.fromDate
              ? new Date(sch.fromDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "-";
            const formattedTo = sch.toDate
              ? new Date(sch.toDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "-";

            return (
              <div
                key={sch.collegeExamScheduleId}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[180px]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-[#16284F] font-bold text-lg truncate pr-2">
                      {sch.scheduleTitle}
                    </h4>
                    <span className="bg-[#E5F6EC] text-[#43C17A] text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {sch.examType.replace(" Exam", "")}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-2 font-medium">
                    Dates: {formattedFrom} – {formattedTo}
                  </p>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setSelectedSchedule(sch)}
                    className="bg-[#43C17A] hover:bg-[#35a868] text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Enroll / View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

