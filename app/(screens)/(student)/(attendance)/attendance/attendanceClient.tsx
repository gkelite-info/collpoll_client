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
import SubjectAttendance from "../../(attendance)/subject-attendance/page";
import SubjectAttendanceDetails from "../../(attendance)/subject-attendance-details/page";
import { useUser } from "@/app/utils/context/UserContext";
import { DashboardSkeleton, TableSkeleton } from "../shimmer/attendanceDashSkeleton";
import { getStudentDashboardData } from "@/lib/helpers/student/attendance/studentAttendanceActions";
import { useStudent } from "@/app/utils/context/student/useStudent";

interface TableRow {
  Subject: string;
  Faculty: string;
  "Today's Status": React.ReactNode;
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

const columns = ["Subject", "Faculty", "Today's Status", "Percentage %"];

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
        {label}
      </span>
    );
  }
  return <span>{label}</span>;
}

export default function AttendanceClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const tab = searchParams.get("tab");
  const showSubjectAttendanceTable = tab === "subject-attendance";
  const showSubjectAttendanceDetails = tab === "subject-attendance-details";
  const hideRightSection = showSubjectAttendanceTable || showSubjectAttendanceDetails;
  const [dataLoading, setDataLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { collegeEducationType, loading: studentLoading } = useStudent();
  const isInter = collegeEducationType === "Inter";
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const [tableLoading, setTableLoading] = useState(false);

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
      } catch (err) {
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
  }, [userId, viewDate, currentPage, isInter, userLoading, studentLoading]);

  const handleCardClick = (cardId: number) => {
    if (cardId === 2) {
      router.push(`/attendance?tab=subject-attendance`);
    }
  };

  const tableRows: TableRow[] =
    dashboardData?.tableData?.map((row: any) => ({
      Subject: row.subject,
      Faculty: row.faculty,
      "Today's Status": (
        <span className={getStatusClass(row.status)}>
          {formatAttendanceStatus(row.status)}
        </span>
      ),
      "Class Attendance": row.classAttendance,
      "Percentage %": row.percentage,
    })) || [];

  const dynamicCards: CardItem[] = [
    {
      id: 1,
      icon: <UsersThree size={32} />,
      value: dashboardData
        ? `${dashboardData.todayStats.attended}/${dashboardData.todayStats.total}`
        : "0/0",
      label: "Today Total Classes",
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
      label: "Semester wise Attendance",
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
    <>
      <div className="bg-red-00 flex w-full h-fit lg:pb-5 p-2">
        <div
          className={`flex flex-col gap-2 ${hideRightSection ? "w-full" : "w-[68%]"
            }`}
        >
          {!showSubjectAttendanceTable && !showSubjectAttendanceDetails && (
            <>
              <div className="mb-5">
                <h1 className="text-[#282828] font-bold text-2xl mb-1">
                  Attendance
                </h1>
                <p className="text-[#282828] text-sm">
                  Track, manage, and maintain your attendance effortlessly
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
                        onClick={
                          card.id === 2
                            ? () => handleCardClick(card.id)
                            : undefined
                        }
                      />
                    </div>
                  ))}
                  <SemesterAttendanceCard
                    presentPercent={dashboardData?.semesterStats.present || 0}
                    absentPercent={dashboardData?.semesterStats.absent || 0}
                    leavePercent={dashboardData?.semesterStats.leave || 0}
                    overallPercent={dashboardData?.cards.percentage || 0}
                  />
                </div>
              )}

              <div className="bg-red-00 flex flex-col">
                <h5 className="text-[#282828] font-medium text-md">
                  {isToday
                    ? "Today's Attendance"
                    : `Attendance – ${formattedDate}`}
                </h5>
                <p className="text-[#282828] text-sm">
                  Classes on {formattedDate}
                </p>
                {dataLoading ? (
                  <div className=" mt-5">
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
                            className={`w-10 h-10 rounded-lg font-semibold
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

                    {tableRows.length === 0 && (
                      <p className="text-gray-400 italic text-sm mt-4 text-center border p-4 rounded-lg">
                        No classes scheduled for {formattedDate}.
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
          <div className="bg-blue-00 w-[32%] flex flex-col gap-1.5 p-2 pr-0 pt-0">
            <CourseScheduleCard />

            <WorkWeekCalendar
              activeDate={viewDate}
              onDateSelect={setViewDate}
            />

            <div className="mt-5">
              <AttendanceInsight
                weeklyData={dashboardData?.weeklyData || [0, 0, 0, 0, 0, 0, 0]}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
