"use client";

import CardComponent from "@/app/utils/card";
import {
  BookOpen,
  Chalkboard,
  ClockAfternoon,
  UsersThree,
} from "@phosphor-icons/react";

import { useState } from "react";

import ScheduledLessonsStrip, { ScheduledLesson } from "../../utils/scheduledLessonsStrip";
import StudentPerformanceCard from "../../utils/studentPerformanceCard";
import UpcomingClasses, { UpcomingLesson } from "../../utils/upcomingClasses";
import { INITIAL_LESSONS, INITIAL_SCHEDULED_LESSONS, STUDENT_DATA, } from "./data";
import { UserInfoCard } from "../../utils/userInfoCard";
import { useUser } from "@/app/utils/context/UserContext";

export default function FacultyDashLeft() {
 const { fullName, gender, loading } = useUser();

const facultyImage =
  !loading && gender === "Female"
    ? "/faculty-f.png"
    : !loading && gender === "Male"
    ? "/faculty-m.png"
    : null; 


  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingLesson[]>(INITIAL_LESSONS);
  const [scheduledLessons, setScheduledLessons] = useState<ScheduledLesson[]>(INITIAL_SCHEDULED_LESSONS);

  const cardData = [
    {
      style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
      icon: <Chalkboard size={32} weight="fill" color="#714EF2" />,
      value: "02/08",
      label: "Total Classes",
    },
    {
      style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
      icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
      value: "30/35",
      label: "Total Students",
    },
    {
      style: "bg-[#E6FBEA] h-[126.35px] w-[182px]",
      icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
      value: "12/15",
      label: "Total Lessons",
    },
    {
      style: "bg-[#CEE6FF] h-[126.35px] w-[182px]",
      icon: <ClockAfternoon size={32} weight="fill" color="#60AEFF" />,
      value: "05/09",
      label: "Total Hours",
    },
  ];

  const card = [
    {
      show: false,
      user: fullName ?? "User",
      studentsTaskPercentage: 85,
      facultySubject: "(Data Structures and Algorithms)",
      image: facultyImage ?? undefined,
      top: "lg:top-[-173px]",
      imageHeight: 170,
    },
  ];

  const handleAddUpcomingClass = (
    newLessonData: Omit<UpcomingLesson, "id">
  ) => {
    const newClass = {
      id: Math.random().toString(36).substr(2, 9),
      ...newLessonData,
    };
    setUpcomingClasses((prev) => [newClass, ...prev]);
  };

  const handleAddScheduledLesson = (
    newLessonData: Omit<ScheduledLesson, "id">
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
        <UserInfoCard
          cardProps={card}

        />
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
              <div className="overflow-y-auto shadow-md rounded-2xl bg-white">
                <UpcomingClasses
                  lessons={upcomingClasses}
                  onAddLesson={handleAddUpcomingClass}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3">
              <ScheduledLessonsStrip
                lessons={scheduledLessons}
                onAddLesson={handleAddScheduledLesson}
                subjectName="Data Structures and algorithms"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
