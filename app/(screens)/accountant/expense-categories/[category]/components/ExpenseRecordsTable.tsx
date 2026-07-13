"use client";

import { Eye, MagnifyingGlass, PencilSimple, Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import {
  getAccountantExpenseAttachmentSignedUrl,
  type AccountantExpense,
} from "@/lib/helpers/accountant/accountantExpensesAPI";

export function ExpenseRecordsTable({
  rows,
  isLoading = false,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onDelete,
}: {
  rows: AccountantExpense[];
  isLoading?: boolean;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onEdit: (expense: AccountantExpense) => void;
  onDelete: (expense: AccountantExpense) => void;
}) {
  const [search, setSearch] = useState("");
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.expenseName, row.remarks ?? "", row.category, row.paymentMethod].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [rows, search]);

  const openAttachment = async (row: AccountantExpense) => {
    const attachment = row.attachments[0];
    if (!attachment) return;
    try {
      const signedUrl = await getAccountantExpenseAttachmentSignedUrl(
        attachment.fileUrl,
      );
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open attachment.");
    }
  };

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <h2 className="text-[15px] font-bold text-[#17213D]">Expense Records</h2>
        <label className="flex h-9 min-w-[320px] items-center gap-3 rounded-md border border-[#E2E6EA] px-4 text-[#6B7280]">
          <MagnifyingGlass size={14} weight="bold" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by expense name, category, or remarks..."
            className="w-full bg-transparent text-[11px] font-medium outline-none placeholder:text-[#7B8190]"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="bg-[#F0F2F4]">
            <tr className="text-[10px] font-bold tracking-wide text-[#6B7280]">
              <th className="px-7 py-4">#</th>
              <th className="px-7 py-4">EXPENSE NAME</th>
              <th className="px-7 py-4">REMARKS</th>
              <th className="px-7 py-4">AMOUNT (Rs)</th>
              <th className="px-7 py-4">DATE</th>
              <th className="px-7 py-4">PAYMENT METHOD</th>
              <th className="px-7 py-4">RECORDED BY</th>
              <th className="px-7 py-4">ATTACHMENT</th>
              <th className="px-7 py-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }, (_, index) => (
                <tr key={index} className="animate-pulse border-b border-[#E6E8EB]">
                  {Array.from({ length: 9 }, (_, column) => (
                    <td key={column} className="px-7 py-5"><div className="h-4 rounded bg-gray-200" /></td>
                  ))}
                </tr>
              ))
            ) : filteredRows.length ? (
              filteredRows.map((row, index) => (
                <tr key={row.accountantExpenseId} className="border-b border-[#E6E8EB] text-[11px] font-medium text-[#282828]">
                  <td className="px-7 py-5">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-7 py-5 font-semibold">{row.expenseName}</td>
                  <td className="px-7 py-5">
                    <div className="custom-scrollbar max-w-[240px] overflow-x-auto whitespace-nowrap pb-1" title={row.remarks ?? ""}>
                      {row.remarks || "—"}
                    </div>
                  </td>
                  <td className="px-7 py-5 font-bold">{row.amount.toLocaleString("en-IN")}</td>
                  <td className="px-7 py-5">{new Date(`${row.expenseDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="px-7 py-5"><span className="rounded-full bg-[#E2FAF0] px-3 py-1 text-[9px] font-bold text-[#147A3D]">{row.paymentMethod}</span></td>
                  <td className="px-7 py-5">{row.createdByName}</td>
                  <td className="px-7 py-5">
                    {row.attachments.length ? (
                      <button type="button" onClick={() => void openAttachment(row)} aria-label={`View attachment for ${row.expenseName}`} className="cursor-pointer text-[#147A3D]"><Eye size={16} weight="bold" /></button>
                    ) : "—"}
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => onEdit(row)} aria-label={`Update ${row.expenseName}`} className="cursor-pointer text-[#1769E0] hover:text-[#0F4FAF]"><PencilSimple size={16} weight="bold" /></button>
                      <button type="button" onClick={() => onDelete(row)} aria-label={`Delete ${row.expenseName}`} className="cursor-pointer text-[#D14343] hover:text-[#A52F2F]"><Trash size={16} weight="bold" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={9} className="px-7 py-12 text-center text-sm text-[#6B7280]">No expense records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemsPerPageOptions={[5, 10, 20]}
        onItemsPerPageChange={onItemsPerPageChange}
        disabled={isLoading}
        roundedBottom="rounded-b-xl"
      />
    </section>
  );
}
