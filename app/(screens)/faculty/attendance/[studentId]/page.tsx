"use client";

import { useParams, useRouter } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SubjectWiseAttendance from "../components/subjectWiseTable";
import { getStudentAttendanceDetails } from "@/lib/helpers/faculty/attendance/getStudentAttendanceDetails";
import { CaretLeft } from "@phosphor-icons/react";
import StudentProfileCard from "../components/stuProfileCard";
import { useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import AiBotCard from "../components/aiBotCard";
import { useQuery } from "@tanstack/react-query";
import StudentDetailsSkeleton from "./shimmer/studentDetailsSkeleton";

export default function StudentAttendanceDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const studentId = Array.isArray(params?.studentId)
    ? params.studentId[0]
    : params?.studentId;

  const { collegeEducationType } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);

  const { data: student, isLoading } = useQuery({
    queryKey: ["studentAttendanceDetails", studentId],
    queryFn: () => getStudentAttendanceDetails(studentId!),
    enabled: !!studentId,
  });

  useEffect(() => {
    // Scroll to top immediately on mount
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Also scroll when loading finishes to be absolutely sure
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        const topElement = document.getElementById("student-attendance-top");
        if (topElement) {
          topElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  }, [isLoading]);

  return (
    <main className="p-3 md:p-4 space-y-4 md:space-y-6 min-h-screen w-full max-w-full overflow-x-hidden relative">
      <div id="student-attendance-top" className="absolute top-0 left-0 w-full h-0 pointer-events-none" />
      
      {/* ALWAYS render the header to prevent layout jump and show it immediately */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
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
          department={student?.department}
          degree={student?.degree}
          year={student?.year ? String(student.year) : undefined}
          isLoading={isLoading}
        />
      </section>

      {/* Conditional rendering for body */}
      {isLoading ? (
        <StudentDetailsSkeleton isBodyOnly={true} />
      ) : !student ? (
        <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
          Student not found.
        </div>
      ) : (
        <>
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
            isSchool={isSchool}
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
        </>
      )}
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
