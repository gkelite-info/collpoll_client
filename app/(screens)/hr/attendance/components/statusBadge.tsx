// ── Status badge helper (JSX — must stay in .tsx) ────────────────────────────

export function getStatusBadge(status: string) {
  let colorClass = "text-gray-500";
  if (status === "Present") colorClass = "text-[#22C55E]";
  if (status === "Late")    colorClass = "text-[#EAB308]";
  if (status === "Absent")  colorClass = "text-[#EF4444]";
  if (status === "Leave")   colorClass = "text-[#60AEFF]";
  return <span className={`${colorClass} font-semibold`}>{status}</span>;
}
