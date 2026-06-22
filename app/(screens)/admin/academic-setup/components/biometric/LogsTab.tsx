"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ClockCounterClockwise, CalendarDots, WarningCircle, CheckCircle, CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "../pagination";
import { getDeviceAttendanceLogs, DeviceAttendanceLogRow } from "@/lib/helpers/devices/deviceAttendanceLogAPI";
import { getBiometricDevices, BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";

const ITEMS_PER_PAGE = 50;

const columns = [
  { title: "User Info", key: "user" },
  { title: "Category / Type", key: "logType" },
  { title: "Device", key: "device" },
  { title: "Check In", key: "checkIn" },
  { title: "Check Out", key: "checkOut" },
  { title: "Scan Time", key: "time" },
  { title: "Status", key: "status" },
];

const formatHHMM = (timeStr: string | null | undefined) => {
  if (!timeStr) return "--";
  const [h, m] = timeStr.split(":");
  const d = new Date();
  d.setHours(parseInt(h, 10), parseInt(m, 10), 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[]; 
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full cursor-pointer flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm transition-all bg-gray-50 hover:bg-gray-100/50 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isOpen ? 'ring-2 ring-emerald-500/20 border-emerald-500 text-emerald-700' : 'text-gray-700'
        }`}
      >
        <span className={!value ? "text-gray-400" : "font-medium"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} 
          weight="bold" 
          size={16} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar animate-fade-in-up origin-top">
          <div
            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
              value === "" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                value === opt.value ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LogsTab() {
  const { collegeId, loading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [logs, setLogs] = useState<DeviceAttendanceLogRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters (init from URL)
  const initialCategory = searchParams.get("logCategory") as "Gate" | "Classroom" | "" || "";
  const initialDeviceId = searchParams.get("logDevice") || "";
  const initialFromDate = searchParams.get("logFrom") || "";
  const initialToDate = searchParams.get("logTo") || "";
  const initialSearch = searchParams.get("logSearch") || "";
  const initialPage = Number(searchParams.get("logPage")) || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [category, setCategory] = useState<"Gate" | "Classroom" | "">(initialCategory);
  const [deviceId, setDeviceId] = useState<string>(initialDeviceId);
  const [fromDate, setFromDate] = useState<string>(initialFromDate);
  const [toDate, setToDate] = useState<string>(initialToDate);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Devices Dropdown
  const [devices, setDevices] = useState<BiometricDeviceRow[]>([]);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);

  // Fetch devices based on category
  const fetchDevices = useCallback(async (cat: "Gate" | "Classroom" | "") => {
    if (!collegeId) return;
    setIsDevicesLoading(true);
    let devCategoryFilter: "gate" | "classroom" | undefined = undefined;
    if (cat === "Gate") devCategoryFilter = "gate";
    if (cat === "Classroom") devCategoryFilter = "classroom";
    
    // Fetch all active devices for the dropdown
    const res = await getBiometricDevices(collegeId, 1, 1000, {
      deviceCategory: devCategoryFilter,
      isActive: true,
    });
    if (res.success) {
      setDevices(res.data);
    }
    setIsDevicesLoading(false);
  }, [collegeId]);

  // Load devices initially or when category changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDevices(category);
  }, [category, fetchDevices]);

  const fetchLogs = useCallback(async () => {
    if (!collegeId) return;
    setIsLoading(true);

    let logTypes: string[] | undefined = undefined;
    if (category === "Gate") {
      logTypes = ["gateentry", "gateexit"];
    } else if (category === "Classroom") {
      logTypes = ["classattendance"];
    }

    const filters: Record<string, string | number | string[]> = {};
    if (deviceId) filters.deviceId = Number(deviceId);
    if (logTypes) filters.logTypes = logTypes;
    if (fromDate) filters.fromDate = `${fromDate}T00:00:00.000Z`;
    if (toDate) filters.toDate = `${toDate}T23:59:59.999Z`;
    if (debouncedSearchQuery) filters.searchQuery = debouncedSearchQuery;

    const res = await getDeviceAttendanceLogs(collegeId, currentPage, ITEMS_PER_PAGE, filters);

    if (res.success) {
      setLogs(res.data);
      setTotalItems(res.total);
    } else {
      toast.error(res.error || "Failed to fetch logs", { id: "fetch-logs-error" });
    }
    setIsLoading(false);
  }, [collegeId, currentPage, category, deviceId, fromDate, toDate, debouncedSearchQuery]);

  useEffect(() => {
    // Validate dates before fetching
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

    fetchLogs();
  }, [fetchLogs, category, deviceId, fromDate, toDate, debouncedSearchQuery, currentPage]);

  useEffect(() => {
    // Sync with URL
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("logCategory", category); else params.delete("logCategory");
    if (deviceId) params.set("logDevice", deviceId); else params.delete("logDevice");
    if (fromDate) params.set("logFrom", fromDate); else params.delete("logFrom");
    if (toDate) params.set("logTo", toDate); else params.delete("logTo");
    if (debouncedSearchQuery) params.set("logSearch", debouncedSearchQuery); else params.delete("logSearch");
    if (currentPage > 1) params.set("logPage", currentPage.toString()); else params.delete("logPage");
    
    // Only replace if URL actually needs updating to prevent unnecessary history entries
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [category, deviceId, fromDate, toDate, debouncedSearchQuery, currentPage, pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setCategory("");
    setDeviceId("");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const formatLogType = (type: string) => {
    const t = type.toLowerCase();
    if (t === "gateentry") return "Gate Entry";
    if (t === "gateexit") return "Gate Exit";
    if (t === "classattendance") return "Classroom";
    return type;
  };

  const tableData = logs.map((log) => {
    const isSuccess = log.processedStatus.toLowerCase() === "accepted";
    const isError = log.processedStatus.toLowerCase() === "rejected" || log.processedStatus.toLowerCase() === "error";

    return {
      user: (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{log.user?.fullName || "Unknown User"}</span>
          <span className="text-xs text-gray-500 capitalize">{log.user?.role || "N/A"}</span>
        </div>
      ),
      logType: (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 capitalize">
            {formatLogType(log.logType)}
          </span>
          <span className="text-xs text-gray-400 capitalize">Method: {log.authMethod}</span>
        </div>
      ),
      device: (
        <span className="text-sm text-gray-600">
          {log.device?.deviceName || `Device ID: ${log.deviceId}`}
        </span>
      ),
      time: (
        <span className="text-gray-700 whitespace-nowrap text-sm font-medium">
          {new Date(log.scanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
      checkIn: (
        <span className="text-gray-700 whitespace-nowrap font-medium">
          {formatHHMM(log.checkIn)}
        </span>
      ),
      checkOut: (
        <span className="text-gray-700 whitespace-nowrap font-medium">
          {formatHHMM(log.checkOut)}
        </span>
      ),
      status: (
        <div className="flex flex-col items-center text-center">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-max ${
            isSuccess ? "bg-emerald-100 text-emerald-700" : isError ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
          }`}>
            {isSuccess ? <CheckCircle weight="fill" /> : isError ? <WarningCircle weight="fill" /> : <ClockCounterClockwise weight="fill" />}
            {log.processedStatus}
          </span>
          {log.rejectionReason && (
            <span className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={log.rejectionReason}>
              {log.rejectionReason}
            </span>
          )}
        </div>
      )
    };
  });

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in-up">
      {/* Header & Filters */}
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 whitespace-nowrap">
            <ClockCounterClockwise size={24} className="text-blue-500" />
            Device Attendance Logs
          </h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search user name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 hover:bg-gray-100/50 text-gray-800 placeholder:text-gray-400"
              />
              <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <button
              onClick={handleResetFilters}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
            <CustomSelect
              value={category}
              onChange={(val) => {
                setCategory(val as "Gate" | "Classroom" | "");
                setDeviceId(""); // Reset device when category changes
                setCurrentPage(1); // Reset page on filter change
              }}
              options={[
                { label: "Gate Logs", value: "Gate" },
                { label: "Classroom Logs", value: "Classroom" }
              ]}
              placeholder="All Categories"
            />
          </div>

          {/* Device Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Device</label>
            <CustomSelect
              value={deviceId}
              onChange={(val) => {
                setDeviceId(val);
                setCurrentPage(1);
              }}
              options={devices.map(d => ({ label: d.deviceName, value: String(d.deviceId) }))}
              placeholder="All Devices"
              disabled={isDevicesLoading}
            />
          </div>

          {/* From Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From Date</label>
            <div className="relative">
              <input
                type="date"
                min="2026-01-01"
                max={new Date().toISOString().split('T')[0]}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full cursor-pointer appearance-none border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 hover:bg-gray-100/50 text-gray-700 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <CalendarDots className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To Date</label>
            <div className="relative">
              <input
                type="date"
                min="2026-01-01"
                max={new Date().toISOString().split('T')[0]}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full cursor-pointer appearance-none border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 hover:bg-gray-100/50 text-gray-700 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <CalendarDots className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
        <TableComponent
          columns={columns}
          tableData={tableData}
          isLoading={isLoading || userLoading}
          emptyStateMessage="No attendance logs found for the selected filters. Please note that these logs only reflect raw biometric device scans."
        />
        {!(isLoading || userLoading) && totalItems > 0 && (
          <div className=" border-t">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              roundedBottom="rounded-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
