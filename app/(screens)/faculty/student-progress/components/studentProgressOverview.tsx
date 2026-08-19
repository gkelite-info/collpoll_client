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
import { 
  StudentProgressPageSkeleton, 
  TopPerformersSkeleton, 
  TrendChartSkeleton, 
  ShimmerBlock 
} from "../shimmer/StudentProgressSkeleton";
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
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 1. Education Options
  const educationOptions = useMemo(() => {
    const map = new Map<number, string>();
    sections.forEach(s => {
      const eduId = s.collegeEducationId || collegeEducationId;
      const eduType = s.faculty_edu_type?.collegeEducationType || faculty_edu_type;
      if (eduId && eduType) {
        map.set(eduId, eduType);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [sections, collegeEducationId, faculty_edu_type]);

  useEffect(() => {
    if (educationOptions.length > 0 && (!selectedEducationId || !educationOptions.some(e => e.value === selectedEducationId))) {
      setSelectedEducationId(educationOptions[0].value);
      setSelectedBranchId(null);
      setSelectedYearId(null);
      setSelectedSubjectId(null);
      setSelectedSectionId(null);
    }
  }, [educationOptions, selectedEducationId]);

  const selectedEducationType = useMemo(() => {
    return educationOptions.find(e => e.value === selectedEducationId)?.label;
  }, [educationOptions, selectedEducationId]);

  const isSchool = isSchoolEducation(selectedEducationType);
  const isInter = selectedEducationType === "INTER" || selectedEducationType === "INTERMEDIATE";

  // 2. Branch Options
  const branchOptions = useMemo(() => {
    if (!selectedEducationId || isSchool) return [];
    const map = new Map<number, string>();
    sections.filter(s => (s.collegeEducationId || collegeEducationId) === selectedEducationId).forEach(s => {
      const branchId = s.collegeBranchId || collegeBranchId;
      const branchCode = s.college_branch?.collegeBranchCode || college_branch;
      if (branchId && branchCode) {
        map.set(branchId, branchCode);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [sections, selectedEducationId, isSchool, collegeBranchId, college_branch, collegeEducationId]);

  useEffect(() => {
    if (!isSchool && selectedEducationId) {
       if (branchOptions.length > 0 && (!selectedBranchId || !branchOptions.some(b => b.value === selectedBranchId))) {
         setSelectedBranchId(branchOptions[0].value);
         setSelectedYearId(null);
         setSelectedSubjectId(null);
         setSelectedSectionId(null);
       }
    }
  }, [branchOptions, selectedBranchId, isSchool, selectedEducationId]);

  // 3. Year Options
  const yearOptions = useMemo(() => {
    if (!selectedEducationId) return [];
    if (!isSchool && !selectedBranchId) return [];
    
    const map = new Map<number, string>();
    sections.filter(s => 
      (s.collegeEducationId || collegeEducationId) === selectedEducationId && 
      (isSchool || (s.collegeBranchId || collegeBranchId) === selectedBranchId)
    ).forEach(s => {
      if (s.collegeAcademicYearId) {
        const yearObj = collegeAcademicYears?.find(y => y.collegeAcademicYearId === s.collegeAcademicYearId);
        if (yearObj) {
           map.set(s.collegeAcademicYearId, yearObj.collegeAcademicYear);
        }
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [sections, selectedEducationId, selectedBranchId, isSchool, collegeAcademicYears, collegeEducationId, collegeBranchId]);

  useEffect(() => {
    if ((isSchool && selectedEducationId) || (!isSchool && selectedEducationId && selectedBranchId)) {
       if (yearOptions.length > 0 && (!selectedYearId || !yearOptions.some(y => y.value === selectedYearId))) {
         setSelectedYearId(yearOptions[0].value);
         setSelectedSubjectId(null);
         setSelectedSectionId(null);
       }
    }
  }, [yearOptions, selectedYearId, isSchool, selectedEducationId, selectedBranchId]);

  // 4. Subject Options
  const subjectOptions = useMemo(() => {
    if (!selectedYearId) return [];
    const map = new Map<number, string>();
    sections.filter(s => 
      (s.collegeEducationId || collegeEducationId) === selectedEducationId && 
      (isSchool || (s.collegeBranchId || collegeBranchId) === selectedBranchId) &&
      s.collegeAcademicYearId === selectedYearId &&
      s.faculty_subject
    ).forEach(s => {
      map.set(s.collegeSubjectId, s.faculty_subject!.subjectName);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [sections, selectedEducationId, selectedBranchId, selectedYearId, isSchool, collegeEducationId, collegeBranchId]);

  useEffect(() => {
    if (selectedYearId) {
       if (subjectOptions.length > 0 && (!selectedSubjectId || !subjectOptions.some(s => s.value === selectedSubjectId))) {
         setSelectedSubjectId(subjectOptions[0].value);
         setSelectedSectionId(null);
       }
    }
  }, [subjectOptions, selectedSubjectId, selectedYearId]);

  // 5. Section Options
  const sectionOptions = useMemo(() => {
    if (!selectedSubjectId) return [];
    const map = new Map<number, string>();
    sections.filter(s => 
      (s.collegeEducationId || collegeEducationId) === selectedEducationId && 
      (isSchool || (s.collegeBranchId || collegeBranchId) === selectedBranchId) &&
      s.collegeAcademicYearId === selectedYearId &&
      s.collegeSubjectId === selectedSubjectId &&
      s.college_sections
    ).forEach(s => {
      map.set(s.collegeSectionsId, s.college_sections!.collegeSections);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [sections, selectedEducationId, selectedBranchId, selectedYearId, selectedSubjectId, isSchool, collegeEducationId, collegeBranchId]);

  useEffect(() => {
    if (selectedSubjectId) {
       if (sectionOptions.length > 0 && (!selectedSectionId || !sectionOptions.some(s => s.value === selectedSectionId))) {
         setSelectedSectionId(sectionOptions[0].value);
       }
    }
  }, [sectionOptions, selectedSectionId, selectedSubjectId]);

  const effectiveCollegeBranchId = isSchool ? 0 : (selectedBranchId ?? 0);
  
  const scopedAcademicYearIds = useMemo(() => selectedYearId ? [selectedYearId] : academicYearIds, [selectedYearId, academicYearIds]);
  const scopedSubjectIds = useMemo(() => selectedSubjectId ? [selectedSubjectId] : subjectIds, [selectedSubjectId, subjectIds]);
  const scopedSectionIds = useMemo(() => selectedSectionId ? [selectedSectionId] : sectionIds, [selectedSectionId, sectionIds]);
  const scopedSubjectLabel = useMemo(() => {
     return subjectOptions.find(s => s.value === selectedSubjectId)?.label || "N/A";
  }, [subjectOptions, selectedSubjectId]);

  const displayBranchLabel = useMemo(() => {
     return branchOptions.find(b => b.value === selectedBranchId)?.label || college_branch;
  }, [branchOptions, selectedBranchId, college_branch]);

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
      selectedEducationId,
      effectiveCollegeBranchId,
      displayBranchLabel,
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
        !selectedEducationId ||
        (!isSchool && !selectedBranchId) ||
        effectiveCollegeBranchId === undefined
      ) {
        return defaultSummary;
      }

      try {
        return await getFacultyStudentProgressSummary({
          facultyId,
          collegeId,
          collegeEducationId: selectedEducationId,
          collegeBranchId: effectiveCollegeBranchId ?? 0,
          isSchool,
          academicYearIds: scopedAcademicYearIds,
          sectionIds: scopedSectionIds,
          subjectIds: scopedSubjectIds,
          departmentLabel: displayBranchLabel,
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
    ? `Monitor and compare overall student performance based on selected filters.`
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

  const shouldShowSkeleton = facultyLoading || (!hasLoadedOnce && summaryLoading);

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
          <CourseScheduleCard style="w-[320px]" isVisibile={false}/>
        </article>
      </section>

      <div className="w-full max-w-5xl mb-4 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex gap-3 md:gap-4 w-max items-center">
          
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Education :
            </span>
            <div className="w-[120px]">
              <CustomDropdown
                value={selectedEducationId ?? ""}
                options={educationOptions.map((e) => ({
                  value: e.value,
                  label: e.label,
                }))}
                onChange={(val) => {
                  const newVal = val ? Number(val) : null;
                  setSelectedEducationId(newVal);
                  setSelectedBranchId(null);
                  setSelectedYearId(null);
                  setSelectedSubjectId(null);
                  setSelectedSectionId(null);
                  setCurrentPage(1);
                }}
                disabled={educationOptions.length <= 1}
                placeholder="Select"
                theme="always-green"
                className={`!py-1 !pl-3 !pr-7 !rounded-full !font-bold ${educationOptions.length <= 1 ? "opacity-70 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {!isSchool && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
                {isInter ? "Group :" : "Branch :"}
              </span>
              <div className="w-[120px]">
                <CustomDropdown
                  value={selectedBranchId ?? ""}
                  options={branchOptions.map((b) => ({
                    value: b.value,
                    label: b.label,
                  }))}
                  onChange={(val) => {
                    const newVal = val ? Number(val) : null;
                    setSelectedBranchId(newVal);
                    setSelectedYearId(null);
                    setSelectedSubjectId(null);
                    setSelectedSectionId(null);
                    setCurrentPage(1);
                  }}
                  disabled={branchOptions.length <= 1 || !selectedEducationId}
                  placeholder="Select"
                  theme="always-green"
                  className={`!py-1 !pl-3 !pr-7 !rounded-full !font-bold ${(branchOptions.length <= 1 || !selectedEducationId) ? "opacity-70 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Year :
            </span>
            <div className="w-[120px]">
              <CustomDropdown
                value={selectedYearId ?? ""}
                options={yearOptions.map((y) => ({
                  value: y.value,
                  label: y.label,
                }))}
                onChange={(val) => {
                  setSelectedYearId(val ? Number(val) : null);
                  setSelectedSubjectId(null);
                  setSelectedSectionId(null);
                  setCurrentPage(1);
                }}
                disabled={yearOptions.length <= 1 || (!isSchool && !selectedBranchId)}
                placeholder="Select"
                theme="always-green"
                className={`!py-1 !pl-3 !pr-7 !rounded-full !font-bold ${(yearOptions.length <= 1 || (!isSchool && !selectedBranchId)) ? "opacity-70 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Subject :
            </span>
            <div className="w-fit min-w-[140px] max-w-[350px]">
              <CustomDropdown
                value={selectedSubjectId ?? ""}
                options={subjectOptions.map((subject) => ({
                  value: subject.value,
                  label: subject.label,
                }))}
                onChange={(val) => {
                  const newVal = val ? Number(val) : null;
                  setSelectedSubjectId(newVal);
                  setSelectedSectionId(null);
                  setCurrentPage(1);
                }}
                disabled={subjectOptions.length <= 1 || !selectedYearId}
                placeholder="Select"
                theme="always-green"
                className={`!py-1 !pl-3 !pr-7 !rounded-full !font-bold ${(subjectOptions.length <= 1 || !selectedYearId) ? "opacity-70 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {/* Section Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
              Section :
            </span>
            <div className="w-[100px]">
              <CustomDropdown
                value={selectedSectionId ?? ""}
                options={sectionOptions.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
                onChange={(val) => {
                  setSelectedSectionId(val ? Number(val) : null);
                  setCurrentPage(1);
                }}
                disabled={sectionOptions.length <= 1 || !selectedSubjectId}
                placeholder="Select"
                theme="always-green"
                className={`!py-1 !pl-3 !pr-7 !rounded-full !font-bold ${(sectionOptions.length <= 1 || !selectedSubjectId) ? "opacity-70 cursor-not-allowed" : ""}`}
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
                isFetching ? (
                  <ShimmerBlock className="h-6 w-12 md:h-8 md:w-16 rounded" />
                ) : index === 0 ? (
                  String(summary.totalStudents)
                ) : index === 1 ? (
                  String(summary.presentToday)
                ) : (
                  String(summary.lowAttendance)
                )
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
            {isFetching ? (
              <TopPerformersSkeleton />
            ) : (
              <TopFivePerformers performers={topPerformers} />
            )}
          </div>

          <div className="w-full h-full flex flex-col min-h-[300px] min-w-0">
            {isFetching ? (
              <TrendChartSkeleton />
            ) : (
              <PerformanceTrendChart data={summary.trendData} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
