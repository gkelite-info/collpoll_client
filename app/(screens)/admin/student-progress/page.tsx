"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import PerformanceTrendChart from "./components/performanceTrendChart";
import { StudentDataTable } from "./components/studentDataTable";
import TopFivePerformers from "./components/topFivePerformers";
import CardComponent from "@/app/utils/card";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ValueShimmer } from "@/app/components/shimmers/valueShimmer";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import { getAdminStudentProgressSummary } from "@/lib/helpers/admin/studentProgress/getAdminStudentProgressSummary";
import { useStudentProgressFilters } from "@/lib/helpers/admin/studentProgress/useStudentProgressFilters";
import { FilterDropdown } from "../academics/components/filterDropdown";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import ResultDetailsView from "./results/ResultDetailsView";
import ResultPreviewView from "./results/ResultPreviewView";
import ResultsMonitoringView from "./results/ResultsMonitoringView";
import StudentProgressTabs from "./results/StudentProgressTabs";
import {
  getSearchView,
  resultFacultyNames,
  resultFacultyPhotos,
  type ResultCard,
  type StudentProgressView,
} from "./results/types";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeView = getSearchView(searchParams.get("view"));
  const selectedResultId = searchParams.get("resultId");
  const {
    loading: adminLoading,
    collegeId,
    collegeEducationId: defaultEducationId,
    collegeEducationType: defaultEducationType,
  } = useAdmin();

  const [educations, setEducations] = useState<any[]>([]);
  const [education, setEducation] = useState<any>(null);

  const currentEducationId = education?.collegeEducationId ?? defaultEducationId;
  const currentEducationType = education?.collegeEducationType ?? defaultEducationType;
  const isSchool = isSchoolEducation(currentEducationType);

  const selectEducation = (edu: any) => {
    setEducation(edu);
  };

  useEffect(() => {
    if (collegeId) {
      fetchEducations(collegeId).then(setEducations);
    }
  }, [collegeId]);

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
    collegeEducationId: currentEducationId,
  });

  const isYearEnabled = isSchool ? !!currentEducationId : !!selectedBranch;
  const isSemesterEnabled = isSchool ? false : (!!selectedYear && currentEducationType !== "Inter");
  const isSectionEnabled = isSchool
    ? !!selectedYear
    : (currentEducationType === "Inter" ? !!selectedYear : !!selectedSemester);
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
      !currentEducationId ||
      !activeYearIds.length ||
      !activeSectionIds.length
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
          collegeEducationId: currentEducationId,
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
    currentEducationId,
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

  const headerBranchLabel = selectedBranch?.collegeBranchCode ?? (isSchool ? "" : "All Branches");
  const headerYearLabel = selectedYear?.collegeAcademicYear ?? "";
  const headerTitle = isSchool
    ? `Student Progress ${headerYearLabel ? `- ${headerYearLabel}` : ""}`.trim()
    : `Student Progress - ${[headerBranchLabel, headerYearLabel].filter(Boolean).join(" ")}`;

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
      educationType: currentEducationType ?? "",
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

  const resultCards = useMemo<ResultCard[]>(() => {
    const fallbackSubjects = [
      "Applied Physics",
      "Computer Networks",
      "Engineering Chemistry",
      "Electrical Circuits",
      "Engineering Chemistry",
      "Engineering Graphics",
    ];
    const sourceSubjects = [...subjects.map((subject) => subject.subjectName)];
    while (sourceSubjects.length < 6) {
      sourceSubjects.push(fallbackSubjects[sourceSubjects.length]);
    }

    return sourceSubjects.slice(0, 6).map((subject, index) => ({
      id: `${index + 1}-${subject.replace(/\s+/g, "-").toLowerCase()}`,
      subject,
      facultyName: resultFacultyNames[index % resultFacultyNames.length],
      facultyId: `ID - ${["20FA80A8012", "20FA80A8012", "ADS234", "E2099918", "E2099918", "E2099918"][index % 6]}`,
      profileUrl: resultFacultyPhotos[index % resultFacultyPhotos.length],
      totalStudents: Math.max(summary.totalStudents || 0, 115 + (index % 3) * 5),
      passPercentage: index === 2 ? 88.5 : index % 2 === 0 ? 91 : 94.2,
      status: index === 2 ? "Draft Mode" : "Uploaded",
    }));
  }, [subjects, summary.totalStudents]);

  const selectedResult =
    resultCards.find((result) => result.id === selectedResultId) ?? resultCards[0];

  const updateView = (view: StudentProgressView, resultId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "progress") {
      params.delete("view");
      params.delete("resultId");
    } else {
      params.set("view", view);
      if (resultId) {
        params.set("resultId", resultId);
      } else {
        params.delete("resultId");
      }
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const shouldShowSkeleton =
    adminLoading ||
    (!hasLoadedOnce && (filtersLoading || summaryLoading));

  if (shouldShowSkeleton) {
    return <StudentPerformancePageSkeleton />;
  }

  if (activeView === "results") {
    return (
      <main className="relative overflow-hidden p-4">
        <StudentProgressTabs activeView={activeView} onChange={updateView} />
        <ResultsMonitoringView
          branchOptions={branches}
          yearOptions={years}
          selectedBranch={selectedBranch}
          selectedYear={selectedYear}
          selectBranch={selectBranch}
          selectYear={selectYear}
          resultCards={resultCards}
          onViewDetails={(resultId) => updateView("result-details", resultId)}
        />
      </main>
    );
  }

  if (activeView === "result-details") {
    return (
      <main className="relative overflow-hidden p-4">
        <StudentProgressTabs activeView={activeView} onChange={updateView} />
        <ResultDetailsView
          result={selectedResult}
          selectedBranch={selectedBranch?.collegeBranchCode ?? "ALL"}
          selectedYear={selectedYear?.collegeAcademicYear ?? "ALL"}
          selectedSection={selectedSection?.collegeSections ?? "ALL"}
          selectedSemester={selectedSemester?.collegeSemester?.toString() ?? "ALL"}
          onBack={() => updateView("results")}
          onViewResult={() => updateView("result-preview", selectedResult.id)}
        />
      </main>
    );
  }

  if (activeView === "result-preview") {
    return (
      <main className="relative overflow-hidden p-4">
        <StudentProgressTabs activeView={activeView} onChange={updateView} />
        <ResultPreviewView
          result={selectedResult}
          onBack={() => updateView("result-details", selectedResult.id)}
        />
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden p-4">
      <section className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex">
            <h1 className="text-xl font-semibold text-black">
              {headerTitle}
            </h1>
          </div>
          <p className="text-sm text-black">
            {isSchool
              ? "Monitor and compare overall student performance."
              : "Monitor and compare overall student performance across all Branches."}
          </p>
        </div>

        <article className="flex w-[32%] justify-end">
          <CourseScheduleCard style="w-[320px]" isVisibile={false} />
        </article>
      </section>

      <div className="mb-5 w-full max-w-5xl rounded-xl">
        <div className="mb-4 grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm md:grid-cols-2 xl:grid-cols-6">
          <FilterDropdown
            label="Education"
            value={currentEducationId?.toString() ?? ""}
            options={educations.map((e) => e.collegeEducationId.toString())}
            displayModifier={(opt) => {
              const edu = educations.find((e) => e.collegeEducationId.toString() === opt);
              return edu ? edu.collegeEducationType : opt;
            }}
            onChange={(val) => {
              const edu = educations.find((e) => e.collegeEducationId === +val);
              if (edu) {
                selectEducation(edu);
                selectBranch(null);
              }
            }}
          />

          {!isSchool && (
            <FilterDropdown
              label={currentEducationType === "Inter" ? "Group" : "Branch"}
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
          )}

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

          {!isSchool && currentEducationType !== "Inter" && (
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
          )}

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

