"use client";
import { useEffect, useState } from "react";
import {
  UserInfoCard,
  UserInfoCardProps,
} from "../../faculty/utils/userInfoCard";
import AssignMentCard from "./cards/assignmentsCard";
import AttendanceCard from "./cards/attendanceCard";
import NextExamCard from "./cards/nextExamCard";
import AcademicPerformanceSmall from "./components/academicPerformanceSmall";
import FeeDueCard from "./cards/feeDueCard";
import SubjectProgressCards from "../../faculty/utils/subjectProgressCard/subjectProgressCards";
import FacultyChat from "./cards/facultyChat";
import { useUser } from "@/app/utils/context/UserContext";
import { getParentDashboardWidgets } from "@/lib/helpers/parent/dashboard/parentDashboardActions";

const ParentDashboardShimmer = () => {
  return (
    <div className="bg-blue-00 w-[68%] px-1 flex flex-col">
      <div className="bg-white h-[175px] w-full rounded-xl shadow-sm flex items-center p-6 gap-6 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
        <div className="flex flex-col flex-1 gap-4 z-0">
          <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded-md mt-6 animate-pulse"></div>
        </div>
        <div className="h-32 w-32 bg-gray-200 rounded-full shrink-0 animate-pulse z-0"></div>
      </div>

      <div className="w-full flex items-center justify-between mt-4 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white h-[200px] w-[32%] rounded-lg shadow-sm p-4 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
            <div className="flex justify-between items-center w-3/4 z-0">
              <div className="w-8 h-8 rounded-md bg-gray-200 animate-pulse"></div>
              <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-3 z-0 mt-2">
              <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded-md mt-2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex items-start justify-between mt-4 gap-4">
        <div className="bg-white h-[280px] w-[65%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
          <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-pulse z-0"></div>
          <div className="flex-1 bg-gray-100 rounded-md animate-pulse z-0 mt-2"></div>
        </div>
        <div className="bg-white h-[280px] w-[33%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
          <div className="h-6 w-1/2 bg-gray-200 rounded-md animate-pulse z-0"></div>
          <div className="flex-1 flex flex-col justify-center items-center gap-4 z-0 mt-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse mt-2"></div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-start justify-between mt-4 gap-4 pb-6">
        <div className="bg-white h-[250px] w-[65%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
          <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-pulse z-0"></div>
          <div className="flex gap-4 mt-2 z-0 h-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 bg-gray-100 rounded-md animate-pulse h-full"
              ></div>
            ))}
          </div>
        </div>
        <div className="bg-white h-[250px] w-[33%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
          <div className="h-6 w-1/2 bg-gray-200 rounded-md animate-pulse z-0 mb-2"></div>
          <div className="flex flex-col gap-4 z-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
// ------------------------------

export default function ParentLeft() {
  const { userId, fullName, gender, loading: userLoading } = useUser();

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const parentImage =
    gender && (gender === "Male" ? "/parent-male.png" : "/parent-female.png");

  useEffect(() => {
    if (userLoading || !userId) return;

    async function loadWidgets() {
      try {
        setLoading(true);
        const data = await getParentDashboardWidgets(userId!);
        setDashData(data);
      } catch (error) {
        console.error("Failed to load dashboard widgets", error);
      } finally {
        setLoading(false);
      }
    }

    loadWidgets();
  }, [userId, userLoading]);

  const card: UserInfoCardProps[] = [
    {
      show: true,
      studentId: dashData?.studentId || 0,
      studentBranch: dashData?.branchName || "Loading...",
      studentAcademicYear: dashData?.academicYear || "Loading...",
      user: fullName ?? "User",
      studentName: dashData?.studentName || "Loading...",
      childPerformance:
        "Your child’s academic performance and attendance summary are available below.",
      image: parentImage ?? undefined,
      imageHeight: "lg:h-[175px]",
      imageAlign: "center",
      top: "lg:top-[-2.5px]",
      right: "right-5",
    },
  ];

  const attendanceChartData = dashData?.attendanceChartData || [];

  const nextExam = {
    date: "21/Dec/2025",
    subject: "Computer Networks",
  };

  const subjects = [
    {
      title: "Data Structures and Algorithms",
      professor: "Prof. Ramesh Kumar",
      image: "dsa.jpg",
      percentage: 85,
      radialStart: "#10FD77",
      radialEnd: "#1C6B3F",
      remainingColor: "#A1FFCA",
    },
    {
      title: "Object-Oriented Programming",
      professor: "Prof. Anita Sharma",
      image: "oops.jpg",
      percentage: 85,
      radialStart: "#EFEDFF",
      radialEnd: "#705CFF",
      remainingColor: "#E8E4FF",
    },
    {
      title: "Computer Organization and Architecture",
      professor: "Prof. Suresh Reddy",
      image: "coa.jpg",
      percentage: 85,
      radialStart: "#FFFFFF",
      radialEnd: "#FFBE48",
      remainingColor: "#F7EBD5",
    },
    {
      title: "Discrete Mathematics",
      professor: "Prof. Rajesh Gupta",
      image: "dm.jpg",
      percentage: 85,
      radialStart: "#FEFFFF",
      radialEnd: "#008993",
      remainingColor: "#C4FBFF",
    },
  ];

  const chats = [
    {
      image: "/Group 2992 (01).png",
      professor: "1",
      subject: "N/A",
    },
    { image: "/Group 2992 (01).png", professor: "2", subject: "N/A" },
    {
      image: "/Group 2992 (01).png",
      professor: "3",
      subject: "N/A",
    },
    {
      image: "/Group 2992 (01).png",
      professor: "4",
      subject: "N/A",
    },
  ];

  if (loading || userLoading) {
    return <ParentDashboardShimmer />;
  }

  return (
    <div className="bg-blue-00 w-[68%] px-1">
      <UserInfoCard cardProps={card} />

      <div className="bg-blue-00 w-full flex items-center justify-between mt-4 rounded-lg">
        <AttendanceCard
          percentage={dashData?.attendancePercentage || 0}
          data={attendanceChartData}
        />
        {/* REMOVED PROPS HERE */}
        <AssignMentCard />
        <NextExamCard date={nextExam.date} subject={nextExam.subject} />
      </div>

      <div className="bg-blue-00 w-full lg:h-fit flex items-start justify-between mt-4">
        <AcademicPerformanceSmall />

        <FeeDueCard
          totalFee={dashData?.feeTotal || "0"}
          feePaid={dashData?.feePaid || "0"}
        />
      </div>

      <div className="bg-blue-00 mt-4 flex justify-between">
        <SubjectProgressCards props={subjects} />
        <FacultyChat props={chats} />
      </div>
    </div>
  );
}
