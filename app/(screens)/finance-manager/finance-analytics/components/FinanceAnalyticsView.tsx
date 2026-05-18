"use client";

import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import RevenueTrendsChart from "../../(dashboard)/components/RevenueTrendsChart";
import { revenueProgramCards } from "../../(dashboard)/components/data";
import FinanceAnalyticsSummaryCards from "./FinanceAnalyticsSummaryCards";

export default function FinanceAnalyticsView() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <h1 className="mb-4 text-xl font-semibold text-[#282828]">
        Finance / Analytics
      </h1>

      <FinanceAnalyticsSummaryCards />

      <section className="mt-5 rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-md font-semibold text-[#282828]">
            Fee Collection Trends
          </h2>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#525252]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#282828]">Academic Year</span>
              <button
                type="button"
                className="flex items-center gap-1 rounded-full bg-[#E9D8FF] px-3 py-1 font-semibold text-[#714EF2]"
              >
                2026 <CaretDown size={14} weight="bold" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#43C17A]" />
              <span>Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#CFF3DD]" />
              <span>Pending</span>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto overflow-y-hidden pb-2">
          <div className="h-56 min-w-[125%]">
            <RevenueTrendsChart />
          </div>
        </div>

        <div className="custom-scrollbar mt-4 overflow-x-auto pb-2">
          <div className="grid min-w-[125%] grid-cols-5 gap-3">
            {revenueProgramCards.map((card) => (
              <article
                key={card.title}
                className="rounded-md bg-[#F2F2F2] p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-md font-semibold text-[#43C17A]">
                    {card.title}
                  </h3>
                  <button
                    type="button"
                    aria-label={`View ${card.title} branch collection`}
                    className="cursor-pointer text-[#282828] transition hover:text-[#43C17A]"
                    onClick={() =>
                      router.push(
                        `?view=branch-wise&program=${encodeURIComponent(card.title)}`,
                      )
                    }
                  >
                    <CaretRight size={22} weight="bold" />
                  </button>
                </div>
                <p className="mt-2 rounded bg-[#16284F] px-2 py-1 text-sm font-semibold text-white">
                  {card.amount}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#16284F]">
                    {card.collected}
                  </span>
                  <span className="text-[#43C17A]">Collected</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#16284F]">
                    {card.pending}
                  </span>
                  <span className="text-[#43C17A]">Pending</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
