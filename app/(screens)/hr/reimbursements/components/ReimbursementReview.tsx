"use client";

import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowRight, Building2, ChevronLeft, CircleUserRound, Download, Hourglass, Info, ReceiptText } from "lucide-react";
import type { ReimbursementRequest } from "../data/mockData";

const money = (value: string) => `\u20B9${value.replace(/^[^0-9]*/, "")}`;
const labelClass = "text-[10px] font-medium uppercase tracking-wider text-[#8ca0bd]";

export default function ReimbursementReview({ request }: { request: ReimbursementRequest }) {
  const act = (message: string) => toast.success(message);

  return (
    <main className="min-h-full w-full bg-[#f3f4f6] p-3 text-[#121a2d] sm:p-4">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Link href="/hr/reimbursements" aria-label="Back to reimbursements" className="mt-0.5 inline-flex text-[#121a2d] transition-colors hover:text-[#5546f5] focus:outline-none">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-xl font-bold leading-tight">Review Reimbursement Request</h1>
            <p className="mt-2 text-sm text-[#657b99]">Request ID: {request.id} <span aria-hidden="true">&bull;</span> Submitted on {request.submittedDate}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#f3c64b] bg-[#fff9e9] px-4 py-2 text-xs font-medium text-[#e88400]"><span className="h-1.5 w-1.5 rounded-full bg-[#f4a000]" />Pending HR Approval</span>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(285px,1fr)]">
        <div className="space-y-5">
          <Card title="Employee & Request Details" icon={<CircleUserRound size={18} className="text-[#5546f5]" />}>
            <div className="grid gap-6 md:grid-cols-[1.25fr_1fr_1fr]">
              <div className="flex items-center gap-4 border-r border-[#edf0f4] pr-5">
                <img src={request.employeeAvatar} alt={request.employeeName} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                <div className="min-w-0"><p className="font-bold">{request.employeeName}</p><p className="mt-2 truncate text-xs text-[#5546f5]">{request.employeeEmail}</p></div>
              </div>
              <Detail label="Expense title" value={request.expenseTitle} />
              <Detail label="Expense date" value={request.expenseDate} />
              <div className="md:col-start-2"><Detail label="Expense category" value={request.expenseCategory} /></div>
              <Detail label="Payment method" value={request.paymentMethod} />
            </div>
          </Card>

          <Card title="Expense Details" icon={<ReceiptText size={18} />}>
            <div className="flex flex-wrap justify-between gap-5">
              <div className="max-w-[70%]"><Detail label="Description" value={request.description} muted /></div>
              <div className="text-right"><p className={labelClass}>Amount claimed</p><p className="mt-1 text-2xl font-bold">{money(request.amount)}</p></div>
            </div>
            <p className={`${labelClass} mb-3 mt-7`}>Attachments</p>
            <div className="grid gap-3 sm:grid-cols-3">{request.attachments.map((file, index) => <Attachment key={file.name} file={file} preview={index < 2} />)}</div>
          </Card>

          <Card title="Employee Bank Details" icon={<Building2 size={18} className="text-[#5546f5]" />}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Bank name" value={request.bankDetails.bankName} /><Detail label="Account holder name" value={request.bankDetails.accountHolderName} /><Detail label="Account number" value={request.bankDetails.accountNumber} /><Detail label="IFSC code" value={request.bankDetails.ifscCode} /></div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Approval Timeline" icon={<Hourglass size={18} />}><Timeline done title="Request Submitted" person={request.employeeName} role="" meta="14 Jun 2026, 10:20 AM" /><Timeline active title="HR Review" person="Neha Sharma" role="HR Manager" meta="Current Stage" /><Timeline title="Payment Processing" person="Accountant Manager" role="" /></Card>
          <Card title="Request Information" icon={<Info size={18} />}><div className="space-y-6 text-sm"><Row label="Request ID" value={request.id} /><Row label="Submitted On" value={request.submittedDate} /><div className="border-t border-[#e8ebf0] pt-4"><Row label="Total Amount" value={money(request.amount)} large /></div></div></Card>
          <div className="rounded-xl border border-[#e3e7ed] bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3"><button onClick={() => act("Request rejected")} className="rounded-lg bg-[#e52425] px-3 py-3.5 text-xs font-bold text-white shadow-sm">Reject Request</button><button onClick={() => act("Request approved")} className="rounded-lg bg-[#12aa4c] px-3 py-3.5 text-xs font-bold text-white shadow-sm">Approve Request</button></div>
            <button onClick={() => act("Request approved and forwarded to Finance")} className="mt-3 flex w-full items-center justify-between rounded-lg bg-[#5142ec] px-5 py-3.5 text-white shadow-md"><span /><span><strong className="block text-sm">Approve &amp; Forward</strong><small className="mt-1 block text-[9px] text-indigo-100">Send to Finance</small></span><ArrowRight size={21} /></button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border border-[#e0e5eb] bg-white p-5 shadow-sm"><h2 className="mb-6 flex items-center gap-2 text-base font-bold">{icon}{title}</h2>{children}</section>;
}

function Detail({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return <div><p className={labelClass}>{label}</p><p className={`mt-1.5 text-sm leading-5 ${muted ? "font-normal text-[#394b65]" : "font-semibold"}`}>{value}</p></div>;
}

function Row({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return <div className="flex items-center justify-between gap-4"><span className={large ? "font-bold" : "text-[#6c809c]"}>{label}</span><span className={large ? "text-xl font-bold" : "text-right text-xs font-bold"}>{value}</span></div>;
}

function Attachment({ file, preview }: { file: ReimbursementRequest["attachments"][number]; preview: boolean }) {
  return <div className="overflow-hidden rounded-lg border border-[#dce2ea] bg-[#f7f9fc]"><div className={`flex h-[78px] items-center justify-center ${preview ? "bg-gradient-to-br from-[#183448] to-[#102536]" : "bg-[#fff0f1]"}`}>{preview ? <div className="h-[74px] w-[82px] -rotate-6 bg-white p-2 text-[6px] leading-3 text-gray-700 shadow">RECEIPT<br />DATE 13 JUN 2026<br />TOTAL {file.size}<br />THANK YOU</div> : <span className="rounded bg-[#f0444c] px-2 py-1 text-[9px] font-bold text-white">PDF</span>}</div><div className="flex items-center justify-between p-2.5"><div className="min-w-0"><p className="truncate text-xs font-semibold">{file.name}</p><p className="mt-1 text-[10px] text-[#8ca0bd]">{file.size}</p></div><button aria-label={`Download ${file.name}`} className="rounded-md border border-[#dce2ea] bg-white p-1.5 text-[#5546f5]"><Download size={13} /></button></div></div>;
}

function Timeline({ title, person, role, meta, done, active }: { title: string; person: string; role: string; meta?: string; done?: boolean; active?: boolean }) {
  return <div className="relative grid grid-cols-[20px_1fr_82px] gap-3 pb-6 last:pb-0"><div className={`z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${done ? "border-[#5546f5] bg-[#5546f5]" : active ? "border-[#5546f5] bg-white" : "border-[#bfc3c8] bg-[#e8e8e8]"}`}>{done && <span className="text-[10px] font-bold text-white">&#10003;</span>}</div><div className="absolute left-[9px] top-5 h-[calc(100%-12px)] w-px bg-[#d8ddeb] last:hidden" /><div><p className={`text-xs font-bold ${active ? "text-[#5546f5]" : ""}`}>{title}</p>{meta && <p className={`mt-1.5 text-[9px] ${active ? "text-[#6859ff]" : "text-[#9aaac0]"}`}>{meta}</p>}</div><div className="text-right"><p className="text-[10px] font-semibold text-[#344158]">{person}</p>{role && <p className="mt-1 text-[8px] text-[#9aaac0]">{role}</p>}</div></div>;
}
