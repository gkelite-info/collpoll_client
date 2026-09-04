"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { useUser } from "@/app/utils/context/UserContext";

import { getFacultyStudentProfile } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProfile";
import { getFacultyStudentPerformance } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentPerformance";
import type { FacultyStudentProgressDetailsScope } from "@/lib/helpers/faculty/studentProgress/sharedProgressTypes";

import GradesTable from "./components/gradesTable";
import AssignmentsTable from "./components/assignmentsTable";
import ParentsList, { Parent } from "./components/parentsList";
import StudentProfileCard from "./components/stuProfileCard";
import SharedProgressChatModal from "@/app/components/SharedProgressChatModal";
import AttendanceSummaryCard from "./components/attendanceSummaryCard";
import AcademicPerformance from "@/app/(screens)/admin/student-progress/[roll-no]/components/academicPerformanceChart";

import {
  StudentProgressDetailsSkeleton,
  StudentProfileCardSkeleton,
  ParentsCardSkeleton as ParentsListSkeleton,
  AcademicPerformanceSkeleton,
  AttendanceSummarySkeleton,
  GradesTableSkeleton as GradesSkeleton,
} from "../shimmer/StudentProgressSkeleton";

export default function StudentProgressDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rollNo = Array.isArray(params?.["roll-no"])
    ? params["roll-no"][0]
    : params?.["roll-no"];

  const { userId: facultyUserId } = useUser();

  const {
    loading: facultyLoading,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    college_branch,
    academicYearIds,
    sectionIds,
    subjectIds,
    facultyId,
    faculty_edu_type,
  } = useFaculty();

  const isSchoolFromEducation =
    faculty_edu_type
      ?.split(",")
      .some((educationType) => isSchoolEducation(educationType)) ?? false;
  
  const isSchoolFromCookie =
    typeof document !== "undefined" &&
    document.cookie.split("; ").some((cookie) => cookie === "isSchool=true");
    
  const isSchool = isSchoolFromEducation || isSchoolFromCookie;

  const [activeChatParent, setActiveChatParent] = useState<Parent | null>(null);

  const isContextReady =
    !facultyLoading &&
    !!rollNo &&
    !!collegeId &&
    !!facultyId &&
    !!academicYearIds?.length &&
    !!sectionIds?.length &&
    !!subjectIds?.length;

  const scope = useMemo(
    (): FacultyStudentProgressDetailsScope | null => {
      if (!isContextReady) return null;
      return {
        rollNo,
        facultyId,
        collegeId,
        academicYearIds,
        sectionIds,
        subjectIds,
      };
    },
    [
      isContextReady,
      rollNo,
      facultyId,
      collegeId,
      academicYearIds,
      sectionIds,
      subjectIds,
    ]
  );

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["facultyStudentProfile", scope],
    queryFn: () => getFacultyStudentProfile(scope!),
    enabled: !!scope,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["facultyStudentPerformance", scope],
    queryFn: () => getFacultyStudentPerformance(scope!),
    enabled: !!scope,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (facultyLoading || (!scope && !facultyLoading && !!rollNo)) {
    return <StudentProgressDetailsSkeleton />;
  }

  const profile = profileData?.studentProfile;
  const totalAttendanceRecords = profile
    ? profile.attendanceDays + profile.absentDays + profile.leaveDays
    : 0;
  const attendancePercentage = profileData?.attendancePercentage ?? 0;
  const absentPercentage = totalAttendanceRecords > 0 ? Math.round((profile!.absentDays / totalAttendanceRecords) * 100) : 0;
  const leavePercentage = totalAttendanceRecords > 0 ? Math.round((profile!.leaveDays / totalAttendanceRecords) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-transparent p-2 font-sans">
      <section className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F3F4F6] text-[#282828] transition-colors hover:bg-[#E5E7EB]"
          >
            <CaretLeft size={18} weight="bold" />
          </button>

          {profileLoading ? (
            <div className="flex items-center gap-2 ml-1">
              <div className="w-[100px] h-6 md:h-7 bg-[#F3F4F6] rounded-full animate-pulse"></div>
              <div className="w-[80px] h-6 md:h-7 bg-[#F3F4F6] rounded-full animate-pulse"></div>
              <div className="w-[70px] h-6 md:h-7 bg-[#F3F4F6] rounded-full animate-pulse"></div>
            </div>
          ) : (
            <>
              {(!profileData ? !isSchool : !profileData.isStudentSchool) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">
                    {profileData?.isStudentInter ? "Group:" : "Branch:"}
                  </span>
                  <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
                    {profileData?.departmentLabel ?? "..."}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-gray-600 text-xs md:text-sm font-medium">
                  {(!profileData ? isSchool : profileData.isStudentSchool) ? "Class:" : "Year:"}
                </span>
                <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
                  {profileData?.yearLabel ?? "..."}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-gray-600 text-xs md:text-sm font-medium">Sec:</span>
                <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
                  {profileData?.sectionLabel ?? "..."}
                </span>
              </div>

              {(!profileData ? !isSchool : (!profileData.isStudentSchool && !profileData.isStudentInter)) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">Sem:</span>
                  <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
                    {profileData?.semesterLabel ?? "..."}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <article className="hidden lg:flex justify-end">
          <CourseScheduleCard style="w-[320px]" isVisibile={false}/>
        </article>
      </section>

      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
              {profileLoading || !profile ? (
                <>
                  <div className="h-full lg:col-span-3">
                    <StudentProfileCardSkeleton />
                  </div>
                  <div className="h-full lg:col-span-2">
                    <ParentsListSkeleton />
                  </div>
                </>
              ) : (
                <>
                  <div className="h-full lg:col-span-3">
                    <StudentProfileCard
                      {...profile}
                      attendancePercentage={attendancePercentage}
                      absentPercentage={absentPercentage}
                      leavePercentage={leavePercentage}
                    />
                  </div>
                  <div className="h-full lg:col-span-2">
                    <ParentsList
                      parents={profileData.parents}
                      onChatOpen={(parent) => setActiveChatParent(parent)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
              {performanceLoading || !performanceData ? (
                <>
                  <div className="h-full lg:col-span-3">
                    <AcademicPerformanceSkeleton />
                  </div>
                  <div className="h-full lg:col-span-2">
                    <AttendanceSummarySkeleton />
                  </div>
                </>
              ) : (
                <>
                  <div className="h-full lg:col-span-3">
                    <AcademicPerformance data={performanceData.academicPerformance} />
                  </div>
                  <div className="h-full lg:col-span-2">
                    <AttendanceSummaryCard percentage={attendancePercentage} />
                  </div>
                </>
              )}
            </div>

            <div className="w-full">
              <div className="h-full min-w-0 w-full">
                {scope && (
                  <AssignmentsTable
                    scope={scope}
                    weightages={performanceData?.taskWeightages}
                    insights={performanceData?.taskInsights}
                  />
                )}
              </div>
              {/* Grades table is intentionally hidden so Academic Tasks uses the full width.
              <div className="h-full min-w-0">
                {performanceLoading || !performanceData ? (
                  <GradesSkeleton />
                ) : (
                  <GradesTable grades={performanceData.grades} />
                )}
              </div> */}
          </div>
        </div>
      </div>

      {activeChatParent && profile && (
        <SharedProgressChatModal
          isOpen={true}
          onClose={() => setActiveChatParent(null)}
          chatParticipantName={activeChatParent.name}
          chatParticipantSubtitle={activeChatParent.relation}
          chatParticipantAvatar={activeChatParent.avatar}
          studentId={profile.studentDbId}
          facultyId={facultyId!}
          collegeId={collegeId!}
          senderUserId={facultyUserId!}
          senderRole="FACULTY"
        />
      )}
    </div>
  );
}
