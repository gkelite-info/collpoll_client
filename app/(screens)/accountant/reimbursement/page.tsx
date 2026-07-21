"use client";

/* eslint-disable @next/next/no-img-element -- profile URLs can come from Supabase storage */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
} from "lucide-react";
import { ReimbursementDashboardShimmer } from "./components/ReimbursementShimmers";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchReimbursementsForApproval,
  type HRReimbursementRequest,
} from "@/lib/helpers/reimbursements/employeeExpenseApprovalsAPI";

const formatMoney = (value: number) =>
  `\u20B9${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ReimbursementDashboard() {
  const { collegeId } = useUser();
  const [reports, setReports] = useState<HRReimbursementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const dateInputRef = useRef<HTMLInputElement>(null);

  const canEditPayment = (request: HRReimbursementRequest) =>
    ["paid", "payment_rejected"].includes(request.status?.toLowerCase() ?? "");

  const toggleRow = (id: number) => setSelectedRows((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  useEffect(() => {
    if (!collegeId) return;

    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
    });
    fetchReimbursementsForApproval(collegeId)
      .then((data) =>
        setReports(
          data.filter((report) =>
            ["approved", "paid", "payment_rejected"].includes(report.status?.toLowerCase() ?? ""),
          ),
        ),
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load requests."))
      .finally(() => setLoading(false));
  }, [collegeId]);

  const pendingReports = useMemo(
    () => reports.filter((report) => report.status?.toLowerCase() === "approved"),
    [reports],
  );
  const paidThisMonth = useMemo(() => {
    const now = new Date();
    return reports.filter((report) => {
      if (report.status?.toLowerCase() !== "paid" || !report.paymentApproval?.approvedOn) return false;
      const paidOn = new Date(`${report.paymentApproval.approvedOn}T00:00:00`);
      return paidOn.getMonth() === now.getMonth() && paidOn.getFullYear() === now.getFullYear();
    });
  }, [reports]);
  const pendingAmount = useMemo(
    () => pendingReports.reduce((sum, report) => sum + Number(report.amountSpent || 0), 0),
    [pendingReports],
  );
  const paidThisMonthAmount = useMemo(
    () => paidThisMonth.reduce((sum, report) => sum + Number(report.amountSpent || 0), 0),
    [paidThisMonth],
  );
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

  const toggleAll = () => {
    const editableRows = pageReports.filter(canEditPayment);
    if (editableRows.length && editableRows.every((report) => selectedRows.has(report.employeeExpenseReportId))) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(editableRows.map((report) => report.employeeExpenseReportId)));
    }
  };

  const stats = [
    {
      label: "Pending Payments",
      count: pendingReports.length.toString(),
      amount: formatMoney(pendingAmount),
      note: "Forwarded by HR for accountant processing",
      Icon: Clock3,
      color: "#6751e7",
      bg: "#eeeaff",
    },
    {
      label: "Paid This Month",
      count: paidThisMonth.length.toString(),
      amount: formatMoney(paidThisMonthAmount),
      note: "Payments completed this month",
      Icon: CheckCircle2,
      color: "#16a34a",
      bg: "#e8f8ee",
    },
    {
      label: "Total Amount",
      count: formatMoney(pendingAmount),
      amount: "",
      note: "Total approved amount awaiting payment",
      Icon: IndianRupee,
      color: "#f45112",
      bg: "#fff0e8",
    },
  ];

  if (loading) return <ReimbursementDashboardShimmer />;

  return (
    <main className="min-h-full w-full bg-[#f4f4f4] p-3 text-[#142038] sm:p-5">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <p className="mt-1 text-sm text-[#7c8798]">
          Overview of reimbursement payments and status
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, count, amount, note, Icon, color, bg }) => (
          <article
            key={label}
            className="relative overflow-hidden rounded-xl border border-[#e4e7eb] bg-white p-5 shadow-sm"
          >
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
            <div className="flex gap-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                style={{ color, backgroundColor: bg }}
              >
                <Icon size={22} />
              </span>
              <div>
                <p className="text-xs text-[#657184]">{label}</p>
                <p className="mt-1 text-xl font-bold">{count}</p>
                {amount && <p className="mt-2 text-sm font-bold">{amount}</p>}
                <p className="mt-1 text-[10px] text-[#a0a8b5]">{note}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-[#e2e5e9] bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-semibold">Payment Queue</h2>
            <p className="mt-1 text-xs text-[#667386]">
              Pending and completed reimbursement payments
            </p>
          </div>
          <div className="relative">
            <button type="button" onClick={() => { const input = dateInputRef.current; if (!input) return; if (typeof input.showPicker === "function") input.showPicker(); else input.click(); }} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#e1f1e9] px-4 font-bold text-[#43c17a] transition-colors hover:bg-[#d5eadf] focus:outline-none focus:ring-2 focus:ring-[#43c17a]/30" aria-label="Open payment queue date filter">
              <CalendarDays size={18} />
              <span>{calendarLabel}</span>
            </button>
            <input ref={dateInputRef} type="date" value={calendarDate} aria-label="Filter payments by submitted date" onChange={(event) => { setSelectedDate(event.target.value || null); setCurrentPage(1); }} className="pointer-events-none absolute bottom-0 right-0 h-px w-px opacity-0" tabIndex={-1} />
          </div>
        </div>

        {error ? (
          <div className="flex h-32 items-center justify-center text-sm text-red-500">
            {error}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-[#667386]">
            No reimbursement payments found for {calendarLabel}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1360px] text-left">
              <thead className="bg-[#edf3ff] text-[10px] uppercase tracking-wider text-[#526071]">
                <tr>
                  <th className="w-12 px-7 py-4 text-center">
                    <input type="checkbox" onChange={toggleAll} checked={pageReports.some(canEditPayment) && pageReports.filter(canEditPayment).every((report) => selectedRows.has(report.employeeExpenseReportId))} className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#1769e0] focus:ring-[#1769e0]" />
                  </th>
                  <th className="px-7 py-4">Employee</th>
                  <th className="px-7 py-4">Expense Title</th>
                  <th className="px-7 py-4">Expense Category</th>
                  <th className="px-7 py-4">Mail ID</th>
                  <th className="px-7 py-4">Amount</th>
                  <th className="px-7 py-4">Submitted Date</th>
                  <th className="px-7 py-4">Status</th>
                  <th className="px-7 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f3]">
                {pageReports.map((report) => (
                  <tr key={report.employeeExpenseReportId} className="hover:bg-[#f8fbf9]">
                    <td className="px-7 py-5 text-center">
                      <input type="checkbox" disabled={!canEditPayment(report)} title={!canEditPayment(report) ? "Process this payment from View Details before editing" : undefined} checked={selectedRows.has(report.employeeExpenseReportId)} onChange={() => toggleRow(report.employeeExpenseReportId)} className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#1769e0] focus:ring-[#1769e0] disabled:cursor-not-allowed disabled:opacity-40" />
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={report.employeeAvatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">{report.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5 text-xs font-medium text-[#596578]">
                      {report.expenseTitle}
                    </td>
                    <td className="px-7 py-5 text-xs text-[#596578]">
                      {report.expenseCategory}
                    </td>
                    <td className="px-7 py-5 text-xs text-[#596578]">
                      {report.employeeEmail}
                    </td>
                    <td className="px-7 py-5 text-sm font-medium">
                      {formatMoney(report.amountSpent)}
                    </td>
                    <td className="px-7 py-5 text-xs text-[#596578]">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-7 py-5">
                      <PaymentStatus status={report.status} />
                    </td>
                    <td className="px-7 py-5 text-right">
                      <Link
                        href={`/accountant/reimbursement/${report.employeeExpenseReportId}${selectedRows.has(report.employeeExpenseReportId) ? "?edit=true" : ""}`}
                        className="inline-flex items-center whitespace-nowrap text-xs font-semibold text-[#0565ce]"
                      >
                        View Details <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredReports.length > 0 && (
          <Pagination currentPage={activePage} totalItems={filteredReports.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} itemsPerPageOptions={[10, 20, 50, 100]} onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }} roundedBottom="rounded-b-xl" alwaysShow />
        )}
      </section>
    </main>
  );
}

function PaymentStatus({ status }: { status: string | null }) {
  const paid = status?.toLowerCase() === "paid";
  const rejected = status?.toLowerCase() === "payment_rejected";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        paid
          ? "bg-[#e8f8ee] text-[#168a49]"
          : rejected
            ? "bg-[#fdebec] text-[#d32f35]"
            : "bg-[#fff5d8] text-[#d88b00]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-[#20b15a]" : rejected ? "bg-[#d32f35]" : "bg-[#f2a500]"}`} />
      {paid ? "Paid" : rejected ? "Payment Rejected" : "Pending"}
    </span>
  );
}
