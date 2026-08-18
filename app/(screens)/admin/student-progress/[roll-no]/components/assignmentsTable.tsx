"use client";

import { useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getAdminStudentTasks } from "@/lib/helpers/admin/studentProgress/getAdminStudentTasks";
import type { AdminStudentProgressDetailsScope } from "@/lib/helpers/admin/studentProgress/getAdminStudentTasks";

type TaskTab = "assignments" | "quizzes" | "discussions";

interface AssignmentsTableProps {
  scope: AdminStudentProgressDetailsScope;
  weightages?: {
    assignments: number;
    quizzes: number;
    discussions: number;
  };
  insights?: {
    assignments: { obtained: number; total: number; weightedScore: number };
    quizzes: { obtained: number; total: number; weightedScore: number };
    discussions: { obtained: number; total: number; weightedScore: number };
  };
}

const TAB_LABELS: Record<TaskTab, string> = {
  assignments: "Assignments",
  quizzes: "Quizzes",
  discussions: "Discussion Forum",
};

const EMPTY_MESSAGES: Record<TaskTab, string> = {
  assignments: "No assignments available for this student.",
  quizzes: "No quizzes available for this student.",
  discussions: "No discussion forums available for this student.",
};

const getStatusColor = (status: string) => {
  if (
    status === "Pending" ||
    status === "Not Attempted" ||
    status === "Not Submitted"
  ) {
    return "text-[#FF3B30]";
  }
  if (
    status === "Incomplete" ||
    status === "Attempted" ||
    status === "Submitted"
  ) {
    return "text-[#F59E0B]";
  }
  return "text-[#4CAF50]";
};

