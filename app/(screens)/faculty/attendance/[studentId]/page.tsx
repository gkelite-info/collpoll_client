"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import StudentProfileCard from "../components/stuProfileCard";
import SubjectWiseAttendance from "../components/subjectWiseTable";
import AiBotCard from "../components/aiBotCard";
import { getStudentAttendanceDetails } from "@/lib/helpers/faculty/attendance/getStudentAttendanceDetails";

// 1. UPDATE IMPORT to the new helper file

export default function StudentAttendanceDetailsPage() {
  const params = useParams();
  const studentId = Array.isArray(params?.studentId)
    ? params.studentId[0]
    : params?.studentId;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const llmResponse =
    "Shravani has excellent attendance (85%). She’s eligible for exams and maintaining a consistent record!";

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      try {
        const data = await getStudentAttendanceDetails(studentId);
        setStudent(data);
      } catch (error) {
        console.error("Failed to fetch student profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Student Profile...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Student not found.
      </div>
    );
  }

  return (
    <main className="p-4 space-y-6 min-h-screen">
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Info label="Department" value={student.department} />
          <Info label="Year" value={student.year?.toString()} />
          <Info label="Section" value={student.section} />
          <Info label="Degree" value={student.degree} />
        </div>

        <CourseScheduleCard
          style="w-[320px]"
          department={student.department}
          degree={student.degree}
          year={student.year}
        />
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
            attendanceDays={student.attendanceDays}
            absentDays={student.absentDays}
            leaveDays={student.leaveDays}
          />
        </div>

        <div className="lg:col-span-1">
          <AiBotCard response={llmResponse} />
        </div>
      </section>

      <section className="w-full">
        <SubjectWiseAttendance
          studentId={studentId || ""}
          data={student.subjectAttendance}
        />
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-xs text-[#666666]">{label} :</span>
      <span className="rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-xs font-medium text-[#4CAF50]">
        {value}
      </span>
    </div>
  );
}
