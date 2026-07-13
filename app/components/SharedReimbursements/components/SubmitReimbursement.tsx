"use client";

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";
import { Building2, ChevronDown, ChevronLeft, CloudUpload, FileText, ReceiptText, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import { createEmployeeExpenseReport, updateEmployeeExpenseReport, type EmployeeExpenseReport } from "@/lib/helpers/reimbursements/employeeExpenseReportsAPI";
import { formatFileSize, prepareExpenseAttachments } from "@/lib/helpers/reimbursements/prepareExpenseAttachment";

import FormCard from "./FormCard";

type SubmitReimbursementProps = {
  onBack: () => void;
  onSubmitted?: () => void;
  initialReport?: EmployeeExpenseReport | null;
};

const inputClass = "h-11 w-full rounded-[7px] border border-[#BFD0C2] bg-white px-3 text-[14px] text-[#14213A] outline-none focus:border-[#43C17A] disabled:bg-gray-100";
const labelClass = "mb-2 block text-[12px] font-bold tracking-wide text-[#4A5565]";
const expenseCategories = [
  "Business Travel",
  "Local Conveyance",
  "Fuel & Mileage",
  "Accommodation",
  "Employee Meals",
  "Client Lunch / Dinner",
  "Client Entertainment",
  "Team Party / Celebration",
  "Conference & Seminar",
  "Training & Certification",
  "Office Supplies",
  "Software & Subscriptions",
  "Internet & Mobile Bills",
  "Other",
];

const isAllowedAttachment = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ["pdf", "jpg", "jpeg", "png"].includes(extension ?? "") &&
    (!file.type || ["application/pdf", "application/octet-stream", "image/jpeg", "image/jpg", "image/png"].includes(file.type));
};

const getSubmissionErrorMessage = (error: unknown) => {
  const databaseError = error as { code?: string; message?: string } | null;
  if (databaseError?.code === "42501") {
    return "You do not have permission to submit reimbursements. Please contact your administrator.";
  }
  if (databaseError?.message?.toLowerCase().includes("bucket not found")) {
    return "Receipt storage is not configured. Please contact your administrator.";
  }
  if (databaseError?.message) return `Submission failed: ${databaseError.message}`;
  return "We could not submit your request. Please try again.";
};

