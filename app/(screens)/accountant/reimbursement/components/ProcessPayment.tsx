"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  Download,
  FileText,
  Info,
  XCircle,
} from "lucide-react";
import type { HRReimbursementRequest } from "@/lib/helpers/reimbursements/employeeExpenseApprovalsAPI";

const label = "mb-1.5 text-[10px] font-medium uppercase tracking-wide text-[#8b9bb1]";

const formatMoney = (value: number) =>
  `\u20B9${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const requestCode = (request: HRReimbursementRequest) =>
  `RB-${new Date(request.createdAt).getFullYear()}-${String(request.employeeExpenseReportId).padStart(4, "0")}`;

export default function ProcessPayment({ request }: { request: HRReimbursementRequest }) {
  return (
    <main className="min-h-full w-full bg-[#f4f4f4] p-3 text-[#142038] sm:p-5">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-2">
          <Link href="/accountant/reimbursement" aria-label="Back" className="mt-1">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Process Payment</h1>
            <p className="mt-1 text-xs text-[#8290a5]">
              Review reimbursement details and process payment
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#fff5d8] px-4 py-2 text-[10px] font-semibold text-[#e99b00]">
          PENDING PAYMENT
        </span>
      </header>

      <section className="mb-5 grid gap-4 rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <Detail title="Request ID" value={requestCode(request)} />
        <Detail title="Employee" value={request.employeeName} sub={request.employeeEmail} />
        <Detail title="HR Approved Date" value={request.approvedAt ? formatDate(request.approvedAt) : "-"} />
        <div className="lg:border-l lg:pl-8">
          <p className={label}>Approved Amount</p>
          <p className="text-2xl font-bold">{formatMoney(request.amountSpent)}</p>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <Card title="Expense Details" icon={<FileText size={17} className="text-[#1769e0]" />}>
            <div className="grid gap-6 sm:grid-cols-2">
              <Detail title="Expense Title" value={request.expenseTitle} />
              <Detail title="Description" value={request.description} normal />
              <Detail title="Expense Category" value={request.expenseCategory} />
              <Detail title="Bank Name" value={request.paymentBank} />
              <Detail title="Expense Date" value={formatDate(request.expenseDate)} />
            </div>

            <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold">
              <FileText size={15} className="text-[#1769e0]" />
              Uploaded Bills
            </h3>
            {request.attachments.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {request.attachments.map((file) => (
                  <Bill key={file.expenseAttachmentId} file={file} collegeId={request.collegeId} />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-[#dce3eb] bg-[#f8fafc] p-4 text-xs text-[#596578]">
                No bills uploaded.
              </p>
            )}
          </Card>

          <Card title="Employee Bank Details" icon={<Building2 size={17} className="text-[#1769e0]" />}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Detail title="Bank Name" value={request.paymentBank} />
              <Detail title="Account Holder Name" value={request.employeeName} />
              <Detail title="Account Number" value={request.accountNumber} />
              <Detail title="IFSC Code" value={request.ifscCode} />
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Payment Information" icon={<Info size={17} className="text-[#1769e0]" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <p className={label}>Payment Method</p>
                <select className="h-10 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 text-xs">
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                </select>
              </label>
              <label>
                <p className={label}>Transaction ID</p>
                <input
                  className="h-10 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 text-xs outline-none focus:border-[#1769e0]"
                  placeholder="Enter transaction ID"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <p className={label}>Payment Date</p>
              <span className="relative block">
                <input
                  type="date"
                  className="h-10 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 text-xs"
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-3 text-[#91a0b4]" size={15} />
              </span>
            </label>
            <label className="mt-4 block">
              <p className={label}>Remarks (Optional)</p>
              <textarea
                className="h-20 w-full resize-none rounded-lg border border-[#dce3eb] bg-[#f8fafc] p-3 text-xs outline-none focus:border-[#1769e0]"
                placeholder="Enter remarks"
              />
            </label>
            <p className="mt-4 flex gap-2 rounded-lg border border-[#cfe0fb] bg-[#edf5ff] p-3 text-[10px] text-[#1769e0]">
              <Info size={13} className="shrink-0" />
              Ensure the payment is made to the employee&apos;s registered bank account only.
            </p>
          </Card>

          <Card title="Approval Timeline" icon={<Info size={17} className="text-[#1769e0]" />}>
            <Timeline done title="Request Submitted" meta={formatDate(request.createdAt)} person={request.employeeName} />
            <Timeline done title="HR Approved" meta={request.approvedAt ? formatDate(request.approvedAt) : "Completed"} person="HR Manager" />
            <Timeline active title="Finance Processing" meta="CURRENT STAGE" person="Accountant" />
            <Timeline title="Payment Completed" meta="Pending" person="" />
          </Card>
        </aside>
      </div>

      <footer className="mt-5 flex justify-end gap-3 border-t border-[#dce2e9] pt-4">
        <button
          onClick={() => toast.error("Payment request rejected")}
          className="flex items-center gap-2 rounded-lg border border-[#ffb8b8] bg-white px-5 py-2.5 text-xs font-semibold text-[#e53935]"
        >
          <XCircle size={15} />
          Reject Request
        </button>
        <button
          onClick={() => toast.success("Payment marked as paid")}
          className="flex items-center gap-2 rounded-lg bg-[#1769e0] px-6 py-2.5 text-xs font-semibold text-white shadow-md"
        >
          <Check size={15} />
          Mark as Paid
        </button>
      </footer>
    </main>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 text-sm font-bold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Detail({
  title,
  value,
  sub,
  normal,
}: {
  title: string;
  value: string;
  sub?: string;
  normal?: boolean;
}) {
  return (
    <div>
      <p className={label}>{title}</p>
      <p className={`text-xs leading-5 ${normal ? "font-normal text-[#526177]" : "font-semibold"}`}>
        {value || "-"}
      </p>
      {sub && <p className="text-[9px] text-[#8492a6]">{sub}</p>}
    </div>
  );
}

function Bill({
  file,
  collegeId,
}: {
  file: HRReimbursementRequest["attachments"][number];
  collegeId: number;
}) {
  const download = async () => {
    try {
      const response = await fetch(
        `/api/hr/reimbursements/attachments?attachmentId=${file.expenseAttachmentId}&collegeId=${collegeId}`,
      );
      if (!response.ok) throw new Error("Unable to download attachment.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Unable to download attachment.");
    }
  };

  const isPdf = file.fileType?.includes("pdf") || file.fileName.toLowerCase().endsWith(".pdf");

  return (
    <div className="overflow-hidden rounded-lg border border-[#dfe5ec]">
      <div
        className={`flex h-24 items-center justify-center ${
          isPdf ? "bg-[#fff0f1]" : "bg-gradient-to-br from-[#52656b] to-[#263b43]"
        }`}
      >
        {isPdf ? (
          <span className="rounded bg-[#ef4444] px-2 py-1 text-[9px] font-bold text-white">PDF</span>
        ) : (
          <div className="h-20 w-16 -rotate-6 bg-white p-2 text-[6px] leading-3 shadow">
            RECEIPT
            <br />
            TOTAL {formatFileSize(file.fileSize)}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold">{file.fileName}</p>
          <p className="text-[8px] text-[#91a0b4]">{formatFileSize(file.fileSize)}</p>
        </div>
        <button
          type="button"
          onClick={download}
          aria-label={`Download ${file.fileName}`}
          className="text-[#1769e0]"
        >
          <Download size={13} />
        </button>
      </div>
    </div>
  );
}

function Timeline({
  title,
  meta,
  person,
  done,
  active,
}: {
  title: string;
  meta: string;
  person: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="relative grid grid-cols-[18px_1fr_82px] gap-2 pb-6 last:pb-0">
      <span
        className={`z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
          done
            ? "border-[#2ac36a] bg-[#2ac36a] text-white"
            : active
              ? "border-[#1769e0] bg-white"
              : "border-[#dce4ed] bg-white"
        }`}
      >
        {done && <Check size={9} />}
      </span>
      <span className="absolute left-[7px] top-4 h-[calc(100%-10px)] w-px bg-[#dce4ed]" />
      <div>
        <p className={`text-[11px] font-semibold ${active ? "text-[#1769e0]" : ""}`}>{title}</p>
        <p className={`mt-1 text-[8px] ${active ? "font-bold text-[#1769e0]" : "text-[#91a0b4]"}`}>
          {meta}
        </p>
      </div>
      <p className="text-right text-[8px] text-[#526177]">{person}</p>
    </div>
  );
}
