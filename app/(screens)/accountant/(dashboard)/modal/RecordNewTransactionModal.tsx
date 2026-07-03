"use client";

import { FloppyDisk, UploadSimple, X } from "@phosphor-icons/react";
import { useEffect } from "react";

type RecordNewTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] font-semibold text-[#282828]">{children}</span>
  );
}

export default function RecordNewTransactionModal({
  isOpen,
  onClose,
}: RecordNewTransactionModalProps) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
      <section className="mx-auto flex max-h-[calc(100vh-64px)] w-full max-w-[660px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="shrink-0 flex items-start justify-between gap-4 border-b border-[#D8DEDA] px-6 py-4">
          <div>
            <h2 className="text-[20px] font-bold leading-tight text-[#111827]">
              Record New Transaction
            </h2>
            <p className="mt-1.5 text-[12px] font-medium text-[#525252]">
              Fill in the details below to log a financial entry.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close record transaction modal"
            onClick={onClose}
            className="cursor-pointer text-[#282828]"
          >
            <X size={22} weight="bold" />
          </button>
        </header>

        <form className="flex-1 overflow-y-auto px-6 py-5">
          <label className="flex flex-col gap-2">
            <FieldLabel>Transaction Title</FieldLabel>
            <input
              type="text"
              placeholder="e.g., Annual Faculty Bonus"
              className="h-11 rounded-md border border-[#BFCDBE] bg-[#F3F4F5] px-4 text-[14px] font-medium text-[#282828] outline-none placeholder:text-[#9CA3AF] focus:border-[#43C17A]"
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <FieldLabel>Category</FieldLabel>
              <select className="h-11 cursor-pointer rounded-md border border-[#BFCDBE] bg-[#F3F4F5] px-4 text-[14px] font-medium text-[#282828] outline-none focus:border-[#43C17A]">
                <option value="">Select category</option>
                <option value="salaries">Faculty Salaries</option>
                <option value="events">Events</option>
                <option value="furniture">Furniture</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="internet">Internet</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <FieldLabel>Date</FieldLabel>
              <input
                type="date"
                className="h-11 rounded-md border border-[#BFCDBE] bg-[#F3F4F5] px-4 text-[14px] font-medium text-[#282828] outline-none focus:border-[#43C17A]"
                style={{ colorScheme: "light" }}
              />
            </label>
          </div>

          <label className="mt-4 flex max-w-[270px] flex-col gap-2">
            <FieldLabel>Payment Method</FieldLabel>
            <select className="h-11 cursor-pointer rounded-md border border-[#BFCDBE] bg-[#F3F4F5] px-4 text-[14px] font-medium text-[#282828] outline-none focus:border-[#43C17A]">
              <option value="">Select method</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </label>

          <label className="mt-4 flex flex-col gap-2">
            <FieldLabel>Amount</FieldLabel>
            <div className="flex h-11 items-center rounded-md border border-[#BFCDBE] bg-[#F3F4F5] px-4 focus-within:border-[#43C17A]">
              <span className="mr-3 text-[14px] font-semibold text-[#282828]">
                Rs
              </span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-transparent text-[14px] font-medium text-[#282828] outline-none placeholder:text-[#8A9099]"
              />
            </div>
          </label>

          <label className="mt-4 flex flex-col gap-2">
            <FieldLabel>Remarks</FieldLabel>
            <textarea
              placeholder="Add any additional notes here..."
              className="min-h-[82px] resize-none rounded-md border border-[#BFCDBE] bg-[#F3F4F5] px-4 py-3 text-[14px] font-medium text-[#282828] outline-none placeholder:text-[#9CA3AF] focus:border-[#43C17A]"
            />
          </label>

          <div className="mt-4">
            <FieldLabel>Attachment (Receipt/Invoice)</FieldLabel>
            <label className="mt-2 flex min-h-[122px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#C9D2CF] bg-[#F6F7F8] px-4 text-center">
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF7E8] text-[#43C17A]">
                <UploadSimple size={17} weight="bold" />
              </span>
              <span className="mt-3 text-[12px] font-bold text-[#282828]">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 text-[10px] font-medium text-[#6B7280]">
                Support for PDF, PNG, or JPG (Max 5MB)
              </span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 min-w-[108px] cursor-pointer rounded-md border border-[#BFCDBE] bg-white px-5 text-[12px] font-bold text-[#282828]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 min-w-[178px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#24C96F] px-5 text-[12px] font-bold text-white shadow-[0_6px_12px_rgba(36,201,111,0.22)]"
            >
              <FloppyDisk size={14} weight="bold" />
              Save Transaction
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