export default function SubmitReimbursement({ onBack, onSubmitted, initialReport }: SubmitReimbursementProps) {
  const { userId, collegeId, loading: userLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    expenseTitle: initialReport?.expenseTitle ?? "",
    expenseCategory: initialReport?.expenseCategory ?? "Business Travel",
    expenseDate: initialReport?.expenseDate ?? "",
    amountSpent: initialReport ? String(initialReport.amountSpent) : "",
    description: initialReport?.description ?? "",
    paymentBank: initialReport?.paymentBank ?? "",
    accountNumber: initialReport?.accountNumber ?? "",
    ifscCode: initialReport?.ifscCode ?? "",
  });
  const isEditing = Boolean(initialReport);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const addFiles = async (incoming: File[]) => {
    const nextFiles = [...files, ...incoming];
    const totalFiles = (initialReport?.attachments.length ?? 0) + nextFiles.length;
    if (totalFiles > 5) {
      toast.error(`You can keep up to 5 receipts. Remove ${totalFiles - 5} file(s) and try again.`);
      return;
    }
    const invalidType = incoming.find((file) => !isAllowedAttachment(file));
    if (invalidType) {
      toast.error(`“${invalidType.name}” is not supported. Upload a PDF, JPG, JPEG, or PNG file.`);
      return;
    }
    const oversized = incoming.find((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      toast.error(`“${oversized.name}” is larger than 5MB. Please upload a smaller file.`);
      return;
    }
    const duplicate = incoming.find((file) => files.some((current) => current.name === file.name && current.size === file.size));
    if (duplicate) {
      toast.error(`“${duplicate.name}” is already attached.`);
      return;
    }
    try {
      const prepared = await prepareExpenseAttachments(incoming);
      const preparedFiles = prepared.map((item) => item.file);
      setFiles((current) => [...current, ...preparedFiles]);
      const compressedCount = prepared.filter((item) => item.wasCompressed).length;
      toast.success(compressedCount
        ? `${incoming.length} receipt${incoming.length === 1 ? "" : "s"} attached; ${compressedCount} image${compressedCount === 1 ? " was" : "s were"} compressed.`
        : `${incoming.length} receipt${incoming.length === 1 ? "" : "s"} attached successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not prepare the selected attachment.");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void addFiles(Array.from(event.dataTransfer.files));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !collegeId) {
      toast.error("Your employee context is still loading. Please try again.");
      return;
    }
    if (form.expenseTitle.trim().length < 3) return toast.error("Enter an expense title with at least 3 characters.");
    if (!form.expenseCategory) return toast.error("Select an expense category.");
    if (!form.expenseDate) return toast.error("Select the date when the expense occurred.");
    if (form.expenseDate > new Date().toISOString().split("T")[0]) return toast.error("Expense date cannot be in the future.");
    const amount = Number(form.amountSpent);
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Enter a valid amount greater than ₹0.");
    if (amount > 99999999.99) return toast.error("Amount cannot exceed ₹9,99,99,999.99.");
    if (form.description.trim().length < 10) return toast.error("Describe the business purpose in at least 10 characters.");
    if (files.length === 0 && !initialReport?.attachments.length) return toast.error("Attach at least one receipt or supporting document.");
    if (form.paymentBank.trim().length < 2) return toast.error("Enter a valid bank name.");
    const accountNumber = form.accountNumber.replace(/\s+/g, "");
    if (!/^\d{6,30}$/.test(accountNumber)) return toast.error("Account number must contain 6 to 30 digits.");
    const ifscCode = form.ifscCode.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) return toast.error("Enter a valid 11-character IFSC code, for example HDFC0001234.");

    setSubmitting(true);
    try {
      const expensePayload = {
        userId,
        collegeId,
        expenseTitle: form.expenseTitle,
        expenseCategory: form.expenseCategory,
        expenseDate: form.expenseDate,
        amountSpent: amount,
        description: form.description,
        paymentBank: form.paymentBank,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
      };
      if (initialReport) {
        await updateEmployeeExpenseReport({
          ...expensePayload,
          employeeExpenseReportId: initialReport.employeeExpenseReportId,
          newAttachments: files,
        });
      } else {
        await createEmployeeExpenseReport({ ...expensePayload, attachments: files });
      }
      toast.success(isEditing ? "Reimbursement request updated successfully." : "Reimbursement request submitted successfully.");
      onSubmitted?.();
      onBack();
    } catch (error) {
      toast.error(getSubmissionErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-[12px] bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)] [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed sm:p-8">
      <div className="mb-7 flex items-start gap-3">
        <button type="button" onClick={onBack} className="mt-[6px] shrink-0 cursor-pointer text-[#4C5565] hover:text-[#14213A]" aria-label="Back"><ChevronLeft size={24} strokeWidth={2.5} /></button>
        <div><h1 className="text-[28px] font-bold text-[#14213A]">{isEditing ? "Update Reimbursement" : "Submit Reimbursement"}</h1><p className="mt-1 text-[15px] text-[#4C5565]">{isEditing ? "Review and update your pending expense claim." : "Fill in the details below to request a refund for your business expenses."}</p></div>
      </div>

      <div className="grid gap-7 xl:grid-cols-2">
        <div className="space-y-5">
          <FormCard icon={ReceiptText} title="Expense Information">
            <label className="mb-4 block"><span className={labelClass}>Expense Title <b className="text-red-500">*</b></span><input required minLength={3} maxLength={150} value={form.expenseTitle} onChange={(e) => update("expenseTitle", e.target.value)} className={inputClass} placeholder="e.g., Client lunch at Bistro" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative"><span className={labelClass}>Expense Category <b className="text-red-500">*</b></span><button type="button" aria-haspopup="listbox" aria-expanded={categoryOpen} onClick={() => setCategoryOpen((open) => !open)} className={`${inputClass} flex items-center justify-between text-left`}><span className="truncate">{form.expenseCategory}</span><ChevronDown size={17} className={`shrink-0 transition-transform ${categoryOpen ? "rotate-180" : ""}`}/></button>{categoryOpen && <div role="listbox" className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-[7px] border border-[#BFD0C2] bg-white py-1 shadow-lg">{expenseCategories.map((category) => <button key={category} type="button" role="option" aria-selected={form.expenseCategory === category} onClick={() => { update("expenseCategory", category); setCategoryOpen(false); }} className={`block w-full px-3 py-2 text-left text-[14px] hover:bg-[#EAF8F0] ${form.expenseCategory === category ? "bg-[#43C17A] font-medium text-white hover:bg-[#43C17A]" : "text-[#14213A]"}`}>{category}</button>)}</div>}</div>
              <label><span className={labelClass}>Expense Date <b className="text-red-500">*</b></span><input required type="date" max={new Date().toISOString().split("T")[0]} value={form.expenseDate} onChange={(e) => update("expenseDate", e.target.value)} className={inputClass} /></label>
              <label><span className={labelClass}>Amount <b className="text-red-500">*</b></span><input required type="number" min="0.01" max="99999999.99" step="0.01" value={form.amountSpent} onChange={(e) => update("amountSpent", e.target.value)} className={inputClass} placeholder="₹ 0.00" /></label>
            </div>
          </FormCard>
          <FormCard icon={FileText} title={<>Description <b className="text-red-500">*</b></>}><textarea required minLength={10} value={form.description} onChange={(e) => update("description", e.target.value)} className="min-h-[110px] w-full resize-none rounded-[7px] border border-[#BFD0C2] p-3 text-[14px] text-[#14213A] outline-none focus:border-[#43C17A]" placeholder="Briefly describe the business purpose of this expense..." /></FormCard>
        </div>

        <div className="space-y-5">
          <FormCard icon={CloudUpload} title="Attachments" action={<span className="rounded bg-[#EEF4FF] px-2 py-1 text-[11px] font-bold text-[#6B7B93]">Max 5 files · 5MB each</span>}>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            <div role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="flex cursor-pointer items-center gap-4 rounded-[7px] border border-dashed border-[#BFD0C2] bg-[#FBFEFC] p-4">
              <span className="grid h-12 w-12 place-items-center rounded-[8px] bg-[#E5F0FF] text-[#14213A]"><ReceiptText size={20} /></span><div><p className="text-[13px] font-medium text-[#14213A]">Upload Receipt <b className="text-red-500">*</b></p><p className="text-[12px] text-[#4C5565]">Drag and drop or click to browse</p></div>
            </div>
            {initialReport?.attachments.length ? <div className="mt-3"><p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#6B7B93]">Existing attachments</p><ul className="space-y-2">{initialReport.attachments.map((file) => <li key={file.expenseAttachmentId} className="rounded-md bg-[#EEF4FF] px-3 py-2 text-xs font-medium text-[#14213A]">{file.fileName} · {formatFileSize(file.fileSize)}</li>)}</ul></div> : null}
            {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between rounded-md bg-[#F5F8F6] px-3 py-2 text-xs"><span className="min-w-0 truncate font-medium text-[#14213A]">{file.name} · {formatFileSize(file.size)}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="ml-3 text-red-500" aria-label={`Remove ${file.name}`}><Trash2 size={15} /></button></li>)}</ul>}
          </FormCard>
          <FormCard icon={Building2} title="Payment Details">
            <label><span className={labelClass}>Bank Name <b className="text-red-500">*</b></span><input required minLength={2} maxLength={100} value={form.paymentBank} onChange={(e) => update("paymentBank", e.target.value)} className={inputClass} placeholder="Bank of Baroda" /></label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><label><span className={labelClass}>Account Number <b className="text-red-500">*</b></span><input required inputMode="numeric" minLength={6} maxLength={30} value={form.accountNumber} onChange={(e) => update("accountNumber", e.target.value.replace(/[^0-9 ]/g, ""))} className={inputClass} placeholder="XXXX XXXX XXXX 4521" /></label><label><span className={labelClass}>IFSC Code <b className="text-red-500">*</b></span><input required minLength={11} maxLength={11} value={form.ifscCode} onChange={(e) => update("ifscCode", e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())} className={inputClass} placeholder="BARB0000123" /></label></div>
          </FormCard>
        </div>
      </div>
      <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onBack} disabled={submitting} className="rounded-lg border border-[#BFD0C2] px-6 py-2.5 text-sm font-semibold text-[#4C5565] disabled:opacity-50">Cancel</button><button type="submit" disabled={submitting || userLoading} className="rounded-lg bg-[#43C17A] px-7 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? (isEditing ? "Updating..." : "Submitting...") : (isEditing ? "Update Request" : "Submit Request")}</button></div>
    </form>
  );
}
