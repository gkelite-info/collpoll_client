import { Check } from "lucide-react";

export default function PaymentTracking() {
  const steps = [["Payroll Calculated", "16 Jul 2026", "HR Manager"], ["HR Finalized", "18 Jul 2026", "HR Manager"], ["Payment Completed", "20 Jul 2026", "Accountant"]];
  return <section className="rounded-xl border border-[#e2e5e9] bg-white p-5 shadow-sm"><h2 className="mb-6 font-semibold">Payment Tracking</h2>{steps.map(([title, date, person], index) => <div key={title} className="relative grid grid-cols-[24px_1fr_auto] gap-3 pb-8 last:pb-0">{index < steps.length - 1 && <span className="absolute left-[11px] top-5 h-[calc(100%-4px)] w-px bg-[#dce4ed]" />}<span className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2ac36a] text-white"><Check size={13} /></span><div><p className="text-xs font-bold">{title}</p><p className="mt-1 text-[10px] text-[#91a0b4]">{date}</p></div><p className="text-right text-[10px] text-[#526177]">{person}</p></div>)}</section>;
}
