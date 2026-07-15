import { toneClasses, type SummaryCardItem } from "./reminderData";

export function ReminderSummaryCard({ item, isLoading }: { item: SummaryCardItem; isLoading?: boolean }) {
  const Icon = item.icon;

  return (
    <article className="flex h-[126px] flex-col justify-center rounded-xl bg-white px-7 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      {isLoading ? (
        <div className="flex h-11 w-11 animate-pulse items-center justify-center rounded-lg bg-slate-200" />
      ) : (
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[item.tone]}`}
        >
          <Icon size={21} weight="bold" />
        </span>
      )}
      <div className="mt-4 flex h-[26px] items-center">
        {isLoading ? (
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="text-[22px] font-bold leading-tight text-[#17213D]">{item.value}</p>
        )}
      </div>
      {isLoading ? (
        <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className="mt-1 text-[12px] font-medium text-[#7B8AA3]">{item.label}</p>
      )}
    </article>
  );
}
