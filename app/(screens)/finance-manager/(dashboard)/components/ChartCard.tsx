"use client";

import { CaretRight } from "@phosphor-icons/react";

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  minWidth?: string;
};

export default function ChartCard({
  title,
  children,
  minWidth = "min-w-[720px]",
}: ChartCardProps) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold text-[#282828]">{title}</h2>
        <button className="cursor-pointer text-[#282828]" type="button">
          <CaretRight size={22} weight="bold" />
        </button>
      </div>
      <div className="custom-scrollbar overflow-x-auto overflow-y-hidden pb-2">
        <div className={`${minWidth} h-64`}>{children}</div>
      </div>
    </section>
  );
}
