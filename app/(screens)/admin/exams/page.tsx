"use client";

import { useState, useEffect } from "react";
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
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { ExamForm } from "./components/ExamForm";
import { PreviousSchedulesCard } from "./components/PreviousSchedulesCard";
import { ExamSchedulesTable } from "./components/ExamSchedulesTable";
import { AddSubjectModal } from "./components/AddSubjectModal";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

interface ExamSubjectRow {
  subject: string;
  examDate: string;
  time: string;
  endTime?: string;
  status: "Upcoming" | "Completed";
}



const getTodayFormatted = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

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
  const [yearSelect, setYearSelect] = useState<string>("");
  const [semesterSelect, setSemesterSelect] = useState<number | null>(null);
  const [sectionSelect, setSectionSelect] = useState<number[]>([]);
  const [examTypeSelect, setExamTypeSelect] = useState<string>("Select");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [isCustomExamType, setIsCustomExamType] = useState(false);
  const [customExamTypes, setCustomExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [examSchedules, setExamSchedules] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableEduFilter, setTableEduFilter] = useState<number | "All">("All");
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [sideSchedules, setSideSchedules] = useState<any[]>([]);
  const [sideTotal, setSideTotal] = useState(0);
  const [sidePage, setSidePage] = useState(1);
  const [sideLoading, setSideLoading] = useState(false);

  const loadTableSchedules = async (cid: number, page: number, eduFilter: number | "All") => {
    setTableLoading(true);
    try {
      const { data, total } = await fetchExamSchedules(cid, page, 20, eduFilter);
      setExamSchedules(data);
      setTotalItems(total);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const loadSideSchedules = async (cid: number, page: number, eduId: number | null, bId: number | null, yVal: string | null, append: boolean = false) => {
    setSideLoading(true);
    try {
      const { data, total } = await fetchExamSchedules(cid, page, 10, eduId || "All", bId, yVal);
      if (append) {
        setSideSchedules(prev => [...prev, ...data]);
      } else {
        setSideSchedules(data);
      }
      setSideTotal(total);
    } catch (err) {
      console.error("Error fetching side schedules:", err);
    } finally {
      setSideLoading(false);
    }
  };

  useEffect(() => {
    if (collegeId) {
      loadTableSchedules(collegeId, currentPage, tableEduFilter);
    }
  }, [collegeId, currentPage, tableEduFilter]);

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
        loadTableSchedules(collegeId, currentPage, tableEduFilter);
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
    setYearSelect(row.academicYear || "");
    setSemesterSelect(row.collegeSemesterId);
    const mappedSections = row.college_exam_schedule_sections?.map(
      (item: any) => item.collegeSectionsId,
    ) || [];
    setSectionSelect(mappedSections.length > 0
      ? mappedSections
      : row.collegeSectionsId ? [row.collegeSectionsId] : []);
    
    let finalFromDate = row.fromDate ? String(row.fromDate).split("T")[0] : "";
    let finalToDate = row.toDate ? String(row.toDate).split("T")[0] : "";
    let isDateRange = !!row.fromDate && !!row.toDate;

    try {
      const subs = await fetchExamScheduleSubjects(row.collegeExamScheduleId);
      
      const startSub = subs.find((s: any) => s.subjectName === "DATE_RANGE_START");
      const endSub = subs.find((s: any) => s.subjectName === "DATE_RANGE_END");

      if (startSub && endSub) {
        finalFromDate = startSub.examDate ? String(startSub.examDate).split("T")[0] : finalFromDate;
        finalToDate = endSub.examDate ? String(endSub.examDate).split("T")[0] : finalToDate;
        isDateRange = true;
      }

      setFromDate(finalFromDate);
      setToDate(finalToDate);
      setShowDateRangePicker(isDateRange);

      if (startSub && endSub) {
        setScheduledSubjects([]);
      } else {
        const mapped = subs.map((s: any) => ({
          subject: s.subjectName,
          examDate: s.examDate,
          time: s.time,
          endTime: s.endTime,
          status: s.status as "Upcoming" | "Completed",
        }));
        setScheduledSubjects(mapped);
      }
    } catch (error) {
      console.error("Error loading schedule subjects:", error);
      setScheduledSubjects([]);
      setFromDate(finalFromDate);
      setToDate(finalToDate);
      setShowDateRangePicker(isDateRange);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(`Loaded "${row.scheduleTitle}" for editing. Adjust fields and click Update to save.`);
  };

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const activeEdu = educations.find((e) => e.collegeEducationId === educationSelect);
  const isInterGlobal = activeEdu?.collegeEducationType === "Inter";
  const isSchool = isSchoolEducation(activeEdu?.collegeEducationType || "unknown");
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  useEffect(() => {
    setShowDateRangePicker(isInterGlobal || ["Select", "Mid 1 Exam", "Mid 2 Exam", "Semester Exam"].includes(examTypeSelect));
  }, [isInterGlobal, examTypeSelect]);

  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  const [prevSchedulesLevel, setPrevSchedulesLevel] = useState<0 | 1 | 2>(0);
  const [drillDownBranch, setDrillDownBranch] = useState<any>(null);
  const [drillDownYear, setDrillDownYear] = useState<string>("");
  const [prevSchedulesEduSelect, setPrevSchedulesEduSelect] = useState<number | null>(null);
  const [prevSchedulesBranches, setPrevSchedulesBranches] = useState<any[]>([]);
  
  const isSchoolForPrev = isSchoolEducation(educations.find((e) => e.collegeEducationId === prevSchedulesEduSelect)?.collegeEducationType || "unknown");

  useEffect(() => {
    setPrevSchedulesLevel(0);
    setDrillDownBranch(null);
    setDrillDownYear("");
  }, [prevSchedulesEduSelect, isSchoolForPrev]);

  const handleYearSelect = (yearStr: string, yearVal: string) => {
    setDrillDownYear(yearStr);
    // setYearSelect(yearVal); // Not overwriting main form yearSelect
    setSidePage(1);
    setSideSchedules([]);
    setPrevSchedulesLevel(2);
    if (collegeId) {
      loadSideSchedules(collegeId, 1, prevSchedulesEduSelect, isSchoolForPrev ? null : selectedBranch, yearVal, false);
    }
  };

  const handleSideScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && !sideLoading && sideSchedules.length < sideTotal) {
      const nextPage = sidePage + 1;
      setSidePage(nextPage);
      if (collegeId) {
        // Find corresponding yearVal
        const yearVal = drillDownYear === "Year - 1" ? "1st Year" : drillDownYear === "Year - 2" ? "2nd Year" : drillDownYear === "Year - 3" ? "3rd Year" : "4th Year";
        loadSideSchedules(collegeId, nextPage, prevSchedulesEduSelect, isSchoolForPrev ? null : selectedBranch, yearVal, true);
      }
    }
  };

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDate, setNewSubjectDate] = useState(getTodayFormatted());
  const [newSubjectTime, setNewSubjectTime] = useState("09:00 AM");
  const [newSubjectEndTime, setNewSubjectEndTime] = useState("10:00 AM");

  const [scheduledSubjects, setScheduledSubjects] = useState<ExamSubjectRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    fetchAdminContext(userId)
      .then((ctx) => {
        setCollegeId(ctx.collegeId);
        setAdminId(ctx.adminId);
        loadTableSchedules(ctx.collegeId, currentPage, tableEduFilter);
        fetchCustomExamTypes(ctx.collegeId)
          .then((types) => setCustomExamTypes(types))
          .catch((err) => console.error("Error loading custom exam types:", err));
        return fetchEducations(ctx.collegeId);
      })
      .then((eduList) => {
        setEducations(eduList);
        if (eduList.length > 0) {
          setPrevSchedulesEduSelect(eduList[0].collegeEducationId);
        }
      })
      .catch((err) => {
        console.error("Error loading initial data:", err);
      })
      .finally(() => {
        setPageLoading(false);
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
        if (branchSelect && !branchList.some((b: any) => b.collegeBranchId === branchSelect)) {
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
    const isSchool = isSchoolEducation(activeEdu?.collegeEducationType || "unknown");
    
    let isValid = false;
    if (!showDateRangePicker && collegeId && educationSelect) {
      if (isSchool) {
        isValid = true;
      } else if (branchSelect) {
        isValid = true;
      }
    }

    if (!isValid || !collegeId || !educationSelect) {
      setAcademicYears([]);
      setCurrentAcademicYearId(null);
      return;
    }
    
    fetchAcademicYears(collegeId, educationSelect, isSchool ? null : branchSelect)
      .then((yearList) => {
        setAcademicYears(yearList);
        const matchedYear = yearList.find((y: any) => y.collegeAcademicYear === yearSelect);
        if (matchedYear) {
          setCurrentAcademicYearId(matchedYear.collegeAcademicYearId);
        } else {
          setCurrentAcademicYearId(null);
          if (yearSelect && !yearList.some((y: any) => y.collegeAcademicYear === yearSelect)) {
            setYearSelect("");
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching academic years:", err);
      });
  }, [collegeId, educationSelect, branchSelect, yearSelect, showDateRangePicker, activeEdu]);

  useEffect(() => {
    const isSchool = isSchoolEducation(activeEdu?.collegeEducationType || "unknown");
    const isInter = activeEdu?.collegeEducationType === "Inter";

    let isValid = false;
    if (!showDateRangePicker && collegeId && educationSelect && currentAcademicYearId) {
      if (isSchool) {
        isValid = true;
      } else if (branchSelect) {
        isValid = true;
      }
    }

    if (!isValid || !collegeId || !educationSelect || !currentAcademicYearId) {
      setSemesters([]);
      setSections([]);
      return;
    }

    if (!isSchool && !isInter) {
      fetchSemesters(collegeId, educationSelect, currentAcademicYearId)
        .then((semList) => {
          setSemesters(semList);
          if (semesterSelect && !semList.some((s: any) => s.collegeSemesterId === semesterSelect)) {
            setSemesterSelect(null);
          }
        })
        .catch((err) => console.error("Error fetching semesters:", err));
    } else {
      setSemesters([]);
      setSemesterSelect(null);
    }

    fetchSections(collegeId, educationSelect, isSchool ? null : branchSelect, currentAcademicYearId)
      .then((secList) => {
        setSections(secList);
        if (sectionSelect.length > 0) {
          const validSections = sectionSelect.filter((id) => secList.some((s: any) => s.collegeSectionsId === id));
          if (validSections.length !== sectionSelect.length) {
            setSectionSelect(validSections);
          }
        }
      })
      .catch((err) => console.error("Error fetching sections:", err));
  }, [collegeId, educationSelect, branchSelect, currentAcademicYearId, showDateRangePicker, activeEdu]);

  useEffect(() => {
    const isSchool = isSchoolEducation(activeEdu?.collegeEducationType || "unknown");
    const isInter = activeEdu?.collegeEducationType === "Inter";
    
    let isValid = false;
    if (!showDateRangePicker && collegeId && educationSelect && currentAcademicYearId) {
      if (isSchool) {
        isValid = true;
      } else if (isInter) {
        if (branchSelect) isValid = true;
      } else {
        if (branchSelect && semesterSelect) isValid = true;
      }
    }

    if (!isValid || !collegeId || !educationSelect || !currentAcademicYearId) {
      setSubjectsList([]);
      return;
    }

    fetchSubjects(
      collegeId,
      educationSelect,
      isSchool ? null : branchSelect,
      currentAcademicYearId,
      isSchool || isInter ? null : semesterSelect
    )
      .then((subs) => {
        setSubjectsList(subs);
      })
      .catch((err) => console.error("Error fetching subjects:", err));
  }, [collegeId, educationSelect, branchSelect, currentAcademicYearId, semesterSelect, showDateRangePicker, activeEdu]);

  useEffect(() => {
    if (editingScheduleId !== null) return;
    if (subjectsList.length > 0) {
      const initialRows: ExamSubjectRow[] = subjectsList.map((sub, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        
        return {
          subject: sub.subjectName,
          examDate: `${dd}/${mm}/${yyyy}`,
          time: "09:00 AM",
          endTime: "10:00 AM",
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
    if (!showDateRangePicker && sectionSelect.length === 0) {
      toast.error("Please select at least one section.");
      return;
    }
    const isInter = educations.find((e) => e.collegeEducationId === educationSelect)?.collegeEducationType === "Inter";
    if (!showDateRangePicker && !isSchool && (branchSelect === null || (!isInter && semesterSelect === null))) {
      toast.error(isInter ? "Please select a group." : "Please select branch and semester.");
      return;
    }
    if (!showDateRangePicker && !isSchool && !isInter && !yearSelect) {
      toast.error("Please select an academic year.");
      return;
    }
    if (showDateRangePicker && (!fromDate || !toDate)) {
      toast.error("Please enter From Date and To Date.");
      return;
    }
    if (showDateRangePicker) {
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

      if (isCustomExamType) {
        await createCustomExamType(collegeId, finalExamType, adminId);
        const updatedTypes = await fetchCustomExamTypes(collegeId);
        setCustomExamTypes(updatedTypes);
        setIsCustomExamType(false);
      }

      const schedulePayload = {
        scheduleTitle: scheduleTitle.trim(),
        collegeId,
        collegeEducationId: educationSelect || 0,
        collegeBranchId: (showDateRangePicker || isSchool) ? null : branchSelect,
        academicYear: showDateRangePicker ? null : yearSelect,
        collegeSectionsId: showDateRangePicker ? null : sectionSelect[0] ?? null,
        collegeSectionIds: showDateRangePicker ? [] : sectionSelect,
        collegeSemesterId: (showDateRangePicker || isInter || isSchool) ? null : semesterSelect,
        examType: finalExamType,
        fromDate: showDateRangePicker ? fromDate : null,
        toDate: showDateRangePicker ? toDate : null,
        createdBy: adminId,
      };

      let subjectsPayload = scheduledSubjects.map((sub) => ({
        subject: sub.subject,
        examDate: sub.examDate,
        time: sub.time,
        endTime: sub.endTime,
      }));

      if (showDateRangePicker) {
        subjectsPayload = [
          { subject: "DATE_RANGE_START", examDate: fromDate, time: "00:00", endTime: "" },
          { subject: "DATE_RANGE_END", examDate: toDate, time: "00:00", endTime: "" },
        ];
      }

      const entityName = isSchool ? "School" : "College";

      if (editingScheduleId !== null) {
        await updateExamSchedule(editingScheduleId, schedulePayload, subjectsPayload);
        toast.success(`${entityName} exam schedule "${scheduleTitle}" updated successfully!`);
        setEditingScheduleId(null);
      } else {
        await createExamSchedule(schedulePayload, subjectsPayload);
        toast.success(`${entityName} exam schedule "${scheduleTitle}" created successfully!`);
      }
      setScheduleTitle("");
      setScheduledSubjects([]);
      setFromDate("");
      setToDate("");
      setExamTypeSelect("Select");
      setBranchSelect(null);
      setYearSelect("");
      setSemesterSelect(null);
      setSectionSelect([]);
      setEducationSelect(null);
      if (educations.length > 0) {
        setPrevSchedulesEduSelect(educations[0].collegeEducationId);
      }
      if (collegeId) {
        loadTableSchedules(collegeId, currentPage, tableEduFilter);
      }
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      if (error?.code === "23505") {
        if (error.message?.includes("title") || error.message?.includes("unique_college_exam_schedule_title")) {
          toast.error("An exam schedule with this title already exists.");
        } else if (error.message?.includes("type") || error.message?.includes("unique_college_exam_type")) {
          toast.error("This exam type already exists.");
        } else {
          toast.error("A duplicate entry exists. Please ensure unique inputs.");
        }
      } else {
        toast.error("Failed to save schedule. Please check your inputs or try again.");
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

    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(newSubjectTime);
    const endMinutes = parseTime(newSubjectEndTime);

    if (endMinutes <= startMinutes) {
      toast.error("End Time must be later than Start Time.");
      return;
    }

    const newRow: ExamSubjectRow = {
      subject: newSubjectName,
      examDate: newSubjectDate,
      time: newSubjectTime,
      endTime: newSubjectEndTime,
      status: "Upcoming",
    };

    setScheduledSubjects((prev) => [...prev, newRow]);
    setIsAddSubjectOpen(false);
    setNewSubjectName("");
    toast.success(`Subject "${newSubjectName}" added to the schedule.`);
  };

  const paginatedSchedules = examSchedules;

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
        <div className="lg:col-span-2 h-fit">
          <ExamForm
            scheduleTitle={scheduleTitle}
            setScheduleTitle={setScheduleTitle}
            educations={educations}
            educationSelect={educationSelect}
            setEducationSelect={setEducationSelect}
            isSchool={isSchool}
            isInter={isInterGlobal}
            examTypeSelect={examTypeSelect}
            setExamTypeSelect={setExamTypeSelect}
            isCustomExamType={isCustomExamType}
            setIsCustomExamType={setIsCustomExamType}
            customExamTypes={customExamTypes}
            setCustomExamTypes={setCustomExamTypes}
            showDateRangePicker={showDateRangePicker}
            setShowDateRangePicker={setShowDateRangePicker}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            branches={branches}
            branchSelect={branchSelect}
            setBranchSelect={setBranchSelect}
            academicYears={academicYears}
            yearSelect={yearSelect}
            setYearSelect={setYearSelect}
            semesters={semesters}
            semesterSelect={semesterSelect}
            setSemesterSelect={setSemesterSelect}
            sections={sections}
            sectionSelect={sectionSelect}
            setSectionSelect={setSectionSelect}
            scheduledSubjects={scheduledSubjects}
            setScheduledSubjects={setScheduledSubjects}
            editingScheduleId={editingScheduleId}
            setIsAddSubjectOpen={setIsAddSubjectOpen}
            setNewSubjectName={setNewSubjectName}
            setNewSubjectDate={setNewSubjectDate}
            setNewSubjectTime={setNewSubjectTime}
            setNewSubjectEndTime={setNewSubjectEndTime}
            loading={loading}
            handleCreateSchedule={handleCreateSchedule}
          />
        </div>

        <PreviousSchedulesCard
          collegeId={collegeId}
          educations={educations}
          prevSchedulesEduSelect={prevSchedulesEduSelect}
          setPrevSchedulesEduSelect={setPrevSchedulesEduSelect}
          prevSchedulesBranches={prevSchedulesBranches}
          isSchoolForPrev={isSchoolForPrev}
          prevSchedulesLevel={prevSchedulesLevel}
          setPrevSchedulesLevel={setPrevSchedulesLevel}
          drillDownBranch={drillDownBranch}
          setDrillDownBranch={setDrillDownBranch}
          drillDownYear={drillDownYear}
          setDrillDownYear={setDrillDownYear}
          sideSchedules={sideSchedules}
          sideLoading={sideLoading}
          pageLoading={pageLoading}
          handleSideScroll={handleSideScroll}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          setBranchSelect={setBranchSelect}
          handleYearSelect={handleYearSelect}
          handleEditSchedule={handleEditSchedule}
        />
      </div>

      <ExamSchedulesTable
        tableEduFilter={tableEduFilter}
        setTableEduFilter={setTableEduFilter}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        educations={educations}
        tableLoading={tableLoading}
        paginatedSchedules={paginatedSchedules}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onEditSchedule={handleEditSchedule}
        onDeleteSchedule={(id, title) => {
          setScheduleToDelete({ id, title });
          setIsDeleteModalOpen(true);
        }}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSubmit={handleAddSubjectSubmit}
        subjectsList={subjectsList}
        newSubjectName={newSubjectName}
        setNewSubjectName={setNewSubjectName}
        newSubjectDate={newSubjectDate}
        setNewSubjectDate={setNewSubjectDate}
        newSubjectTime={newSubjectTime}
        setNewSubjectTime={setNewSubjectTime}
        newSubjectEndTime={newSubjectEndTime}
        setNewSubjectEndTime={setNewSubjectEndTime}
      />

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
