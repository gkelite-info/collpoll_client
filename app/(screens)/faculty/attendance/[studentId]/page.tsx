"use client";

import { useParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import StudentProfileCard from "../components/stuProfileCard";
import ParentsList from "../components/parentsList";
import SubjectWiseAttendance from "../components/subjectWiseTable";
import { students } from "../data";

export default function StudentAttendanceDetailsPage() {
  const { studentId } = useParams<{ studentId: string }>();

  const student = students.find((s) => s.id === studentId);

  if (!student) {
    return <div className="p-6">Student not found</div>;
  }

  return (
    <main className="p-4 space-y-6 bg-[#F8F9FA] min-h-screen">
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Info label="Department" value={student.department} />
          <Info label="Year" value={student.year} />
          <Info label="Section" value={student.section} />
          <Info label="Semester" value={student.semester} />
        </div>

        <CourseScheduleCard style="w-auto" />
      </section>

      <section className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentProfileCard
            name={student.name}
            department={student.department}
            studentId={student.id}
            phone={student.phone}
            email={student.email}
            address={student.address}
            photo={student.photo}
            attendanceDays={student.attendanceDays}
            absentDays={student.absentDays}
            leaveDays={student.leaveDays}
          />
        </div>

        <div className="lg:col-span-1">
          <ParentsList parents={student.parents} />
        </div>
      </section>

      <section className="w-full">
        <SubjectWiseAttendance studentId={student.id} />
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base font-medium text-[#666666]">{label} :</span>
      <span className="rounded-full bg-[#E8F5E9] px-4 py-1 text-sm font-semibold text-[#4CAF50]">
        {value}
      </span>
    </div>
  );
}
