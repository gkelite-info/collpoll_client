"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import PerformanceTrendChart from "./components/performanceTrendChart";
// import CardComponent, { CardProps } from "./components/stuPerfCards";
import { StudentDataTable } from "./components/studentDataTable";
import TopFivePerformers from "./components/topFivePerformers";
import WipOverlay from "@/app/utils/WipOverlay";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import CardComponent from "@/app/utils/card";
import { useEffect, useMemo, useState } from "react";
import { ValueShimmer } from "@/app/components/shimmers/valueShimmer";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyStudentProgressSummary } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";

// const cardData: CardProps[] = [
//   {
//     value: "35",
//     label: "Total Students",

//     bgColor: "bg-[#FFEDDA]",

//     icon: <UsersThree />,
//     iconBgColor: "bg-[#FFBB70]",

//     iconColor: "text-[#EFEFEF]",
//   },
//   {
//     value: "30",
//     label: "Present Today",

//     bgColor: "bg-[#E6FBEA]",

//     icon: <UserCircle />,
//     iconBgColor: "bg-[#43C17A]",

//     iconColor: "text-[#EFEFEF]",
//   },
//   {
//     value: "5",
//     label: "Low Attendance",

//     bgColor: "bg-[#FFE0E0]",

//     icon: <ChartLineDown />,
//     iconBgColor: "bg-[#FF2020]",

//     iconColor: "text-[#EFEFEF]",
//   },
// ];


type StudentProgressSummary = Awaited<
  ReturnType<typeof getFacultyStudentProgressSummary>
>;

const defaultSummary: StudentProgressSummary = {
  totalStudents: 0,
  tableTotalCount: 0,
  presentToday: 0,
  lowAttendance: 0,
  markedStudents: [],
  studentRows: [],
  topPerformerRows: [],
  trendData: [],
  departmentLabel: "N/A",
  subjectLabel: "N/A",
  yearLabel: "N/A",
  sectionLabel: "N/A",
  semesterLabel: "N/A",
};

const ShimmerBlock = ({
  className = "",
}: {
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-[#EEF2F6] ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

const StudentProgressTableSkeleton = () => (
  <div className="mx-auto w-full max-w-7xl">
    <div className="mb-2 flex items-center justify-between gap-4">
      <ShimmerBlock className="h-7 w-56 rounded-md" />
    </div>

    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl">
      <div className="max-h-[500px] overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center gap-4 bg-[#F1F3F2] px-4 py-4">
          <ShimmerBlock className="h-10 w-10 rounded-full bg-[#DDEFE4]" />
          {Array.from({ length: 8 }).map((_, index) => (
            <ShimmerBlock
              key={index}
              className={`h-4 rounded-md ${index % 2 === 0 ? "w-20" : "w-24"}`}
            />
          ))}
        </div>

        <div className="divide-y divide-gray-100 bg-white">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[48px_1fr_1.2fr_0.9fr_1.1fr_0.8fr_1fr_0.9fr_0.7fr] items-center gap-4 px-4 py-3"
            >
              <ShimmerBlock className="h-8 w-8 rounded-full" />
              <ShimmerBlock className="h-4 w-24 rounded-md" />
              <ShimmerBlock className="h-4 w-28 rounded-md" />
              <ShimmerBlock className="h-4 w-10 rounded-md" />
              <ShimmerBlock className="h-4 w-14 rounded-md" />
              <ShimmerBlock className="h-4 w-12 rounded-md" />
              <ShimmerBlock className="h-4 w-14 rounded-md" />
              <ShimmerBlock className="h-10 w-10 rounded-full" />
              <ShimmerBlock className="h-4 w-10 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TopPerformersSkeleton = () => (
  <div className="rounded-[24px] bg-white p-6 shadow-sm">
    <ShimmerBlock className="mb-6 h-7 w-36 rounded-md" />
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <ShimmerBlock className="h-11 w-11 rounded-full" />
          <div className="min-w-0 flex-1">
            <ShimmerBlock className="mb-2 h-4 w-24 rounded-md" />
            <ShimmerBlock className="h-3 w-14 rounded-md" />
          </div>
          <ShimmerBlock className="h-8 w-12 rounded-full bg-[#DDEFE4]" />
        </div>
      ))}
    </div>
  </div>
);

