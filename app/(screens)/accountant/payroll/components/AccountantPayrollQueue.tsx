"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  IndianRupee,
  Loader2,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { formatExactNumber } from "@/app/utils/numberFormat";
import { staticPayrollEmployees } from "../data";

type PaymentStatus = "ready" | "paid" | "on-hold";
type PaymentRow = (typeof staticPayrollEmployees)[number] & { paymentStatus: PaymentStatus };
type PaymentMethod = "Bank Transfer" | "NEFT" | "RTGS" | "IMPS" | "UPI" | "Cheque" | "Cash";
type EmployeePaymentDetails = {
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentDate: string;
  remarks: string;
  bankName: string;
  upiId: string;
  chequeDate: string;
  receivedBy: string;
};

const paymentMethods: PaymentMethod[] = ["Bank Transfer", "NEFT", "RTGS", "IMPS", "UPI", "Cheque", "Cash"];

const money = (value: number) => `₹${formatExactNumber(value)}`;
const initialRows: PaymentRow[] = staticPayrollEmployees.map((employee, index) => ({
  ...employee,
  paymentStatus: index < 2 ? "paid" : index === 7 ? "on-hold" : "ready",
}));

const statusStyles: Record<PaymentStatus, string> = {
  ready: "bg-[#eef4ff] text-[#2563eb]",
  paid: "bg-[#e9f8ef] text-[#168a49]",
  "on-hold": "bg-[#fff4e5] text-[#b45309]",
};

