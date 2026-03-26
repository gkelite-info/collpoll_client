"use client";

import CardComponent from "@/app/utils/card";
import { CaretDown, Clock, User, UsersThree } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useTransition, useState } from "react";
import { HrInfoCard } from "./hrInfoCard";

import MonthlyAttendanceChart from "./MonthlyAttendanceChart";
import FacultyMonthDetailTable from "./facultyAttendanceTable";
import FacultyOverviewTable, { FacultyRecord } from "./facultyOverviewTable";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

const ROLE_PILLS = ["College Admin", "Admin", "Finance Manager", "Finance Executive", "HR Manager", "Placement", "Faculty"];
const BRANCHES   = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];
const YEARS      = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

function HrDashContent() {
  const hrImage = "/hr-fe.png";

  const searchParams = useSearchParams();
  const pathname     = usePathname();
  const router       = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedMonth = searchParams.get("month");

  // ── Local filter state ────────────────────────────────────────────────────
  const [activeRole,   setActiveRole]   = useState<string | null>(null);
  const [activeBranch, setActiveBranch] = useState("CSE");
  const [activeYear,   setActiveYear]   = useState("1st Year");

  const handleMonthRoute = (month: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (month) { params.set("month", month); } else { params.delete("month"); }
    startTransition(() => { router.push(`${pathname}?${params.toString()}`, { scroll: false }); });
  };

  const cardData = [
    { style: "bg-[#E2DAFF] h-[126.35px] w-[182px]", icon: <UsersThree size={21} weight="fill" color="#6C20CA" />, value: "05", label: "Total Staff" },
    { style: "bg-[#FFEDDA] h-[126.35px] w-[182px]", icon: <User       size={21} weight="fill" color="#FFBB70" />, value: "05", label: "Present Today" },
    { style: "bg-[#FFE0E0] h-[126.35px] w-[182px]", icon: <User       size={21} weight="fill" color="#FF0000" />, value: "14", label: "Absent Today" },
    { style: "bg-[#CEE6FF] h-[126.35px] w-[182px]", icon: <Clock      size={21} weight="fill" color="#60AEFF" />, value: "5,480", label: "Late Check-ins" },
  ];

  const HrIfocardData = [
    { show: false, user: "HR", studentsTaskPercentage: 85, facultySubject: "", image: hrImage, top: "-top-5", imageHeight: "h-42", right: "right-8" },
  ];

  const monthlyChartData = [
    { month: "Jan", value: 70 }, { month: "Feb", value: 59 }, { month: "Mar", value: 59 },
    { month: "Apr", value: 59 }, { month: "May", value: 70 }, { month: "Jun", value: 59 },
    { month: "Jul", value: 59 }, { month: "Aug", value: 65 }, { month: "Sep", value: 72 },
    { month: "Oct", value: 68 }, { month: "Nov", value: 61 }, { month: "Dec", value: 55 },
  ];

  const facultyRecordsData: FacultyRecord[] = [
    { name: "Dr. Meera Sharma",  checkIn: "09:04 AM", checkOut: "05:12 PM", status: "Present", classesTaken: 4, attendance: "95%" },
    { name: "Mr. Rahul Menon",   checkIn: "09:15 AM", checkOut: "04:59 PM", status: "Late",    classesTaken: 3, attendance: "89%" },
    { name: "Ms. Divya Rao",     checkIn: "-",        checkOut: "-",        status: "Absent",  classesTaken: 0, attendance: "78%" },
    { name: "Dr. Meera Sharma",  checkIn: "09:04 AM", checkOut: "05:12 PM", status: "Present", classesTaken: 4, attendance: "95%" },
    { name: "Mr. Rahul Menon",   checkIn: "09:15 AM", checkOut: "04:59 PM", status: "Late",    classesTaken: 3, attendance: "89%" },
    { name: "Ms. Divya Rao",     checkIn: "-",        checkOut: "-",        status: "Absent",  classesTaken: 0, attendance: "78%" },
    { name: "Dr. Meera Sharma",  checkIn: "09:04 AM", checkOut: "05:12 PM", status: "Present", classesTaken: 4, attendance: "95%" },
  ];

  if (selectedMonth) {
    return (
      <div className="w-[68%] p-2">
        <FacultyMonthDetailTable
          month={selectedMonth}
          months={monthlyChartData.map((d) => d.month)}
          onMonthChange={(m) => handleMonthRoute(m)}
          onBack={() => handleMonthRoute(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-[68%] p-2">
      <HrInfoCard cardProps={HrIfocardData} />

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="mt-5 rounded-lg flex gap-3 text-xs">
        {cardData.map((item, i) => (
          <CardComponent key={i} style={item.style} icon={item.icon} value={item.value} label={item.label} />
        ))}
      </div>

      {/* ── Role pills ──────────────────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap gap-2">
        {ROLE_PILLS.map((role) => {
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              onClick={() => setActiveRole(isActive ? null : role)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer
                ${isActive
                  ? "bg-[#22C55E] text-white border-[#22C55E]"
                  : "bg-white text-[#282828] border-gray-300 hover:bg-[#22C55E] hover:text-white hover:border-[#22C55E]"
                }`}
            >
              {role}
            </button>
          );
        })}
      </div>

      {/* ── Chart + Branch/Year dropdowns ───────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-4">

        {/* Branch + Year dropdowns */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Branch :</span>
          <div className="relative">
            <select
              value={activeBranch}
              onChange={(e) => setActiveBranch(e.target.value)}
              className="appearance-none bg-[#22C55E] text-white text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full cursor-pointer outline-none"
            >
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"><CaretDown size={11} weight="bold" color="white" /></span>
          </div>

          <span className="text-xs text-gray-500 font-medium">Year</span>
          <div className="relative">
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="appearance-none bg-[#22C55E] text-white text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full cursor-pointer outline-none"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"><CaretDown size={11} weight="bold" color="white" /></span>
          </div>
        </div>

        <MonthlyAttendanceChart
          title={`Monthly Attendance Overview (${activeBranch})`}
          data={monthlyChartData}
          onBarClick={(month) => handleMonthRoute(month)}
        />

        <FacultyOverviewTable records={facultyRecordsData} />
      </div>
    </div>
  );
}

export default function HrDashLeft() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500"><Loader /></div>}>
      <HrDashContent />
    </Suspense>
  );
}
