import type { ReimbursementStatus } from "./types";

const statusClass: Record<ReimbursementStatus, string> = {
  Paid: "bg-[#DDF8E7] text-[#00833E]",
  Pending: "bg-[#DDEAFF] text-[#0065E8]",
  Rejected: "bg-[#FFE2E2] text-[#D51E1E]",
};

export default function RequestStatus({
  status,
}: {
  status: ReimbursementStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${statusClass[status]}`}
    >
      {status}
    </span>
  );
}
