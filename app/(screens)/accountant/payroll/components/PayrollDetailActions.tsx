import { X } from "lucide-react";
import Link from "next/link";

export default function PayrollDetailActions() {
  return <footer className="mt-5 flex justify-end border-t border-[#dce2e9] pt-4"><Link href="/accountant/payroll" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d7dde5] bg-white px-6 py-2.5 text-xs font-semibold text-[#526177]"><X size={15} /> Back to payroll</Link></footer>;
}
