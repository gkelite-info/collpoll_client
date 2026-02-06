"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  BookOpenText,
  Calendar,
  CaretLeft,
  User,
  UsersThree,
} from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ATTENDANCE_MOCK_DATA } from "../data";
import AttendanceTable from "../tables/attendanceTable";
import CardComponent from "./cards";
import StudentAttendanceDetailsPage from "./stuSubjectWise";

interface SubjectWiseAttendanceProps {
  onBack: () => void;
}

export const SubjectWiseAttendance = ({
  onBack,
}: SubjectWiseAttendanceProps) => {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch");
  const section = searchParams.get("section");
  const totalStudents = searchParams.get("students");
  const totalSubjects = searchParams.get("subjects");
  const below75 = searchParams.get("below75");
  const selectedStudentId = searchParams.get("studentId");
  const totalFaculties = searchParams.get("faculties");
  const router = useRouter();
  const pathname = usePathname();

  const closeStudentOverlay = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("studentId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openStudentDetail = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("studentId", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [data, setData] = useState(ATTENDANCE_MOCK_DATA);

  const [filters, setFilters] = useState({
    year: "3rd Year",
    section: "A",
    sem: "Sem 5",
    subject: "AI",
    date: "12 Aug 2025",
  });

  const handleAttendanceChange = (
    rollNo: string,
    status: "Present" | "Absent"
    // status: "Present" | "Absent" | "Leave" | "Cancel Class" | "Late"
  ) => {
    setData((prev) =>
      prev.map((s) => (s.rollNo === rollNo ? { ...s, attendance: status } : s))
    );
  };

  const handleViewDetails = (rollNo: string) => {
    console.log("View details for:", rollNo);
  };

  const filteredData = useMemo(() => {
    return data; //placeholder for future filtering logic
  }, [data, filters]);

  const currentFilters = {
    year: "1 st year",
    section: "A",
    sem: "III",
    subject: "Data Structures",
    date: "12/10/2023",
  };

  if (selectedStudentId) {
    return (
      <StudentAttendanceDetailsPage
        manualId={selectedStudentId}
        onBack={closeStudentOverlay}
      />
    );
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
      value: below75 ||0 ,
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
    <div className="flex flex-col m-4 relative">
      <div className="mb-3 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div className="flex items-center gap-2 group w-fit">
            <div
              className="flex items-center gap-2 group w-fit "
            >
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
            View attendance reports across the {branch} Branch.
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

      <div className="flex gap-4 w-full h-full mb-3">
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

      <div className="mt-3 overflow-hidden">
        <AttendanceTable
          data={filteredData}
          onViewDetails={(rollNo) => {
            const params = new URLSearchParams(searchParams);
            params.set("studentId", rollNo);
            router.push(`${pathname}?${params.toString()}`);
          }}
          filters={filters}
          onAttendanceChange={handleAttendanceChange}
        />
      </div>
    </div>
  );
};
