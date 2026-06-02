"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import {
  Users,
  User,
  MagnifyingGlass,
  CalendarIcon,
  X,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import toast from "react-hot-toast";

import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { Loader } from "../../(student)/calendar/right/timetable";
import WellbeingRequestLeaveModal from "./modal/RequestLeaveModal";
import LeaveRequestDetailsModal from "./modal/LeaveRequestDetailsModal";
import { useUser } from "@/app/utils/context/UserContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchPaginatedEmployeeLeaveRequests,
  fetchEmployeeLeaveRequestCounts,
  createEmployeeLeaveRequest,
  type EmployeeLeaveRequestRecord,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";

const MY_LEAVES_COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Status", key: "statusBadge" },
  { title: "Details", key: "details" },
];

const formatDateKey = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB");

const formatDbDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB");

const titleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const calculateDays = (fromDate: string, toDate: string) => {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  const diff = Math.max(0, to.getTime() - from.getTime());
  return String(Math.floor(diff / 86_400_000) + 1).padStart(2, "0");
};

const mapDbRequestToRow = (request: EmployeeLeaveRequestRecord) => {
  const fromDate = formatDbDate(request.leaveFromDate);
  const toDate = formatDbDate(request.leaveToDate);
  const leaveType = titleCase(request.leaveType);

  return {
    ...request,
    fromDate,
    toDate,
    days: calculateDays(request.leaveFromDate, request.leaveToDate),
    leaveType,
    dateRange: `${fromDate} - ${toDate}`,
  };
};

type EmployeeLeaveRequestRow = ReturnType<typeof mapDbRequestToRow>;

type EmployeeLeaveRequestFormData = {
  leaveType: string;
  startDate: string;
  endDate: string;
  description: string;
};

