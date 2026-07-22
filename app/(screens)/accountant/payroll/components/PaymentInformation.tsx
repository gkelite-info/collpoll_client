"use client";

import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";

import type { StaticPayrollEmployee } from "../data";

type PaymentMethod = "Bank Transfer" | "NEFT" | "RTGS" | "IMPS" | "UPI" | "Cheque" | "Demand Draft" | "Cash";

const methods: PaymentMethod[] = ["Bank Transfer", "NEFT", "RTGS", "IMPS", "UPI", "Cheque", "Demand Draft", "Cash"];
const inputClass = "h-11 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 text-sm font-medium normal-case text-[#142038] outline-none focus:border-[#1769e0]";

export default function PaymentInformation({ employee }: { employee: StaticPayrollEmployee }) {
  const initialMethod = methods.includes(employee.payment.paymentMethod as PaymentMethod)
    ? employee.payment.paymentMethod as PaymentMethod
    : "Bank Transfer";
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);

  const referenceLabel = method === "Cheque"
    ? "Cheque Number"
    : method === "Demand Draft"
      ? "Demand Draft Number"
      : method === "Cash"
        ? "Receipt Number"
        : method === "UPI"
          ? "UPI Transaction ID"
          : method === "NEFT" || method === "RTGS"
            ? `${method} UTR Number`
            : method === "IMPS"
              ? "IMPS Reference Number"
              : "Transaction ID";

  const usesBankInstrument = method === "Cheque" || method === "Demand Draft";

  return (
    <section className="rounded-xl border border-[#e2e5e9] bg-white p-5 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 font-semibold"><Info size={18} className="text-[#1769e0]" /> Payment Information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment Method">
          <div className="relative">
            <select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} className={`${inputClass} cursor-pointer appearance-none pr-9`}>
              {methods.map((paymentMethod) => <option key={paymentMethod}>{paymentMethod}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8492a6]" size={16} />
          </div>
        </Field>

        <Field label={referenceLabel}><input key={referenceLabel} defaultValue={method === initialMethod ? employee.payment.transactionId : ""} placeholder={`Enter ${referenceLabel.toLowerCase()}`} className={inputClass} /></Field>

        {method === "UPI" && <Field label="UPI ID"><input placeholder="name@bank" className={inputClass} /></Field>}

        {usesBankInstrument && <>
          <Field label="Issuing Bank"><input placeholder="Enter issuing bank name" className={inputClass} /></Field>
          <Field label={method === "Cheque" ? "Cheque Date" : "Issue Date"}><input type="date" className={inputClass} /></Field>
        </>}

        {method === "Cash" && <Field label="Received By"><input placeholder="Enter recipient name" className={inputClass} /></Field>}

        <Field label="Payment Date" wide><input type="date" defaultValue={employee.payment.paymentDate} className={inputClass} /></Field>
        <Field label="Remarks (Optional)" wide><textarea defaultValue={employee.payment.remarks} className="h-24 w-full resize-none rounded-lg border border-[#dce3eb] bg-[#f8fafc] p-3 text-sm font-medium normal-case text-[#142038] outline-none focus:border-[#1769e0]" /></Field>
      </div>
      <p className="mt-4 rounded-lg border border-[#cfe0fb] bg-[#edf5ff] p-3 text-[10px] text-[#1769e0]">Ensure the payment is made to the employee&apos;s registered bank account only.</p>
    </section>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`text-[10px] font-semibold uppercase text-[#8492a6] ${wide ? "sm:col-span-2" : ""}`}>{label}<div className="mt-2">{children}</div></label>;
}
