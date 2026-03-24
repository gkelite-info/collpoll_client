"use client";

import CardComponent from "@/app/utils/card";
import { Clock, User, UsersThree } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useTransition } from "react";
import { HrInfoCard } from "./hrInfoCard";

import MonthlyAttendanceChart from "./MonthlyAttendanceChart";
import TopPerformersCard from "./TopPerformersCard";
import FacultyMonthDetailTable from "./facultyAttendanceTable";
import FacultyOverviewTable, { FacultyRecord } from "./facultyOverviewTable";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

function HrDashContent() {
  const hrImage = "/hr-fe.png";

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedMonth = searchParams.get("month");

  const handleMonthRoute = (month: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (month) {
      params.set("month", month);
    } else {
      params.delete("month");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const cardData = [
    {
      style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
      icon: <UsersThree size={21} weight="fill" color="#6C20CA" />,
      value: "05",
      label: "Total Staff",
    },
    {
      style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
      icon: <User size={21} weight="fill" color="#FFBB70" />,
      value: "05",
      label: "Present Today",
    },
    {
      style: "bg-[#FFE0E0] h-[126.35px] w-[182px]",
      icon: <User size={21} weight="fill" color="#FF0000" />,
      value: "14",
      label: "Absent Today",
    },
    {
      style: "bg-[#CEE6FF] h-[126.35px] w-[182px]",
      icon: <Clock size={21} weight="fill" color="#60AEFF" />,
      value: "5,480",
      label: "Late Check-ins",
    },
  ];

  const HrIfocardData = [
    {
      show: false,
      user: "HR",
      studentsTaskPercentage: 85,
      facultySubject: "",
      image: hrImage,
      top: "-top-5",
      imageHeight: "h-42",
      right: "right-8",
    },
  ];

  const topPerformersData = [
    {
      rank: 1,
      name: "Dr. Meera Sharma",
      attendance: "98%",
      score: 4.9,
      classes: "80/80",
    },
    {
      rank: 2,
      name: "Mr. Vikas Jain",
      attendance: "96%",
      score: 4.7,
      classes: "78/80",
    },
    {
      rank: 3,
      name: "Ms. Kavya Patel",
      attendance: "95%",
      score: 4.5,
      classes: "76/80",
    },
  ];

  const monthlyChartData = [
    { month: "Jan", value: 70 },
    { month: "Feb", value: 59 },
    { month: "Mar", value: 59 },
    { month: "Apr", value: 59 },
    { month: "May", value: 70 },
    { month: "Jun", value: 59 },
    { month: "Jul", value: 59 },
  ];

  const facultyRecordsData: FacultyRecord[] = [
    {
      name: "Dr. Meera Sharma",
      checkIn: "09:04 AM",
      checkOut: "05:12 PM",
      status: "Present",
      classesTaken: 4,
      attendance: "95%",
    },
    {
      name: "Mr. Rahul Menon",
      checkIn: "09:15 AM",
      checkOut: "04:59 PM",
      status: "Late",
      classesTaken: 3,
      attendance: "89%",
    },
    {
      name: "Ms. Divya Rao",
      checkIn: "-",
      checkOut: "-",
      status: "Absent",
      classesTaken: 0,
      attendance: "78%",
    },
    {
      name: "Dr. Meera Sharma",
      checkIn: "09:04 AM",
      checkOut: "05:12 PM",
      status: "Present",
      classesTaken: 4,
      attendance: "95%",
    },
    {
      name: "Mr. Rahul Menon",
      checkIn: "09:15 AM",
      checkOut: "04:59 PM",
      status: "Late",
      classesTaken: 3,
      attendance: "89%",
    },
    {
      name: "Ms. Divya Rao",
      checkIn: "-",
      checkOut: "-",
      status: "Absent",
      classesTaken: 0,
      attendance: "78%",
    },
    {
      name: "Dr. Meera Sharma",
      checkIn: "09:04 AM",
      checkOut: "05:12 PM",
      status: "Present",
      classesTaken: 4,
      attendance: "95%",
    },
  ];

  if (selectedMonth) {
    return (
      <div className="w-[68%] p-2">
        <FacultyMonthDetailTable
          month={selectedMonth}
          months={monthlyChartData.map((data) => data.month)}
          onMonthChange={(newMonth) => handleMonthRoute(newMonth)}
          onBack={() => handleMonthRoute(null)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="w-[68%] p-2">
        <HrInfoCard cardProps={HrIfocardData} />

        <div className="mt-5 rounded-lg flex gap-3 text-xs">
          {cardData.map((item, index) => (
            <CardComponent
              key={index}
              style={item.style}
              icon={item.icon}
              value={item.value}
              label={item.label}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-6">
          <TopPerformersCard performers={topPerformersData} />
          <MonthlyAttendanceChart
            title="Monthly Attendance Overview (CSE)"
            data={monthlyChartData}
            onBarClick={(month) => handleMonthRoute(month)}
          />
          <FacultyOverviewTable records={facultyRecordsData} />
        </div>
      </div>
    </>
  );
}

export default function HrDashLeft() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">
          <Loader />
        </div>
      }
    >
      <HrDashContent />
    </Suspense>
  );
}