function WellbeingLeavesContent() {
  const { userId, collegeId, loading: userContextLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("status") || "all") as
    | "all"
    | "approved"
    | "pending"
    | "rejected";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [requests, setRequests] = useState<EmployeeLeaveRequestRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeaveData, setSelectedLeaveData] =
    useState<EmployeeLeaveRequestRow | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCounts = useCallback(async () => {
    if (userContextLoading || !userId || !collegeId) return;
    try {
      const res = await fetchEmployeeLeaveRequestCounts({
        userId,
        collegeId,
        role: "WellbeingManager",
        date: selectedDateKey || undefined,
      });
      setCounts({
        all: res.total,
        approved: res.approved,
        pending: res.pending,
        rejected: res.rejected,
      });
    } catch (error) {
      console.error("Error fetching leave counts:", error);
    }
  }, [userId, collegeId, userContextLoading, selectedDateKey]);

  const loadRequests = useCallback(async () => {
    if (userContextLoading) return;
    if (!userId || !collegeId) {
      setRequests([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, totalCount } = await fetchPaginatedEmployeeLeaveRequests({
        userId,
        collegeId,
        role: "WellbeingManager",
        status: activeTab === "all" ? undefined : activeTab,
        page,
        pageSize: itemsPerPage,
        search: debouncedSearch,
        date: selectedDateKey || undefined,
      });
      setRequests(data.map(mapDbRequestToRow));
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setRequests([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    userId,
    collegeId,
    userContextLoading,
    activeTab,
    page,
    debouncedSearch,
    selectedDateKey,
  ]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const handleCreated = () => {
      loadCounts();
      loadRequests();
    };
    window.addEventListener("employee-leave-request-created", handleCreated);
    return () =>
      window.removeEventListener("employee-leave-request-created", handleCreated);
  }, [loadCounts, loadRequests]);

  const handleTabChange = (tabId: "all" | "approved" | "pending" | "rejected") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "all") {
      params.delete("status");
    } else {
      params.set("status", tabId);
    }
    setPage(1);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleMyLeaveSubmit = async (formData: EmployeeLeaveRequestFormData) => {
    if (!userId || !collegeId) {
      toast.error("User session not found.");
      return;
    }
    try {
      await createEmployeeLeaveRequest({
        userId,
        collegeId,
        role: "WellbeingManager",
        leaveType: formData.leaveType,
        leaveFromDate: formData.startDate,
        leaveToDate: formData.endDate,
        description: formData.description.trim(),
      });
      toast.success("Leave request submitted successfully!");
      window.dispatchEvent(new Event("employee-leave-request-created"));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating leave request:", error);
      toast.error("Failed to submit leave request.");
    }
  };

  const finalTableData = useMemo(() => {
    return requests.map((item, index) => {
      return {
        sNo: String((page - 1) * itemsPerPage + index + 1).padStart(2, "0"),
        dateRange: `${item.fromDate} - ${item.toDate}`,
        days: item.days,
        leaveType: item.leaveType,
        description: (
          <span
            className="truncate max-w-[200px] md:max-w-[300px] inline-block text-sm"
            title={item.description}
          >
            {item.description}
          </span>
        ),
        statusBadge: (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              item.status === "approved"
                ? "bg-[#E7F8EE] text-[#43C17A]"
                : item.status === "rejected"
                ? "bg-[#FFE5E5] text-[#FF4B4B]"
                : "bg-[#FFF4EB] text-[#FFB874]"
            }`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        ),
        details: (
          <button
            onClick={() => {
              setSelectedLeaveData(item);
              setIsDetailsModalOpen(true);
            }}
            className="text-blue-600 font-bold text-xs hover:underline cursor-pointer"
          >
            View Details
          </button>
        ),
      };
    });
  }, [requests, page]);

  const cards = [
    {
      id: "all",
      label: "Total Requests",
      value: String(counts.all).padStart(2, "0"),
      icon: <Users size={24} weight="fill" />,
      activeColor: "bg-[#5C98FF]",
      inactiveColor: "bg-[#EBF2FF]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#5C98FF",
    },
    {
      id: "approved",
      label: "Approved",
      value: String(counts.approved).padStart(2, "0"),
      icon: <User size={24} weight="fill" />,
      activeColor: "bg-[#48C37C]",
      inactiveColor: "bg-[#E7F8EE]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#48C37C",
    },
    {
      id: "pending",
      label: "Pending",
      value: String(counts.pending).padStart(2, "0"),
      icon: <User size={24} weight="fill" />,
      activeColor: "bg-[#FFB874]",
      inactiveColor: "bg-[#FFF4EB]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#FFB874",
    },
    {
      id: "rejected",
      label: "Rejected",
      value: String(counts.rejected).padStart(2, "0"),
      icon: <User size={24} weight="fill" />,
      activeColor: "bg-[#FF4242]",
      inactiveColor: "bg-[#FFE5E5]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#FF4242",
    },
  ] as const;

  return (
    <>
      <style>{`
        .table-container-wrapper > div > div {
          min-height: 450px !important;
        }
        .table-container-wrapper > div > div > div.overflow-auto {
          overflow-x: auto !important;
          overflow-y: auto !important;
          min-height: 450px !important;
        }
        @media (max-width: 640px) {
          .table-container-wrapper > div > div {
            min-height: 320px !important;
          }
          .table-container-wrapper > div > div > div.overflow-auto {
            min-height: 320px !important;
          }
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar {
          height: 10px !important;
          width: 8px !important;
          display: block !important;
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid #f1f5f9;
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .table-container-wrapper table {
          min-width: 1100px !important;
        }
      `}</style>

      <div className="flex flex-col p-2 w-full max-w-[100%] mx-auto min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 text-2xl font-bold">
              <span className="text-[#43C17A] text-lg md:text-2xl">
                My Leave Request
              </span>
            </div>
            <p className="text-[#525252] text-sm font-medium">
              Submit leave applications and view approval updates from HR.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#16284F] text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm hover:bg-[#102040] transition-colors cursor-pointer whitespace-nowrap"
          >
            Request Leave
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {cards.map((card) => {
            const isActive = activeTab === card.id;
            return (
              <CardComponent
                key={card.id}
                isActive={isActive}
                style={`w-full cursor-pointer transition-all duration-300 ${isActive ? card.activeColor : card.inactiveColor}`}
                icon={card.icon}
                value={card.value}
                label={card.label}
                iconBgColor={isActive ? card.iconBgActive : card.iconBgInactive}
                iconColor="#FFFFFF"
                textSize={isActive ? "text-white" : "text-[#282828]"}
                onClick={() => handleTabChange(card.id)}
              />
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row justify-between items-center rounded-xl md:px-4 py-3 ">
          <div className="order-2 sm:order-1 relative w-full max-w-full sm:max-w-[300px] flex items-center ">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 text-[#43C17A] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by leave type or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] placeholder-gray-500"
            />
          </div>

          <div className="order-1 sm:order-2 self-end sm:self-center">
            {!isDatePickerOpen ? (
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="flex items-center gap-2 bg-[#DAE9E1] px-4 py-1.5 rounded-md text-[#43C17A] font-bold text-sm tracking-wide cursor-pointer hover:bg-[#cbe6d7] transition-colors"
                title="Select date"
              >
                <CalendarIcon size={18} weight="fill" />
                {selectedDateKey
                  ? formatDateKey(selectedDateKey)
                  : new Date().toLocaleDateString("en-GB")}
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-[#43C17A] bg-white p-1 shadow-sm h-[32px]">
                <CalendarIcon
                  size={18}
                  className="ml-1 text-[#43C17A]"
                  weight="fill"
                />
                <input
                  type="date"
                  value={selectedDateKey}
                  onChange={(event) => {
                    if (event.target.value) {
                      setSelectedDateKey(event.target.value);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  className="cursor-pointer rounded border border-gray-300 px-1 py-0.5 text-xs text-gray-700 outline-none focus:border-[#43C17A]"
                />
                {selectedDateKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateKey("");
                      setIsDatePickerOpen(false);
                    }}
                    className="cursor-pointer rounded px-1 text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  title="Close"
                >
                  <X size={12} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="-mt-2 w-full table-container-wrapper">
          <TableComponent
            columns={MY_LEAVES_COLUMNS}
            tableData={isLoading ? [] : finalTableData}
            height="55vh"
            isLoading={isLoading}
          />
        </div>

        {!isLoading && totalCount > itemsPerPage && (
          <div className="mt-1">
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />
          </div>
        )}

        <WellbeingRequestLeaveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleMyLeaveSubmit}
        />

        <LeaveRequestDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          leaveData={selectedLeaveData}
        />
      </div>
    </>
  );
}

export default function WellbeingLeavesLeft() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full py-10">
          <Loader />
        </div>
      }
    >
      <WellbeingLeavesContent />
    </Suspense>
  );
}

 
