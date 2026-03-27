"use client";
 
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { CaretDown, CheckSquare } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
 
// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalyticsFacultyProfile {
  name: string;
  department: string;
  employeeId: string;
  experience: string;
  leavesTaken: number;
  workingDays: number;
}
 
interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: string;
  lateBy: string;
  earlyOut: string;
}
 
interface ChartDataPoint {
  month: string;
  performance: number;
  attendance: number;
}
 
// ── Static mock data ──────────────────────────────────────────────────────────
const mockProfile: AnalyticsFacultyProfile = {
  name: "Harsha Sharma",
  department: "CSE",
  employeeId: "989539",
  experience: "6 Years",
  leavesTaken: 2,
  workingDays: 18,
};
 
const mockChartData: ChartDataPoint[] = [
  { month: "Jan", performance: 71, attendance: 10 },
  { month: "Feb", performance: 96, attendance: 15 },
  { month: "Mar", performance: 31, attendance: 18 },
  { month: "Apr", performance: 40, attendance: 14 },
  { month: "May", performance: 35, attendance: 23 },
  { month: "Jun", performance: 42, attendance: 14 },
  { month: "Jul", performance: 47, attendance: 32 },
];
 
const mockRecords: AttendanceRecord[] = Array.from({ length: 9 }).map((_, i) => ({
  date: `${(12 - i).toString().padStart(2, "0")}/02/2026`,
  checkIn: "09:04 AM",
  checkOut: "05:12 PM",
  totalHours: "8h 08m",
  status: "Present",
  lateBy: "04m",
  earlyOut: "—",
}));
 
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const YEARS = ["2024","2025","2026","2027","2028"];
 
// ── Faculty Info ──────────────────────────────────────────────────────────────
function AnalyticsFacultyInfo({ profile }: { profile: AnalyticsFacultyProfile }) {
  return (
    <div className="w-full mb-5 text-[14px]">
      <h2 className="text-[#282828] font-bold text-[17px] mb-4">Faculty Information</h2>
      <div className="grid grid-cols-3 gap-y-3.5 w-full">
        <div>
          <span className="font-semibold text-[#282828]">Name : </span>
          <span className="text-[#525252]">{profile.name}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Department : </span>
          <span className="text-[#525252]">{profile.department}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Employee ID : </span>
          <span className="text-[#525252]">{profile.employeeId}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Experience : </span>
          <span className="text-[#525252]">{profile.experience}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Leaves Taken : </span>
          <span className="text-[#525252]">{profile.leavesTaken}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Working Days : </span>
          <span className="text-[#525252]">{profile.workingDays}</span>
        </div>
      </div>
    </div>
  );
}
 
// ── Chart ─────────────────────────────────────────────────────────────────────
function AttendancePerformanceChart({ data }: { data: ChartDataPoint[] }) {
  const tooltipFormatter: TooltipProps<number, string>["formatter"] = (value, name) => {
    if (name === "Performance") return [`${value}%`, name];
    return [value, name];
  };
 
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5 w-full">
      <h3 className="text-[#282828] font-bold text-[15px] mb-6">Attendance & Performance Trend</h3>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="month" axisLine={{ stroke: "#E5E7EB" }} tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12.5 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12.5 }}
              domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "13px", paddingTop: "20px" }} />
            <Line type="linear" dataKey="performance" name="Performance" stroke="#1E293B" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
            <Line type="linear" dataKey="attendance" name="Attendance" stroke="#43C17A" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
 
// ── Attendance Table ──────────────────────────────────────────────────────────
function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
  const [selectedMonth, setSelectedMonth] = useState("FEB");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMonthOpen(false);
        setIsYearOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2.5" ref={containerRef}>
        <h2 className="text-[#282828] text-[17px] font-bold">Daily Attendance Record</h2>
        <div className="flex gap-2">
          <div className="relative">
            <button onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
              className="bg-[#43C17A] cursor-pointer text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors">
              {selectedMonth} <CaretDown size={14} weight="bold" />
            </button>
            {isMonthOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-10 max-h-48 overflow-y-auto w-full min-w-[80px]">
                {MONTHS.map((m) => (
                  <button key={m} onClick={() => { setSelectedMonth(m); setIsMonthOpen(false); }}
                    className="w-full cursor-pointer text-left px-3 py-1.5 text-[12.5px] hover:bg-gray-50 text-gray-700 transition-colors">{m}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
              className="bg-[#43C17A] cursor-pointer text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors">
              {selectedYear} <CaretDown size={14} weight="bold" />
            </button>
            {isYearOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-10 max-h-48 overflow-y-auto w-full min-w-[80px]">
                {YEARS.map((y) => (
                  <button key={y} onClick={() => { setSelectedYear(y); setIsYearOpen(false); }}
                    className="w-full text-left px-3 py-1.5 cursor-pointer text-[12.5px] hover:bg-gray-50 text-gray-700 transition-colors">{y}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
          <thead>
            <tr className="bg-[#F2F2F2] text-[#282828] text-[12.5px]">
              <th className="py-2.5 px-3 font-semibold">Date</th>
              <th className="py-2.5 px-3 font-semibold">Check-In</th>
              <th className="py-2.5 px-3 font-semibold">Check-Out</th>
              <th className="py-2.5 px-3 font-semibold">Total Hours</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold">Late By</th>
              <th className="py-2.5 px-3 font-semibold">Early Out</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-none text-gray-500 text-[12.5px] hover:bg-gray-50 transition-colors">
                <td className="py-1.5 px-3">{row.date}</td>
                <td className="py-1.5 px-3">{row.checkIn}</td>
                <td className="py-1.5 px-3">{row.checkOut}</td>
                <td className="py-1.5 px-3">{row.totalHours}</td>
                <td className="py-1.5 px-3">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckSquare size={15} weight="fill" className="text-[#43C17A]" />
                    <span>{row.status}</span>
                  </div>
                </td>
                <td className="py-1.5 px-3">{row.lateBy}</td>
                <td className="py-1.5 px-3">{row.earlyOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
// ── Main ──────────────────────────────────────────────────────────────────────
export default function HrStaffAttendanceAnalyticsPage({ userId }: { userId: string }) {
  // In production, fetch data using userId. Static for now.
  return (
    <div className="flex flex-col w-full">
      <AnalyticsFacultyInfo profile={mockProfile} />
      <AttendancePerformanceChart data={mockChartData} />
      <AttendanceTable records={mockRecords} />
    </div>
  );
}