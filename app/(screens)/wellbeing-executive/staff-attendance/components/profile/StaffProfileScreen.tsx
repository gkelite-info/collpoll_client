"use client";

import {
  CalendarBlank,
  CaretLeft,
  ChartLineUp,
  CheckCircle,
  Clock,
  DownloadSimple,
  FunnelSimple,
  XCircle,
} from "@phosphor-icons/react";
import Image from "next/image";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getInitials, type StaffAttendanceRecord, type StaffAttendanceStatus } from "../../data";
import {
  fetchGroundStaffAttendancesForStaff,
  type GroundStaffAttendanceListItem,
} from "@/lib/helpers/wellbeing/wellbeingExecutiveAPI";

type StaffProfileScreenProps = {
  staff?: StaffAttendanceRecord;
  activeSection: "profile" | "history";
  isLoading?: boolean;
  onBack: () => void;
};

type MonthlyAttendanceStatus = Exclude<StaffAttendanceStatus, "not_marked"> | "empty";

const WEEKLY_HISTORY_ITEMS_PER_PAGE = 10;

type ProfileAttendanceRow = Omit<GroundStaffAttendanceListItem, "status" | "date"> & {
  status: StaffAttendanceStatus;
  date: string;
  displayDate: string;
  sortDate: string;
};

const statusClass: Record<StaffAttendanceStatus, string> = {
  present: "bg-[#DFF8EB] text-[#10A66A]",
  absent: "bg-[#FFE5E5] text-[#EF4444]",
  late: "bg-[#FFF1C7] text-[#B45309]",
  leave: "bg-[#EAF0FF] text-[#2563EB]",
  not_marked: "bg-[#EEF1F5] text-[#64748B]",
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toMonthInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const parseMonthInputValue = (value: string) => {
  const [yearValue, monthValue] = value.split("-");
  const year = Number(yearValue);
  const monthIndex = Number(monthValue) - 1;

  if (!year || Number.isNaN(monthIndex)) {
    return new Date();
  }

  return new Date(year, monthIndex, 1);
};

const formatDisplayDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const getMonthWindow = (baseDate: Date) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  return { start, end };
};

const getWeekWindow = (baseDate: Date) => {
  const start = new Date(baseDate);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 5);

  return { start, end };
};

