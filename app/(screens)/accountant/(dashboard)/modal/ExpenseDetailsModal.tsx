"use client";

import {
  ArrowLeft,
  Bank,
  DownloadSimple,
  Export,
  FilePdf,
  Money,
  PencilSimple,
  SquaresFour,
} from "@phosphor-icons/react";
import { useEffect } from "react";

type ExpenseDetails = {
  expenseId: string;
  category: string;
  expenseName: string;
  amount: string;
  date: string;
};

type ExpenseDetailsModalProps = {
  expense: ExpenseDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
};

function DetailTile({
  icon,
  label,
  value,
  valueClassName = "text-[#282828]",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <section className="rounded-md bg-[#F0F2F4] p-4">
      <div className="flex items-center gap-2 text-[#525252]">
        {icon}
        <p className="text-[11px] font-semibold">{label}</p>
      </div>
      <p className={`mt-2 text-[20px] font-bold leading-tight ${valueClassName}`}>
        {value}
      </p>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#525252]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold leading-tight text-[#282828]">
        {value}
      </p>
    </div>
  );
}

function AttachmentRow({
  label,
  tone,
}: {
  label: string;
  tone: "red" | "green";
}) {
  return (
    <div className="flex h-10 items-center gap-3 border-t border-[#E4E7EA] px-4">
      <FilePdf
        size={18}
        weight="fill"
        className={tone === "red" ? "text-[#D92D20]" : "text-[#237333]"}
      />
      <p className="flex-1 text-[12px] font-semibold text-[#282828]">{label}</p>
      <button type="button" aria-label={`Download ${label}`} className="cursor-pointer">
        <DownloadSimple size={17} weight="bold" className="text-[#282828]" />
      </button>
    </div>
  );
}

export default function ExpenseDetailsModal({
  expense,
  isOpen,
  onClose,
  onEdit,
}: ExpenseDetailsModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-6 sm:items-center">
      <section className="w-full max-w-[760px] overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-[#E6E8EB] px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Close expense details"
              onClick={onClose}
              className="cursor-pointer text-[#237333]"
            >
              <ArrowLeft size={19} weight="bold" />
            </button>
            <h2 className="text-[18px] font-bold text-[#282828]">
              Expense Details
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-[#BFCDBE] bg-white px-4 text-[11px] font-bold text-[#237333]"
            >
              <Export size={13} weight="bold" />
              Export
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 cursor-pointer items-center gap-2 rounded-full bg-[#086C20] px-4 text-[11px] font-bold text-white"
            >
              <PencilSimple size={13} weight="bold" />
              Edit
            </button>
          </div>
        </header>

        <div className="max-h-[78vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailTile
              icon={<Money size={14} weight="fill" />}
              label="Total Amount"
              value={expense.amount}
              valueClassName="text-[#147A3D]"
            />
            <DetailTile
              icon={<SquaresFour size={14} weight="fill" />}
              label="Category"
              value={expense.category}
            />
          </div>

          <section className="mt-5 overflow-hidden rounded-lg border border-[#E6E8EB]">
            <h3 className="bg-[#F0F2F4] px-4 py-3 text-[12px] font-bold text-[#282828]">
              Expense Information
            </h3>
            <div className="grid gap-x-10 gap-y-5 p-4 md:grid-cols-2">
              <InfoItem label="Expense Name" value={expense.expenseName} />
              <InfoItem label="Recorded Date" value={expense.date} />
              <InfoItem label="Recorded By" value="Stephen Jones" />
              <InfoItem
                label="Payment Method"
                value="Bank Transfer (HDFC Bank)"
              />
              <div className="rounded-md bg-[#F0F2F4] p-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Bank size={14} weight="fill" className="text-[#525252]" />
                  <p className="text-[11px] font-semibold text-[#525252]">
                    Remarks
                  </p>
                </div>
                <p className="mt-3 text-[12px] font-medium leading-relaxed text-[#282828]">
                  Monthly faculty salary payment for October 2025. Includes base pay
                  and performance bonuses.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-lg border border-[#E6E8EB]">
            <div className="flex items-center justify-between bg-[#F0F2F4] px-4 py-3">
              <h3 className="text-[12px] font-bold text-[#282828]">Attachments</h3>
              <p className="text-[12px] font-semibold text-[#282828]">3 Files</p>
            </div>
            <AttachmentRow label="Salary Sheet.pdf" tone="red" />
            <AttachmentRow label="Invoice.pdf" tone="green" />
          </section>
        </div>
      </section>
    </div>
  );
}
