"use client";

import { AlertTriangle, ChevronDown, Info, Loader2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import {
  createEmployeeSalaryPayment,
  type CreateEmployeeSalaryPaymentInput,
} from "@/lib/helpers/accountant/employeeSalaryPaymentsAPI";
import type { StaticPayrollEmployee } from "../data";

type PaymentMethod = "Bank Transfer" | "NEFT" | "RTGS" | "IMPS" | "UPI" | "Cheque" | "Cash";

const methods: PaymentMethod[] = ["Bank Transfer", "NEFT", "RTGS", "IMPS", "UPI", "Cheque", "Cash"];
const inputClass = "h-11 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 text-sm font-medium normal-case text-[#142038] outline-none focus:border-[#1769e0] disabled:cursor-not-allowed disabled:opacity-70";

export default function PaymentInformation({
  employee,
  onPaymentRecorded,
}: {
  employee: StaticPayrollEmployee;
  onPaymentRecorded: () => void;
}) {
  const { collegeId, userId } = useUser();
  const isPaid = employee.status === "paid";
  const initialMethod = methods.includes(employee.payment.paymentMethod as PaymentMethod)
    ? employee.payment.paymentMethod as PaymentMethod
    : "Bank Transfer";
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [reference, setReference] = useState(employee.payment.transactionId);
  const [paymentDate, setPaymentDate] = useState(employee.payment.paymentDate || new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState(employee.payment.remarks);
  const [upiId, setUpiId] = useState(employee.payment.upiId);
  const [bankName, setBankName] = useState(employee.payment.bankName);
  const [chequeDate, setChequeDate] = useState(employee.payment.chequeDate);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const referenceLabel = method === "Cheque"
    ? "Cheque Number"
    : method === "Cash"
      ? "Receipt Number"
      : method === "UPI"
        ? "UPI Transaction ID"
        : method === "NEFT" || method === "RTGS"
          ? `${method} UTR Number`
          : method === "IMPS"
            ? "IMPS Reference Number"
            : "Transaction ID";

  const validationErrors = {
    reference: !reference.trim()
      ? `${referenceLabel} is required.`
      : reference.trim().length > 255
        ? `${referenceLabel} cannot exceed 255 characters.`
        : "",
    paymentDate: !paymentDate
      ? "Payment date is required."
      : paymentDate > new Date().toISOString().slice(0, 10)
        ? "Payment date cannot be in the future."
        : "",
    remarks: remarks.trim().length > 255 ? "Remarks cannot exceed 255 characters." : "",
    upiId: method === "UPI" && !upiId.trim() ? "UPI ID is required." : "",
    bankName: method === "Cheque" && !bankName.trim() ? "Issuing bank is required." : "",
    chequeDate: method === "Cheque" && !chequeDate
      ? "Cheque date is required."
      : method === "Cheque" && chequeDate > new Date().toISOString().slice(0, 10)
        ? "Cheque date cannot be in the future."
        : "",
  };
  const hasValidationErrors = Object.values(validationErrors).some(Boolean);

  const savePayment = async () => {
    if (!collegeId || !userId) {
      toast.error("Accountant and college details are unavailable.");
      return;
    }
    if (!reference.trim() || !paymentDate) {
      toast.error(`${referenceLabel} and payment date are required.`);
      return;
    }

    const base = {
      employeeId: employee.employeeIdPk,
      payrollRunId: employee.payrollRunId,
      collegeId: Number(collegeId),
      createdBy: Number(userId),
      paymentDate,
      remarks,
    };
    let input: CreateEmployeeSalaryPaymentInput;
    switch (method) {
      case "NEFT": input = { ...base, paymentMethod: "neft", neftUtrNumber: reference }; break;
      case "RTGS": input = { ...base, paymentMethod: "rtgs", rtgsUtrNumber: reference }; break;
      case "IMPS": input = { ...base, paymentMethod: "imps", impsReferenceNumber: reference }; break;
      case "UPI":
        if (!upiId.trim()) { toast.error("UPI ID is required."); return; }
        input = { ...base, paymentMethod: "upi", upiTransactionId: reference, upiId };
        break;
      case "Cheque":
        if (!bankName.trim() || !chequeDate) { toast.error("Issuing bank and cheque date are required."); return; }
        input = { ...base, paymentMethod: "cheque", chequeNo: reference, bankName, chequeDate };
        break;
      case "Cash": input = { ...base, paymentMethod: "cash", receiptNumber: reference }; break;
      default: input = { ...base, paymentMethod: "banktransfer", transactionId: reference };
    }

    setIsSaving(true);
    try {
      await createEmployeeSalaryPayment(input);
      setShowConfirmation(false);
      toast.success("Salary payment recorded successfully.");
      onPaymentRecorded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to record salary payment.");
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirmation = () => {
    setShowValidation(true);
    if (hasValidationErrors) {
      toast.error("Correct the highlighted payment information.");
      return;
    }
    setShowConfirmation(true);
  };

  return (
    <section className="rounded-xl border border-[#e2e5e9] bg-white p-5 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 font-semibold"><Info size={18} className="text-[#1769e0]" /> Payment Information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment Method">
          <div className="relative">
            <select disabled={isPaid || isSaving} value={method} onChange={(event) => { setMethod(event.target.value as PaymentMethod); setReference(""); setShowValidation(false); }} className={`${inputClass} cursor-pointer appearance-none pr-9`}>
              {methods.map((paymentMethod) => <option key={paymentMethod}>{paymentMethod}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8492a6]" size={16} />
          </div>
        </Field>
        <Field label={referenceLabel}><input disabled={isPaid || isSaving} value={reference} onChange={(event) => { setReference(event.target.value); setShowValidation(false); }} placeholder={`Enter ${referenceLabel.toLowerCase()}`} className={`${inputClass} ${showValidation && validationErrors.reference ? "border-red-500" : ""}`} />{showValidation && validationErrors.reference && <p className="mt-1 text-[10px] normal-case text-red-600">{validationErrors.reference}</p>}</Field>
        {method === "UPI" && <Field label="UPI ID"><input disabled={isPaid || isSaving} value={upiId} onChange={(event) => { setUpiId(event.target.value); setShowValidation(false); }} placeholder="name@bank" className={`${inputClass} ${showValidation && validationErrors.upiId ? "border-red-500" : ""}`} />{showValidation && validationErrors.upiId && <p className="mt-1 text-[10px] normal-case text-red-600">{validationErrors.upiId}</p>}</Field>}
        {method === "Cheque" && <>
          <Field label="Issuing Bank"><input disabled={isPaid || isSaving} value={bankName} onChange={(event) => { setBankName(event.target.value); setShowValidation(false); }} placeholder="Enter issuing bank name" className={`${inputClass} ${showValidation && validationErrors.bankName ? "border-red-500" : ""}`} />{showValidation && validationErrors.bankName && <p className="mt-1 text-[10px] normal-case text-red-600">{validationErrors.bankName}</p>}</Field>
          <Field label="Cheque Date"><input disabled={isPaid || isSaving} value={chequeDate} onChange={(event) => { setChequeDate(event.target.value); setShowValidation(false); }} type="date" className={`${inputClass} ${showValidation && validationErrors.chequeDate ? "border-red-500" : ""}`} />{showValidation && validationErrors.chequeDate && <p className="mt-1 text-[10px] normal-case text-red-600">{validationErrors.chequeDate}</p>}</Field>
        </>}
        <Field label="Payment Date" wide><input disabled={isPaid || isSaving} type="date" value={paymentDate} onChange={(event) => { setPaymentDate(event.target.value); setShowValidation(false); }} className={`${inputClass} ${showValidation && validationErrors.paymentDate ? "border-red-500" : ""}`} />{showValidation && validationErrors.paymentDate && <p className="mt-1 text-[10px] normal-case text-red-600">{validationErrors.paymentDate}</p>}</Field>
        <Field label="Remarks (Optional)" wide><textarea disabled={isPaid || isSaving} value={remarks} maxLength={255} placeholder="Enter payment remarks (optional)" onChange={(event) => { setRemarks(event.target.value); setShowValidation(false); }} className={`h-24 w-full resize-none rounded-lg border bg-[#f8fafc] p-3 text-sm font-medium normal-case text-[#142038] outline-none focus:border-[#1769e0] disabled:cursor-not-allowed disabled:opacity-70 ${showValidation && validationErrors.remarks ? "border-red-500" : "border-[#dce3eb]"}`} />{showValidation && validationErrors.remarks && <p className="mt-1 text-[10px] normal-case text-red-600">{validationErrors.remarks}</p>}<p className="mt-1 text-right text-[10px] normal-case text-[#91a0b4]">{remarks.length}/255</p></Field>
      </div>
      {!isPaid && <button type="button" disabled={isSaving} onClick={openConfirmation} className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1769e0] px-5 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">Record payment</button>}
      {isPaid && <p className="mt-4 rounded-lg border border-[#bde7ca] bg-[#effaf3] p-3 text-xs font-medium text-[#16743c]">This payment has been recorded and is read-only.</p>}
      {showConfirmation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#101828]/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="confirm-payment-title">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] p-5">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff4e5] text-[#b45309]"><AlertTriangle size={20} /></span>
              <div><h3 id="confirm-payment-title" className="font-bold text-[#142038]">Confirm salary payment</h3><p className="mt-1 text-xs text-[#667386]">This will mark the employee&apos;s payroll entry as paid.</p><p className="mt-1 text-xs font-semibold text-[#b45309]">After confirmation, this payment cannot be edited.</p></div>
              </div>
              <button type="button" aria-label="Close confirmation" disabled={isSaving} onClick={() => setShowConfirmation(false)} className="cursor-pointer rounded-lg p-1 text-[#7c8798] hover:bg-[#f4f4f5] disabled:cursor-not-allowed disabled:opacity-50"><X size={19} /></button>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex justify-between gap-4"><span className="text-[#667386]">Employee</span><span className="text-right font-semibold">{employee.name}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#667386]">Net payment</span><span className="text-right font-bold">₹{employee.netPay.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#667386]">Method</span><span className="text-right font-semibold">{method}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#667386]">Reference</span><span className="break-all text-right font-semibold">{reference}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#667386]">Payment date</span><span className="text-right font-semibold">{paymentDate}</span></div>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#edf0f3] p-4">
              <button type="button" disabled={isSaving} onClick={() => setShowConfirmation(false)} className="h-10 cursor-pointer rounded-lg border border-[#d7dde5] px-4 text-xs font-semibold text-[#526177] disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
              <button type="button" disabled={isSaving} onClick={savePayment} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#1769e0] px-4 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">{isSaving && <Loader2 className="animate-spin" size={15} />} {isSaving ? "Recording payment..." : "Confirm payment"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`text-[10px] font-semibold uppercase text-[#8492a6] ${wide ? "sm:col-span-2" : ""}`}>{label}<div className="mt-2">{children}</div></label>;
}