const getDateRange = (start: Date, end: Date) => {
  const dates: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

const formatStatusLabel = (status: StaffAttendanceStatus | MonthlyAttendanceStatus) =>
  status === "empty" || status === "not_marked"
    ? "Not Marked"
    : status.charAt(0).toUpperCase() + status.slice(1);

export default function StaffProfileScreen({
  staff,
  activeSection,
  isLoading = false,
  onBack,
}: StaffProfileScreenProps) {
  const profileRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const [weeklyStatusFilter, setWeeklyStatusFilter] = useState<"all" | StaffAttendanceStatus>("all");
  const [weeklyCurrentPage, setWeeklyCurrentPage] = useState(1);
  const [attendanceRows, setAttendanceRows] = useState<GroundStaffAttendanceListItem[]>([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isMonthlyExporting, setIsMonthlyExporting] = useState(false);
  const [isWeeklyExporting, setIsWeeklyExporting] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthInputValue(new Date()));
  const selectedMonthDate = useMemo(() => parseMonthInputValue(selectedMonth), [selectedMonth]);
  const monthWindow = useMemo(() => getMonthWindow(selectedMonthDate), [selectedMonthDate]);
  const weekWindow = useMemo(() => getWeekWindow(today), [today]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
      }).format(monthWindow.start),
    [monthWindow],
  );

  useEffect(() => {
    const target = activeSection === "history" ? historyRef.current : profileRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSection]);

  useEffect(() => {
    setWeeklyCurrentPage(1);
  }, [weeklyStatusFilter, staff?.userId]);

  useEffect(() => {
    if (!staff?.userId) {
      setAttendanceRows([]);
      return;
    }

    let cancelled = false;
    const fromDate = toDateInputValue(
      monthWindow.start < weekWindow.start ? monthWindow.start : weekWindow.start,
    );
    const toDate = toDateInputValue(
      monthWindow.end > weekWindow.end ? monthWindow.end : weekWindow.end,
    );

    setIsAttendanceLoading(true);
    fetchGroundStaffAttendancesForStaff(staff.userId, fromDate, toDate)
      .then((rows) => {
        if (!cancelled) {
          setAttendanceRows(rows);
        }
      })
      .catch((error) => {
        console.error("Staff profile attendance fetch failed:", error);
        toast.error("Failed to load staff attendance profile.");
        if (!cancelled) {
          setAttendanceRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAttendanceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [monthWindow, staff?.userId, weekWindow]);

  if (isLoading || isAttendanceLoading || !staff) {
    return <StaffProfileShimmer onBack={onBack} />;
  }

  const attendanceByDate = new Map(attendanceRows.map((row) => [row.date, row]));
  const monthlyRows = attendanceRows.filter(
    (row) =>
      row.date >= toDateInputValue(monthWindow.start) &&
      row.date <= toDateInputValue(monthWindow.end),
  );
  const presentDays = monthlyRows.filter((row) => row.status === "present").length;
  const absentDays = monthlyRows.filter((row) => row.status === "absent").length;
  const lateDays = monthlyRows.filter((row) => row.status === "late").length;
  const markedDays = monthlyRows.length;
  const attendanceRate = markedDays ? Math.round((presentDays / markedDays) * 100) : 0;
  const historyColumns = [
    { title: "DATE", key: "date" },
    { title: "CHECK-IN", key: "checkIn" },
    { title: "CHECK-OUT", key: "checkOut" },
    { title: "STATUS", key: "status" },
    { title: "WORK HOURS", key: "workHours" },
  ];
  const weeklyRows: ProfileAttendanceRow[] = getDateRange(weekWindow.start, weekWindow.end).map(
    (date) => {
      const sortDate = toDateInputValue(date);
      const attendance = attendanceByDate.get(sortDate);

      return {
        groundStaffAttendanceId: attendance?.groundStaffAttendanceId ?? 0,
        staffId: staff.userId,
        sortDate,
        date: formatDisplayDate(sortDate),
        displayDate: formatDisplayDate(sortDate),
        status: attendance?.status ?? "not_marked",
        checkIn: attendance?.checkIn || "-- : --",
        checkOut: attendance?.checkOut || "-- : --",
        workHours: attendance?.workHours || "0h 0m",
      };
    },
  );
  const filteredHistory = weeklyRows.filter(
    (log) => weeklyStatusFilter === "all" || log.status === weeklyStatusFilter,
  );
  const paginatedHistory = filteredHistory.slice(
    (weeklyCurrentPage - 1) * WEEKLY_HISTORY_ITEMS_PER_PAGE,
    weeklyCurrentPage * WEEKLY_HISTORY_ITEMS_PER_PAGE,
  );
  const historyData = paginatedHistory.map((log) => ({
    date: log.displayDate,
    checkIn: log.checkIn,
    checkOut: log.checkOut,
    status: (
      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${statusClass[log.status]}`}>
        {log.status}
      </span>
    ),
    workHours: log.workHours,
  }));
  const monthStartOffset = (monthWindow.start.getDay() + 6) % 7;
  const monthlyAttendanceData: {
    day: number;
    date: string;
    status: MonthlyAttendanceStatus;
  }[] = Array.from({ length: monthWindow.end.getDate() }, (_, index) => {
    const day = index + 1;
    const date = toDateInputValue(new Date(monthWindow.start.getFullYear(), monthWindow.start.getMonth(), day));
    const status = attendanceByDate.get(date)?.status ?? "empty";

    return {
      day,
      date: formatDisplayDate(date),
      status,
    };
  });

  const exportMonthlyAttendance = async () => {
    try {
      setIsMonthlyExporting(true);
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(
        monthlyAttendanceData.map((item) => ({
          "Employee ID": staff.staffId,
          "Staff Member": staff.name,
          Date: item.date,
          Status: formatStatusLabel(item.status),
        })),
      );
      worksheet["!cols"] = [{ wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 14 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Attendance");
      XLSX.writeFile(workbook, `${staff.staffId}-monthly-attendance-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.xlsx`);
    } finally {
      setIsMonthlyExporting(false);
    }
  };

  const exportWeeklyAttendance = async () => {
    try {
      setIsWeeklyExporting(true);
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(
        filteredHistory.map((log) => ({
          "Employee ID": staff.staffId,
          "Staff Member": staff.name,
          Date: log.date,
          "Check-In": log.checkIn,
          "Check-Out": log.checkOut,
          Status: formatStatusLabel(log.status),
          "Work Hours": log.workHours,
        })),
      );
      worksheet["!cols"] = [
        { wch: 16 },
        { wch: 22 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "This Week Attendance");
      XLSX.writeFile(workbook, `${staff.staffId}-weekly-attendance.xlsx`);
    } finally {
      setIsWeeklyExporting(false);
    }
  };

  return (
    <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
      <section className="mx-auto max-w-[1280px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-10 w-10 cursor-pointer place-items-center text-[#08244A] transition-colors hover:text-[#123A6D]"
            title="Back to attendance"
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <h1 className="text-[28px] font-extrabold text-[#08244A]">Security Staff Profile</h1>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div
            ref={profileRef}
            className="rounded-md border border-[#D7DFEC] bg-white p-8"
          >
            <div className="flex flex-col items-center text-center">
              {staff.image ? (
                <Image
                  src={staff.image}
                  alt={staff.name}
                  width={104}
                  height={104}
                  className="h-[104px] w-[104px] rounded-md object-cover"
                />
              ) : (
                <div className="grid h-[104px] w-[104px] place-items-center rounded-md bg-[#EAF0F7] text-[28px] font-extrabold text-[#0B66C3]">
                  {getInitials(staff.name)}
                </div>
              )}
              <h2 className="mt-5 text-[18px] font-extrabold text-[#1F2937]">{staff.name}</h2>
              <p className="text-[13px] font-medium text-[#64748B]">{staff.designation}</p>
            </div>

            <div className="mt-8 space-y-4 border-t border-[#D7DFEC] pt-5 text-[12px]">
              <InfoRow label="Employee ID" value={staff.staffId} />
              <InfoRow label="Contact" value={staff.phone} />
              <InfoRow label="Joining Date" value={staff.joiningDate} />
            </div>

          </div>

          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <ProfileStat label="Present Days" value={String(presentDays).padStart(2, "0")} icon={<CheckCircle size={22} weight="fill" />} tone="green" />
              <ProfileStat label="Absent Days" value={String(absentDays).padStart(2, "0")} icon={<XCircle size={22} weight="fill" />} tone="red" />
              <ProfileStat label="Late Arrivals" value={String(lateDays).padStart(2, "0")} icon={<Clock size={22} weight="fill" />} tone="amber" />
              <ProfileStat label="Attendance" value={`${attendanceRate}%`} icon={<ChartLineUp size={22} weight="fill" />} tone="blue" />
            </div>

            <div className="mt-4 rounded-md border border-[#D7DFEC] bg-white p-5">
              <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h2 className="text-[16px] font-extrabold text-[#1F2937]">Monthly Attendance -</h2>
                  <label className="relative inline-flex h-9 max-w-full items-center rounded-md border border-[#D7DFEC] bg-white pl-3 pr-2 text-[12px] font-extrabold text-[#34425E] transition-colors hover:border-[#B8C4D6] focus-within:border-[#43C17A] focus-within:ring-1 focus-within:ring-[#43C17A]">
                    <CalendarBlank size={15} weight="fill" className="mr-2 text-[#43C17A]" />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(event) => setSelectedMonth(event.target.value)}
                      aria-label="Select monthly attendance month"
                      className="h-full w-[150px] cursor-pointer bg-transparent text-[12px] font-extrabold text-[#34425E] outline-none"
                    />
                  </label>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <div className="flex min-w-0 flex-wrap gap-4 text-[11px] font-bold text-[#64748B]">
                    <Legend color="bg-[#18B978]" label="Present" />
                    <Legend color="bg-[#EF4444]" label="Absent" />
                    <Legend color="bg-[#F59E0B]" label="Late" />
                    <Legend color="bg-[#2563EB]" label="Leave" />
                  </div>
                  <button
                    type="button"
                    onClick={exportMonthlyAttendance}
                    disabled={isMonthlyExporting}
                    className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-[#D7DFEC] px-3 text-[11px] font-bold text-[#34425E] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <DownloadSimple
                      size={15}
                      weight="bold"
                      className={isMonthlyExporting ? "animate-bounce" : ""}
                    />
                    {isMonthlyExporting ? "Exporting..." : "Export Log"}
                  </button>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-7 justify-items-center gap-x-5 gap-y-3 text-center text-[12px] font-semibold text-[#7D8DA7]">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
                {Array.from({ length: monthStartOffset }).map((_, index) => (
                  <span key={`empty-${index}`} />
                ))}
                {monthlyAttendanceData.map((item) => (
                  <CalendarDay key={item.day} day={item.day} status={item.status} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={historyRef}
          className="mt-5 overflow-hidden rounded-md border border-[#D7DFEC] bg-white"
        >
          <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-[16px] font-extrabold text-[#1F2937]">This Week Attendance</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <select
                  value={weeklyStatusFilter}
                  onChange={(event) =>
                    setWeeklyStatusFilter(event.target.value as "all" | StaffAttendanceStatus)
                  }
                  className="h-9 min-w-[140px] cursor-pointer appearance-none rounded-md border border-[#D7DFEC] bg-white px-3 pr-8 text-[12px] font-bold text-[#34425E] outline-none transition-colors hover:bg-[#F8FAFC] focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A]"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="leave">Leave</option>
                  <option value="not_marked">Not Marked</option>
                </select>
                <FunnelSimple
                  size={14}
                  weight="bold"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
              </div>
              <button
                type="button"
                onClick={exportWeeklyAttendance}
                disabled={isWeeklyExporting}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[12px] font-bold text-[#34425E] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <DownloadSimple
                  size={16}
                  weight="bold"
                  className={isWeeklyExporting ? "animate-bounce" : ""}
                />
                {isWeeklyExporting ? "Exporting..." : "Export Log"}
              </button>
            </div>
          </div>

          <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:bg-[#F3F6FA] [&_th]:py-4 [&_th]:text-[10px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:text-[#64748B] [&_td]:py-4 [&_td]:text-[12px] [&_td]:font-semibold [&_td]:text-[#34425E]">
            <TableComponent columns={historyColumns} tableData={historyData} tableClassName="min-w-[760px]" height="none" stickyHeader={false} />
          </div>

          <Pagination
            currentPage={weeklyCurrentPage}
            totalItems={filteredHistory.length}
            itemsPerPage={WEEKLY_HISTORY_ITEMS_PER_PAGE}
            onPageChange={setWeeklyCurrentPage}
          />
        </div>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold uppercase tracking-wide text-[#7D8DA7]">{label}</span>
      <span className="font-semibold text-[#1F2937]">{value}</span>
    </div>
  );
}

function ProfileStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: "green" | "red" | "amber" | "blue";
}) {
  const toneClass = {
    green: "bg-[#E6FAF1] text-[#10A66A]",
    red: "bg-[#FFF0F0] text-[#EF4444]",
    amber: "bg-[#FFF7E5] text-[#F59E0B]",
    blue: "bg-[#EAF0FF] text-[#2166D1]",
  }[tone];

  return (
    <CardComponent
      icon={<span className={`grid place-items-center rounded-md px-2 py-2 ${toneClass}`}>{icon}</span>}
      value={<span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">{label}</span>}
      label={<span className="text-[28px] font-extrabold text-[#08244A]">{value}</span>}
      style="min-h-[138px] !h-[138px] border border-[#D7DFEC] bg-white p-5 shadow-sm"
      iconBgColor="transparent"
      iconColor="inherit"
    />
  );
}

function StaffProfileShimmer({ onBack }: { onBack: () => void }) {
  return (
    <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
      <section className="mx-auto max-w-[1280px] animate-pulse">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-10 w-10 cursor-pointer place-items-center text-[#08244A]"
            title="Back to attendance"
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <div className="h-8 w-64 rounded bg-[#DDE5F0]" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-md border border-[#D7DFEC] bg-white p-8">
            <div className="mx-auto h-[104px] w-[104px] rounded-md bg-[#DDE5F0]" />
            <div className="mx-auto mt-5 h-5 w-36 rounded bg-[#EAF0F7]" />
            <div className="mx-auto mt-2 h-4 w-24 rounded bg-[#EAF0F7]" />
            <div className="mt-8 space-y-5 border-t border-[#D7DFEC] pt-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex justify-between gap-6">
                  <div className="h-4 w-24 rounded bg-[#EAF0F7]" />
                  <div className="h-4 w-28 rounded bg-[#DDE5F0]" />
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex h-[138px] flex-col justify-between rounded-lg border border-[#D2DAE7] bg-white p-5">
                  <div className="h-[38px] w-[38px] rounded-md bg-[#EAF0F7]" />
                  <div className="space-y-3">
                    <div className="h-3 w-24 rounded bg-[#EAF0F7]" />
                    <div className="h-7 w-14 rounded bg-[#DDE5F0]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-[#D7DFEC] bg-white p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-5 w-44 rounded bg-[#DDE5F0]" />
                  <div className="h-9 w-36 rounded-md bg-[#EAF0F7]" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#DDE5F0]" />
                        <div className="h-3 w-12 rounded bg-[#EAF0F7]" />
                      </div>
                    ))}
                  </div>
                  <div className="h-8 w-28 rounded-md bg-[#EAF0F7]" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-7 justify-items-center gap-x-5 gap-y-3">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={`day-${index}`} className="h-3 w-8 rounded bg-[#DDE5F0]" />
                ))}
                {Array.from({ length: 35 }).map((_, index) => (
                  <div key={`date-${index}`} className="h-9 w-9 rounded-md bg-[#EAF0F7]" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-md border border-[#D7DFEC] bg-white">
          <div className="flex justify-between px-5 py-4">
            <div className="h-5 w-44 rounded bg-[#DDE5F0]" />
            <div className="flex gap-2">
              <div className="h-9 w-32 rounded bg-[#EAF0F7]" />
              <div className="h-9 w-28 rounded bg-[#EAF0F7]" />
            </div>
          </div>
          <div className="h-14 bg-[#F3F6FA]" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-6 border-b border-[#E4E9F1] px-6 py-5">
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-4 rounded bg-[#EAF0F7]" />
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function CalendarDay({ day, status }: { day: number; status: MonthlyAttendanceStatus }) {
  const className =
    status === "present"
      ? "bg-[#18B978] text-white"
      : status === "absent"
        ? "bg-[#EF4444] text-white"
        : status === "late"
          ? "bg-[#F59E0B] text-white"
          : status === "leave"
            ? "bg-[#2563EB] text-white"
          : "bg-[#EEF1F5] text-[#64748B]";

  return (
    <span className={`grid h-9 w-9 place-items-center rounded-md text-[11px] font-extrabold ${className}`}>
      {day}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
