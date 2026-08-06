"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  BookOpenText,
  CaretLeft,
  Check,
  Prohibit,
  User,
  UsersThree,
  X,
  CaretDown,
} from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";

import {
  getAdminClassesForSection,
  getStudentsForClass,
  saveAttendance,
  UIStudent,
} from "@/lib/helpers/admin/attendance/adminAttendanceActions";
import { useAttendanceRealtime, recalculateAttendancePercentage } from "@/lib/helpers/faculty/attendance/liveAttendanceAPI";
import StuAttendanceTable from "../tables/stuAttendanceTable";
import StudentAttendanceDetailsPage from "../components/stuSubjectWise";
import CardComponent from "../components/cards";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import StuTableShimmer from "./stuTableShimmer";

interface SubjectWiseAttendanceProps {
  onBack: () => void;
}

const SubjectWiseAttendance = ({ onBack }: SubjectWiseAttendanceProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const branch = searchParams.get("branch");
  const section = searchParams.get("section");
  const year = searchParams.get("year");
  const totalStudents = searchParams.get("students");
  const totalSubjects = searchParams.get("subjects");
  const below75 = searchParams.get("below75");
  const totalFaculties = searchParams.get("faculties");
  const collegeSectionsId = Number(searchParams.get("collegeSectionsId"));
  const selectedStudentId = searchParams.get("studentId");

  const urlDate = searchParams.get("date");
  const urlType = searchParams.get("type") as "Single" | "Bulk" | null;
  const urlCId = searchParams.get("cId");
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlLimit = parseInt(searchParams.get("limit") || "20", 10);

  const [selectedDate, setSelectedDate] = useState<Date>(urlDate ? new Date(urlDate) : new Date());
  const [calendarType, setCalendarType] = useState<"Single" | "Bulk">(urlType || "Single");
  const [selectedClassId, setSelectedClassId] = useState<string>(urlCId || "");
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [itemsPerPage, setItemsPerPage] = useState(urlLimit);

  useEffect(() => {
    if (urlDate) setSelectedDate(new Date(urlDate));
    if (urlType) setCalendarType(urlType);
    if (urlCId !== null) setSelectedClassId(urlCId);
    if (urlPage) setCurrentPage(urlPage);
    if (urlLimit) setItemsPerPage(urlLimit);
  }, [urlDate, urlType, urlCId, urlPage, urlLimit]);

  const [draftEdits, setDraftEdits] = useState<Record<string, { attendance: string, reason: string }>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCancellingMode, setIsCancellingMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { adminId, collegeEducationType } = useAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);

  const isBulk = selectedClassId.startsWith("bulk-");
  const eventIdPart = isBulk ? selectedClassId.split("-")[1] : selectedClassId.split("-")[0];
  const parsedEventId = eventIdPart ? parseInt(eventIdPart) : null;

  const today = new Date();
  const isFutureDate =
    selectedDate.getFullYear() > today.getFullYear() ||
    (selectedDate.getFullYear() === today.getFullYear() && selectedDate.getMonth() > today.getMonth()) ||
    (selectedDate.getFullYear() === today.getFullYear() && selectedDate.getMonth() === today.getMonth() && selectedDate.getDate() > today.getDate());

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const { data: classOptionsRaw = [], isLoading: classesLoading, isFetching: classesFetching } = useQuery({
    queryKey: ["adminClassesForSection", collegeSectionsId, dateStr],
    queryFn: () => getAdminClassesForSection(collegeSectionsId, dateStr),
    enabled: !!collegeSectionsId,
    placeholderData: keepPreviousData,
  });

  const classOptions = classOptionsRaw.filter(c => calendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-"));

  const { data: allStudentsRaw = { data: [], totalCount: 0 }, isLoading: studentsLoading, isFetching: studentsFetching } = useQuery({
    queryKey: ["adminStudentsForClass", selectedClassId, collegeSectionsId, currentPage, itemsPerPage],
    queryFn: () => getStudentsForClass(selectedClassId, String(collegeSectionsId), currentPage, itemsPerPage),
    enabled: !!selectedClassId && !!collegeSectionsId,
    placeholderData: keepPreviousData,
  });

  const totalCount = !selectedClassId ? 0 : allStudentsRaw.totalCount;
  const paginatedStudents = allStudentsRaw.data;

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (classOptions.length > 0 && !classOptions.some(c => c.id === selectedClassId)) {
      setSelectedClassId(classOptions[0].id);
      setCurrentPage(1);
      setDraftEdits({});
    } else if (classOptions.length === 0) {
      setSelectedClassId("");
    }
  }, [classOptions, classOptionsRaw, selectedClassId, calendarType]);

  const handleFilterChange = (
    type: "calendarType" | "class" | "date",
    value: string,
  ) => {
    if (type === "date") {
      updateUrlParams({ date: value, cId: "", page: "1" });
    } else if (type === "calendarType") {
      updateUrlParams({ type: value, cId: "", page: "1" });
    } else if (type === "class") {
      updateUrlParams({ cId: value, page: "1" });
    }
    setCurrentPage(1);
    setDraftEdits({});
    setIsEditing(false);
  };

  useAttendanceRealtime(
    parsedEventId,
    isBulk,
    (payload: any) => {
      const newRecord = payload.new;
      if (newRecord && newRecord.studentId) {
        let matchedStudentName = "";
        let status = "Not Marked";

        setDraftEdits((prev) => {
          const newDrafts = { ...prev };
          const sId = String(newRecord.studentId);
          
          const upperStatus = newRecord.status?.toUpperCase();
          if (upperStatus === "PRESENT") status = "Present";
          else if (upperStatus === "LATE") status = "Late";
          else if (upperStatus === "ABSENT") status = "Absent";

          if (!prev[sId] || prev[sId].attendance !== status) {
            newDrafts[sId] = { ...prev[sId], attendance: status, reason: newRecord.reason || "" };
            const student = paginatedStudents?.find((s: any) => s.id === sId);
            if (student) matchedStudentName = student.name;
          }
          return newDrafts;
        });

        if (matchedStudentName) {
          setTimeout(() => {
            toast.success(`${matchedStudentName} was marked ${status}!`, { id: `bio-${newRecord.studentId}` });
          }, 0);
        }
      }
    }
  );

  const studentsList = !selectedClassId ? [] : paginatedStudents.map((s) => {
    const draft = draftEdits[s.id];
    let newPercentage = s.percentage;
    let newStats = s.stats;
    
    if (draft && draft.attendance !== s.attendance && s.stats) {
      const recalc = recalculateAttendancePercentage(s.attendance, draft.attendance, s.stats);
      newPercentage = recalc.newPercentage;
      newStats = recalc.newStats;
    }
    
    return draft ? { ...s, attendance: draft.attendance as any, reason: draft.reason, percentage: newPercentage, stats: newStats } : s;
  });

  const handleSetStudents = (updater: UIStudent[] | ((prev: UIStudent[]) => UIStudent[])) => {
    setDraftEdits((prevDrafts) => {
      const currentList = studentsList;
      const nextList = typeof updater === "function" ? updater(currentList) : updater;
      
      const newDrafts = { ...prevDrafts };
      nextList.forEach((s) => {
        newDrafts[s.id] = { attendance: s.attendance, reason: s.reason };
      });
      return newDrafts;
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    const unmarked = studentsList.filter((s) => s.attendance === "Not Marked");
    if (unmarked.length > 0) {
      toast.error(`Mark ${unmarked.length} students first.`);
      return;
    }

    setSaving(true);
    try {
      const payload = Object.entries(draftEdits).map(([id, draft]) => ({
        studentId: id,
        adminId: adminId ?? undefined,
        status: draft.attendance,
        reason: draft.reason,
      }));

      if (payload.length === 0) {
        toast.success("No changes to save!");
        setIsEditing(false);
        return;
      }

      const result = await saveAttendance(selectedClassId, payload);
      if (!result.success) throw new Error(result.error);
      
      queryClient.invalidateQueries({ queryKey: ["adminStudentsForClass"] });
      
      toast.success("Attendance Updated!");
      setIsEditing(false);
      setDraftEdits({});
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmClassCancel = () => {
    if (!cancelReason.trim()) {
      toast.error("Enter a reason");
      return;
    }
    handleSetStudents((prev) => 
      prev.map((s) => ({
        ...s,
        attendance: "Class Cancel" as any,
        reason: cancelReason,
      }))
    );
    setIsCancellingMode(false);
    toast("Marked as Cancelled. Click Save.", { icon: "⚠️" });
  };

  const closeStudentOverlay = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("studentId");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (selectedStudentId) {
    return <StudentAttendanceDetailsPage onBack={closeStudentOverlay} />;
  }

  const cardData = [
    {
      id: "1",
      style: "bg-[#FFEDDA]",
      icon: <UsersThree size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#FFBB70",
      value: totalStudents || 0,
      label: "Total Students",
    },
    {
      id: "2",
      style: "bg-[#E6FBEA]",
      icon: <BookOpenText size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#43C17A",
      value: totalSubjects || 0,
      label: "Total Subjects",
    },
    {
      id: "3",
      style: "bg-[#FFE0E0] ",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#FF2020",
      value: below75 || 0,
      label: "Students below 75%",
    },
    {
      id: "4",
      style: "bg-[#CEE6FF]",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#60AEFF",
      value: totalFaculties || 0,
      label: "Total Faculties",
    },
  ];

  return (
    <div className="flex flex-col m-4 relative min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-3 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div className="flex items-center gap-2 group w-fit">
            <div className="flex items-center gap-2 group w-fit ">
              <CaretLeft
                size={20}
                weight="bold"
                onClick={onBack}
                className="text-[#2D3748] cursor-pointer hover:-translate-x-1 transition-transform"
              />
              <h1 className="text-xl font-bold text-[#282828]">
                {isSchool ? `${year || 'Class'} — Subject-wise Attendance` : `${branch} ${collegeEducationType === "Inter" ? "Group" : "Branch"} — Subject-wise Attendance`}
              </h1>
            </div>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            Manage attendance for {year}, Section {section}.
          </p>
        </div>
        <div className="w-80">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      <div className="flex mb-3 items-center gap-3 bg-gray-100 rounded-md p-2 w-fit">
        <span
          onClick={onBack}
          className="text-green-500 text-sm font-medium cursor-pointer hover:underline"
        >
          Attendance Overview
        </span>

        <svg className="w-4 h-4 fill-green-500" viewBox="0 0 24 24">
          <path d="M8 5l8 7-8 7" />
        </svg>

        <span className="text-slate-800 text-sm font-medium">
          {isSchool ? `${year || 'Class'}` : `${branch} ${collegeEducationType === "Inter" ? "Group" : "Branch"}`}
        </span>
      </div>

      <div className="flex gap-4 w-full mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
          {cardData.map((item, index) => (
            <CardComponent
              key={index}
              style={`${item.style} h-[156px]`}
              icon={item.icon}
              iconBgColor={item.iconBgColor}
              value={item.value}
              label={item.label}
            />
          ))}
        </div>
        <div>
          <WorkWeekCalendar 
            style="h-full w-[350px]" 
            activeDate={selectedDate}
            onDateSelect={(date) => {
              const localDate = new Date(date);
              localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
              handleFilterChange("date", localDate.toISOString().split("T")[0]);
            }}
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 justify-between">
            <div className="relative">
              <select
                value={calendarType}
                onChange={(e) => {
                  handleFilterChange("calendarType", e.target.value);
                }}
                className="appearance-none rounded-full bg-[#43C17A1C] pl-4 pr-8 py-1.5 text-[#43C17A] outline-none border-none font-medium cursor-pointer text-sm min-w-[100px]"
              >
                <option value="Single">Single</option>
                <option value="Bulk">Bulk</option>
              </select>
              <CaretDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                size={12}
                weight="bold"
              />
            </div>

            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => handleFilterChange("class", e.target.value)}
                className="appearance-none rounded-full bg-[#43C17A1C] pl-4 pr-8 py-1.5 text-[#43C17A] outline-none border-none font-medium cursor-pointer text-sm min-w-[180px]"
              >
                {classOptions.length > 0 ? (
                  classOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))
                ) : (
                  <option value="">No classes found</option>
                )}
              </select>
              <CaretDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                size={12}
                weight="bold"
              />
            </div>

            {isEditing && !isCancellingMode && selectedClassId && (
              <button
                onClick={() => {
                  setCancelReason("");
                  setIsCancellingMode(true);
                }}
                className="flex items-center gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                <Prohibit size={18} weight="bold" /> Cancel Class
              </button>
            )}

            {isCancellingMode && (
              <div className="flex items-center text-black gap-2 animate-in fade-in slide-in-from-right-4">
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:border-red-400"
                  autoFocus
                />
                <button
                  onClick={confirmClassCancel}
                  className="bg-green-500 text-white p-2 rounded-lg"
                >
                  <Check size={18} weight="bold" />
                </button>
                <button
                  onClick={() => setIsCancellingMode(false)}
                  className="bg-gray-200 text-gray-600 p-2 rounded-lg"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        {classOptions.length > 0 || classesLoading || classesFetching || studentsLoading || studentsFetching ? (
          <>
            <StuAttendanceTable
              loadingData={classesLoading || classesFetching || studentsLoading || studentsFetching}
              isFutureDate={isFutureDate}
              students={studentsList}
              setStudents={handleSetStudents}
              handleSaveAttendance={handleSaveAttendance}
              saving={saving}
              isTopicMode={true}
              isEditing={isEditing && !isFutureDate}
              onEditClick={() => {
                if (isFutureDate) {
                  toast.error("Cannot edit attendance for future dates.");
                  return;
                }
                setIsEditing(true);
              }}
            />
            <div className="flex justify-center items-center mt-2 w-full rounded-lg shadow-sm mb-6">
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => {
                  updateUrlParams({ page: String(p) });
                  setCurrentPage(p);
                }}
                itemsPerPageOptions={[10, 20, 50, 100]}
                onItemsPerPageChange={(newLimit) => {
                  updateUrlParams({ limit: String(newLimit), page: "1" });
                  setItemsPerPage(newLimit);
                  setCurrentPage(1);
                }}
                alwaysShow={true}
                roundedBottom="rounded-lg"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">
              No students found or no class selected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectWiseAttendance;
