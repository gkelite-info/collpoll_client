"use client";

import { CalendarBlank, Eye, MagnifyingGlass, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { useState } from "react";
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
  search,
  selectedDateKey,
  onSearchChange,
  onDateChange,
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
  search: string;
  selectedDateKey: string;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onEdit: (expense: AccountantExpense) => void;
  onDelete: (expense: AccountantExpense) => void;
}) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const formatDateKey = (dateKey: string) =>
    new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB");

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
        <div className="flex flex-wrap items-center gap-4">
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
                  : "Select Date"}
              </button>
            ) : (
              <div className="flex h-9 items-center gap-2 rounded-md border border-[#43C17A] bg-white p-1 shadow-sm">
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
                      onDateChange(event.target.value);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  className="cursor-pointer rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#43C17A]"
                />
                {selectedDateKey && (
                  <button
                    type="button"
                    onClick={() => {
                      onDateChange("");
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
          <label className="flex h-9 min-w-[320px] items-center gap-3 rounded-md border border-[#E2E6EA] px-4 text-[#6B7280]">
            <MagnifyingGlass size={14} weight="bold" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by expense name or remarks..."
              className="w-full bg-transparent text-[11px] font-medium outline-none placeholder:text-[#7B8190]"
            />
          </label>
        </div>
      </div>
      <div className="w-full overflow-x-auto lg:overflow-hidden">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left lg:min-w-0">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[11.75%]" />
            <col className="w-[11.75%]" />
            <col className="w-[11.75%]" />
            <col className="w-[11.75%]" />
            <col className="w-[11.75%]" />
            <col className="w-[11.75%]" />
            <col className="w-[11.75%]" />
            <col className="w-[11.75%]" />
          </colgroup>
          <thead className="bg-[#F0F2F4]">
            <tr className="text-[10px] font-bold tracking-wide text-[#6B7280]">
              <th className="px-4 py-4">#</th>
              <th className="px-4 py-4">EXPENSE NAME</th>
              <th className="px-4 py-4">REMARKS</th>
              <th className="px-4 py-4">AMOUNT (Rs)</th>
              <th className="px-4 py-4">DATE</th>
              <th className="px-4 py-4">PAYMENT METHOD</th>
              <th className="px-4 py-4">RECORDED BY</th>
              <th className="px-4 py-4">ATTACHMENT</th>
              <th className="px-4 py-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }, (_, index) => (
                <tr key={index} className="animate-pulse border-b border-[#E6E8EB]">
                  {Array.from({ length: 9 }, (_, column) => (
                    <td key={column} className="px-4 py-5"><div className="h-4 rounded bg-gray-200" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length ? (
              rows.map((row, index) => (
                <tr key={row.accountantExpenseId} className="border-b border-[#E6E8EB] text-[11px] font-medium text-[#282828]">
                  <td className="px-4 py-5">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="overflow-hidden px-4 py-5 font-semibold">
                    <div
                      className="custom-scrollbar w-full overflow-x-auto whitespace-nowrap pb-1"
                      title={row.expenseName}
                    >
                      {row.expenseName}
                    </div>
                  </td>
                  <td className="overflow-hidden px-4 py-5">
                    <div className="custom-scrollbar w-full overflow-x-auto whitespace-nowrap pb-1" title={row.remarks ?? ""}>
                      {row.remarks || "—"}
                    </div>
                  </td>
                  <td className="overflow-hidden px-4 py-5 font-bold">
                    <div
                      className="custom-scrollbar w-full overflow-x-auto whitespace-nowrap pb-1"
                      title={row.amount.toLocaleString("en-IN")}
                    >
                      {row.amount.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="px-4 py-5">{new Date(`${row.expenseDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="overflow-hidden px-4 py-5">
                    <div
                      className="custom-scrollbar w-full overflow-x-auto whitespace-nowrap pb-1"
                      title={row.paymentMethod}
                    >
                      <span className="inline-flex rounded-full bg-[#E2FAF0] px-3 py-1 text-[9px] font-bold text-[#147A3D]">
                        {row.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="overflow-hidden px-4 py-5">
                    <div
                      className="custom-scrollbar w-full overflow-x-auto whitespace-nowrap pb-1"
                      title={row.createdByName}
                    >
                      {row.createdByName}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    {row.attachments.length ? (
                      <button type="button" onClick={() => void openAttachment(row)} aria-label={`View attachment for ${row.expenseName}`} className="cursor-pointer text-[#147A3D]"><Eye size={16} weight="bold" /></button>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => onEdit(row)} aria-label={`Update ${row.expenseName}`} className="cursor-pointer text-[#1769E0] hover:text-[#0F4FAF]"><PencilSimple size={16} weight="bold" /></button>
                      <button type="button" onClick={() => onDelete(row)} aria-label={`Delete ${row.expenseName}`} className="cursor-pointer text-[#D14343] hover:text-[#A52F2F]"><Trash size={16} weight="bold" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-[#6B7280]">No expense records found.</td></tr>
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
