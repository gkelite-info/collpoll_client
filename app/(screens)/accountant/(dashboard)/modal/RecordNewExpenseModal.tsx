"use client";

import { FileText, FloppyDisk, X } from "@phosphor-icons/react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  createAccountantExpense,
  updateAccountantExpense,
  type AccountantExpense,
} from "@/lib/helpers/accountant/accountantExpensesAPI";

type RecordNewExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void | Promise<void>;
  initialCategory?: string;
  initialExpense?: AccountantExpense | null;
};

function RequiredMark() {
  return <span className="text-[#E5484D]">*</span>;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function RecordNewExpenseModal({
  isOpen,
  onClose,
  onSaved,
  initialCategory,
  initialExpense,
}: RecordNewExpenseModalProps) {
  const { userId, collegeId } = useUser();
  const [expenseName, setExpenseName] = useState(initialExpense?.expenseName ?? "");
  const [category, setCategory] = useState(initialExpense?.category ?? initialCategory ?? "");
  const [amount, setAmount] = useState(initialExpense ? String(initialExpense.amount) : "");
  const [expenseDate, setExpenseDate] = useState(initialExpense?.expenseDate ?? "");
  const [paymentMethod, setPaymentMethod] = useState(initialExpense?.paymentMethod ?? "");
  const [remarks, setRemarks] = useState(initialExpense?.remarks ?? "");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const numericAmount = Number(amount);
  const isValid =
    expenseName.trim().length >= 3 &&
    Boolean(category) &&
    Number.isSafeInteger(numericAmount) &&
    numericAmount > 0 &&
    Boolean(expenseDate) &&
    expenseDate <= new Date().toISOString().split("T")[0] &&
    Boolean(paymentMethod) &&
    Boolean(userId) &&
    Boolean(collegeId);

  const resetForm = () => {
    setExpenseName(initialExpense?.expenseName ?? "");
    setCategory(initialExpense?.category ?? initialCategory ?? "");
    setAmount(initialExpense ? String(initialExpense.amount) : "");
    setExpenseDate(initialExpense?.expenseDate ?? "");
    setPaymentMethod(initialExpense?.paymentMethod ?? "");
    setRemarks(initialExpense?.remarks ?? "");
    setAttachments([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || !userId || !collegeId) return;

    setIsSaving(true);
    try {
      const expenseInput = {
        expenseName,
        category,
        amount: numericAmount,
        expenseDate,
        paymentMethod,
        remarks,
        collegeId,
        createdBy: userId,
      };
      if (initialExpense) {
        await updateAccountantExpense({
          ...expenseInput,
          accountantExpenseId: initialExpense.accountantExpenseId,
          newAttachments: attachments,
        });
      } else {
        await createAccountantExpense({ ...expenseInput, attachments });
      }
      toast.success(initialExpense ? "Expense updated successfully." : "Expense recorded successfully.");
      resetForm();
      await onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to record the expense.");
    } finally {
      setIsSaving(false);
    }
  };
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
              {initialExpense ? "Update Expense" : "Record New Expense"}
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

        <form onSubmit={handleSubmit} className="mt-3 rounded-lg border border-[#E6E8EB] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#282828]">
                Expense Name <RequiredMark />
              </span>
              <input
                type="text"
                required
                minLength={3}
                maxLength={255}
                value={expenseName}
                onChange={(event) => setExpenseName(event.target.value)}
                placeholder="e.g. Q3 Office Maintenance"
                className="h-9 rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 text-[12px] font-medium text-[#282828] outline-none placeholder:text-[#6B7280] focus:border-[#43C17A]"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#282828]">
                Category <RequiredMark />
              </span>
              <select required value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 cursor-pointer rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 text-[12px] font-medium text-[#282828] outline-none focus:border-[#43C17A]">
                <option value="">Select a category</option>
                <option value="Salaries">Salaries</option>
                <option value="Events">Events</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Utilities">Utilities</option>
                <option value="Internet & Network">Internet & Network</option>
                <option value="Other">Other</option>
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
                  required
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  onWheel={(event) => event.currentTarget.blur()}
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
                required
                max={new Date().toISOString().split("T")[0]}
                value={expenseDate}
                onChange={(event) => setExpenseDate(event.target.value)}
                className="h-9 rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 text-[12px] font-medium text-[#282828] outline-none focus:border-[#43C17A]"
                style={{ colorScheme: "light" }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#282828]">
                Payment Method <RequiredMark />
              </span>
              <select
                required
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="h-9 cursor-pointer rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 text-[12px] font-medium text-[#282828] outline-none focus:border-[#43C17A]"
              >
                <option value="">Select payment method</option>
                <option value="UPI">UPI</option>
                <option value="Cash">By Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[#282828]">
              Remarks
            </span>
            <textarea
              placeholder="Enter additional details about this expense..."
              maxLength={255}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              className="min-h-[70px] resize-none rounded-md border border-[#BFCDBE] bg-[#F2F3F4] px-3 py-2 text-[12px] font-medium text-[#282828] outline-none placeholder:text-[#6B7280] focus:border-[#43C17A]"
            />
          </label>

          <div className="mt-4">
            <p className="text-[12px] font-semibold text-[#282828]">
              Attachments
            </p>
            <label className="mt-2 flex min-h-[126px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#9FB49F] bg-white px-4 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg"
                className="hidden"
                onChange={(event) => {
                  const selectedFiles = Array.from(event.target.files ?? []);
                  if ((initialExpense?.attachments.length ?? 0) + attachments.length + selectedFiles.length > 5) {
                    toast.error("You can upload a maximum of 5 attachments.");
                    return;
                  }
                  setAttachments((current) => [...current, ...selectedFiles]);
                  event.target.value = "";
                }}
              />
              <FileText size={34} weight="regular" className="text-[#525E52]" />
              <span className="mt-2 rounded-full bg-[#172B58] px-5 py-1.5 text-[12px] font-bold text-white">
                Upload Invoice
              </span>
              <span className="mt-2 text-[16px] font-medium text-[#525252]">
                PDF, JPG up to 10MB
              </span>
              {attachments.length > 0 && (
                <span className="mt-2 text-[11px] font-semibold text-[#147A3D]">
                  {attachments.length} file{attachments.length === 1 ? "" : "s"} selected
                </span>
              )}
            </label>
            {initialExpense?.attachments.length ? (
              <ul className="mt-2 space-y-2">
                {initialExpense.attachments.map((file) => (
                  <li key={file.accountantExpenseAttachmentId} className="flex items-center gap-2 rounded-md border border-[#DCE5DC] bg-[#F7FAF8] px-3 py-2">
                    <FileText size={18} className="shrink-0 text-[#147A3D]" />
                    <span className="min-w-0"><span className="block truncate text-[11px] font-semibold text-[#282828]">{file.fileName}</span><span className="block text-[10px] text-[#6B7280]">Existing · {formatFileSize(file.fileSize)}</span></span>
                  </li>
                ))}
              </ul>
            ) : null}
            {attachments.length > 0 && (
              <ul className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-[#DCE5DC] bg-[#F7FAF8] px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText size={18} className="shrink-0 text-[#147A3D]" />
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold text-[#282828]">{file.name}</span>
                        <span className="block text-[10px] text-[#6B7280]">{formatFileSize(file.size)}</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                      aria-label={`Remove ${file.name}`}
                      className="shrink-0 cursor-pointer bg-transparent p-1 text-[#D14343]"
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 border-t border-[#ECECEC] pt-3">
            <div className="flex flex-wrap justify-end gap-4">
              <button
                type="button"
                onClick={() => { resetForm(); onClose(); }}
                disabled={isSaving}
                className="h-9 min-w-[120px] cursor-pointer rounded-full border border-[#BFCDBE] bg-white px-6 text-[12px] font-semibold text-[#282828] shadow-[0_5px_12px_rgba(15,23,42,0.16)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSaving}
                className="flex h-9 min-w-[170px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#086C20] px-6 text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(8,108,32,0.38)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FloppyDisk size={14} weight="bold" />
                {isSaving ? (initialExpense ? "Updating..." : "Saving...") : (initialExpense ? "Update Expense" : "Save Expense")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
