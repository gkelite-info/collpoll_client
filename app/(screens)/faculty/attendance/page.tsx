"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  CaretLeft,
  ChartLineDown,
  Prohibit,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./components/stuAttendanceCard";
import StuAttendanceTable, { UIStudent } from "./components/stuAttendanceTable";

import {
  getClassDetails,
  UpcomingLesson,
} from "@/lib/helpers/faculty/getClasses";
import {
  getStudentsForClass,
  saveAttendance,
  getAllStudents,
} from "@/lib/helpers/attendance/attendanceActions";
import toast, { Toaster } from "react-hot-toast";

function AttendanceContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const router = useRouter();

  const [classData, setClassData] = useState<UpcomingLesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentsList, setStudentsList] = useState<UIStudent[]>([]);
  const [saving, setSaving] = useState(false);
  const isTopicMode = !!classId;

  const handleMarkClassCancelled = () => {
    const updatedList = studentsList.map((s) => ({
      ...s,
      attendance: "Class Cancelled" as const, // Force type
    }));
    setStudentsList(updatedList);

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

          if (cData) {
            const studentsData = await getStudentsForClass(
              cData.department,
              cData.year,
              cData.section,
              classId
            );
            setStudentsList(studentsData as UIStudent[]);
          }
        } else {
          // --- GENERAL MODE: Fetch All Students (Directory View) ---
          const allStudents = await getAllStudents();
          setStudentsList(allStudents as UIStudent[]);
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

  type AttendanceStatus = "Present" | "Absent" | "Leave";

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
    { present: 0, absent: 0, leave: 0 }
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
    setSaving(true);
    try {
      const payload = studentsList.map((s) => ({
        studentId: s.id,
        status: s.attendance,
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

  const handleCancel = () => {
    router.push("/faculty");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Details...
      </div>
    );
  }
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
          <button
            onClick={handleMarkClassCancelled}
            className="flex items-center gap-2 bg-[#FFBB70] text-white cursor-pointer hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium border border-red-100 transition-colors"
          >
            <Prohibit size={18} weight="bold" />
            Mark Class Cancel
          </button>
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
