import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";

type AttendanceToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onMarkAllPresent: () => void;
};

export default function AttendanceToolbar({
  search,
  onSearchChange,
  onMarkAllPresent,
}: AttendanceToolbarProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search staff..."
          className="h-10 w-full rounded-lg border border-[#E1E7F0] bg-white pl-10 pr-4 text-[13px] font-medium text-[#16284F] outline-none placeholder:text-[#9CA3AF] focus:border-[#43C17A]"
        />
      </div>
      <button
        type="button"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E1E7F0] bg-white px-4 text-[13px] font-bold text-[#475569] transition-colors hover:bg-[#F8FAFC]"
      >
        <FunnelSimple size={15} weight="bold" />
        Filter
      </button>
      <button
        type="button"
        onClick={onMarkAllPresent}
        className="h-10 rounded-lg bg-[#5B45E8] px-5 text-[13px] font-extrabold text-white shadow-sm transition-colors hover:bg-[#4835D1]"
      >
        Mark All Present
      </button>
    </div>
  );
}
