"use client";

import CardComponent from "@/app/utils/card";
import { BookOpen, Chalkboard, ClockAfternoon, UsersThree } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScheduledLessonsStrip, { ScheduledLesson } from "../../utils/scheduledLessonsStrip";
import StudentPerformanceCard from "../../utils/studentPerformanceCard";
import UpcomingClasses from "../../utils/upcomingClasses";
import { INITIAL_SCHEDULED_LESSONS, STUDENT_DATA } from "./data";
import { UserInfoCard } from "../../utils/userInfoCard";
import { useUser } from "@/app/utils/context/UserContext";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getUpcomingClasses, UpcomingLesson } from "@/lib/helpers/faculty/attendance/getClasses";
import { getFacultyDashboardStats } from "@/lib/helpers/faculty/dashboard/getFacultyDashboardStats";

export default function FacultyDashLeft() {
  const { userId, fullName, gender, loading: userLoading } = useUser();
  const { facultyId, loading: facultyLoading } = useFaculty();

  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingLesson[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [scheduledLessons, setScheduledLessons] = useState<ScheduledLesson[]>(INITIAL_SCHEDULED_LESSONS);

  const [stats, setStats] = useState({
    totalClasses: 0,
    acceptedClasses: 0,
    totalHours: 0,
    acceptedHours: 0,
    totalStudents: 0,
    presentStudents: 0,
    totalLessons: 0,
    completedLessons: 0,
  });

  const loadData = async () => {
    if (userLoading || facultyLoading || !userId || !facultyId) return;
    try {
      setIsLoadingClasses(true);
      const [classesData, statsData] = await Promise.all([
        getUpcomingClasses(Number(userId)),
        getFacultyDashboardStats(Number(facultyId)),
      ]);

      setUpcomingClasses(classesData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, facultyId, userLoading, facultyLoading]);

  const facultyImage = gender && (gender === "Female" ? "/female-faculty.png" : "/male-faculty.png");

  const pad = (num: number) => num.toString().padStart(2, "0");

  const cardData = [
    {
      style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
      icon: <Chalkboard size={32} weight="fill" color="#714EF2" />,
      value: `${pad(stats.acceptedClasses)}/${pad(stats.totalClasses)}`,
      label: "Total Classes",
    },
    {
      style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
      icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
      value: `${pad(stats.presentStudents)}/${pad(stats.totalStudents)}`,
      label: "Total Students",
    },
    {
      style: "bg-[#E6FBEA] h-[126.35px] w-[182px]",
      icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
      value: `${pad(stats.completedLessons)}/${pad(stats.totalLessons)}`,
      label: "Total Lessons",
    },
    {
      style: "bg-[#CEE6FF] h-[126.35px] w-[182px]",
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
      facultySubject: "(Data Structures and Algorithms)",
      image: facultyImage ?? undefined,
      top: "lg:top-[-5px]",
      imageHeight: "h-45",
      right: "lg:right-[-100]",
    },
  ];

  const handleAddScheduledLesson = (
    newLessonData: Omit<ScheduledLesson, "id">,
  ) => {
    const newLesson = {
      id: Math.random().toString(36).substr(2, 9),
      ...newLessonData,
    };
    setScheduledLessons((prev) => [newLesson, ...prev]);
  };

  return (
    <>
      <div className="w-[68%] p-2">
        <UserInfoCard cardProps={card} />
        <div className="mt-5 rounded-lg flex gap-3 text-xs">
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
          <div className=" bg-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-6 mb-4">
              <div>
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
