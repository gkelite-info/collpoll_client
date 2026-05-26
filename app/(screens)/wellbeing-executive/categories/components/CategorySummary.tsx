"use client";

import dynamic from "next/dynamic";
import { statCards } from "../data";

const IssueStatusDonut = dynamic(
  () => import("../../(dashboard)/components/IssueStatusDonut"),
  {
    ssr: false,
    loading: () => (
      <div className="mt-4 flex min-h-[170px] items-center justify-center gap-4">
        <div className="h-[150px] w-[150px] animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-3 w-24 animate-pulse rounded bg-gray-200"
            />
          ))}
        </div>
      </div>
    ),
  },
);

function StatCard({ item }: { item: (typeof statCards)[number] }) {
  const Icon = item.icon;

  return (
    <div className={`rounded-md p-2.5 ${item.bg}`}>
      <div className="flex items-start gap-2">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${item.iconBg} ${item.iconColor}`}
        >
          <Icon size={14} weight="fill" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-[#282828]">{item.value}</p>
          <p className="mt-0.5 text-[10px] font-medium text-[#282828]">
            {item.label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CategorySummary() {
  return (
    <div className="grid max-h-[245px] shrink-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)]">
      <section className="rounded-lg bg-white p-2.5 shadow-sm">
        <h1 className="mb-2 text-[14px] font-bold text-[#282828]">
          Infrastructure Issues
        </h1>
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </div>
      </section>
      <section className="overflow-hidden rounded-lg bg-white p-2 shadow-sm [&>div]:mt-0 [&>div]:min-h-[170px]">
        <IssueStatusDonut />
      </section>
    </div>
  );
}
