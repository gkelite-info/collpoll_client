"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarIcon,
  MagnifyingGlass,
  PencilSimple,
  User,
  Users,
  X,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { ConfirmStatusModal } from "@/app/(screens)/faculty/leaveRequests/modal/ConfirmStatusModal";
import { decryptId, encryptId } from "@/app/utils/encryption";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import {
  fetchEmployeeLeaveRequestCounts,
  fetchPaginatedEmployeeLeaveRequests,
  updateEmployeeLeaveRequestStatus,
  type EmployeeLeaveRequestRecord,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";
import HrLeaveDetailsModal from "./HrLeaveDetailsModal";
import LeaveRequestsRight from "./LeaveRequestsRight";
import {
  ITEMS_PER_PAGE,
  LEAVE_TABLE_HEIGHT,
  STATUS_BY_ROUTE_CODE,
  STATUS_ROUTE_CODES,
} from "./data";
import { HrLeaveRow, HrLeaveStatus } from "./types";

const ROLE_FILTERS = [
  "College Admin",
  "Admin",
  "Faculty",
  "Finance Executive",
  "Finance Manager",
  "Placement",
  "College HR",
  "Wellbeing Executive",
  "Wellbeing Manager",
];

const ROLE_FILTER_TO_DB: Record<string, string> = {
  "College Admin": "CollegeAdmin",
  Admin: "Admin",
  Faculty: "Faculty",
  "Finance Executive": "Finance",
  "Finance Manager": "FinanceManager",
  Placement: "PlacementOfficer",
  "College HR": "CollegeHr",
  "Wellbeing Executive": "WellbeingExecutive",
  "Wellbeing Manager": "WellbeingManager",
};

const DB_ROLE_TO_LABEL: Record<string, string> = {
  CollegeAdmin: "College Admin",
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  FinanceManager: "Finance Manager",
  PlacementOfficer: "Placement",
  CollegeHr: "College HR",
  WellbeingExecutive: "Wellbeing Executive",
  WellbeingManager: "Wellbeing Manager",
};

const BASE_COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Photo", key: "photo" },
  { title: "Name", key: "name" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
];

const ROLE_COLUMN = { title: "Role", key: "role" };
const ACTION_COLUMN = { title: "Action", key: "action" };
const DETAILS_COLUMN = { title: "Details", key: "details" };
const REJECTED_COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Photo", key: "photo" },
  { title: "Name", key: "name" },
  { title: "Role", key: "role" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Reason", key: "reason" },
  { title: "Status", key: "statusBadge" },
  { title: "Details", key: "details" },
];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

const mapDbRequestToHrRow = (
  request: EmployeeLeaveRequestRecord,
): HrLeaveRow => ({
  id: request.employeeLeaveRequestId,
  employeeId: request.employee?.employeeId ?? String(request.employeeId),
  name: request.user?.fullName ?? "Employee",
  role: DB_ROLE_TO_LABEL[request.role] ?? titleCase(request.role),
  photo: request.user?.profileUrl ?? null,
  fromDate: formatDbDate(request.leaveFromDate),
  toDate: formatDbDate(request.leaveToDate),
  startDateIso: request.leaveFromDate,
  endDateIso: request.leaveToDate,
  days: calculateDays(request.leaveFromDate, request.leaveToDate),
  leaveType: titleCase(request.leaveType),
  description: request.description,
  status: request.status,
});

export default function LeaveRequestsClient() {
  const { collegeId, collegeHrId, loading: hrLoading } = useCollegeHr();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const routeStatus = searchParams.get("status");
  const activeTab = useMemo<HrLeaveStatus>(() => {
    const decryptedStatus = routeStatus ? decryptId(routeStatus) : null;
    return STATUS_BY_ROUTE_CODE[Number(decryptedStatus)] ?? "all";
  }, [routeStatus]);

  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<HrLeaveRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [counts, setCounts] = useState({
    all: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [selectedLeave, setSelectedLeave] = useState<HrLeaveRow | null>(null);
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    leaveId: number | null;
    action: "Approved" | "Rejected" | null;
  }>({ isOpen: false, leaveId: null, action: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      setEditingRows(new Set());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCounts = useCallback(async () => {
    if (hrLoading) return;

    if (!collegeId) {
      setCounts({ all: 0, approved: 0, pending: 0, rejected: 0 });
      setIsCardsLoading(false);
      return;
    }

    setIsCardsLoading(true);
    try {
      const nextCounts = await fetchEmployeeLeaveRequestCounts({ collegeId });
      setCounts({
        all: nextCounts.total,
        approved: nextCounts.approved,
        pending: nextCounts.pending,
        rejected: nextCounts.rejected,
      });
    } catch (error) {
      console.error("Error fetching HR leave counts:", error);
      setCounts({ all: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setIsCardsLoading(false);
    }
  }, [collegeId, hrLoading]);

  const loadRequests = useCallback(async () => {
    if (hrLoading) return;

    if (!collegeId) {
      setTableData([]);
      setTotalItems(0);
      setIsTableLoading(false);
      return;
    }

    setIsTableLoading(true);
    try {
      const status =
        activeTab === "all"
          ? undefined
          : (activeTab as "approved" | "pending" | "rejected");
      const { data, totalCount } = await fetchPaginatedEmployeeLeaveRequests({
        collegeId,
        status,
        role: activeRole ? ROLE_FILTER_TO_DB[activeRole] : undefined,
        page,
        pageSize: ITEMS_PER_PAGE,
        search: debouncedSearch,
        date: selectedDateKey,
      });

      setTableData(data.map(mapDbRequestToHrRow));
      setTotalItems(totalCount);
    } catch (error) {
      console.error("Error fetching HR leave requests:", error);
      setTableData([]);
      setTotalItems(0);
    } finally {
      setIsTableLoading(false);
    }
  }, [
    activeRole,
    activeTab,
    collegeId,
    debouncedSearch,
    hrLoading,
    page,
    selectedDateKey,
  ]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const setRouteStatus = (status: HrLeaveStatus) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", encryptId(STATUS_ROUTE_CODES[status]));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setPage(1);
    setEditingRows(new Set());
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDateKey(toDateKey(date));
    setIsDatePickerOpen(false);
    setPage(1);
    setEditingRows(new Set());
  };

  const clearDateFilter = () => {
    setSelectedDateKey("");
    setIsDatePickerOpen(false);
    setPage(1);
    setEditingRows(new Set());
  };

  const executeStatusChange = async () => {
    const { leaveId, action } = confirmModal;
    if (!leaveId || !action) return;

    setConfirmModal({ isOpen: false, leaveId: null, action: null });
    try {
      await updateEmployeeLeaveRequestStatus({
        employeeLeaveRequestId: leaveId,
        status: action.toLowerCase() as "approved" | "rejected",
        approvedBy: collegeHrId,
      });
      toast.success(`Leave ${action.toLowerCase()} successfully`);
      setEditingRows((prev) => {
        const next = new Set(prev);
        next.delete(leaveId);
        return next;
      });
      await Promise.all([loadRequests(), loadCounts()]);
    } catch (error) {
      console.error("Error updating HR leave status:", error);
      toast.error("Unable to update leave status");
    }
  };

  const columns = useMemo(() => {
    if (activeTab === "rejected") return REJECTED_COLUMNS;
    const columnsWithRole = [
      ...BASE_COLUMNS.slice(0, 4),
      ROLE_COLUMN,
      ...BASE_COLUMNS.slice(4),
    ];
    return activeTab === "approved"
      ? [...columnsWithRole, DETAILS_COLUMN]
      : [...columnsWithRole, ACTION_COLUMN, DETAILS_COLUMN];
  }, [activeTab]);

  const processedData = useMemo(
    () =>
      tableData.map((item, index) => {
        const isEditing = editingRows.has(item.id);

        return {
          sNo: String((page - 1) * ITEMS_PER_PAGE + index + 1).padStart(
            2,
            "0",
          ),
          employeeId: (
            <>
              <span className="font-bold text-[#43C17A]">ID</span> -{" "}
              {item.employeeId}
            </>
          ),
          photo: <Avatar src={item.photo} size={32} alt={item.name} />,
          name: (
            <span className="inline-block max-w-[150px] truncate font-medium">
              {item.name}
            </span>
          ),
          role: item.role,
          dateRange: `${item.fromDate} - ${item.toDate}`,
          days: item.days,
          leaveType: item.leaveType,
          reason: item.leaveType,
          description: (
            <span
              className="inline-block max-w-[210px] truncate text-sm"
              title={item.description}
            >
              {item.description}
            </span>
          ),
          statusBadge: (
            <span
              className={`rounded-full px-5 py-1.5 text-sm font-medium ${
                item.status === "rejected"
                  ? "bg-[#FFE0E0] text-[#FF1F1F]"
                  : item.status === "approved"
                    ? "bg-[#E7F8EE] text-[#43C17A]"
                    : "bg-[#FFF4EB] text-[#FFB874]"
              }`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          ),
          details: (
            <button
              type="button"
              onClick={() => setSelectedLeave(item)}
              className="cursor-pointer text-sm font-semibold text-[#006BFF] hover:underline"
            >
              View Details
            </button>
          ),
          action:
            item.status === "pending" || isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      leaveId: item.id,
                      action: "Approved",
                    })
                  }
                  className="cursor-pointer rounded-full bg-[#E7F8EE] px-3 py-1 text-xs font-semibold text-[#43C17A] transition-colors hover:bg-[#d0f0de]"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      leaveId: item.id,
                      action: "Rejected",
                    })
                  }
                  className="cursor-pointer rounded-full bg-[#FFE5E5] px-3 py-1 text-xs font-semibold text-[#FF4B4B] transition-colors hover:bg-[#ffd1d1]"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    item.status === "approved"
                      ? "text-[#43C17A]"
                      : "text-[#FF4B4B]"
                  }`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                <button
                  onClick={() =>
                    setEditingRows((prev) => new Set(prev).add(item.id))
                  }
                  className="cursor-pointer p-1 text-gray-400 transition-colors hover:text-[#16284F]"
                  title="Change Status"
                >
                  <PencilSimple size={16} weight="bold" />
                </button>
              </div>
            ),
        };
      }),
    [tableData, editingRows, page],
  );

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
        .hr-leave-table table {
          min-width: ${activeTab === "rejected" ? "980px" : columns.length > 9 ? "1120px" : "1040px"};
        }
      `}</style>

      <main className="flex w-full items-start gap-5 p-2 pb-8 text-[#282828]">
        <section className="flex min-h-screen w-full flex-col pb-6 md:w-[68%]">
          <div className="mb-5 flex flex-col justify-start">
            <h1 className="text-xl font-bold text-[#282828]">
               Leave Requests
            </h1>
            <p className="mt-1 text-sm text-[#525252]">
              Review, approve, and manage faculty leave applications effortlessly
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map((card) => {
              const isActive = activeTab === card.id;

              return isCardsLoading ? (
                <div
                  key={card.id}
                  className="h-28 w-full animate-pulse rounded-sm bg-white shadow-sm"
                >
                  <div className="flex h-full flex-col justify-between p-4">
                    <div className="h-10 w-10 rounded-md bg-gray-200" />
                    <div>
                      <div className="mb-2 h-6 w-12 rounded bg-gray-200" />
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ) : (
                <CardComponent
                  key={card.id}
                  isActive={isActive}
                  style={`w-full cursor-pointer transition-all duration-300 ${
                    isActive ? card.activeColor : card.inactiveColor
                  }`}
                  icon={card.icon}
                  value={card.value}
                  label={card.label}
                  iconBgColor={
                    isActive ? card.iconBgActive : card.iconBgInactive
                  }
                  iconColor="#FFFFFF"
                  textSize={isActive ? "text-white" : "text-[#282828]"}
                  onClick={() => setRouteStatus(card.id)}
                />
              );
            })}
          </div>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {ROLE_FILTERS.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(activeRole === role ? null : role);
                  setPage(1);
                  setEditingRows(new Set());
                }}
                className={`shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeRole === role
                    ? "border-[#22C55E] bg-[#E8F8EF] text-[#22C55E]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#22C55E] hover:text-[#22C55E]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center rounded-full bg-[#EAEAEA] px-4 py-2 sm:max-w-[430px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by Employee Name, ID, Role, or Leave Type"
                className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#6B7280]"
              />
              <MagnifyingGlass
                size={20}
                className="flex-shrink-0 text-[#22C55E]"
              />
            </div>

            <div className="relative self-start sm:self-auto">
              {!isDatePickerOpen ? (
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-md bg-[#DAE9E1] px-4 py-1.5 text-[#43C17A] transition-colors hover:bg-[#cbe6d7]"
                  title="Select date"
                >
                  <CalendarIcon size={18} weight="fill" />
                  <span className="text-sm font-bold tracking-wide">
                    {selectedDateKey
                      ? formatDateKey(selectedDateKey)
                      : new Date().toLocaleDateString("en-GB")}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-[#43C17A] bg-white p-1 shadow-sm">
                  <CalendarIcon
                    size={18}
                    className="ml-2 text-[#43C17A]"
                    weight="fill"
                  />
                  <input
                    type="date"
                    value={selectedDateKey}
                    onChange={(event) => {
                      if (event.target.value) {
                        handleDateSelect(
                          new Date(`${event.target.value}T00:00:00`),
                        );
                      }
                    }}
                    className="cursor-pointer rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#43C17A]"
                  />
                  {selectedDateKey && (
                    <button
                      onClick={clearDateFilter}
                      className="cursor-pointer rounded px-1 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    title="Close"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="hr-leave-table w-full">
            <TableComponent
              columns={columns}
              tableData={isTableLoading ? [] : processedData}
              height={LEAVE_TABLE_HEIGHT}
              isLoading={isTableLoading}
              fillHeight
            />
          </div>

          <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              setEditingRows(new Set());
            }}
          />
        </section>

        <LeaveRequestsRight
          activeDate={
            selectedDateKey
              ? new Date(`${selectedDateKey}T00:00:00`)
              : new Date()
          }
          onDateSelect={handleDateSelect}
        />
      </main>

      <ConfirmStatusModal
        isOpen={confirmModal.isOpen}
        action={confirmModal.action}
        onClose={() =>
          setConfirmModal({ isOpen: false, leaveId: null, action: null })
        }
        onConfirm={executeStatusChange}
      />

      <HrLeaveDetailsModal
        leave={selectedLeave}
        onClose={() => setSelectedLeave(null)}
      />
    </>
  );
}
