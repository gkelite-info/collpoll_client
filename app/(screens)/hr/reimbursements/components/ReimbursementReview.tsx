"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Building2,
  ChevronLeft,
  CircleUserRound,
  Clock3,
  Download,
  Hourglass,
  Info,
  Loader2,
  ReceiptText,
  Check,
  X,
} from "lucide-react";
import { useUser } from "@/app/utils/context/UserContext";
import {
  approveReimbursement,
  rejectReimbursement,
  type HRReimbursementRequest,
} from "@/lib/helpers/reimbursements/employeeExpenseApprovalsAPI";

const formatMoney = (value: number) =>
  `\u20B9${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
const formatDateMonthYear = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;
const labelClass = "text-[10px] font-medium uppercase tracking-wider text-[#8ca0bd]";

export default function ReimbursementReview({ request }: { request: HRReimbursementRequest }) {
  const { userId, collegeId } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const currentStatus = request.status?.toLowerCase() ?? "pending";

  const handleApprove = async () => {
    if (!userId || !collegeId) return toast.error("User context missing");
    try {
      setSubmitting(true);
      await approveReimbursement({ reportId: request.employeeExpenseReportId, userId, collegeId });
      toast.success("Request approved and forwarded to accountant");
      router.push("/accountant/reimbursement");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to approve request"));
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!userId || !collegeId) return toast.error("User context missing");
    try {
      setSubmitting(true);
      await rejectReimbursement({ reportId: request.employeeExpenseReportId, userId, collegeId });
      toast.success("Request rejected successfully");
      router.push("/hr/reimbursements");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reject request"));
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-full w-full bg-[#f3f4f6] p-3 text-[#121a2d] sm:p-4">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Link
            href="/hr/reimbursements"
            aria-label="Back to reimbursements"
            className="mt-0.5 inline-flex text-[#121a2d] transition-colors hover:text-[#5546f5] focus:outline-none"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-xl font-bold leading-tight">Review Reimbursement Request</h1>
            <p className="mt-2 text-sm text-[#657b99]">
              Submitted on{" "}
              {new Date(request.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <StatusBadge status={currentStatus} />
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(285px,1fr)]">
        <div className="space-y-5">
          <Card title="Employee & Request Details" icon={<CircleUserRound size={18} className="text-[#5546f5]" />}>
            <div className="grid gap-6 md:grid-cols-[minmax(210px,0.85fr)_1fr]">
              <div className="flex items-center gap-4 border-b border-[#edf0f4] pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-6">
                <img
                  src={request.employeeAvatar}
                  alt={request.employeeName}
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-base font-bold">{request.employeeName}</p>
                  <p className="mt-2 truncate text-xs text-[#5546f5]">{request.employeeEmail}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#6b7b93]">
                    {request.employeeMobile && <span>{request.employeeMobile}</span>}
                    {request.employeeRole && <span>{request.employeeRole}</span>}
                    {request.employeeGender && <span>{request.employeeGender}</span>}
                  </div>
                </div>
              </div>
              <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                <Detail label="Expense title" value={request.expenseTitle} />
                <Detail label="Expense date" value={formatDateMonthYear(request.expenseDate)} />
                <Detail label="Expense category" value={request.expenseCategory} />
                <Detail label="Bank name" value={request.paymentBank} />
              </div>
            </div>
          </Card>

          <Card title="Expense Details" icon={<ReceiptText size={18} />}>
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="max-w-[620px]">
                <Detail label="Description" value={request.description} muted />
              </div>
              <div className="sm:text-right">
                <p className={labelClass}>Amount claimed</p>
                <p className="mt-1 text-2xl font-bold">{formatMoney(request.amountSpent)}</p>
              </div>
            </div>
            <p className={`${labelClass} mb-3 mt-7`}>Attachments</p>
            {request.attachments.length ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {request.attachments.map((file, index) => (
                  <Attachment
                    key={file.expenseAttachmentId}
                    file={file}
                    collegeId={collegeId}
                    preview={index < 2}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-[#dce2ea] bg-[#f7f9fc] px-4 py-5 text-sm text-[#6b7b93]">
                No attachments uploaded.
              </p>
            )}
          </Card>

          <Card title="Employee Bank Details" icon={<Building2 size={18} className="text-[#5546f5]" />}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Detail label="Bank name" value={request.paymentBank} />
              <Detail label="Account holder name" value={request.employeeName} />
              <Detail label="Account number" value={request.accountNumber} />
              <Detail label="IFSC code" value={request.ifscCode} />
            </div>
          </Card>

          {request.employeeHistory && request.employeeHistory.length > 0 && (
            <Card title="Previous Requests by Employee" icon={<Clock3 size={18} className="text-gray-500" />}>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f8fafc] text-[10px] uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {request.employeeHistory.map((hist) => (
                      <tr key={hist.employeeExpenseReportId} className="hover:bg-gray-50/50">
                        <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-600">
                          {hist.expenseTitle}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold">
                          {formatMoney(hist.amountSpent)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(hist.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <CompactStatusPill status={hist.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          <Card title="Approval Timeline" icon={<Hourglass size={18} />}>
            <Timeline
              done
              title="Request Submitted"
              person={request.employeeName}
              role=""
              meta={new Date(request.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <Timeline
              active={currentStatus === "pending"}
              done={currentStatus === "approved"}
              rejected={currentStatus === "rejected"}
              title="HR Review"
              person="HR Manager"
              role=""
              meta={currentStatus === "pending" ? "Current Stage" : currentStatus === "approved" ? "Completed" : ""}
            />
            <Timeline 
              active={currentStatus === "approved"} 
              title="Payment Processing" 
              person="Accountant Manager" 
              role="" 
            />
          </Card>

          <Card title="Request Information" icon={<Info size={18} />}>
            <div className="space-y-6 text-sm">
              <Row
                label="Submitted On"
                value={new Date(request.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              />
              <div className="border-t border-[#e8ebf0] pt-4">
                <Row label="Total Amount" value={formatMoney(request.amountSpent)} large />
              </div>
            </div>
          </Card>

          {currentStatus === "pending" && (
            <div className="rounded-xl border border-[#e3e7ed] bg-white p-5 shadow-sm">
              <div>
                <button
                  disabled={submitting}
                  onClick={handleReject}
                  className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#e52425] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#cc2021] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : "Reject Request"}
                </button>
              </div>
              <button
                disabled={submitting}
                onClick={handleApprove}
                className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-lg bg-[#5142ec] px-5 py-3.5 text-white shadow-md transition-colors hover:bg-[#4639cb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span />
                <span className="text-center">
                  <strong className="block text-sm">Approve &amp; Forward</strong>
                  <small className="mt-1 block text-[9px] text-indigo-100">Send to Finance</small>
                </span>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <span className="text-xl leading-none">&rarr;</span>}
              </button>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#e0e5eb] bg-white p-5 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 text-base font-bold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Detail({ label, value, muted = false }: { label: string; value: string | null; muted?: boolean }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className={`mt-1.5 text-sm leading-5 ${muted ? "font-normal text-[#394b65]" : "font-semibold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function Row({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={large ? "font-bold" : "text-[#6c809c]"}>{label}</span>
      <span className={large ? "text-xl font-bold" : "text-right text-xs font-bold"}>{value}</span>
    </div>
  );
}

