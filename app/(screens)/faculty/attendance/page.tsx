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
  getAllStudents,
  getStudentsForClass,
  saveAttendance,
  UIStudent,
} from "@/lib/helpers/faculty/attendance/attendanceActions";
import AttendanceSkeleton from "./shimmer/attendanceSkeleton";

function AttendanceContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const router = useRouter();

  const [classData, setClassData] = useState<UpcomingLesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentsList, setStudentsList] = useState<UIStudent[]>([]);
  const [saving, setSaving] = useState(false);

  const [isCancellingMode, setIsCancellingMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [percentage, setPercentage] = useState(0);

  const isTopicMode = !!classId;

  const confirmClassCancel = () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a reason for cancelling the class.");
      return;
    }

    const updatedList = studentsList.map((s) => ({
      ...s,
      attendance: "Class Cancel" as const,
      reason: cancelReason,
    }));

    setStudentsList(updatedList);
    setIsCancellingMode(false);
    toast("All students marked as 'Class Cancelled'. Click Save to confirm.", {
      icon: "⚠️",
    });
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (classId) {
          const cData = await getClassDetails(classId);
          setClassData(cData);
          console.log("Fetched Class Details:", cData);

          const studentsData = await getStudentsForClass(classId);
          setStudentsList(studentsData);
          console;
        } else {
          const allStudents = await getAllStudents();
          setStudentsList(allStudents);
          console.log("Fetched All Students for Directory Mode:", allStudents);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [classId]);

  const topicName = classData?.description || "Loading...";
  const classTime = classData
    ? `${classData.fromTime} - ${classData.toTime}`
    : "Loading...";

  type AttendanceStatus =
    | "Present"
    | "Absent"
    | "Leave"
    | "Late"
    | "Class Cancel";

  const attendanceStats = studentsList.reduce(
    (acc, student) => {
      const status = student.attendance as AttendanceStatus;
      switch (status) {
        case "Present":
          acc.present++;
          break;
        case "Absent":
          acc.absent++;
          break;
        case "Leave":
          acc.leave++;
          break;
      }
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
      value: isTopicMode ? String(attendanceStats.present) : "-",
      label: "Total Students Present",
      bgColor: "bg-[#E6FBEA]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#43C17A]",
      iconColor: "text-white",
    },
    {
      value: isTopicMode ? String(attendanceStats.absent) : "-",
      label: "Total Students Absent",
      bgColor: "bg-[#FFE0E0]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FF2020]",
      iconColor: "text-white",
    },
    {
      value: isTopicMode ? String(attendanceStats.leave) : "-",
      label: "Total Students on Leave",
      bgColor: "bg-[#CEE6FF]",
      icon: <ChartLineDown />,
      iconBgColor: "bg-[#60AEFF]",
      iconColor: "text-white",
    },
  ];

  const handleSaveAttendance = async () => {
    if (!classId) return;

    const unmarked = studentsList.filter((s) => s.attendance === "Not Marked");
    if (unmarked.length > 0) {
      toast.error(
        `Please mark attendance for ${unmarked.length} students before saving.`,
      );
      return;
    }

    setSaving(true);
    try {
      const payload = studentsList.map((s) => ({
        studentId: s.id,
        status: s.attendance,
        reason: s.reason,
      }));

      const result = await saveAttendance(classId, payload);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Attendance saved successfully!");

      setTimeout(() => {
        router.push("/faculty");
      }, 2000);
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error.message || "Failed to save records");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AttendanceSkeleton />;
  }

  const handleCancel = () => {
    router.push("/faculty");
  };
  console.log("Rendering Attendance Content with students:", studentsList);

  return (
    <main className="px-4 py-4 min-h-screen">
      <Toaster position="top-right" />
      <section className="mb-4 flex items-center justify-between">
        <div className="flex group w-fit ">
          {isTopicMode && (
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

        {isTopicMode && classData ? (
          <div className="flex items-center gap-3">
            <div className="bg-[#1E2952] text-white px-4 py-4 rounded-lg shadow-sm text-sm font-medium">
              Class Time : <span className="text-gray-200">{classTime}</span>
            </div>
            <CourseScheduleCard
              style="w-[320px]"
              department={`${classData.department
                .map((item: any) => item.name)
                .join(", ")}`}
              year={String(classData.year)}
              degree={classData.degree}
            />
          </div>
        ) : (
          <CourseScheduleCard style="w-[320px]" />
        )}
      </section>

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

      {isTopicMode && (
        <section className="flex items-center justify-between py-4">
          <div className="text-lg font-bold text-gray-800">
            <span className="text-[#43C17A]">Topic : </span>
            {topicName}
          </div>

          {!isCancellingMode ? (
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
                placeholder="Enter reason for cancellation..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                autoFocus
              />
              <button
                onClick={confirmClassCancel}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                title="Confirm Cancel"
              >
                <Check size={18} weight="bold" />
              </button>
              <button
                onClick={() => setIsCancellingMode(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          )}
        </section>
      )}

      <section>
        <StuAttendanceTable
          students={studentsList}
          setStudents={setStudentsList}
          handleSaveAttendance={handleSaveAttendance}
          saving={saving}
          isTopicMode={isTopicMode}
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
