"use client";

import React, { useState, useRef, useEffect } from "react";
import { CaretDown, CheckSquare } from "@phosphor-icons/react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FacultyProfile {
  name: string;
  image: string;
  id: string;
  department: string;
  mobile: string;
  email: string;
  joiningDate: string;
  experience: string;
}

interface AttendanceStats {
  todayStatus: "Present" | "Absent" | "Half Day";
  totalWorkingDays: number;
  leavesTaken: number;
  remainingLeaves: number;
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

// ── Static mock data ──────────────────────────────────────────────────────────
const mockProfile: FacultyProfile = {
  name: "Harsha Sharma",
  image: "/harshasharma.png",
  id: "9046928764",
  department: "CSE",
  mobile: "9876432134",
  email: "harshasharma@gmail.com",
  joiningDate: "12 July 2019",
  experience: "6 years",
};

const mockStats: AttendanceStats = {
  todayStatus: "Present",
  totalWorkingDays: 18,
  leavesTaken: 2,
  remainingLeaves: 10,
};

const mockRecords: AttendanceRecord[] = Array.from({ length: 9 }).map(
  (_, i) => ({
    date: `${(12 - i).toString().padStart(2, "0")}/02/2026`,
    checkIn: "09:04 AM",
    checkOut: "05:12 PM",
    totalHours: "8h 08m",
    status: "Present",
    lateBy: "04m",
    earlyOut: "—",
  }),
);

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const YEARS = ["2024", "2025", "2026", "2027", "2028"];

// ── Faculty Info Card ─────────────────────────────────────────────────────────
function FacultyInfoCard({ profile }: { profile: FacultyProfile }) {
  return (
    <div className="flex bg-white rounded-xl p-4 w-[70%] shadow-sm items-center gap-8 border border-gray-100/50">
      <div className="flex flex-col items-center gap-2 pl-2">
        <div className="w-[85px] h-[85px] rounded-full overflow-hidden bg-teal-500">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-[#282828] font-bold text-[15px] whitespace-nowrap">
          {profile.name}
        </p>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-y-2 text-[13px]">
        <div className="text-[#282828] font-semibold">ID</div>
        <div className="text-gray-500">{profile.id}</div>
        <div className="text-[#282828] font-semibold">Department</div>
        <div className="text-gray-500">{profile.department}</div>
        <div className="text-[#282828] font-semibold">Mobile</div>
        <div className="text-gray-500">{profile.mobile}</div>
        <div className="text-[#282828] font-semibold">Email</div>
        <div className="text-gray-500">{profile.email}</div>
        <div className="text-[#282828] font-semibold">Date of Joining</div>
        <div className="text-gray-500">{profile.joiningDate}</div>
        <div className="text-[#282828] font-semibold">Experience</div>
        <div className="text-gray-500">{profile.experience}</div>
      </div>
    </div>
  );
}

// ── Attendance Status Card ────────────────────────────────────────────────────
function AttendanceStatusCard({ stats }: { stats: AttendanceStats }) {
  return (
    <div className="bg-white rounded-xl p-4 w-[30%] shadow-sm flex flex-col justify-between border border-gray-100/50 text-[12.5px]">
      <div>
        <p className="text-[#282828] font-medium">Attendance Status (Today)</p>
        <div className="flex items-center gap-1.5 text-gray-700 text-[13px] mb-2">
          <CheckSquare size={16} weight="fill" className="text-[#43C17A]" />
          <span>{stats.todayStatus}</span>
        </div>
      </div>
      <div>
        <p className="text-[#282828] font-medium mb-0.5">Total Working Days</p>
        <p className="text-[#525252]">{stats.totalWorkingDays}</p>
      </div>
      <div>
        <p className="text-[#282828] font-medium mb-0.5">Leaves Taken</p>
        <p className="text-[#525252]">{stats.leavesTaken}</p>
      </div>
      <div>
        <p className="text-[#282828] font-medium mb-0.5">Remaining Leaves</p>
        <p className="text-[#525252]">{stats.remainingLeaves}</p>
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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
        <h2 className="text-[#282828] text-[17px] font-bold">
          Attendance Table
        </h2>
        <div className="flex gap-2">
          {/* Month dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsMonthOpen(!isMonthOpen);
                setIsYearOpen(false);
              }}
              className="bg-[#43C17A] cursor-pointer text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors"
            >
              {selectedMonth} <CaretDown size={14} weight="bold" />
            </button>
            {isMonthOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-10 max-h-48 overflow-y-auto w-full min-w-[80px]">
                {MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setIsMonthOpen(false);
                    }}
                    className="w-full cursor-pointer text-left px-3 py-1.5 text-[12.5px] hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Year dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsYearOpen(!isYearOpen);
                setIsMonthOpen(false);
              }}
              className="bg-[#43C17A] cursor-pointer text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors"
            >
              {selectedYear} <CaretDown size={14} weight="bold" />
            </button>
            {isYearOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-10 max-h-48 overflow-y-auto w-full min-w-[80px]">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setIsYearOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 cursor-pointer text-[12.5px] hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
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
              <tr
                key={idx}
                className="border-b border-gray-100 last:border-none text-gray-500 text-[12.5px] hover:bg-gray-50 transition-colors"
              >
                <td className="py-1.5 px-3">{row.date}</td>
                <td className="py-1.5 px-3">{row.checkIn}</td>
                <td className="py-1.5 px-3">{row.checkOut}</td>
                <td className="py-1.5 px-3">{row.totalHours}</td>
                <td className="py-1.5 px-3">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckSquare
                      size={15}
                      weight="fill"
                      className="text-[#43C17A]"
                    />
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
export default function HrStaffAttendancePage({ userId }: { userId: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 w-full">
        <FacultyInfoCard profile={mockProfile} />
        <AttendanceStatusCard stats={mockStats} />
      </div>
      <AttendanceTable records={mockRecords} />
    </div>
  );
}
