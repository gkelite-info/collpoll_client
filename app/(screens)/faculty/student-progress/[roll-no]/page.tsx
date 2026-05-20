"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyStudentProgressDetails } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressDetails";
import GradesTable from "./components/gradesTable";
import AssignmentsTable from "@/app/(screens)/admin/student-progress/[roll-no]/components/assignmentsTable";

import ParentsList, { Parent } from "./components/parentsList";
import StudentProfileCard from "./components/stuProfileCard";
import ChatWindow from "./components/chatWindow";
import AttendanceSummaryCard from "./components/attendanceSummaryCard";
import AcademicPerformance from "@/app/(screens)/admin/student-progress/[roll-no]/components/academicPerformanceChart";
import { StudentProgressDetailsSkeleton } from "../shimmer/StudentProgressSkeleton";

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
  taskWeightages: {
    assignments: 0,
    quizzes: 0,
    discussions: 0,
  },
  taskInsights: {
    assignments: {
      obtained: 0,
      total: 0,
      weightedScore: 0,
    },
    quizzes: {
      obtained: 0,
      total: 0,
      weightedScore: 0,
    },
    discussions: {
      obtained: 0,
      total: 0,
      weightedScore: 0,
    },
  },
  assignments: [],
  quizzes: [],
  discussions: [],
  grades: [],
};

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
    <div className="relative min-h-screen bg-[#F5F7FA] p-3 md:p-6 font-sans">
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

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-gray-600 text-xs md:text-sm font-medium">
              Department:
            </span>
            <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
              {details.departmentLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-gray-600 text-xs md:text-sm font-medium">
              Year:
            </span>
            <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
              {details.yearLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-gray-600 text-xs md:text-sm font-medium">
              Sec:
            </span>
            <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
              {details.sectionLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-gray-600 text-xs md:text-sm font-medium">
              Sem:
            </span>
            <span className="rounded-full bg-[#43C17A1C] px-3 py-1 md:px-4 md:py-0.5 text-[10px] md:text-sm font-bold md:font-semibold tracking-wide text-[#43C17A]">
              {details.semesterLabel}
            </span>
          </div>
        </div>

        <article className="hidden lg:flex justify-end">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="mx-auto max-w-[1400px]">
        {activeChatParent ? (
          <div className="flex min-h-[calc(100vh-3rem)] lg:h-[calc(100vh-3rem)] flex-col items-start gap-4 md:gap-6 lg:flex-row">
            <div className="flex h-full w-full flex-col gap-4 md:gap-6 lg:overflow-y-auto lg:pb-2 lg:pr-2 scrollbar-hide lg:w-[60%]">
              <StudentProfileCard
                {...profile}
                attendancePercentage={attendancePercentage}
                absentPercentage={absentPercentage}
                leavePercentage={leavePercentage}
              />
              <AcademicPerformance data={details.academicPerformance} />
              <AssignmentsTable
                assignments={details.assignments}
                quizzes={details.quizzes}
                discussions={details.discussions}
                weightages={details.taskWeightages}
                insights={details.taskInsights}
              />
            </div>

            <div className="w-full rounded-[24px] md:rounded-[30px] bg-white lg:sticky lg:top-0 lg:h-full lg:w-[40%] min-h-[500px]">
              <ChatWindow
                parent={activeChatParent}
                onClose={() => setActiveChatParent(null)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
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

            <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
              <div className="h-full lg:col-span-3">
                <AcademicPerformance data={details.academicPerformance} />
              </div>
              <div className="h-full lg:col-span-2">
                <AttendanceSummaryCard percentage={attendancePercentage} />
              </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
              <div className="h-full lg:col-span-3 min-w-0">
                <AssignmentsTable
                  assignments={details.assignments}
                  quizzes={details.quizzes}
                  discussions={details.discussions}
                  weightages={details.taskWeightages}
                  insights={details.taskInsights}
                />
              </div>
              <div className="h-full lg:col-span-2 min-w-0">
                <GradesTable grades={details.grades} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
