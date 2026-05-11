"use client";

import { useRouter } from "next/navigation";
import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
import { CaretLeft, Chalkboard, FilePdf } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { getParentSubjectWiseStats } from "@/lib/helpers/parent/attendance/parentAttendanceActions";
import { SubjectAttendanceSkeleton } from "../shimmer/attendanceSkeletons";
import { useTranslations } from "next-intl";
import AiAttendanceNotificationBanner from "@/app/utils/AiAttendanceNotificationBanner";

interface CardItem {
  id: number;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  style?: string;
  iconBgColor?: string;
  iconColor?: string;
  underlineValue?: boolean;
  totalPercentage?: string | number;
}

export default function ParentSubjectAttendance() {
  const router = useRouter();
  const { userId } = useUser();
  const t = useTranslations("Attendance.parent"); // Hook

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      setLoading(true);
      const dateStr = new Date().toISOString().split("T")[0];
      const data = await getParentSubjectWiseStats(
        userId!,
        dateStr,
        currentPage,
        rowsPerPage,
      );
      setDashboardData(data);
      setTotalRecords(data.totalCount || 0);
      setLoading(false);
    }

    loadData();
  }, [userId, currentPage]);

  const cards: CardItem[] = [
    {
      id: 2,
      icon: <Chalkboard size={32} />,
      value: dashboardData
        ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
        : "0/0",
      label: t("Semester wise Classes"),
      style: "bg-[#CEE6FF] w-44",
      iconBgColor: "#7764FF",
      iconColor: "#EFEFEF",
      totalPercentage: dashboardData
        ? `${dashboardData.cards.percentage}%`
        : "0%",
    },
  ];

  const columns = [
    { title: t("Subject"), key: "subject" },
    { title: t("Total"), key: "total" },
    { title: t("Attended"), key: "attended" },
    { title: t("Missed"), key: "missed" },
    { title: t("Leave"), key: "leave" },
    { title: t("Percentage"), key: "percentage" },
    { title: t("Notes"), key: "notes" },
    { title: t("Actions"), key: "actions" },
  ];

  const tableData =
    dashboardData?.subjectWiseStats?.map((row: any) => ({
      subject: row.subjectName,
      total: row.total,
      attended: row.attended,
      missed: row.missed,
      leave: row.leave,
      percentage: `${row.percentage}%`,
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(
              `/parent/attendance?tab=subject-attendance-details&subjectId=${row.subjectId}`,
            )
          }
        >
          {t("View Details")}
        </span>
      ),
    })) || [];

  const handleCardClick = (cardId: number) => {
    if (cardId === 1) router.push("/parent/attendance");
  };

  if (loading) {
    return <SubjectAttendanceSkeleton />;
  }

  return (
    <>
      <div className="flex justify-between items-center pb-3">
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="Go Back"
              >
                <CaretLeft size={24} weight="bold" color="#282828" />
              </button>

              <h1 className="text-[#282828] font-bold text-2xl">
                {t("Attendance")}
              </h1>
            </div>

            <p className="text-[#282828] whitespace-nowrap">
              {t(
                "Track, Monitor, and Stay Updated on Your Childs Attendance Effortlessly",
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" isVisibile={false} />
        </div>
      </div>

      <div className="w-full h-[170px] mt-4 flex items-start gap-3">
        {cards.map((card, index) => (
          <CardComponent
            key={index}
            style={card.style}
            icon={card.icon}
            value={card.value}
            label={card.label}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
            underlineValue={card.underlineValue}
            totalPercentage={card.totalPercentage}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
        <SemesterAttendanceCard
          presentPercent={dashboardData?.semesterStats.present || 0}
          absentPercent={dashboardData?.semesterStats.absent || 0}
          leavePercent={dashboardData?.semesterStats.leave || 0}
          overallPercent={dashboardData?.cards.percentage || 0}
        />
        <WorkWeekCalendar style="w-[345px] mt-0" />
      </div>

      <div className="my-2 w-[69.5%]">
        <AiAttendanceNotificationBanner
          className="h-auto min-h-[90px]"
          message={
            <>
              🎉 Great job, {dashboardData?.studentName || "Shravani"}!
              You&apos;re eligible for exams. Keep maintaining your streak
              attend your next <span className="font-bold">2</span> classes to
              stay safe above <span className="font-bold">85%</span>!
            </>
          }
        />
      </div>

      <div className="mt-4 flex flex-col items-start">
        <h4 className="text-[#282828] font-medium">
          {t("Subject-Wise Attendance")}
        </h4>
        <p className="text-[#282828] text-sm mt-1">
          {t("Subject-Wise Breakdown")}
        </p>
        <TableComponent
          columns={columns}
          tableData={tableData}
          isLoading={loading}
        />

        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-3 mt-6 mb-4 w-full">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
            >
              ‹
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// "use client";

// import { useRouter } from "next/navigation";
// import CardComponent from "@/app/utils/card";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
// import {
//   CaretLeft,
//   Chalkboard,
//   FilePdf,
//   CaretDown,
// } from "@phosphor-icons/react";
// import TableComponent from "@/app/utils/table/table";
// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import { useEffect, useState } from "react";
// import { useUser } from "@/app/utils/context/UserContext";
// import { getParentSubjectWiseStats } from "@/lib/helpers/parent/attendance/parentAttendanceActions";
// import { SubjectAttendanceSkeleton } from "../shimmer/attendanceSkeletons";
// import { useTranslations } from "next-intl";
// import AiAttendanceNotificationBanner from "@/app/utils/AiAttendanceNotificationBanner";
// import { motion, AnimatePresence } from "framer-motion";

// interface CardItem {
//   id: number;
//   icon: React.ReactNode;
//   value: string | number;
//   label: string;
//   style?: string;
//   iconBgColor?: string;
//   iconColor?: string;
//   underlineValue?: boolean;
//   totalPercentage?: string | number;
// }

// export default function ParentSubjectAttendance() {
//   const router = useRouter();
//   const { userId } = useUser();
//   const t = useTranslations("Attendance.parent"); // Hook

//   const [dashboardData, setDashboardData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);

//   // State for mobile accordion
//   const [expandedRow, setExpandedRow] = useState<number | null>(null);

//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(totalRecords / rowsPerPage);

//   useEffect(() => {
//     if (!userId) return;

//     async function loadData() {
//       setLoading(true);
//       const dateStr = new Date().toISOString().split("T")[0];
//       const data = await getParentSubjectWiseStats(
//         userId!,
//         dateStr,
//         currentPage,
//         rowsPerPage,
//       );
//       setDashboardData(data);
//       setTotalRecords(data.totalCount || 0);
//       setLoading(false);
//     }

//     loadData();
//   }, [userId, currentPage]);

//   const cards: CardItem[] = [
//     {
//       id: 2,
//       icon: <Chalkboard size={32} />,
//       value: dashboardData
//         ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
//         : "0/0",
//       label: t("Semester wise Classes"),
//       style: "bg-[#CEE6FF] w-44 max-md:bg-[#FFEDDA]", // Mapped to orange fallback style for mobile card consistency
//       iconBgColor: "#7764FF",
//       iconColor: "#EFEFEF",
//       totalPercentage: dashboardData
//         ? `${dashboardData.cards.percentage}%`
//         : "0%",
//     },
//   ];

//   const columns = [
//     { title: t("Subject"), key: "subject" },
//     { title: t("Total"), key: "total" },
//     { title: t("Attended"), key: "attended" },
//     { title: t("Missed"), key: "missed" },
//     { title: t("Leave"), key: "leave" },
//     { title: t("Percentage"), key: "percentage" },
//     { title: t("Notes"), key: "notes" },
//     { title: t("Actions"), key: "actions" },
//   ];

//   const rawTableData = dashboardData?.subjectWiseStats || [];

//   const tableData =
//     rawTableData.map((row: any) => ({
//       subject: row.subjectName,
//       total: row.total,
//       attended: row.attended,
//       missed: row.missed,
//       leave: row.leave,
//       percentage: `${row.percentage}%`,
//       notes: (
//         <div className="w-full flex justify-center">
//           <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
//             <FilePdf size={20} color="#7557E3" />
//           </div>
//         </div>
//       ),
//       actions: (
//         <span
//           className="text-[#525252] cursor-pointer hover:underline underline"
//           onClick={() =>
//             router.push(
//               `/parent/attendance?tab=subject-attendance-details&subjectId=${row.subjectId}`,
//             )
//           }
//         >
//           {t("View Details")}
//         </span>
//       ),
//     })) || [];

//   const handleCardClick = (cardId: number) => {
//     if (cardId === 1) router.push("/parent/attendance");
//   };

//   if (loading) {
//     return <SubjectAttendanceSkeleton />;
//   }

//   return (
//     <>
//       <div className="flex justify-between items-center pb-3 max-md:pb-0">
//         <div className="flex w-[50%] max-md:w-full justify-between items-center">
//           <div className="flex flex-col w-full">
//             <div className="flex items-center gap-0 mb-1 max-md:mb-0">
//               <button
//                 onClick={() => router.back()}
//                 className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
//                 title="Go Back"
//               >
//                 <CaretLeft size={24} className="text-black -ml-1.5" />
//               </button>

//               <h1 className="text-[#282828] font-bold text-2xl max-md:text-[22px]">
//                 {t("Attendance")}
//               </h1>
//             </div>

//             <p className="text-[#282828] whitespace-nowrap max-md:text-gray-600 max-md:text-[13px] max-md:whitespace-normal">
//               {t(
//                 "Track, Monitor, and Stay Updated on Your Childs Attendance Effortlessly",
//               )}
//             </p>
//           </div>
//         </div>

//         <div className="flex justify-end w-[32%] max-md:hidden">
//           <CourseScheduleCard style="w-[320px]" isVisibile={false} />
//         </div>
//       </div>

//       <div className="w-full h-auto lg:h-[170px] mt-4 flex max-md:grid max-md:grid-cols-[1fr_1fr] items-start gap-3 max-md:gap-3">
//         <div className="contents max-md:flex max-md:flex-col max-md:gap-3">
//           {cards.map((card, index) => (
//             <CardComponent
//               key={index}
//               style={card.style}
//               icon={card.icon}
//               value={card.value}
//               label={card.label}
//               iconBgColor={card.iconBgColor}
//               iconColor={card.iconColor}
//               underlineValue={card.underlineValue}
//               totalPercentage={card.totalPercentage}
//               onClick={() => handleCardClick(card.id)}
//             />
//           ))}
//         </div>
//         <div className="max-md:w-full">
//           <SemesterAttendanceCard
//             presentPercent={dashboardData?.semesterStats.present || 0}
//             absentPercent={dashboardData?.semesterStats.absent || 0}
//             leavePercent={dashboardData?.semesterStats.leave || 0}
//             overallPercent={dashboardData?.cards.percentage || 0}
//           />
//         </div>
//         <WorkWeekCalendar style="w-[345px] mt-0 max-md:hidden" />
//       </div>

//       <div className="my-2 w-[69.5%] max-md:w-full max-md:mt-4">
//         <AiAttendanceNotificationBanner
//           className="h-auto min-h-[90px] max-md:min-h-[70px] max-md:py-4"
//           message={
//             <>
//               🎉 Great job, {dashboardData?.studentName || "Shravani"}!
//               You&apos;re eligible for exams. Keep maintaining your streak
//               attend your next <span className="font-bold">2</span> classes to
//               stay safe above <span className="font-bold">85%</span>!
//             </>
//           }
//         />
//       </div>

//       <div className="mt-4 flex flex-col items-start max-md:bg-white max-md:p-3 max-md:rounded-xl max-md:shadow-sm">
//         <h4 className="text-[#282828] font-medium max-md:font-semibold max-md:text-[17px]">
//           {t("Subject-Wise Attendance")}
//         </h4>
//         <p className="text-[#282828] text-sm mt-1 max-md:hidden">
//           {t("Subject-Wise Breakdown")}
//         </p>

//         {/* 🖥️ DESKTOP VIEW */}
//         <div className="hidden md:block w-full mt-2">
//           <TableComponent
//             columns={columns}
//             tableData={tableData}
//             isLoading={loading}
//           />
//         </div>

//         {/* 📱 MOBILE VIEW: Framer Motion Accordion */}
//         <div className="block md:hidden flex-col gap-2 mt-3 w-full">
//           {loading ? (
//             <div className="flex justify-center p-6">
//               <div className="w-6 h-6 border-2 border-[#16284F] border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             rawTableData.map((row: any, i: number) => {
//               const isExpanded = expandedRow === i;
//               return (
//                 <div
//                   key={i}
//                   className="bg-white border-b border-gray-100 overflow-hidden last:border-b-0"
//                 >
//                   <div
//                     className="py-3 flex justify-between items-center cursor-pointer"
//                     onClick={() => setExpandedRow(isExpanded ? null : i)}
//                   >
//                     <div className="flex flex-col gap-0.5">
//                       <span className="text-[#515151] text-[11px]">
//                         {t("Subject")}
//                       </span>
//                       <span className="text-[14px] text-[#282828] font-medium pr-2 truncate">
//                         {row.subjectName}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2 shrink-0">
//                       <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[8px] font-bold">
//                         PDF
//                       </div>
//                       <div
//                         className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-[#43C17A] text-white" : "bg-[#43C17A] text-white"}`}
//                       >
//                         <CaretDown
//                           size={14}
//                           weight="bold"
//                           className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <AnimatePresence initial={false}>
//                     {isExpanded && (
//                       <motion.div
//                         initial={{ height: 0, opacity: 0 }}
//                         animate={{ height: "auto", opacity: 1 }}
//                         exit={{ height: 0, opacity: 0 }}
//                         transition={{ duration: 0.3 }}
//                         className="pb-3 text-[13px] flex flex-col gap-2.5"
//                       >
//                         <div className="flex justify-between items-center">
//                           <span className="text-[#282828] font-medium">
//                             {t("Total")}
//                           </span>
//                           <span className="text-gray-600">{row.total}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-[#282828] font-medium">
//                             {t("Attended")}
//                           </span>
//                           <span className="text-gray-600">{row.attended}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-[#282828] font-medium">
//                             {t("Missed")}
//                           </span>
//                           <span className="text-gray-600">{row.missed}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-[#282828] font-medium">
//                             {t("Leave")}
//                           </span>
//                           <span className="text-gray-600">{row.leave}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-[#282828] font-medium">
//                             {t("Percentage")}
//                           </span>
//                           <span className="text-gray-600">
//                             {row.percentage}%
//                           </span>
//                         </div>
//                         <div className="flex justify-end items-center mt-1">
//                           <span
//                             className="text-[#515151] underline text-[12px]"
//                             onClick={() =>
//                               router.push(
//                                 `/parent/attendance?tab=subject-attendance-details&subjectId=${row.subjectId}`,
//                               )
//                             }
//                           >
//                             {t("View Details")}
//                           </span>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {totalPages > 1 && (
//           <div className="flex justify-end items-center gap-3 mt-6 mb-4 w-full">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//             >
//               ‹
//             </button>
//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentPage(i + 1)}
//                 className={`w-10 h-10 rounded-lg font-semibold max-md:w-8 max-md:h-8 ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//               >
//                 {i + 1}
//               </button>
//             ))}
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//             >
//               ›
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
