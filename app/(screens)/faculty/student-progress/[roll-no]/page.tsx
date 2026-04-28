"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyStudentProgressDetails } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressDetails";

import StudentProfileCard from "./components/stuProfileCard";
import AssignmentsTable from "./components/assignmentsTable";
import ParentsList, { Parent } from "./components/parentsList";
import GradesTable from "./components/gradesTable";
import { AttendanceSummaryCard } from "./components/attendanceSummaryCard";
import AcademicPerformance from "./components/academicPerformanceChart";
import ChatWindow from "./components/chatWindow";

type StudentProgressDetails = Awaited<
  ReturnType<typeof getFacultyStudentProgressDetails>
>;

const emptyDetails: NonNullable<StudentProgressDetails> = {
  departmentLabel: "N/A",
  yearLabel: "N/A",
  sectionLabel: "N/A",
  semesterLabel: "N/A",
  studentProfile: {
    name: "Unknown Student",
    department: "N/A",
    studentId: "N/A",
    phone: "N/A",
    email: "N/A",
    address: "Not Available",
    photo: "/maleuser.png",
    attendanceDays: 0,
    absentDays: 0,
    leaveDays: 0,
  },
  parents: [],
  attendancePercentage: 0,
  academicPerformance: [],
  assignments: [],
  grades: [],
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
    <div className="mt-4 flex items-center justify-center gap-10">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-4 w-4 animate-pulse rounded-full bg-[#E8F6E2]" />
          <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
);

const AssignmentsTableSkeleton = () => (
  <div className="rounded-[20px] bg-white p-6 shadow-sm">
    <div className="mb-6 h-7 w-32 animate-pulse rounded bg-gray-200" />
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
            <AssignmentsTableSkeleton />
          </div>
          <div className="h-full lg:col-span-2">
            <GradesTableSkeleton />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function StudentProgressDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rollNo = Array.isArray(params?.["roll-no"])
    ? params["roll-no"][0]
    : params?.["roll-no"];

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
  } = useFaculty();

  const [activeChatParent, setActiveChatParent] = useState<Parent | null>(null);
  const [details, setDetails] =
    useState<NonNullable<StudentProgressDetails>>(emptyDetails);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    if (facultyLoading) return;

    if (
      !rollNo ||
      !collegeId ||
      !collegeEducationId ||
      !collegeBranchId ||
      !facultyId ||
      !academicYearIds.length ||
      !sectionIds.length ||
      !subjectIds.length
    ) {
      setDetails(emptyDetails);
      setDetailsLoading(false);
      return;
    }

    let mounted = true;

    const loadDetails = async () => {
      setDetailsLoading(true);

      try {
        const data = await getFacultyStudentProgressDetails({
          rollNo,
          facultyId,
          collegeId,
          collegeEducationId,
          collegeBranchId,
          academicYearIds,
          sectionIds,
          subjectIds,
          departmentLabel: college_branch,
        });

        if (mounted) {
          setDetails(data ?? emptyDetails);
        }
      } catch (error) {
        console.error("Failed to load faculty student progress details", error);
        if (mounted) {
          setDetails(emptyDetails);
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
    facultyLoading,
    rollNo,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    facultyId,
    academicYearIds,
    sectionIds,
    subjectIds,
    college_branch,
  ]);

  if (detailsLoading) {
    return <StudentProgressDetailsSkeleton />;
  }

  const profile = details.studentProfile;
  const totalAttendanceRecords =
    profile.attendanceDays + profile.absentDays + profile.leaveDays;
  const attendancePercentage =
    totalAttendanceRecords > 0
      ? Math.round((profile.attendanceDays / totalAttendanceRecords) * 100)
      : 0;
  const absentPercentage =
    totalAttendanceRecords > 0
      ? Math.round((profile.absentDays / totalAttendanceRecords) * 100)
      : 0;
  const leavePercentage =
    totalAttendanceRecords > 0
      ? Math.round((profile.leaveDays / totalAttendanceRecords) * 100)
      : 0;

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
            <span className="text-gray-600 text-sm font-medium">
              Department:{" "}
            </span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.departmentLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Year:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.yearLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Section:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.sectionLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Semester:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {details.semesterLabel}
            </span>
          </div>
        </div>

        <article className="flex justify-end">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="mx-auto max-w-[1400px]">
        {activeChatParent ? (
          <div className="flex h-[calc(100vh-3rem)] flex-col items-start gap-6 lg:flex-row">
            <div className="flex h-full w-full flex-col gap-6 overflow-y-auto pb-2 pr-2 scrollbar-hide lg:w-[60%]">
              <StudentProfileCard
                {...profile}
                attendancePercentage={attendancePercentage}
                absentPercentage={absentPercentage}
                leavePercentage={leavePercentage}
              />
              <AcademicPerformance />
              <AssignmentsTable assignments={details.assignments} />
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
                <StudentProfileCard
                  {...profile}
                  attendancePercentage={attendancePercentage}
                  absentPercentage={absentPercentage}
                  leavePercentage={leavePercentage}
                />
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
                <AcademicPerformance />
              </div>
              <div className="h-full lg:col-span-2">
                <AttendanceSummaryCard percentage={attendancePercentage} />
              </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
              <div className="h-full lg:col-span-3">
                <AssignmentsTable assignments={details.assignments} />
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
