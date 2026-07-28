"use client";

import CardComponent from "@/app/utils/card";
import { Chalkboard, ClockAfternoon, UsersThree, BookOpen } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import StudentPerformanceCard from "../../utils/studentPerformanceCard";
import UpcomingClasses from "../../utils/upcomingClasses";
import { STUDENT_DATA } from "./data";
import { UserInfoCard } from "../../utils/userInfoCard";
import { useUser } from "@/app/utils/context/UserContext";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getUpcomingClasses, UpcomingLesson } from "@/lib/helpers/faculty/attendance/getClasses";
import { getFacultyDashboardStats } from "@/lib/helpers/faculty/dashboard/getFacultyDashboardStats";
import SubjectPills from "./SubjectPills";
import SubjectPillsShimmer from "./SubjectPillsShimmer";

export default function FacultyDashLeft() {
  const { userId, fullName, gender, loading: userLoading } = useUser();
  const { facultyId, loading: facultyLoading, sections, selectedSectionIndex, setSelectedSectionIndex, collegeAcademicYears } = useFaculty();

  const uniqueSubjectsCount = new Set(sections?.map(s => s.collegeSubjectId)).size;
  const isSingleSubject = uniqueSubjectsCount === 1;

  const activeSection = sections?.[selectedSectionIndex];
  const subjectId = activeSection?.collegeSubjectId ?? null;
  const sectionId = isSingleSubject ? null : (activeSection?.collegeSectionsId ?? null);

  const { data: upcomingClasses = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["upcomingClasses", userId, subjectId, sectionId],
    queryFn: () => getUpcomingClasses(Number(userId), subjectId, sectionId), 
    enabled: !!userId && !userLoading && !facultyLoading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["facultyDashboardStats", facultyId, subjectId, sectionId],
    queryFn: () => getFacultyDashboardStats(Number(facultyId), subjectId ?? undefined, sectionId ?? undefined),
    enabled: !!facultyId && !facultyLoading,
    staleTime: 5 * 60 * 1000,
  });

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
      value: `${pad(stats.acceptedClasses)}/${pad(stats.totalClasses)}`,
      label: "Total Classes",
    },
    {
      style: "bg-[#FFEDDA]",
      icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
      value: `${pad(stats.presentStudents)}/${pad(stats.totalStudents)}`,
      label: "Total Students",
    },
    {
      style: "bg-[#E6FBEA]",
      icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
      value: `${pad(stats.completedLessons)}/${pad(stats.totalLessons)}`,
      label: "Total Lessons",
    },
    {
      style: "bg-[#CEE6FF]",
      icon: <ClockAfternoon size={32} weight="fill" color="#60AEFF" />,
      value: `${pad(stats.acceptedHours)}/${pad(stats.totalHours)}`,
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
      <div className="h-full w-full overflow-y-auto md:w-[65%] lg:w-[68%] mt-2 md:mt-0 lg:mt-0 p-1 lg:p-2 pb-7 landscape:pb-7 md:pb-0 lg:pb-0">
        <UserInfoCard cardProps={card} />
        
        {/* Subject Pills */}
        {!facultyLoading && !isSingleSubject && sections.length > 0 && (
          <SubjectPills
            sections={sections}
            collegeAcademicYears={collegeAcademicYears}
            selectedSectionIndex={selectedSectionIndex}
            setSelectedSectionIndex={setSelectedSectionIndex}
          />
        )}
        {facultyLoading && <SubjectPillsShimmer />}

        <div className="mt-4 rounded-lg grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3 text-xs">
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
        <div>
          <div className="bg-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4 mb-4">
              <div className="w-full">
                <StudentPerformanceCard students={STUDENT_DATA} />
              </div>
              <div className="overflow-y-auto shadow-md rounded-2xl bg-white min-h-75">
                <UpcomingClasses
                  lessons={upcomingClasses}
                  onAddLesson={() => { }}
                  facultyId={Number(facultyId)}
                  loading={isLoadingClasses}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
