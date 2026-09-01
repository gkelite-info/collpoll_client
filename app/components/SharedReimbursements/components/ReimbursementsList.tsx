"use client";

import { Money, FunnelSimple } from "@phosphor-icons/react";
import { CheckCircle2, ClipboardClock, Download, ListTodo, Pencil, Trash2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { downloadExcel } from "@/app/utils/downloadCSV";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import type { EmployeeExpenseReport } from "@/lib/helpers/reimbursements/employeeExpenseReportsAPI";
import RequestStatus from "./RequestStatus";
import StatCard from "./StatCard";
import type { ReimbursementStatus } from "./types";
import ReimbursementsShimmer from "./ReimbursementsShimmer";

type Props = {
  reports: EmployeeExpenseReport[];
  totalCount: number;
  stats: { total: number; pending: number; awaitingPayment: number; paid: number; rejected: number };
  loading: boolean;
  tableLoading?: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  sortOrder: "asc" | "desc";
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onSortChange: (order: "asc" | "desc") => void;
  onCreate: () => void;
  onViewDetails: (report: EmployeeExpenseReport) => void;
  onEdit: (report: EmployeeExpenseReport) => void;
  onDelete: (report: EmployeeExpenseReport) => void;
  onExport?: () => Promise<EmployeeExpenseReport[]>;
};

const formatDateDDMMYYYY = (dateString: string) => {
  const d = new Date(dateString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export function displayStatus(status: string | null): ReimbursementStatus {
  const value = status?.toLowerCase();
  if (value === "rejected" || value === "payment_rejected") return "Rejected";
  if (["paid", "completed"].includes(value ?? "")) return "Paid";
  if (value === "approved") return "Awaiting Payment";
  return "Pending";
}

export default function ReimbursementsList({ 
  reports, totalCount, stats, loading, tableLoading, error, 
  currentPage, itemsPerPage, sortOrder, 
  onPageChange, onItemsPerPageChange, onSortChange, 
  onCreate, onViewDetails, onEdit, onDelete, onExport
}: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const statCards = [
    { label: "Total Requests", value: String(stats.total), color: "border-t-[#16284F]", valueClass: "text-[#14213A]", icon: ListTodo, iconClass: "bg-[#EAF0FF] text-[#16284F]" },
    { label: "Pending Approval", value: String(stats.pending), color: "border-t-[#0B7CFF]", valueClass: "text-[#0065C8]", icon: ClipboardClock, iconClass: "bg-[#E8F2FF] text-[#0B7CFF]" },
    { label: "Awaiting Payment", value: String(stats.awaitingPayment), color: "border-t-[#D99A00]", valueClass: "text-[#9A6700]", icon: ClipboardClock, iconClass: "bg-[#FFF4D6] text-[#9A6700]" },
    { label: "Paid", value: String(stats.paid), color: "border-t-[#007A3D]", valueClass: "text-[#007A3D]", icon: CheckCircle2, iconClass: "bg-[#E6F8EE] text-[#007A3D]" },
    { label: "Rejected", value: String(stats.rejected), color: "border-t-[#D51E1E]", valueClass: "text-[#C51D1D]", icon: XCircle, iconClass: "bg-[#FFE8E8] text-[#D51E1E]" },
  ];

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      let dataToExport = reports;
      if (onExport) {
        dataToExport = await onExport();
      }
      await downloadExcel(
        dataToExport.map((report, index) => ({
          "S.No": index + 1,
          "Expense Title": report.expenseTitle,
          Category: report.expenseCategory,
          Amount: report.amountSpent,
          "Expense Date": report.expenseDate,
          "Submitted Date": formatDateDDMMYYYY(report.createdAt),
          Status: displayStatus(report.status),
        })),
        `reimbursements-${new Date().toISOString().slice(0, 10)}`,
        "Reimbursements",
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <ReimbursementsShimmer/>;

  return <div className="w-full text-left">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-[28px] font-bold text-[#14213A]">Reimbursements</h1><p className="mt-1 text-[14px] text-[#4C5565]">Manage and track your expense claims</p></div>
      <button type="button" onClick={onCreate} className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-[6px] bg-[#007A3D] px-4 text-[13px] font-bold text-white hover:bg-[#006B35]"><Money size={16}/>New Reimbursement</button>
    </div>
    <div className="mb-5 w-full overflow-x-auto pb-2"><div className="flex min-w-max gap-4">{statCards.map((item) => <StatCard key={item.label} {...item}/>)}</div></div>
    <section className="overflow-hidden rounded-[10px] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between px-6 py-5"><h2 className="text-[20px] font-bold text-[#14213A]">Recent Requests</h2><div className="flex items-center gap-4 text-[#3E4A59]"><button type="button" onClick={() => { onSortChange(sortOrder === "asc" ? "desc" : "asc"); onPageChange(1); }} aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`} title={`Currently ${sortOrder === "asc" ? "ascending" : "descending"}; click to reverse`} className="cursor-pointer rounded-md p-1.5 hover:bg-gray-100"><FunnelSimple size={18} className={`transition-transform duration-300 ${sortOrder === "asc" ? "rotate-180" : ""}`}/></button><button type="button" onClick={exportExcel} disabled={!reports.length || isExporting} aria-label="Download reimbursements as Excel" title="Download Excel sheet" className="cursor-pointer rounded-md p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">{isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18}/>}</button></div></div>
      {error && <p className="border-y border-red-100 bg-red-50 px-6 py-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] border-collapse">
        <thead className="bg-[#F8FAFC]"><tr>{["S.NO", "EXPENSE TITLE", "CATEGORY", "AMOUNT", "SUBMITTED DATE", "STATUS", "ACTION"].map((heading) => <th key={heading} className="whitespace-nowrap px-8 py-4 text-left text-[12px] font-semibold text-[#4C5565]">{heading}</th>)}</tr></thead>
        <tbody>
          {tableLoading ? (
            Array.from({ length: itemsPerPage || 5 }).map((_, i) => (
              <tr key={`shimmer-${i}`} className="border-b border-[#E7EDF5] last:border-b-0 animate-pulse">
                <td className="whitespace-nowrap px-8 py-5"><div className="h-4 w-8 rounded bg-gray-200"></div></td>
                <td className="whitespace-nowrap px-8 py-5"><div className="h-4 w-32 rounded bg-gray-200"></div></td>
                <td className="whitespace-nowrap px-8 py-5"><div className="h-4 w-20 rounded-full bg-gray-200"></div></td>
                <td className="whitespace-nowrap px-8 py-5"><div className="h-4 w-16 rounded bg-gray-200"></div></td>
                <td className="whitespace-nowrap px-8 py-5"><div className="h-4 w-24 rounded bg-gray-200"></div></td>
                <td className="whitespace-nowrap px-8 py-5"><div className="h-6 w-24 rounded-full bg-gray-200"></div></td>
                <td className="whitespace-nowrap px-8 py-5"><div className="h-4 w-28 rounded bg-gray-200"></div></td>
              </tr>
            ))
          ) : reports.length === 0 ? <tr><td colSpan={7} className="px-8 py-12 text-center text-sm text-[#61708A]">No reimbursement requests found.</td></tr> : reports.map((report, index) => {
            const status = displayStatus(report.status);
            return <tr key={report.employeeExpenseReportId} className="border-b border-[#E7EDF5] last:border-b-0">
              <td className="whitespace-nowrap px-8 py-5 text-[14px] font-bold text-[#14213A]">{startIndex + index + 1}</td>
              <td className="whitespace-nowrap px-8 py-5 text-[14px] font-semibold text-[#14213A]">{report.expenseTitle}</td>
              <td className="whitespace-nowrap px-8 py-5"><span className="rounded-full bg-[#E8EEF8] px-3 py-1 text-[12px] font-medium text-[#4C5565]">{report.expenseCategory}</span></td>
              <td className="whitespace-nowrap px-8 py-5 text-[14px] font-semibold text-[#14213A]">₹{report.amountSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td className="whitespace-nowrap px-8 py-5 text-[14px] text-[#3E4A59]">{formatDateDDMMYYYY(report.createdAt)}</td>
              <td className="whitespace-nowrap px-8 py-5"><RequestStatus status={status}/></td>
              <td className="whitespace-nowrap px-8 py-5"><div className="flex items-center gap-3"><button type="button" onClick={() => onViewDetails(report)} className="cursor-pointer text-[13px] font-bold text-[#16284F] hover:text-[#007A3D]">View Details</button><button type="button" onClick={() => onEdit(report)} disabled={status !== "Pending"} aria-label={`Edit ${report.expenseTitle}`} title={status === "Pending" ? "Edit request" : "Only pending requests can be edited"} className="cursor-pointer rounded-md p-1.5 text-[#0B7CFF] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"><Pencil size={16}/></button><button type="button" onClick={() => onDelete(report)} disabled={status !== "Pending"} aria-label={`Delete ${report.expenseTitle}`} title={status === "Pending" ? "Delete request" : "Only pending requests can be deleted"} className="cursor-pointer rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={16}/></button></div></td>
            </tr>;
          })}
        </tbody>
      </table></div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemsPerPageOptions={[10, 20, 50]}
        onItemsPerPageChange={onItemsPerPageChange}
        roundedBottom="rounded-b-[10px]"
        alwaysShow={true}
      />
    </section>
  </div>;
}
