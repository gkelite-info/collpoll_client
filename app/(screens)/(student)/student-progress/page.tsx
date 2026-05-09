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

const Page = () => {
  const [open, setOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const { studentId } = useStudent();
  const [progressData, setProgressData] = useState<Awaited<
    ReturnType<typeof getStudentProgressData>
  > | null>(null);
  const {
    userId,
    fullName,
    profilePhoto,
    identifierId,
    loading: userLoading,
  } = useUser();
  const {
    loading: studentLoading,
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
    college_sections,
    collegeSemester,
  } = useStudent();

  const semesterLabel = collegeSemester
    ? `Semester ${collegeSemester}`
    : "Semester N/A";
  const isLoading = userLoading || studentLoading || progressLoading;
  const academicPerformanceData =
    progressData?.subjectProgressRows.map((row) => ({
      subject: row.subjectKey,
      value: row.progressPercent,
      full: 100,
    })) ?? [];

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
      <main className="p-3 max-md:p-2 max-md:pb-7 max-md:bg-[#f4f5f6] relative overflow-hidden min-h-screen">
        <section className="mb-3 max-md:mb-2">
          <div className="flex p-2 gap-3 justify-between items-center max-md:p-1 max-md:gap-2 w-full ">
            <div className="flex-1 max-w-5xl rounded-xl min-w-0 max-md:mr-2">
              <div className="flex gap-3 max-md:gap-2 max-md:items-center max-md:overflow-x-auto scrollbar-hide max-md:pb-1">
                <div className="max-md:shrink-0">
                  <span className="text-gray-600 text-lg font-medium max-md:text-[13px]">
                    {collegeEducationType === "Inter" ? "Group" : "Department"}{" "}
                    :
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide lg:ml-1 max-md:px-2 max-md:py-0.5 max-md:text-[11px] max-md:ml-1">
                    {collegeBranchCode ?? "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1 max-md:gap-1 max-md:shrink-0">
                  <span className="text-gray-600 text-lg font-medium max-md:text-[13px] max-md:ml-1">
                    Year :
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide max-md:px-2 max-md:py-0.5 max-md:text-[11px]">
                    {collegeAcademicYear ?? "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1 max-md:shrink-0">
                  <span className="text-gray-600 text-lg font-medium max-md:text-[13px] max-md:ml-1">
                    Section:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide max-md:px-2 max-md:py-0.5 max-md:text-[11px]">
                    {college_sections ?? "N/A"}
                  </span>
                </div>

                {/* Semester */}
                <div className="flex items-center gap-1 max-md:shrink-0">
                  <span className="text-gray-600 text-lg font-medium max-md:text-[13px] max-md:ml-1">
                    Semester:
                  </span>
                  <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide max-md:px-2 max-md:py-0.5 max-md:text-[11px]">
                    {collegeSemester ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className=" justify-end w-[32%] hidden lg:flex">
              <CourseScheduleCard style="w-[320px]" />
            </div>

            <div
              className="w-12 h-12 aspect-square rounded-full bg-[#43C17A1A] flex items-center justify-center cursor-pointer max-md:w-8 max-md:h-8 max-md:shrink-0"
              onClick={() => setOpen(true)}
            >
              <List
                size={26}
                weight="bold"
                className="text-gray-700 max-md:w-[18px] max-md:h-[18px]"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-100 max-md:bg-transparent grid-rows-[300px_300px] flex flex-col gap-6 max-md:gap-4">
          <article className="grid grid-cols-1 lg:grid-cols-10 gap-6 max-md:gap-4">
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
                attendanceCount={progressData?.attendedCount ?? 0}
                absentCount={progressData?.absentCount ?? 0}
                leaveCount={progressData?.leaveCount ?? 0}
              />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-4 lg:col-span-4 max-md:p-3">
              <AttendanceSummaryCard
                percentage={progressData?.overallAttendancePercentage ?? 0}
              />
            </section>

            <section className="bg-white rounded-2xl lg:col-span-6">
              <AcademicPerformance
                studentId={studentId}
                data={academicPerformanceData}
              />
            </section>

            <section className="bg-white rounded-2xl lg:col-span-4">
              <AttendanceList data={progressData?.subjectAttendance || []} />
            </section>
          </article>

          <section className="bg-white rounded-2xl max-md:bg-transparent max-md:rounded-none">
            <AssignmentsSummaryTable
              rows={progressData?.subjectProgressRows ?? []}
              semesterLabel={semesterLabel}
            />
          </section>
        </section>

        {open && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/10"
              onClick={() => setOpen(false)}
            />

            <div className="absolute top-35 right-9 max-md:top-14 max-md:right-4">
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

                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl">
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
