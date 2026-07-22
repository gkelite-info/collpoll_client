import { Building2 } from "lucide-react";
import type { StaticPayrollEmployee } from "../data";

export default function EmployeeBankDetails({ employee }: { employee: StaticPayrollEmployee }) {
  const items = [["Account Holder", employee.bank.accountHolderName], ["Bank Name", employee.bank.bankName], ["Account Number", employee.bank.accountNumber], ["IFSC Code", employee.bank.ifscCode], ["Branch", employee.bank.branch]];
  return <section className="mb-5 rounded-xl border border-[#e2e5e9] bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 font-semibold"><Building2 size={18} className="text-[#1769e0]" /> Employee Bank Details</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{items.map(([label, value]) => <div key={label}><p className="text-[10px] font-semibold uppercase text-[#8492a6]">{label}</p><p className="mt-1 text-xs font-semibold text-[#263247]">{value}</p></div>)}</div></section>;
}
