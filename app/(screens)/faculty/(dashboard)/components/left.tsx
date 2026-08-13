"use client";

import CardComponent from "@/app/utils/card";
import { Chalkboard, ClockAfternoon, UsersThree, BookOpen } from "@phosphor-icons/react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import StudentPerformanceCard from "../../utils/studentPerformanceCard";
import UpcomingClasses from "../../utils/upcomingClasses";
import { useFacultyStudentPerformance } from "../../utils/useFacultyStudentPerformance";
import { UserInfoCard } from "../../utils/userInfoCard";
import { useUser } from "@/app/utils/context/UserContext";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getUpcomingClasses } from "@/lib/helpers/faculty/attendance/getClasses";
import { getFacultyDashboardStats } from "@/lib/helpers/faculty/dashboard/getFacultyDashboardStats";
import SubjectPills from "./SubjectPills";
import SubjectPillsShimmer from "./SubjectPillsShimmer";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export default function FacultyDashLeft() {
  const { userId, fullName, gender, loading: userLoading } = useUser();
  const { 
    facultyId, 
    loading: facultyLoading, 
    sections, 
    selectedSectionIndex, 
    setSelectedSectionIndex, 
    collegeAcademicYears,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    academicYearIds,
    sectionIds,
    subjectIds,
    faculty_edu_type,
  } = useFaculty();

  const isSchool =
    faculty_edu_type
      ?.split(",")
      .some((educationType) => isSchoolEducation(educationType)) ?? false;

  const uniqueSubjectsCount = new Set(sections?.map(s => s.collegeSubjectId)).size;
  const isSingleSubject = uniqueSubjectsCount === 1;

  const activeSection = sections?.[selectedSectionIndex];
  const activeSubjectId = activeSection?.collegeSubjectId ?? null;
  const activeSectionId = isSingleSubject ? null : (activeSection?.collegeSectionsId ?? null);

  const {
    data: performanceData,
    fetchNextPage: fetchNextPerformancePage,
    hasNextPage: hasNextPerformancePage,
    isFetchingNextPage: isFetchingNextPerformancePage,
    isLoading: isLoadingPerformance,
  } = useFacultyStudentPerformance({
    facultyId: Number(facultyId),
    collegeId: Number(collegeId),
    collegeEducationId: Number(activeSection?.collegeEducationId ?? collegeEducationId),
    collegeBranchId: Number(activeSection?.collegeBranchId ?? collegeBranchId),
    academicYearIds: activeSection?.collegeAcademicYearId ? [activeSection.collegeAcademicYearId] : academicYearIds,
    sectionIds: activeSectionId ? [activeSectionId] : sectionIds,
    subjectIds: activeSubjectId ? [activeSubjectId] : subjectIds,
    isSchool,
  }, !userLoading && !facultyLoading);

  const studentsPerformance = performanceData?.pages.flatMap(page => page.students) || [];

  const { 
    data: upcomingClassesData, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingClasses 
  } = useInfiniteQuery({
    queryKey: ["upcomingClasses", userId, activeSubjectId, activeSectionId],
    queryFn: ({ pageParam = 0 }) => getUpcomingClasses(Number(userId), activeSubjectId, activeSectionId, pageParam as number, 5),
    getNextPageParam: (lastPage, allPages) => lastPage.length === 5 ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!userId && !userLoading && !facultyLoading,
    staleTime: 5 * 60 * 1000,
  });

  const upcomingClasses = upcomingClassesData?.pages.flat() || [];

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["facultyDashboardStats", facultyId, activeSubjectId, activeSectionId],
    queryFn: () => getFacultyDashboardStats(Number(facultyId), activeSubjectId ?? undefined, activeSectionId ?? undefined),
    enabled: !!facultyId && !facultyLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isDataLoading = userLoading || facultyLoading || isLoadingStats;

  const stats = statsData || {
    totalClasses: 0,
    acceptedClasses: 0,
    totalHours: 0,
    acceptedHours: 0,
    totalStudents: 0,
    presentStudents: 0,
    totalLessons: 0,
    completedLessons: 0,
  };

  const facultyImage = gender && (gender === "Female" ? "/female-faculty.png" : "/male-faculty.png");

  const pad = (num: number) => num.toString().padStart(2, "0");

  const cardData = [
    {
      style: "bg-[#E2DAFF]",
      icon: <Chalkboard size={32} weight="fill" color="#714EF2" />,
      value: isDataLoading ? <div className="h-6 w-16 bg-white/50 animate-pulse rounded"></div> : `${pad(stats.acceptedClasses)}/${pad(stats.totalClasses)}`,
      label: "Total Classes",
    },
    {
      style: "bg-[#FFEDDA]",
      icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
      value: isDataLoading ? <div className="h-6 w-16 bg-white/50 animate-pulse rounded"></div> : `${pad(stats.presentStudents)}/${pad(stats.totalStudents)}`,
      label: "Total Students",
    },
    {
      style: "bg-[#E6FBEA]",
      icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
      value: isDataLoading ? <div className="h-6 w-16 bg-white/50 animate-pulse rounded"></div> : `${pad(stats.completedLessons)}/${pad(stats.totalLessons)}`,
      label: "Total Lessons",
    },
    {
      style: "bg-[#CEE6FF]",
      icon: <ClockAfternoon size={32} weight="fill" color="#60AEFF" />,
      value: isDataLoading ? <div className="h-6 w-16 bg-white/50 animate-pulse rounded"></div> : `${pad(stats.acceptedHours)}/${pad(stats.totalHours)}`,
      label: "Total Hours",
    },
  ];

  const card = [
    {
      show: false,
      user: fullName ?? "User",
      studentsTaskPercentage: 0,
      image: facultyImage ?? undefined,
      top: "lg:top-[-5px]",
      imageHeight: "h-45",
      right: "lg:right-[-100]",
    },
  ];

  return (
    <>
      <div className="h-full w-full flex flex-col overflow-y-auto md:w-[65%] lg:w-[68%] mt-2 md:mt-0 lg:mt-0 p-1 lg:p-2 pb-7 landscape:pb-7 md:pb-4 lg:pb-4">
        <div className="shrink-0">
          <UserInfoCard cardProps={card} />
        </div>
        
        {/* Subject Pills */}
        {!facultyLoading && !isSingleSubject && sections.length > 0 && (
          <div className="shrink-0 mt-3">
            <SubjectPills
              sections={sections}
              collegeAcademicYears={collegeAcademicYears}
              selectedSectionIndex={selectedSectionIndex}
              setSelectedSectionIndex={setSelectedSectionIndex}
            />
          </div>
        )}
        {facultyLoading && <div className="shrink-0 mt-3"><SubjectPillsShimmer /></div>}

        <div className="shrink-0 mt-4 rounded-lg grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3 text-xs">
          {cardData.map((item, index) => (
            <CardComponent
              key={index}
              style={item.style}
              icon={item.icon}
              value={item.value}
              label={item.label}
            />
          ))}
        </div>
        <div className="flex-1 min-h-[320px] mt-4 mb-2 lg:mb-0 relative">
          <div className="absolute inset-0 bg-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
              <div className="w-full h-full relative">
                <div className="absolute inset-0">
                  <StudentPerformanceCard 
                    students={studentsPerformance} 
                    loading={isLoadingPerformance || userLoading || facultyLoading}
                    fetchNextPage={fetchNextPerformancePage}
                    hasNextPage={hasNextPerformancePage}
                    isFetchingNextPage={isFetchingNextPerformancePage}
                  />
                </div>
              </div>
              <div className="h-full overflow-hidden shadow-md rounded-2xl bg-white flex flex-col relative">
                <div className="absolute inset-0 flex flex-col">
                  <UpcomingClasses
                    lessons={upcomingClasses}
                    onAddLesson={() => { }}
                    facultyId={Number(facultyId)}
                    loading={isLoadingClasses || userLoading || facultyLoading}
                    fetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
