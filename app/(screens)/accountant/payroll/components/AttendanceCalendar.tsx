"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { fetchEmployeeMonthlyAttendance, type EmployeeAttendanceDay } from "@/lib/helpers/accountant/employeeSalaryPaymentsAPI";

type CalendarStatus = "present" | "absent" | "halfday" | "leave" | "weekoff" | "not-marked";

const styles: Record<CalendarStatus, string> = { present: "bg-[#e8f8ee] text-[#168a49] border-[#bde8cc]", absent: "bg-[#fdebec] text-[#d32f35] border-[#f3c4c7]", halfday: "bg-[#fff0e8] text-[#d45d22] border-[#f5cfbc]", leave: "bg-[#eeeaff] text-[#6751e7] border-[#d8cffb]", weekoff: "bg-gray-100 text-gray-500 border-gray-200", "not-marked": "bg-white text-[#8b95a5] border-[#e2e5e9]" };
const legend: Record<CalendarStatus, string> = { present: "Present", absent: "Absent", halfday: "Half Day", leave: "Leave", weekoff: "Week Off", "not-marked": "No Record" };

function normalizeStatus(value: string): CalendarStatus {
  const status = value.toLowerCase().replace(/[\s_-]/g, "");
  if (status.includes("half")) return "halfday";
  if (status.includes("leave")) return "leave";
  if (status.includes("weekoff") || status.includes("holiday")) return "weekoff";
  if (status === "present" || status === "late") return "present";
  if (status === "absent") return "absent";
  return "not-marked";
}

export default function AttendanceCalendar({
  employee,
  attendance,
  onAttendanceChange,
}: {
  employee: { userId: number; payrollMonth: number; payrollYear: number };
  attendance: EmployeeAttendanceDay[];
  onAttendanceChange?: (records: EmployeeAttendanceDay[], period: string) => void;
}) {
  const initialPeriod = `${employee.payrollYear}-${String(employee.payrollMonth).padStart(2, "0")}`;
  const [period, setPeriod] = useState(initialPeriod);
  const [records, setRecords] = useState(attendance);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [selectedYear, selectedMonth] = period.split("-").map(Number);
  const attendanceByDay = new Map(records.map((record) => [Number(record.attendanceDate.slice(8, 10)), record]));
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  const changePeriod = async (nextPeriod: string) => {
    if (!nextPeriod) return;
    setPeriod(nextPeriod);
    setLoadError("");
    setIsLoading(true);
    const [year, month] = nextPeriod.split("-").map(Number);
    try {
      const nextRecords = await fetchEmployeeMonthlyAttendance(employee.userId, month, year);
      setRecords(nextRecords);
      onAttendanceChange?.(nextRecords, nextPeriod);
    } catch (error) {
      setRecords([]);
      onAttendanceChange?.([], nextPeriod);
      setLoadError(error instanceof Error ? error.message : "Unable to load attendance.");
    } finally {
      setIsLoading(false);
    }
  };

  return <section className="mb-5 rounded-xl border border-[#e2e5e9] bg-white p-4 shadow-sm"><div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="font-semibold">Monthly Attendance</h2><p className="mt-1 text-sm text-[#667386]">Day-wise attendance used for salary calculation</p></div><div className="flex flex-col items-end gap-2"><label className="inline-flex items-center gap-2 rounded-xl bg-[#dff3e8] px-4 py-2 text-sm font-bold text-[#31b96d]"><CalendarDays size={17} fill="currentColor" /><input aria-label="Select attendance month" type="month" value={period} onChange={(event) => changePeriod(event.target.value)} disabled={isLoading} className="cursor-pointer bg-transparent font-bold text-[#31b96d] outline-none disabled:cursor-wait" /></label><div className="flex flex-wrap justify-end gap-2">{Object.entries(legend).map(([key, label]) => <span key={key} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${styles[key as CalendarStatus]}`}>{label}</span>)}</div></div></div>{loadError && <p className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{loadError}</p>}<div className={`overflow-x-auto transition-opacity ${isLoading ? "pointer-events-none opacity-40" : ""}`}><div className="min-w-[650px]"><div className="grid grid-cols-7 bg-[#edf3ff] text-center text-xs font-bold uppercase text-[#526071]">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="p-2">{day}</div>)}</div><div className="grid grid-cols-7 gap-1.5 p-2">{Array.from({ length: firstDay }).map((_, index) => <div key={`blank-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const record = attendanceByDay.get(day);
    const status = record ? normalizeStatus(record.status) : "not-marked";
    const adjustments = record?.attendance_adjustments ?? [];
    const latestAdjustment = [...adjustments].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const checkIn = latestAdjustment?.newCheckIn ?? record?.checkIn;
    const checkOut = latestAdjustment?.newCheckOut ?? record?.checkOut;
    const title = record ? `${record.status}${checkIn ? ` · In ${checkIn.slice(0, 5)}` : ""}${checkOut ? ` · Out ${checkOut.slice(0, 5)}` : ""}${latestAdjustment ? ` · Adjusted${latestAdjustment.reason ? `: ${latestAdjustment.reason}` : ""}` : ""}` : "No attendance record";
    return <div key={day} title={title} className={`min-h-12 rounded-md border px-2 py-1.5 ${styles[status]}`}><div className="flex items-center justify-between gap-2"><p className="text-base font-bold">{day}</p><div className="text-right"><p className="text-xs font-semibold">{legend[status]}</p>{latestAdjustment && <p className="mt-0.5 text-[9px] font-semibold">Adjusted</p>}</div></div></div>;
  })}</div></div></div></section>;
}
