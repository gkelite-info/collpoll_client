"use client";

import CardComponent from "@/app/utils/card";
import { useUser } from "@/app/utils/context/UserContext";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TableComponent from "@/app/utils/table/table";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { getParentAttendanceDetails } from "@/lib/helpers/parent/attendance/parentAttendanceActions";
import { CaretLeft, Chalkboard, FilePdf, Percent } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  SubjectAttendanceDetailsSkeleton,
  TableSkeleton,
} from "../shimmer/attendanceSkeletons";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
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

type AttendanceTableRow = {
  date: string;
  time: string;
  rawStatus: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  status: React.ReactNode;
  reason: string;
  notes: React.ReactNode;
};

function normalizeStatus(status: string) {
  if (status === "PRESENT") return "Present";
  if (status === "ABSENT") return "Absent";
  if (status === "LATE") return "Late";
  if (status === "LEAVE") return "Leave";
  return status;
}

const StatusBadge = ({ status }: { status: string }) => {
  const t = useTranslations("Attendance.parent");
  let bg = "",
    color = "";
  switch (status) {
    case "Present":
      bg = "#43C17A3D";
      color = "#00A652";
      break;
    case "Absent":
      bg = "#FFE0E0";
      color = "#FF2020";
      break;
    case "Late":
      bg = "#FFEDDA";
      color = "#FFBB70";
      break;
    default:
      bg = "#E5E5E5";
      color = "#525252";
  }
  return (
    <div className="flex justify-center w-full">
      <div
        className="w-[90px] h-[28px] flex items-center justify-center rounded-lg text-sm font-medium"
        style={{ backgroundColor: bg, color: color }}
      >
        {t(status)}
      </div>
    </div>
  );
};

