"use client";

import { useState, useEffect, useMemo } from "react";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { supabase } from "@/lib/supabaseClient";
import {
  CaretLeft,
  MagnifyingGlass,
  FileXls,
  Calendar,
  User,
  Funnel,
  CheckCircle,
  Clock,
  ArrowBendUpLeft,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import FacultyDashRight from "@/app/(screens)/faculty/(dashboard)/components/right";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

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
  college_exam_schedule_sections?: Array<{
    collegeSectionsId: number;
    college_sections?: { collegeSections: string } | null;
  }>;
  college_sections?: { collegeSections: string } | null;
  college_exam_schedule_subjects?: Array<{ examDate: string | null }>;
};

type EnrollmentRecord = {
  studentExamEnrollmentId: number;
  studentId: number;
  collegeExamScheduleId: number;
  subjectName: string;
  collegeSemesterId: number;
  isActive: boolean;
  createdAt: string;
  studentName: string;
  email: string;
  profileUrl: string;
  rollNo: string;
};

export default function FacultyExamsPage() {
  const { collegeId, collegeEducationId, collegeBranchId, collegeAcademicYears } = useFaculty();

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<number, number>>({});
  const [actualEnrollmentCounts, setActualEnrollmentCounts] = useState<Record<number, number>>({});
  const [schedulePage, setSchedulePage] = useState(1);
  const scheduleItemsPerPage = 4;

  const [studentsCohort, setStudentsCohort] = useState<any[]>([]);
  const [examEnrollments, setExamEnrollments] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!collegeId) return;

    const fetchSchedules = async () => {
      try {
        setLoading(true);

        let { data: scheduleData, error: scheduleError } = await supabase
          .from("college_exam_schedules")
          .select(`
            *,
            college_sections ( collegeSections ),
            college_exam_schedule_sections (
              collegeSectionsId,
              college_sections ( collegeSections )
            )
          `)
          .eq("collegeId", collegeId)
          .is("deletedAt", null);

        // Keep the screen working before the multi-section migration is applied.
        if (scheduleError) {
          const legacyResult = await supabase
            .from("college_exam_schedules")
            .select("*, college_sections ( collegeSections )")
            .eq("collegeId", collegeId)
            .is("deletedAt", null);
          scheduleData = legacyResult.data;
          scheduleError = legacyResult.error;
        }

        if (scheduleError) throw new Error(scheduleError.message || "Unable to fetch exam schedules");

        const scheduleIds = (scheduleData || []).map(
          (schedule) => schedule.collegeExamScheduleId,
        );
        if (scheduleIds.length > 0) {
          const { data: subjectDateData } = await supabase
            .from("college_exam_schedule_subjects")
            .select("collegeExamScheduleId, examDate")
            .in("collegeExamScheduleId", scheduleIds)
            .is("deletedAt", null);

          scheduleData = (scheduleData || []).map((schedule) => ({
            ...schedule,
            college_exam_schedule_subjects: (subjectDateData || []).filter(
              (subject) => subject.collegeExamScheduleId === schedule.collegeExamScheduleId,
            ),
          }));
        }

        const filtered = (scheduleData || []).filter((s) => {
          if (s.collegeEducationId && s.collegeEducationId !== collegeEducationId) return false;
          if (s.collegeBranchId && s.collegeBranchId !== collegeBranchId) return false;
          return true;
        });

        setSchedules(filtered);

        const { data: cohortData, error: cohortError } = await supabase
          .from("students")
          .select(`
            studentId,
            collegeEducationId,
            collegeBranchId,
            student_academic_history!inner (
              collegeSectionsId,
              collegeAcademicYearId,
              collegeSemesterId,
              isCurrent
            )
          `)
          .eq("collegeId", collegeId)
          .eq("isActive", true)
          .is("deletedAt", null)
          .eq("student_academic_history.isCurrent", true);

        if (cohortError) throw cohortError;

        const { data: academicYearData, error: academicYearError } = await supabase
          .from("college_academic_year")
          .select("collegeAcademicYearId, collegeAcademicYear")
          .eq("collegeId", collegeId)
          .is("deletedAt", null);

        if (academicYearError) throw academicYearError;

        const counts: Record<number, number> = {};
        const academicYearIds = new Map(
          (academicYearData || []).map((year) => [
            year.collegeAcademicYear,
            year.collegeAcademicYearId,
          ]),
        );

        filtered.forEach((schedule) => {
          const scheduleYearId = schedule.academicYear
            ? academicYearIds.get(schedule.academicYear)
            : undefined;

          const scheduleSectionIds = schedule.college_exam_schedule_sections?.map(
            (item: { collegeSectionsId: number }) => item.collegeSectionsId,
          ) || (schedule.collegeSectionsId ? [schedule.collegeSectionsId] : []);
          const matchingStudentIds = new Set<number>();
          (cohortData || []).forEach((student: any) => {
            if (student.collegeEducationId !== schedule.collegeEducationId) return;
            if (schedule.collegeBranchId && student.collegeBranchId !== schedule.collegeBranchId) return;

            const histories = Array.isArray(student.student_academic_history)
              ? student.student_academic_history
              : student.student_academic_history
                ? [student.student_academic_history]
                : [];

            const matchesSchedule = histories.some((history: any) =>
              history.isCurrent === true &&
              (!schedule.collegeSemesterId || history.collegeSemesterId === schedule.collegeSemesterId) &&
              (scheduleSectionIds.length === 0 || scheduleSectionIds.includes(history.collegeSectionsId)) &&
              (!scheduleYearId || history.collegeAcademicYearId === scheduleYearId)
            );

            if (matchesSchedule) matchingStudentIds.add(student.studentId);
          });

          counts[schedule.collegeExamScheduleId] = matchingStudentIds.size;
        });

        setEnrollmentCounts(counts);

        // Fetch actual enrollments to show enrolled / total
        if (scheduleIds.length > 0) {
          const { data: allEnrollments, error: enrollErr } = await supabase
            .from("student_exam_enrollments")
            .select("collegeExamScheduleId, studentId")
            .in("collegeExamScheduleId", scheduleIds)
            .eq("isActive", true)
            .is("deletedAt", null);
            
          if (!enrollErr && allEnrollments) {
            const actualCounts: Record<number, Set<number>> = {};
            allEnrollments.forEach((e: any) => {
              if (!actualCounts[e.collegeExamScheduleId]) {
                actualCounts[e.collegeExamScheduleId] = new Set();
              }
              actualCounts[e.collegeExamScheduleId].add(e.studentId);
            });
            const actualCountsFormatted: Record<number, number> = {};
            Object.keys(actualCounts).forEach(k => {
              actualCountsFormatted[Number(k)] = actualCounts[Number(k)].size;
            });
            setActualEnrollmentCounts(actualCountsFormatted);
          }
        }
      } catch (err) {
        console.error("Failed to load faculty schedules", err);
        toast.error("Failed to load exam schedules.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [collegeId, collegeEducationId, collegeBranchId]);

  useEffect(() => {
    if (!selectedSchedule) {
      setStudentsCohort([]);
      setExamEnrollments([]);
      return;
    }

    const fetchEnrollmentDetails = async () => {
      try {
        setLoading(true);
        setSearchQuery("");
        setCurrentPage(1);

        const { data: enrollData, error: enrollError } = await supabase
          .from("student_exam_enrollments")
          .select("studentId, subjectName, isActive, createdAt")
          .eq("collegeExamScheduleId", selectedSchedule.collegeExamScheduleId)
          .is("deletedAt", null);

        if (enrollError) throw enrollError;
        setExamEnrollments(enrollData || []);

        let studentQuery = supabase
          .from("students")
          .select(`
            studentId,
            userId,
            collegeEducationId,
            collegeBranchId,
            users (
              fullName,
              email,
              user_profile (
                profileUrl
              )
            ),
            student_pins (
              pinNumber
            ),
            student_academic_history!inner (
              collegeSectionsId,
              collegeAcademicYearId,
              collegeSemesterId,
              isCurrent
            )
          `)
          .eq("collegeId", selectedSchedule.collegeId)
          .eq("collegeEducationId", selectedSchedule.collegeEducationId)
          .eq("isActive", true)
          .is("deletedAt", null)
          .eq("student_academic_history.isCurrent", true);

        if (selectedSchedule.collegeBranchId) {
          studentQuery = studentQuery.eq("collegeBranchId", selectedSchedule.collegeBranchId);
        }
        if (selectedSchedule.collegeSemesterId) {
          studentQuery = studentQuery.eq("student_academic_history.collegeSemesterId", selectedSchedule.collegeSemesterId);
        }
        const selectedSectionIds = selectedSchedule.college_exam_schedule_sections?.map(
          (item) => item.collegeSectionsId,
        ) || (selectedSchedule.collegeSectionsId ? [selectedSchedule.collegeSectionsId] : []);
        if (selectedSectionIds.length > 0) {
          studentQuery = studentQuery.in("student_academic_history.collegeSectionsId", selectedSectionIds);
        }

        let academicYearIdToFilter = null;
        if (selectedSchedule.academicYear) {
          const { data: yearData } = await supabase
            .from("college_academic_year")
            .select("collegeAcademicYearId")
            .eq("collegeId", selectedSchedule.collegeId)
            .eq("collegeAcademicYear", selectedSchedule.academicYear)
            .is("deletedAt", null)
            .maybeSingle();
          if (yearData) {
            academicYearIdToFilter = yearData.collegeAcademicYearId;
          }
        }

        if (academicYearIdToFilter) {
          studentQuery = studentQuery.eq("student_academic_history.collegeAcademicYearId", academicYearIdToFilter);
        } else if (selectedSchedule.academicYear && collegeAcademicYears?.length > 0) {
          const matchingYear = collegeAcademicYears.find(
            (y: any) => y.collegeAcademicYear === selectedSchedule.academicYear
          );
          if (matchingYear) {
            studentQuery = studentQuery.eq("student_academic_history.collegeAcademicYearId", matchingYear.collegeAcademicYearId);
          }
        }

        const { data: studentsData, error: studentsError } = await studentQuery;
        if (studentsError) throw studentsError;

        setStudentsCohort(studentsData || []);
      } catch (err) {
        console.error("Failed to fetch enrollments and cohort details", err);
        toast.error("Failed to load enrollment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentDetails();
  }, [selectedSchedule, collegeAcademicYears]);

  const filteredStudents = useMemo(() => {
    return studentsCohort.map((student) => {
      const studentId = student.studentId;
      const studentName = student.users?.fullName || `Student ${studentId}`;
      const email = student.users?.email || "N/A";
      const pinObj = student.student_pins;
      const rollNo = Array.isArray(pinObj) ? pinObj[0]?.pinNumber : pinObj?.pinNumber || "N/A";
      const profileData = student.users?.user_profile?.[0] || student.users?.user_profile;
      const profileUrl = profileData?.profileUrl || "";

      const studentEnrolls = examEnrollments.filter(
        (e) => e.studentId === studentId && e.isActive
      );

      const isEnrolled = studentEnrolls.length > 0;
      const statusText = isEnrolled ? "Enrolled" : "Not Enrolled";
      const statusColor = isEnrolled ? "green" : "red";

      return {
        studentId,
        studentName,
        email,
        rollNo,
        profileUrl,
        statusText,
        statusColor,
        createdAt: studentEnrolls[0]?.createdAt || "",
        isEnrolled,
      };
    });
  }, [studentsCohort, examEnrollments]);

  const searchedStudents = useMemo(() => {
    return filteredStudents.filter((e) => {
      const matchesSearch =
        e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [filteredStudents, searchQuery]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [searchedStudents, currentPage]);

  const totalPages = Math.ceil(searchedStudents.length / itemsPerPage) || 1;
  const paginatedSchedules = useMemo(() => {
    const startIndex = (schedulePage - 1) * scheduleItemsPerPage;
    return schedules.slice(startIndex, startIndex + scheduleItemsPerPage);
  }, [schedulePage, schedules]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(schedules.length / scheduleItemsPerPage));
    if (schedulePage > lastPage) setSchedulePage(lastPage);
  }, [schedulePage, schedules.length]);

  const handleExportExcel = () => {
    if (!selectedSchedule || searchedStudents.length === 0) return;

    try {
      const wsData = [
        ["S.No", "Student Name", "Email", "Roll Number", "Enrolled Date", "Status"],
        ...searchedStudents.map((e, idx) => {
          const enrolledDate = e.statusColor !== "red" && e.createdAt
            ? new Date(e.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "—";
          return [
            idx + 1,
            e.studentName,
            e.email,
            e.rollNo,
            enrolledDate,
            e.statusText,
          ];
        }),
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      const colWidths = [6, 25, 28, 18, 22, 22];
      ws["!cols"] = colWidths.map((w) => ({ wch: w }));

      XLSX.utils.book_append_sheet(wb, ws, "Enrollments");
      XLSX.writeFile(
        wb,
        `${selectedSchedule.scheduleTitle.replace(/\s+/g, "_")}_Enrollments.xlsx`
      );
      toast.success("Excel report exported successfully!");
    } catch (err) {
      console.error("Export Excel error", err);
      toast.error("Failed to export Excel report.");
    }
  };

  const subjectDates = (selectedSchedule?.college_exam_schedule_subjects || [])
    .map((subject) => subject.examDate)
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const effectiveFromDate = selectedSchedule?.fromDate || subjectDates[0] || null;
  const effectiveToDate = selectedSchedule?.toDate || subjectDates[subjectDates.length - 1] || effectiveFromDate;

  const formattedFromDate = effectiveFromDate
    ? new Date(effectiveFromDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "-";

  const formattedToDate = effectiveToDate
    ? new Date(effectiveToDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "-";

  return (
    <div className="flex h-full min-h-0 w-full gap-0 overflow-hidden md:gap-1 lg:gap-0">
      <div className="h-full w-full overflow-y-auto md:w-[65%] lg:w-[68%] p-2 lg:p-4 pb-7 flex flex-col gap-4 animate-in fade-in duration-200">
        {selectedSchedule ? (
          <>
            <div className="flex flex-row justify-between items-center w-full mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <CaretLeft size={22} weight="bold" className="text-[#282828]" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-[#16284F] tracking-wide">
                    {selectedSchedule.scheduleTitle}
                  </h1>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    Dates: {formattedFromDate} – {formattedToDate} | Type: {selectedSchedule.examType}
                  </p>
                </div>
              </div>

              {searchedStudents.length > 0 && (
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-[#43C17A] hover:bg-[#35a868] text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <FileXls size={20} weight="fill" />
                  <span>Export Excel</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search student, roll number..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 text-[#282828] pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#43C17A] transition-colors"
                />
              </div>
            </div>

            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 w-full flex-1 gap-3">
                  <div className="w-10 h-10 border-4 border-[#43C17A]/20 border-t-[#43C17A] rounded-full animate-spin"></div>
                  <p className="text-gray-400 text-sm font-medium">Loading student list...</p>
                </div>
              ) : searchedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 w-full flex-1 text-center">
                  <p className="text-gray-500 font-bold text-base mb-1">No Students Found</p>
                  <p className="text-gray-400 text-sm max-w-md">
                    No students matched the selected search query or year and section parameters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full flex-1">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        <th className="py-4 px-6 w-20 text-center">S.No</th>
                        <th className="py-4 px-6">Student Details</th>
                        <th className="py-4 px-6">Roll Number</th>
                        <th className="py-4 px-6">Enrolled Date</th>
                        <th className="py-4 px-6 w-32 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedStudents.map((item, idx) => (
                        <tr key={item.studentId} className="hover:bg-gray-50/30 transition-colors text-sm">
                          <td className="py-4 px-6 text-center text-gray-400 font-mono">
                            {String((currentPage - 1) * itemsPerPage + idx + 1).padStart(2, "0")}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                                {item.profileUrl ? (
                                  <img
                                    src={item.profileUrl}
                                    alt={item.studentName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={20} />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">{item.studentName}</span>
                                <span className="text-xs text-gray-400 mt-0.5">{item.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-gray-700 font-medium">
                            {item.rollNo}
                          </td>
                          <td className="py-4 px-6 text-gray-500 font-medium text-xs">
                            {item.statusColor !== "red" && item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "—"}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.statusColor === "green"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                              }`}>
                              {item.statusColor === "green" && <CheckCircle size={14} weight="fill" />}
                              {item.statusColor === "red" && <Clock size={14} weight="regular" />}
                              <span>{item.statusText}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {searchedStudents.length > itemsPerPage && (
                <div className="flex items-center justify-between border-t border-gray-100 p-4 w-full">
                  <span className="text-xs text-gray-400 font-medium">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, searchedStudents.length)} of{" "}
                    {searchedStudents.length} students
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${currentPage === i + 1
                            ? "bg-[#43C17A] text-white"
                            : "border border-gray-100 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-[#16284F] tracking-wide">Exams</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Select an exam schedule to view student enrollments and list of enrolled subjects.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 w-full">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[180px] animate-pulse"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="h-6 bg-gray-100 rounded w-2/3"></div>
                        <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-100 rounded w-1/2 mt-4"></div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-4 bg-gray-100 rounded w-24"></div>
                      <div className="h-10 bg-gray-100 rounded-xl w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : schedules.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 w-full text-center border border-gray-200/60 shadow-sm flex flex-col items-center justify-center">
                <p className="text-gray-500 font-bold text-base mb-1">No Exam Schedules Found</p>
                <p className="text-gray-400 text-sm max-w-md">
                  No exams have been scheduled by the administrator yet for your education level/department.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 w-full">
                {paginatedSchedules.map((sch) => {
                  const subjectDates = (sch.college_exam_schedule_subjects || [])
                    .map((subject) => subject.examDate)
                    .filter((date): date is string => Boolean(date))
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                  const effectiveFromDate = sch.fromDate || subjectDates[0] || null;
                  const effectiveToDate = sch.toDate || subjectDates[subjectDates.length - 1] || effectiveFromDate;
                  const formattedFrom = effectiveFromDate
                    ? new Date(effectiveFromDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : "-";
                  const formattedTo = effectiveToDate
                    ? new Date(effectiveToDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : "-";

                  const totalEnrolled = enrollmentCounts[sch.collegeExamScheduleId] || 0;
                  const sectionNames = sch.college_exam_schedule_sections
                    ?.map((item) => item.college_sections?.collegeSections)
                    .filter(Boolean) || (sch.college_sections?.collegeSections
                      ? [sch.college_sections.collegeSections]
                      : []);

                  return (
                    <div
                      key={sch.collegeExamScheduleId}
                      className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[180px]"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-[#16284F] font-bold text-base truncate pr-1" title={sch.scheduleTitle}>
                            {sch.scheduleTitle}
                          </h4>
                          <span className="bg-[#E5F6EC] text-[#43C17A] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                            {sch.examType.replace(" Exam", "")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2.5 font-semibold">
                          <Calendar size={14} />
                          <span>
                            {formattedFrom} – {formattedTo}
                          </span>
                        </div>
                        {(sch.academicYear || sectionNames.length > 0) && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] font-semibold">
                            {sch.academicYear && (
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                Year: {sch.academicYear}
                              </span>
                            )}
                            {sectionNames.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                Sections: {sectionNames.join(", ")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Enrollments</span>
                          <span className="text-gray-700 font-bold text-sm">{(actualEnrollmentCounts[sch.collegeExamScheduleId] || 0)} / {totalEnrolled} Students</span>
                        </div>
                        <button
                          onClick={() => setSelectedSchedule(sch)}
                          disabled={sch.toDate ? new Date(sch.toDate).setHours(23, 59, 59, 999) < new Date().getTime() : false}
                          className={`text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm ${sch.toDate && new Date(sch.toDate).setHours(23, 59, 59, 999) < new Date().getTime() ? "bg-gray-300 cursor-not-allowed" : "bg-[#43C17A] hover:bg-[#35a868] cursor-pointer"}`}
                        >
                          {sch.toDate && new Date(sch.toDate).setHours(23, 59, 59, 999) < new Date().getTime() ? "Closed" : "View Enrollments"}
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="lg:col-span-2 xl:col-span-2">
                  <Pagination
                    currentPage={schedulePage}
                    totalItems={schedules.length}
                    itemsPerPage={scheduleItemsPerPage}
                    onPageChange={setSchedulePage}
                    alwaysShow
                    roundedBottom="rounded-xl"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <FacultyDashRight />
    </div>
  );
}
