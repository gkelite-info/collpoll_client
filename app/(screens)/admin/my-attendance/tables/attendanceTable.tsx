import { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { AttendanceRecord } from "../types";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

interface Props {
  title?: string;
  records: AttendanceRecord[];
  month: string;
  year: string;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onMonthYearChange?: (month: number, year: number) => void;
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

export const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-[#22C55E] text-white",
  ABSENT: "bg-[#EF4444] text-white",
  LEAVE: "bg-[#60AEFF] text-white",
  LATE: "bg-[#FFBE61] text-white",
};

const AttendanceTable: React.FC<Props> = ({
  title,
  records,
  month,
  year,
  totalItems,
  currentPage,
  onPageChange,
  onMonthYearChange,
}) => {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(months.indexOf(month));
  const [selectedYear, setSelectedYear] = useState(Number(year));

  const itemsPerPage = 15
  const startYear = 2026;
  const safeTotalItems = Number(totalItems ?? 0);
  const safeCurrentPage = Number(currentPage ?? 1);

  const years = Array.from(
    {
      length:
        now.getFullYear() - startYear + 1
    },
    (_, i) => startYear + i
  );

  useEffect(() => {
    if (!onMonthYearChange) return;
    onMonthYearChange(
      selectedMonth + 1,
      selectedYear
    );
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setSelectedMonth(
      months.indexOf(month)
    );
    setSelectedYear(
      Number(year)
    );
  }, [month, year]);

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
              {months[selectedMonth]} <CaretDown size={14} weight="bold" />
            </button>
            {isMonthOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-10 max-h-48 overflow-y-auto w-full min-w-[80px]">
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(months.indexOf(m));
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

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="bg-[#F2F2F2] text-[#282828] text-[12.5px]">
              <th className="py-2.5 px-3 font-semibold">Date</th>
              <th className="py-2.5 px-3 font-semibold">Check-In</th>
              <th className="py-2.5 px-3 font-semibold">Check-Out</th>
              <th className="py-2.5 px-3 font-semibold">Total Hours</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold">Reason</th>
              <th className="py-2.5 px-3 font-semibold">Late By</th>
              <th className="py-2.5 px-3 font-semibold">Early Out</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="text-center h-[30vh] text-gray-400"
                >
                  No attendance records found
                </td>
              </tr>
            )}
            {records.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 last:border-none text-gray-500 text-[12.5px] hover:bg-gray-50 transition-colors"
              >
                <td className="py-1.5 px-3">{row.date}</td>
                <td className="py-1.5 px-3">{row.checkIn}</td>
                <td className="py-1.5 px-3">{row.checkOut}</td>
                <td className="py-1.5 px-3">{row.totalHours}</td>
                {/* <td className="py-1.5 px-3">{row.status}</td> */}
                <td className="py-1.5 px-3">
                  <span className={`px-2 py-[3px] rounded text-[11.5px] font-medium ${STATUS_STYLES[row.status] || "bg-gray-100 text-gray-600"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-1.5 px-3">{row.reason ?? "—"}</td>
                <td className="py-1.5 px-3">{row.lateBy}</td>
                <td className="py-1.5 px-3">{row.earlyOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {onPageChange && safeTotalItems > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={safeTotalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
