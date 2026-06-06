"use client";

import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { useUser } from "@/app/utils/context/UserContext";
import { Avatar } from "@/app/utils/Avatar";
import {
  fetchPaginatedTaggedEmployeeLeaveRequests,
  type EmployeeLeaveRequestRecord,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";
import { CalendarBlank, MagnifyingGlass, PencilSimple, X } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { type CollegeAdminLeaveRequest } from "../data";
import LeaveRequestDetailsModal from "./LeaveRequestDetailsModal";

const ITEMS_PER_PAGE = 10;

const taggedLeaveRequestColumns = [
  { title: "S.No", key: "serialNo" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Photo", key: "photo" },
  { title: "Name", key: "name" },
  { title: "Role", key: "role" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Action", key: "action" },
  { title: "Details", key: "details" },
];

const statusLabelMap: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const editableRequesterRoles = new Set(["CollegeHr"]);

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

const mapDbRequestToCollegeAdminRow = (
  request: EmployeeLeaveRequestRecord,
  serialNumber: number,
): CollegeAdminLeaveRequest => {
  const employeeCode = request.employee?.employeeId ?? String(request.employeeId);
  const requesterName = request.user?.fullName ?? "Employee";
  const fromDate = formatDbDate(request.leaveFromDate);
  const toDate = formatDbDate(request.leaveToDate);
  const leaveType = titleCase(request.leaveType);

  return {
    employeeLeaveRequestId: request.employeeLeaveRequestId,
    serialNo: String(serialNumber).padStart(2, "0"),
    employeeId: employeeCode,
    name: requesterName,
    role: titleCase(request.role),
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
        senderRole: titleCase(request.role),
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

function StatusBadge({ status }: { status: string }) {
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

export default function LeaveRequestsTable() {
  const { userId, loading: userLoading } = useUser();
  const { collegeId, collegeAdminId, loading: collegeAdminLoading } =
    useCollegeAdmin();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [requests, setRequests] = useState<CollegeAdminLeaveRequest[]>([]);
  const [rawRolesByRequestId, setRawRolesByRequestId] = useState(
    new Map<number, string>(),
  );
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<CollegeAdminLeaveRequest | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") || "total";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
    setEditingRows(new Set());
  }, [activeStatus, selectedDateKey]);

  const loadRequests = useCallback(async () => {
    if (userLoading || collegeAdminLoading) return;

    if (!userId || !collegeId) {
      setRequests([]);
      setRawRolesByRequestId(new Map());
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
      const { data, totalCount } = await fetchPaginatedTaggedEmployeeLeaveRequests({
        taggedUserId: userId,
        collegeId,
        status,
        page,
        pageSize: ITEMS_PER_PAGE,
        search: debouncedQuery,
        date: selectedDateKey || undefined,
      });

      setRawRolesByRequestId(
        new Map(data.map((request) => [request.employeeLeaveRequestId, request.role])),
      );
      setRequests(
        data.map((request, index) =>
          mapDbRequestToCollegeAdminRow(
            request,
            (page - 1) * ITEMS_PER_PAGE + index + 1,
          ),
        ),
      );
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Error fetching college admin tagged leave requests:", error);
      setRequests([]);
      setRawRolesByRequestId(new Map());
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeStatus,
    collegeAdminLoading,
    collegeId,
    debouncedQuery,
    page,
    selectedDateKey,
    userId,
    userLoading,
  ]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateStatus = useCallback(
    async (requestId: number | undefined, status: "approved" | "rejected") => {
      if (!requestId || !collegeAdminId || updatingRequestId) return;

      setUpdatingRequestId(requestId);
      try {
        const response = await fetch("/api/employee-leave-requests/college-admin-status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeLeaveRequestId: requestId,
            status,
            collegeAdminId,
            userId,
          }),
        });

        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(result?.error || "Unable to update leave status");
        }

        toast.success(`Leave ${status} successfully`);
        setEditingRows((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
        window.dispatchEvent(new Event("employee-leave-request-created"));
        await loadRequests();
      } catch (error) {
        console.error("Error updating college admin leave status:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update leave status",
        );
      } finally {
        setUpdatingRequestId(null);
      }
    },
    [collegeAdminId, loadRequests, updatingRequestId, userId],
  );

  const tableData = useMemo(
    () =>
      requests.map((request) => {
        const requestId = request.employeeLeaveRequestId;
        const rawRole = requestId ? rawRolesByRequestId.get(requestId) : "";
        const canEdit = Boolean(rawRole && editableRequesterRoles.has(rawRole));
        const isEditing = requestId ? editingRows.has(requestId) : false;
        const isUpdating = requestId === updatingRequestId;

        return {
          serialNo: request.serialNo,
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
          dateRange: request.dateRange,
          days: request.days,
          leaveType: request.leaveType,
          description: (
            <span
              className="inline-block max-w-[210px] truncate text-sm"
              title={request.description}
            >
              {request.description}
            </span>
          ),
          action:
            canEdit && isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus(requestId, "approved")}
                  className="cursor-pointer rounded-full bg-[#E7F8EE] px-3 py-1 text-xs font-semibold text-[#43C17A] transition-colors hover:bg-[#d0f0de] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus(requestId, "rejected")}
                  className="cursor-pointer rounded-full bg-[#FFE5E5] px-3 py-1 text-xs font-semibold text-[#FF4B4B] transition-colors hover:bg-[#ffd1d1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <StatusBadge status={request.status} />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() =>
                      requestId &&
                      setEditingRows((prev) => new Set(prev).add(requestId))
                    }
                    className="cursor-pointer p-1 text-gray-400 transition-colors hover:text-[#16284F]"
                    title="Change Status"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                )}
              </div>
            ),
          details: (
            <button
              type="button"
              onClick={() => setSelectedRequest(request)}
              className="cursor-pointer text-sm font-semibold text-[#006BFF] hover:underline"
            >
              View Details
            </button>
          ),
        };
      }),
    [editingRows, rawRolesByRequestId, requests, updateStatus, updatingRequestId],
  );

  return (
    <section className="mt-3 flex min-h-0 flex-1 flex-col">
      <style>{`
        .college-admin-leave-request-table table { min-width: 1180px; }
      `}</style>
      <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex w-full max-w-full items-center gap-3 rounded-full bg-gray-200 px-4 py-2.5 sm:max-w-[330px]">
          <MagnifyingGlass size={20} color="#43C17A" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by employee name or employee ID..."
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

      <div className="college-admin-leave-request-table min-h-0 flex-1">
        <TableComponent
          columns={taggedLeaveRequestColumns}
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
