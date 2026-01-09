"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import SubjectAttendanceCards from "../../../components/subjectAttendanceCards";
import SubjectAttendanceTable from "../../../components/subjectAttendanceTable";
import { students } from "../../../data";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export default function SubjectDetailPage() {
  const { studentId, subjectId } = useParams<{
    studentId: string;
    subjectId: string;
  }>();

  const [filter, setFilter] = useState<"ALL" | "Present" | "Absent" | "Leave">(
    "ALL"
  );

  const student = useMemo(
    () => students.find((s) => s.id === studentId),
    [studentId]
  );

  const subject = useMemo(
    () => student?.subjects.find((s) => s.subjectId === subjectId),
    [student, subjectId]
  );

  if (!student || !subject) {
    return (
      <div className="p-6 text-md text-red-500 font-medium">
        Invalid student or subject
      </div>
    );
  }

  const filteredRecords =
    filter === "ALL"
      ? subject.records
      : subject.records.filter((r) => r.status === filter);

  return (
    <main className="px-4 py-4">
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

      <section className="flex gap-4 mb-7 ">
        <div className="flex-grow">
          <SubjectAttendanceCards
            summary={subject.summary}
            active={filter}
            onChange={setFilter}
          />
        </div>
        <div className="">
          <WorkWeekCalendar style="w-[345px]" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[#1A1C1E] mb-4">
          Subject Detail View
        </h2>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-5 text-[13px]">
          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wider text-xs">
              Subject :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-1 rounded-full font-medium">
              {subject.subjectName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wider text-xs">
              Faculty :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-1 rounded-full font-medium">
              {subject.facultyName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wider text-xs">
              Sort :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-1 rounded-full font-medium">
              Classes Held: {subject.summary.totalClasses} | Attended:{" "}
              {subject.summary.attended} | Missed: {subject.summary.absent} |
              Total: {subject.summary.percentage}%
            </span>
          </div>
        </div>
      </section>

      <section>
        <SubjectAttendanceTable records={filteredRecords} />
      </section>
    </main>
  );
}
