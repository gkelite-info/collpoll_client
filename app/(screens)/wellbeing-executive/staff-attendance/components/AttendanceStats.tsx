import { UsersThree } from "@phosphor-icons/react";
import type { StaffAttendanceStatus } from "../data";

type AttendanceStatsProps = {
  total: number;
  present: number;
  absent: number;
  activeFilter?: "all" | StaffAttendanceStatus;
  onTotalClick?: () => void;
  onPresentClick?: () => void;
  onAbsentClick?: () => void;
};

const statCards = [
  {
    key: "total",
    label: "Total Staff",
    iconClass: "bg-[#EAF0FF] text-[#16284F]",
    valueClass: "text-[#16284F]",
  },
  {
    key: "present",
    label: "Present",
    iconClass: "bg-[#E6FAF1] text-[#18B978]",
    valueClass: "text-[#16284F]",
  },
  {
    key: "absent",
    label: "Absent",
    iconClass: "bg-[#FFF2D9] text-[#F59E0B]",
    valueClass: "text-[#16284F]",
  },
] as const;

export function AttendanceStats({
  total,
  present,
  absent,
  activeFilter,
  onTotalClick,
  onPresentClick,
  onAbsentClick,
}: AttendanceStatsProps) {
  const values = { total, present, absent };
  const actions = {
    total: onTotalClick,
    present: onPresentClick,
    absent: onAbsentClick,
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {statCards.map((card) => {
        const isActive =
          activeFilter === card.key || (card.key === "total" && activeFilter === "all");

        return (
        <button
          type="button"
          key={card.key}
          onClick={actions[card.key]}
          className={`flex min-h-[92px] items-center gap-4 rounded-xl px-5 py-4 text-left ${
            isActive ? "bg-white ring-2 ring-[#40C982]" : "bg-[#ECECEC]"
          } ${
            actions[card.key] ? "cursor-pointer transition-shadow hover:shadow-md" : "cursor-default"
          }`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.iconClass}`}
          >
            <UsersThree size={22} weight="fill" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-[#6B7280]">{card.label}</p>
            <p className={`mt-1 text-[28px] font-extrabold leading-none ${card.valueClass}`}>
              {values[card.key]}
            </p>
          </div>
        </button>
        );
      })}
    </div>
  );
}

export function AttendanceSummary({
  total,
  present,
  absent,
}: AttendanceStatsProps) {
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="flex h-full min-h-[190px] flex-col rounded-xl border border-[#E8EDF5] bg-white px-5 py-4">
      <h3 className="text-[13px] font-extrabold text-[#16284F]">Today&apos;s Summary</h3>
      <div className="flex flex-1 items-center justify-center gap-6">
        <div
          className="grid h-[92px] w-[92px] place-items-center rounded-full"
          style={{
            background: `conic-gradient(#18B978 ${presentPercentage * 3.6}deg, #F05454 0deg)`,
          }}
        >
          <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white text-center shadow-inner">
            <div>
              <p className="text-[24px] font-extrabold leading-none text-[#16284F]">{total}</p>
              <p className="mt-1 text-[8px] font-semibold uppercase text-[#9CA3AF]">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-[11px] font-semibold">
          <SummaryLegend color="bg-[#18B978]" label="Present" value={present} />
          <SummaryLegend color="bg-[#F05454]" label="Absent" value={absent} />
        </div>
      </div>
    </div>
  );
}

function SummaryLegend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 text-[#5B6475]">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
      <span className="text-[#16284F]">({value})</span>
    </div>
  );
}

export const statusMeta: Record<
  StaffAttendanceStatus,
  { label: string; dot: string; className: string }
> = {
  present: {
    label: "Present",
    dot: "bg-[#18B978]",
    className: "bg-[#E8FAF2] text-[#10A66A]",
  },
  absent: {
    label: "Absent",
    dot: "bg-[#F05454]",
    className: "bg-[#FFF0F0] text-[#EF4444]",
  },
  late: {
    label: "Late",
    dot: "bg-[#F59E0B]",
    className: "bg-[#FFF7E5] text-[#D97706]",
  },
  leave: {
    label: "Leave",
    dot: "bg-[#2563EB]",
    className: "bg-[#EAF0FF] text-[#2563EB]",
  },
  not_marked: {
    label: "Not Marked",
    dot: "bg-[#94A3B8]",
    className: "bg-[#EEF1F5] text-[#64748B]",
  },
};
