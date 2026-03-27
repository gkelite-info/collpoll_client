import { MonthDetailRow } from "@/lib/helpers/Hr/dashboard/Hrdashhelper";
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import TableComponent from "@/app/utils/table/table";

interface Props {
  month:         string;
  months:        string[];
  rows:          MonthDetailRow[];
  roleLabel:     string;
  loading?:      boolean;
  totalCount:    number;
  currentPage:   number;
  onPageChange:  (page: number) => void;
  onMonthChange: (month: string) => void;
  onBack?:       () => void;
}

function getPerformanceColor(p: string): string {
  if (p === "Excellent") return "text-[#00B050]";
  if (p === "Good")      return "text-[#FFC000]";
  return "text-[#FF0000]";
}

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage:  number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-end items-center gap-3 mt-4 mb-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border
          ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
      >
        <CaretLeft size={18} weight="bold" />
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button key={i} onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-lg font-semibold
            ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border
          ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
      >
        <CaretRight size={18} weight="bold" />
      </button>
    </div>
  );
}

const PAGE_SIZE = 10;

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

function TableShimmer() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mt-2">
      <div className="p-3 flex flex-col gap-2">
        <div className="flex gap-3 px-1 pb-2">
          {[...Array(7)].map((_, i) => <Shimmer key={i} className="h-3 flex-1" />)}
        </div>
        {[...Array(5)].map((_, r) => (
          <div key={r} className="flex gap-3 px-1 py-1">
            {[...Array(7)].map((_, c) => <Shimmer key={c} className="h-4 flex-1" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FacultyMonthDetailTable({
  month, months, rows, roleLabel, loading,
  totalCount, currentPage, onPageChange,
  onMonthChange, onBack,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const columns = [
    { title: "Name",           key: "name" },
    { title: "Present Days",   key: "presentDays" },
    { title: "Absent Days",    key: "absentDays" },
    { title: "Leaves",         key: "leaves" },
    { title: "Late Check-ins", key: "lateCheckins" },
    { title: "Status",         key: "performance" },
  ];

  const tableData = rows.map(row => ({
    name:         row.name,
    presentDays:  row.presentDays,
    absentDays:   row.absentDays,
    leaves:       row.leaves,
    lateCheckins: row.lateCheckins,
    performance: (
      <span className={`font-semibold text-xs ${getPerformanceColor(row.performance)}`}>
        {row.performance}
      </span>
    ),
  }));

  return (
    <div className="w-full font-sans">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="cursor-pointer">
              <CaretLeft size={22} className="text-[#282828] font-bold" />
            </button>
          )}
          <h1 className="text-[16px] font-bold text-[#282828]">
            {roleLabel} Attendance Table
          </h1>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-[#43C17A] cursor-pointer text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium text-[13px] shadow-sm hover:bg-[#3baf6d] transition-colors"
          >
            {month}
            <CaretDown size={14} weight="bold" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-50 max-h-48 overflow-y-auto">
              {months.map((m) => (
                <button key={m} onClick={() => { onMonthChange(m); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-3 cursor-pointer py-1.5 text-[13px] transition-colors
                    ${month === m ? "bg-[#e8f8ef] text-[#43C17A] font-semibold" : "hover:bg-gray-50 text-gray-700"}`}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <TableShimmer />
      ) : rows.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No records for {month}</p>
      ) : (
        <>
          <TableComponent columns={columns} tableData={tableData} height="50vh" />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}
