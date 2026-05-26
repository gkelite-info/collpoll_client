"use client";

import TableComponent from "@/app/utils/table/table";
import { CalendarBlank, MagnifyingGlass } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { leaveRequests, type FinanceLeaveRequest } from "../data";
import LeaveRequestDetailsModal from "./LeaveRequestDetailsModal";

const leaveRequestColumns = [
  { title: "S.No", key: "serialNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Action", key: "action" },
  { title: "Details", key: "details" },
];

const statusLabelMap: Record<string, string> = {
  approved: "Accepted",
  pending: "Pending",
  rejected: "Rejected",
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

export default function LeaveRequestsTable() {
  const [query, setQuery] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<FinanceLeaveRequest | null>(null);
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") || "total";
  const isRejectedView = activeStatus === "rejected";

  const tableColumns = isRejectedView
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

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    const statusFiltered =
      activeStatus === "total"
        ? leaveRequests
        : leaveRequests.filter((request) => request.status === activeStatus);

    if (!search) return statusFiltered;

    return statusFiltered.filter((request) =>
      [
        request.serialNo,
        request.dateRange,
        request.days,
        request.leaveType,
        request.description,
        request.name,
        request.employeeId,
        request.role,
        statusLabelMap[request.status] ?? request.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [activeStatus, query]);

  const tableData = filteredRequests.map((request) => ({
    serialNo: request.serialNo,
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
      <div className="mb-3 grid grid-cols-[1fr_auto] gap-3">
        <label className="flex h-11 items-center gap-3 bg-[#EEEEEE] px-4">
          <MagnifyingGlass size={21} color="#43C17A" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="h-full w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#282828]"
          />
        </label>

        <button className="flex h-11 items-center justify-center gap-3 bg-[#DFF3E9] px-6 text-sm font-semibold text-[#43C17A]">
          <CalendarBlank size={18} weight="fill" />
          12/04/2026
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <TableComponent
          columns={tableColumns}
          tableData={tableData}
          height="calc(100vh - 10rem)"
          fillHeight
        />
      </div>

      <LeaveRequestDetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </section>
  );
}
