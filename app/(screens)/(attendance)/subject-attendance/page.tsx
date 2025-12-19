"use client";

import { useRouter } from "next/navigation";
import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
import { Chalkboard, FilePdf, UsersThree } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";

interface CardItem {
  id: number;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  style?: string;
  iconBgColor?: string;
  iconColor?: string;
  underlineValue?: boolean;
  totalPercentage?: string | number;
}

export default function SubjectAttendance() {
  const router = useRouter();

  const cards: CardItem[] = [
    {
      id: 1,
      icon: <UsersThree size={32} />,
      value: "8/10",
      label: "Total Classes",
      style: "bg-[#FFEDDA] w-44",
      iconBgColor: "#FFBB70",
      iconColor: "#EFEFEF",
    },
    {
      id: 2,
      icon: <Chalkboard size={32} />,
      value: "220/250",
      label: "Semester wise Classes",
      style: "bg-[#CEE6FF] w-44",
      iconBgColor: "#7764FF",
      iconColor: "#EFEFEF",
      totalPercentage: "85%",
    },
  ];

  const columns = [
    { title: "Subject", key: "subject" },
    { title: "Total", key: "total" },
    { title: "Attended", key: "attended" },
    { title: "Missed", key: "missed" },
    { title: "Leave", key: "leave" },
    { title: "Percentage", key: "percentage" },
    { title: "Notes", key: "notes" },
    { title: "Actions", key: "actions" },
  ];

  const tableData = [
    {
      subject: "AI Lab",
      total: 10,
      attended: 8,
      missed: 1,
      leave: 1,
      percentage: "80%",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(`/attendance?tab=subject-attendance-details`)
          }
        >
          View Details
        </span>
      ),
    },
    {
      subject: "Machine Learning",
      total: 12,
      attended: 10,
      missed: 1,
      leave: 1,
      percentage: "83%",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(`/attendance?tab=subject-attendance-details`)
          }
        >
          View Details
        </span>
      ),
    },
    {
      subject: "Deep Learning Lab",
      total: 14,
      attended: 12,
      missed: 2,
      leave: 0,
      percentage: "86%",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(`/attendance?tab=subject-attendance-details`)
          }
        >
          View Details
        </span>
      ),
    },
    {
      subject: "Database Lab",
      total: 10,
      attended: 9,
      missed: 0,
      leave: 1,
      percentage: "90%",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(`/attendance?tab=subject-attendance-details`)
          }
        >
          View Details
        </span>
      ),
    },
    {
      subject: "Networking Lab",
      total: 11,
      attended: 8,
      missed: 2,
      leave: 1,
      percentage: "72%",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(`/attendance?tab=subject-attendance-details`)
          }
        >
          View Details
        </span>
      ),
    },
    {
      subject: "Cyber Security Lab",
      total: 9,
      attended: 7,
      missed: 1,
      leave: 1,
      percentage: "78%",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(`/attendance?tab=subject-attendance-details`)
          }
        >
          View Details
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col pb-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col w-[50%]">
            <h1 className="text-[#282828] font-bold text-2xl mb-1">
              Attendance
            </h1>
            <p className="text-[#282828]">
              Track, Manage, and Maintain Your Attendance Effortlessly
            </p>
          </div>

          <div className="flex justify-end w-[32%]">
            <CourseScheduleCard style="w-[320px]" />
          </div>
        </div>

        <div className="w-full h-[170px] mt-4 flex items-start gap-3">
          {cards.map((card, index) => (
            <CardComponent
              key={index}
              style={card.style}
              icon={card.icon}
              value={card.value}
              label={card.label}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconColor}
              underlineValue={card.underlineValue}
              totalPercentage={card.totalPercentage}
            />
          ))}

          <SemesterAttendanceCard
            presentPercent={80}
            absentPercent={15}
            latePercent={5}
            overallPercent={85}
          />
          <WorkWeekCalendar style="w-[345px] mt-0" />
        </div>

        <div className="mt-4 flex flex-col items-start">
          <h4 className="text-[#282828] font-medium">
            Subject-Wise Attendance
          </h4>
          <p className="text-[#282828] text-sm mt-1">Subject-Wise Breakdown</p>
          <TableComponent columns={columns} tableData={tableData} />
        </div>
      </div>
    </>
  );
}