function ParentSubjectAttendanceDetails() {
  type ViewFilter = "ALL" | "ATTENDED" | "ABSENT";
  const t = useTranslations("Attendance.parent"); // Hook

  const [activeView, setActiveView] = useState<ViewFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const router = useRouter();
  const { userId } = useUser();
  const searchParams = useSearchParams();
  const subjectId = Number(searchParams.get("subjectId"));

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!userId || !subjectId) return;

    async function loadDetails() {
      try {
        setLoading(true);
        const res = await getParentAttendanceDetails({
          userId: userId!,
          subjectId,
          statusFilter: activeView,
          page: currentPage,
          limit: rowsPerPage,
        });
        setData(res);
        setTotalRecords(res.totalCount || 0);
      } catch (err) {
        console.error("Failed to load attendance details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [userId, subjectId, activeView, currentPage]);

  const cards: CardItem[] = [
    {
      id: 1,
      icon: <Chalkboard size={30} weight="fill" />,
      value: data?.headerStats.total ?? 0,
      label: t("Total Classes"),
      style: "bg-[#E2DAFF] w-[182px]",
      iconBgColor: "#714EF2",
      iconColor: "#EFEFEF",
    },
    {
      id: 2,
      icon: <Chalkboard size={30} weight="fill" />,
      value: data?.headerStats.attended ?? 0,
      label: t("Attended"),
      style: "bg-[#FFEDDA] w-[182px]",
      iconBgColor: "#FFBC72",
      iconColor: "#EFEFEF",
    },
    {
      id: 3,
      icon: <Chalkboard size={30} weight="fill" />,
      value: data?.headerStats.absent ?? 0,
      label: t("Absent"),
      style: "bg-[#FFE6E6] w-[182px]",
      iconBgColor: "#F62D2D",
      iconColor: "#EFEFEF",
    },
    {
      id: 4,
      icon: <Percent size={30} weight="fill" />,
      value: `${data?.headerStats.percentage ?? 0}%`,
      label: t("Attendance"),
      style: "bg-[#CEE6FF] w-[182px]",
      iconBgColor: "#60AEFF",
      iconColor: "#EFEFEF",
    },
  ];

  const attendanceText = `${t("Classes Held:")} ${data?.headerStats.total ?? 0} | ${t("Attended:")} ${data?.headerStats.attended ?? 0} | ${t("Missed:")} ${data?.headerStats.absent ?? 0} | ${data?.headerStats.percentage ?? 0}%`;

  const columns = [
    { title: t("Date"), key: "date" },
    { title: t("Time"), key: "time" },
    { title: t("Status"), key: "status" },
    { title: t("Reason"), key: "reason" },
    { title: t("Notes"), key: "notes" },
  ];

  const tableData: AttendanceTableRow[] =
    data?.rows.map((r: any) => ({
      date: r.date,
      time: r.time,
      rawStatus: r.status,
      status: <StatusBadge status={normalizeStatus(r.status)} />,
      reason: r.reason,
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    })) ?? [];

  const filteredTableData = (() => {
    if (activeView === "ATTENDED")
      return tableData.filter(
        (r) => r.rawStatus === "PRESENT" || r.rawStatus === "LATE",
      );
    if (activeView === "ABSENT")
      return tableData.filter((r) => r.rawStatus === "ABSENT");
    return tableData;
  })();

  const handleBack = () => {
    // router.push("/parent/attendance?tab=subject-attendance");
    router.back();
  };

  if (loading && !data) {
    return <SubjectAttendanceDetailsSkeleton />;
  }

  return (
    <div className="flex flex-col pb-3">
      <div className="flex justify-between items-center">
        <div className="flex flex-col w-[50%]">
          <div className="flex gap-0 items-center">
            <button onClick={handleBack} className="cursor-pointer">
              <CaretLeft
                size={23}
                className="cursor-pointer text-black -ml-1.5"
              />
            </button>
            <h1 className="text-[#282828] font-bold text-2xl">
              {t("Attendance")}
            </h1>
          </div>
          <p className="text-[#282828]">
            {t(
              "Track, manage, and maintain your wards attendance effortlessly",
            )}
          </p>
        </div>
        <div className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" isVisibile={false} />
        </div>
      </div>

      <div className="w-full h-[170px] mt-4 grid grid-cols-[68%_32%] items-start gap-2">
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => {
                if (index === 0) setActiveView("ALL");
                if (index === 1) setActiveView("ATTENDED");
                if (index === 2) setActiveView("ABSENT");
              }}
            >
              <CardComponent
                style={card.style}
                icon={card.icon}
                value={card.value}
                label={card.label}
                iconBgColor={card.iconBgColor}
                iconColor={card.iconColor}
                underlineValue={card.underlineValue}
                totalPercentage={card.totalPercentage}
              />
            </div>
          ))}
        </div>
        <WorkWeekCalendar style="w-[365px] mt-0" />
      </div>

      <div className="my-2 w-[68%]">
        <AiAttendanceNotificationBanner
          className="h-auto min-h-[90px]"
          message={
            <>
              🎉 Great job, "Shravani"! You&apos;re eligible for exams. Keep
              maintaining your streak attend your next{" "}
              <span className="font-bold">2</span> classes to stay safe above{" "}
              <span className="font-bold">85%</span>!
            </>
          }
        />
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="w-full flex flex-col items-start">
          <h4 className="text-[#282828] font-medium">
            {t("Subject Detail View")}
          </h4>
          <div className="bg-blue-00 w-full mt-2 flex items-center">
            <div className="flex items-center gap-1">
              <h5 className="text-[#525252] text-sm">{t("Subject :")}</h5>
              <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                <p className="text-sm text-[#43C17A] font-medium">
                  {data?.subjectName ?? "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-6">
              <h5 className="text-[#525252] text-sm">{t("Faculty :")}</h5>
              <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                <p className="text-sm text-[#43C17A] font-medium">
                  {data?.facultyName ?? "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-6">
              <h5 className="text-[#525252] text-sm">{t("Attendance :")}</h5>
              <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                <p className="text-sm text-[#43C17A] font-medium">
                  {attendanceText}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 w-[85%]">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <>
              <TableComponent
                columns={columns}
                tableData={filteredTableData}
                isLoading={false}
              />

              {totalPages > 1 && (
                <div className="flex justify-end items-center gap-3 mt-6">
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p - 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubjectAttendanceDetails() {
  return (
    <Suspense fallback={<Loader />}>
      <ParentSubjectAttendanceDetails />
    </Suspense>
  );
}

// "use client";

// import CardComponent from "@/app/utils/card";
// import { useUser } from "@/app/utils/context/UserContext";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import TableComponent from "@/app/utils/table/table";
// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import { getParentAttendanceDetails } from "@/lib/helpers/parent/attendance/parentAttendanceActions";
// import {
//   CaretLeft,
//   CaretDown,
//   Chalkboard,
//   FilePdf,
//   Percent,
// } from "@phosphor-icons/react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense, useEffect, useState } from "react";
// import { SubjectAttendanceDetailsSkeleton } from "../shimmer/attendanceSkeletons";
// import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
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

// type AttendanceTableRow = {
//   date: string;
//   time: string;
//   rawStatus: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
//   status: React.ReactNode;
//   reason: string;
//   notes: React.ReactNode;
// };

// function normalizeStatus(status: string) {
//   if (status === "PRESENT") return "Present";
//   if (status === "ABSENT") return "Absent";
//   if (status === "LATE") return "Late";
//   if (status === "LEAVE") return "Leave";
//   return status;
// }

// const StatusBadge = ({ status }: { status: string }) => {
//   const t = useTranslations("Attendance.parent");
//   let bg = "",
//     color = "";
//   switch (status) {
//     case "Present":
//       bg = "#43C17A3D";
//       color = "#00A652";
//       break;
//     case "Absent":
//       bg = "#FFE0E0";
//       color = "#FF2020";
//       break;
//     case "Late":
//       bg = "#FFEDDA";
//       color = "#FFBB70";
//       break;
//     default:
//       bg = "#E5E5E5";
//       color = "#525252";
//   }
//   return (
//     <div className="flex justify-center w-full">
//       <div
//         className="w-[90px] h-[28px] max-md:w-[70px] max-md:h-[24px] max-md:text-[11px] flex items-center justify-center rounded-lg text-sm font-medium"
//         style={{ backgroundColor: bg, color: color }}
//       >
//         {t(status)}
//       </div>
//     </div>
//   );
// };

// function ParentSubjectAttendanceDetailsClient() {
//   type ViewFilter = "ALL" | "ATTENDED" | "ABSENT";
//   const t = useTranslations("Attendance.parent"); // Hook

//   const [activeView, setActiveView] = useState<ViewFilter>("ALL");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [expandedRow, setExpandedRow] = useState<number | null>(null);

//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(totalRecords / rowsPerPage);

//   const router = useRouter();
//   const { userId } = useUser();
//   const searchParams = useSearchParams();
//   const subjectId = Number(searchParams.get("subjectId"));

//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState<any>(null);

//   useEffect(() => {
//     if (!userId || !subjectId) return;

//     async function loadDetails() {
//       try {
//         setLoading(true);
//         const res = await getParentAttendanceDetails({
//           userId: userId!,
//           subjectId,
//           statusFilter: activeView,
//           page: currentPage,
//           limit: rowsPerPage,
//         });
//         setData(res);
//         setTotalRecords(res.totalCount || 0);
//       } catch (err) {
//         console.error("Failed to load attendance details:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadDetails();
//   }, [userId, subjectId, activeView, currentPage]);

//   const cards: CardItem[] = [
//     {
//       id: 1,
//       icon: <Chalkboard size={30} weight="fill" />,
//       value: data?.headerStats.total ?? 0,
//       label: t("Total Classes"),
//       style: "bg-[#E2DAFF] w-[182px]",
//       iconBgColor: "#714EF2",
//       iconColor: "#EFEFEF",
//     },
//     {
//       id: 2,
//       icon: <Chalkboard size={30} weight="fill" />,
//       value: data?.headerStats.attended ?? 0,
//       label: t("Attended"),
//       style: "bg-[#FFEDDA] w-[182px]",
//       iconBgColor: "#FFBC72",
//       iconColor: "#EFEFEF",
//     },
//     {
//       id: 3,
//       icon: <Chalkboard size={30} weight="fill" />,
//       value: data?.headerStats.absent ?? 0,
//       label: t("Absent"), // Mapped back correctly based on desktop original
//       style: "bg-[#FFE6E6] w-[182px]",
//       iconBgColor: "#F62D2D",
//       iconColor: "#EFEFEF",
//     },
//     {
//       id: 4,
//       icon: <Percent size={30} weight="fill" />,
//       value: `${data?.headerStats.percentage ?? 0}%`,
//       label: t("Attendance"),
//       style: "bg-[#CEE6FF] w-[182px]",
//       iconBgColor: "#60AEFF",
//       iconColor: "#EFEFEF",
//     },
//   ];

//   const attendanceText = `${t("Classes Held:")} ${data?.headerStats.total ?? 0} | ${t("Attended:")} ${data?.headerStats.attended ?? 0} | ${t("Missed:")} ${data?.headerStats.absent ?? 0} | ${data?.headerStats.percentage ?? 0}%`;

//   const columns = [
//     { title: t("Date"), key: "date" },
//     { title: t("Time"), key: "time" },
//     { title: t("Status"), key: "status" },
//     { title: t("Reason"), key: "reason" },
//     { title: t("Notes"), key: "notes" },
//   ];

//   const rawTableData = data?.rows || [];

//   const tableData: AttendanceTableRow[] =
//     data?.rows.map((r: any) => ({
//       date: r.date,
//       time: r.time,
//       rawStatus: r.status,
//       status: <StatusBadge status={normalizeStatus(r.status)} />,
//       reason: r.reason,
//       notes: (
//         <div className="w-full flex justify-center">
//           <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
//             <FilePdf size={20} color="#7557E3" />
//           </div>
//         </div>
//       ),
//     })) ?? [];

//   const filteredTableData = (() => {
//     if (activeView === "ATTENDED")
//       return tableData.filter(
//         (r) => r.rawStatus === "PRESENT" || r.rawStatus === "LATE",
//       );
//     if (activeView === "ABSENT")
//       return tableData.filter((r) => r.rawStatus === "ABSENT");
//     return tableData;
//   })();

//   const handleBack = () => {
//     router.back();
//   };

//   if (loading && !data) {
//     return <SubjectAttendanceDetailsSkeleton />;
//   }

//   return (
//     <div className="flex flex-col pb-3 max-md:pb-0">
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex flex-col w-[50%] max-md:w-full">
//           <div className="flex gap-0 items-center">
//             <button onClick={handleBack} className="cursor-pointer">
//               <CaretLeft
//                 size={23}
//                 className="cursor-pointer text-black -ml-1.5"
//               />
//             </button>
//             <h1 className="text-[#282828] font-bold text-2xl mb-1 max-md:text-[22px]">
//               {t("Attendance")}
//             </h1>
//           </div>
//           <p className="text-[#282828] max-md:text-gray-600 max-md:text-[13px]">
//             {t(
//               "Track, manage, and maintain your wards attendance effortlessly",
//             )}
//           </p>
//         </div>
//         <div className="flex justify-end w-[32%] max-md:hidden">
//           <CourseScheduleCard style="w-[320px]" isVisibile={false} />
//         </div>
//       </div>

//       <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
//         <div className="w-full lg:w-[68%] grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {cards.map((card, index) => (
//             <div
//               key={index}
//               className="cursor-pointer w-full"
//               onClick={() => {
//                 if (index === 0) setActiveView("ALL");
//                 if (index === 1) setActiveView("ATTENDED");
//                 if (index === 2) setActiveView("ABSENT");
//               }}
//             >
//               <CardComponent
//                 style={`${card.style} !w-full`}
//                 icon={card.icon}
//                 value={card.value}
//                 label={card.label}
//                 iconBgColor={card.iconBgColor}
//                 iconColor={card.iconColor}
//                 underlineValue={card.underlineValue}
//                 totalPercentage={card.totalPercentage}
//               />
//             </div>
//           ))}
//         </div>
//         <div className="w-full lg:w-[32%] max-md:hidden">
//           <WorkWeekCalendar style="mt-0 w-full" />
//         </div>
//       </div>

//       <div className="mt-8 flex flex-col items-start max-md:bg-white max-md:p-3 max-md:rounded-xl max-md:shadow-sm">
//         <div className="w-full flex flex-col items-start">
//           <h4 className="text-[#282828] font-medium max-md:font-semibold max-md:text-[17px]">
//             {t("Subject Detail View")}
//           </h4>
//           <div className="bg-blue-00 w-full mt-2 flex flex-wrap items-center gap-y-2 gap-x-6 max-md:gap-x-3 max-md:mt-3">
//             <div className="flex items-center gap-1 max-md:gap-1.5">
//               <h5 className="text-[#525252] text-sm max-md:text-[12px]">
//                 {t("Subject :")}
//               </h5>
//               <div className="rounded-full px-3 max-md:px-2 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
//                 <p className="text-sm max-md:text-[12px] text-[#43C17A] font-medium whitespace-nowrap">
//                   {data?.subjectName ?? "-"}{" "}
//                   <CaretDown className="hidden max-md:inline" size={10} />
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-1 max-md:gap-1.5">
//               <h5 className="text-[#525252] text-sm max-md:text-[12px]">
//                 {t("Faculty :")}
//               </h5>
//               <div className="rounded-full px-3 max-md:px-2 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
//                 <p className="text-sm max-md:text-[12px] text-[#43C17A] font-medium whitespace-nowrap">
//                   {data?.facultyName ?? "-"}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-1 max-md:hidden">
//               <h5 className="text-[#525252] text-sm">{t("Attendance :")}</h5>
//               <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
//                 <p className="text-sm text-[#43C17A] font-medium whitespace-nowrap">
//                   {attendanceText}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="hidden max-md:block my-2 w-full mt-5">
//           <AiAttendanceNotificationBanner
//             className="h-auto min-h-[70px] max-md:py-4"
//             message={
//               <>
//                 🎉 Great job, {data?.studentName || "Shravani"}! You&apos;re
//                 eligible for exams. Keep maintaining your streak attend your
//                 next <span className="font-bold">2</span> classes to stay safe
//                 above <span className="font-bold">85%</span>!
//               </>
//             }
//           />
//         </div>

//         <div className="mt-4 w-[85%] max-md:w-full max-md:mt-3 max-md:overflow-x-auto scrollbar-hide">
//           {/* 🖥️ DESKTOP VIEW */}
//           <div className="hidden md:block max-md:min-w-[400px]">
//             <TableComponent
//               columns={columns}
//               tableData={filteredTableData}
//               isLoading={false}
//             />
//           </div>

//           {/* 📱 MOBILE VIEW: Framer Motion Accordion */}
//           <div className="block md:hidden flex-col gap-2 mt-3 w-full">
//             {rawTableData.map((row: any, i: number) => {
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
//                         {row.date}
//                       </span>
//                       <span className="text-[14px] text-[#282828] font-medium pr-2 truncate">
//                         {row.time}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2 shrink-0">
//                       <StatusBadge status={normalizeStatus(row.status)} />
//                       <div
//                         className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[#43C17A] text-white`}
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
//                         className="pb-3 text-[13px] flex flex-col gap-2.5 mt-2"
//                       >
//                         <div className="flex justify-between items-center">
//                           <span className="text-[#282828] font-medium">
//                             {t("Reason")}
//                           </span>
//                           <span className="text-gray-600">
//                             {row.reason || "-"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-[#282828] font-medium">
//                             {t("Notes")}
//                           </span>
//                           <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
//                             <FilePdf size={16} color="#7557E3" />
//                           </div>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               );
//             })}
//           </div>

//           {totalPages > 1 && (
//             <div className="flex justify-end items-center gap-3 mt-6 mb-4 w-full">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//               >
//                 ‹
//               </button>
//               {[...Array(totalPages)].map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrentPage(i + 1)}
//                   className={`w-10 h-10 rounded-lg font-semibold max-md:w-8 max-md:h-8 ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(totalPages, p - 1))
//                 }
//                 disabled={currentPage === totalPages}
//                 className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
//               >
//                 ›
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function SubjectAttendanceDetails() {
//   return (
//     <Suspense fallback={<Loader />}>
//       <ParentSubjectAttendanceDetailsClient />
//     </Suspense>
//   );
// }
