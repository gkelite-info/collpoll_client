"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import PerformanceTrendChart from "./components/performanceTrendChart";
import { StudentDataTable } from "./components/studentDataTable";
import TopFivePerformers from "./components/topFivePerformers";
import CardComponent from "@/app/utils/card";
import { useEffect, useMemo, useState } from "react";
import { ValueShimmer } from "@/app/components/shimmers/valueShimmer";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { getAdminStudentProgressSummary } from "@/lib/helpers/admin/studentProgress/getAdminStudentProgressSummary";
import { useStudentProgressFilters } from "@/lib/helpers/admin/studentProgress/useStudentProgressFilters";
import { FilterDropdown } from "../academics/components/filterDropdown";

type StudentProgressSummary = Awaited<
  ReturnType<typeof getAdminStudentProgressSummary>
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

const StudentPerformancePageSkeleton = () => (
  <main className="relative overflow-hidden p-4">
    <section className="mb-4 flex items-center justify-between">
      <div>
        <div className="mb-3 h-8 w-52 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
      </div>

      <article className="flex w-[32%] justify-end">
        <div className="h-[88px] w-[320px] animate-pulse rounded-[24px] bg-white shadow-sm" />
      </article>
    </section>

    <div className="mb-5 w-full max-w-5xl rounded-xl">
      <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex min-w-30 flex-col gap-2">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-[180px] animate-pulse rounded-md bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-20 animate-pulse rounded-full bg-[#E8F6E2]" />
          </div>
        ))}
      </div>
    </div>

    <article className="mb-4 grid items-center justify-center gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[170px] w-full animate-pulse rounded-[20px] bg-white shadow-sm"
        />
      ))}
    </article>

    <section>
      <div className="overflow-hidden rounded-[20px] bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-6">
          <div className="h-16 w-16 animate-pulse rounded-full bg-[#43C17A1C]" />
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-5 flex-1 animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>

        <div className="px-6 py-4">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[90px_1.2fr_1.4fr_1fr_1.1fr_0.8fr_1fr_0.9fr_0.7fr] items-center gap-4 border-b border-gray-50 py-4 last:border-0"
            >
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-5 animate-pulse rounded bg-gray-100"
                />
              ))}
              <div className="ml-auto h-5 w-12 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 pb-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[20px] bg-white p-6 shadow-sm">
          <div className="mb-6 h-8 w-44 animate-pulse rounded bg-gray-200" />
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />
                <div className="h-5 flex-1 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-12 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-sm">
          <div className="mb-6 h-8 w-52 animate-pulse rounded bg-gray-200" />
          <div className="flex h-[300px] items-end justify-between gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className="w-full animate-pulse rounded-[18px] bg-[#E8F6E2]"
                  style={{ height: `${160 + ((index % 4) + 1) * 18}px` }}
                />
                <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default function Page() {
  const {
    loading: adminLoading,
    collegeId,
    collegeEducationId,
    collegeEducationType,
  } = useAdmin();
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<StudentProgressSummary>(defaultSummary);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  const isYearEnabled = !!selectedBranch;
  const isSemesterEnabled = !!selectedYear;
  const isSectionEnabled = !!selectedSemester;
  const isSubjectEnabled = !!selectedSection;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedBranch,
    selectedYear,
    selectedSemester,
    selectedSection,
    selectedSubject,
  ]);

  useEffect(() => {
    if (adminLoading || filtersLoading) return;

    if (
      !collegeId ||
      !collegeEducationId ||
      !activeBranchIds.length ||
      !activeYearIds.length ||
      !activeSemesterIds.length ||
      !activeSectionIds.length ||
      !activeSubjectIds.length
    ) {
      setSummary(defaultSummary);
      setSummaryLoading(false);
      return;
    }

    let mounted = true;

    const loadSummary = async () => {
      setSummaryLoading(true);

      try {
        const data = await getAdminStudentProgressSummary({
          collegeId,
          collegeEducationId,
          collegeBranchIds: activeBranchIds,
          academicYearIds: activeYearIds,
          semesterIds: activeSemesterIds,
          sectionIds: activeSectionIds,
          subjectIds: activeSubjectIds,
          departmentLabel: selectedBranch?.collegeBranchCode ?? "ALL",
          subjectLabel: selectedSubject?.subjectName ?? "ALL",
          page: currentPage,
          pageSize: rowsPerPage,
          searchQuery: debouncedSearchQuery,
        });

        if (mounted) {
          setSummary(data);
          setHasLoadedOnce(true);
        }
      } catch (error) {
        console.error("Failed to load admin student progress summary", error);
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
    adminLoading,
    filtersLoading,
    collegeId,
    collegeEducationId,
    activeBranchIds,
    activeYearIds,
    activeSemesterIds,
    activeSectionIds,
    activeSubjectIds,
    selectedBranch,
    selectedSubject,
    currentPage,
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
    .filter((value) => value && value !== "N/A" && value !== "ALL")
    .join(" • ");
  const subtitle = subtitleParts
    ? `Your class students overview for ${subtitleParts}`
    : "Your class students overview";

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

  const detailQuery = new URLSearchParams(
    Object.entries({
      branchId: selectedBranch?.collegeBranchId?.toString() ?? "",
      branch: selectedBranch?.collegeBranchCode ?? "ALL",
      yearId: selectedYear?.collegeAcademicYearId?.toString() ?? "",
      year: selectedYear?.collegeAcademicYear ?? "ALL",
      semesterId: selectedSemester?.collegeSemesterId?.toString() ?? "",
      semester: selectedSemester?.collegeSemester?.toString() ?? "ALL",
      sectionId: selectedSection?.collegeSectionsId?.toString() ?? "",
      section: selectedSection?.collegeSections ?? "ALL",
      subjectId: selectedSubject?.collegeSubjectId?.toString() ?? "",
      subject: selectedSubject?.subjectName ?? "ALL",
    }).filter(([, value]) => value !== ""),
  ).toString();

  const shouldShowSkeleton =
    adminLoading ||
    (!hasLoadedOnce && filtersLoading) ||
    (summaryLoading &&
      !hasLoadedOnce &&
      summary.totalStudents === 0 &&
      summary.tableTotalCount === 0 &&
      summary.studentRows.length === 0 &&
      summary.topPerformerRows.length === 0);

  if (shouldShowSkeleton) {
    return <StudentPerformancePageSkeleton />;
  }

  return (
    <main className="relative overflow-hidden p-4">
      <section className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex">
            <h1 className="text-xl font-semibold text-black">
              Student Performance
            </h1>
          </div>
          <p className="text-sm text-black">{subtitle}</p>
        </div>

        <article className="flex w-[32%] justify-end">
          <CourseScheduleCard style="w-[320px]" isVisibile={false} />
        </article>
      </section>

      <div className="mb-5 w-full max-w-5xl rounded-xl">
        <div className="mb-4 grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm md:grid-cols-2 xl:grid-cols-6">
          <div className="flex min-w-0 flex-col gap-1 overflow-visible">
            <label className="px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Education
            </label>
            <div className="relative w-full rounded-md border border-gray-300 bg-gray-100">
              <input
                type="text"
                value={collegeEducationType ?? ""}
                disabled
                className="h-[20px] w-full cursor-not-allowed bg-transparent pl-2 pr-8 text-[13px] font-medium text-gray-500 outline-none"
              />
            </div>
          </div>

          <FilterDropdown
            label="Department"
            value={selectedBranch?.collegeBranchId?.toString() ?? "All"}
            placeholder="All"
            options={["All", ...branches.map((branch) => String(branch.collegeBranchId))]}
            onChange={(value) => {
              if (value === "All") {
                selectBranch(null);
                return;
              }

              const branch = branches.find(
                (item) => item.collegeBranchId === Number(value),
              );
              selectBranch(branch ?? null);
            }}
            widthClassName="w-full"
            displayModifier={(value) =>
              value === "All"
                ? "All"
                : branches.find((branch) => String(branch.collegeBranchId) === value)
                  ?.collegeBranchCode ?? value
            }
          />

          <FilterDropdown
            label="Year"
            value={selectedYear?.collegeAcademicYearId?.toString() ?? "All"}
            placeholder="All"
            disabled={!isYearEnabled}
            options={["All", ...years.map((year) => String(year.collegeAcademicYearId))]}
            onChange={(value) => {
              if (value === "All") {
                selectYear(null);
                return;
              }

              const year = years.find(
                (item) => item.collegeAcademicYearId === Number(value),
              );
              selectYear(year ?? null);
            }}
            widthClassName="w-full"
            displayModifier={(value) =>
              value === "All"
                ? "All"
                : years.find((year) => String(year.collegeAcademicYearId) === value)
                  ?.collegeAcademicYear ?? value
            }
          />

          <FilterDropdown
            label="Semester"
            value={selectedSemester?.collegeSemesterId?.toString() ?? "All"}
            placeholder="All"
            disabled={!isSemesterEnabled}
            options={[
              "All",
              ...semesters.map((semester) => String(semester.collegeSemesterId)),
            ]}
            onChange={(value) => {
              if (value === "All") {
                selectSemester(null);
                return;
              }

              const semester = semesters.find(
                (item) => item.collegeSemesterId === Number(value),
              );
              selectSemester(semester ?? null);
            }}
            widthClassName="w-full"
            displayModifier={(value) =>
              value === "All"
                ? "All"
                : String(
                  semesters.find(
                    (semester) => String(semester.collegeSemesterId) === value,
                  )?.collegeSemester ?? value,
                )
            }
          />

          <FilterDropdown
            label="Section"
            value={selectedSection?.collegeSectionsId?.toString() ?? "All"}
            placeholder="All"
            disabled={!isSectionEnabled}
            options={[
              "All",
              ...sections.map((section) => String(section.collegeSectionsId)),
            ]}
            onChange={(value) => {
              if (value === "All") {
                selectSection(null);
                return;
              }

              const section = sections.find(
                (item) => item.collegeSectionsId === Number(value),
              );
              selectSection(section ?? null);
            }}
            widthClassName="w-full"
            displayModifier={(value) =>
              value === "All"
                ? "All"
                : sections.find(
                  (section) => String(section.collegeSectionsId) === value,
                )?.collegeSections ?? value
            }
          />

          <FilterDropdown
            label="Subject"
            value={selectedSubject?.collegeSubjectId?.toString() ?? "All"}
            placeholder="All"
            disabled={!isSubjectEnabled}
            options={[
              "All",
              ...subjects.map((subject) => String(subject.collegeSubjectId)),
            ]}
            onChange={(value) => {
              if (value === "All") {
                selectSubject(null);
                return;
              }

              const subject = subjects.find(
                (item) => item.collegeSubjectId === Number(value),
              );
              selectSubject(subject ?? null);
            }}
            widthClassName="w-full"
            displayModifier={(value) =>
              value === "All"
                ? "All"
                : subjects.find((subject) => String(subject.collegeSubjectId) === value)
                  ?.subjectName ?? value
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              Department:{" "}
            </span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {selectedBranch?.collegeBranchCode ?? "ALL"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Subject:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {selectedSubject?.subjectName ?? "ALL"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Year:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {selectedYear?.collegeAcademicYear ?? "ALL"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Section:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {selectedSection?.collegeSections ?? "ALL"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Semester:</span>
            <span className="rounded-full bg-[#43C17A1C] px-4 py-0.5 text-sm font-semibold tracking-wide text-[#43C17A]">
              {selectedSemester?.collegeSemester?.toString() ?? "ALL"}
            </span>
          </div>
        </div>
      </div>

      {/* <article className="mb-4 grid items-start gap-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_320px]">
        {cardData.map((item, index) => (
          <div
            key={index}
            className="flex origin-top-left justify-start scale-[0.9] xl:scale-[0.88]"
          >
            <CardComponent
              value={item.value}
              label={item.label}
              icon={item.icon}
              style={item.style}
              iconBgColor={item.iconBgColor}
              iconColor={item.iconColor}
            />
          </div>
        ))}
        <div className="-mt-5">
          <WorkWeekCalendar />
        </div>
      </article> */}


      <article className="mb-4 grid items-start gap-2 lg:grid-cols-[68%_32%]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {cardData.map((item, index) => (
            <div
              key={index}
              className="flex"
            >
              <CardComponent
                value={item.value}
                label={item.label}
                icon={item.icon}
                style={item.style}
                iconBgColor={item.iconBgColor}
                iconColor={item.iconColor}
              />
            </div>
          ))}
        </div>
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
          detailQuery={detailQuery}
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
