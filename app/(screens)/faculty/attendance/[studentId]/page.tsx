"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SubjectWiseAttendance from "../components/subjectWiseTable";
import { getStudentAttendanceDetails } from "@/lib/helpers/faculty/attendance/getStudentAttendanceDetails";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { CaretLeft } from "@phosphor-icons/react";
import StudentProfileCard from "../components/stuProfileCard";
import AiBotCard from "../components/aiBotCard";

type StudentAttendanceDetails = NonNullable<
  Awaited<ReturnType<typeof getStudentAttendanceDetails>>
>;

export default function StudentAttendanceDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const studentId = Array.isArray(params?.studentId)
    ? params.studentId[0]
    : params?.studentId;

  const [student, setStudent] = useState<StudentAttendanceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      try {
        const data = await getStudentAttendanceDetails(studentId);
        setStudent(data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="flex items-center justify-center gap-5">
          <Loader />
          <p>Loading Student Profile</p>
        </div>
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
    <main className="p-3 md:p-4 space-y-4 md:space-y-6 min-h-screen w-full max-w-full overflow-x-hidden">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex text-black items-start md:items-center gap-2">
          <button
            onClick={() => router.back()}
            className="mt-1 md:mt-0 text-gray-600 cursor-pointer hover:text-black shrink-0"
          >
            <CaretLeft
              size={24}
              className="md:w-[25px] md:h-[25px]"
              weight="bold"
            />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              Attendance
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">
              Track, Verify and Manage Attendance Records.
            </p>
          </div>
        </div>

        <CourseScheduleCard
          style="w-full md:w-[320px] max-md:hidden shrink-0"
          department={student.department}
          degree={student.degree}
          year={String(student.year)}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch w-full min-w-0">
        <div className="lg:col-span-2 min-w-0">
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
            attendancePercentage={student.attendancePercentage}
          />
        </div>
        <div className="lg:col-span-1 min-w-0">
          <AiBotCard
            response={
              student.attendancePrompt ||
              "Attendance criteria will appear here once records are available."
            }
          />
        </div>
      </section>

      <section className="w-full min-w-0">
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
