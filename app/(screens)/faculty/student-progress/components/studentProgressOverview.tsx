"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import PerformanceTrendChart from "./performanceTrendChart";
import { StudentDataTable } from "./studentDataTable";
import TopFivePerformers from "./topFivePerformers";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import CardComponent, { CardProps } from "./stuPerfCards";
import { useEffect, useMemo, useState } from "react";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyStudentProgressSummary } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";
import { StudentProgressPageSkeleton } from "../shimmer/StudentProgressSkeleton";

const cardData: CardProps[] = [
  {
    value: "35",
    label: "Total Students",
    bgColor: "bg-[#FFEDDA]",
    icon: <UsersThree />,
    iconBgColor: "bg-[#FFBB70]",
    iconColor: "text-[#EFEFEF]",
  },
  {
    value: "30",
    label: "Present Today",
    bgColor: "bg-[#E6FBEA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#43C17A]",
    iconColor: "text-[#EFEFEF]",
  },
  {
    value: "5",
    label: "Low Attendance",
    bgColor: "bg-[#FFE0E0]",
    icon: <ChartLineDown />,
    iconBgColor: "bg-[#FF2020]",
    iconColor: "text-[#EFEFEF]",
  },
];

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

export default function StudentProgressOverview() {
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
  const [summary, setSummary] =
    useState<StudentProgressSummary>(defaultSummary);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
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

    if (!collegeId || !facultyId || !collegeEducationId || !collegeBranchId) {
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
            faculty_subject.map((subject) => subject.subjectName).join(", ") ||
            "N/A",
          page: currentPage,
          pageSize: rowsPerPage,
          searchQuery: debouncedSearchQuery,
        });

        if (mounted) {
          setSummary(data);
          setHasLoadedOnce(true);
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

  const subtitleParts = [summary.yearLabel, summary.sectionLabel]
    .filter((value) => value && value !== "N/A")
    .join(" • ");
  const subtitle = subtitleParts
    ? `Monitor and compare overall student performance for ${subtitleParts}`
    : "Monitor and compare overall student performance";

  const topPerformers = useMemo(
    () =>
      [...summary.topPerformerRows]
        .filter((student) => student.progressPercent > 0)
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

  const shouldShowSkeleton =
    (facultyLoading && !hasLoadedOnce) ||
    (summaryLoading &&
      !hasLoadedOnce &&
      summary.totalStudents === 0 &&
      summary.tableTotalCount === 0 &&
      summary.studentRows.length === 0 &&
      summary.topPerformerRows.length === 0);

  if (shouldShowSkeleton) {
    return <StudentProgressPageSkeleton />;
  }

  return (
    <div className="w-full">
      <section className="flex justify-between items-start md:items-center mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-black text-lg md:text-xl font-bold md:font-semibold truncate">
            Student Progress Overview
          </h1>
          <p className="text-gray-700 text-xs md:text-sm mt-0.5 md:mt-1 truncate">
            {subtitle}
          </p>
        </div>

        <article className="hidden lg:flex justify-end w-[32%] shrink-0">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="w-full max-w-5xl mb-4 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex gap-3 md:gap-4 w-max items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Department :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0">
              {summary.departmentLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Subject :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0">
              {summary.subjectLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Year :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0">
              {summary.yearLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Sec :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0">
              {summary.sectionLabel}
            </span>
          </div>
        </div>
      </div>

      <article className="mb-4 grid items-start gap-3 lg:gap-4 lg:grid-cols-[68%_32%]">
        <div className="grid grid-cols-3 gap-2 lg:gap-3 w-full">
          {cardData.map((item, index) => (
            <CardComponent
              key={index}
              value={item.value}
              label={item.label}
              icon={item.icon}
              bgColor={item.bgColor}
              iconBgColor={item.iconBgColor}
              iconColor={item.iconColor}
            />
          ))}
        </div>
        <div className="hidden lg:block -mt-5">
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
        <div className="mt-4 md:mt-5 grid gap-4 pb-4 lg:grid-cols-[360px_minmax(0,1fr)] items-stretch">
          <div className="w-full h-full flex flex-col min-h-[300px]">
            <TopFivePerformers performers={topPerformers} />
          </div>

          <div className="w-full h-full flex flex-col min-h-[300px] min-w-0">
            <PerformanceTrendChart data={summary.trendData} />
          </div>
        </div>
      </section>
    </div>
  );
}
