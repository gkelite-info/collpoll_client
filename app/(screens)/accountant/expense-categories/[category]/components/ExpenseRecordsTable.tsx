import {
  DotsThreeVertical,
  Eye,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import type { ExpenseRow } from "./categoryDetails";

export function ExpenseRecordsTable({ rows }: { rows: ExpenseRow[] }) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <h2 className="text-[15px] font-bold text-[#17213D]">Expense Records</h2>
        <label className="flex h-9 min-w-[320px] items-center gap-3 rounded-md border border-[#E2E6EA] px-4 text-[#6B7280]">
          <MagnifyingGlass size={14} weight="bold" />
          <input
            type="search"
            placeholder="Search by expense name, paid to, or description..."
            className="w-full bg-transparent text-[11px] font-medium outline-none placeholder:text-[#7B8190]"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="bg-[#F0F2F4]">
            <tr className="text-[10px] font-bold tracking-wide text-[#6B7280]">
              <th className="px-7 py-4">#</th>
              <th className="px-7 py-4">EXPENSE NAME</th>
              <th className="px-7 py-4">PAID TO</th>
              <th className="px-7 py-4">DESIGNATION / TYPE</th>
              <th className="px-7 py-4">AMOUNT (Rs)</th>
              <th className="px-7 py-4">DATE</th>
              <th className="px-7 py-4">PAYMENT METHOD</th>
              <th className="px-7 py-4">RECORDED BY</th>
              <th className="px-7 py-4">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#E6E8EB] text-[11px] font-medium text-[#282828]"
              >
                <td className="px-7 py-5">{row.id}</td>
                <td className="px-7 py-5 font-semibold">{row.expenseName}</td>
                <td className="px-7 py-5">{row.paidTo}</td>
                <td className="px-7 py-5">{row.designation}</td>
                <td className="px-7 py-5 font-bold">{row.amount}</td>
                <td className="px-7 py-5">{row.date}</td>
                <td className="px-7 py-5">
                  <span className="rounded-full bg-[#E2FAF0] px-3 py-1 text-[9px] font-bold text-[#147A3D]">
                    {row.paymentMethod}
                  </span>
                </td>
                <td className="px-7 py-5">{row.recordedBy}</td>
                <td className="px-7 py-5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="View expense"
                      className="cursor-pointer"
                    >
                      <Eye size={14} weight="bold" />
                    </button>
                    <button
                      type="button"
                      aria-label="More actions"
                      className="cursor-pointer"
                    >
                      <DotsThreeVertical size={14} weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
