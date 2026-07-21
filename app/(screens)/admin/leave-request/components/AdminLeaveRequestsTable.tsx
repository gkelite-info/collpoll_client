"use client";

import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { useUser } from "@/app/utils/context/UserContext";
import { Avatar } from "@/app/utils/Avatar";
import {
  type EmployeeLeaveRequestRole,
  fetchPaginatedEmployeeLeaveRequests,
  fetchPaginatedTaggedEmployeeLeaveRequests,
  type EmployeeLeaveRequestRecord,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { CalendarBlank, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FinanceLeaveRequest } from "@/app/(screens)/finance-manager/leave-request/data";
import LeaveRequestDetailsModal from "@/app/(screens)/finance-manager/leave-request/components/LeaveRequestDetailsModal";

const ITEMS_PER_PAGE = 10;

const leaveRequestColumns = [
  { title: "S.No", key: "serialNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Action", key: "action" },
  { title: "Details", key: "details" },
];

const staffLeaveRequestColumns = [
  { title: "S.No", key: "serialNo" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Photo", key: "photo" },
  { title: "Name", key: "name" },
  { title: "Role", key: "role" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Status", key: "action" },
  { title: "Details", key: "details" },
];

const statusLabelMap: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
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

const mapDbRequestToAdminRow = (
  request: EmployeeLeaveRequestRecord,
  serialNumber: number,
  isSchool: boolean,
): FinanceLeaveRequest => {
  const employeeCode = request.employee?.employeeId ?? String(request.employeeId);
  const requesterName = request.user?.fullName ?? "Admin";
  const fromDate = formatDbDate(request.leaveFromDate);
  const toDate = formatDbDate(request.leaveToDate);
  const leaveType = titleCase(request.leaveType);
  let formattedRole = titleCase(request.role);
  if (isSchool && formattedRole.replace(/\s/g, '').toLowerCase() === "collegeadmin") {
    formattedRole = "School Admin";
  } else if (formattedRole.replace(/\s/g, '').toLowerCase() === "collegeadmin") {
    formattedRole = "College Admin";
  }

  return {
    employeeLeaveRequestId: request.employeeLeaveRequestId,
    serialNo: String(serialNumber).padStart(2, "0"),
    employeeId: employeeCode,
    name: requesterName,
    role: formattedRole,
    photo: request.user?.profileUrl ?? "",
    requestedDate: formatDbDate(request.createdAt.slice(0, 10)),
    dateRange: `${fromDate} - ${toDate}`,
    days: calculateDays(request.leaveFromDate, request.leaveToDate),
    leaveType,
    description: request.description,
    status: request.status,
    chat: [
      {
        id: `${request.employeeLeaveRequestId}-request`,
        senderName: requesterName,
        senderRole: formattedRole,
        message: `I submitted a ${leaveType.toLowerCase()} leave request from ${fromDate} to ${toDate}.`,
        time: new Date(request.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
      },
      {
        id: `${request.employeeLeaveRequestId}-status`,
        senderName: "HR Desk",
        senderRole: "HR",
        message:
          request.status === "pending"
            ? "Your request is pending review."
            : `Your request has been ${request.status}.`,
        time: new Date(request.updatedAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ],
  };
};

function StatusAction({ status }: { status: string }) {
  const statusClass =
    status === "approved"
      ? "bg-[#E7F8EE] text-[#43C17A]"
      : status === "rejected"
        ? "bg-[#FFD7D7] text-[#FF2020]"
        : "bg-[#FFF1DC] text-[#FF9F2E]";

  return (
    <span
      className={`inline-flex min-w-28 items-center justify-center rounded-full px-4 py-1 text-sm font-medium ${statusClass}`}
    >
      {statusLabelMap[status] ?? status}
    </span>
  );
}

type AdminLeaveRequestsTableProps = {
  view: "my" | "tagged";
  requestRole?: EmployeeLeaveRequestRole;
  collegeIdOverride?: number | null;
  contextLoadingOverride?: boolean;
  showRequesterColumns?: boolean;
};

export default function AdminLeaveRequestsTable({
  view,
  requestRole = "Admin",
  collegeIdOverride,
  contextLoadingOverride,
  showRequesterColumns = false,
}: AdminLeaveRequestsTableProps) {
  const { userId, fullName, loading: userLoading, collegeEducationType } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);
  const { collegeId, loading: adminLoading } = useAdmin();
  const effectiveCollegeId = collegeIdOverride ?? collegeId;
  const effectiveContextLoading = contextLoadingOverride ?? adminLoading;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [requests, setRequests] = useState<FinanceLeaveRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<FinanceLeaveRequest | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") || "total";
  const isRejectedView = activeStatus === "rejected";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, selectedDateKey, view]);

  const loadRequests = useCallback(async () => {
    if (userLoading || effectiveContextLoading) return;

    if (!userId || !effectiveCollegeId) {
      setRequests([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const status =
        activeStatus === "total"
          ? undefined
          : (activeStatus as "approved" | "pending" | "rejected");
      const { data, totalCount } =
        view === "tagged"
          ? await fetchPaginatedTaggedEmployeeLeaveRequests({
              taggedUserId: userId,
              collegeId: effectiveCollegeId,
              status,
              page,
              pageSize: ITEMS_PER_PAGE,
              search: debouncedQuery,
              date: selectedDateKey,
            })
          : await fetchPaginatedEmployeeLeaveRequests({
              userId,
              collegeId: effectiveCollegeId,
              role: requestRole,
              status,
              page,
              pageSize: ITEMS_PER_PAGE,
              search: debouncedQuery,
              date: selectedDateKey,
            });

      setRequests(
        data.map((request, index) => ({
          ...mapDbRequestToAdminRow(
            request,
            (page - 1) * ITEMS_PER_PAGE + index + 1,
            isSchool,
          ),
          name:
            view === "tagged"
              ? request.user?.fullName ?? "Employee"
              : request.user?.fullName ?? fullName ?? "Admin",
        })),
      );
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Error fetching admin leave requests:", error);
      setRequests([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeStatus,
    debouncedQuery,
    effectiveCollegeId,
    effectiveContextLoading,
    fullName,
    page,
    requestRole,
    selectedDateKey,
    userId,
    userLoading,
    view,
    isSchool,
  ]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const handleCreated = () => loadRequests();
    window.addEventListener("employee-leave-request-created", handleCreated);
    return () =>
      window.removeEventListener("employee-leave-request-created", handleCreated);
  }, [loadRequests]);

  const tableColumns = showRequesterColumns
    ? staffLeaveRequestColumns
    : isRejectedView
    ? [
        { title: "S.No", key: "serialNo" },
        { title: "From - To", key: "dateRange" },
        { title: "Days", key: "days" },
        { title: "Leave Type", key: "leaveType" },
        { title: "Description", key: "description" },
        { title: "Attachments", key: "attachments" },
        { title: "Action", key: "action" },
        { title: "Details", key: "details" },
      ]
    : leaveRequestColumns;

  const tableData = requests.map((request) => ({
    serialNo: request.serialNo,
    ...(showRequesterColumns
      ? {
          employeeId: (
            <>
              <span className="font-bold text-[#43C17A]">ID</span> -{" "}
              {request.employeeId}
            </>
          ),
          photo: <Avatar src={request.photo} size={32} alt={request.name} />,
          name: (
            <span className="inline-block max-w-[150px] truncate font-medium">
              {request.name}
            </span>
          ),
          role: request.role,
        }
      : {}),
    dateRange: request.dateRange,
    days: request.days,
    leaveType: request.leaveType,
    description: isRejectedView
      ? `${request.description} and ne..`
      : request.description,
    action: <StatusAction status={request.status} />,
    details: (
      <button
        type="button"
        onClick={() => setSelectedRequest(request)}
        className="cursor-pointer text-sm font-semibold text-[#006BFF] hover:underline"
      >
        View Details
      </button>
    ),
    ...(isRejectedView
      ? {
          attachments: request.attachment ? (
            <span className="text-sm font-medium text-[#43C17A]">
              {request.attachment}
            </span>
          ) : (
            <span className="text-[#525252]">-</span>
          ),
        }
      : {}),
  }));

  return (
    <section className="mt-3 flex min-h-0 flex-1 flex-col">
      <style>{`
        .leave-request-table table { min-width: 900px; }
      `}</style>
      <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex w-full max-w-full items-center gap-3 rounded-full bg-gray-200 px-4 py-2.5 sm:max-w-[300px]">
          <MagnifyingGlass size={20} color="#43C17A" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              view === "tagged"
                ? "Search tagged requests..."
                : "Search by leave type or description..."
            }
            className="h-full w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#282828]"
          />
        </label>

        <div className="relative self-start sm:self-auto">
          {!isDatePickerOpen ? (
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-md bg-[#DAE9E1] px-4 py-1.5 text-sm font-bold tracking-wide text-[#43C17A] transition-colors hover:bg-[#cbe6d7]"
              title="Select date"
            >
              <CalendarBlank size={18} weight="fill" />
              {selectedDateKey
                ? formatDateKey(selectedDateKey)
                : new Date().toLocaleDateString("en-GB")}
            </button>
          ) : (
            <div className="flex h-8 items-center gap-2 rounded-md border border-[#43C17A] bg-white p-1 shadow-sm">
              <CalendarBlank
                size={18}
                className="ml-2 text-[#43C17A]"
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
                className="cursor-pointer rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#43C17A]"
              />
              {selectedDateKey && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateKey("");
                    setIsDatePickerOpen(false);
                  }}
                  className="cursor-pointer rounded px-1 text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
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

      <div className="leave-request-table min-h-0 flex-1">
        <TableComponent
          columns={tableColumns}
          tableData={isLoading ? [] : tableData}
          height="55vh"
          isLoading={isLoading}
        />
      </div>

      <Pagination
        currentPage={page}
        totalItems={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
        roundedBottom="rounded-b-lg"
      />

      <LeaveRequestDetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </section>
  );
}
