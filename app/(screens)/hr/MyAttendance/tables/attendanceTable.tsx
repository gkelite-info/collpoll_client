import React, { useState, useRef, useEffect } from "react";
import { CaretDown, CheckSquare, XSquare, Question } from "@phosphor-icons/react";
import { AttendanceRecord } from "../types";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import TableBodyShimmer from "@/app/components/shimmers/TableBodyShimmer";

interface Props {
  title?: string;
  records: AttendanceRecord[];
  month: string;
  year: string;
  onDateChange?: (month: string, year: string) => void;
  loading?: boolean;
}

const months = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const AttendanceTable: React.FC<Props> = ({
  title,
  records,
  month,
  year,
  onDateChange,
  loading = false,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);

  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const containerRef = useRef<HTMLDivElement>(null);
  
  const now = new Date();
  const startYear = 2026;
  const years = Array.from(
    { length: now.getFullYear() - startYear + 1 },
    (_, i) => String(startYear + i)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMonthOpen(false);
        setIsYearOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onDateChange) {
      onDateChange(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const safeTotalItems = records.length;
  const paginatedRecords = records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusDisplay = (status: string) => {
    if (!status) return { color: "text-gray-400", icon: <Question size={15} weight="fill" /> };
    const s = status.toUpperCase();
    if (s === "PRESENT" || s === "LATE" || s === "HALFDAY")
      return { color: "text-[#43C17A]", icon: <CheckSquare size={15} weight="fill" /> };
    if (s === "ABSENT")
      return { color: "text-[#EF4444]", icon: <XSquare size={15} weight="fill" /> };
    if (s === "LEAVE")
      return { color: "text-[#60AEFF]", icon: <CheckSquare size={15} weight="fill" /> };
    return { color: "text-gray-400", icon: <Question size={15} weight="fill" /> };
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2.5" ref={containerRef}>
        <h2 className="text-[#282828] text-[17px] font-bold">
          {title || "Attendance Table"}
        </h2>

        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (loading) return;
                setIsMonthOpen(!isMonthOpen);
                setIsYearOpen(false);
              }}
              className={`bg-[#43C17A] text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={loading}
            >
              {selectedMonth} <CaretDown size={14} weight="bold" />
            </button>
            {isMonthOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-20 max-h-48 overflow-y-auto w-full min-w-[80px]">
                {months.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setCurrentPage(1);
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

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (loading) return;
                setIsYearOpen(!isYearOpen);
                setIsMonthOpen(false);
              }}
              className={`bg-[#43C17A] text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={loading}
            >
              {selectedYear} <CaretDown size={14} weight="bold" />
            </button>
            {isYearOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-20 max-h-48 overflow-y-auto w-full min-w-[80px]">
                {years.map((y) => (
                  <button
                    type="button"
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setCurrentPage(1);
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[300px] custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#F2F2F2] text-[#282828] text-[12.5px] shadow-sm">
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
              {loading ? (
                <TableBodyShimmer rowCount={15} colCount={7} />
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-sm italic">
                    No records found for this month
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row, idx) => {
                  const statusDisplay = getStatusDisplay(row.status);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 last:border-none text-gray-500 text-[12.5px] hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-1.5 px-3">{row.date}</td>
                      <td className="py-1.5 px-3">{row.checkIn}</td>
                      <td className="py-1.5 px-3">{row.checkOut}</td>
                      <td className="py-1.5 px-3">{row.totalHours}</td>
                      <td className="py-1.5 px-3">
                        <div className={`flex items-center gap-1.5 ${statusDisplay.color} font-semibold`}>
                          {statusDisplay.icon}
                          <span>{row.status || '—'}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-3">{row.lateBy}</td>
                      <td className="py-1.5 px-3">{row.earlyOut}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {safeTotalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={safeTotalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            alwaysShow={true}
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
