"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SubjectAttendanceTable from "../../../components/subjectAttendanceTable"; // Removed unused Cards import
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import {
  getStudentDetails,
  getSubjectAttendanceDetails,
} from "@/lib/helpers/attendance/attendanceActions";
import AiBotCard from "../../../components/aiBotCard";
import StudentProfileCard from "../../../components/stuProfileCard";

export default function SubjectDetailPage() {
  const { studentId, subjectId } = useParams<{
    studentId: string;
    subjectId: string;
  }>();

  const [filter, setFilter] = useState<"ALL" | "Present" | "Absent" | "Leave">(
    "ALL"
  );

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

  const response =
    "Shravani has excellent attendance (85%). She’s eligible for exams and maintaining a consistent record!";

  useEffect(() => {
    if (!studentId || !subjectId) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);

      const [attendanceRes, studentRes] = await Promise.allSettled([
        getSubjectAttendanceDetails(studentId, subjectId),
        getStudentDetails(studentId),
      ]);

      if (!isMounted) return;

      if (attendanceRes.status === "fulfilled") {
        setData(attendanceRes.value);
      } else {
        console.error(
          "Error fetching subject attendance:",
          attendanceRes.reason
        );
      }

      if (studentRes.status === "fulfilled") {
        setStudent(studentRes.value);
      } else {
        console.error("Error fetching student details:", studentRes.reason);
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [studentId, subjectId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Attendance Records...
      </div>
    );
  }

  if (!data || !student) {
    return (
      <div className="p-6 text-md text-red-500 font-medium">
        Subject records not found.
      </div>
    );
  }

  const leaveCount = data.records.filter(
    (r: any) => r.status === "Leave"
  ).length;

  const subjectSummary = {
    total: data.summary.totalClasses,
    present: data.summary.attended,
    absent: data.summary.absent,
    leave: leaveCount,
  };

  const filteredRecords =
    filter === "ALL"
      ? data.records
      : data.records.filter((r: any) => r.status === filter);

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

      <section className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentProfileCard
            name={student.fullName}
            department={student.department}
            studentId={student.studentsId.toString()}
            phone={student.mobile}
            email={student.email}
            address={student.address || "Address not available"}
            photo={student.photo || ""}
            isSubjectMode={true}
            subjectSummary={subjectSummary}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        <div className="lg:col-span-1">
          <AiBotCard response={response} />
        </div>
      </section>

      <section className="mb-8 mt-5">
        <h2 className="text-lg font-medium text-[#1A1C1E] mb-4">
          Subject Detail View
        </h2>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-5 text-[13px]">
          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wider text-xs">
              Subject :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4  rounded-full font-medium">
              {data.subjectName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wider text-xs">
              Faculty :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4  rounded-full font-medium">
              {data.facultyName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wider text-xs">
              Sort :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4  rounded-full font-medium">
              Classes Held: {data.summary.totalClasses} | Attended:{" "}
              {data.summary.attended} | Missed: {data.summary.absent} | Total:{" "}
              {data.summary.percentage}%
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
