import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown, CheckSquare, XSquare, Question } from "@phosphor-icons/react";
import { AttendanceRecord } from "../types";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import TableBodyShimmer from "@/app/components/shimmers/TableBodyShimmer";
import { useUser } from "@/app/utils/context/UserContext";

const parseRowDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

interface Props {
  title?: string;
  records: AttendanceRecord[];
  month: string;
  year: string;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onMonthYearChange?: (month: number, year: number) => void;
  loading?: boolean;
  renderFilters?: React.ReactNode;
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
  loading = false,
  renderFilters,
}) => {
  const { dateOfJoining } = useUser();
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [monthRect, setMonthRect] = useState<DOMRect | null>(null);
  const [yearRect, setYearRect] = useState<DOMRect | null>(null);
  const monthBtnRef = useRef<HTMLButtonElement>(null);
  const yearBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(months.indexOf(month));
  const [selectedYear, setSelectedYear] = useState(Number(year));

  const itemsPerPage = 15;
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

  const updateMonthRect = () => {
    if (monthBtnRef.current) {
      setMonthRect(monthBtnRef.current.getBoundingClientRect());
    }
  };

  const updateYearRect = () => {
    if (yearBtnRef.current) {
      setYearRect(yearBtnRef.current.getBoundingClientRect());
    }
  };

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

  const getStatusDisplay = (status: string) => {
    if (!status) return { color: "text-gray-400", icon: <Question size={15} weight="fill" /> };
    const s = status.toUpperCase();
    if (s === "PRESENT" || s === "LATE" || s === "HALFDAY")
      return {
        color: "text-[#43C17A]",
        icon: <CheckSquare size={15} weight="fill" />,
      };
    if (s === "ABSENT")
      return {
        color: "text-[#EF4444]",
        icon: <XSquare size={15} weight="fill" />,
      };
    if (s === "LEAVE")
      return {
        color: "text-[#60AEFF]",
        icon: <CheckSquare size={15} weight="fill" />,
      };
    return {
      color: "text-gray-400",
      icon: <Question size={15} weight="fill" />,
    };
  };

  return (
    <div className="w-full h-full flex flex-col max-md:px-2">
      <div className="flex justify-between items-center mb-2.5 max-md:flex-col max-md:items-start max-md:gap-3 gap-3" ref={containerRef}>
        <h2 className="text-[#282828] text-[17px] font-bold shrink-0">
          {title || "Attendance Table"}
        </h2>

        <div className="flex-1 min-w-0 flex overflow-x-auto custom-scrollbar pb-1.5 w-full">
          <div className="flex gap-2 items-center flex-nowrap ml-auto max-md:ml-0 shrink-0">
            {renderFilters}
          <div className="relative shrink-0">
            <button
              ref={monthBtnRef}
              onClick={() => {
                if (loading) return;
                if (!isMonthOpen) updateMonthRect();
                setIsMonthOpen(!isMonthOpen);
                setIsYearOpen(false);
              }}
              className={`bg-[#43C17A] text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors whitespace-nowrap shrink-0 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={loading}
            >
              {months[selectedMonth]} <CaretDown size={14} weight="bold" />
            </button>
            {isMonthOpen && monthRect && typeof document !== "undefined" && createPortal(
              <div 
                style={{
                  position: "fixed",
                  top: monthRect.bottom + 4,
                  left: monthRect.right - 90,
                  zIndex: 9999,
                }}
                className="bg-white border border-gray-100 shadow-lg rounded-md py-1 max-h-48 overflow-y-auto w-[90px] custom-scrollbar"
              >
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(months.indexOf(m));
                      setIsMonthOpen(false);
                      if (onPageChange) onPageChange(1);
                    }}
                    className="w-full cursor-pointer text-left px-3 py-1.5 text-[12.5px] hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>

          <div className="relative shrink-0">
            <button
              ref={yearBtnRef}
              onClick={() => {
                if (loading) return;
                if (!isYearOpen) updateYearRect();
                setIsYearOpen(!isYearOpen);
                setIsMonthOpen(false);
              }}
              className={`bg-[#43C17A] text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-medium text-[12.5px] shadow-sm hover:bg-[#3baf6d] transition-colors whitespace-nowrap shrink-0 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={loading}
            >
              {selectedYear} <CaretDown size={14} weight="bold" />
            </button>
            {isYearOpen && yearRect && typeof document !== "undefined" && createPortal(
              <div 
                style={{
                  position: "fixed",
                  top: yearRect.bottom + 4,
                  left: yearRect.right - 90,
                  zIndex: 9999,
                }}
                className="bg-white border border-gray-100 shadow-lg rounded-md py-1 max-h-48 overflow-y-auto w-[90px] custom-scrollbar"
              >
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setIsYearOpen(false);
                      if (onPageChange) onPageChange(1);
                    }}
                    className="w-full text-left px-3 py-1.5 cursor-pointer text-[12.5px] hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    {y}
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end max-md:justify-start mb-2 mt-1">
        <span className="text-[12px] text-gray-500 italic">
          * Note: Classes Taken will change according to chosen filter values.
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full flex-1">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#F2F2F2] text-[#282828] text-[12.5px] shadow-sm">
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Check-In</th>
                <th className="py-2.5 px-3 font-semibold">Check-Out</th>
                <th className="py-2.5 px-3 font-semibold">Total Hours</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Reason</th>
                <th className="py-2.5 px-3 font-semibold">Late By</th>
                <th className="py-2.5 px-3 font-semibold">Early Out</th>
                <th className="py-2.5 px-3 font-semibold">Classes Taken</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableBodyShimmer rowCount={15} colCount={10} />
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center h-[30vh] text-gray-400"
                  >
                    No attendance records found
                  </td>
                </tr>
              ) : records.map((row, idx) => {
                const rowDateObj = parseRowDate(row.date);
                const joiningDateObj = dateOfJoining ? new Date(dateOfJoining) : null;
                if (rowDateObj && joiningDateObj) {
                  rowDateObj.setHours(0, 0, 0, 0);
                  joiningDateObj.setHours(0, 0, 0, 0);
                }
                const isBeforeJoining = rowDateObj && joiningDateObj && rowDateObj < joiningDateObj;

                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 last:border-none text-gray-500 text-[12.5px] hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-1.5 px-3">{row.date}</td>
                    <td className="py-1.5 px-3">{isBeforeJoining ? "—" : row.checkIn}</td>
                    <td className="py-1.5 px-3">{isBeforeJoining ? "—" : row.checkOut}</td>
                    <td className="py-1.5 px-3">{isBeforeJoining ? "—" : row.totalHours}</td>
                    <td className="py-1.5 px-3">
                      {isBeforeJoining ? (
                        <span>—</span>
                      ) : (
                        <div className={`flex items-center gap-1.5 ${getStatusDisplay(row.status).color} font-semibold`}>
                          {getStatusDisplay(row.status).icon}
                          <span>{row.status || '—'}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-1.5 px-3">{isBeforeJoining ? "—" : (row.reason ?? "—")}</td>
                    <td className="py-1.5 px-3">{isBeforeJoining ? "—" : row.lateBy}</td>
                    <td className="py-1.5 px-3">{isBeforeJoining ? "—" : row.earlyOut}</td>
                    <td className="py-1.5 px-3">{isBeforeJoining ? "—" : row.classDetail}</td>
                  </tr>
                );
              })
              }
            </tbody>
          </table>
        </div>
        {onPageChange && safeTotalItems > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={safeTotalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            alwaysShow={true}
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
