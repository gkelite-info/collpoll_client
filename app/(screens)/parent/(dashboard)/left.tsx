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
// import { useParent } from "@/app/utils/context/parent/useParent";
// import { useTranslations } from "next-intl";

// const ParentDashboardShimmer = () => {
//   return (
//     <div className="bg-blue-00 w-[68%] max-md:w-full px-1 flex flex-col">
//       <div className="bg-white h-[175px] w-full rounded-xl shadow-sm flex items-center p-6 gap-6 relative overflow-hidden">
//         <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
//         <div className="flex flex-col flex-1 gap-4 z-0">
//           <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
//           <div className="h-4 w-1/4 bg-gray-200 rounded-md animate-pulse"></div>
//           <div className="h-4 w-1/2 bg-gray-200 rounded-md mt-6 animate-pulse"></div>
//         </div>
//         <div className="h-32 w-32 bg-gray-200 rounded-full shrink-0 animate-pulse z-0"></div>
//       </div>

//       <div className="w-full flex items-center justify-between mt-4 gap-4">
//         {[1, 2, 3].map((i) => (
//           <div
//             key={i}
//             className="bg-white h-[200px] w-[32%] rounded-lg shadow-sm p-4 flex flex-col gap-4 relative overflow-hidden"
//           >
//             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
//             <div className="flex justify-between items-center w-3/4 z-0">
//               <div className="w-8 h-8 rounded-md bg-gray-200 animate-pulse"></div>
//               <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse"></div>
//             </div>
//             <div className="flex-1 flex flex-col justify-center items-center gap-3 z-0 mt-2">
//               <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
//               <div className="h-3 w-3/4 bg-gray-200 rounded-md mt-2 animate-pulse"></div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="w-full flex items-start justify-between mt-4 gap-4">
//         <div className="bg-white h-[280px] w-[65%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
//           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
//           <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-pulse z-0"></div>
//           <div className="flex-1 bg-gray-100 rounded-md animate-pulse z-0 mt-2"></div>
//         </div>
//         <div className="bg-white h-[280px] w-[33%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
//           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
//           <div className="h-6 w-1/2 bg-gray-200 rounded-md animate-pulse z-0"></div>
//           <div className="flex-1 flex flex-col justify-center items-center gap-4 z-0 mt-4">
//             <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
//             <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse mt-2"></div>
//           </div>
//         </div>
//       </div>

//       <div className="w-full flex items-start justify-between mt-4 gap-4 pb-6">
//         <div className="bg-white h-[250px] w-[65%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
//           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
//           <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-pulse z-0"></div>
//           <div className="flex gap-4 mt-2 z-0 h-full">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="flex-1 bg-gray-100 rounded-md animate-pulse h-full"
//               ></div>
//             ))}
//           </div>
//         </div>
//         <div className="bg-white h-[250px] w-[33%] rounded-lg shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
//           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
//           <div className="h-6 w-1/2 bg-gray-200 rounded-md animate-pulse z-0 mb-2"></div>
//           <div className="flex flex-col gap-4 z-0">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 animate-pulse"></div>
//                 <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function ParentLeft() {
//   const { userId, fullName, gender, loading: userLoading } = useUser();
//   const t = useTranslations("Dashboard.parent");

//   const [dashData, setDashData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const { studentId } = useParent();

//   const parentImage =
//     gender && (gender === "Male" ? "/male-parent1.png" : "/female-parent.png");

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
//       studentId: dashData?.studentPin || 0,
//       studentBranch: dashData?.branchName || t("Loading"),
//       studentAcademicYear: dashData?.academicYear || t("Loading"),
//       user: fullName ?? t("User"),
//       studentName: dashData?.studentName || t("Loading"),
//       childPerformance: t(
//         "Your childs academic performance and attendance summary are available below",
//       ),
//       image: parentImage ?? undefined,
//       imageHeight: "lg:h-[175px]",
//       imageAlign: "center",
//       top: "lg:top-[-2.5px]",
//       right: "right-5",
//     },
//   ];

//   const attendanceChartData = dashData?.attendanceChartData || [];

//   const nextExam = {
//     date: "21/Dec/2025",
//     subject: "Computer Networks",
//   };

//   const chats = [
//     {
//       image: "/Group 2992 (01).png",
//       professor: "1",
//       subject: "N/A",
//     },
//     { image: "/Group 2992 (01).png", professor: "2", subject: "N/A" },
//     {
//       image: "/Group 2992 (01).png",
//       professor: "3",
//       subject: "N/A",
//     },
//     {
//       image: "/Group 2992 (01).png",
//       professor: "4",
//       subject: "N/A",
//     },
//   ];

//   if (loading || userLoading) {
//     return <ParentDashboardShimmer />;
//   }

//   return (
//     <div className="bg-blue-00 w-[68%] max-md:w-full px-1">
//       <UserInfoCard cardProps={card} />

//       <div className="bg-blue-00 w-full flex items-center justify-between mt-4 rounded-lg">
//         <AttendanceCard
//           percentage={dashData?.attendancePercentage || 0}
//           data={attendanceChartData}
//         />
//         <AssignMentCard />
//         <NextExamCard date={nextExam.date} subject={nextExam.subject} />
//       </div>

//       <div className="bg-blue-00 w-full lg:h-fit flex items-start justify-between mt-4">
//         <AcademicPerformanceSmall studentId={studentId} />

//         <FeeDueCard
//           totalFee={dashData?.feeTotal || "0"}
//           feePaid={dashData?.feePaid || "0"}
//         />
//       </div>

