"use client";

import React, { useState } from "react";

import StudentProfileCard from "./components/stuProfileCard";

import AssignmentsTable from "./components/assignmentsTable";
import ParentsList, { Parent } from "./components/parentsList";

import GradesTable from "./components/gradesTable";
import { AttendanceSummaryCard } from "./components/attendanceSummaryCard";
import AcademicPerformance from "./components/academicPerformanceChart";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ChatWindow from "./components/chatWindow";

const studentData = {
  name: "Ananya Sharma",
  department: "CSE",
  studentId: "21CSE006",
  phone: "+91 9012345678",
  email: "estellebald@gmail.com",
  address: "245 Delo Street",
  photo:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  attendanceDays: 25,
  absentDays: 5,
  leaveDays: 1,
};

const parentsData = [
  {
    name: "Lauren Barker",
    relation: "Father",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
  },
  {
    name: "Fiorine Lopez",
    relation: "Mother",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

export default function DashboardLayout() {
  const [activeChatParent, setActiveChatParent] = useState<Parent | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6 font-sans">
      <section className="flex justify-between items-center mb-6">
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

        <article className="flex justify-end">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>
      <div className="mx-auto max-w-[1400px]">
        {activeChatParent ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-3rem)]">
            <div className="w-full lg:w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-2 h-full scrollbar-hide">
              <StudentProfileCard {...studentData} />
              <AcademicPerformance />
              <AssignmentsTable />
            </div>

            <div className="w-full lg:w-[40%] h-full bg-white rounded-[30px] sticky top-0">
              <ChatWindow
                parent={activeChatParent}
                onClose={() => setActiveChatParent(null)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
              <div className="lg:col-span-3 h-full">
                <StudentProfileCard {...studentData} />
              </div>
              <div className="lg:col-span-2 h-full">
                <ParentsList
                  parents={parentsData}
                  onChatOpen={(parent) => setActiveChatParent(parent)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
              <div className="lg:col-span-3 h-full">
                <AcademicPerformance />
              </div>
              <div className="lg:col-span-2 h-full">
                <AttendanceSummaryCard percentage={85} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
              <div className="lg:col-span-3 h-full">
                <AssignmentsTable />
              </div>
              <div className="lg:col-span-2 h-full">
                <GradesTable />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
