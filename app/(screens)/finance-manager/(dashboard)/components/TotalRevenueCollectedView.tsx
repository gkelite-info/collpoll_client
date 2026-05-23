"use client";

import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getFinanceAnalyticsOverview } from "@/lib/helpers/finance-manager/analytics/FetchFinanceAnalytics";
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FinanceSummaryCards from "./FinanceSummaryCards";
import RevenueTrendsChart from "./RevenueTrendsChart";

type SummaryCard = {
  label: string;
  value: string;
};

type ProgramCard = {
  title: string;
  educationId?: number;
  amount: string;
  collected: string;
  pending: string;
};

type ChartRow = {
  program: string;
  collected: number;
  pending: number;
};

const emptySummaryCards: SummaryCard[] = [
  { label: "Total Revenue Collected", value: "\u20B90" },
  { label: "Total Pending Fees", value: "\u20B90" },
  { label: "Total Students", value: "0" },
  { label: "Active Finance Managers", value: "00" },
];

export default function TotalRevenueCollectedView() {
  const router = useRouter();
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const [isLoading, setIsLoading] = useState(true);
  const [summaryCards, setSummaryCards] =
    useState<SummaryCard[]>(emptySummaryCards);
  const [programCards, setProgramCards] = useState<ProgramCard[]>([]);
  const [chartData, setChartData] = useState<ChartRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadRevenueOverview() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setIsLoading(true);
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
        setSummaryCards(emptySummaryCards);
        setProgramCards([]);
        setChartData([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRevenueOverview();

    return () => {
      isMounted = false;
    };
  }, [collegeEducationId, collegeId, contextLoading]);

  const isPageLoading = contextLoading || isLoading;
  const displayedProgramCards: Array<ProgramCard | null> = isPageLoading
    ? Array.from({ length: 4 }, () => null)
    : programCards;

  return (
    <div className="w-full p-2 pb-7 lg:pb-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to Finance Analytics"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0] cursor-pointer"
          onClick={() => router.push("/finance-manager")}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold text-[#282828]">
          Total Revenue Collected
        </h1>
      </div>

      <FinanceSummaryCards cards={summaryCards} />

      <section className="mt-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
          <div className="h-52 min-w-[125%]">
            {isPageLoading ? (
              <div className="h-full animate-pulse rounded-md bg-[#F2F2F2]" />
            ) : (
              <RevenueTrendsChart data={chartData} />
            )}
          </div>
        </div>

        <div className="custom-scrollbar mt-3 overflow-x-auto pb-2">
          <div className="grid min-w-[125%] grid-cols-4 gap-3">
            {displayedProgramCards.map((card, index) => (
              <article
                key={card?.title ?? index}
                className="rounded-md bg-[#F2F2F2] p-3 shadow-sm"
              >
                {!card ? (
                  <div className="space-y-3">
                    <div className="h-4 w-14 animate-pulse rounded bg-[#D8D8D8]" />
                    <div className="h-8 animate-pulse rounded bg-[#D8D8D8]" />
                    <div className="h-3 animate-pulse rounded bg-[#D8D8D8]" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#43C17A]">
                        {card.title}
                      </h3>
                      <button
                        type="button"
                        aria-label={`View ${card.title} branch collection`}
                        className="cursor-pointer text-[#282828] transition hover:text-[#43C17A]"
                        onClick={() =>
                          router.push(
                            `?view=revenue-branch-wise&program=${encodeURIComponent(card.title)}`,
                          )
                        }
                      >
                        <CaretRight size={22} weight="bold" />
                      </button>
                    </div>
                    <p className="mt-2 rounded bg-[#16284F] px-2 py-1 text-sm font-semibold text-white">
                      {card.amount}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#16284F]">
                        {card.collected}
                      </span>
                      <span className="text-[#43C17A]">Collected</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs">
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
