"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import WellbeingExecutiveRight from "../components/WellbeingExecutiveRight";
import ContributionSection from "./components/ContributionSection";
import ExecutiveProfileCard from "./components/ExecutiveProfileCard";
import ResolvedIssuesList from "./components/ResolvedIssuesList";
import { months } from "./data";
import { fetchExecutivePerformance } from "./performanceApi";
import type { Executive } from "./types";

const toDateTimeRangeValue = (date: Date, endOfDay = false) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const time = endOfDay ? "23:59:59.999" : "00:00:00.000";

  return `${year}-${month}-${day}T${time}`;
};

const getMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    fromDate: toDateTimeRangeValue(start),
    toDate: toDateTimeRangeValue(end, true),
  };
};

export default function PerformancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);
  const {
    loading,
    collegeId,
    wellBeingId,
    wellBeingCategoryId,
    wellBeingCategoryIds,
    wellBeingCategoryName,
    wellBeingCategoryNames,
    fullName,
    identifierId,
    profilePhoto,
    mobile,
    email,
  } = useUser();
  const categoryId = wellBeingCategoryId ?? wellBeingCategoryIds[0] ?? null;
  const categoryName = wellBeingCategoryName ?? wellBeingCategoryNames[0] ?? null;
  const month = months[selectedDate.getMonth()] ?? "January";
  const { fromDate, toDate } = useMemo(() => getMonthRange(selectedDate), [selectedDate]);
  const fallbackExecutive = useMemo<Executive>(
    () => ({
      id: wellBeingId ?? 0,
      name: fullName ?? "Wellbeing Executive",
      staffId: identifierId ? `ID - ${identifierId}` : "ID -",
      role: `${categoryName ?? "Wellbeing"} Executive`,
      category: categoryName ?? "Assigned Category",
      image: profilePhoto || "/w-e-m.png",
      phone: mobile ?? "-",
      email: email ?? "-",
      status: "",
      totalIssues: 0,
      resolvedIssues: 0,
      contribution: 0,
      issues: [],
    }),
    [categoryName, email, fullName, identifierId, mobile, profilePhoto, wellBeingId],
  );

  const handleMonthChange = (nextMonth: string) => {
    const nextMonthIndex = months.indexOf(nextMonth);

    if (nextMonthIndex < 0) {
      return;
    }

    setSelectedDate((current) => new Date(current.getFullYear(), nextMonthIndex, 1));
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!collegeId || !wellBeingId || !categoryId) {
      return;
    }

    let cancelled = false;

    void Promise.resolve().then(async () => {
      setIsPerformanceLoading(true);

      try {
        const executive = await fetchExecutivePerformance({
          wellBeingId,
          categoryId,
          collegeId,
          name: fullName ?? "Wellbeing Executive",
          staffId: identifierId ? `ID - ${identifierId}` : "ID -",
          role: `${categoryName ?? "Wellbeing"} Executive`,
          image: profilePhoto || "/w-e-m.png",
          phone: mobile ?? "-",
          email: email ?? "-",
          fromDate,
          toDate,
          fallbackCategoryName: categoryName,
        });

        if (!cancelled) {
          setSelectedExecutive(executive);
        }
      } catch (error) {
        console.error("Performance fetch failed:", error);
        toast.error("Failed to load performance.");
        if (!cancelled) {
          setSelectedExecutive(fallbackExecutive);
        }
      } finally {
        if (!cancelled) {
          setIsPerformanceLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    categoryId,
    categoryName,
    collegeId,
    email,
    fallbackExecutive,
    fromDate,
    fullName,
    identifierId,
    loading,
    mobile,
    profilePhoto,
    toDate,
    wellBeingId,
  ]);

  const executive = selectedExecutive ?? fallbackExecutive;
  const showPerformanceShimmer = loading || isPerformanceLoading;

  return (
    <main className="flex w-full flex-col gap-2 lg:min-h-screen lg:flex-row">
      <section className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto p-2 lg:h-full lg:w-[68%]">
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-[#282828]">
              Performance
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#282828]">
              Monitor and track performance of well-being executives
            </p>
          </div>
        </div>

        {showPerformanceShimmer ? (
          <ExecutiveProfileCardShimmer />
        ) : (
          <ExecutiveProfileCard
            executive={executive}
            month={month}
            onMonthChange={handleMonthChange}
          />
        )}
        {showPerformanceShimmer ? (
          <PerformanceContentShimmer />
        ) : (
          <>
            <ContributionSection executive={executive} />
            <ResolvedIssuesList executive={executive} />
          </>
        )}
      </section>

      <WellbeingExecutiveRight
        bounded
        showCalendar
        activeCalendarDate={selectedDate}
        onCalendarDateSelect={setSelectedDate}
        announcementHeight="730px"
        showHeaderCards={false}
        showCourseScheduleCard
      />
    </main>
  );
}

function ExecutiveProfileCardShimmer() {
  return (
    <section className="animate-pulse rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex items-center gap-4">
          <div className="h-[78px] w-[78px] shrink-0 rounded-full bg-[#DDE5F0]" />
          <div className="min-w-0 space-y-3">
            <div className="h-5 w-56 rounded bg-[#DDE5F0]" />
            <div className="h-4 w-40 rounded bg-[#EAF0F7]" />
            <div className="h-4 w-36 rounded bg-[#EAF0F7]" />
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="h-4 w-64 rounded bg-[#EAF0F7]" />
          <div className="h-8 w-28 rounded-full bg-[#DDE5F0]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex h-[76px] flex-col justify-between rounded-md bg-[#F3F6FA] p-3">
            <div className="h-6 w-14 rounded bg-[#DDE5F0]" />
            <div className="h-4 w-32 rounded bg-[#EAF0F7]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PerformanceContentShimmer() {
  return (
    <div className="animate-pulse space-y-4">
      <div>
        <div className="mb-3 h-5 w-56 rounded bg-[#DDE5F0]" />
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="h-[120px] w-[120px] rounded-full bg-[#EAF0F7]" />
            <div className="w-full flex-1 space-y-4">
              <div className="h-8 w-32 rounded bg-[#DDE5F0]" />
              <div className="h-2 rounded-full bg-[#EAF0F7]" />
              <div className="flex justify-between">
                <div className="h-4 w-28 rounded bg-[#EAF0F7]" />
                <div className="h-4 w-36 rounded bg-[#EAF0F7]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-4 flex justify-between">
            <div className="h-5 w-36 rounded bg-[#DDE5F0]" />
            <div className="h-7 w-24 rounded bg-[#DDE5F0]" />
          </div>
          <div className="mb-4 h-5 w-72 rounded bg-[#EAF0F7]" />
          <div className="mb-4 flex gap-5">
            <div className="h-8 w-40 rounded bg-[#EAF0F7]" />
            <div className="h-8 w-32 rounded bg-[#EAF0F7]" />
            <div className="h-8 w-40 rounded bg-[#EAF0F7]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded bg-[#EAF0F7]" />
            <div className="h-3 w-4/5 rounded bg-[#EAF0F7]" />
          </div>
        </div>
      ))}
    </div>
  );
}
