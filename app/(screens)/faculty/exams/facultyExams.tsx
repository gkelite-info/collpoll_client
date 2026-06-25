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

        const { data: scheduleData, error: scheduleError } = await supabase
          .from("college_exam_schedules")
          .select("*")
          .eq("collegeId", collegeId)
          .is("deletedAt", null);

        if (scheduleError) throw scheduleError;

        const filtered = (scheduleData || []).filter((s) => {
          if (s.collegeEducationId && s.collegeEducationId !== collegeEducationId) return false;
          if (s.collegeBranchId && s.collegeBranchId !== collegeBranchId) return false;
          return true;
        });

        setSchedules(filtered);

        const { data: enrollmentData, error: enrollError } = await supabase
          .from("student_exam_enrollments")
          .select("collegeExamScheduleId, studentId")
          .is("deletedAt", null);

        if (enrollError) throw enrollError;

        const counts: Record<number, number> = {};
        const uniqueEnrolls = new Map<number, Set<number>>();
        enrollmentData?.forEach((row: any) => {
          const schId = row.collegeExamScheduleId;
          const stuId = row.studentId;
          if (!uniqueEnrolls.has(schId)) {
            uniqueEnrolls.set(schId, new Set());
          }
          uniqueEnrolls.get(schId)!.add(stuId);
        });

        uniqueEnrolls.forEach((stus, schId) => {
          counts[schId] = stus.size;
        });

        setEnrollmentCounts(counts);
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
        if (selectedSchedule.collegeSectionsId) {
          studentQuery = studentQuery.eq("student_academic_history.collegeSectionsId", selectedSchedule.collegeSectionsId);
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

  const formattedFromDate = selectedSchedule?.fromDate
    ? new Date(selectedSchedule.fromDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "-";

  const formattedToDate = selectedSchedule?.toDate
    ? new Date(selectedSchedule.toDate).toLocaleDateString("en-US", {
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
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6 w-20 text-center">S.No</th>
                        <th className="py-4 px-6">Student Details</th>
                        <th className="py-4 px-6 w-44">Roll Number</th>
                        <th className="py-4 px-6 w-48">Enrolled Date</th>
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

                  const totalEnrolled = enrollmentCounts[sch.collegeExamScheduleId] || 0;

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
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Enrollments</span>
                          <span className="text-gray-700 font-bold text-sm">{totalEnrolled} Students</span>
                        </div>
                        <button
                          onClick={() => setSelectedSchedule(sch)}
                          className="bg-[#43C17A] hover:bg-[#35a868] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          View Enrollments
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <FacultyDashRight />
    </div>
  );
}
