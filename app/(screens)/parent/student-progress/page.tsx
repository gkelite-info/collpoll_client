"use client";

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import { AttendanceSummaryCard } from "./attendanceSummaryCard";
import { ProfileCard } from "./profileCard";
import { AssignmentsSummaryTable } from "./assignmentsSummaryTable";
import { AttendanceList } from "./attendanceBySubjectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useParent } from "@/app/utils/context/parent/useParent";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { getStudentProgressData } from "@/lib/helpers/student/studentProgress/getStudentProgressData";
import { StudentProgressSkeleton } from "@/app/(screens)/(student)/student-progress/shimmer/studentProgressSkeleton";
import { supabase } from "@/lib/supabaseClient";

const Page = () => {
  const [open, setOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressData, setProgressData] = useState<Awaited<
    ReturnType<typeof getStudentProgressData>
  > | null>(null);
  const [childMeta, setChildMeta] = useState<{
    fullName: string;
    profilePhoto: string | null;
    identifierId: string;
  } | null>(null);
  const [studentContext, setStudentContext] = useState<Awaited<
    ReturnType<typeof fetchStudentContext>
  > | null>(null);

  const {
    loading: parentLoading,
    childUserId,
    studentId,
    collegeEducationType,
  } = useParent();

  const semesterLabel = studentContext?.collegeSemester
    ? `Semester ${studentContext.collegeSemester}`
    : "Semester N/A";
  const isLoading = parentLoading || progressLoading;
  const totalAttendanceEvents =
    (progressData?.attendedCount ?? 0) +
    (progressData?.absentCount ?? 0) +
    (progressData?.leaveCount ?? 0);
  const attendancePercentage =
    totalAttendanceEvents > 0
      ? Math.round(((progressData?.attendedCount ?? 0) / totalAttendanceEvents) * 100)
      : progressData?.overallAttendancePercentage ?? 0;
  const absentPercentage =
    totalAttendanceEvents > 0
      ? Math.round(((progressData?.absentCount ?? 0) / totalAttendanceEvents) * 100)
      : progressData?.absentPercentage ?? 0;
  const leavePercentage =
    totalAttendanceEvents > 0
      ? Math.round(((progressData?.leaveCount ?? 0) / totalAttendanceEvents) * 100)
      : progressData?.leavePercentage ?? 0;
  const academicPerformanceData =
    progressData?.subjectProgressRows.map((row) => ({
      subject: row.subjectKey,
      value: row.progressPercent,
      full: 100,
    })) ?? [];

  useEffect(() => {
    if (parentLoading) return;
    if (!childUserId || !studentId) {
      setProgressLoading(false);
      return;
    }

    let mounted = true;

    async function loadParentStudentProgress() {
      setProgressLoading(true);

      try {
        const safeChildUserId = childUserId;
        const safeStudentId = studentId;
        if (safeChildUserId === null || safeStudentId === null) {
          return;
        }
        const [
          progress,
          context,
          childUserResult,
          childPinResult,
          childProfileResult,
        ] = await Promise.all([
          getStudentProgressData(safeChildUserId),
          fetchStudentContext(safeChildUserId),
          supabase
            .from("users")
            .select("fullName")
            .eq("userId", safeChildUserId)
            .maybeSingle(),
          supabase
            .from("student_pins")
            .select("pinNumber")
            .eq("studentId", safeStudentId)
            .eq("isActive", true)
            .is("deletedAt", null)
            .maybeSingle(),
          supabase
            .from("user_profile")
            .select("profileUrl")
            .eq("userId", safeChildUserId)
            .eq("is_deleted", false)
            .is("deletedAt", null)
            .maybeSingle(),
        ]);

        if (!mounted) return;

        setProgressData(progress);
        setStudentContext(context);
        setChildMeta({
          fullName: childUserResult.data?.fullName ?? "Student",
          profilePhoto: childProfileResult.data?.profileUrl ?? null,
          identifierId: childPinResult.data?.pinNumber ?? "N/A",
        });
      } finally {
        if (mounted) {
          setProgressLoading(false);
        }
      }
    }

    loadParentStudentProgress();

    return () => {
      mounted = false;
    };
  }, [childUserId, parentLoading, studentId]);

  if (isLoading) {
    return <StudentProgressSkeleton />;
  }

  return (
    <main className="relative overflow-hidden p-3">
      <section className="mb-3">
        <div className="flex items-center justify-between gap-3 p-2">
          <div className="w-full max-w-5xl rounded-xl">
            <div className="flex gap-3">
              <div>
                <span className="text-lg font-medium text-gray-600">
                  {collegeEducationType === "Inter" ? "Group" : "Branch"}:
                </span>
                <span className="lg:ml-1 rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
                  {studentContext?.collegeBranchCode ?? "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-lg font-medium text-gray-600">Year:</span>
                <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
                  {studentContext?.collegeAcademicYear ?? "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-lg font-medium text-gray-600">
                  Section:
                </span>
                <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
                  {studentContext?.collegeSections ?? "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-lg font-medium text-gray-600">
                  Semester:
                </span>
                <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
                  {studentContext?.collegeSemester ?? "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-[32%] justify-end">
            <CourseScheduleCard style="w-[320px]" />
          </div>

          <div
            className="flex aspect-square h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#43C17A1A]"
            onClick={() => setOpen(true)}
          >
            <List size={26} weight="bold" className="text-gray-700 " />
          </div>
        </div>
      </section>

      <section className="min-h-screen grid-rows-[300px_300px] bg-gray-100 flex flex-col gap-6">
        <article className="grid grid-cols-1 gap-6 lg:grid-cols-10 ">
          <section className="rounded-2xl bg-white shadow-sm lg:col-span-6">
            <ProfileCard
              name={childMeta?.fullName ?? "Student"}
              department={studentContext?.collegeBranchCode ?? "N/A"}
              studentId={childMeta?.identifierId ?? "N/A"}
              avatarUrl={
                childMeta?.profilePhoto ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
              }
              attendancePercentage={attendancePercentage}
              absentPercentage={absentPercentage}
              leavePercentage={leavePercentage}
            />
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-4 ">
            <AttendanceSummaryCard percentage={attendancePercentage} />
          </section>

          <section className="rounded-2xl bg-white lg:col-span-6">
            <AcademicPerformance
              studentId={childUserId}
              data={academicPerformanceData}
            />
          </section>

          <section className="rounded-2xl bg-white lg:col-span-4">
            <AttendanceList data={progressData?.subjectAttendance || []} />
          </section>
        </article>

        <section className="rounded-2xl bg-white">
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

          <div className="absolute right-9 top-35">
            <div className="min-w-55 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <span className="text-sm font-semibold text-gray-800">
                  Previous Sem Marks
                </span>
                <button onClick={() => setOpen(false)}>
                  <X
                    size={18}
                    weight="bold"
                    className="cursor-pointer text-gray-600"
                  />
                </button>
              </div>

              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
