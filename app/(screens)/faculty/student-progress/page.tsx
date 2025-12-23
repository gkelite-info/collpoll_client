"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

import CalendarRibbonComponent from "@/app/utils/calendar";

import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import PerformanceTrendChart from "./components/performanceTrendChart";
import CardComponent, { CardProps } from "./components/stuPerfCards";
import { StudentDataTable } from "./components/studentDataTable";
import TopFivePerformers from "./components/topFivePerformers";
import { TOP_PERFORMERS } from "./data";

interface StudentPerformancePageProps {
  onGoBack: () => void;
}

const cardData: CardProps[] = [
  {
    value: "35",
    label: "Total Students",

    bgColor: "bg-[#FFEDDA]",

    icon: <UsersThree />,
    iconBgColor: "bg-[#FFBB70]",

    iconColor: "text-[#EFEFEF]",
  },
  {
    value: "30",
    label: "Present Today",

    bgColor: "bg-[#E6FBEA]",

    icon: <UserCircle />,
    iconBgColor: "bg-[#43C17A]",

    iconColor: "text-[#EFEFEF]",
  },
  {
    value: "5",
    label: "Low Attendance",

    bgColor: "bg-[#FFE0E0]",

    icon: <ChartLineDown />,
    iconBgColor: "bg-[#FF2020]",

    iconColor: "text-[#EFEFEF]",
  },
];

export default function Page({ onGoBack }: StudentPerformancePageProps) {
  return (
    <main className="p-4">
      <section className="flex justify-between items-center mb-4">
        <div>
          <div className="flex">
            <h1 className="text-black text-xl font-semibold">
              Student Performance
            </h1>
          </div>
          <p className="text-black text-sm">
            Your class students overview for year 2 - CSE
          </p>
        </div>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="w-full max-w-5xl rounded-xl mb-5">
        <div className="flex gap-3">
          <div>
            <span className="text-gray-600 text-sm font-medium">
              Department:{" "}
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              CSE
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Year:</span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              2nd Year
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Section:</span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              A
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Semester:</span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              III
            </span>
          </div>
        </div>
      </div>

      <article className="flex gap-3 justify-center items-center mb-4">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            value={item.value}
            label={item.label}
            bgColor={item.bgColor}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
          />
        ))}
        <CalendarRibbonComponent />
      </article>
      <section>
        <StudentDataTable />
        <div className="flex gap-3 pb-4 mt-5">
          <div className="">
            <TopFivePerformers performers={TOP_PERFORMERS} />
          </div>

          <div className="min-w-[600px]">
            <PerformanceTrendChart />
          </div>
        </div>
      </section>
    </main>
  );
}