export default function AccountantPayrollQueue() {
  const [employees, setEmployees] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState<Record<number, EmployeePaymentDetails>>({});
  const [showValidation, setShowValidation] = useState(false);
  const itemsPerPage = 8;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employees.filter((row) => {
      const matchesSearch = !term || [row.name, row.email, row.employeeId, row.role].some((value) => value.toLowerCase().includes(term));
      return matchesSearch && (status === "all" || row.paymentStatus === status);
    });
  }, [employees, search, status]);

  const rows = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const payableFilteredIds = filtered.filter((row) => row.paymentStatus === "ready").map((row) => row.payrollEntryId);
  const selectedEmployees = employees.filter((row) => selectedIds.includes(row.payrollEntryId) && row.paymentStatus === "ready");
  const selectedTotal = selectedEmployees.reduce((sum, row) => sum + row.netPay, 0);
  const allFilteredSelected = payableFilteredIds.length > 0 && payableFilteredIds.every((id) => selectedIds.includes(id));
  const paidEmployees = employees.filter((row) => row.paymentStatus === "paid");
  const readyEmployees = employees.filter((row) => row.paymentStatus === "ready");
  const totalPayroll = employees.reduce((sum, row) => sum + row.netPay, 0);

  const changeFilter = (nextStatus: "all" | PaymentStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const toggleEmployee = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const toggleAllFiltered = () => {
    setSelectedIds((current) => allFilteredSelected
      ? current.filter((id) => !payableFilteredIds.includes(id))
      : Array.from(new Set([...current, ...payableFilteredIds])));
  };

  const completePayment = () => {
    const references = selectedEmployees.map((employee) => paymentDetails[employee.payrollEntryId]?.transactionId.trim() ?? "");
    const hasDuplicates = new Set(references.map((reference) => reference.toLowerCase())).size !== references.length;
    const hasIncompleteDetails = selectedEmployees.some((employee) => {
      const details = paymentDetails[employee.payrollEntryId];
      if (!details?.paymentMethod || !details.paymentDate || !details.transactionId.trim()) return true;
      if (details.paymentMethod === "UPI" && !details.upiId.trim()) return true;
      if (details.paymentMethod === "Cheque" && (!details.bankName.trim() || !details.chequeDate)) return true;
      if (details.paymentMethod === "Cash" && !details.receivedBy.trim()) return true;
      return false;
    });
    if (hasIncompleteDetails || hasDuplicates) {
      setShowValidation(true);
      return;
    }
    setIsPaying(true);
    window.setTimeout(() => {
      setEmployees((current) => current.map((employee) => selectedIds.includes(employee.payrollEntryId)
        ? {
            ...employee,
            paymentStatus: "paid",
            payment: {
              ...employee.payment,
              paymentMethod: paymentDetails[employee.payrollEntryId].paymentMethod,
              paymentDate: paymentDetails[employee.payrollEntryId].paymentDate,
              remarks: paymentDetails[employee.payrollEntryId].remarks,
              transactionId: paymentDetails[employee.payrollEntryId].transactionId.trim(),
            },
          }
        : employee));
      setSuccessCount(selectedEmployees.length);
      setSelectedIds([]);
      setIsPaying(false);
      setShowPayment(false);
    }, 700);
  };

  const openPaymentDetails = () => {
    setPaymentDetails((current) => Object.fromEntries(selectedEmployees.map((employee) => [employee.payrollEntryId, current[employee.payrollEntryId] ?? {
      paymentMethod: "Bank Transfer",
      transactionId: "",
      paymentDate: "2026-07-22",
      remarks: "July salary payment completed",
      bankName: "",
      upiId: "",
      chequeDate: "",
      receivedBy: "",
    }])));
    setShowValidation(false);
    setShowPayment(true);
  };

  const updatePaymentDetails = (employeeId: number, changes: Partial<EmployeePaymentDetails>) => {
    setPaymentDetails((current) => ({ ...current, [employeeId]: { ...current[employeeId], ...changes } }));
    setShowValidation(false);
  };

  const duplicateTransactionIds = useMemo(() => {
    const counts = Object.values(paymentDetails).reduce<Record<string, number>>((result, details) => {
      const normalized = details.transactionId.trim().toLowerCase();
      if (normalized) result[normalized] = (result[normalized] ?? 0) + 1;
      return result;
    }, {});
    return new Set(Object.entries(counts).filter(([, count]) => count > 1).map(([value]) => value));
  }, [paymentDetails]);

  const cards = [
    { label: "Total payroll", value: money(totalPayroll), note: "July 2026 · 12 employees", Icon: IndianRupee, color: "#6751e7", bg: "#eeeaff" },
    { label: "Awaiting confirmation", value: `${readyEmployees.length} employees`, note: money(readyEmployees.reduce((sum, row) => sum + row.netPay, 0)), Icon: Users, color: "#2563eb", bg: "#eaf1ff" },
    { label: "Payment completed", value: `${paidEmployees.length} employees`, note: money(paidEmployees.reduce((sum, row) => sum + row.netPay, 0)), Icon: CheckCircle2, color: "#16a34a", bg: "#e8f8ee" },
  ];

  return (
    <div className="pb-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      {successCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#bde7ca] bg-[#effaf3] px-4 py-3 text-sm text-[#16743c]">
          <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Payment recorded for {successCount} employees.</span>
          <button aria-label="Dismiss message" onClick={() => setSuccessCount(0)}><X size={17} /></button>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(({ label, value, note, Icon, color, bg }) => (
          <article key={label} className="relative overflow-hidden rounded-2xl border border-[#e4e7eb] bg-white p-5 shadow-[0_2px_12px_rgba(20,32,56,0.04)]">
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-medium text-[#657184]">{label}</p><p className="mt-2 text-xl font-bold">{value}</p><p className="mt-1 text-xs text-[#8b95a5]">{note}</p></div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ color, backgroundColor: bg }}><Icon size={21} /></span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e5e9] bg-white shadow-[0_2px_12px_rgba(20,32,56,0.04)]">
        <div className="border-b border-[#edf0f3] p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div><h2 className="text-base font-bold">Salary payment records</h2><p className="mt-1 text-xs text-[#667386]">Select employees whose external bank payments have been completed.</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8792a3]" size={16} />
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search employees" className="h-10 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] pl-9 pr-3 text-sm outline-none focus:border-[#6751e7] sm:w-64" />
              </label>
              <label className="relative">
                <select value={status} onChange={(event) => changeFilter(event.target.value as "all" | PaymentStatus)} className="h-10 w-full appearance-none rounded-lg border border-[#dce3eb] bg-white pl-3 pr-9 text-sm outline-none sm:w-36">
                  <option value="all">All statuses</option><option value="ready">Ready to pay</option><option value="paid">Paid</option><option value="on-hold">On hold</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667386]" size={15} />
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#f7f8fc] px-4 py-3 text-xs text-[#596578]">
            <button onClick={toggleAllFiltered} className="font-semibold text-[#5642d6]">{allFilteredSelected ? "Clear selection" : "Select all ready"}</button>
            <span className="h-4 w-px bg-[#d8dde6]" />
            <span>{payableFilteredIds.length} employees can be paid</span>
            <span className="hidden text-[#a0a8b5] sm:inline">•</span>
            <span>Employees on hold or already paid cannot be selected</span>
          </div>
          {selectedEmployees.length > 0 && !showPayment && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#ddd8fb] bg-[#faf9ff] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eeeaff] text-sm font-bold text-[#6751e7]">{selectedEmployees.length}</span><div><p className="text-sm font-semibold">Employees selected</p><button onClick={() => setSelectedIds([])} className="text-xs font-medium text-[#6751e7]">Clear selection</button></div></div>
              <div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><p className="text-[10px] text-[#7c8798]">Total net payment</p><p className="text-base font-bold">{money(selectedTotal)}</p></div><button onClick={openPaymentDetails} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6751e7] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#5943d3]"><ShieldCheck size={16} /> Enter payment details</button></div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead className="bg-[#f7f8fc] text-[10px] uppercase tracking-wider text-[#657184]"><tr>
              <th className="w-14 px-5 py-3.5"><input aria-label="Select all ready employees" type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="h-4 w-4 accent-[#6751e7]" /></th>
              {['Employee', 'Employee ID', 'Department', 'Gross pay', 'Deductions', 'Net pay', 'Status', ''].map((heading, index) => <th key={`${heading}-${index}`} className="px-4 py-3.5">{heading}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-[#edf0f3]">
              {rows.map((row) => {
                const selectable = row.paymentStatus === "ready";
                const selected = selectedIds.includes(row.payrollEntryId);
                return <tr key={row.payrollEntryId} className={selected ? "bg-[#f5f3ff]" : "hover:bg-[#fafbfc]"}>
                  <td className="px-5 py-4"><input aria-label={`Select ${row.name}`} type="checkbox" disabled={!selectable} checked={selected} onChange={() => toggleEmployee(row.payrollEntryId)} className="h-4 w-4 accent-[#6751e7] disabled:opacity-30" /></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ede9fe] text-xs font-bold text-[#634bdc]">{row.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><p className="text-sm font-semibold">{row.name}</p><p className="mt-0.5 text-[10px] text-[#8492a6]">{row.email}</p></div></div></td>
                  <td className="px-4 py-4 text-xs text-[#596578]">{row.employeeId}</td>
                  <td className="px-4 py-4 text-xs text-[#596578]">{row.role}</td>
                  <td className="px-4 py-4 text-sm">{money(row.grossEarnings)}</td>
                  <td className="px-4 py-4 text-sm text-[#b45309]">− {money(row.totalDeductions)}</td>
                  <td className="px-4 py-4 text-sm font-bold">{money(row.netPay)}</td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.paymentStatus]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{row.paymentStatus === "ready" ? "Ready to pay" : row.paymentStatus === "on-hold" ? "On hold" : "Paid"}</span></td>
                  <td className="px-4 py-4"><Link aria-label={`View ${row.name} payroll details`} href={`/accountant/payroll/${row.payrollEntryId}`} className="text-[#667386] hover:text-[#6751e7]"><ChevronRight size={18} /></Link></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="p-12 text-center"><Users className="mx-auto text-[#b2bac6]" size={28} /><p className="mt-3 text-sm font-medium">No employees found</p><p className="mt-1 text-xs text-[#7c8798]">Try changing your search or status filter.</p></div>}
        {filtered.length > 0 && <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setPage} roundedBottom="rounded-b-xl" alwaysShow />}
      </section>

      {showPayment && (
        <div className="fixed inset-0 z-[9999] bg-[#101828]/60 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Record completed salary payments">
          <div className="flex h-full w-full items-center justify-center p-4 lg:ml-[17%] lg:w-[83%]">
          <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between border-b border-[#edf0f3] p-5"><div><h3 className="text-lg font-bold">Record completed salary payments</h3><p className="mt-1 text-xs text-[#667386]">Complete the payment information separately for each selected employee.</p></div><button onClick={() => setShowPayment(false)} className="rounded-lg p-1 text-[#7c8798] hover:bg-[#f4f4f5]"><X size={20} /></button></div>
            <div className="overflow-y-auto p-5">
              <div className="rounded-xl bg-[#f7f5ff] p-4"><div className="flex justify-between text-sm"><span className="text-[#667386]">Employees</span><span className="font-semibold">{selectedEmployees.length}</span></div><div className="mt-3 flex justify-between border-t border-[#e5e0fb] pt-3"><span className="font-semibold">Total amount</span><span className="text-xl font-bold text-[#5b45d1]">{money(selectedTotal)}</span></div></div>
              <div className="mt-5">
                <div className="mb-3 flex items-end justify-between"><div><h4 className="text-sm font-bold">Payment information</h4><p className="mt-0.5 text-xs text-[#7c8798]">Method, reference, date, and remarks can differ for every employee.</p></div><span className="text-xs font-medium text-[#6751e7]">{Object.values(paymentDetails).filter((details) => details.transactionId.trim() && details.paymentDate && (details.paymentMethod !== "UPI" || details.upiId.trim()) && (details.paymentMethod !== "Cheque" || (details.bankName.trim() && details.chequeDate)) && (details.paymentMethod !== "Cash" || details.receivedBy.trim())).length}/{selectedEmployees.length} completed</span></div>
                <div className="space-y-4">
                  {selectedEmployees.map((employee) => {
                    const details = paymentDetails[employee.payrollEntryId];
                    if (!details) return null;
                    const duplicate = duplicateTransactionIds.has(details.transactionId.trim().toLowerCase());
                    const missingReference = showValidation && !details.transactionId.trim();
                    const missingDate = showValidation && !details.paymentDate;
                    const missingUpiId = showValidation && details.paymentMethod === "UPI" && !details.upiId.trim();
                    const usesChequeDetails = details.paymentMethod === "Cheque";
                    const missingChequeBank = showValidation && usesChequeDetails && !details.bankName.trim();
                    const missingChequeDate = showValidation && usesChequeDetails && !details.chequeDate;
                    const missingReceivedBy = showValidation && details.paymentMethod === "Cash" && !details.receivedBy.trim();
                    const referenceLabel = details.paymentMethod === "Cheque"
                      ? "Cheque number"
                      : details.paymentMethod === "Cash"
                        ? "Receipt number"
                        : details.paymentMethod === "UPI"
                          ? "UPI transaction ID"
                          : details.paymentMethod === "NEFT" || details.paymentMethod === "RTGS"
                            ? `${details.paymentMethod} UTR number`
                            : details.paymentMethod === "IMPS"
                              ? "IMPS reference number"
                              : "Transaction ID";
                    return <section key={employee.payrollEntryId} className="overflow-hidden rounded-xl border border-[#dfe3ea] bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0f3] bg-[#f8f9fc] px-4 py-3"><div><p className="text-sm font-bold">{employee.name}</p><p className="mt-0.5 text-xs text-[#7c8798]">{employee.employeeId} · {employee.role}</p></div><div className="text-right"><p className="text-[10px] uppercase text-[#8b95a5]">Net salary</p><p className="text-sm font-bold">{money(employee.netPay)}</p></div></div>
                      <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <label className="text-xs font-semibold uppercase text-[#8492a6]">Payment method<div className="relative mt-2"><select value={details.paymentMethod} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { paymentMethod: event.target.value as PaymentMethod, transactionId: "", bankName: "", upiId: "", chequeDate: "", receivedBy: "" })} className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 pr-9 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0]">{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8492a6]" size={16} /></div></label>
                        <label className="text-xs font-semibold uppercase text-[#8492a6]">{referenceLabel}<input value={details.transactionId} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { transactionId: event.target.value })} placeholder={`Enter ${referenceLabel.toLowerCase()}`} className={`mt-2 h-11 w-full rounded-lg border bg-[#f8fafc] px-3 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0] ${missingReference || duplicate ? "border-[#dc2626]" : "border-[#dce3eb]"}`} />{(missingReference || duplicate) && <p className="mt-1 text-[10px] normal-case text-[#dc2626]">{duplicate ? "This reference is already used for another employee." : `${referenceLabel} is required.`}</p>}</label>
                        {details.paymentMethod === "UPI" && <label className="text-xs font-semibold uppercase text-[#8492a6]">UPI ID<input value={details.upiId} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { upiId: event.target.value })} placeholder="name@bank" className={`mt-2 h-11 w-full rounded-lg border bg-[#f8fafc] px-3 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0] ${missingUpiId ? "border-[#dc2626]" : "border-[#dce3eb]"}`} />{missingUpiId && <p className="mt-1 text-[10px] normal-case text-[#dc2626]">UPI ID is required.</p>}</label>}
                        {usesChequeDetails && <><label className="text-xs font-semibold uppercase text-[#8492a6]">Bank name<input value={details.bankName} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { bankName: event.target.value })} placeholder="Enter issuing bank name" className={`mt-2 h-11 w-full rounded-lg border bg-[#f8fafc] px-3 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0] ${missingChequeBank ? "border-[#dc2626]" : "border-[#dce3eb]"}`} />{missingChequeBank && <p className="mt-1 text-[10px] normal-case text-[#dc2626]">Bank name is required.</p>}</label><label className="text-xs font-semibold uppercase text-[#8492a6]">Cheque date<input type="date" value={details.chequeDate} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { chequeDate: event.target.value })} className={`mt-2 h-11 w-full rounded-lg border bg-[#f8fafc] px-3 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0] ${missingChequeDate ? "border-[#dc2626]" : "border-[#dce3eb]"}`} />{missingChequeDate && <p className="mt-1 text-[10px] normal-case text-[#dc2626]">Date is required.</p>}</label></>}
                        {details.paymentMethod === "Cash" && <label className="text-xs font-semibold uppercase text-[#8492a6]">Received by<input value={details.receivedBy} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { receivedBy: event.target.value })} placeholder="Enter recipient name" className={`mt-2 h-11 w-full rounded-lg border bg-[#f8fafc] px-3 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0] ${missingReceivedBy ? "border-[#dc2626]" : "border-[#dce3eb]"}`} />{missingReceivedBy && <p className="mt-1 text-[10px] normal-case text-[#dc2626]">Recipient name is required.</p>}</label>}
                        <label className="text-xs font-semibold uppercase text-[#8492a6]">Payment date<input type="date" value={details.paymentDate} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { paymentDate: event.target.value })} className={`mt-2 h-11 w-full rounded-lg border bg-[#f8fafc] px-3 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0] ${missingDate ? "border-[#dc2626]" : "border-[#dce3eb]"}`} />{missingDate && <p className="mt-1 text-[10px] normal-case text-[#dc2626]">Payment date is required.</p>}</label>
                        <label className="text-xs font-semibold uppercase text-[#8492a6] sm:col-span-2">Remarks (optional)<textarea value={details.remarks} onChange={(event) => updatePaymentDetails(employee.payrollEntryId, { remarks: event.target.value })} rows={2} className="mt-2 w-full resize-none rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 py-2 text-sm normal-case text-[#142038] outline-none focus:border-[#1769e0]" /></label>
                      </div>
                    </section>;
                  })}
                </div>
              </div>
              <div className="mt-4 flex gap-2 rounded-lg bg-[#eaf2ff] p-3 text-xs leading-5 text-[#175cd3]"><AlertCircle className="mt-0.5 shrink-0" size={16} /><p>This does not initiate a bank transfer. It only records payment details for salaries already credited to the employees’ registered accounts.</p></div>
            </div>
            <div className="flex shrink-0 justify-end gap-3 border-t border-[#edf0f3] p-5"><button disabled={isPaying} onClick={() => setShowPayment(false)} className="h-10 rounded-lg border border-[#dce3eb] px-4 text-sm font-semibold">Cancel</button><button disabled={isPaying} onClick={completePayment} className="inline-flex h-10 min-w-40 items-center justify-center gap-2 rounded-lg bg-[#168a49] px-4 text-sm font-semibold text-white disabled:opacity-70">{isPaying ? <><Loader2 className="animate-spin" size={16} /> Recording</> : <><Check size={16} /> Record as paid</>}</button></div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
