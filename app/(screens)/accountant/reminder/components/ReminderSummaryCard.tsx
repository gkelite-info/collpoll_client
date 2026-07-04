import { toneClasses, type SummaryCardItem } from "./reminderData";

export function ReminderSummaryCard({ item }: { item: SummaryCardItem }) {
  const Icon = item.icon;

  return (
    <article className="flex h-[126px] flex-col justify-center rounded-xl bg-white px-7 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[item.tone]}`}
      >
        <Icon size={21} weight="bold" />
      </span>
      <p className="mt-4 text-[22px] font-bold leading-tight text-[#17213D]">
        {item.value}
      </p>
      <p className="mt-1 text-[12px] font-medium text-[#7B8AA3]">{item.label}</p>
    </article>
  );
}
