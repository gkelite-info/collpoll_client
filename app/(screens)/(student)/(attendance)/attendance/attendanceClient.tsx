"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AttendanceInsight from "@/app/utils/insightChart";
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
import Table from "@/app/utils/table";
import { Chalkboard, UsersThree, CaretDown } from "@phosphor-icons/react";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import SubjectAttendance from "../../(attendance)/subject-attendance/page";
import SubjectAttendanceDetails from "../../(attendance)/subject-attendance-details/page";
import { useUser } from "@/app/utils/context/UserContext";
import {
  TableSkeleton,
} from "../shimmer/attendanceDashSkeleton";
import MainAttendanceShimmer, {
  AttendanceInsightShimmer,
} from "../shimmer/mainAttendanceShimmer";
import { getStudentDashboardData } from "@/lib/helpers/student/attendance/studentAttendanceActions";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { useTranslations } from "next-intl";
import AiAttendanceNotificationBanner from "@/app/utils/AiAttendanceNotificationBanner";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type DashboardData = Awaited<ReturnType<typeof getStudentDashboardData>>;

interface TableRow {
  Subject: string;
  Faculty: string;
  "Today's Status": React.ReactNode;
  "Class Attendance": string;
}

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "leave":
      return "text-[#FFBB70] font-medium";
    case "present":
      return "text-[#43C17A]";
    case "absent":
      return "text-[#FF2020]";
    default:
      return "text-gray-600";
  }
}

function formatAttendanceStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Attendance.student");
  const label = formatAttendanceStatus(status);

  if (status === "CLASS_CANCEL") {
    return (
      <span
        style={{
          background: "#F3F4F6",
          color: "#6B7280",
          padding: "2px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        {t(label)}
      </span>
    );
  }
  return <span>{t(label)}</span>;
}

export default function AttendanceClient() {
  const t = useTranslations("Attendance.student");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const tab = searchParams.get("tab");
  const previousTabRef = useRef(tab);
  const showSubjectAttendanceTable = tab === "subject-attendance";
  const showSubjectAttendanceDetails = tab === "subject-attendance-details";
  const hideRightSection =
    showSubjectAttendanceTable || showSubjectAttendanceDetails;
  const [dataLoading, setDataLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const { collegeEducationType, loading: studentLoading } = useStudent();
  const isInter = collegeEducationType === "Inter";
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const showDashboardLoading =
    dataLoading || (!tab && Boolean(previousTabRef.current));

  useEffect(() => {
    previousTabRef.current = tab;
  }, [tab]);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const [, setTableLoading] = useState(false);

  const columns = [
    t("Subject"),
    t("Faculty"),
    t("Today's Status"),
  ];

  useEffect(() => {
    if (userLoading || studentLoading) return;
    if (!userId) {
      setDataLoading(false);
      return;
    }
    let isMounted = true;
    async function fetchData() {
      try {
        setDataLoading(true);
        setTableLoading(true);

        const year = viewDate.getFullYear();
        const month = String(viewDate.getMonth() + 1).padStart(2, "0");
        const day = String(viewDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const safeUserId = userId!;

        const data = await getStudentDashboardData(
          safeUserId,
          dateStr,
          currentPage,
          rowsPerPage,
          isInter,
        );

        if (isMounted) {
          setDashboardData(data);
          setTotalRecords(data.totalCount || 0);
        }
      } catch {
      } finally {
        if (isMounted) {
          setDataLoading(false);
          setTableLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [
    userId,
    viewDate,
    currentPage,
    isInter,
    userLoading,
    studentLoading,
    tab,
  ]);

  const handleCardClick = (cardId: number) => {
    if (cardId === 2) {
      router.push(`/attendance?tab=subject-attendance`);
    }
  };

  const tableRows: TableRow[] =
    dashboardData?.tableData?.map((row) => ({
      Subject: row.subject,
      Faculty: row.faculty,
      "Today's Status": (
        <span className={getStatusClass(row.status)}>
          <StatusBadge status={row.status} />
        </span>
      ),
      "Class Attendance": row.classAttendance,
    })) || [];

  const todayAttendancePercentage = dashboardData?.todayStats.total
    ? Math.round(
        (dashboardData.todayStats.attended /
          dashboardData.todayStats.total) *
          100,
      )
    : 0;

  const dynamicCards = [
    {
      id: 1,
      icon: <UsersThree size={32} />,
      value: dashboardData
        ? `${dashboardData.todayStats.attended}/${dashboardData.todayStats.total}`
        : "0/0",
      label: (
        <>
          {t("Today Total Classes")}
          <span className="block whitespace-nowrap text-[11px] tracking-tight max-md:whitespace-normal">
            Present Classes / Total Classes
          </span>
        </>
      ),
      style: "bg-[#FFEDDA] w-full",
      iconBgColor: "#FFBB70",
      iconColor: "#EFEFEF",
      totalPercentage: `${todayAttendancePercentage}%`,
      totalPercentageColor: "#282828",
    },
    {
      id: 2,
      icon: <Chalkboard size={32} />,
      value: dashboardData
        ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
        : "0/0",
      label: (
        <>
          {t("Sem Attendance")}
          <span className="block whitespace-nowrap text-[11px] tracking-tight max-md:whitespace-normal">
            Present Classes / Total Classes
          </span>
        </>
      ),
      style:
        "bg-[#C6E0FF] w-full ring-2 ring-[#7764FF]/25 shadow-md",
      iconBgColor: "#7764FF",
      iconColor: "#EFEFEF",
    },
  ];

  const formattedDate = viewDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isToday = viewDate.toDateString() === new Date().toDateString();

  return (
    <>
      <div className="flex w-full h-fit lg:pb-5 p-2 max-md:p-0 max-md:bg-[#f4f5f6] min-h-screen">
        <div
          className={`flex flex-col gap-2 max-md:p-4 max-md:gap-4 ${hideRightSection ? "w-full" : "w-[68%]"
            } max-md:w-full`}
        >
          {!showSubjectAttendanceTable && !showSubjectAttendanceDetails && (
            <>
              <div className="mb-5 max-md:mb-0">
                <h1 className="text-[#282828] font-bold text-2xl mb-1 max-md:text-[22px]">
                  {t("Attendance")}
                </h1>
                <p className="text-[#282828] text-sm max-md:text-[13px] max-md:text-gray-600">
                  {t(
                    "Track, manage, and maintain your attendance effortlessly",
                  )}
                </p>
              </div>

              {showDashboardLoading ? (
                <MainAttendanceShimmer />
              ) : (
                <div className="grid w-[90%] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)] gap-4 max-md:w-full max-md:grid-cols-[1fr_1fr] max-md:gap-3">
                  <div className="contents max-md:flex max-md:flex-col max-md:gap-3">
                    {dynamicCards.map((card) => (
                      <div key={card.id}>
                        <CardComponent
                          style={card.style}
                          icon={card.icon}
                          value={card.value}
                          label={card.label}
                          iconBgColor={card.iconBgColor}
                          iconColor={card.iconColor}
                          totalPercentage={card.totalPercentage}
                          totalPercentageColor={card.totalPercentageColor}
                          onClick={
                            card.id === 2
                              ? () => handleCardClick(card.id)
                              : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="max-md:w-full">
                    <SemesterAttendanceCard
                      presentPercent={dashboardData?.semesterStats.present || 0}
                      absentPercent={dashboardData?.semesterStats.absent || 0}
                      leavePercent={dashboardData?.semesterStats.leave || 0}
                      overallPercent={dashboardData?.cards.percentage || 0}
                      title={t("Sem Attendance")}
                      percentageClassName="font-normal"
                    />
                  </div>
                </div>
              )}

              <div className="my-2 max-md:my-0">
                <AiAttendanceNotificationBanner
                  className="h-auto min-h-[90px] max-md:min-h-[70px] max-md:py-4"
                  message={
                    dashboardData?.attendancePolicyInsight?.message ||
                    "Attendance insight will appear once records are available."
                  }
                />
              </div>

              <div className="flex flex-col max-md:p-3 ">
                <h5 className="text-[#282828] font-medium text-md max-md:font-semibold max-md:text-[17px]">
                  {isToday
                    ? t("Today's Attendance")
                    : t("Attendance – {date}", { date: formattedDate })}
                </h5>
                <p className="text-[#282828] text-sm max-md:hidden">
                  {t("Classes on {date}", { date: formattedDate })}
                </p>
                {showDashboardLoading ? (
                  <div className="mt-5">
                    <TableSkeleton />
                  </div>
                ) : (
                  <>
                    {/* 🖥️ DESKTOP VIEW: Standard Table */}
                    <div className="hidden md:block mt-3">
                      <Table columns={columns} data={tableRows} />
                    </div>

                    {/* 📱 MOBILE VIEW: Framer Motion Accordion */}
                    <div className="block md:hidden flex-col gap-2 mt-3 w-full">
                      {tableRows.map((row, i) => {
                        const isExpanded = expandedRow === i;
                        return (
                          <div
                            key={i}
                            className="border-b border-gray-100 overflow-hidden last:border-b-0"
                          >
                            <div
                              className="py-3 flex justify-between items-center cursor-pointer"
                              onClick={() =>
                                setExpandedRow(isExpanded ? null : i)
                              }
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[#515151] text-[11px]">
                                  {t("Subject Name")}
                                </span>
                                <span className="text-[14px] text-[#282828] font-medium pr-2 truncate">
                                  {row.Subject}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[8px] font-bold">
                                  PDF
                                </div>
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-[#43C17A] text-white" : "bg-[#43C17A] text-white"}`}
                                >
                                  <CaretDown
                                    size={14}
                                    weight="bold"
                                    className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </div>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="pb-3 text-[13px] flex flex-col gap-2.5"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-[#282828] font-medium">
                                      {t("Faculty")}
                                    </span>
                                    <span className="text-gray-600">
                                      {row.Faculty}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[#282828] font-medium">
                                      {t("Today's Status")}
                                    </span>
                                    <span className="px-3 py-0.5 bg-[#DCEAE2] rounded-full">
                                      {row["Today's Status"]}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[#282828] font-medium">
                                      {t("Class Attendance")}
                                    </span>
                                    <span className="text-gray-600">
                                      {row["Class Attendance"]}
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {false && totalPages > 1 && (
                      <div className="flex justify-end items-center gap-3 mt-6 mb-4 w-full">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border
      ${currentPage === 1
                              ? "border-gray-200 text-gray-300"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          ‹
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-lg font-semibold max-md:w-8 max-md:h-8
        ${currentPage === i + 1
                                ? "bg-[#16284F] text-white"
                                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                              }`}
                          >
                            {i + 1}
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border
      ${currentPage === totalPages
                              ? "border-gray-200 text-gray-300"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          ›
                        </button>
                      </div>
                    )}

                    {totalRecords > 0 && (
                      <div className="mt-6 mb-4 w-full">
                        <Pagination
                          currentPage={currentPage}
                          totalItems={totalRecords}
                          itemsPerPage={rowsPerPage}
                          onPageChange={setCurrentPage}
                          alwaysShow
                        />
                      </div>
                    )}

                    {tableRows.length === 0 && (
                      <p className="text-gray-400 italic text-sm mt-4 text-center border p-4 rounded-lg">
                        No Data Available
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {showSubjectAttendanceTable && <SubjectAttendance />}
          {showSubjectAttendanceDetails && <SubjectAttendanceDetails />}
        </div>

        {!hideRightSection && (
          <div className="w-[32%] flex-col gap-1.5 p-2 pr-0 pt-0 flex max-md:hidden">
            <CourseScheduleCard />
            <WorkWeekCalendar
              activeDate={viewDate}
              onDateSelect={(date) => {
                setCurrentPage(1);
                setViewDate(date);
              }}
            />
            <div className="mt-5">
              {showDashboardLoading ? (
                <AttendanceInsightShimmer />
              ) : (
                <AttendanceInsight
                  weeklyData={
                    dashboardData?.weeklyData || [0, 0, 0, 0, 0, 0, 0]
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
