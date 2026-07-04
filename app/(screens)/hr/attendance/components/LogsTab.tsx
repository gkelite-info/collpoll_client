"use client";

import { useEffect, useState, useCallback } from "react";
import { getFinalizationLogs, FinalizationLogData } from "@/lib/helpers/Hr/attendance/finalizationLogAPI";
import { useUser } from "@/app/utils/context/UserContext";

import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import toast from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MagnifyingGlass, CalendarDots, WarningCircle, ClockCounterClockwise } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

// const ITEMS_PER_PAGE = 50; // moved to state

const columns = [
  { title: "Target Date", key: "targetDate" },
  { title: "Run Timestamp", key: "runTimestamp" },
  { title: "Total Staff", key: "totalStaff" },
  { title: "Status Breakdown", key: "statusBreakdown" },
  { title: "Triggered By", key: "triggeredBy" },
  { title: "Issues", key: "issues" },
];

export default function LogsTab() {
  const { collegeId, userId } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialFromDate = searchParams.get("logFrom") || "";
  const initialToDate = searchParams.get("logTo") || "";
  const initialSearch = searchParams.get("logSearch") || "";
  const initialPage = Number(searchParams.get("logPage")) || 1;

  const [logs, setLogs] = useState<FinalizationLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [triggering, setTriggering] = useState(false);
  
  const [fromDate, setFromDate] = useState<string>(initialFromDate);
  const [toDate, setToDate] = useState<string>(initialToDate);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchLogs = useCallback(async () => {
    if (!collegeId) return;
    setLoading(true);
    const { success, data, totalCount: count, error } = await getFinalizationLogs({
      collegeId,
      page: currentPage,
      limit: itemsPerPage,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      searchQuery: debouncedSearchQuery || undefined,
    });

    if (success) {
      setLogs(data);
      setTotalCount(count);
    } else {
      toast.error("Failed to fetch logs", { id: "fetch-logs-error" });
    }
    setLoading(false);
  }, [collegeId, currentPage, itemsPerPage, fromDate, toDate, debouncedSearchQuery]);

  useEffect(() => {
    if (fromDate && toDate) {
      if (new Date(toDate) < new Date(fromDate)) {
        toast.error("To Date cannot be earlier than From Date", { id: "date-error-logs" });
        return;
      }
    }
    if (fromDate) {
      const year = new Date(fromDate).getFullYear();
      if (year < 2026) {
        toast.error("Logs are only available from 2026 onwards.", { id: "year-error-from" });
        return;
      }
    }
    if (toDate) {
      const year = new Date(toDate).getFullYear();
      if (year < 2026) {
        toast.error("Logs are only available from 2026 onwards.", { id: "year-error-to" });
        return;
      }
    }

    if (collegeId) {
      fetchLogs();
    }
  }, [fetchLogs, fromDate, toDate, collegeId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let changed = false;

    const updateParam = (key: string, value: string | null) => {
      if (value) {
        if (params.get(key) !== value) {
          params.set(key, value);
          changed = true;
        }
      } else {
        if (params.has(key)) {
          params.delete(key);
          changed = true;
        }
      }
    };

    updateParam("logFrom", fromDate);
    updateParam("logTo", toDate);
    updateParam("logSearch", debouncedSearchQuery);
    updateParam("logPage", currentPage > 1 ? currentPage.toString() : null);

    if (changed) {
      const newUrl = `${pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [fromDate, toDate, debouncedSearchQuery, currentPage, pathname, router, searchParams]);

  const handleManualTrigger = async () => {
    setIsConfirmModalOpen(false);
    setTriggering(true);
    try {
      const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const res = await fetch("/api/hr/re-finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ targetDate: date, userId })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Finalization completed successfully!", { id: "manual-trigger-success" });
        setCurrentPage(1);
        fetchLogs();
      } else {
        toast.error("Failed to trigger finalization", { id: "manual-trigger-error" });
      }
    } catch (err: any) {
      toast.error("Something went wrong", { id: "manual-trigger-catch" });
    } finally {
      setTriggering(false);
    }
  };

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(new Date(dateString));
  };

  const tableData = logs.map((log) => ({
    targetDate: (
      <span className="font-medium text-gray-900 whitespace-nowrap">
        {formatDate(log.finalizationDate)}
      </span>
    ),
    runTimestamp: (
      <span className="text-gray-600 whitespace-nowrap">
        {formatDateTime(log.createdAt)}
      </span>
    ),
    totalStaff: (
      <span className="whitespace-nowrap">
        <span className="font-semibold text-gray-700">{log.totalStaff}</span> processed
      </span>
    ),
    statusBreakdown: (
      <div className="whitespace-nowrap">
        {log.skippedHoliday ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Holiday / Closed
          </span>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-600 font-medium" title="Present">{log.presentCount} P</span>
            <span className="text-red-600 font-medium" title="Absent">{log.absentCount} A</span>
            <span className="text-amber-500 font-medium" title="Half-Day">{log.halfDayCount} HD</span>
          </div>
        )}
      </div>
    ),
    triggeredBy: (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
        log.triggeredBy === 'cron' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {log.triggeredBy === 'cron' ? 'Auto Scheduled' : 'Manually Run'}
      </span>
    ),
    issues: (
      <div className="flex justify-center whitespace-nowrap">
        {log.errorCount > 0 ? (
          <button 
            onClick={() => setErrorModalContent(log.errorMessage || "An unknown error occurred during finalization. Please check server logs.")}
            className="inline-flex items-center gap-1 text-red-600 font-medium hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors cursor-pointer"
          >
            <WarningCircle size={16} />
            {log.errorCount} Error{log.errorCount > 1 ? "s" : ""}
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  }));



  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in-up">
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
        
        {/* Top Row: Title & Trigger Button */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ClockCounterClockwise size={24} className="text-blue-500" />
              Finalization Logs
            </h2>
            <p className="text-sm text-gray-500 mt-1">History of the nightly EOD attendance calculation runs</p>
          </div>
          
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={triggering}
            className="px-4 h-[42px] bg-gradient-to-r from-[#6C20CA] to-[#8C3BEA] text-white text-sm font-medium rounded-xl shadow hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            {triggering ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            )}
            Trigger Run Manually
          </button>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 w-full pt-2 border-t border-gray-50">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 h-[42px] text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 hover:bg-gray-100/50 text-gray-800 placeholder:text-gray-400"
              />
              <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-40">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:block">From Date</label>
              <div className="relative group">
                <div className="absolute inset-0 flex items-center pl-10 pr-4 border border-gray-200 rounded-xl bg-gray-50 text-sm transition-all group-hover:bg-gray-100/50 group-focus-within:ring-2 group-focus-within:ring-emerald-500/20 group-focus-within:border-emerald-500 pointer-events-none">
                  {fromDate ? <span className="text-gray-700 font-medium">{fromDate.split("-").reverse().join("/")}</span> : <span className="text-gray-400 font-medium">From Date</span>}
                </div>
                <input
                  type="date"
                  min="2026-01-01"
                  max={toDate || new Date().toISOString().split('T')[0]}
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full opacity-0 cursor-pointer h-[42px] z-10 relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <CalendarDots className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-20 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-40">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:block">To Date</label>
              <div className="relative group">
                <div className="absolute inset-0 flex items-center pl-10 pr-4 border border-gray-200 rounded-xl bg-gray-50 text-sm transition-all group-hover:bg-gray-100/50 group-focus-within:ring-2 group-focus-within:ring-emerald-500/20 group-focus-within:border-emerald-500 pointer-events-none">
                  {toDate ? <span className="text-gray-700 font-medium">{toDate.split("-").reverse().join("/")}</span> : <span className="text-gray-400 font-medium">To Date</span>}
                </div>
                <input
                  type="date"
                  min={fromDate || "2026-01-01"}
                  max={new Date().toISOString().split('T')[0]}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full opacity-0 cursor-pointer h-[42px] z-10 relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <CalendarDots className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-20 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer whitespace-nowrap mb-1 sm:mb-2 lg:mb-1 self-start xl:self-auto"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <TableComponent
          columns={columns}
          tableData={tableData}
          isLoading={loading}
          fillHeight
          height="50vh"
          emptyStateMessage="No finalization logs found for the selected filters."
        />
        {totalCount > 0 && (
          <div className="mt-1 border-t rounded-lg">
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              roundedBottom="rounded-lg"
              itemsPerPageOptions={[10, 20, 50, 100]}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items);
                setCurrentPage(1);
              }}
              disabled={loading}
            />
          </div>
        )}
      </div>
      
      <ConfirmDeleteModal 
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleManualTrigger}
        title="Trigger"
        name="EOD Finalization Manually"
        customDescription="Are you sure you want to run the EOD Attendance Finalization now? This will recalculate today's attendance."
        confirmText="Yes, Run Now"
        actionType="accept"
        isDeleting={triggering}
      />

      {errorModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-red-50/50">
              <div className="bg-red-100 p-2 rounded-full">
                <WarningCircle size={24} className="text-red-600" weight="fill" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Execution Error</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Error Details:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {errorModalContent}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setErrorModalContent(null)}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
