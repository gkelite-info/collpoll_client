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
import { FaChevronDown } from "react-icons/fa6";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import toast from "react-hot-toast";
const cardData: CardProps[] = [
  {
    value: "0",
    label: "Total Students",
    bgColor: "bg-[#FFEDDA]",
    icon: <UsersThree />,
    iconBgColor: "bg-[#FFBB70]",
    iconColor: "text-[#EFEFEF]",
  },
  {
    value: "0",
    label: "Present Today",
    bgColor: "bg-[#E6FBEA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#43C17A]",
    iconColor: "text-[#EFEFEF]",
  },
  {
    value: "0",
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
    faculty_edu_type,
    sections,
    collegeAcademicYears,
  } = useFaculty();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isSchool = useMemo(
    () =>
      faculty_edu_type
        ?.split(",")
        .some((educationType) => isSchoolEducation(educationType)) ?? false,
    [faculty_edu_type],
  );
  
  const isInter = useMemo(
    () =>
      faculty_edu_type
        ?.toUpperCase()
        .includes("INTER") ?? false,
    [faculty_edu_type],
  );

  const effectiveCollegeBranchId = isSchool ? 0 : collegeBranchId;

  const registeredSubjects = useMemo(() => {
    const subjectRows = sections.filter(
      (section) =>
        !selectedYearId || section.collegeAcademicYearId === selectedYearId,
    );

    return Array.from(
      new Map(
        subjectRows
          .filter((section) => section.faculty_subject)
          .map((section) => [
            section.collegeSubjectId,
            {
              subjectId: section.collegeSubjectId,
              subjectName: section.faculty_subject!.subjectName,
            },
          ]),
      ).values(),
    );
  }, [sections, selectedYearId]);

  const registeredSections = useMemo(
    () =>
      Array.from(
        new Map(
          sections
            .filter(
              (section) =>
                (!selectedYearId ||
                  section.collegeAcademicYearId === selectedYearId) &&
                (!selectedSubjectId ||
                  section.collegeSubjectId === selectedSubjectId),
            )
            .map((section) => [section.collegeSectionsId, section]),
        ).values(),
      ),
    [sections, selectedYearId, selectedSubjectId],
  );

  const schoolScopeRows = useMemo(
    () =>
      sections.filter(
        (section) =>
          (!selectedYearId ||
            section.collegeAcademicYearId === selectedYearId) &&
          (!selectedSubjectId ||
            section.collegeSubjectId === selectedSubjectId) &&
          (!selectedSectionId ||
            section.collegeSectionsId === selectedSectionId),
      ),
    [sections, selectedYearId, selectedSubjectId, selectedSectionId],
  );

  const scopedAcademicYearIds = useMemo(
    () =>
      isSchool
        ? Array.from(
            new Set(schoolScopeRows.map((row) => row.collegeAcademicYearId)),
          )
        : selectedYearId
          ? [selectedYearId]
          : academicYearIds,
    [isSchool, schoolScopeRows, selectedYearId, academicYearIds],
  );
  const scopedSubjectIds = useMemo(
    () =>
      isSchool
        ? Array.from(new Set(schoolScopeRows.map((row) => row.collegeSubjectId)))
        : subjectIds,
    [isSchool, schoolScopeRows, subjectIds],
  );
  const scopedSectionIds = useMemo(
    () =>
      isSchool
        ? Array.from(new Set(schoolScopeRows.map((row) => row.collegeSectionsId)))
        : selectedSectionId
          ? [selectedSectionId]
          : sectionIds,
    [isSchool, schoolScopeRows, selectedSectionId, sectionIds],
  );
  const scopedSubjectLabel = isSchool
    ? registeredSubjects
        .filter(
          (subject) =>
            !selectedSubjectId || subject.subjectId === selectedSubjectId,
        )
        .map((subject) => subject.subjectName)
        .join(", ") || "N/A"
    : faculty_subject.map((subject) => subject.subjectName).join(", ") || "N/A";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: summaryData, isLoading: summaryLoading, isFetching } = useQuery({
    queryKey: [
      "facultyStudentProgressSummary",
      collegeId,
      facultyId,
      collegeEducationId,
      effectiveCollegeBranchId,
      college_branch,
      currentPage,
      rowsPerPage,
      debouncedSearchQuery,
      scopedAcademicYearIds,
      scopedSectionIds,
      scopedSubjectIds,
      scopedSubjectLabel,
      isSchool,
    ],
    queryFn: async () => {
      if (
        !collegeId ||
        !facultyId ||
        !collegeEducationId ||
        effectiveCollegeBranchId === undefined
      ) {
        return defaultSummary;
      }

      try {
        return await getFacultyStudentProgressSummary({
          facultyId,
          collegeId,
          collegeEducationId,
          collegeBranchId: effectiveCollegeBranchId ?? 0,
          isSchool,
          academicYearIds: scopedAcademicYearIds,
          sectionIds: scopedSectionIds,
          subjectIds: scopedSubjectIds,
          departmentLabel: college_branch,
          subjectLabel: scopedSubjectLabel,
          page: currentPage,
          pageSize: rowsPerPage,
          searchQuery: debouncedSearchQuery,
        });
      } catch (error) {
        console.error("Failed to fetch student progress summary:", error);
        toast.error("Unable to load student progress. Please try again later.");
        throw error;
      }
    },
    enabled: !facultyLoading && !!facultyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const summary = summaryData ?? defaultSummary;
  const hasLoadedOnce = summaryData !== undefined;

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
          {!isSchool && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
                {isInter ? "Group" : "Branch"}
              </span>
              <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0">
                {summary.departmentLabel}
              </span>
            </div>
          )}

          <div className={`flex items-center gap-1.5 ${isSchool ? "order-2" : ""}`}>
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Subject :
            </span>
            {isSchool ? (
              <div className="w-[120px]">
                <CustomDropdown
                  value={selectedSubjectId ?? ""}
                  options={registeredSubjects.map((subject) => ({
                    value: subject.subjectId,
                    label: subject.subjectName,
                  }))}
                  onChange={(val) => {
                    const newVal = val ? Number(val) : null;
                    setSelectedSubjectId(newVal);
                    setSelectedSectionId(null);
                    setCurrentPage(1);
                    if (newVal) {
                      setIsSectionDropdownOpen(true);
                    }
                  }}
                  includeAll
                  placeholder="All"
                  theme="always-green"
                  className="!py-1 !pl-3 !pr-7 !rounded-full !font-bold"
                />
              </div>
            ) : (
              <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0">
                {summary.subjectLabel}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-1.5 ${isSchool ? "order-1" : ""}`}>
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Year :
            </span>
            <div className="w-[120px]">
              <CustomDropdown
                value={selectedYearId ?? ""}
                options={collegeAcademicYears?.map((y) => ({
                  value: y.collegeAcademicYearId,
                  label: y.collegeAcademicYear,
                })) || []}
                onChange={(val) => {
                  setSelectedYearId(val ? Number(val) : null);
                  setSelectedSubjectId(null);
                  setSelectedSectionId(null);
                  setCurrentPage(1);
                }}
                includeAll
                placeholder="All"
                theme="always-green"
                className="!py-1 !pl-3 !pr-7 !rounded-full !font-bold"
              />
            </div>
          </div>

          <div className={`flex items-center gap-1.5 ${isSchool ? "order-3" : ""}`}>
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Sec :
            </span>
            <div className="w-[100px]">
              <CustomDropdown
                value={selectedSectionId ?? ""}
                options={(isSchool
                  ? registeredSections
                  : Array.from(new Map(
                      sections
                        ?.filter((s) => selectedYearId ? s.collegeAcademicYearId === selectedYearId : true)
                        .map((s) => [s.collegeSectionsId, s] as const)
                    ).values())
                ).map((s) => ({
                  value: s.collegeSectionsId,
                  label: s.college_sections?.collegeSections || "",
                }))}
                onChange={(val) => {
                  setSelectedSectionId(val ? Number(val) : null);
                  setIsSectionDropdownOpen(false);
                  setCurrentPage(1);
                }}
                disabled={isSchool ? !selectedSubjectId : false}
                isOpenProp={isSectionDropdownOpen}
                onOpenChange={setIsSectionDropdownOpen}
                includeAll
                placeholder="All"
                theme="always-green"
                className="!py-1 !pl-3 !pr-7 !rounded-full !font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <article className="mb-4 grid items-start gap-3 lg:gap-4 lg:grid-cols-[67%_32%]">
        <div className="grid grid-cols-3 gap-2 lg:gap-3 w-full">
          {cardData.map((item, index) => (
            <CardComponent
              key={index}
              value={
                index === 0
                  ? String(summary.totalStudents)
                  : index === 1
                    ? String(summary.presentToday)
                    : String(summary.lowAttendance)
              }
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
          totalRecords={summary.tableTotalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(items) => {
            setRowsPerPage(items);
            setCurrentPage(1);
          }}
          isLoading={isFetching}
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
