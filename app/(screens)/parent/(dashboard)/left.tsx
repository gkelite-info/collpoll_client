// "use client";
// import { useEffect, useState } from "react";
// import {
//   UserInfoCard,
//   UserInfoCardProps,
// } from "../../faculty/utils/userInfoCard";
// import AssignMentCard from "./cards/assignmentsCard";
// import AttendanceCard from "./cards/attendanceCard";
// import NextExamCard from "./cards/nextExamCard";
// import AcademicPerformanceSmall from "./components/academicPerformanceSmall";
// import FeeDueCard from "./cards/feeDueCard";
// import SubjectProgressCards from "../../faculty/utils/subjectProgressCard/subjectProgressCards";
// import FacultyChat from "./cards/facultyChat";
// import { useUser } from "@/app/utils/context/UserContext";
// import { getParentDashboardWidgets } from "@/lib/helpers/parent/dashboard/parentDashboardActions";

// export default function ParentLeft() {
//   const { userId, fullName, gender, loading: userLoading } = useUser();

//   const [dashData, setDashData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   const parentImage =
//     gender && (gender === "Male" ? "/parent-male.png" : "/parent-female.png");

//   useEffect(() => {
//     if (userLoading || !userId) return;

//     async function loadWidgets() {
//       try {
//         setLoading(true);
//         const data = await getParentDashboardWidgets(userId!);
//         setDashData(data);
//       } catch (error) {
//         console.error("Failed to load dashboard widgets", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadWidgets();
//   }, [userId, userLoading]);

//   const card: UserInfoCardProps[] = [
//     {
//       show: true,
//       studentId: dashData?.studentId || 0,
//       studentBranch: dashData?.branchName || "Loading...",
//       studentAcademicYear: dashData?.academicYear || "Loading...",
//       user: fullName ?? "User",
//       studentName: dashData?.studentName || "Loading...",
//       childPerformance:
//         "Your child’s academic performance and attendance summary are available below.",
//       image: parentImage ?? undefined,
//       imageHeight: "lg:h-[175px]",
//       imageAlign: "center",
//       top: "lg:top-[-2.5px]",
//       right: "right-5",
//     },
//   ];

//   const attendanceChartData = dashData?.attendanceChartData || [];

//   const assignMent = [
//     {
//       completed: 8,
//       total: 12,
//       nextDate: "20/Nov/2025",
//     },
//   ];

//   const nextExam = {
//     date: "21/Dec/2025",
//     subject: "Computer Networks",
//   };

//   const subjects = [
//     {
//       title: "Data Structures and Algorithms",
//       professor: "Prof. Ramesh Kumar",
//       image: "dsa.jpg",
//       percentage: 85,
//       radialStart: "#10FD77",
//       radialEnd: "#1C6B3F",
//       remainingColor: "#A1FFCA",
//     },
//     {
//       title: "Object-Oriented Programming",
//       professor: "Prof. Anita Sharma",
//       image: "oops.jpg",
//       percentage: 85,
//       radialStart: "#EFEDFF",
//       radialEnd: "#705CFF",
//       remainingColor: "#E8E4FF",
//     },
//     {
//       title: "Computer Organization and Architecture",
//       professor: "Prof. Suresh Reddy",
//       image: "coa.jpg",
//       percentage: 85,
//       radialStart: "#FFFFFF",
//       radialEnd: "#FFBE48",
//       remainingColor: "#F7EBD5",
//     },
//     {
//       title: "Discrete Mathematics",
//       professor: "Prof. Rajesh Gupta",
//       image: "dm.jpg",
//       percentage: 85,
//       radialStart: "#FEFFFF",
//       radialEnd: "#008993",
//       remainingColor: "#C4FBFF",
//     },
//   ];

//   const chats = [
//     {
//       image: "/faculty.png",
//       professor: "Ramesh Reddy",
//       subject: "Date Structures",
//     },
//     { image: "/faculty.png", professor: "Ramu", subject: "Oops" },
//     {
//       image: "/faculty.png",
//       professor: "Ashish",
//       subject: "Discrete Mathematics",
//     },
//     {
//       image: "/faculty.png",
//       professor: "Shiva Prasad",
//       subject: "Digital Electronics",
//     },
//   ];

//   return (
//     <div className="bg-blue-00 w-[68%] px-1">
//       <UserInfoCard cardProps={card} />

//       <div className="bg-blue-00 w-full flex items-center justify-between mt-4 rounded-lg">
//         <AttendanceCard
//           percentage={dashData?.attendancePercentage || 0}
//           data={attendanceChartData}
//         />
//         <AssignMentCard props={assignMent} />
//         <NextExamCard date={nextExam.date} subject={nextExam.subject} />
//       </div>

//       <div className="bg-blue-00 w-full lg:h-fit flex items-start justify-between mt-4">
//         <AcademicPerformanceSmall />
//         <FeeDueCard
//           totalFee={dashData?.feeTotal || "0"}
//           feePaid={dashData?.feePaid || "0"}
//         />
//       </div>

//       <div className="bg-blue-00 mt-4 flex justify-between">
//         <SubjectProgressCards props={subjects} />
//         <FacultyChat props={chats} />
//       </div>
//     </div>
//   );
// }

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

  const assignMent = [
    {
      completed: 8,
      total: 12,
      nextDate: "20/Nov/2025",
    },
  ];

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
      image: "/faculty.png",
      professor: "Ramesh Reddy",
      subject: "Date Structures",
    },
    { image: "/faculty.png", professor: "Ramu", subject: "Oops" },
    {
      image: "/faculty.png",
      professor: "Ashish",
      subject: "Discrete Mathematics",
    },
    {
      image: "/faculty.png",
      professor: "Shiva Prasad",
      subject: "Digital Electronics",
    },
  ];

  return (
    <div className="bg-blue-00 w-[68%] px-1">
      <UserInfoCard cardProps={card} />

      <div className="bg-blue-00 w-full flex items-center justify-between mt-4 rounded-lg">
        <AttendanceCard
          percentage={dashData?.attendancePercentage || 0}
          data={attendanceChartData}
        />
        <AssignMentCard props={assignMent} />
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
