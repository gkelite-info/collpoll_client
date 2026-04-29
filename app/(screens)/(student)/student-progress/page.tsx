"use client";

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import { AttendanceSummaryCard } from "./attendanceSummaryCard";
import { ProfileCard } from "./profileCard";
import { AssignmentsSummaryTable } from "./assignmentsSummaryTable";
import { AttendanceList } from "./attendanceBySubjectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { getStudentProgressData } from "@/lib/helpers/student/studentProgress/getStudentProgressData";
import { StudentProgressSkeleton } from "./shimmer/studentProgressSkeleton";

function toRomanSemester(semester: number | null) {
  if (!semester) return "N/A";

  const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  return numerals[semester - 1] ?? String(semester);
}

const Page = () => {
  const [open, setOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const { studentId } = useStudent();
  const [progressData, setProgressData] = useState<Awaited<
    ReturnType<typeof getStudentProgressData>
  > | null>(null);
  const { userId, fullName, profilePhoto, identifierId, loading: userLoading } =
    useUser();
  const {
    loading: studentLoading,
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
    college_sections,
    collegeSemesterId,
  } = useStudent();

  const semesterLabel =
    collegeSemesterId !== null
      ? `Semester ${toRomanSemester(collegeSemesterId)}`
      : "Semester N/A";
  const assignmentsTitle = `Assignments Summary - ${collegeEducationType ?? ""} ${collegeBranchCode ?? "N/A"} ${collegeAcademicYear ?? "N/A"} ( ${semesterLabel} )`;
  const isLoading = userLoading || studentLoading || progressLoading;

  useEffect(() => {
    if (userLoading || studentLoading) return;
    if (!userId) {
      setProgressLoading(false);
      return;
    }

    const safeUserId = userId;
    let mounted = true;

    async function loadProgressData() {
      setProgressLoading(true);

      try {
        const data = await getStudentProgressData(safeUserId);
        if (mounted) {
          setProgressData(data);
        }
      } finally {
        if (mounted) {
          setProgressLoading(false);
        }
      }
    }

    loadProgressData();

    return () => {
      mounted = false;
    };
  }, [userId, userLoading, studentLoading]);

  if (isLoading) {
    return <StudentProgressSkeleton />;
  }

  return (
    <>
      <main className="p-3 relative overflow-hidden">
        <section className="mb-3">
          <div className="flex p-2 gap-3 justify-between items-center">
            <div className="w-full max-w-5xl rounded-xl">
              <div className="flex gap-3">
                <div>
                  <span className="text-gray-600 text-lg font-medium">
                    {collegeEducationType === "Inter" ? "Group" : "Branch"}:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide lg:ml-1">
                    {collegeBranchCode ?? "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-lg font-medium">
                    Year:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                    {collegeAcademicYear ?? "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-lg font-medium">
                    Section:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                    {college_sections ?? "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-lg font-medium">
                    Semester:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                    {toRomanSemester(collegeSemesterId)}
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
                name={fullName ?? "Student"}
                department={collegeBranchCode ?? "N/A"}
                studentId={identifierId ?? "N/A"}
                avatarUrl={
                  profilePhoto ||
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                }
                attendancePercentage={
                  progressData?.overallAttendancePercentage ?? 0
                }
                absentPercentage={progressData?.absentPercentage ?? 0}
                leavePercentage={progressData?.leavePercentage ?? 0}
              />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-4 lg:col-span-4 ">
              <AttendanceSummaryCard
                percentage={progressData?.overallAttendancePercentage ?? 0}
              />
            </section>

            <section className="bg-white rounded-2xl lg:col-span-6">
              <AcademicPerformance studentId={studentId} />
            </section >

            <section className="bg-white rounded-2xl lg:col-span-4">
              <AttendanceList data={progressData?.subjectAttendance || []} />
            </section>
          </article >

          <section className="bg-white rounded-2xl">
            <AssignmentsSummaryTable
              assignments={progressData?.assignmentsSummary ?? []}
              title={assignmentsTitle}
              semesterLabel={semesterLabel}
            />
          </section>
        </section >

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
      </main >
    </>
  );
};

export default Page;
