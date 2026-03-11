import React, { useState, useRef, useEffect } from "react";
import { CaretDown, CheckSquare } from "@phosphor-icons/react";
import { AttendanceRecord } from "../types";

interface Props {
  title?: string;
  records: AttendanceRecord[];
  month: string;
  year: string;
}

const months = [
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
const years = ["2024", "2025", "2026", "2027", "2028"];

const AttendanceTable: React.FC<Props> = ({ title, records, month, year }) => {
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);

  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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
          {title || "Attendance Table"}
        </h2>

        <div className="flex gap-2">
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
                {months.map((m) => (
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

          {/* Year Dropdown */}
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
                {years.map((y) => (
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

      {/* Table Container - Made horizontally scrollable */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
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
};

export default AttendanceTable;
