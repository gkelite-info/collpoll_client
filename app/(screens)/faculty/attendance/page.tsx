"use client";

import CalendarRibbonComponent from "@/app/utils/calendar";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import StuAttendanceTable from "./components/stuAttendanceTable";
import CardComponent, { CardProps } from "./components/stuAttendanceCard";

const cardData: CardProps[] = [
  {
    value: "60",
    label: "Total Students",
    bgColor: "bg-[#FFEDDA]",
    icon: <UsersThree />,
    iconBgColor: "bg-[#FFBB70]",
    iconColor: "text-white",
  },
  {
    value: "50",
    label: "Total Students Present",
    bgColor: "bg-[#E6FBEA]",
    icon: <UsersThree />,
    iconBgColor: "bg-[#43C17A]",
    iconColor: "text-white",
  },
  {
    value: "10",
    label: "Total Students Absent",
    bgColor: "bg-[#FFE0E0]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FF2020]",
    iconColor: "text-white",
  },
  {
    value: "10",
    label: "Total Students on Leave",
    bgColor: "bg-[#CEE6FF]",
    icon: <ChartLineDown />,
    iconBgColor: "bg-[#60AEFF]",
    iconColor: "text-white",
  },
];

export default function Page() {
  return (
    <main className="px-6 py-4 bg-[#F8F9FA] min-h-screen">
      <section className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track, Verify and Manage Attendance Records Across Departments and
            Faculty.
          </p>
        </div>
        <CourseScheduleCard style="w-auto" />
      </section>

      <section className="mb-8 flex flex-row gap-4 items-stretch">
        <div className="flex flex-row gap-4 flex-[3]">
          {cardData.map((item, index) => (
            <div key={index} className="flex-1">
              <CardComponent {...item} />
            </div>
          ))}
        </div>
        <div className="flex-[1.2] min-w-[320px]">
          <CalendarRibbonComponent />
        </div>
      </section>

      <section>
        <StuAttendanceTable />
      </section>
    </main>
  );
}
