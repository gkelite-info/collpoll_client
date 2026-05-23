"use client";

import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getFinanceAnalyticsOverview } from "@/lib/helpers/finance-manager/analytics/FetchFinanceAnalytics";
import FinanceAnalyticsSummaryCards from "./FinanceAnalyticsSummaryCards";

type ProgramCard = {
  title: string;
  amount: string;
  collected: string;
  pending: string;
};

type SummaryCard = {
  label: string;
  value: string;
};

type ChartRow = {
  program: string;
  collected: number;
  pending: number;
};

function RevenueBars({ data }: { data: ChartRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBar, setSelectedBar] = useState<{
    item: ChartRow;
    x: number;
    y: number;
  } | null>(null);
  const maxValue = useMemo(
    () =>
      Math.max(
        1,
        ...data.map((item) => Number(item.collected) + Number(item.pending)),
      ),
    [data],
  );
  const formatShortAmount = (value: number) => {
    const amount = Number(value) || 0;
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
    return Math.round(amount).toLocaleString("en-IN");
  };

  const showPopover = (item: ChartRow, target: HTMLElement) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    setSelectedBar({
      item,
      x: containerRect
        ? targetRect.left - containerRect.left + targetRect.width / 2
        : 0,
      y: containerRect ? targetRect.top - containerRect.top : 0,
    });
  };

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#525252]">
        No fee data available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex h-full items-end gap-8 px-6">
      {selectedBar && (
        <div
          className="pointer-events-none absolute z-20 w-36 rounded-md border border-[#E4E4E4] bg-white p-2.5 text-left shadow-lg"
          style={{
            left: Math.max(8, selectedBar.x - 72),
            top: Math.max(8, selectedBar.y - 92),
          }}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-[#282828]">
              {selectedBar.item.program}
            </p>
          </div>
          <div className="space-y-1.5 text-[11px] text-[#282828]">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#43C17A]" />
                collected
              </span>
              <span className="font-semibold">
                {formatShortAmount(selectedBar.item.collected)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#CFF3DD]" />
                pending
              </span>
              <span className="font-semibold">
                {formatShortAmount(selectedBar.item.pending)}
              </span>
            </div>
          </div>
        </div>
      )}
      {data.map((item) => {
        const collectedHeight = (item.collected / maxValue) * 100;
        const pendingHeight = (item.pending / maxValue) * 100;

        return (
          <div
            key={item.program}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2 text-left"
          >
            <div
              className="flex h-[85%] w-16 cursor-pointer flex-col justify-end overflow-hidden rounded-t-md bg-[#CFF3DD]"
              onMouseEnter={(event) => {
                event.stopPropagation();
                showPopover(item, event.currentTarget);
              }}
              onMouseLeave={() => setSelectedBar(null)}
              onFocus={(event) => showPopover(item, event.currentTarget)}
              onBlur={() => setSelectedBar(null)}
              tabIndex={0}
              role="img"
              aria-label={`${item.program} fee collection: collected ${formatShortAmount(item.collected)}, pending ${formatShortAmount(item.pending)}`}
            >
              <div
                className="w-full bg-[#43C17A]"
                style={{ height: `${Math.max(collectedHeight, item.collected ? 5 : 0)}%` }}
              />
              <div
                className="w-full bg-[#CFF3DD]"
                style={{ height: `${Math.max(pendingHeight, item.pending ? 5 : 0)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#282828]">
              {item.program}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function FinanceAnalyticsView() {
  const router = useRouter();
  const { collegeId, collegeEducationId, loading: contextLoading } = useFinanceManager();
  const [loading, setLoading] = useState(true);
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [programCards, setProgramCards] = useState<ProgramCard[]>([]);
  const [chartData, setChartData] = useState<ChartRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setLoading(true);
      try {
        const result = await getFinanceAnalyticsOverview(
          collegeId,
          collegeEducationId,
        );
        if (!isMounted) return;
        setSummaryCards(result.summaryCards);
        setProgramCards(result.programCards);
        setChartData(result.chartData);
      } catch {
        if (!isMounted) return;
        setSummaryCards([]);
        setProgramCards([]);
        setChartData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [collegeId, collegeEducationId, contextLoading]);

  const isPageLoading = contextLoading || loading;
  const displayedProgramCards: Array<ProgramCard | null> = isPageLoading
    ? [null]
    : programCards;

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <h1 className="mb-4 text-xl font-semibold text-[#282828]">
        Finance / Analytics
      </h1>

      <FinanceAnalyticsSummaryCards cards={summaryCards} />

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
                All <CaretDown size={14} weight="bold" />
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
            {isPageLoading ? (
              <div className="h-full animate-pulse rounded-md bg-[#F2F2F2]" />
            ) : (
              <RevenueBars data={chartData} />
            )}
          </div>
        </div>

        <div className="custom-scrollbar mt-4 overflow-x-auto pb-2">
          <div className="grid min-w-[125%] grid-cols-5 gap-3">
            {displayedProgramCards.map((card, index) => (
              <article
                key={card?.title ?? index}
                className="rounded-md bg-[#F2F2F2] p-3 shadow-sm"
              >
                {!card ? (
                  <div className="space-y-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-[#D8D8D8]" />
                    <div className="h-8 animate-pulse rounded bg-[#D8D8D8]" />
                    <div className="h-3 w-full animate-pulse rounded bg-[#D8D8D8]" />
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
