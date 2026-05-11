"use client";

export const dynamic = "force-dynamic";

import CardComponent from "@/app/utils/card";
import { useUser } from "@/app/utils/context/UserContext";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TableComponent from "@/app/utils/table/table";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { getStudentAttendanceDetails } from "@/lib/helpers/student/attendance/getStudentAttendanceDetails";
import { CaretLeft, Chalkboard, Percent } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import AiAttendanceNotificationBanner from "@/app/utils/AiAttendanceNotificationBanner";

type StudentAttendanceDetails = Awaited<
  ReturnType<typeof getStudentAttendanceDetails>
>;

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
};

function normalizeStatus(status: string) {
  if (status === "PRESENT") return "Present";
  if (status === "ABSENT") return "Absent";
  if (status === "LATE") return "Late";
  if (status === "LEAVE") return "Leave";
  return status;
}

const StatusBadge = ({ status }: { status: string }) => {
  const t = useTranslations("Attendance.student");
  let bg = "";
  let color = "";

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
        className="w-[90px] h-[28px] max-md:w-[70px] max-md:h-[24px] max-md:text-[11px] flex items-center justify-center rounded-lg text-sm font-medium"
        style={{ backgroundColor: bg, color: color }}
      >
        {t(status)}
      </div>
    </div>
  );
};

