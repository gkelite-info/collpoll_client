"use client";

import {
  ArrowLeft,
  ChartLineUp,
  CheckCircle,
  Clock,
  DownloadSimple,
  FunnelSimple,
  XCircle,
} from "@phosphor-icons/react";
import Image from "next/image";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { getInitials, type StaffAttendanceRecord, type StaffAttendanceStatus } from "../../data";

type StaffProfileScreenProps = {
  staff: StaffAttendanceRecord;
  activeSection: "profile" | "history";
  onBack: () => void;
};

const statusClass: Record<StaffAttendanceStatus, string> = {
  present: "bg-[#DFF8EB] text-[#10A66A]",
  absent: "bg-[#FFE5E5] text-[#EF4444]",
  late: "bg-[#FFF1C7] text-[#B45309]",
  not_marked: "bg-[#EEF1F5] text-[#64748B]",
};

export default function StaffProfileScreen({
  staff,
  activeSection,
  onBack,
}: StaffProfileScreenProps) {
  const profileRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const [weeklyStatusFilter, setWeeklyStatusFilter] = useState<"all" | StaffAttendanceStatus>("all");
  const historyColumns = [
    { title: "DATE", key: "date" },
    { title: "CHECK-IN", key: "checkIn" },
    { title: "CHECK-OUT", key: "checkOut" },
    { title: "STATUS", key: "status" },
    { title: "WORK HOURS", key: "workHours" },
  ];
  const filteredHistory = staff.history.filter(
    (log) => weeklyStatusFilter === "all" || log.status === weeklyStatusFilter,
  );
  const historyData = filteredHistory.map((log) => ({
    date: log.date,
    checkIn: log.checkIn,
    checkOut: log.checkOut,
    status: (
      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${statusClass[log.status]}`}>
        {log.status}
      </span>
    ),
    workHours: log.workHours,
  }));
  const monthlyAttendanceData = Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    return {
      day,
      date: `${String(day).padStart(2, "0")} May 2025`,
      status: "empty" as const,
    };
  });

  const exportMonthlyAttendance = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(
      monthlyAttendanceData.map((item) => ({
        "Employee ID": staff.staffId,
        "Staff Member": staff.name,
        Date: item.date,
        Status:
          item.status === "empty"
            ? "Not Marked"
            : item.status.charAt(0).toUpperCase() + item.status.slice(1),
      })),
    );
    worksheet["!cols"] = [{ wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 14 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Attendance");
    XLSX.writeFile(workbook, `${staff.staffId}-monthly-attendance-may-2025.xlsx`);
  };

  const exportWeeklyAttendance = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(
      filteredHistory.map((log) => ({
        "Employee ID": staff.staffId,
        "Staff Member": staff.name,
        Date: log.date,
        "Check-In": log.checkIn,
        "Check-Out": log.checkOut,
        Status: log.status.charAt(0).toUpperCase() + log.status.slice(1),
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
  };

  useEffect(() => {
    const target = activeSection === "history" ? historyRef.current : profileRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSection]);

  return (
    <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
      <section className="mx-auto max-w-[1280px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-[#F3F6FA] text-[#08244A] transition-colors hover:bg-[#08244A] hover:text-white"
            title="Back to attendance"
          >
            <ArrowLeft size={20} weight="bold" />
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
              <ProfileStat label="Present Days" value={String(staff.presentDays).padStart(2, "0")} icon={<CheckCircle size={22} weight="fill" />} tone="green" />
              <ProfileStat label="Absent Days" value={String(staff.absentDays).padStart(2, "0")} icon={<XCircle size={22} weight="fill" />} tone="red" />
              <ProfileStat label="Late Arrivals" value={String(staff.lateDays).padStart(2, "0")} icon={<Clock size={22} weight="fill" />} tone="amber" />
              <ProfileStat label="Attendance" value={`${staff.attendanceRate}%`} icon={<ChartLineUp size={22} weight="fill" />} tone="blue" />
            </div>

            <div className="mt-4 rounded-md border border-[#D7DFEC] bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[16px] font-extrabold text-[#1F2937]">Monthly Attendance - May 2025</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-wrap gap-5 text-[11px] font-bold text-[#64748B]">
                    <Legend color="bg-[#18B978]" label="Present" />
                    <Legend color="bg-[#EF4444]" label="Absent" />
                    <Legend color="bg-[#F59E0B]" label="Late" />
                  </div>
                  <button
                    type="button"
                    onClick={exportMonthlyAttendance}
                    className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[11px] font-bold text-[#34425E] transition-colors hover:bg-[#F8FAFC]"
                  >
                    <DownloadSimple size={15} weight="bold" />
                    Export Log
                  </button>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-7 justify-items-center gap-x-5 gap-y-3 text-center text-[12px] font-semibold text-[#7D8DA7]">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                  <span key={day}>{day}</span>
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
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[12px] font-bold text-[#34425E] transition-colors hover:bg-[#F8FAFC]"
              >
                <DownloadSimple size={16} weight="bold" />
                Export Log
              </button>
            </div>
          </div>

          <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:bg-[#F3F6FA] [&_th]:py-4 [&_th]:text-[10px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:text-[#64748B] [&_td]:py-4 [&_td]:text-[12px] [&_td]:font-semibold [&_td]:text-[#34425E]">
            <TableComponent columns={historyColumns} tableData={historyData} tableClassName="min-w-[760px]" height="none" stickyHeader={false} />
          </div>

          <div className="flex items-center justify-between px-5 py-4 text-[11px] text-[#8A9AB5]">
            <span>
              Showing {filteredHistory.length ? 1 : 0} to {filteredHistory.length} of {staff.history.length} logs
            </span>
            <div className="flex gap-1">
              {["<", "1", "2", "3", "...", "5", ">"].map((item) => (
                <button
                  key={item}
                  className={`h-7 min-w-7 rounded border px-2 text-[11px] font-bold ${
                    item === "1"
                      ? "border-[#2166D1] bg-[#2166D1] text-white"
                      : "border-[#D7DFEC] bg-white text-[#64748B]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
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
      icon={<span className={`grid h-10 w-10 place-items-center rounded-md ${toneClass}`}>{icon}</span>}
      value={<span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">{label}</span>}
      label={<span className="text-[28px] font-extrabold text-[#08244A]">{value}</span>}
      style="min-h-[138px] !h-[138px] border border-[#D7DFEC] bg-white p-5 shadow-sm"
      iconBgColor="transparent"
      iconColor="inherit"
    />
  );
}

function CalendarDay({ day, status }: { day: number; status: "present" | "absent" | "late" | "empty" }) {
  const className =
    status === "present"
      ? "bg-[#18B978] text-white"
      : status === "absent"
        ? "bg-[#EF4444] text-white"
        : status === "late"
          ? "bg-[#F59E0B] text-white"
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
