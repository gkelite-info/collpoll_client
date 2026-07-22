"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function PayrollDetailActions() {
  return <footer className="mt-5 flex flex-col-reverse justify-end gap-3 border-t border-[#dce2e9] pt-4 sm:flex-row"><Link href="/accountant/payroll" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d7dde5] bg-white px-6 py-2.5 text-xs font-semibold text-[#526177]"><X size={15} /> Cancel</Link><button type="button" onClick={() => toast.success("Static preview: salary marked as paid.")} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1769e0] px-6 py-2.5 text-xs font-semibold text-white shadow-md"><Check size={15} /> Mark As Paid</button></footer>;
}