const TrendChartSkeleton = () => (
  <div className="rounded-[24px] bg-white p-6 shadow-sm">
    <ShimmerBlock className="mb-8 h-8 w-44 rounded-md" />
    <div className="flex h-[360px] items-end gap-4">
      <div className="flex h-full flex-col justify-between pb-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <ShimmerBlock key={index} className="h-4 w-10 rounded-md" />
        ))}
      </div>
      <div className="flex flex-1 items-end justify-between gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-3">
            <div
              className="relative w-full max-w-[54px] overflow-hidden rounded-[24px] bg-[#E8F6E2]"
              style={{ height: `${120 + ((index % 5) + 1) * 30}px` }}
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
            </div>
            <ShimmerBlock className="h-4 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StudentProgressPageSkeleton = () => (
  <main className="relative overflow-hidden p-4">
    <section className="mb-4 flex items-center justify-between">
      <div>
        <ShimmerBlock className="mb-2 h-7 w-48 rounded-md" />
        <ShimmerBlock className="h-4 w-64 rounded-md" />
      </div>

      <article className="flex w-[32%] justify-end">
        <ShimmerBlock className="h-[88px] w-[320px] rounded-[24px] bg-white shadow-sm" />
      </article>
    </section>

    <div className="mb-5 w-full max-w-5xl rounded-xl">
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-16 rounded-md" />
            <ShimmerBlock className="h-7 w-20 rounded-full bg-[#E8F6E2]" />
          </div>
        ))}
      </div>
    </div>

    <article className="mb-4 grid items-center justify-center gap-4 lg:grid-cols-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <ShimmerBlock
          key={index}
          className="h-[170px] w-full rounded-[24px] bg-white shadow-sm"
        />
      ))}
      <ShimmerBlock className="-mt-5 h-[210px] rounded-[24px] bg-white shadow-sm" />
    </article>

    <section>
      <StudentProgressTableSkeleton />
      <div className="mt-5 grid gap-4 pb-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <TopPerformersSkeleton />
        <TrendChartSkeleton />
      </div>
    </section>
  </main>
);