export default function AssignmentsTable({
  scope,
  weightages,
  insights,
}: AssignmentsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const activeTab = (searchParams.get("tab") as TaskTab) || "assignments";
  const setActiveTab = (tab: TaskTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["adminStudentTasks", scope, activeTab],
    queryFn: ({ pageParam = 0 }) =>
      getAdminStudentTasks({
        ...scope,
        taskType: activeTab,
        pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const activeWeightage = useMemo(() => {
    if (activeTab === "quizzes") return weightages?.quizzes ?? 0;
    if (activeTab === "discussions") return weightages?.discussions ?? 0;
    return weightages?.assignments ?? 0;
  }, [activeTab, weightages]);

  const activeInsight = useMemo(() => {
    if (activeTab === "quizzes") return insights?.quizzes ?? { obtained: 0, total: 0, weightedScore: 0 };
    if (activeTab === "discussions") return insights?.discussions ?? { obtained: 0, total: 0, weightedScore: 0 };
    return insights?.assignments ?? { obtained: 0, total: 0, weightedScore: 0 };
  }, [activeTab, insights]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  const derivedInsight = useMemo(() => {
    const aggregated = rows.reduce(
      (acc, item) => {
        acc.obtained += item.obtainedMarks ?? 0;
        acc.total += item.totalMarks ?? 0;
        return acc;
      },
      { obtained: 0, total: 0 },
    );
    const weightedScore =
      aggregated.total > 0 && activeWeightage > 0
        ? Math.round((aggregated.obtained / aggregated.total) * activeWeightage)
        : 0;

    return {
      obtained: aggregated.obtained,
      total: aggregated.total,
      weightedScore,
    };
  }, [activeWeightage, rows]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-4 mt-6">
          {/* Inner Shimmer for Cards */}
          <div className="-mx-1 overflow-x-auto pb-1 custom-scrollbar">
            <div className="flex min-w-max items-center gap-2 px-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-32 bg-gray-100 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
          {/* Inner Shimmer for Table */}
          <div className="flex-1 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white flex flex-col min-h-[300px]">
             <div className="flex flex-col gap-4 p-4 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50 animate-pulse">
                    <div className="h-4 w-24 bg-gray-100 rounded"></div>
                    <div className="h-4 w-32 bg-gray-100 rounded hidden sm:block"></div>
                    <div className="h-4 w-24 bg-gray-100 rounded hidden md:block"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="-mx-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-[#F1F5F9] scrollbar-thumb-[#CBD5E1] custom-scrollbar">
          <div className="flex min-w-max items-center gap-2 px-1">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#F8FBF9] px-3 py-2 md:px-4 md:py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8E8E] md:text-xs">
                Weightage
              </span>
              <span className="rounded-full bg-[#43C17A1C] px-3 py-1 text-sm font-bold text-[#43C17A] md:text-base">
                {activeWeightage}%
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF7ED] px-3 py-2 md:px-4 md:py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] md:text-xs">
                Marks
              </span>
              <span className="rounded-full bg-[#FFEDD5] px-3 py-1 text-sm font-bold text-[#D97706] md:text-base">
                {activeInsight.obtained}/{activeInsight.total}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#EEF6FF] px-3 py-2 md:px-4 md:py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4B5563] md:text-xs">
                Added
              </span>
              <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-sm font-bold text-[#2563EB] md:text-base">
                {activeInsight.weightedScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white flex flex-col min-h-[300px] max-h-[500px]">
          {rows.length === 0 ? (
            <div className="flex h-full flex-1 flex-col items-center justify-center space-y-3 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] md:h-16 md:w-16">
                <svg
                  className="h-6 w-6 text-[#9CA3AF] md:h-8 md:w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-center text-[0.875rem] font-medium text-[#6B7280] md:text-[1rem]">
                {EMPTY_MESSAGES[activeTab]}
              </p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar flex-1 flex flex-col">
                <div className="min-w-[700px] flex-1 flex flex-col">
                  <div className="grid grid-cols-4 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-wider text-[#6B7280] md:grid-cols-5 md:px-6 md:py-4 md:text-[0.875rem] sticky top-0 z-10">
                    <div className="col-span-1">Subject</div>
                    <div className="col-span-2 md:col-span-2">Task Details</div>
                    <div className="col-span-1 text-center md:text-left">Status</div>
                    <div className="col-span-1 text-center hidden md:block">Score</div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="divide-y divide-[#E5E7EB]">
                  {rows.map((row, index) => (
                    <div
                      key={`${row.id}-${index}`}
                      className="grid grid-cols-4 items-center px-4 py-4 transition-colors hover:bg-[#F9FAFB] md:grid-cols-5 md:px-6 md:py-5"
                    >
                      <div className="col-span-1 pr-2">
                        <span className="block text-[0.875rem] font-medium text-[#111827] md:text-[1rem] break-words">
                          {row.subject}
                        </span>
                      </div>

                      <div className="col-span-2 md:col-span-2 px-2">
                        <span className="block text-[0.875rem] font-medium text-[#374151] md:text-[1rem] break-words">
                          {row.task}
                        </span>
                        <span className="mt-1 block text-[0.75rem] text-[#6B7280] md:text-[0.875rem]">
                          Due: {row.dueDate}
                        </span>
                      </div>

                      <div className="col-span-1 text-center md:text-left px-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-[0.75rem] font-medium md:px-2.5 md:text-[0.875rem] ${getStatusColor(
                            row.status
                          )} bg-opacity-10`}
                        >
                          {row.status}
                        </span>
                        
                        <div className="mt-1 block text-center md:hidden">
                          {row.status === "Evaluated" || row.status === "Completed" ? (
                            <span className="text-[0.75rem] font-semibold text-[#111827]">
                              {row.obtainedMarks}/{row.totalMarks}
                            </span>
                          ) : (
                            <span className="text-[0.75rem] text-[#9CA3AF]">-</span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-1 text-center hidden md:block px-2">
                        {row.status === "Evaluated" || row.status === "Completed" ? (
                          <span className="inline-block whitespace-nowrap text-[0.875rem] font-semibold text-[#111827] md:text-[1rem]">
                            {row.obtainedMarks} / {row.totalMarks}
                          </span>
                        ) : (
                          <span className="text-[0.875rem] text-[#9CA3AF] md:text-[1rem]">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Infinite scroll trigger */}
                  {isFetchingNextPage && (
                    <div className="flex flex-col w-full">
                      {[1, 2, 3].map((i) => (
                        <div key={`loader-${i}`} className="grid grid-cols-4 items-center px-4 py-4 md:grid-cols-5 md:px-6 md:py-5 border-t border-gray-50 animate-pulse">
                          <div className="col-span-1 pr-2"><div className="h-4 w-24 bg-gray-100 rounded"></div></div>
                          <div className="col-span-2 md:col-span-2 px-2"><div className="h-4 w-32 bg-gray-100 rounded"></div></div>
                          <div className="col-span-1 text-center md:text-left px-2"><div className="h-6 w-16 bg-gray-200 rounded mx-auto md:mx-0"></div></div>
                          <div className="col-span-1 text-center hidden md:block px-2"><div className="h-4 w-12 bg-gray-100 rounded mx-auto"></div></div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div ref={ref} className="h-4 w-full" />
                  {!isFetchingNextPage && !hasNextPage && rows.length > 0 && (
                     <div className="p-4 text-center">
                        <span className="text-xs text-gray-400">End of tasks</span>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 font-sans shadow-sm flex flex-col">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-xl font-bold text-[#333333]">Academic Tasks</h2>

          <div className="-mx-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-[#F1F5F9] scrollbar-thumb-[#CBD5E1] custom-scrollbar">
            <div className="flex min-w-max items-center gap-2 px-1">
              {(Object.keys(TAB_LABELS) as TaskTab[]).map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors md:text-sm ${
                      isActive
                        ? "bg-[#43C17A1C] text-[#43C17A]"
                        : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
