"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  CalendarDays,
  ChevronRight,
  CircleX,
  Clock3,
} from "lucide-react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { HRReimbursementDashboardShimmer } from "./components/ReimbursementShimmers";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchReimbursementsForApproval,
  updateReimbursementStatus,
  type ReimbursementApprovalStatus,
  type HRReimbursementRequest,
} from "@/lib/helpers/reimbursements/employeeExpenseApprovalsAPI";

const formatMoney = (value: number) =>
  `₹${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export default function ReimbursementDashboard() {
  const { collegeId, userId } = useUser();
  const [reports, setReports] = useState<HRReimbursementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [statusChange, setStatusChange] = useState<{
    request: HRReimbursementRequest;
    status: ReimbursementApprovalStatus;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const canEditRequest = (request: HRReimbursementRequest) =>
    ["approved", "rejected"].includes(request.status?.toLowerCase() ?? "pending");

  const toggleRow = (id: number) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
      setIsEditing(true);
    }
    setSelectedRows(newSet);
    if (newSet.size === 0) setIsEditing(false);
  };

  const toggleAll = () => {
    const editablePageReports = pageReports.filter(canEditRequest);
    if (
      editablePageReports.length > 0 &&
      editablePageReports.every((report) => selectedRows.has(report.employeeExpenseReportId))
    ) {
      setSelectedRows(new Set());
      setIsEditing(false);
    } else {
      setSelectedRows(new Set(editablePageReports.map((r) => r.employeeExpenseReportId)));
      if (editablePageReports.length > 0) setIsEditing(true);
    }
  };

  const confirmStatusChange = async () => {
    if (!statusChange || !userId || !collegeId) {
      toast.error("User context missing.");
      return;
    }
    try {
      setUpdatingStatus(true);
      await updateReimbursementStatus({
        reportId: statusChange.request.employeeExpenseReportId,
        userId,
        collegeId,
        status: statusChange.status,
      });
      setReports((current) =>
        current.map((report) =>
          report.employeeExpenseReportId === statusChange.request.employeeExpenseReportId
            ? {
                ...report,
                status: statusChange.status,
                approvedAt:
                  statusChange.status === "approved" ? new Date().toISOString() : null,
                rejectedAt:
                  statusChange.status === "rejected" ? new Date().toISOString() : null,
              }
            : report,
        ),
      );
      setSelectedRows((current) => {
        const next = new Set(current);
        next.delete(statusChange.request.employeeExpenseReportId);
        if (next.size === 0) setIsEditing(false);
        return next;
      });
      toast.success(`Request status changed to ${statusChange.status}.`);
      setStatusChange(null);
    } catch (statusError) {
      toast.error(statusError instanceof Error ? statusError.message : "Unable to change status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (!collegeId) return;

    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
    });
    fetchReimbursementsForApproval(collegeId)
      .then((data) => {
        setReports(data);
        setCurrentPage(1);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load requests."))
      .finally(() => setLoading(false));
  }, [collegeId]);

  const todayValue = new Date().toLocaleDateString("en-CA");
  const filteredReports = useMemo(
    () => selectedDate
      ? reports.filter((report) => new Date(report.createdAt).toLocaleDateString("en-CA") === selectedDate)
      : reports,
    [reports, selectedDate],
  );
  const calendarDate = selectedDate ?? todayValue;
  const calendarLabel = new Date(`${calendarDate}T00:00:00`).toLocaleDateString("en-GB");
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const pageReports = useMemo(
    () => filteredReports.slice(startIndex, startIndex + itemsPerPage),
    [filteredReports, startIndex, itemsPerPage],
  );

  const pendingCount = reports.filter((r) => r.status?.toLowerCase() === "pending").length;

  const isToday = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const approvedTodayCount = reports.filter(
    (r) => r.status?.toLowerCase() === "approved" && isToday(r.approvedAt),
  ).length;
  const rejectedTodayCount = reports.filter(
    (r) => r.status?.toLowerCase() === "rejected" && isToday(r.rejectedAt),
  ).length;

  const stats = [
    {
      label: "Pending Approval",
      value: pendingCount.toString(),
      note: "Requests awaiting your action",
      icon: Clock3,
      color: "#0876d8",
      bg: "#e8f2ff",
    },
    {
      label: "Approved Today",
      value: approvedTodayCount.toString(),
      note: "Requests approved today",
      icon: CheckCircle2,
      color: "#0c8a4b",
      bg: "#e4f6ec",
    },
    {
      label: "Rejected",
      value: rejectedTodayCount.toString(),
      note: "Requests rejected today",
      icon: CircleX,
      color: "#d32f35",
      bg: "#fdebec",
    },
  ];

  if (loading) return <HRReimbursementDashboardShimmer />;

  return (
    <main className="min-h-full w-full p-2 text-[#132238]">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Reimbursement Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage employee reimbursement requests
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map(({ label, value, note, icon: Icon, color, bg }) => (
          <article
            key={label}
            className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
            <span className="inline-flex rounded-md p-2" style={{ color, backgroundColor: bg }}>
              <Icon size={19} strokeWidth={3} />
            </span>
            <p className="mt-3 text-xs font-medium text-gray-600">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="mt-2 text-xs text-gray-500">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <h2 className="font-semibold">Approval Queue</h2>
            <p className="mt-1 text-xs text-gray-500">
              List of reimbursement requests pending your approval
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const input = dateInputRef.current;
                if (!input) return;
                if (typeof input.showPicker === "function") input.showPicker();
                else input.click();
              }}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#e1f1e9] px-4 font-bold text-[#43c17a] transition-colors hover:bg-[#d5eadf] focus:outline-none focus:ring-2 focus:ring-[#43c17a]/30"
              aria-label="Open reimbursement date filter"
            >
              <CalendarDays size={18} />
              <span>{calendarLabel}</span>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={calendarDate}
              aria-label="Filter reimbursements by submitted date"
              onChange={(event) => {
                setSelectedDate(event.target.value || null);
                setCurrentPage(1);
                setSelectedRows(new Set());
                setIsEditing(false);
              }}
              className="pointer-events-none absolute bottom-0 right-0 h-px w-px opacity-0"
              tabIndex={-1}
            />
          </div>
        </div>

        {error ? (
          <div className="flex h-32 items-center justify-center text-red-500">{error}</div>
        ) : filteredReports.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-500">
            No requests found for {calendarLabel}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-[#edf3ff] text-[10px] uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="w-12 px-8 py-4 text-center">
                    <input type="checkbox" onChange={toggleAll} checked={pageReports.some(canEditRequest) && pageReports.filter(canEditRequest).every((report) => selectedRows.has(report.employeeExpenseReportId))} className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#5546f5] focus:ring-[#5546f5]" />
                  </th>
                  <th className="min-w-[210px] px-8 py-4">Employee</th>
                  <th className="min-w-[230px] px-8 py-4">Expense Title</th>
                  <th className="min-w-[210px] px-8 py-4">Expense Category</th>
                  <th className="min-w-[260px] px-8 py-4">Mail ID</th>
                  <th className="min-w-[180px] px-8 py-4">Amount</th>
                  <th className="min-w-[180px] px-8 py-4">Submitted Date</th>
                  <th className="min-w-[160px] px-8 py-4">Status</th>
                  <th className="min-w-[160px] px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageReports.map((request) => (
                  <tr
                    key={request.employeeExpenseReportId}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-8 py-5 text-center">
                      <input type="checkbox" disabled={!canEditRequest(request)} title={!canEditRequest(request) ? "Approve or reject this request from View Details before editing" : undefined} checked={selectedRows.has(request.employeeExpenseReportId)} onChange={() => toggleRow(request.employeeExpenseReportId)} className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#5546f5] focus:ring-[#5546f5] disabled:cursor-not-allowed disabled:opacity-40" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.employeeAvatar}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="font-medium">{request.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium leading-5 text-gray-700">
                      {request.expenseTitle}
                    </td>
                    <td className="px-8 py-5 text-xs leading-5 text-gray-600">
                      {request.expenseCategory}
                    </td>
                    <td className="px-8 py-5 text-xs text-gray-600">{request.employeeEmail}</td>
                    <td className="px-8 py-5 font-medium">{formatMoney(request.amountSpent)}</td>
                    <td className="px-8 py-5 text-xs text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-8 py-5 text-xs">
                      {isEditing && selectedRows.has(request.employeeExpenseReportId) ? (
                        <select value={request.status?.toLowerCase() ?? "pending"} onChange={(event) => setStatusChange({ request, status: event.target.value as ReimbursementApprovalStatus })} className="cursor-pointer rounded border border-gray-300 bg-white p-1.5 text-xs font-medium text-[#132238] focus:border-[#5546f5] focus:outline-none focus:ring-1 focus:ring-[#5546f5]">
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <StatusPill status={request.status} />
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">

                        <Link
                          href={`/hr/reimbursements/${request.employeeExpenseReportId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#006bd6] hover:underline"
                        >
                          View Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredReports.length > 0 && (
          <Pagination
            currentPage={activePage}
            totalItems={filteredReports.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemsPerPageOptions={[5, 10, 20]}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
            roundedBottom="rounded-b-xl"
          />
        )}
      </section>
      <ConfirmDeleteModal
        open={Boolean(statusChange)}
        title="Change status to"
        name={statusChange ? statusChange.status[0].toUpperCase() + statusChange.status.slice(1) : ""}
        confirmText={statusChange ? `Yes, change to ${statusChange.status[0].toUpperCase() + statusChange.status.slice(1)}` : "Confirm"}
        loadingText="Updating..."
        isDeleting={updatingStatus}
        actionType={statusChange?.status === "approved" ? "accept" : statusChange?.status === "rejected" ? "reject" : null}
        customDescription={statusChange ? (
          <>
            Change <span className="font-bold text-slate-800">{statusChange.request.employeeName}&apos;s</span> reimbursement status to <span className="font-bold text-slate-800">{statusChange.status[0].toUpperCase() + statusChange.status.slice(1)}</span>?
          </>
        ) : null}
        onCancel={() => !updatingStatus && setStatusChange(null)}
        onConfirm={confirmStatusChange}
      />
    </main>
  );
}

function StatusPill({ status }: { status: string | null }) {
  if (status?.toLowerCase() === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f6ec] px-2 py-1 font-medium text-[#0c8a4b]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#43C17A]" />
        Approved
      </span>
    );
  }

  if (status?.toLowerCase() === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdebec] px-2 py-1 font-medium text-[#d32f35]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d32f35]" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff9e9] px-2 py-1 font-medium text-[#e88400]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#f4a000]" />
      Pending
    </span>
  );
}
