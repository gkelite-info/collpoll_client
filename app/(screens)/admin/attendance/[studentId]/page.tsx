"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { getStudentAttendanceDetails } from "@/lib/helpers/faculty/attendance/getStudentAttendanceDetails";
import AiBotCard from "@/app/(screens)/faculty/attendance/components/aiBotCard";
import SubjectWiseAttendance from "../tables/subjectWiseTable";
import StudentProfileCard from "@/app/(screens)/faculty/attendance/components/stuProfileCard";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";

type StudentAttendanceDetails = Awaited<
  ReturnType<typeof getStudentAttendanceDetails>
>;

export default function StudentAttendanceDetailsPage() {
  const params = useParams();
  const studentId = Array.isArray(params?.studentId)
    ? params.studentId[0]
    : params?.studentId;

  const router = useRouter()

  const [student, setStudent] = useState<StudentAttendanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { collegeEducationType } = useUser();

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
        <Loader />
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
          <CaretLeftIcon onClick={() => router.back()} className="cursor-pointer h-4 w-4 -mr-4 font-bold" color="#282828" />
          <Info label={collegeEducationType === "Inter" ? "Group" : "Branch"} value={student.department} />
          <Info label="Year" value={student.year?.toString()} />
          <Info label="Section" value={student.section} />
          <Info label="Degree" value={student.degree} />
        </div>

        <CourseScheduleCard
          style="w-[320px]"
          department={student.department}
          degree={student.degree}
          year={student.year?.toString()}
          isVisibile={false}
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
            attendancePercentage={student.attendancePercentage}
          />
        </div>

        <div className="lg:col-span-1">
          <AiBotCard
            response={
              student.attendancePrompt ||
              "Attendance criteria will appear here once records are available."
            }
          />
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
