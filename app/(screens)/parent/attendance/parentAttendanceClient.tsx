"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AttendanceInsight from "@/app/utils/insightChart";
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
import Table from "@/app/utils/table";
import { Chalkboard, FilePdf, UsersThree } from "@phosphor-icons/react";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import ParentSubjectAttendance from "./subject-attendance/page";
import ParentSubjectAttendanceDetails from "./subject-attendance-details/page";
import { useUser } from "@/app/utils/context/UserContext";
import { getParentDashboardData } from "@/lib/helpers/parent/attendance/parentAttendanceActions";
import {
  DashboardSkeleton,
  TableSkeleton,
} from "../../(student)/(attendance)/shimmer/attendanceDashSkeleton";
import { useTranslations } from "next-intl";
import AiAttendanceNotificationBanner from "@/app/utils/AiAttendanceNotificationBanner";

interface TableRow {
  Subject: string;
  Faculty: string;
  "Today's Status": string;
  "Class Attendance": string;
  "Percentage %": string;
  Notes: React.ReactNode;
}

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

function formatAttendanceStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ParentAttendanceClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const t = useTranslations("Attendance.parent"); // Hook

  const tab = searchParams.get("tab");
  const showSubjectAttendanceTable = tab === "subject-attendance";
  const showSubjectAttendanceDetails = tab === "subject-attendance-details";
  const hideRightSection =
    showSubjectAttendanceTable || showSubjectAttendanceDetails;

  const [dataLoading, setDataLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const columns = [
    t("Subject"),
    t("Faculty"),
    t("Todays Status"),
    t("Class Attendance"),
    t("Percentage %"),
    t("Notes"),
  ];

  useEffect(() => {
    if (userLoading || !userId) return;

    let isMounted = true;

    async function fetchData() {
      try {
        setDataLoading(true);

        const year = viewDate.getFullYear();
        const month = String(viewDate.getMonth() + 1).padStart(2, "0");
        const day = String(viewDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const data = await getParentDashboardData(
          userId!,
          dateStr,
          currentPage,
          rowsPerPage,
        );

        if (isMounted) {
          setDashboardData(data);
          setTotalRecords(data.totalCount || 0);
        }
      } catch (err) {
        console.error("Failed to fetch parent attendance dashboard", err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId, userLoading, viewDate, currentPage]);

  const handleCardClick = (cardId: number) => {
    if (cardId === 2) {
      router.push(`/parent/attendance?tab=subject-attendance`);
    }
  };

  const tableRows: TableRow[] =
    dashboardData?.tableData?.map((row: any) => ({
      Subject: row.subject,
      Faculty: row.faculty,
      "Todays Status": t(formatAttendanceStatus(row.status)),
      "Class Attendance": row.classAttendance,
      "Percentage %": row.percentage,
      Notes: <FilePdf size={17} />,
    })) || [];

  const dynamicCards: CardItem[] = [
    {
      id: 1,
      icon: <UsersThree size={32} />,
      value: dashboardData
        ? `${dashboardData.todayStats.attended}/${dashboardData.todayStats.total}`
        : "0/0",
      label: t("Today Total Classes"),
      style: "bg-[#FFEDDA] w-44",
      iconBgColor: "#FFBB70",
      iconColor: "#EFEFEF",
    },
    {
      id: 2,
      icon: <Chalkboard size={32} />,
      value: dashboardData
        ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
        : "0/0",
      label: t("Semester wise Attendance"),
      style: "bg-[#CEE6FF] w-44",
      iconBgColor: "#7764FF",
      iconColor: "#EFEFEF",
      totalPercentage: dashboardData
        ? `${dashboardData.cards.percentage}%`
        : "0%",
    },
  ];

  const formattedDate = viewDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isToday = viewDate.toDateString() === new Date().toDateString();

  return (
    <div className="bg-red-00 flex w-full h-fit lg:pb-5 p-2">
      <div
        className={`flex flex-col gap-2 ${hideRightSection ? "w-full" : "w-[68%]"}`}
      >
        {!showSubjectAttendanceTable && !showSubjectAttendanceDetails && (
          <>
            <div className="mb-5">
              <h1 className="text-[#282828] font-bold text-2xl mb-1">
                {t("Attendance")}
              </h1>
              <p className="text-[#282828] text-sm">
                {t(
                  "Track, Manage, and Maintain Your wards Attendance Effortlessly",
                )}
              </p>
            </div>

            {dataLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="flex gap-4 flex-wrap">
                {dynamicCards.map((card, index) => (
                  <div key={card.id}>
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
                  </div>
                ))}
                <SemesterAttendanceCard
                  presentPercent={dashboardData?.semesterStats.present || 0}
                  absentPercent={dashboardData?.semesterStats.absent || 0}
                  leavePercent={dashboardData?.semesterStats.leave || 0}
                  overallPercent={dashboardData?.semesterStats.present || 0}
                />
              </div>
            )}

            <div className="my-2">
              <AiAttendanceNotificationBanner
                className="h-auto min-h-[90px]"
                message={
                  <>
                    🎉 Great job, {dashboardData?.studentName || "Shravani"}!
                    You&apos;re eligible for exams. Keep maintaining your streak
                    attend your next <span className="font-bold">2</span>{" "}
                    classes to stay safe above{" "}
                    <span className="font-bold">85%</span>!
                  </>
                }
              />
            </div>

            <div className="bg-red-00 flex flex-col">
              <h5 className="text-[#282828] font-medium text-md">
                {isToday
                  ? t("Todays Attendance")
                  : t("Attendance – {date}", { date: formattedDate })}
              </h5>
              <p className="text-[#282828] text-sm">
                {t("Classes on {date}", { date: formattedDate })}
              </p>

              {dataLoading ? (
                <div className="mt-5">
                  <TableSkeleton />
                </div>
              ) : (
                <>
                  <Table columns={columns} data={tableRows} />
                  {totalPages > 1 && (
                    <div className="flex justify-end items-center gap-3 mt-6 mb-4 w-full">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
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
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                      >
                        ›
                      </button>
                    </div>
                  )}
                  {tableRows.length === 0 && (
                    <p className="text-gray-400 italic text-sm mt-4 text-center border p-4 rounded-lg">
                      {t("No classes scheduled for {date}", {
                        date: formattedDate,
                      })}
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {showSubjectAttendanceTable && <ParentSubjectAttendance />}
        {showSubjectAttendanceDetails && <ParentSubjectAttendanceDetails />}
      </div>

      {!hideRightSection && (
        <div className="bg-blue-00 w-[32%] flex flex-col gap-1.5 p-2 pr-0 pt-0">
          <CourseScheduleCard isVisibile={false} />
          <WorkWeekCalendar activeDate={viewDate} onDateSelect={setViewDate} />
          <div className="mt-5">
            <AttendanceInsight
              weeklyData={dashboardData?.weeklyData || [0, 0, 0, 0, 0, 0, 0]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import CardComponent from "@/app/utils/card";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import AttendanceInsight from "@/app/utils/insightChart";
// import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
// import Table from "@/app/utils/table";
// import {
//   Chalkboard,
//   FilePdf,
//   UsersThree,
//   CaretDown,
// } from "@phosphor-icons/react";
// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import ParentSubjectAttendance from "./subject-attendance/page";
// import ParentSubjectAttendanceDetails from "./subject-attendance-details/page";
// import { useUser } from "@/app/utils/context/UserContext";
// import { getParentDashboardData } from "@/lib/helpers/parent/attendance/parentAttendanceActions";
// import {
//   DashboardSkeleton,
//   TableSkeleton,
// } from "../../(student)/(attendance)/shimmer/attendanceDashSkeleton";
// import { useTranslations } from "next-intl";
// import AiAttendanceNotificationBanner from "@/app/utils/AiAttendanceNotificationBanner";
// import { motion, AnimatePresence } from "framer-motion";

// interface TableRow {
//   Subject: string;
//   Faculty: string;
//   "Todays Status": string;
//   "Class Attendance": string;
//   "Percentage %": string;
//   Notes: React.ReactNode;
// }

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

// function formatAttendanceStatus(status: string) {
//   return status
//     .toLowerCase()
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// export default function ParentAttendanceClient() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const { userId, loading: userLoading } = useUser();
//   const t = useTranslations("Attendance.parent"); // Hook

//   const tab = searchParams.get("tab");
//   const showSubjectAttendanceTable = tab === "subject-attendance";
//   const showSubjectAttendanceDetails = tab === "subject-attendance-details";
//   const hideRightSection =
//     showSubjectAttendanceTable || showSubjectAttendanceDetails;

//   const [dataLoading, setDataLoading] = useState(false);
//   const [dashboardData, setDashboardData] = useState<any>(null);
//   const [viewDate, setViewDate] = useState<Date>(new Date());
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);

//   // Accordion state for mobile table
//   const [expandedRow, setExpandedRow] = useState<number | null>(null);

//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(totalRecords / rowsPerPage);

//   const columns = [
//     t("Subject"),
//     t("Faculty"),
//     t("Todays Status"),
//     t("Class Attendance"),
//     t("Percentage %"),
//     t("Notes"),
//   ];

//   useEffect(() => {
//     if (userLoading || !userId) return;

//     let isMounted = true;

//     async function fetchData() {
//       try {
//         setDataLoading(true);

//         const year = viewDate.getFullYear();
//         const month = String(viewDate.getMonth() + 1).padStart(2, "0");
//         const day = String(viewDate.getDate()).padStart(2, "0");
//         const dateStr = `${year}-${month}-${day}`;

//         const data = await getParentDashboardData(
//           userId!,
//           dateStr,
//           currentPage,
//           rowsPerPage,
//         );

//         if (isMounted) {
//           setDashboardData(data);
//           setTotalRecords(data.totalCount || 0);
//         }
//       } catch (err) {
//         console.error("Failed to fetch parent attendance dashboard", err);
//       } finally {
//         if (isMounted) setDataLoading(false);
//       }
//     }

//     fetchData();

//     return () => {
//       isMounted = false;
//     };
//   }, [userId, userLoading, viewDate, currentPage]);

//   const handleCardClick = (cardId: number) => {
//     if (cardId === 2) {
//       router.push(`/parent/attendance?tab=subject-attendance`);
//     }
//   };

//   const tableRows: TableRow[] =
//     dashboardData?.tableData?.map((row: any) => ({
//       Subject: row.subject,
//       Faculty: row.faculty,
//       "Todays Status": t(formatAttendanceStatus(row.status)),
//       "Class Attendance": row.classAttendance,
//       "Percentage %": row.percentage,
//       Notes: <FilePdf size={17} />,
//     })) || [];

//   const dynamicCards: CardItem[] = [
//     {
//       id: 1,
//       icon: <UsersThree size={32} />,
//       value: dashboardData
//         ? `${dashboardData.todayStats.attended}/${dashboardData.todayStats.total}`
//         : "0/0",
//       label: t("Today Total Classes"),
//       style: "bg-[#FFEDDA] w-44 max-md:bg-[#FFEDDA]",
//       iconBgColor: "#FFBB70",
//       iconColor: "#EFEFEF",
//     },
//     {
//       id: 2,
//       icon: <Chalkboard size={32} />,
//       value: dashboardData
//         ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
//         : "0/0",
//       label: t("Semester wise Attendance"),
//       style: "bg-[#CEE6FF] w-44 max-md:bg-[#FFEDDA]",
//       iconBgColor: "#7764FF",
//       iconColor: "#EFEFEF",
//       totalPercentage: dashboardData
//         ? `${dashboardData.cards.percentage}%`
//         : "0%",
//     },
//   ];

//   const formattedDate = viewDate.toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });

//   const isToday = viewDate.toDateString() === new Date().toDateString();

//   return (
//     <div className="flex w-full h-fit lg:pb-5 p-2 max-md:p-0 max-md:bg-[#f4f5f6] min-h-screen">
//       <div
//         className={`flex flex-col gap-2 max-md:p-4 max-md:gap-4 ${hideRightSection ? "w-full" : "w-[68%]"} max-md:w-full`}
//       >
//         {!showSubjectAttendanceTable && !showSubjectAttendanceDetails && (
//           <>
//             <div className="mb-5 max-md:mb-0">
//               <h1 className="text-[#282828] font-bold text-2xl mb-1 max-md:text-[22px]">
//                 {t("Attendance")}
//               </h1>
//               <p className="text-[#282828] text-sm max-md:text-[13px] max-md:text-gray-600">
//                 {t(
//                   "Track, Manage, and Maintain Your wards Attendance Effortlessly",
//                 )}
//               </p>
//             </div>

//             {dataLoading ? (
//               <DashboardSkeleton />
//             ) : (
//               <div className="flex gap-4 flex-wrap max-md:grid max-md:grid-cols-[1fr_1fr] max-md:gap-3">
//                 {/* Responsive Left Grid for mobile */}
//                 <div className="contents max-md:flex max-md:flex-col max-md:gap-3">
//                   {dynamicCards.map((card, index) => (
//                     <div key={card.id}>
//                       <CardComponent
//                         style={card.style}
//                         icon={card.icon}
//                         value={card.value}
//                         label={card.label}
//                         iconBgColor={card.iconBgColor}
//                         iconColor={card.iconColor}
//                         underlineValue={card.underlineValue}
//                         totalPercentage={card.totalPercentage}
//                         onClick={() => handleCardClick(card.id)}
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 {/* Right Semester Card for mobile */}
//                 <div className="max-md:w-full">
//                   <SemesterAttendanceCard
//                     presentPercent={dashboardData?.semesterStats.present || 0}
//                     absentPercent={dashboardData?.semesterStats.absent || 0}
//                     leavePercent={dashboardData?.semesterStats.leave || 0}
//                     overallPercent={dashboardData?.semesterStats.present || 0}
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="my-2 max-md:my-0">
//               <AiAttendanceNotificationBanner
//                 className="h-auto min-h-[90px] max-md:min-h-[70px] max-md:py-4"
//                 message={
//                   <>
//                     🎉 Great job, {dashboardData?.studentName || "Shravani"}!
//                     You&apos;re eligible for exams. Keep maintaining your streak
//                     attend your next <span className="font-bold">2</span>{" "}
//                     classes to stay safe above{" "}
//                     <span className="font-bold">85%</span>!
//                   </>
//                 }
//               />
//             </div>

//             <div className="flex flex-col max-md:bg-white max-md:p-3 max-md:rounded-xl max-md:shadow-sm">
//               <h5 className="text-[#282828] font-medium text-md max-md:font-semibold max-md:text-[17px]">
//                 {isToday
//                   ? t("Todays Attendance")
//                   : t("Attendance – {date}", { date: formattedDate })}
//               </h5>
//               <p className="text-[#282828] text-sm max-md:hidden">
//                 {t("Classes on {date}", { date: formattedDate })}
//               </p>

//               {dataLoading ? (
//                 <div className="mt-5">
//                   <TableSkeleton />
//                 </div>
//               ) : (
//                 <>
//                   {/* 🖥️ DESKTOP VIEW: Standard Table */}
//                   <div className="hidden md:block mt-3">
//                     <Table columns={columns} data={tableRows} />
//                   </div>

//                   {/* 📱 MOBILE VIEW: Framer Motion Accordion */}
//                   <div className="block md:hidden flex-col gap-2 mt-3 w-full">
//                     {tableRows.map((row, i) => {
//                       const isExpanded = expandedRow === i;
//                       return (
//                         <div
//                           key={i}
//                           className="bg-white border-b border-gray-100 overflow-hidden last:border-b-0"
//                         >
//                           <div
//                             className="py-3 flex justify-between items-center cursor-pointer"
//                             onClick={() =>
//                               setExpandedRow(isExpanded ? null : i)
//                             }
//                           >
//                             <div className="flex flex-col gap-0.5">
//                               <span className="text-[#515151] text-[11px]">
//                                 {t("Subject")}
//                               </span>
//                               <span className="text-[14px] text-[#282828] font-medium pr-2 truncate">
//                                 {row.Subject}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2 shrink-0">
//                               <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[8px] font-bold">
//                                 PDF
//                               </div>
//                               <div
//                                 className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[#43C17A] text-white`}
//                               >
//                                 <CaretDown
//                                   size={14}
//                                   weight="bold"
//                                   className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
//                                 />
//                               </div>
//                             </div>
//                           </div>

//                           <AnimatePresence initial={false}>
//                             {isExpanded && (
//                               <motion.div
//                                 initial={{ height: 0, opacity: 0 }}
//                                 animate={{ height: "auto", opacity: 1 }}
//                                 exit={{ height: 0, opacity: 0 }}
//                                 transition={{ duration: 0.3 }}
//                                 className="pb-3 text-[13px] flex flex-col gap-2.5"
//                               >
//                                 <div className="flex justify-between items-center">
//                                   <span className="text-[#282828] font-medium">
//                                     {t("Faculty")}
//                                   </span>
//                                   <span className="text-gray-600">
//                                     {row.Faculty}
//                                   </span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                   <span className="text-[#282828] font-medium">
//                                     {t("Todays Status")}
//                                   </span>
//                                   <span className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] font-semibold rounded-full">
//                                     {row["Todays Status"]}
//                                   </span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                   <span className="text-[#282828] font-medium">
//                                     {t("Class Attendance")}
//                                   </span>
//                                   <span className="text-gray-600">
//                                     {row["Class Attendance"]}
//                                   </span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                   <span className="text-[#282828] font-medium">
//                                     {t("Percentage %")}
//                                   </span>
//                                   <span className="text-gray-600">
//                                     {row["Percentage %"]}
//                                   </span>
//                                 </div>
//                               </motion.div>
//                             )}
//                           </AnimatePresence>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {totalPages > 1 && (
//                     <div className="flex justify-end items-center gap-3 mt-6 mb-4 w-full">
//                       <button
//                         onClick={() =>
//                           setCurrentPage((p) => Math.max(1, p - 1))
//                         }
//                         disabled={currentPage === 1}
//                         className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//                       >
//                         ‹
//                       </button>
//                       {[...Array(totalPages)].map((_, i) => (
//                         <button
//                           key={i}
//                           onClick={() => setCurrentPage(i + 1)}
//                           className={`w-10 h-10 rounded-lg font-semibold max-md:w-8 max-md:h-8 ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//                         >
//                           {i + 1}
//                         </button>
//                       ))}
//                       <button
//                         onClick={() =>
//                           setCurrentPage((p) => Math.min(totalPages, p + 1))
//                         }
//                         disabled={currentPage === totalPages}
//                         className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//                       >
//                         ›
//                       </button>
//                     </div>
//                   )}
//                   {tableRows.length === 0 && (
//                     <p className="text-gray-400 italic text-sm mt-4 text-center border p-4 rounded-lg">
//                       {t("No classes scheduled for {date}", {
//                         date: formattedDate,
//                       })}
//                     </p>
//                   )}
//                 </>
//               )}
//             </div>
//           </>
//         )}

//         {showSubjectAttendanceTable && <ParentSubjectAttendance />}
//         {showSubjectAttendanceDetails && <ParentSubjectAttendanceDetails />}
//       </div>

//       {!hideRightSection && (
//         <div className="w-[32%] flex-col gap-1.5 p-2 pr-0 pt-0 flex max-md:hidden">
//           <CourseScheduleCard isVisibile={false} />
//           <WorkWeekCalendar activeDate={viewDate} onDateSelect={setViewDate} />
//           <div className="mt-5">
//             <AttendanceInsight
//               weeklyData={dashboardData?.weeklyData || [0, 0, 0, 0, 0, 0, 0]}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