export default function SubjectAttendanceDetailsClient() {
  type ViewFilter = "ALL" | "ATTENDED" | "ABSENT" | "LEAVE";
  const t = useTranslations("Attendance.student");

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
  const [data, setData] = useState<StudentAttendanceDetails | null>(null);

  useEffect(() => {
    if (!userId || !subjectId) return;

    const safeUserId = userId;

    async function loadDetails() {
      try {
        setLoading(true);

        const res = await getStudentAttendanceDetails({
          userId: safeUserId,
          subjectId,
          statusFilter: activeView,
          page: currentPage,
          limit: rowsPerPage,
        });

        setData(res);
        setTotalRecords(res.totalCount || 0);
      } catch {
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
      value: data?.headerStats.leave ?? 0,
      label: t("Leave"),
      style: "bg-[#E2DAFF] w-[182px]",
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

  const subjectName = data?.subjectName ?? "-";
  const facultyName = data?.facultyName ?? "-";

  const totalStr = data?.headerStats.total ?? 0;
  const attendedStr = data?.headerStats.attended ?? 0;
  const missedStr = data?.headerStats.absent ?? 0;
  const percentageStr = data?.headerStats.percentage ?? 0;

  const attendanceText = `${t("Classes Held")}: ${totalStr} | ${t("Attended")}: ${attendedStr} | ${t("Missed")}: ${missedStr} | %: ${percentageStr}%`;

  const columns = [
    { title: t("Date"), key: "date" },
    { title: t("Time"), key: "time" },
    { title: t("Status"), key: "status" },
  ];

  const tableData: AttendanceTableRow[] =
    data?.rows.map((r) => ({
      date: r.date,
      time: r.time,
      rawStatus: r.status as AttendanceTableRow["rawStatus"],
      status: <StatusBadge status={normalizeStatus(r.status)} />,
      reason: r.reason,
    })) ?? [];

  const filteredTableData = (() => {
    if (activeView === "ATTENDED") {
      return tableData.filter(
        (r) => r.rawStatus === "PRESENT" || r.rawStatus === "LATE",
      );
    }

    if (activeView === "ABSENT") {
      return tableData.filter((r) => r.rawStatus === "ABSENT");
    }

    if (activeView === "LEAVE") {
      return tableData.filter((r) => r.rawStatus === "LEAVE");
    }

    return tableData;
  })();

  const handleBack = () => {
    router.push("/attendance?tab=subject-attendance");
  };

  return (
    <div className="flex flex-col pb-3 max-md:pb-0">
      <div className="flex justify-between items-center">
        <div className="flex flex-col w-[50%] max-md:w-full">
          <div className="flex gap-0 items-center">
            <button onClick={handleBack} className="cursor-pointer">
              <CaretLeft
                size={23}
                className="cursor-pointer text-black -ml-1.5"
              />
            </button>
            <h1 className="text-[#282828] font-bold text-2xl mb-1 max-md:text-[22px]">
              {t("Attendance")}
            </h1>
          </div>
          <p className="text-[#282828] max-md:text-gray-600 max-md:text-[13px]">
            {t("Track, manage, and maintain your attendance effortlessly")}
          </p>
        </div>

        <div className="flex justify-end w-[32%] max-md:hidden">
          <CourseScheduleCard style="w-[320px]" />
        </div>
      </div>

      <div className="w-full mt-4 grid lg:grid-cols-[68%_32%] gap-3 max-md:flex max-md:flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 max-md:grid-cols-2 max-md:gap-3 w-full">
          {cards.map((card, index) => {
            return (
              <div
                key={index}
                className="cursor-pointer max-md:w-full"
                onClick={() => {
                  if (index === 0) setActiveView("ALL");
                  if (index === 1) setActiveView("ATTENDED");
                  if (index === 2) setActiveView("LEAVE");
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
            );
          })}
        </div>
        <WorkWeekCalendar style="mt-0 w-[360px] max-md:hidden" />
      </div>

      <div className="my-2 w-[68%] max-md:w-full">
        <AiAttendanceNotificationBanner
          className="h-auto min-h-[90px] max-md:min-h-[70px] max-md:py-4"
          message={
            data?.attendancePolicyInsight?.message ||
            "Attendance insight will appear once records are available."
          }
        />
      </div>

      <div className="mt-4 flex flex-col items-center max-md:p-3">
        <div className="w-full flex flex-col items-start">
          <h4 className="text-[#282828] font-medium max-md:font-semibold max-md:text-[17px]">
            {t("Subject Detail View")}
          </h4>

          <div className="bg-blue-00 w-full mt-2 flex flex-wrap items-center gap-y-2 gap-x-6 max-md:gap-x-3 max-md:mt-3">
            <div className="flex items-center gap-1 max-md:gap-1.5">
              <h5 className="text-[#525252] text-sm max-md:text-[12px]">
                {t("Subject :")}
              </h5>
              <div className="rounded-full px-3 max-md:px-2 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                <p className="text-sm max-md:text-[12px] text-[#43C17A] font-medium whitespace-nowrap">
                  {subjectName}{" "}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 max-md:gap-1.5">
              <h5 className="text-[#525252] text-sm max-md:text-[12px]">
                {t("Faculty :")}
              </h5>
              <div className="rounded-full px-3 max-md:px-2 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                <p className="text-sm max-md:text-[12px] text-[#43C17A] font-medium whitespace-nowrap">
                  {facultyName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 max-md:hidden">
              <h5 className="text-[#525252] text-sm">{t("Attendance :")}</h5>
              <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                <p className="text-sm text-[#43C17A] font-medium whitespace-nowrap">
                  {attendanceText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden max-md:block my-2 w-full mt-5">
          <AiAttendanceNotificationBanner
            className="h-auto min-h-[70px]  max-md:py-4"
            message={
              data?.attendancePolicyInsight?.message ||
              "Attendance insight will appear once records are available."
            }
          />
        </div>

        <div className="mt-4 w-[85%] max-md:w-full max-md:mt-3 max-md:overflow-x-auto scrollbar-hide">
          <div className="max-md:min-w-[400px]">
            <TableComponent
              columns={columns}
              tableData={filteredTableData}
              isLoading={loading}
            />
          </div>
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-3 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border
      ${
        currentPage === 1
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
        ${
          currentPage === i + 1
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
      ${
        currentPage === totalPages
          ? "border-gray-200 text-gray-300"
          : "border-gray-300 text-gray-600 hover:bg-gray-100"
      }`}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
