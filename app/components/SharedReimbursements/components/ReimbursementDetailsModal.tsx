"use client";

import { createPortal } from "react-dom";
import { ClipboardList, Download, Paperclip, X } from "lucide-react";
import toast from "react-hot-toast";
import { getExpenseAttachmentSignedUrl, type EmployeeExpenseReport } from "@/lib/helpers/reimbursements/employeeExpenseReportsAPI";
import Info from "./Info";
import RequestStatus from "./RequestStatus";
import { displayStatus } from "./ReimbursementsList";

type Props = { report: EmployeeExpenseReport; onClose: () => void };

export default function ReimbursementDetailsModal({ report, onClose }: Props) {
  const openAttachment = async (filePath: string, download = false) => {
    try {
      const url = await getExpenseAttachmentSignedUrl(filePath);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      if (download) anchor.download = "";
      anchor.rel = "noopener noreferrer";
      anchor.click();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open attachment.");
    }
  };

  if (typeof document === "undefined") return null;
  const status = displayStatus(report.status);
  const submitted = new Date(report.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-4 py-6 lg:pl-[calc(17vw+1rem)]">
      <div className="relative max-h-[92vh] w-full max-w-[900px] overflow-y-auto rounded-[16px] bg-[#F8FAFC] p-6 shadow-2xl [&_button]:cursor-pointer">
        <button type="button" onClick={onClose} aria-label="Close reimbursement details" className="absolute right-5 top-5 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"><X size={20}/></button>
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4 pr-9"><div><h2 className="text-[24px] font-bold text-[#14213A]">{report.expenseTitle}</h2><p className="mt-1 text-[13px] text-[#61708A]">Request ID: REIM-{report.employeeExpenseReportId} · Submitted on {submitted}</p></div><RequestStatus status={status}/></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3 border-b border-[#E7EDF5] pb-5"><span className="rounded-[8px] bg-[#EEE9FF] p-2 text-[#7B45FF]"><ClipboardList size={20}/></span><h3 className="text-[17px] font-bold text-[#14213A]">Expense Summary</h3></div><div className="grid gap-x-12 gap-y-4 sm:grid-cols-2"><Info label="Category" value={report.expenseCategory}/><Info label="Expense Date" value={new Date(`${report.expenseDate}T00:00:00`).toLocaleDateString("en-IN")}/><Info label="Amount" value={`₹${report.amountSpent.toLocaleString("en-IN", {minimumFractionDigits:2})}`} strong/><Info label="Payment Bank" value={report.paymentBank}/><Info label="Description" value={report.description} className="sm:col-span-2"/></div></section>
            <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><span className="rounded-[8px] bg-[#F2E9FF] p-2 text-[#884DFF]"><Paperclip size={20}/></span><h3 className="text-[17px] font-bold text-[#14213A]">Uploaded Bills</h3></div>{report.attachments.length === 0 ? <p className="text-sm text-[#7C8AA0]">No attachments uploaded.</p> : <div className="grid gap-4 md:grid-cols-3">{report.attachments.map((file) => <article key={file.expenseAttachmentId} className="rounded-[8px] border border-[#E7EDF5] p-3"><div className="mb-3 flex h-20 items-center justify-center rounded bg-[#EFF3F8] text-xs font-bold text-[#61708A]">{file.fileType.includes("pdf") ? "PDF" : "IMAGE"}</div><p className="truncate text-[12px] font-bold text-[#14213A]">{file.fileName}</p><p className="mb-2 text-[11px] text-[#7C8AA0]">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p><div className="flex gap-2"><button type="button" onClick={() => void openAttachment(file.fileUrl)} className="h-8 flex-1 rounded border text-[11px] font-bold">Preview</button><button type="button" onClick={() => void openAttachment(file.fileUrl, true)} aria-label={`Download ${file.fileName}`} className="grid h-8 w-8 place-items-center rounded border text-[#4F46E5]"><Download size={14}/></button></div></article>)}</div>}</section>
          </div>
          <aside className="space-y-5"><section className="rounded-[10px] border border-[#E2E8F0] bg-white p-6 shadow-sm"><h3 className="mb-5 text-[17px] font-bold text-[#14213A]">Request Overview</h3><div className="space-y-4"><Info label="Status" value={status} badge/><Info label="Account Number" value={report.accountNumber}/><Info label="IFSC Code" value={report.ifscCode}/><Info label="Submitted On" value={submitted}/>{report.approvedAt && <Info label="Approved On" value={new Date(report.approvedAt).toLocaleDateString("en-IN")}/>} {report.rejectedAt && <Info label="Rejected On" value={new Date(report.rejectedAt).toLocaleDateString("en-IN")}/>}</div></section></aside>
        </div>
      </div>
    </div>, document.body,
  );
}
