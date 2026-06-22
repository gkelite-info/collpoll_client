"use client";

import {
  CalendarBlank,
  CaretDown,
  CheckCircle,
  Clock,
  ClockCounterClockwise,
  FloppyDisk,
  MagnifyingGlass,
  SlidersHorizontal,
  UserCircle,
  UsersThree,
  XCircle,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { StaffAttendanceRecord, StaffAttendanceStatus } from "../../data";

type StaffAttendanceListScreenProps = {
  records: StaffAttendanceRecord[];
  setRecords: Dispatch<SetStateAction<StaffAttendanceRecord[]>>;
  onViewProfile: (record: StaffAttendanceRecord) => void;
  onViewHistory: (record: StaffAttendanceRecord) => void;
  onViewAllStaff: () => void;
  onViewStatusStaff: (status: StaffAttendanceStatus) => void;
};

const statusClasses: Record<StaffAttendanceStatus, string> = {
  present: "text-[#10A66A]",
  absent: "text-[#EF4444]",
  late: "text-[#D97706]",
};

export default function StaffAttendanceListScreen({
  records,
  setRecords,
  onViewProfile,
  onViewHistory,
  onViewAllStaff,
  onViewStatusStaff,
}: StaffAttendanceListScreenProps) {
  const [designationFilter, setDesignationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const present = records.filter((record) => record.status === "present").length;
  const absent = records.filter((record) => record.status === "absent").length;
  const late = records.filter((record) => record.status === "late").length;
  const filteredRows = useMemo(
    () =>
      records.filter((record) => {
        const matchesDesignation =
          designationFilter === "all" || record.designation === designationFilter;
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;

        return matchesDesignation && matchesStatus;
      }),
    [designationFilter, records, statusFilter],
  );
  const visibleRows = filteredRows.slice(0, 4);
  const columns = [
    { title: "STAFF MEMBER", key: "image" },
    { title: "EMPLOYEE ID", key: "employeeId" },
    { title: "DESIGNATION", key: "designation" },
    { title: "ATTENDANCE STATUS", key: "attendanceStatus" },
    { title: "CONTACT", key: "contact" },
    { title: "ACTIONS", key: "actions" },
  ];
  const tableData = visibleRows.map((record) => ({
    image: (
      <div className="flex min-w-[180px] items-center gap-3 text-left">
        <Image
          src={`https://i.pravatar.cc/80?img=${record.imageSeed}`}
          alt={record.name}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="font-extrabold text-[#08244A]">{record.name}</span>
      </div>
    ),
    employeeId: <span className="font-semibold text-[#34425E]">{record.staffId}</span>,
    designation: <span className="text-[#34425E]">{record.designation}</span>,
    contact: <span className="text-[#34425E]">{record.phone}</span>,
    attendanceStatus: (
      <StatusDropdown
        value={record.status}
        onChange={(status) =>
          setRecords((current) =>
            current.map((item) =>
              item.id === record.id ? { ...item, status } : item,
            ),
          )
        }
      />
    ),
    actions: (
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => onViewProfile(record)}
          title="Open profile"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-[#0B66C3] transition-transform hover:scale-110"
        >
          <UserCircle size={22} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => onViewHistory(record)}
          title="Open attendance history"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-[#5B6475] transition-transform hover:scale-110"
        >
          <ClockCounterClockwise size={22} weight="bold" />
        </button>
      </div>
    ),
  }));

  const markAllPresent = () => {
    setRecords((current) =>
      current.map((record) => ({ ...record, status: "present" })),
    );
  };

  return (
    <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
      <section className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[24px] font-extrabold text-[#08244A]">Attendance Management</h1>
            <p className="text-[12px] font-medium text-[#64748B]">
              Monitor and manage attendance for all security personnel across the campus.
            </p>
          </div>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[12px] font-bold text-[#34425E]">
            <CalendarBlank size={16} weight="bold" />
            20 May 2025, Tuesday
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Staff"
            value="48"
            icon={<UsersThree size={22} weight="fill" />}
            tone="navy"
            onClick={onViewAllStaff}
          />
          <StatCard
            title="Present"
            value={String(present + 38).padStart(2, "0")}
            icon={<CheckCircle size={23} weight="bold" />}
            tone="green"
            onClick={() => onViewStatusStaff("present")}
          />
          <StatCard
            title="Absent"
            value={String(absent + 3).padStart(2, "0")}
            icon={<XCircle size={23} weight="bold" />}
            tone="red"
            onClick={() => onViewStatusStaff("absent")}
          />
          <StatCard
            title="Late Arrivals"
            value={String(late + 1).padStart(2, "0")}
            icon={<Clock size={23} weight="bold" />}
            tone="amber"
            onClick={() => onViewStatusStaff("late")}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-[#D7DFEC] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#E4E9F1] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[15px] font-extrabold text-[#08244A]">Attendance Control Panel</h2>
                <p className="text-[11px] font-medium text-[#8A9AB5]">
                  Update and filter status manually
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="h-9 rounded-md border border-[#2166D1] px-3 text-[12px] font-bold text-[#2166D1]"
                >
                  Mark All Present
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-md bg-[#10A66A] px-3 text-[12px] font-bold text-white">
                  <FloppyDisk size={15} weight="bold" />
                  Save Attendance
                </button>
              </div>
            </div>

            <div className="grid gap-3 border-b border-[#E4E9F1] p-4 md:grid-cols-[1fr_150px_150px_120px]">
              <FilterBox icon={<MagnifyingGlass size={15} />} label="Search Name or ID..." />
              <FilterSelect
                value={designationFilter}
                onChange={setDesignationFilter}
                options={[
                  { label: "All Designations", value: "all" },
                  { label: "Watchman", value: "Watchman" },
                  { label: "Security Guard", value: "Security Guard" },
                  { label: "Bouncer", value: "Bouncer" },
                ]}
              />
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "All Statuses", value: "all" },
                  { label: "Present", value: "present" },
                  { label: "Absent", value: "absent" },
                  { label: "Late", value: "late" },
                ]}
              />
              <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#F1F4F8] text-[12px] font-bold text-[#34425E]">
                <SlidersHorizontal size={15} />
                Advanced
              </button>
            </div>

            <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:bg-[#F3F6FA] [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:text-[#5B6475] [&_td]:py-3 [&_td]:text-[12px]">
              <TableComponent
                columns={columns}
                tableData={tableData}
                tableClassName="min-w-[760px]"
                height="none"
                stickyHeader={false}
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#E4E9F1] px-4 py-3 text-[11px] text-[#6B7280]">
              <span>Showing 4 of 48 security personnel</span>
              <div className="flex gap-1">
                {["1", "2", "3", ">"].map((item) => (
                  <button
                    key={item}
                    className={`h-7 w-7 rounded border text-[11px] font-bold ${
                      item === "1"
                        ? "border-[#08244A] bg-[#08244A] text-white"
                        : "border-[#D7DFEC] bg-white text-[#64748B]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TodaySummary present={42} absent={4} late={2} />
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
  onClick,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  tone: "navy" | "green" | "red" | "amber";
  onClick?: () => void;
}) {
  const toneClass = {
    navy: "bg-[#EEF3FB] text-[#08244A]",
    green: "bg-[#DDF9EC] text-[#10A66A]",
    red: "bg-[#FFEAEA] text-[#EF4444]",
    amber: "bg-[#FFF0D6] text-[#F59E0B]",
  }[tone];

  return (
    <CardComponent
      icon={<span className={`grid h-12 w-12 place-items-center rounded-lg ${toneClass}`}>{icon}</span>}
      value={<span className="text-[10px] font-extrabold uppercase tracking-wide text-[#34425E]">{title}</span>}
      label={<span className="text-[22px] font-extrabold leading-none text-[#08244A]">{value}</span>}
      style="min-h-[112px] !h-[112px] border border-[#D2DAE7] bg-white px-6 py-4 shadow-sm"
      iconBgColor="transparent"
      iconColor="inherit"
      onClick={onClick}
    />
  );
}

function FilterBox({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[11px] font-semibold text-[#8A9AB5]">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-[#D7DFEC] bg-white px-3 pr-8 text-[11px] font-bold text-[#8A9AB5] outline-none transition-colors hover:border-[#B8C4D6] focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9AB5]"
      />
    </div>
  );
}

function StatusDropdown({
  value,
  onChange,
}: {
  value: StaffAttendanceStatus;
  onChange: (value: StaffAttendanceStatus) => void;
}) {
  return (
    <div className="relative mx-auto w-[130px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as StaffAttendanceStatus)}
        className={`h-9 w-full cursor-pointer appearance-none rounded-md border border-[#D7DFEC] bg-white px-3 pr-8 text-[12px] font-extrabold outline-none transition-colors hover:border-[#B8C4D6] focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] ${statusClasses[value]}`}
      >
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="late">Late</option>
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9AB5]"
      />
    </div>
  );
}

function TodaySummary({ present, absent, late }: { present: number; absent: number; late: number }) {
  return (
    <div className="rounded-lg border border-[#D7DFEC] bg-white p-5">
      <h3 className="text-[13px] font-extrabold text-[#08244A]">Today&apos;s Summary</h3>
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-5">
        <div className="grid h-36 w-36 place-items-center rounded-full border-[10px] border-[#18B978] text-center">
          <div>
            <p className="text-[30px] font-extrabold leading-none text-[#08244A]">87%</p>
            <p className="mt-1 text-[9px] font-bold uppercase text-[#6B7280]">Present</p>
          </div>
        </div>
        <div className="w-full space-y-3 text-[12px] font-semibold text-[#5B6475]">
          <Legend color="bg-[#18B978]" label="Present" value={`${present} Personnel`} />
          <Legend color="bg-[#EF4444]" label="Absent" value={`${absent} Personnel`} />
          <Legend color="bg-[#F59E0B]" label="Late" value={`${late} Personnel`} />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </span>
      <span className="font-extrabold text-[#08244A]">{value}</span>
    </div>
  );
}
