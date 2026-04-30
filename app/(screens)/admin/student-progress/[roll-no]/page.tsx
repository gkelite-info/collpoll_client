"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";

import StudentProfileCard from "./components/stuProfileCard";
import AssignmentsTable from "./components/assignmentsTable";
import ParentsList, { Parent } from "./components/parentsList";
import GradesTable from "./components/gradesTable";
import { AttendanceSummaryCard } from "./components/attendanceSummaryCard";
import AcademicPerformance from "./components/academicPerformanceChart";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ChatWindow from "./components/chatWindow";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { getAdminStudentProgressDetails } from "@/lib/helpers/admin/studentProgress/getAdminStudentProgressDetails";
import { useStudentProgressFilters } from "@/lib/helpers/admin/studentProgress/useStudentProgressFilters";

type StudentProgressDetails = Awaited<
  ReturnType<typeof getAdminStudentProgressDetails>
>;

const parseId = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const DetailHeaderSkeleton = () => (
  <section className="mb-6 flex items-center justify-between">
    <div className="flex gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          {index === 0 ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : null}
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-[#E8F6E2]" />
        </div>
      ))}
    </div>

    <article className="flex justify-end">
      <div className="h-[88px] w-[320px] animate-pulse rounded-[24px] bg-white shadow-sm" />
    </article>
  </section>
);

const StudentProfileCardSkeleton = () => (
  <div className="h-full rounded-[20px] bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
        <div>
          <div className="mb-3 h-7 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-[#E8F6E2]" />
        </div>
      </div>
      <div className="h-6 w-36 animate-pulse rounded-full bg-[#E8F6E2]" />
    </div>

    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index}>
          <div className="mb-2 h-4 w-16 animate-pulse rounded bg-gray-100" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>

    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
            <div className="min-w-0 flex-1">
              <div className="mb-2 h-5 w-14 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ParentsCardSkeleton = () => (
  <div className="h-full rounded-[20px] bg-white p-6 shadow-sm">
    <div className="mb-6 h-7 w-48 animate-pulse rounded bg-gray-200" />
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-full bg-[#E8F6E2] p-3"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />
            <div>
              <div className="mb-2 h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-14 w-14 animate-pulse rounded-full bg-[#A1D683]/50" />
        </div>
      ))}
    </div>
  </div>
);

const AcademicPerformanceSkeleton = () => (
  <div className="rounded-[20px] bg-white p-6 shadow-sm">
    <div className="mb-6 h-7 w-48 animate-pulse rounded bg-gray-200" />
    <div className="rounded-[20px] bg-gray-50 p-6">
      <div className="flex h-full items-end justify-between gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-3">
            <div
              className="w-full animate-pulse rounded-[18px] bg-[#E8F6E2]"
              style={{ height: `${120 + ((index % 4) + 1) * 28}px` }}
            />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AttendanceSummarySkeleton = () => (
  <div className="h-full rounded-xl bg-white p-4 shadow-sm">
    <div className="mb-4 h-6 w-44 animate-pulse rounded bg-gray-200" />
    <div className="relative mx-auto h-[160px] w-[260px]">
      <div className="absolute left-1/2 top-0 h-[130px] w-[260px] -translate-x-1/2 overflow-hidden">
        <div className="h-[260px] w-[260px] animate-pulse rounded-full border-[22px] border-[#E8F6E2]" />
      </div>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
        <div className="mb-2 h-8 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-7 w-36 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  </div>
);

const TasksCardSkeleton = () => (
  <div className="rounded-[20px] bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-28 animate-pulse rounded-full bg-[#E8F6E2]"
          />
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <div className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr] gap-6 px-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr] gap-6 border-t border-gray-100 px-4 py-4"
        >
          <div className="h-5 animate-pulse rounded bg-gray-200" />
          <div className="h-5 animate-pulse rounded bg-gray-100" />
          <div className="h-5 animate-pulse rounded bg-gray-100" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
);

