"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import PerformanceTrendChart from "./performanceTrendChart";
import { StudentDataTable } from "./studentDataTable";
import TopFivePerformers from "./topFivePerformers";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import CardComponent, { CardProps } from "./stuPerfCards";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyStudentProgressSummary } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";
import { StudentProgressPageSkeleton } from "../shimmer/StudentProgressSkeleton";
import { FaChevronDown } from "react-icons/fa6";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

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
    faculty_edu_type,
    sections,
    collegeAcademicYears,
  } = useFaculty();
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] =
    useState<StudentProgressSummary>(defaultSummary);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const lastSummaryRequestKeyRef = useRef("");
  const summaryRequestSequenceRef = useRef(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isSchool = useMemo(
    () =>
      faculty_edu_type
        ?.split(",")
        .some((educationType) => isSchoolEducation(educationType)) ?? false,
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
  const summaryRequestKey = JSON.stringify([
    facultyLoading,
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
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (facultyLoading) return;
    if (lastSummaryRequestKeyRef.current === summaryRequestKey) return;

    lastSummaryRequestKeyRef.current = summaryRequestKey;
    const requestSequence = ++summaryRequestSequenceRef.current;

    const loadSummary = async () => {
      if (
        !collegeId ||
        !facultyId ||
        !collegeEducationId ||
        effectiveCollegeBranchId === undefined
      ) {
        setSummary(defaultSummary);
        setSummaryLoading(false);
        return;
      }

      setSummaryLoading(true);

      try {
        const data = await getFacultyStudentProgressSummary({
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

        if (requestSequence === summaryRequestSequenceRef.current) {
          setSummary(data);
          setHasLoadedOnce(true);
        }
      } catch (error) {
        console.error("Failed to load faculty student progress summary", error);
        if (requestSequence === summaryRequestSequenceRef.current) {
          setSummary(defaultSummary);
        }
      } finally {
        if (requestSequence === summaryRequestSequenceRef.current) {
          setSummaryLoading(false);
        }
      }
    };

    loadSummary();
  });

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
                {faculty_edu_type === "Inter" ? "Group" : "Branch"}
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
              <div className="relative">
                <select
                  className="bg-[#43C17A1C] text-[#43C17A] pl-3 pr-7 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0 outline-none cursor-pointer appearance-none"
                  value={selectedSubjectId ?? ""}
                  onChange={(e) => {
                    setSelectedSubjectId(
                      e.target.value ? Number(e.target.value) : null,
                    );
                    setSelectedSectionId(null);
                  }}
                >
                  <option value="">All</option>
                  {registeredSubjects.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs text-[#43C17A] pointer-events-none" />
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
            <div className="relative">
              <select
                className="bg-[#43C17A1C] text-[#43C17A] pl-3 pr-7 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0 outline-none cursor-pointer appearance-none"
                value={selectedYearId ?? ""}
                onChange={(e) => {
                  setSelectedYearId(
                    e.target.value ? Number(e.target.value) : null,
                  );
                  setSelectedSubjectId(null);
                  setSelectedSectionId(null);
                }}
              >
                <option value="">All</option>
                {collegeAcademicYears?.map((y) => (
                  <option key={y.collegeAcademicYearId} value={y.collegeAcademicYearId}>
                    {y.collegeAcademicYear}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs text-[#43C17A] pointer-events-none" />
            </div>
          </div>

          <div className={`flex items-center gap-1.5 ${isSchool ? "order-3" : ""}`}>
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Sec :
            </span>
            <div className="relative">
              <select
                className="bg-[#43C17A1C] text-[#43C17A] pl-3 pr-7 py-1 rounded-full font-bold text-[10px] md:text-xs tracking-wide shrink-0 outline-none cursor-pointer appearance-none"
                value={selectedSectionId ?? ""}
                onChange={(e) => setSelectedSectionId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All</option>
                {(isSchool
                  ? registeredSections
                  : Array.from(new Map(
                      sections
                        ?.filter((s) => selectedYearId ? s.collegeAcademicYearId === selectedYearId : true)
                        .map((s) => [s.collegeSectionsId, s] as const)
                    ).values())
                ).map((s) => (
                  <option key={s.collegeSectionsId} value={s.collegeSectionsId}>
                    {s.college_sections?.collegeSections}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs text-[#43C17A] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <article className="mb-4 grid items-start gap-3 lg:gap-4 lg:grid-cols-[68%_32%]">
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
