export function TypeBadge({ type }: { type: string }) {
  const isReceive = type === "TO RECEIVE";

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-bold ${
        isReceive
          ? "bg-[#E4FAED] text-[#1A9B55]"
          : "bg-[#FFE8E7] text-[#FF4B4B]"
      }`}
    >
      {type}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const isOverdue = status === "OVERDUE";
  const isDueToday = status === "DUE TODAY";
  const isCompleted = status === "COMPLETED";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[9px] font-bold ${
        isOverdue
          ? "bg-[#FFE8E7] text-[#FF4B4B]"
          : isDueToday
            ? "bg-[#FFF0DF] text-[#FF8B25]"
            : isCompleted
              ? "bg-[#F0E7FF] text-[#7D4DFF]"
              : "bg-[#E8F1FF] text-[#3478F6]"
      }`}
    >
      {status}
    </span>
  );
}
