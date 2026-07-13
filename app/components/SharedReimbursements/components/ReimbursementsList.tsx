"use client";

import { Money } from "@phosphor-icons/react";
import { ArrowDownUp, CheckCircle2, ClipboardClock, Download, ListTodo, Pencil, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadExcel } from "@/app/utils/downloadCSV";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import type { EmployeeExpenseReport } from "@/lib/helpers/reimbursements/employeeExpenseReportsAPI";
import RequestStatus from "./RequestStatus";
import StatCard from "./StatCard";
import type { ReimbursementStatus } from "./types";
import ReimbursementsShimmer from "./ReimbursementsShimmer";

type Props = {
  reports: EmployeeExpenseReport[];
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onViewDetails: (report: EmployeeExpenseReport) => void;
  onEdit: (report: EmployeeExpenseReport) => void;
  onDelete: (report: EmployeeExpenseReport) => void;
};

export function displayStatus(status: string | null): ReimbursementStatus {
  const value = status?.toLowerCase();
  if (value === "rejected") return "Rejected";
  if (["paid", "approved", "completed"].includes(value ?? "")) return "Paid";
  return "Pending";
}

export default function ReimbursementsList({ reports, loading, error, onCreate, onViewDetails, onEdit, onDelete }: Props) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const sortedReports = useMemo(() => [...reports].sort((first, second) => {
    const difference = new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
    return sortOrder === "asc" ? difference : -difference;
  }), [reports, sortOrder]);
  const totalPages = Math.max(1, Math.ceil(sortedReports.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const pageReports = sortedReports.slice(startIndex, startIndex + itemsPerPage);

  const count = (status: ReimbursementStatus) => reports.filter((report) => displayStatus(report.status) === status).length;
  const stats = [
    { label: "Total Requests", value: String(reports.length), color: "border-t-[#16284F]", valueClass: "text-[#14213A]", icon: ListTodo, iconClass: "bg-[#EAF0FF] text-[#16284F]" },
    { label: "Pending Approval", value: String(count("Pending")), color: "border-t-[#0B7CFF]", valueClass: "text-[#0065C8]", icon: ClipboardClock, iconClass: "bg-[#E8F2FF] text-[#0B7CFF]" },
    { label: "Paid", value: String(count("Paid")), color: "border-t-[#007A3D]", valueClass: "text-[#007A3D]", icon: CheckCircle2, iconClass: "bg-[#E6F8EE] text-[#007A3D]" },
    { label: "Rejected", value: String(count("Rejected")), color: "border-t-[#D51E1E]", valueClass: "text-[#C51D1D]", icon: XCircle, iconClass: "bg-[#FFE8E8] text-[#D51E1E]" },
  ];

  const exportExcel = () => void downloadExcel(
    sortedReports.map((report, index) => ({
      "S.No": index + 1,
      "Expense Title": report.expenseTitle,
      Category: report.expenseCategory,
      Amount: report.amountSpent,
      "Expense Date": report.expenseDate,
      "Submitted Date": new Date(report.createdAt).toLocaleDateString("en-IN"),
      Status: displayStatus(report.status),
    })),
    `reimbursements-${new Date().toISOString().slice(0, 10)}`,
    "Reimbursements",
  );

  if (loading) return <ReimbursementsShimmer/>;

  return <div className="w-full text-left">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-[28px] font-bold text-[#14213A]">Reimbursements</h1><p className="mt-1 text-[14px] text-[#4C5565]">Manage and track your expense claims</p></div>
      <button type="button" onClick={onCreate} className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-[6px] bg-[#007A3D] px-4 text-[13px] font-bold text-white hover:bg-[#006B35]"><Money size={16}/>New Reimbursement</button>
    </div>
    <div className="mb-5 w-full overflow-x-auto pb-2"><div className="flex min-w-max gap-4">{stats.map((item) => <StatCard key={item.label} {...item}/>)}</div></div>
    <section className="overflow-hidden rounded-[10px] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between px-6 py-5"><h2 className="text-[20px] font-bold text-[#14213A]">Recent Requests</h2><div className="flex items-center gap-4 text-[#3E4A59]"><button type="button" onClick={() => { setSortOrder((order) => order === "asc" ? "desc" : "asc"); setCurrentPage(1); }} aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`} title={`Currently ${sortOrder === "asc" ? "ascending" : "descending"}; click to reverse`} className="cursor-pointer rounded-md p-1.5 hover:bg-gray-100"><ArrowDownUp size={18}/></button><button type="button" onClick={exportExcel} disabled={!sortedReports.length} aria-label="Download reimbursements as Excel" title="Download Excel sheet" className="cursor-pointer rounded-md p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><Download size={18}/></button></div></div>
      {error && <p className="border-y border-red-100 bg-red-50 px-6 py-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] border-collapse">
        <thead className="bg-[#F8FAFC]"><tr>{["S.NO", "EXPENSE TITLE", "CATEGORY", "AMOUNT", "SUBMITTED DATE", "STATUS", "ACTION"].map((heading) => <th key={heading} className="whitespace-nowrap px-8 py-4 text-left text-[12px] font-semibold text-[#4C5565]">{heading}</th>)}</tr></thead>
        <tbody>
          {sortedReports.length === 0 ? <tr><td colSpan={7} className="px-8 py-12 text-center text-sm text-[#61708A]">No reimbursement requests found.</td></tr> : pageReports.map((report, index) => {
            const status = displayStatus(report.status);
            return <tr key={report.employeeExpenseReportId} className="border-b border-[#E7EDF5] last:border-b-0">
              <td className="whitespace-nowrap px-8 py-5 text-[14px] font-bold text-[#14213A]">{startIndex + index + 1}</td>
              <td className="whitespace-nowrap px-8 py-5 text-[14px] font-semibold text-[#14213A]">{report.expenseTitle}</td>
              <td className="whitespace-nowrap px-8 py-5"><span className="rounded-full bg-[#E8EEF8] px-3 py-1 text-[12px] font-medium text-[#4C5565]">{report.expenseCategory}</span></td>
              <td className="whitespace-nowrap px-8 py-5 text-[14px] font-semibold text-[#14213A]">₹{report.amountSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td className="whitespace-nowrap px-8 py-5 text-[14px] text-[#3E4A59]">{new Date(report.createdAt).toLocaleDateString("en-IN")}</td>
              <td className="whitespace-nowrap px-8 py-5"><RequestStatus status={status}/></td>
              <td className="whitespace-nowrap px-8 py-5"><div className="flex items-center gap-3"><button type="button" onClick={() => onViewDetails(report)} className="cursor-pointer text-[13px] font-bold text-[#16284F] hover:text-[#007A3D]">View Details</button><button type="button" onClick={() => onEdit(report)} disabled={status !== "Pending"} aria-label={`Edit ${report.expenseTitle}`} title={status === "Pending" ? "Edit request" : "Only pending requests can be edited"} className="cursor-pointer rounded-md p-1.5 text-[#0B7CFF] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"><Pencil size={16}/></button><button type="button" onClick={() => onDelete(report)} disabled={status !== "Pending"} aria-label={`Delete ${report.expenseTitle}`} title={status === "Pending" ? "Delete request" : "Only pending requests can be deleted"} className="cursor-pointer rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={16}/></button></div></td>
            </tr>;
          })}
        </tbody>
      </table></div>
      {sortedReports.length > itemsPerPage ? <Pagination currentPage={activePage} totalItems={sortedReports.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} itemsPerPageOptions={[5, 10, 20]} onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }} roundedBottom="rounded-b-[10px]"/> : <div className="px-6 py-4 text-[12px] text-[#4C5565]">Showing {sortedReports.length} {sortedReports.length === 1 ? "entry" : "entries"}</div>}
    </section>
  </div>;
}
