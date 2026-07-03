"use client";

import {
  Bank,
  CalendarBlank,
  DownloadSimple,
  Eye,
  FilePdf,
  ListBullets,
  PencilSimple,
  Receipt,
  User,
  X,
} from "@phosphor-icons/react";
import { useEffect } from "react";

export type TransactionDetails = {
  id: string;
  date: string;
  category: string;
  title: string;
  amount: string;
};

type TransactionDetailsModalProps = {
  transaction: TransactionDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
};

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-md border border-[#C9D6CF] bg-[#F7F8F8] p-3">
      <div className="flex items-center gap-2 text-[#08743B]">
        {icon}
        <p className="text-[10px] font-semibold text-[#282828]">{label}</p>
      </div>
      <p className="mt-2 text-[13px] font-bold leading-tight text-[#282828]">
        {value}
      </p>
    </section>
  );
}

function AttachmentCard({
  fileName,
  meta,
}: {
  fileName: string;
  meta: string;
}) {
  return (
    <article className="flex h-14 min-w-0 items-center gap-3 rounded-md border border-[#C9D6CF] bg-[#F7F8F8] px-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#FDECEC] text-[#D92D20]">
        <FilePdf size={16} weight="fill" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold text-[#282828]">
          {fileName}
        </p>
        <p className="mt-0.5 text-[9px] font-semibold text-[#525252]">{meta}</p>
      </div>
      <button type="button" aria-label={`View ${fileName}`} className="cursor-pointer">
        <Eye size={15} weight="bold" className="text-[#5B6269]" />
      </button>
      <button
        type="button"
        aria-label={`Download ${fileName}`}
        className="cursor-pointer"
      >
        <DownloadSimple size={15} weight="bold" className="text-[#5B6269]" />
      </button>
    </article>
  );
}

export default function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onEdit,
}: TransactionDetailsModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
      <section className="mx-auto flex max-h-[calc(100vh-64px)] w-full max-w-[680px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="shrink-0 flex items-center justify-between gap-4 border-b border-[#D8DEDA] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Receipt size={18} weight="fill" className="text-[#08743B]" />
            <h2 className="text-[16px] font-bold text-[#111827]">
              Transaction Details
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close transaction details"
            onClick={onClose}
            className="cursor-pointer text-[#282828]"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#C9D6CF] bg-[#F1FAF6] px-4 py-4">
            <div>
              <h3 className="text-[18px] font-bold text-[#111827]">
                {transaction.title} - October 2023
              </h3>
              <p className="mt-1.5 text-[11px] font-medium text-[#525252]">
                TXN_ID: #882941032
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wide text-[#525252]">
                Total Amount
              </p>
              <p className="text-[20px] font-bold leading-tight text-[#08743B]">
                Rs 2,10,000.00
              </p>
            </div>
          </section>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoTile
              icon={<CalendarBlank size={15} weight="bold" />}
              label="Transaction Date"
              value="28 Oct 2023"
            />
            <InfoTile
              icon={<ListBullets size={15} weight="bold" />}
              label="Category"
              value="Faculty Salaries"
            />
            <InfoTile
              icon={<Bank size={15} weight="fill" />}
              label="Payment Method"
              value="Bank Transfer"
            />
            <InfoTile
              icon={<User size={15} weight="bold" />}
              label="Processed By"
              value="A. Sharma"
            />
          </div>

          <section className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <ListBullets size={16} weight="bold" className="text-[#08743B]" />
              <h3 className="text-[14px] font-bold text-[#282828]">Remarks</h3>
            </div>
            <div className="rounded-md border border-[#C9D6CF] bg-[#F7F8F8] px-4 py-4">
              <p className="text-[12px] font-medium leading-relaxed text-[#525252]">
                Monthly faculty payroll processing for the Computer Science and
                Engineering department.
              </p>
            </div>
          </section>

          <section className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <Receipt size={16} weight="fill" className="text-[#08743B]" />
              <h3 className="text-[14px] font-bold text-[#282828]">
                Attached Documents
              </h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <AttachmentCard
                fileName="Salary_Statement_October.pdf"
                meta="2.4 MB - PDF Document"
              />
              <AttachmentCard
                fileName="Attendance_Log_Faculty.xlsx"
                meta="842 KB - Excel Sheet"
              />
            </div>
          </section>
        </div>

        <footer className="shrink-0 flex flex-wrap justify-end gap-3 border-t border-[#D8DEDA] bg-[#F7F8F8] px-4 py-3.5">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[#08743B] bg-white px-4 text-[11px] font-bold text-[#08743B]"
          >
            <PencilSimple size={14} weight="bold" />
            Edit Transaction
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 min-w-[88px] cursor-pointer rounded-md bg-[#08743B] px-4 text-[11px] font-bold text-white"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
