"use client";

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import { AttendanceSummaryCard } from "./attendanceSummaryCard";
import { ProfileCard } from "./profileCard";
import { Assignment, AssignmentsSummaryTable } from "./assignmentsSummaryTable";
import { AttendanceList } from "./attendanceBySubjectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";

const assignmentsData: Assignment[] = [
  {
    subject: "Data Structures",
    title: "Array Operations & Complex..",
    dueDate: "3 Feb 2026",
    marks: "18 / 20",
    feedback: "Excellent coding and examples",
  },
  {
    subject: "OOPs using C++",
    title: "Class Inheritance & Polymo..",
    dueDate: "29 Jan 2026",
    marks: "17 / 20",
    feedback: "Good attempt; improve proofs",
  },
  {
    subject: "Discreate Mathematics",
    title: "Graph Theory Problem Set",
    dueDate: "27 Jan 2026",
    marks: "-",
    feedback: "-",
  },
  {
    subject: "Computer Organization",
    title: "CPU Architecture & Pipelini..",
    dueDate: "1 Feb 2026",
    marks: "19 / 20",
    feedback: "Very neat and accurate",
  },
  {
    subject: "Digital Logical Design",
    title: "Logic Gates Simplificatio...",
    dueDate: "26 Jan 2026",
    marks: "20 / 20",
    feedback: "Excellent insight and clarity",
  },
  {
    subject: "Environmental Science",
    title: "Report on Sustainable Co..",
    dueDate: "25 Jan 2026",
    marks: "-",
    feedback: "-",
  },
  {
    subject: "Data Structure Lab",
    title: "Stack, Queue, and Linke...",
    dueDate: "30 Jan 2026",
    marks: "18 / 20",
    feedback: "Good wiring and output validation",
  },
  {
    subject: "OOPs Lab",
    title: "C++ Mini Project – Student",
    dueDate: "2 Feb 2026",
    marks: "18 / 20",
    feedback: "Good attempt; improve proofs",
  },
  {
    subject: "Digital Logic Lab",
    title: "Logic Circuit Design (Multis..",
    dueDate: "24 Jan 2026",
    marks: "18 / 20",
    feedback: "Good wiring and output validation",
  },
];

const AttendanceData = [
  { subject: "Java Programming", attended: 90, total: 100, status: "Present" },
  { subject: "OOPs using C++", attended: 95, total: 100, status: "Present" },
  { subject: "Data Structures", attended: 90, total: 100, status: "Present" },
  { subject: "Computer Networks", attended: 45, total: 50, status: "Present" },
  { subject: "Operating Systems", attended: 85, total: 100, status: "Present" },
  { subject: "Web Development", attended: 28, total: 30, status: "Present" },
  {
    subject: "Software Engineering",
    attended: 55,
    total: 60,
    status: "Present",
  },
  {
    subject: "Database Management",
    attended: 92,
    total: 100,
    status: "Present",
  },
];

const Page = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <main className="p-3">
        <section className="mb-3">
          <div className="flex p-2 gap-3 justify-between items-center">
            <div className="w-full max-w-5xl rounded-xl">
              <div className="flex gap-3">
                <div>
                  <span className="text-gray-600 text-lg font-medium">
                    Department:{" "}
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                    CSE
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-lg font-medium">
                    Year:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                    2nd Year
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-lg font-medium">
                    Section:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                    A
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-lg font-medium">
                    Semester:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                    III
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end w-[32%]">
              <CourseScheduleCard style="w-[320px]" />
            </div>

            <div
              className="w-12 h-12 aspect-square rounded-full bg-[#43C17A1A] flex items-center justify-center cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <List size={26} weight="bold" className="text-gray-700 " />
            </div>
          </div>
        </section>

        <section className="min-h-screen bg-gray-100 grid-rows-[300px_300px] flex flex-col gap-6 ">
          <article className="grid grid-cols-1 lg:grid-cols-10 gap-6 ">
            <section className="bg-white rounded-2xl shadow-sm lg:col-span-6">
              <ProfileCard
                name="Ananya Sharma"
                department="CSE"
                studentId="21CSE006"
                avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                attendanceDays={25}
                absentDays={5}
                leaveDays={1}
              />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-4 lg:col-span-4 ">
              <AttendanceSummaryCard percentage={85} />
            </section>

            <section className="bg-white rounded-2xl lg:col-span-6">
              <AcademicPerformance />
            </section>

            <section className="bg-white rounded-2xl lg:col-span-4">
              <AttendanceList data={AttendanceData} />
            </section>
          </article>

          <section className="bg-white rounded-2xl">
            <AssignmentsSummaryTable assignments={assignmentsData} />
          </section>
        </section>

        {open && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/10"
              onClick={() => setOpen(false)}
            />

            <div className="absolute top-35 right-9">
              <div className="bg-white rounded-xl shadow-lg min-w-[220px] border border-gray-200">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <span className="text-sm font-semibold text-gray-800">
                    Previous Sem Marks
                  </span>
                  <button onClick={() => setOpen(false)}>
                    <X
                      size={18}
                      weight="bold"
                      className="text-gray-600 cursor-pointer"
                    />
                  </button>
                </div>

                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Enrollment
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Page;