//       <div className="bg-blue-00 mt-4 grid grid-cols-1 md:grid-cols-[66%_66%] gap-4">
//         <SubjectProgressCards
//           props={dashData?.subjects || []}
//           isLoading={false}
//         />
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
import { useParent } from "@/app/utils/context/parent/useParent";
import { useTranslations } from "next-intl";

const ParentDashboardShimmer = () => {
  return (
    <div className="bg-blue-00 w-full lg:w-[68%] px-2 lg:px-1 flex flex-col">
      <div className="bg-white h-[175px] w-full rounded-xl shadow-sm flex items-center p-6 gap-6 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
        <div className="flex flex-col flex-1 gap-4 z-0">
          <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded-md mt-6 animate-pulse"></div>
        </div>
        <div className="h-32 w-32 bg-gray-200 rounded-full shrink-0 animate-pulse z-0 hidden lg:block"></div>
      </div>

      <div className="hidden lg:flex w-full items-center justify-between mt-4 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white h-[200px] w-[32%] rounded-lg shadow-sm p-4 animate-pulse"
          />
        ))}
      </div>

      <div className="flex lg:hidden grid grid-cols-2 mt-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white h-[180px] w-full rounded-lg shadow-sm p-4 animate-pulse"
          />
        ))}
      </div>

      <div className="hidden lg:flex flex-col gap-4 w-full">
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

      <div className="flex lg:hidden flex-col gap-4 w-full mt-4 pb-6">
        <div className="bg-white h-[300px] w-full rounded-xl shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden border border-gray-100">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
          <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse z-0"></div>
          <div className="flex-1 bg-gray-100 rounded-xl animate-pulse z-0 mt-1"></div>
        </div>

        <div className="bg-white h-[240px] w-full rounded-xl shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden border border-gray-100">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
          <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-pulse z-0"></div>
          <div className="flex-1 flex bg-gray-50/50 border border-gray-100 rounded-xl items-center justify-center gap-4 z-0 mt-1 p-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="bg-white h-[260px] w-full rounded-xl shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden border border-gray-100">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
          <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse z-0 mb-1"></div>
          <div className="flex flex-col gap-3.5 z-0 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50/60 p-2 rounded-xl border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 animate-pulse"></div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3.5 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ParentLeft() {
  const { userId, fullName, gender, loading: userLoading } = useUser();
  const t = useTranslations("Dashboard.parent");

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { studentId } = useParent();

  const parentImage =
    gender && (gender === "Male" ? "/male-parent1.png" : "/female-parent.png");

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
      studentId: dashData?.studentPin || 0,
      studentBranch: dashData?.branchName || t("Loading"),
      studentAcademicYear: dashData?.academicYear || t("Loading"),
      user: fullName ?? t("User"),
      studentName: dashData?.studentName || t("Loading"),
      childPerformance: t(
        "Your childs academic performance and attendance summary are available below",
      ),
      image: parentImage ?? undefined,
    },
  ];

  const attendanceChartData = dashData?.attendanceChartData || [];

  const nextExam = {
    date: "21/Dec/2025",
    subject: "Computer Networks",
  };

  const chats = [
    { image: "/Group 2992 (01).png", professor: "1", subject: "N/A" },
    { image: "/Group 2992 (01).png", professor: "2", subject: "N/A" },
    { image: "/Group 2992 (01).png", professor: "3", subject: "N/A" },
    { image: "/Group 2992 (01).png", professor: "4", subject: "N/A" },
  ];

  if (loading || userLoading) {
    return <ParentDashboardShimmer />;
  }

  const AttendanceNode = (
    <AttendanceCard
      percentage={dashData?.attendancePercentage || 0}
      data={attendanceChartData}
    />
  );
  const AssignmentNode = <AssignMentCard />;
  const NextExamNode = (
    <NextExamCard date={nextExam.date} subject={nextExam.subject} />
  );
  const FeeDueNode = (
    <FeeDueCard
      totalFee={dashData?.feeTotal || "0"}
      feePaid={dashData?.feePaid || "0"}
    />
  );
  const AcademicNode = <AcademicPerformanceSmall studentId={studentId} />;
  const SubjectProgressNode = (
    <SubjectProgressCards props={dashData?.subjects || []} isLoading={false} />
  );
  const FacultyChatNode = <FacultyChat props={chats} />;

  return (
    <div className="bg-blue-00 w-full lg:w-[68%] px-2 lg:px-1 max-md:pb-6">
      <UserInfoCard cardProps={card} />

      <div className="hidden lg:block">
        <div className="bg-blue-00 w-full flex items-center justify-between mt-4 rounded-lg">
          {AttendanceNode}
          {AssignmentNode}
          {NextExamNode}
        </div>

        <div className="bg-blue-00 w-full lg:h-fit flex items-start justify-between mt-4">
          {AcademicNode}
          {FeeDueNode}
        </div>

        <div className="bg-blue-00 mt-4 grid grid-cols-1 md:grid-cols-[66%_66%] gap-4">
          {SubjectProgressNode}
          {FacultyChatNode}
        </div>
      </div>

      {/* 📱 MOBILE LAYOUT         */}
      <div className="lg:hidden flex flex-col mt-4 gap-4 w-full">
        <div className="grid grid-cols-2 gap-3 w-full">
          {AttendanceNode}
          {AssignmentNode}
          {NextExamNode}
          {FeeDueNode}
        </div>

        <div className="w-full">{AcademicNode}</div>
        <div className="w-full">{SubjectProgressNode}</div>
        <div className="w-full">{FacultyChatNode}</div>
      </div>
    </div>
  );
}
