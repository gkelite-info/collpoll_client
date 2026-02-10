"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { getStudentAttendanceDetails } from "@/lib/helpers/faculty/attendance/getStudentAttendanceDetails";
import { getSubjectAttendanceDetails } from "@/lib/helpers/faculty/attendance/getSubjectAttendanceDetails";
import StudentProfileCard from "@/app/(screens)/faculty/attendance/components/stuProfileCard";
import AiBotCard from "@/app/(screens)/faculty/attendance/components/aiBotCard";
import SubjectAttendanceTable from "@/app/(screens)/faculty/attendance/components/subjectAttendanceTable";

export default function SubjectDetailPage() {
  const params = useParams();

  const studentId = Array.isArray(params?.studentId)
    ? params.studentId[0]
    : params?.studentId;
  const subjectId = Array.isArray(params?.subjectId)
    ? params.subjectId[0]
    : params?.subjectId;

  const [filter, setFilter] = useState<"ALL" | "Present" | "Absent" | "Leave">(
    "ALL",
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
        getStudentAttendanceDetails(studentId),
      ]);

      if (!isMounted) return;

      if (attendanceRes.status === "fulfilled") {
        setData(attendanceRes.value);
      } else {
        console.error(
          "Error fetching subject attendance:",
          attendanceRes.reason,
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Records...
      </div>
    );
  }

  if (!data || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Subject records not found.
      </div>
    );
  }

  const leaveCount = data.summary.leave;

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
    <main className="px-4 py-4 min-h-screen space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track, Verify and Manage Attendance Records.
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
            address={student.address}
            photo={student.photo || ""}
            isSubjectMode={true}
            subjectSummary={subjectSummary}
            activeFilter={filter}
            onFilterChange={setFilter}
            attendanceDays={0}
            absentDays={0}
            leaveDays={0}
          />
        </div>

        <div className="lg:col-span-1">
          <AiBotCard response={response} />
        </div>
      </section>

      <section className="">
        <h2 className="text-lg font-bold text-[#1A1C1E] mb-4">
          Subject Detail View
        </h2>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-xs">
              Subject :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-1 rounded-full font-medium">
              {data.subjectName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-xs">
              Faculty :
            </span>
            <span className="bg-[#E6F4FF] text-[#007AFF] px-4 py-1 rounded-full font-medium">
              {data.facultyName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-xs">
              Summary :
            </span>
            <span className="text-gray-700 font-medium bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
              Held:{" "}
              <span className="font-medium">{data.summary.totalClasses}</span>
              <span className="mx-2 text-gray-300">|</span>
              Present:{" "}
              <span className="text-green-600 font-medium">
                {data.summary.attended}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              Percentage:{" "}
              <span className="text-blue-600 font-medium">
                {data.summary.percentage}%
              </span>
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
