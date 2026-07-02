"use client";

import { FileText, FloppyDisk, X } from "@phosphor-icons/react";
import { useEffect } from "react";

type RecordNewExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function RequiredMark() {
  return <span className="text-[#E5484D]">*</span>;
}

export default function RecordNewExpenseModal({
  isOpen,
  onClose,
}: RecordNewExpenseModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-[600px] overflow-y-auto rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold leading-tight text-[#282828]">
              Record New Expense
            </h2>
            <p className="mt-1 text-[11px] font-medium text-[#525252]">
              Add and manage institutional expense records.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="cursor-pointer text-[#282828]"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <form className="mt-3 rounded-lg border border-[#E6E8EB] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#282828]">
                Expense Name <RequiredMark />
              </span>
              <input
                type="text"
                placeholder="e.g. Q3 Office Maintenance"
                className="h-9 rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 text-[12px] font-medium text-[#282828] outline-none placeholder:text-[#6B7280] focus:border-[#43C17A]"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#282828]">
                Category <RequiredMark />
              </span>
              <select className="h-9 cursor-pointer rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 text-[12px] font-medium text-[#282828] outline-none focus:border-[#43C17A]">
                <option value="">Select a category</option>
                <option value="salaries">Salaries</option>
                <option value="events">Events</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="utilities">Utilities</option>
                <option value="internet">Internet & Network</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#282828]">
                Amount <RequiredMark />
              </span>
              <div className="flex h-9 items-center rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 focus-within:border-[#43C17A]">
                <span className="mr-2 text-[14px] font-semibold text-[#525252]">
                  Rs
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-transparent text-[12px] font-medium text-[#282828] outline-none placeholder:text-[#6B7280]"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#282828]">
                Expense Date <RequiredMark />
              </span>
              <input
                type="date"
                className="h-9 rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 text-[12px] font-medium text-[#282828] outline-none focus:border-[#43C17A]"
                style={{ colorScheme: "light" }}
              />
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[#282828]">
              Remarks
            </span>
            <textarea
              placeholder="Enter additional details about this expense..."
              className="min-h-[70px] resize-none rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 py-2 text-[12px] font-medium text-[#282828] outline-none placeholder:text-[#6B7280] focus:border-[#43C17A]"
            />
          </label>

          <div className="mt-4">
            <p className="text-[12px] font-semibold text-[#282828]">
              Attachments
            </p>
            <label className="mt-2 flex min-h-[126px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#9FB49F] bg-white px-4 text-center">
              <input type="file" accept=".pdf,.jpg,.jpeg" className="hidden" />
              <FileText size={34} weight="regular" className="text-[#525E52]" />
              <span className="mt-2 rounded-full bg-[#172B58] px-5 py-1.5 text-[12px] font-bold text-white">
                Upload Invoice
              </span>
              <span className="mt-2 text-[16px] font-medium text-[#525252]">
                PDF, JPG up to 10MB
              </span>
            </label>
          </div>

          <div className="mt-4 border-t border-[#ECECEC] pt-3">
            <div className="flex flex-wrap justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="h-9 min-w-[120px] cursor-pointer rounded-full border border-[#BFCDBE] bg-white px-6 text-[12px] font-semibold text-[#282828]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 min-w-[170px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#086C20] px-6 text-[12px] font-semibold text-white shadow-[0_5px_12px_rgba(8,108,32,0.30)]"
              >
                <FloppyDisk size={14} weight="bold" />
                Save Expense
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
