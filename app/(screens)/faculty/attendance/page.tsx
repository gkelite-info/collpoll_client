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

function AttendanceContent() {
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get("classId");
  const router = useRouter();
  const { facultyId, loading: contextLoading } = useFaculty();

  // Data
  const [classData, setClassData] = useState<UpcomingLesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentsList, setStudentsList] = useState<UIStudent[]>([]);
  const [saving, setSaving] = useState(false);

  // Filters
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [isCancellingMode, setIsCancellingMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const activeClassId = urlClassId || selectedClassId;
  const isTopicMode = !!urlClassId;

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
    setLoading(true);
    try {
      const students = await getStudentsForClass(cId, sId);
      setStudentsList(students);
      const cData = await getClassDetails(cId);
      setClassData(cData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlClassId) {
      loadStudents(urlClassId);
      setIsEditing(true);
    } else {
      if (contextLoading || !facultyId) return;
      async function initFilters() {
        try {
          // Load TODAY's classes
          const classes = await getFacultyClasses(facultyId!);
          setClassOptions(classes);
          if (classes.length > 0) {
            const firstClass = classes[0];
            setSelectedClassId(firstClass.id);
            const sections = await getClassSections(firstClass.id);
            setSectionOptions(sections);
            const firstSec = sections.length > 0 ? sections[0].id : "";
            setSelectedSectionId(firstSec);
            loadStudents(firstClass.id, firstSec);
          }
        } catch (e) {
          console.error(e);
        }
      }
      initFilters();
    }
  }, [urlClassId, facultyId, contextLoading]);

  const handleFilterChange = async (
    type: "class" | "section",
    value: string,
  ) => {
    if (type === "class") {
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
      setIsEditing(false); // Lock after save
      if (urlClassId) setTimeout(() => router.push("/faculty"), 2000);
    } catch (error: any) {
      toast.error(error.message);
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

  if (loading && !studentsList.length) return <AttendanceSkeleton />;

  return (
    <main className="px-4 py-4 min-h-screen">
      <Toaster position="top-right" />

      <section className="mb-4 flex items-center justify-between">
        <div className="flex group w-fit ">
          {urlClassId && (
            <CaretLeft
              size={20}
              weight="bold"
              onClick={handleCancel}
              className="text-[#2D3748] cursor-pointer mt-1.5 group-hover:-translate-x-1 transition-transform"
            />
          )}
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Track, Verify, and Manage Attendance.
            </p>
          </div>
        </div>
        {classData && (
          <div className="flex items-center gap-3">
            <div className="bg-[#1E2952] text-white px-4 py-4 rounded-lg shadow-sm text-sm font-medium">
              Class Time : <span className="text-gray-200">{classTime}</span>
            </div>
            <CourseScheduleCard
              style="w-[320px]"
              department={`${classData.department?.map((item: any) => item.name).join(", ") || ""}`}
              year={String(classData.year)}
              degree={classData.degree}
            />
          </div>
        )}
      </section>

      {/* CARDS */}
      <section className="flex flex-row items-stretch gap-4 w-full mb-3">
        {baseCardData.map((item, index) => (
          <div key={index} className="flex-1">
            <CardComponent {...item} />
          </div>
        ))}
        <div className="flex-[1.6]">
          <WorkWeekCalendar style="h-full bg-white rounded-xl shadow-sm" />
        </div>
      </section>

      <section className="flex items-center justify-between py-4 min-h-[50px]">
        {urlClassId ? (
          <div className="text-lg font-bold text-gray-800">
            <span className="text-[#43C17A]">Topic : </span>
            {topicName}
          </div>
        ) : (
          <div></div>
        )}

        {isEditing &&
          (urlClassId || selectedClassId) &&
          (!isCancellingMode ? (
            <button
              onClick={() => {
                setCancelReason("");
                setIsCancellingMode(true);
              }}
              className="flex items-center gap-2 bg-[#FFBB70] text-white cursor-pointer hover:bg-[#FFBB70]/90 px-4 py-2 rounded-lg text-sm font-medium border border-red-100 transition-colors"
            >
              <Prohibit size={18} weight="bold" />
              Mark Class Cancel
            </button>
          ) : (
            <div className="flex text-black items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-red-400"
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
          ))}
      </section>

      <section>
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
          loadingFilters={loading}
          // EDIT MODE
          isEditing={isEditing}
          onEditClick={() => setIsEditing(true)}
        />
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
