"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CaretRight,
  CaretLeft,
  CaretDown,
  X,
  Pencil,
  Trash,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import {
  fetchEducations,
  fetchBranches,
  fetchAcademicYears,
  fetchSemesters,
  fetchSections,
  fetchSubjects,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import {
  fetchCustomExamTypes,
  createCustomExamType,
  createExamSchedule,
  fetchExamSchedules,
  deleteExamSchedule,
  updateExamSchedule,
  fetchExamScheduleSubjects,
} from "@/lib/helpers/admin/collegeExamAPI";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

interface ExamSubjectRow {
  subject: string;
  examDate: string;
  time: string;
  status: "Upcoming" | "Completed";
}

function parseSubjectDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const year = Number(parts[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }
  } else if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function ExamsPage() {
  const { userId } = useUser();
  const [collegeId, setCollegeId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);

  const [educations, setEducations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  const [educationSelect, setEducationSelect] = useState<number | null>(null);
  const [branchSelect, setBranchSelect] = useState<number | null>(null);
  const [yearSelect, setYearSelect] = useState<string>("2nd Year");
  const [semesterSelect, setSemesterSelect] = useState<number | null>(null);
  const [sectionSelect, setSectionSelect] = useState<number | null>(null);
  const [examTypeSelect, setExamTypeSelect] = useState<string>("Select");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [isCustomExamType, setIsCustomExamType] = useState(false);
  const [customExamTypes, setCustomExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [examSchedules, setExamSchedules] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [tableEduFilter, setTableEduFilter] = useState<number | "All">("All");
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  const loadSchedules = (cid: number) => {
    setTableLoading(true);
    fetchExamSchedules(cid)
      .then((data) => setExamSchedules(data))
      .catch((err) => console.error("Error fetching schedules:", err))
      .finally(() => setTableLoading(false));
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false);

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      setIsDeletingSchedule(true);
      await deleteExamSchedule(scheduleToDelete.id);
      toast.success(`Exam schedule "${scheduleToDelete.title}" deleted successfully.`);
      if (collegeId) {
        loadSchedules(collegeId);
      }
      setIsDeleteModalOpen(false);
      setScheduleToDelete(null);
    } catch (error) {
      toast.error("Failed to delete exam schedule.");
    } finally {
      setIsDeletingSchedule(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setScheduleToDelete(null);
  };

  const handleEditSchedule = async (row: any) => {
    setEditingScheduleId(row.collegeExamScheduleId);
    setScheduleTitle(row.scheduleTitle);
    setExamTypeSelect(row.examType);
    setEducationSelect(row.collegeEducationId);
    setBranchSelect(row.collegeBranchId);
    setYearSelect(row.academicYear || "1st Year");
    setSemesterSelect(row.collegeSemesterId);
    setSectionSelect(row.collegeSectionsId);
    setFromDate(row.fromDate || "");
    setToDate(row.toDate || "");

    try {
      const subs = await fetchExamScheduleSubjects(row.collegeExamScheduleId);
      const mapped = subs.map((s: any) => ({
        subject: s.subjectName,
        examDate: s.examDate,
        time: s.time,
        status: s.status as "Upcoming" | "Completed",
      }));
      setScheduledSubjects(mapped);
    } catch (error) {
      console.error("Error loading schedule subjects:", error);
      setScheduledSubjects([]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(`Loaded "${row.scheduleTitle}" for editing. Adjust fields and click Update to save.`);
  };

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isInterGlobal = educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter";
  const showDateRangePicker = isInterGlobal || ["Select", "Mid 1 Exam", "Mid 2 Exam", "Semester Exam"].includes(examTypeSelect);

  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  const [prevSchedulesLevel, setPrevSchedulesLevel] = useState<0 | 1 | 2>(0);
  const [drillDownBranch, setDrillDownBranch] = useState<any>(null);
  const [drillDownYear, setDrillDownYear] = useState<string>("");
  const [prevSchedulesEduSelect, setPrevSchedulesEduSelect] = useState<number | null>(null);
  const [prevSchedulesBranches, setPrevSchedulesBranches] = useState<any[]>([]);

  useEffect(() => {
    setPrevSchedulesLevel(0);
    setDrillDownBranch(null);
    setDrillDownYear("");
  }, [prevSchedulesEduSelect]);

  const [currentTime, setCurrentTime] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDate, setNewSubjectDate] = useState("11/09/2026");
  const [newSubjectTime, setNewSubjectTime] = useState("11:49 AM");

  const [scheduledSubjects, setScheduledSubjects] = useState<ExamSubjectRow[]>([]);

  useEffect(() => {
    setCurrentTime("08:23 am");
    setCurrentDay("23");
    setCurrentMonth("OCT");
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchAdminContext(userId)
      .then((ctx) => {
        setCollegeId(ctx.collegeId);
        setAdminId(ctx.adminId);
        loadSchedules(ctx.collegeId);
        fetchCustomExamTypes(ctx.collegeId)
          .then((types) => setCustomExamTypes(types))
          .catch((err) => console.error("Error loading custom exam types:", err));
        return fetchEducations(ctx.collegeId);
      })
      .then((eduList) => {
        setEducations(eduList);
        if (eduList.length > 0) {
          setEducationSelect(eduList[0].collegeEducationId);
          setPrevSchedulesEduSelect(eduList[0].collegeEducationId);
        }
      })
      .catch((err) => {
        console.error("Error loading initial data:", err);
      });
  }, [userId]);

  useEffect(() => {
    if (!collegeId || !educationSelect) {
      setBranches([]);
      setBranchSelect(null);
      setSelectedBranch(null);
      return;
    }
    fetchBranches(collegeId, educationSelect)
      .then((branchList) => {
        setBranches(branchList);
        if (branchList.length > 0) {
          setBranchSelect(branchList[0].collegeBranchId);
          setSelectedBranch(branchList[0].collegeBranchId);
        } else {
          setBranchSelect(null);
          setSelectedBranch(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching branches:", err);
      });
  }, [collegeId, educationSelect]);

  useEffect(() => {
    if (!collegeId || !prevSchedulesEduSelect) {
      setPrevSchedulesBranches([]);
      return;
    }
    fetchBranches(collegeId, prevSchedulesEduSelect)
      .then((branchList) => {
        setPrevSchedulesBranches(branchList);
      })
      .catch((err) => {
        console.error("Error fetching branches for previous schedules:", err);
      });
  }, [collegeId, prevSchedulesEduSelect]);

  useEffect(() => {
    if (showDateRangePicker || !collegeId || !educationSelect || !branchSelect) {
      setAcademicYears([]);
      setCurrentAcademicYearId(null);
      return;
    }
    fetchAcademicYears(collegeId, educationSelect, branchSelect)
      .then((yearList) => {
        setAcademicYears(yearList);
        const matchedYear = yearList.find((y) => y.collegeAcademicYear === yearSelect);
        if (matchedYear) {
          setCurrentAcademicYearId(matchedYear.collegeAcademicYearId);
        } else {
          setCurrentAcademicYearId(yearList[0]?.collegeAcademicYearId || null);
        }
      })
      .catch((err) => {
        console.error("Error fetching academic years:", err);
      });
  }, [collegeId, educationSelect, branchSelect, yearSelect, showDateRangePicker]);

  useEffect(() => {
    if (showDateRangePicker || !collegeId || !educationSelect || !branchSelect || !currentAcademicYearId) {
      setSemesters([]);
      setSemesterSelect(null);
      setSections([]);
      setSectionSelect(null);
      return;
    }
    fetchSemesters(collegeId, educationSelect, currentAcademicYearId)
      .then((semList) => {
        setSemesters(semList);
        if (semList.length > 0) {
          setSemesterSelect(semList[0].collegeSemesterId);
        } else {
          setSemesterSelect(null);
        }
      })
      .catch((err) => console.error("Error fetching semesters:", err));

    fetchSections(collegeId, educationSelect, branchSelect, currentAcademicYearId)
      .then((secList) => {
        setSections(secList);
        if (secList.length > 0) {
          setSectionSelect(secList[0].collegeSectionsId);
        } else {
          setSectionSelect(null);
        }
      })
      .catch((err) => console.error("Error fetching sections:", err));
  }, [collegeId, educationSelect, branchSelect, currentAcademicYearId, showDateRangePicker]);

  useEffect(() => {
    if (showDateRangePicker || !collegeId || !educationSelect || !branchSelect || !currentAcademicYearId || !semesterSelect) {
      setSubjectsList([]);
      return;
    }
    fetchSubjects(
      collegeId,
      educationSelect,
      branchSelect,
      currentAcademicYearId,
      semesterSelect
    )
      .then((subs) => {
        setSubjectsList(subs);
      })
      .catch((err) => console.error("Error fetching subjects:", err));
  }, [collegeId, educationSelect, branchSelect, currentAcademicYearId, semesterSelect, showDateRangePicker]);

  useEffect(() => {
    if (editingScheduleId !== null) return;
    if (subjectsList.length > 0) {
      const initialRows: ExamSubjectRow[] = subjectsList.map((sub, index) => {
        const day = 11 + index;
        return {
          subject: sub.subjectName,
          examDate: `${day}/09/2026`,
          time: "11:49 AM",
          status: "Upcoming",
        };
      });
      setScheduledSubjects(initialRows);
    } else {
      setScheduledSubjects([]);
    }
  }, [subjectsList, editingScheduleId]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) {
      toast.error("Please enter a schedule title");
      return;
    }
    if (!examTypeSelect.trim() || examTypeSelect === "Select") {
      toast.error("Please select a valid exam type");
      return;
    }
    if (!collegeId || !adminId) {
      toast.error("User context load failed. Please try again.");
      return;
    }
    if (!educationSelect) {
      toast.error("Please select an Education Type.");
      return;
    }
    const isInter = educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter";
    if (!showDateRangePicker && (branchSelect === null || (!isInter && semesterSelect === null))) {
      toast.error(isInter ? "Please select a group." : "Please select branch and semester.");
      return;
    }
    if ((showDateRangePicker || isInter) && (!fromDate || !toDate)) {
      toast.error("Please enter From Date and To Date.");
      return;
    }
    if (showDateRangePicker || isInter) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start > end) {
        toast.error("From Date cannot be later than To Date.");
        return;
      }
    }

    try {
      let finalExamType = examTypeSelect.trim();

      setLoading(true);

      await createCustomExamType(collegeId, finalExamType, adminId);
      const updatedTypes = await fetchCustomExamTypes(collegeId);
      setCustomExamTypes(updatedTypes);
      if (isCustomExamType) {
        setIsCustomExamType(false);
      }

      const schedulePayload = {
        scheduleTitle: scheduleTitle.trim(),
        collegeId,
        collegeEducationId: educationSelect || 0,
        collegeBranchId: showDateRangePicker ? null : branchSelect,
        academicYear: showDateRangePicker ? null : yearSelect,
        collegeSectionsId: showDateRangePicker ? null : sectionSelect,
        collegeSemesterId: showDateRangePicker || isInter ? null : semesterSelect,
        examType: finalExamType,
        fromDate: showDateRangePicker || isInter ? fromDate : null,
        toDate: showDateRangePicker || isInter ? toDate : null,
        createdBy: adminId,
      };

      const subjectsPayload = scheduledSubjects.map((sub) => ({
        subject: sub.subject,
        examDate: sub.examDate,
        time: sub.time,
      }));

      if (editingScheduleId !== null) {
        await updateExamSchedule(editingScheduleId, schedulePayload, subjectsPayload);
        toast.success(`Exam schedule "${scheduleTitle}" updated successfully!`);
        setEditingScheduleId(null);
      } else {
        await createExamSchedule(schedulePayload, subjectsPayload);
        toast.success(`Exam schedule "${scheduleTitle}" created successfully!`);
      }
      setScheduleTitle("");
      setScheduledSubjects([]);
      setFromDate("");
      setToDate("");
      setExamTypeSelect("Select");
      setBranchSelect(null);
      setYearSelect("1st Year");
      setSemesterSelect(null);
      setSectionSelect(null);
      if (educations.length > 0) {
        setEducationSelect(educations[0].collegeEducationId);
        setPrevSchedulesEduSelect(educations[0].collegeEducationId);
      }
      if (collegeId) {
        loadSchedules(collegeId);
      }
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      if (error?.code === "23505") {
        if (error.message?.includes("unique_college_exam_schedule_title")) {
          toast.error("An exam schedule with this title already exists. Please choose a different title.");
        } else if (error.message?.includes("unique_college_exam_type")) {
          toast.error("This exam type already exists.");
        } else {
          toast.error("A duplicate entry was found. Please ensure your inputs are unique.");
        }
      } else {
        toast.error("Failed to create exam schedule. Please try again.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      toast.error("Please select or enter a subject name");
      return;
    }

    const newRow: ExamSubjectRow = {
      subject: newSubjectName,
      examDate: newSubjectDate,
      time: newSubjectTime,
      status: "Upcoming",
    };

    setScheduledSubjects((prev) => [...prev, newRow]);
    setIsAddSubjectOpen(false);
    setNewSubjectName("");
    toast.success(`Subject "${newSubjectName}" added to the schedule.`);
  };

  const filteredSchedules = tableEduFilter === "All"
    ? examSchedules
    : examSchedules.filter((s) => s.collegeEducationId === tableEduFilter);

  const totalItems = filteredSchedules.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  const activeBranchObj = branches.find((b) => b.collegeBranchId === selectedBranch);
  const branchDisplayName = activeBranchObj ? activeBranchObj.collegeBranchCode : "";

  return (
    <div className="w-full space-y-6 min-h-[85vh] p-2 pb-7">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[#282828] text-2xl font-bold">Upload Exam Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and publish the timetable for the upcoming exams
          </p>
        </div>

        <div className="flex items-center justify-center">
          <CourseScheduleCard style="w-[320px] mt-4" isVisibile={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800">New Exam Schedule</h2>

          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-1.5">
                  Schedule Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scheduleTitle}
                  onChange={(e) => {
                    let val = e.target.value;
                    val = val.replace(/[^a-zA-Z0-9 \-]/g, "");
                    if (val.length > 0) {
                      val = val.charAt(0).toUpperCase() + val.slice(1);
                    }
                    setScheduleTitle(val);
                  }}
                  placeholder="e.g, Sem 1 - Exam Schedule"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-1.5">
                  Education Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={educationSelect || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEducationSelect(val);
                      setPrevSchedulesEduSelect(val);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                  >
                    {educations.length === 0 && <option value="">Loading...</option>}
                    {educations.map((edu) => (
                      <option key={edu.collegeEducationId} value={edu.collegeEducationId}>
                        {edu.collegeEducationType}
                      </option>
                    ))}
                  </select>
                  <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {showDateRangePicker ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      Exam Type <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    {!isCustomExamType ? (
                      <>
                        <select
                          value={examTypeSelect}
                          onChange={(e) => setExamTypeSelect(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                        >
                          <option>Select</option>
                          {educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter" ? (
                            <>
                              <option value="Unit Test 1">Unit Test 1</option>
                              <option value="Unit Test 2">Unit Test 2</option>
                              <option value="Quarterly Exam">Quarterly Exam</option>
                              <option value="Half-Yearly Exam">Half-Yearly Exam</option>
                              <option value="Pre-Final Exam">Pre-Final Exam</option>
                              <option value="Practical/Internal Assessment">Practical/Internal Assessment</option>
                              <option value="Intermediate Public Examination">Intermediate Public Examination</option>
                            </>
                          ) : (
                            <>
                              <option value="Mid 1 Exam">Mid 1 Exam</option>
                              <option value="Mid 2 Exam">Mid 2 Exam</option>
                              <option value="Lab Internal 1">Lab Internal 1</option>
                              <option value="Lab Internal 2">Lab Internal 2</option>
                              <option value="Semester Exam">Semester Exam</option>
                            </>
                          )}
                          {/* {customExamTypes.map((t) => (
                            <option key={t.collegeExamTypeId} value={t.examTypeName}>
                              {t.examTypeName}
                            </option>
                          ))} */}
                        </select>
                        <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                      </>
                    ) : (
                      <input
                        type="text"
                        value={examTypeSelect}
                        onChange={(e) => setExamTypeSelect(e.target.value)}
                        placeholder="Enter new exam type"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div className="hidden md:block"></div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 mb-1.5">
                    Exam Dates <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        const newFrom = e.target.value;
                        setFromDate(newFrom);
                        if (toDate && newFrom > toDate) {
                          setToDate("");
                        }
                      }}
                      placeholder="From Date"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                    />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate}
                      placeholder="To Date"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-bold text-gray-700">
                        Exam Type <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      {!isCustomExamType ? (
                        <>
                          <select
                            value={examTypeSelect}
                            onChange={(e) => setExamTypeSelect(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option>Select</option>
                            {educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter" ? (
                              <>
                                <option value="Unit Test 1">Unit Test 1</option>
                                <option value="Unit Test 2">Unit Test 2</option>
                                <option value="Quarterly Exam">Quarterly Exam</option>
                                <option value="Half-Yearly Exam">Half-Yearly Exam</option>
                                <option value="Pre-Final Exam">Pre-Final Exam</option>
                                <option value="Practical/Internal Assessment">Practical/Internal Assessment</option>
                                <option value="Intermediate Public Examination">Intermediate Public Examination</option>
                              </>
                            ) : (
                              <>
                                <option value="Mid 1 Exam">Mid 1 Exam</option>
                                <option value="Mid 2 Exam">Mid 2 Exam</option>
                                <option value="Lab Internal 1">Lab Internal 1</option>
                                <option value="Lab Internal 2">Lab Internal 2</option>
                                <option value="Semester Exam">Semester Exam</option>
                              </>
                            )}
                            {/* {customExamTypes.map((t) => (
                              <option key={t.collegeExamTypeId} value={t.examTypeName}>
                                {t.examTypeName}
                              </option>
                            ))} */}
                          </select>
                          <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                        </>
                      ) : (
                        <input
                          type="text"
                          value={examTypeSelect}
                          onChange={(e) => setExamTypeSelect(e.target.value)}
                          placeholder="Enter new exam type"
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-1.5">
                      {educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter" ? "Group" : "Branch"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={branchSelect || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBranchSelect(val);
                          setSelectedBranch(val);
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                      >
                        {branches.length === 0 && <option value="">{educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter" ? "No groups" : "No branches"}</option>}
                        {branches.map((b) => (
                          <option key={b.collegeBranchId} value={b.collegeBranchId}>
                            {b.collegeBranchCode}
                          </option>
                        ))}
                      </select>
                      <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-1.5">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={yearSelect}
                        onChange={(e) => setYearSelect(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        {educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType !== "Inter" && (
                          <>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </>
                        )}
                      </select>
                      <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-1.5">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={sectionSelect || ""}
                        onChange={(e) => setSectionSelect(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                      >
                        {sections.length === 0 && <option value="">No sections</option>}
                        {sections.map((sec) => (
                          <option key={sec.collegeSectionsId} value={sec.collegeSectionsId}>
                            {sec.collegeSections}
                          </option>
                        ))}
                      </select>
                      <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType !== "Inter" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-gray-700 mb-1.5">
                        Semester <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={semesterSelect || ""}
                          onChange={(e) => setSemesterSelect(Number(e.target.value))}
                          disabled={educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter"}
                          className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none appearance-none ${educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter"
                              ? "bg-gray-100 cursor-not-allowed text-gray-400"
                              : "bg-white cursor-pointer text-gray-700"
                            }`}
                        >
                          {semesters.length === 0 && <option value="">No semesters</option>}
                          {semesters.map((sem) => (
                            <option key={sem.collegeSemesterId} value={sem.collegeSemesterId}>
                              {sem.collegeSemester}
                            </option>
                          ))}
                        </select>
                        <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-2 flex gap-3">
              {editingScheduleId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingScheduleId(null);
                    setScheduleTitle("");
                    setScheduledSubjects([]);
                    setFromDate("");
                    setToDate("");
                    toast.success("Edit cancelled. Form cleared.");
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-[#43C17A] hover:bg-[#38b16d] text-white py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                disabled={loading}
              >
                {loading ? "Saving..." : editingScheduleId !== null ? "Update" : "Create Exam Schedule"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Previous Schedules</h2>

          {prevSchedulesLevel === 0 && (
            <div className="flex flex-col mb-4">
              <label className="text-xs font-bold text-gray-600 mb-1">
                Filter by Education Type
              </label>
              <div className="relative">
                <select
                  value={prevSchedulesEduSelect || ""}
                  onChange={(e) => setPrevSchedulesEduSelect(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-sm px-3 py-1.5 text-xs text-gray-700 focus:outline-none appearance-none cursor-pointer pr-8"
                >
                  {educations.length === 0 && <option value="">Loading...</option>}
                  {educations.map((edu) => (
                    <option key={edu.collegeEducationId} value={edu.collegeEducationId}>
                      {edu.collegeEducationType}
                    </option>
                  ))}
                </select>
                <CaretDown size={12} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}

          {prevSchedulesLevel === 1 && drillDownBranch && (
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setPrevSchedulesLevel(0);
                  setDrillDownBranch(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-[#43C17A]"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <span className="text-lg font-extrabold text-[#43C17A]">{drillDownBranch.collegeBranchCode}</span>
            </div>
          )}

          {prevSchedulesLevel === 2 && drillDownBranch && (
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setPrevSchedulesLevel(1);
                  setDrillDownYear("");
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-[#43C17A]"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <span className="text-lg font-extrabold text-[#43C17A]">
                {drillDownBranch.collegeBranchCode} - {drillDownYear}
              </span>
            </div>
          )}

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
            {prevSchedulesLevel === 0 &&
              prevSchedulesBranches.map((b) => {
                const isSelected = selectedBranch === b.collegeBranchId;
                return (
                  <button
                    key={b.collegeBranchId}
                    type="button"
                    onClick={() => {
                      setSelectedBranch(b.collegeBranchId);
                      setBranchSelect(b.collegeBranchId);
                      setDrillDownBranch(b);
                      setPrevSchedulesLevel(1);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${isSelected
                      ? "bg-gray-50 font-bold"
                      : "hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#E6FBEA] text-[#43C17A] flex items-center justify-center">
                        <Calendar size={16} weight="fill" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{b.collegeBranchCode}</span>
                    </div>
                    <CaretRight size={16} weight="bold" className="text-[#43C17A]" />
                  </button>
                );
              })}

            {prevSchedulesLevel === 1 &&
              ["Year - 1", "Year - 2", "Year - 3", "Year - 4"].map((yearStr) => {
                return (
                  <button
                    key={yearStr}
                    type="button"
                    onClick={() => {
                      setDrillDownYear(yearStr);
                      const yearVal = yearStr === "Year - 1" ? "1st Year" :
                        yearStr === "Year - 2" ? "2nd Year" :
                          yearStr === "Year - 3" ? "3rd Year" : "4th Year";
                      setYearSelect(yearVal);
                      setPrevSchedulesLevel(2);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#E6FBEA] text-[#43C17A] flex items-center justify-center">
                        <Calendar size={16} weight="fill" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{yearStr}</span>
                    </div>
                    <CaretRight size={16} weight="bold" className="text-[#43C17A]" />
                  </button>
                );
              })}

            {prevSchedulesLevel === 2 &&
              [
                { type: "End -Term", sem: "Sem 2", subjects: 8, examVal: "End Term Examination", semVal: 2 },
                { type: "Mid -Term", sem: "Sem 2", subjects: 8, examVal: "Mid Term Examination", semVal: 2 },
                { type: "Supplementary", sem: "Sem 2", subjects: 8, examVal: "End Term Examination", semVal: 2 },
                { type: "End -Term", sem: "Sem 1", subjects: 8, examVal: "End Term Examination", semVal: 1 },
                { type: "Mid -Term", sem: "Sem 1", subjects: 8, examVal: "Mid Term Examination", semVal: 1 },
                { type: "Supplementary", sem: "Sem 1", subjects: 8, examVal: "End Term Examination", semVal: 1 },
              ].map((item, index) => {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setExamTypeSelect(item.examVal);
                      const matchedSem = semesters.find((s) => s.collegeSemester === item.semVal);
                      if (matchedSem) {
                        setSemesterSelect(matchedSem.collegeSemesterId);
                      }
                      toast.success(`Loaded ${item.type} ${item.sem} Exam Schedule.`);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#E6FBEA] text-[#43C17A] flex items-center justify-center">
                        <Calendar size={16} weight="fill" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {item.type} • {item.sem} {drillDownBranch?.collegeBranchCode}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {item.subjects} Subjects
                        </p>
                      </div>
                    </div>
                    <CaretRight size={16} weight="bold" className="text-[#43C17A]" />
                  </button>
                );
              })}

            {prevSchedulesLevel === 0 && branches.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">No branches found</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800">
            Created Exam Schedules
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">Filter:</span>
            <div className="relative">
              <select
                value={tableEduFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setTableEduFilter(val === "All" ? "All" : Number(val));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none appearance-none cursor-pointer pr-8 min-w-[150px]"
              >
                <option value="All">All Educations</option>
                {educations.map((edu) => (
                  <option key={edu.collegeEducationId} value={edu.collegeEducationId}>
                    {edu.collegeEducationType}
                  </option>
                ))}
              </select>
              <CaretDown size={12} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Schedule Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Exam Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Education
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Scope / Target
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Created At
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
                {tableLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="h-5 bg-gray-200 rounded-full w-16 mx-auto"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-3">
                          <div className="h-4 bg-gray-200 rounded w-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-4"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : paginatedSchedules.length > 0 ? (
                  paginatedSchedules.map((row, index) => {
                    const hasDates = row.fromDate && row.toDate;
                    const scopeText = hasDates
                      ? `Dates: ${row.fromDate} to ${row.toDate}`
                      : `${row.college_branch?.collegeBranchCode || ""} (${row.academicYear || ""}, ${row.college_semester?.collegeSemester ? `Sem ${row.college_semester.collegeSemester}` : ""}${row.college_sections?.collegeSections ? `, Sec ${row.college_sections.collegeSections}` : ""})`;

                    const isCompleted = (() => {
                      const today = new Date();
                      if (row.toDate) {
                        const parts = row.toDate.split("-");
                        if (parts.length === 3) {
                          const year = Number(parts[0]);
                          const month = Number(parts[1]);
                          const day = Number(parts[2]);
                          const endDate = new Date(year, month - 1, day);
                          endDate.setHours(23, 59, 59, 999);
                          return today > endDate;
                        }
                      }
                      if (row.college_exam_schedule_subjects && row.college_exam_schedule_subjects.length > 0) {
                        let maxDate: Date | null = null;
                        for (const sub of row.college_exam_schedule_subjects) {
                          if (sub.deletedAt) continue;
                          const parsedDate = parseSubjectDate(sub.examDate);
                          if (parsedDate) {
                            if (!maxDate || parsedDate > maxDate) {
                              maxDate = parsedDate;
                            }
                          }
                        }
                        if (maxDate) {
                          maxDate.setHours(23, 59, 59, 999);
                          return today > maxDate;
                        }
                      }
                      return false;
                    })();

                    return (
                      <tr key={row.collegeExamScheduleId || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-left text-xs md:text-sm font-semibold text-gray-800">
                          {row.scheduleTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-xs md:text-sm text-gray-600">
                          {row.examType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-xs md:text-sm text-gray-600">
                          {row.college_education?.collegeEducationType || educations.find((e) => e.collegeEducationId === row.collegeEducationId)?.collegeEducationType || "-"}
                        </td>
                        <td className="px-6 py-4 text-left text-xs md:text-sm text-gray-600">
                          {scopeText}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isCompleted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditSchedule(row)}
                              className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Edit Schedule"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setScheduleToDelete({ id: row.collegeExamScheduleId, title: row.scheduleTitle });
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Schedule"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      No exam schedules created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-800">Add Subject Exam</h3>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-1.5">
                  Subject Name
                </label>
                {subjectsList.length > 0 ? (
                  <div className="relative">
                    <select
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                    >
                      {subjectsList.map((sub) => (
                        <option key={sub.collegeSubjectId} value={sub.subjectName}>
                          {sub.subjectName}
                        </option>
                      ))}
                    </select>
                    <CaretDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g. Computer Networks"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-700 mb-1.5">
                    Exam Date
                  </label>
                  <input
                    type="text"
                    value={newSubjectDate}
                    onChange={(e) => setNewSubjectDate(e.target.value)}
                    placeholder="e.g. 11/09/2026"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-700 mb-1.5">
                    Exam Time
                  </label>
                  <input
                    type="text"
                    value={newSubjectTime}
                    onChange={(e) => setNewSubjectTime(e.target.value)}
                    placeholder="e.g. 11:49 AM"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#43C17A] hover:bg-[#38b16d] text-white py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeletingSchedule}
        title="Delete"
        name="Exam Schedule"
        itemName={scheduleToDelete?.title}
        customDescription={
          <>
            Are you sure you want to delete <span className="font-semibold text-gray-700">{scheduleToDelete?.title}</span>? This action cannot be undone.
          </>
        }
      />
    </div>
  );
}