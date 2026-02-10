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
  ChalkboardTeacher,
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
import AttendanceSkeleton from "@/app/(screens)/faculty/attendance/shimmer/attendanceSkeleton";
import StuAttendanceTable from "../tables/stuAttendanceTable";
import StudentAttendanceDetailsPage from "../components/stuSubjectWise";
import CardComponent from "../components/cards";

interface SubjectWiseAttendanceProps {
  onBack: () => void;
}

const SubjectWiseAttendance = ({ onBack }: SubjectWiseAttendanceProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- URL PARAMS ---
  const branch = searchParams.get("branch");
  const section = searchParams.get("section");
  const year = searchParams.get("year");
  const totalStudents = searchParams.get("students");
  const totalSubjects = searchParams.get("subjects");
  const below75 = searchParams.get("below75");
  const totalFaculties = searchParams.get("faculties");
  const collegeSectionsId = Number(searchParams.get("collegeSectionsId"));
  const selectedStudentId = searchParams.get("studentId");

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [classOptions, setClassOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [studentsList, setStudentsList] = useState<UIStudent[]>([]);

  // --- ACTION STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCancellingMode, setIsCancellingMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // --- 1. LOAD CLASSES FOR SECTION ---
  useEffect(() => {
    if (!collegeSectionsId) return;

    const init = async () => {
      setLoading(true);
      try {
        const classes = await getAdminClassesForSection(collegeSectionsId);
        setClassOptions(classes);

        if (classes.length > 0) {
          const firstClass = classes[0];
          setSelectedClassId(firstClass.id);
          // Load students for the first class
          const students = await getStudentsForClass(firstClass.id);
          setStudentsList(students);
        } else {
          toast("No classes scheduled for today", { icon: "ℹ️" });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load section data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [collegeSectionsId]);

  const handleClassChange = async (newClassId: string) => {
    setSelectedClassId(newClassId);
    setLoading(true);
    setIsEditing(false);
    try {
      const students = await getStudentsForClass(newClassId);
      setStudentsList(students);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
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
      const payload = studentsList.map((s) => ({
        studentId: s.id,
        status: s.attendance,
        reason: s.reason,
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
                {branch} Branch — Subject-wise Attendance
              </h1>
            </div>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            Manage attendance for {year}, Section {section}.
          </p>
        </div>
        <div className="w-80">
          <CourseScheduleCard />
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
          {branch} Branch
        </span>
      </div>

      {/* STATS CARDS */}
      <div className="flex gap-4 w-full mb-6">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            style={`${item.style} w-[156px] h-[156px]`}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            value={item.value}
            label={item.label}
          />
        ))}
        <div>
          <WorkWeekCalendar style="h-full w-[350px]" />
        </div>
      </div>

      <div className=" flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 justify-between">
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="appearance-none rounded-md bg-[#43C17A1C] pl-3 pr-8 py-1.5 text-[#43C17A] outline-none border-none font-medium cursor-pointer text-sm"
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
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
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

        {/* TABLE AREA */}
        {loading ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Loading...</p>
          </div>
        ) : studentsList.length > 0 ? (
          <StuAttendanceTable
            students={studentsList}
            setStudents={setStudentsList}
            handleSaveAttendance={handleSaveAttendance}
            saving={saving}
            isTopicMode={true}
            isEditing={isEditing}
            onEditClick={() => setIsEditing(true)}
          />
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