export default function Page() {
  const {
    loading: facultyLoading,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    college_branch,
    academicYearIds,
    sectionIds,
    subjectIds,
    faculty_subject,
    facultyId,
  } = useFaculty();
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<StudentProgressSummary>(defaultSummary);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (facultyLoading) return;

    if (
      !collegeId ||
      !facultyId ||
      !collegeEducationId ||
      !collegeBranchId ||
      !academicYearIds.length ||
      !sectionIds.length ||
      !subjectIds.length
    ) {
      setSummary(defaultSummary);
      setSummaryLoading(false);
      return;
    }

    let mounted = true;

    const loadSummary = async () => {
      setSummaryLoading(true);

      try {
        const data = await getFacultyStudentProgressSummary({
          facultyId,
          collegeId,
          collegeEducationId,
          collegeBranchId,
          academicYearIds,
          sectionIds,
          subjectIds,
          departmentLabel: college_branch,
          subjectLabel:
            faculty_subject.map((subject) => subject.subjectName).join(", ") || "N/A",
          page: currentPage,
          pageSize: rowsPerPage,
          searchQuery: debouncedSearchQuery,
        });

        if (mounted) {
          setSummary(data);
        }
      } catch (error) {
        console.error("Failed to load faculty student progress summary", error);
        if (mounted) {
          setSummary(defaultSummary);
        }
      } finally {
        if (mounted) {
          setSummaryLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      mounted = false;
    };
  }, [
    facultyLoading,
    collegeId,
    facultyId,
    collegeEducationId,
    collegeBranchId,
    academicYearIds,
    sectionIds,
    subjectIds,
    faculty_subject,
    college_branch,
    currentPage,
    rowsPerPage,
    debouncedSearchQuery,
  ]);

  const cardData = [
    {
      value: summaryLoading ? <ValueShimmer /> : String(summary.totalStudents),
      label: "Total Students",
      style: "bg-[#FFEDDA] w-full h-[170px]",
      icon: <UsersThree size={20} weight="fill" />,
      iconBgColor: "#FFBB70",
      iconColor: "#FFFFFF",
    },
    {
      value: summaryLoading ? <ValueShimmer /> : String(summary.presentToday),
      label: "Present Today",
      style: "bg-[#E6FBEA] w-full h-[170px]",
      icon: <UserCircle size={20} weight="fill" />,
      iconBgColor: "#43C17A",
      iconColor: "#FFFFFF",
    },
    {
      value: summaryLoading ? <ValueShimmer /> : String(summary.lowAttendance),
      label: "Low Attendance",
      style: "bg-[#FFE0E0] w-full h-[170px]",
      icon: <ChartLineDown size={20} weight="fill" />,
      iconBgColor: "#FF2020",
      iconColor: "#FFFFFF",
    },
  ];

  const subtitleParts = [summary.yearLabel, summary.sectionLabel]
    .filter((value) => value && value !== "N/A")
    .join(" • ");
  const subtitle = subtitleParts
    ? `Your class students overview for ${subtitleParts}`
    : "Your class students overview";

  const topPerformers = useMemo(
    () =>
      [...summary.topPerformerRows]
        .sort((a, b) => {
          if (b.progressPercent !== a.progressPercent) {
            return b.progressPercent - a.progressPercent;
          }

          return b.attendancePercentage - a.attendancePercentage;
        })
        .slice(0, 5)
        .map((student) => ({
          id: String(student.studentId),
          name: student.studentName,
          avatar: student.profileUrl,
          score: student.progressPercent,
        })),
    [summary.topPerformerRows],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(summary.tableTotalCount / rowsPerPage),
  );

  if (summaryLoading) {
    return <StudentProgressPageSkeleton />;
  }

  return (
    <main className="p-4 relative overflow-hidden">
      {/* <WipOverlay fullHeight={true} /> */}
      <section className="flex justify-between items-center mb-4">
        <div>
          <div className="flex">
            <h1 className="text-black text-xl font-semibold">
              Student Performance
            </h1>
          </div>
          <p className="text-black text-sm">
            {subtitle}
          </p>
        </div>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="w-full max-w-5xl rounded-xl mb-5">
          <div className="flex gap-3">
            <div>
              <span className="text-gray-600 text-sm font-medium">
                Department:{" "}
              </span>
              <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                {summary.departmentLabel}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-600 text-sm font-medium">Subject:</span>
              <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                {summary.subjectLabel}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-600 text-sm font-medium">Year:</span>
              <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                {summary.yearLabel}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-600 text-sm font-medium">Section:</span>
              <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                {summary.sectionLabel}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-600 text-sm font-medium">Semester:</span>
              <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
                {summary.semesterLabel}
              </span>
            </div>
          </div>
      </div>

      <article className="grid lg:grid-cols-4 mb-4 gap-4 justify-center items-center">
        {cardData.map((item, index) => (
          // <CardComponent
          //   key={index}
          //   value={item.value}
          //   label={item.label}
          //   bgColor={item.bgColor}
          //   icon={item.icon}
          //   iconBgColor={item.iconBgColor}
          //   iconColor={item.iconColor}
          // />

          <CardComponent
            key={index}
            value={item.value}
            label={item.label}
            icon={item.icon}
            style={item.style}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
          />
        ))}
        <div className="-mt-5">
          <WorkWeekCalendar />
        </div>
      </article>
      <section>
        <StudentDataTable
          students={summary.studentRows}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={summary.tableTotalCount}
          onPageChange={setCurrentPage}
        />
        <div className="mt-5 grid gap-4 pb-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <TopFivePerformers performers={topPerformers} />
          </div>

          <div className="min-w-0">
            <PerformanceTrendChart data={summary.trendData} />
          </div>
        </div>
      </section>
    </main>
  );
}
