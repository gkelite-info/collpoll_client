"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  CaretLeft,
  ChartLineDown,
  Check,
  Prohibit,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./components/stuAttendanceCard";
import StuAttendanceTable from "./components/stuAttendanceTable";
import {
  getClassDetails,
  UpcomingLesson,
} from "@/lib/helpers/faculty/attendance/getClasses";
import toast, { Toaster } from "react-hot-toast";
import {
  getStudentsForClass,
  saveAttendance,
  UIStudent,
  ClassOption,
  SectionOption,
  getFacultyClasses,
  getClassSections,
} from "@/lib/helpers/faculty/attendance/attendanceActions";
import AttendanceSkeleton from "./shimmer/attendanceSkeleton";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { Loader } from "../../(student)/calendar/right/timetable";
import { useAttendanceRealtime, recalculateAttendancePercentage } from "@/lib/helpers/faculty/attendance/liveAttendanceAPI";

function AttendanceContent() {
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get("classId");
  const router = useRouter();
  const { facultyId, loading: contextLoading } = useFaculty();

  const [classData, setClassData] = useState<UpcomingLesson | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [studentsList, setStudentsList] = useState<UIStudent[]>([]);
  const [saving, setSaving] = useState(false);

  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarType, setSelectedCalendarType] = useState<"Single" | "Bulk">("Single");

  const [isEditing, setIsEditing] = useState(false);
  const [isCancellingMode, setIsCancellingMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const activeClassId = urlClassId || selectedClassId;
  const isTopicMode = !!urlClassId;

  const isBulk = activeClassId ? activeClassId.startsWith("bulk-") : false;
  const eventId = activeClassId ? parseInt(isBulk ? activeClassId.split("-")[1] : activeClassId.split("-")[0]) : null;

  useAttendanceRealtime(
    eventId,
    isBulk,
    (payload) => {
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

        // Trigger toast asynchronously to prevent React render-phase side-effect warning
        if (matchedStudentName) {
          setTimeout(() => {
            toast.success(`${matchedStudentName} was marked ${status}!`, { id: `bio-${newRecord.studentId}` });
          }, 0);
        }
      }
    }
  );

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

  const loadStudents = async (cId: string, sId?: string) => {
    setTableLoading(true);

    try {
      const students = await getStudentsForClass(cId, sId);

      if (!students || students.length === 0) {
        setStudentsList([]);
      } else {
        setStudentsList(students);
      }

      const cData = await getClassDetails(cId);
      setClassData(cData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load students");
      setStudentsList([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (urlClassId) {
      setSelectedClassId(urlClassId);
      loadStudents(urlClassId).finally(() => setInitialized(true));
      setIsEditing(true);
    }
  }, [urlClassId]);

  useEffect(() => {
    if (urlClassId) return;
    if (contextLoading || !facultyId) return;

    async function loadClassesForDate() {
      try {
        setLoading(true);
        const dateStr = `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, "0")}-${String(selectedCalendarDate.getDate()).padStart(2, "0")}`;
        const classes = await getFacultyClasses(facultyId!, dateStr);
        setClassOptions(classes);

        const filteredClasses = classes.filter(c => selectedCalendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-"));

        if (filteredClasses.length === 0) {
          setStudentsList([]);
          setSelectedClassId("");
          setSelectedSectionId("");
          setSectionOptions([]);
          setClassData(null);
          return;
        }

        const firstClass = filteredClasses[0];
        setSelectedClassId(firstClass.id);

        const sections = await getClassSections(firstClass.id);
        setSectionOptions(sections);

        const firstSec = sections.length > 0 ? sections[0].id : "";
        setSelectedSectionId(firstSec);

        await loadStudents(firstClass.id, firstSec);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }

    loadClassesForDate();
  }, [selectedCalendarDate, facultyId, contextLoading, urlClassId, selectedCalendarType]);

  const handleFilterChange = async (
    type: "class" | "section" | "calendarType",
    value: string,
  ) => {
    if (type === "calendarType") {
      setSelectedCalendarType(value as "Single" | "Bulk");
    } else if (type === "class") {
      setSelectedClassId(value);
      const sections = await getClassSections(value);
      setSectionOptions(sections);
      const firstSec = sections.length > 0 ? sections[0].id : "";
      setSelectedSectionId(firstSec);
      loadStudents(value, firstSec);
    } else {
      setSelectedSectionId(value);
      loadStudents(selectedClassId, value);
    }
    setIsEditing(false);
  };

  const handleSaveAttendance = async () => {
    if (!activeClassId) return;
    const unmarked = studentsList.filter((s) => s.attendance === "Not Marked");
    if (unmarked.length > 0) {
      toast.error(`Mark ${unmarked.length} students first.`);
      return;
    }
    setSaving(true);
    try {
      const payload = studentsList.map((s) => ({
        studentId: s.id,
        facultyId: facultyId!,
        status: s.attendance,
        reason: s.reason,
      }));
      const result = await saveAttendance(activeClassId, payload);
      if (!result.success) throw new Error(result.error);
      toast.success("Saved!");
      setIsEditing(false);

      await loadStudents(activeClassId, selectedSectionId);

      if (urlClassId) setTimeout(() => router.push("/faculty"), 2000);
    } catch (error: any) {
      let errorMsg = "An unexpected error occurred while saving attendance.";
      if (error.message) {
        if (error.message.includes("unique constraint") || error.message.includes("duplicate key")) {
          errorMsg = "Attendance for this class has already been recorded and cannot be duplicated.";
        } else {
          errorMsg = error.message;
        }
      }
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push("/faculty");

  const topicName = classData?.description || "Select a Class";
  const classTime = classData
    ? `${classData.fromTime} - ${classData.toTime}`
    : "-- : --";
  const attendanceStats = studentsList.reduce(
    (acc, s) => {
      if (s.attendance === "Present") acc.present++;
      if (s.attendance === "Absent") acc.absent++;
      if (s.attendance === "Leave") acc.leave++;
      return acc;
    },
    { present: 0, absent: 0, leave: 0 },
  );

  const baseCardData: CardProps[] = [
    {
      value: String(studentsList.length),
      label: "Total Students",
      bgColor: "bg-[#FFEDDA]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#FFBB70]",
      iconColor: "text-white",
    },
    {
      value: String(attendanceStats.present),
      label: "Total Students Present",
      bgColor: "bg-[#E6FBEA]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#43C17A]",
      iconColor: "text-white",
    },
    {
      value: String(attendanceStats.absent),
      label: "Total Students Absent",
      bgColor: "bg-[#FFE0E0]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FF2020]",
      iconColor: "text-white",
    },
    {
      value: String(attendanceStats.leave),
      label: "Total Students on Leave",
      bgColor: "bg-[#CEE6FF]",
      icon: <ChartLineDown />,
      iconBgColor: "bg-[#60AEFF]",
      iconColor: "text-white",
    },
  ];

  if (!initialized || loading || contextLoading) {
    return <AttendanceSkeleton />;
  }

  return (
    <main className="px-3 md:px-4 py-4 min-h-screen w-full overflow-x-hidden">
      <Toaster position="top-right" />

      <section className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="flex w-full md:w-fit justify-between min-w-0">
          <div className="flex w-full min-w-0">
            {urlClassId && (
              <CaretLeft
                size={20}
                weight="bold"
                onClick={handleCancel}
                className="text-[#2D3748] cursor-pointer mt-1.5 hover:-translate-x-1 transition-transform mr-1 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate w-full">
                  Attendance
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#282828] mt-1 truncate w-full">
                Track, verify, and manage attendance.
              </p>
            </div>
          </div>
        </div>
        {classData && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <div className="bg-[#1E2952] text-white px-4 py-3 sm:py-4 rounded-lg shadow-sm text-sm font-medium whitespace-nowrap">
              Class Time : <span className="text-gray-200">{classTime}</span>
            </div>
            <CourseScheduleCard
              style="w-full sm:w-[320px] max-md:hidden shrink-0"
              department={`${classData.department?.map((item: any) => item.name).join(", ") || ""}`}
              year={String(classData.year)}
              degree={classData.degree}
            />
          </div>
        )}
      </section>

      <section className="flex flex-col lg:flex-row items-stretch gap-4 w-full max-md:mb-[-15px]">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:flex-[2.5] gap-3 sm:gap-4 w-full min-w-0">
          {baseCardData.map((item, index) => (
            <div key={index} className="flex-1 min-w-0">
              <CardComponent {...item} />
            </div>
          ))}
        </div>
        <div className="hidden lg:block lg:flex-[1] shrink-0 min-w-0">
          <WorkWeekCalendar
            activeDate={selectedCalendarDate}
            onDateSelect={(date) => setSelectedCalendarDate(date)}
            style="h-full bg-white rounded-xl shadow-sm"
          />
        </div>
      </section>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-4 min-h-[50px] gap-3 w-full min-w-0">
        {urlClassId ? (
          <div className="text-base sm:text-lg font-bold text-gray-800 truncate min-w-0 flex-1 pr-2">
            <span className="text-[#43C17A]">Topic : </span>
            <span className="truncate">{topicName}</span>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {isEditing &&
          (urlClassId || selectedClassId) &&
          (!isCancellingMode ? (
            <button
              onClick={() => {
                setCancelReason("");
                setIsCancellingMode(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#FFBB70] text-white cursor-pointer hover:bg-[#FFBB70]/90 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-red-100 transition-colors w-full sm:w-max shrink-0"
            >
              <Prohibit size={16} weight="bold" />
              Mark Class Cancel
            </button>
          ) : (
            <div className="flex text-black items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 w-full sm:w-auto overflow-x-auto pb-1 shrink-0">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason..."
                className="border border-gray-300 rounded-lg px-3 py-1.5 sm:py-2 text-sm w-40 sm:w-64 focus:outline-none focus:border-red-400 flex-shrink-0"
                autoFocus
              />
              <button
                onClick={confirmClassCancel}
                className="bg-green-500 text-white cursor-pointer p-1.5 sm:p-2 rounded-lg flex-shrink-0"
              >
                <Check size={18} weight="bold" />
              </button>
              <button
                onClick={() => setIsCancellingMode(false)}
                className="bg-gray-200 text-gray-600 p-1.5 sm:p-2 cursor-pointer rounded-lg flex-shrink-0"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          ))}
      </section>

      <section className="w-full min-w-0">
        {tableLoading ||
          urlClassId ||
          classOptions.length > 0 ||
          sectionOptions.length > 0 ? (
          <StuAttendanceTable
            students={studentsList}
            setStudents={setStudentsList}
            handleSaveAttendance={handleSaveAttendance}
            saving={saving}
            isTopicMode={isTopicMode}
            classes={classOptions}
            sections={sectionOptions}
            selectedClass={selectedClassId}
            selectedSection={selectedSectionId}
            onFilterChange={urlClassId ? undefined : handleFilterChange}
            loadingFilters={tableLoading}
            isEditing={isEditing}
            onEditClick={() => setIsEditing(true)}
            calendarType={selectedCalendarType}
          />
        ) : (
          <div className="flex justify-center items-center py-16 text-gray-500 font-medium">
            No scheduled or accepted classes found for this date.
          </div>
        )}
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <Loader />
        </div>
      }
    >
      <AttendanceContent />
    </Suspense>
  );
}