const GradesTableSkeleton = () => (
  <div className="rounded-[20px] bg-white p-6 shadow-sm">
    <div className="mb-6 h-7 w-24 animate-pulse rounded bg-gray-200" />
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.4fr_0.6fr_1fr] gap-4 border-b border-gray-100 pb-4"
        >
          <div className="h-5 animate-pulse rounded bg-gray-100" />
          <div className="h-5 w-10 animate-pulse rounded bg-gray-200" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
);

const StudentProgressDetailsSkeleton = () => (
  <div className="relative min-h-screen bg-[#F5F7FA] p-6 font-sans">
    <DetailHeaderSkeleton />

    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
          <div className="h-full lg:col-span-3">
            <StudentProfileCardSkeleton />
          </div>
          <div className="h-full lg:col-span-2">
            <ParentsCardSkeleton />
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
          <div className="h-full lg:col-span-3">
            <AcademicPerformanceSkeleton />
          </div>
          <div className="h-full lg:col-span-2">
            <AttendanceSummarySkeleton />
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
          <div className="h-full lg:col-span-3">
            <TasksCardSkeleton />
          </div>
          <div className="h-full lg:col-span-2">
            <GradesTableSkeleton />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function DashboardLayout() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { loading: adminLoading, collegeId, collegeEducationId } = useAdmin();
  const [activeChatParent, setActiveChatParent] = useState<Parent | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [details, setDetails] = useState<StudentProgressDetails>(null);

  const rollNoParam = params?.["roll-no"];
  const rollNo = Array.isArray(rollNoParam) ? rollNoParam[0] : rollNoParam;

  const branchId = parseId(searchParams.get("branchId"));
  const academicYearId = parseId(searchParams.get("yearId"));
  const semesterId = parseId(searchParams.get("semesterId"));
  const sectionId = parseId(searchParams.get("sectionId"));
  const subjectId = parseId(searchParams.get("subjectId"));

  const branchLabel =
    searchParams.get("branch") ??
    searchParams.get("department") ??
    "N/A";

  const {
    filtersLoading,
    branches,
    years,
    semesters,
    sections,
    subjects,
    selectedBranch,
    selectedYear,
    selectedSemester,
    selectedSection,
    selectedSubject,
    activeBranchIds,
    activeYearIds,
    activeSemesterIds,
    activeSectionIds,
    activeSubjectIds,
    selectBranch,
    selectYear,
    selectSemester,
    selectSection,
    selectSubject,
  } = useStudentProgressFilters({
    collegeId,
    collegeEducationId,
  });

  useEffect(() => {
    if (branchId && branches.length && !selectedBranch) {
      const branch = branches.find((item) => item.collegeBranchId === branchId);
      if (branch) selectBranch(branch);
    }
  }, [branchId, branches, selectBranch, selectedBranch]);

  useEffect(() => {
    if (academicYearId && years.length && !selectedYear) {
      const year = years.find((item) => item.collegeAcademicYearId === academicYearId);
      if (year) selectYear(year);
    }
  }, [academicYearId, selectYear, selectedYear, years]);

  useEffect(() => {
    if (semesterId && semesters.length && !selectedSemester) {
      const semester = semesters.find((item) => item.collegeSemesterId === semesterId);
      if (semester) selectSemester(semester);
    }
  }, [semesterId, selectSemester, selectedSemester, semesters]);

  useEffect(() => {
    if (sectionId && sections.length && !selectedSection) {
      const section = sections.find((item) => item.collegeSectionsId === sectionId);
      if (section) selectSection(section);
    }
  }, [sectionId, sections, selectSection, selectedSection]);

  useEffect(() => {
    if (subjectId && subjects.length && !selectedSubject) {
      const subject = subjects.find((item) => item.collegeSubjectId === subjectId);
      if (subject) selectSubject(subject);
    }
  }, [selectSubject, selectedSubject, subjectId, subjects]);

  useEffect(() => {
    if (adminLoading || filtersLoading) return;

    if (
      !rollNo ||
      !collegeId ||
      !collegeEducationId ||
      !activeBranchIds.length ||
      !activeYearIds.length ||
      !activeSemesterIds.length ||
      !activeSectionIds.length ||
      !activeSubjectIds.length
    ) {
      setDetails(null);
      setDetailsLoading(false);
      return;
    }

    let mounted = true;

    const loadDetails = async () => {
      setDetailsLoading(true);

      try {
        const data = await getAdminStudentProgressDetails({
          rollNo,
          collegeId,
          collegeEducationId,
          collegeBranchIds: activeBranchIds,
          academicYearIds: activeYearIds,
          semesterIds: activeSemesterIds,
          sectionIds: activeSectionIds,
          subjectIds: activeSubjectIds,
          departmentLabel: selectedBranch?.collegeBranchCode ?? branchLabel ?? "ALL",
        });

        if (mounted) {
          setDetails(data);
        }
      } catch (error) {
        console.error("Failed to load admin student progress details", error);
        if (mounted) {
          setDetails(null);
        }
      } finally {
        if (mounted) {
          setDetailsLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [
    adminLoading,
    filtersLoading,
    rollNo,
    collegeId,
    collegeEducationId,
    activeBranchIds,
    activeYearIds,
    activeSemesterIds,
    activeSectionIds,
    activeSubjectIds,
    selectedBranch,
    branchLabel,
  ]);

  if (detailsLoading || adminLoading || filtersLoading) {
    return <StudentProgressDetailsSkeleton />;
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-6 font-sans">
        <div className="py-20 text-center text-sm text-[#6B7280]">
          No student progress data found for this scope.
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F5F7FA] p-6 font-sans">
      <section className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F3F4F6] text-[#282828] transition-colors hover:bg-[#E5E7EB]"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <span className="text-sm font-medium text-gray-600">
              Department:{" "}
            </span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.departmentLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Year:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.yearLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Section:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.sectionLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Semester:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.semesterLabel}
            </span>
          </div>
        </div>

        <article className="flex justify-end">
          <CourseScheduleCard style="w-[320px]" isVisibile={false} />
        </article>
      </section>
      <div className="mx-auto max-w-[1400px]">
        {activeChatParent ? (
          <div className="flex h-[calc(100vh-3rem)] flex-col items-start gap-6 lg:flex-row">
            <div className="scrollbar-hide flex h-full w-full flex-col gap-6 overflow-y-auto pb-2 pr-2 lg:w-[60%]">
              <StudentProfileCard {...details.studentProfile} />
              <AcademicPerformance data={details.academicPerformance} />
              <AssignmentsTable
                assignments={details.assignments}
                quizzes={details.quizzes}
                discussions={details.discussions}
                weightages={details.taskWeightages}
                insights={details.taskInsights}
              />
            </div>

            <div className="sticky top-0 h-full w-full rounded-[30px] bg-white lg:w-[40%]">
              <ChatWindow
                parent={activeChatParent}
                onClose={() => setActiveChatParent(null)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
              <div className="h-full lg:col-span-3">
                <StudentProfileCard {...details.studentProfile} />
              </div>
              <div className="h-full lg:col-span-2">
                <ParentsList
                  parents={details.parents}
                  onChatOpen={(parent) => setActiveChatParent(parent)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
              <div className="h-full lg:col-span-3">
                <AcademicPerformance data={details.academicPerformance} />
              </div>
              <div className="h-full lg:col-span-2">
                <AttendanceSummaryCard percentage={details.attendancePercentage} />
              </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
              <div className="h-full lg:col-span-3">
                <AssignmentsTable
                  assignments={details.assignments}
                  quizzes={details.quizzes}
                  discussions={details.discussions}
                  weightages={details.taskWeightages}
                  insights={details.taskInsights}
                />
              </div>
              <div className="h-full lg:col-span-2">
                <GradesTable />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
