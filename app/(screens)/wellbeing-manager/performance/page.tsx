"use client";

import { useEffect, useMemo, useState } from "react";
import { List } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { Avatar } from "@/app/utils/Avatar";
import WellbeingRight from "../components/WellbeingRight";
import ExecutiveProfileCard from "../../wellbeing-executive/performance/components/ExecutiveProfileCard";
import ContributionSection from "../../wellbeing-executive/performance/components/ContributionSection";
import ResolvedIssuesList from "../../wellbeing-executive/performance/components/ResolvedIssuesList";
import { months } from "../../wellbeing-executive/performance/data";
import { fetchExecutivePerformance } from "../../wellbeing-executive/performance/performanceApi";
import type { Executive } from "../../wellbeing-executive/performance/types";
import {
  fetchManagerExecutives,
  type ManagerExecutive,
} from "@/lib/helpers/wellbeingPerformance/wellbeingManagerPerformanceAPI";

const rangeValue = (date: Date, end = false) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T${end ? "23:59:59.999" : "00:00:00.000"}`;
};

const monthRange = (date: Date) => ({
  fromDate: rangeValue(new Date(date.getFullYear(), date.getMonth(), 1)),
  toDate: rangeValue(new Date(date.getFullYear(), date.getMonth() + 1, 0), true),
});

export default function PerformancePage() {
  const { collegeId, loading } = useUser();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [executives, setExecutives] = useState<ManagerExecutive[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [performance, setPerformance] = useState<Executive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const selected = executives.find(
    (item) => `${item.wellBeingId}:${item.categoryId}` === selectedKey,
  ) ?? executives[0] ?? null;
  const { fromDate, toDate } = useMemo(() => monthRange(selectedDate), [selectedDate]);
  const month = months[selectedDate.getMonth()] ?? "January";

  useEffect(() => {
    if (loading || !collegeId) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setIsLoading(true);
      return fetchManagerExecutives(collegeId);
    })
      .then((items) => {
        if (cancelled) return;
        setExecutives(items);
        setSelectedKey((current) => current || (items[0] ? `${items[0].wellBeingId}:${items[0].categoryId}` : ""));
      })
      .catch((error) => {
        console.error("Executive list fetch failed:", error);
        toast.error("Failed to load executives.");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [collegeId, loading]);

  useEffect(() => {
    if (!collegeId || !selected) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setIsLoading(true);
      return fetchExecutivePerformance({
      wellBeingId: selected.wellBeingId,
      categoryId: selected.categoryId,
      collegeId,
      name: selected.name,
      staffId: `ID - ${selected.staffId}`,
      role: `${selected.categoryName} Executive`,
      image: selected.image,
      phone: selected.phone,
      email: selected.email,
      fromDate,
      toDate,
      fallbackCategoryName: selected.categoryName,
      });
    }).then((value) => {
      if (!cancelled) setPerformance(value);
    }).catch((error) => {
      console.error("Performance fetch failed:", error);
      toast.error("Failed to load performance.");
      if (!cancelled) setPerformance(null);
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [collegeId, fromDate, selected, toDate]);

  const handleMonthChange = (nextMonth: string) => {
    const index = months.indexOf(nextMonth);
    if (index >= 0) setSelectedDate((date) => new Date(date.getFullYear(), index, 1));
  };

  const executivesSidebar = (
    <div className="flex shrink-0 flex-col rounded-[16px] border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-[18px] font-bold text-[#16284F]">Executives</h3>
      <div className="mt-2 flex max-h-[360px] flex-col gap-2 overflow-y-auto custom-scrollbar">
        {executives.map((item) => {
          const key = `${item.wellBeingId}:${item.categoryId}`;
          return (
            <button key={key} onClick={() => { setSelectedKey(key); setIsMobileDrawerOpen(false); }} className={`flex cursor-pointer items-center gap-3 rounded-[12px] border p-3 text-left shadow-sm ${key === `${selected?.wellBeingId}:${selected?.categoryId}` ? "border-[#D3F1E0] bg-[#E8F8EF]" : "border-gray-100 bg-white hover:bg-gray-50"}`}>
              <Avatar src={item.image || null} alt={item.name} size={40} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold text-[#16284F]">{item.name}</span>
                <span className="block text-[11px] font-bold text-gray-500">ID-{item.staffId} · {item.categoryName}</span>
              </span>
            </button>
          );
        })}
        {!isLoading && executives.length === 0 ? <p className="py-5 text-center text-sm text-gray-400">No executives found.</p> : null}
      </div>
    </div>
  );

  return (
    <main className="flex w-full flex-col gap-2 lg:min-h-screen lg:flex-row">
      <section className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto p-2 lg:h-full lg:w-[68%]">
        <div className="flex items-center justify-between">
          <div><h1 className="text-[18px] font-bold text-[#282828]">Performance</h1><p className="mt-1 text-[13px] font-medium text-[#282828]">Monitor and track performance of well-being executives</p></div>
          <button onClick={() => setIsMobileDrawerOpen(true)} className="rounded-lg border border-gray-200 bg-white p-2 text-[#16284F] lg:hidden"><List size={24} weight="bold" /></button>
        </div>
        {isLoading ? <PerformanceShimmer /> : performance ? <><ExecutiveProfileCard executive={performance} month={month} onMonthChange={handleMonthChange} /><ContributionSection executive={performance} /><h2 className="text-[16px] font-bold text-[#282828]">Resolved Issues</h2><ResolvedIssuesList key={`${performance.id}-${performance.category}`} executive={performance} itemsPerPage={2} /></> : <div className="rounded-lg bg-white p-10 text-center text-sm font-semibold text-gray-400">Select an executive to view performance.</div>}
      </section>
      <WellbeingRight button={false} isMobileDrawerOpen={isMobileDrawerOpen} onCloseDrawer={() => setIsMobileDrawerOpen(false)} hideDefaultMobileContent activeCalendarDate={selectedDate} onCalendarDateSelect={setSelectedDate}>{executivesSidebar}</WellbeingRight>
    </main>
  );
}

function PerformanceShimmer() {
  return <div className="animate-pulse space-y-4"><div className="h-52 rounded-lg bg-white" /><div className="h-44 rounded-lg bg-white" /><div className="h-52 rounded-lg bg-white" /></div>;
}