function Attachment({
  file,
  collegeId,
  preview,
}: {
  file: HRReimbursementRequest["attachments"][number];
  collegeId: number | null;
  preview: boolean;
}) {
  const handleDownload = async () => {
    if (!collegeId) {
      toast.error("College context missing.");
      return;
    }

    try {
      const response = await fetch(
        `/api/hr/reimbursements/attachments?attachmentId=${file.expenseAttachmentId}&collegeId=${collegeId}`,
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to download attachment.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.fileName;
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to download attachment."));
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#dce2ea] bg-[#f7f9fc]">
      <div
        className={`flex h-[78px] items-center justify-center ${
          preview ? "bg-gradient-to-br from-[#183448] to-[#102536]" : "bg-[#fff0f1]"
        }`}
      >
        {preview ? (
          <div className="h-[74px] w-[82px] -rotate-6 bg-white p-2 text-[6px] leading-3 text-gray-700 shadow">
            RECEIPT
            <br />
            TOTAL {formatFileSize(file.fileSize)}
            <br />
            THANK YOU
          </div>
        ) : (
          <span className="rounded bg-[#f0444c] px-2 py-1 text-[9px] font-bold text-white">FILE</span>
        )}
      </div>
      <div className="flex items-center justify-between p-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{file.fileName}</p>
          <p className="mt-1 text-[10px] text-[#8ca0bd]">{formatFileSize(file.fileSize)}</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          aria-label={`Download ${file.fileName}`}
          className="cursor-pointer rounded-md border border-[#dce2ea] bg-white p-1.5 text-[#5546f5] hover:bg-gray-50"
        >
          <Download size={13} />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-[#43C17A] bg-[#e4f6ec] px-4 py-2 text-xs font-medium text-[#0c8a4b]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#43C17A]" />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-[#d32f35] bg-[#fdebec] px-4 py-2 text-xs font-medium text-[#d32f35]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d32f35]" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#f3c64b] bg-[#fff9e9] px-4 py-2 text-xs font-medium text-[#e88400]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#f4a000]" />
      Pending HR Approval
    </span>
  );
}

function CompactStatusPill({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  if (normalized === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-[#e4f6ec] px-1.5 py-0.5 font-medium text-[#0c8a4b]">
        <span className="h-1 w-1 rounded-full bg-[#43C17A]" />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-[#fdebec] px-1.5 py-0.5 font-medium text-[#d32f35]">
        <span className="h-1 w-1 rounded-full bg-[#d32f35]" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-[#fff9e9] px-1.5 py-0.5 font-medium text-[#e88400]">
      <span className="h-1 w-1 rounded-full bg-[#f4a000]" />
      Pending
    </span>
  );
}

function Timeline({
  title,
  person,
  role,
  meta,
  done,
  active,
  rejected,
}: {
  title: string;
  person: string;
  role: string;
  meta?: string;
  done?: boolean;
  active?: boolean;
  rejected?: boolean;
}) {
  return (
    <div className="relative grid grid-cols-[20px_1fr_82px] gap-3 pb-6 last:pb-0">
      <div
        className={`z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          rejected
            ? "border-[#e52425] bg-[#e52425]"
            : done
            ? "border-[#5546f5] bg-[#5546f5]"
            : active
              ? "border-[#5546f5] bg-white"
              : "border-[#bfc3c8] bg-[#e8e8e8]"
        }`}
      >
        {done && <Check size={13} strokeWidth={4} className="text-white" />}
        {rejected && <X size={13} strokeWidth={4} className="text-white" />}
      </div>
      <div className="absolute left-[9px] top-5 h-[calc(100%-12px)] w-px bg-[#d8ddeb] last:hidden" />
      <div>
        <p className={`text-xs font-bold ${rejected ? "text-[#e52425]" : active ? "text-[#5546f5]" : ""}`}>{title}</p>
        {meta && (
          <p className={`mt-1.5 text-[9px] ${active ? "text-[#6859ff]" : "text-[#9aaac0]"}`}>
            {meta}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-semibold text-[#344158]">{person}</p>
        {role && <p className="mt-1 text-[8px] text-[#9aaac0]">{role}</p>}
      </div>
    </div>
  );
}
