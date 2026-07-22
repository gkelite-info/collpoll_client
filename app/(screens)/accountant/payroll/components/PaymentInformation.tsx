import { Info } from "lucide-react";
import type { StaticPayrollEmployee } from "../data";

export default function PaymentInformation({ employee }: { employee: StaticPayrollEmployee }) {
  const inputClass = "h-10 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 text-xs outline-none focus:border-[#1769e0]";
  return <section className="rounded-xl border border-[#e2e5e9] bg-white p-5 shadow-sm"><h2 className="mb-5 flex items-center gap-2 font-semibold"><Info size={18} className="text-[#1769e0]" /> Payment Information</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Payment Method"><select defaultValue={employee.payment.paymentMethod} className={inputClass}><option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Cash</option></select></Field><Field label="Transaction ID"><input defaultValue={employee.payment.transactionId} className={inputClass} /></Field><Field label="Payment Date" wide><input type="date" defaultValue={employee.payment.paymentDate} className={inputClass} /></Field><Field label="Remarks (Optional)" wide><textarea defaultValue={employee.payment.remarks} className="h-24 w-full resize-none rounded-lg border border-[#dce3eb] bg-[#f8fafc] p-3 text-xs outline-none" /></Field></div><p className="mt-4 rounded-lg border border-[#cfe0fb] bg-[#edf5ff] p-3 text-[10px] text-[#1769e0]">Ensure the payment is made to the employee&apos;s registered bank account only.</p></section>;
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`text-[10px] font-semibold uppercase text-[#8492a6] ${wide ? "sm:col-span-2" : ""}`}>{label}<div className="mt-2">{children}</div></label>; }
