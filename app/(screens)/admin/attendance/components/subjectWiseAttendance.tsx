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

const TOAST_IDS = {
  NO_CLASSES: "no_classes_today",
  LOAD_ERROR: "load_section_error",
  STUDENT_LOAD_ERROR: "student_load_error",
};

const SubjectWiseAttendance = ({ onBack }: SubjectWiseAttendanceProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const branch = searchParams.get("branch");
  const section = searchParams.get("section");
  const year = searchParams.get("year");
  const totalStudents = searchParams.get("students");
  const totalSubjects = searchParams.get("subjects");
  const below75 = searchParams.get("below75");
  const totalFaculties = searchParams.get("faculties");
  const collegeSectionsId = Number(searchParams.get("collegeSectionsId"));
  const selectedStudentId = searchParams.get("studentId");

  const [loading, setLoading] = useState(true);
  const [classOptions, setClassOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [studentsList, setStudentsList] = useState<UIStudent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarType, setCalendarType] = useState<"Single" | "Bulk">("Single");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCancellingMode, setIsCancellingMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { adminId, collegeEducationType } = useAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);

  const isBulk = selectedClassId.startsWith("bulk-");
  const eventIdPart = isBulk ? selectedClassId.split("-")[1] : selectedClassId.split("-")[0];
  const parsedEventId = eventIdPart ? parseInt(eventIdPart) : null;

  useAttendanceRealtime(
    parsedEventId,
    isBulk,
    (payload: any) => {
      const newRecord = payload.new;
      if (newRecord && newRecord.studentId) {
        let matchedStudentName = "";
        let status = "Not Marked";

        setStudentsList((prev) => {
          return prev.map((s) => {
            if (s.id === String(newRecord.studentId)) {
              const upperStatus = newRecord.status?.toUpperCase();
              if (upperStatus === "PRESENT") status = "Present";
              else if (upperStatus === "LATE") status = "Late";
              else if (upperStatus === "ABSENT") status = "Absent";
              
              if (s.attendance !== status) {
                matchedStudentName = s.name;
              }

              let newPercentage = s.percentage;
              let newStats = s.stats;
              if (s.stats) {
                const recalc = recalculateAttendancePercentage(
                  s.attendance,
                  newRecord.status,
                  s.stats
                );
                newPercentage = recalc.newPercentage;
                newStats = recalc.newStats;
              }
              
              return {
                ...s,
                attendance: status as any,
                reason: newRecord.reason || "",
                percentage: newPercentage,
                stats: newStats,
              };
            }
            return s;
          });
        });

        if (matchedStudentName) {
          setTimeout(() => {
            toast.success(`${matchedStudentName} was marked ${status}!`, { id: `bio-${newRecord.studentId}` });
          }, 0);
        }
      }
    }
  );

  useEffect(() => {
    if (!collegeSectionsId) return;

    const init = async () => {
      setLoading(true);
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const classes = await getAdminClassesForSection(collegeSectionsId, dateStr);
        setClassOptions(classes);

        const filtered = classes.filter(c => calendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-"));

        if (filtered.length > 0) {
          const firstClass = filtered[0];
          setSelectedClassId(firstClass.id);
        } else {
          setStudentsList([]);
          setSelectedClassId("");
          toast("No classes scheduled for this date", {
            icon: "ℹ️",
            id: TOAST_IDS.NO_CLASSES,
          });
        }
      } catch (err) {
        toast.error("Failed to load section data", {
          id: TOAST_IDS.LOAD_ERROR,
        });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [collegeSectionsId, selectedDate]);

  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    setIsEditing(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!selectedClassId) {
      setStudentsList([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const loadStudents = async () => {
      try {
        const { data, totalCount: count } = await getStudentsForClass(
          selectedClassId,
          String(collegeSectionsId),
          currentPage,
          itemsPerPage
        );
        if (isMounted) {
          setStudentsList(data);
          setTotalCount(count);
        }
      } catch (err) {
        if (isMounted) {
          toast.error("Failed to load students", {
            id: TOAST_IDS.STUDENT_LOAD_ERROR,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [selectedClassId, collegeSectionsId, currentPage, itemsPerPage]);

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    const unmarked = studentsList.filter((s) => s.attendance === "Not Marked");
    if (unmarked.length > 0) {
      toast.error(`Mark ${unmarked.length} students first.`);
      return;
    }

    setSaving(true);
    try {
      const payload = studentsList.map((s) => ({
        studentId: s.id,
        status: s.attendance,
        reason: s.reason,
        adminId: adminId ?? undefined,
      }));
      const result = await saveAttendance(selectedClassId, payload);
      if (!result.success) throw new Error(result.error);
      toast.success("Attendance Updated!");
      setIsEditing(false);
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
    const updatedList = studentsList.map((s) => ({
      ...s,
      attendance: "Class Cancel" as const,
      reason: cancelReason,
    }));
    setStudentsList(updatedList);
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
                {isSchool ? `${year || 'Class'} — Subject-wise Attendance` : `${branch} Branch — Subject-wise Attendance`}
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

      <div className="flex mb-3 items-center gap-3 bg-gray-100 rounded-md">
        <span
          onClick={onBack}
          className="text-green-500 text-sm font-medium cursor-pointer"
        >
          Attendance Overview
        </span>

        <svg className="w-4 h-4 fill-green-500" viewBox="0 0 24 24">
          <path d="M8 5l8 7-8 7" />
        </svg>

        <span className="text-slate-800 text-sm font-medium">
          {isSchool ? `${year || 'Class'}` : `${branch} Branch`}
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
            onDateSelect={(date) => setSelectedDate(date)}
          />
        </div>
      </div>

      <div className=" flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 justify-between">
            <div className="relative">
              <select
                value={calendarType}
                onChange={(e) => {
                  const type = e.target.value as "Single" | "Bulk";
                  setCalendarType(type);
                  const filtered = classOptions.filter(c => type === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-"));
                  if (filtered.length > 0) {
                    handleClassChange(filtered[0].id);
                  } else {
                    handleClassChange("");
                  }
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
                onChange={(e) => handleClassChange(e.target.value)}
                className="appearance-none rounded-full bg-[#43C17A1C] pl-4 pr-8 py-1.5 text-[#43C17A] outline-none border-none font-medium cursor-pointer text-sm min-w-[180px]"
              >
                {classOptions.filter(c => calendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-")).length > 0 ? (
                  classOptions.filter(c => calendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-")).map((c) => (
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

        {loading ? (
          <div className="w-full mt-4">
            <StuTableShimmer />
          </div>
        ) : studentsList.length > 0 ? (
          <>
            <StuAttendanceTable
              students={studentsList}
              setStudents={setStudentsList}
              handleSaveAttendance={handleSaveAttendance}
              saving={saving}
              isTopicMode={true}
              isEditing={isEditing}
              onEditClick={() => setIsEditing(true)}
            />
            <div className="flex justify-center items-center mt-2 w-full rounded-lg shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemsPerPageOptions={[10, 20, 50, 100]}
                onItemsPerPageChange={(newLimit) => {
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
