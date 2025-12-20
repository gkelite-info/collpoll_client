"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import AssignmentTable from "./components/assignmentTable";
import CardComponent, {
  CardProps,
} from "../../attendance/components/stuAttendanceCard";

const cardData: CardProps[] = [
  {
    value: "06/01/2025",
    label: "Due Date",
    bgColor: "bg-[#E2DAFF]",
    icon: <UsersThree />,
    iconBgColor: "bg-[#714EF2]",
    iconColor: "text-white",
  },
  {
    value: "25",
    label: "Total Marks",
    bgColor: "bg-[#FFEDDA]",
    icon: <UsersThree />,
    iconBgColor: "bg-[#FFBF79]",
    iconColor: "text-white",
  },
  {
    value: "10",
    label: "Total Submissions",
    bgColor: "bg-[#E6FBEA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#43C17A]",
    iconColor: "text-white",
  },
];

export default function Page() {
  return (
    <main className="px-4 py-4 min-h-screen">
      <section className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track, Verify and Manage Attendance Records Across Departments and
            Faculty.
          </p>
        </div>
        <CourseScheduleCard style="w-[320px]" />
      </section>

      <section className="flex flex-row items-stretch gap-4 w-full mb-3">
        {cardData.map((item, index) => (
          <div key={index} className="flex-1">
            <CardComponent {...item} />
          </div>
        ))}
        <div className="flex-[1.6]">
          <WorkWeekCalendar style="h-full" />
        </div>
      </section>

      <section>
        <AssignmentTable />
      </section>
    </main>
  );
}
