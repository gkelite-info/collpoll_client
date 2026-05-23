"use client";

import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  fetchFeeCollectionOverview,
  type FeeCollectionOverviewRow,
} from "@/lib/helpers/finance-manager/dashboard/FetchFeeCollectionOverview";
import { useEffect, useState } from "react";

const formatShortCurrency = (value: number) => {
  const amount = Number(value) || 0;
  if (amount >= 10000000) return `\u20B9 ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `\u20B9 ${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `\u20B9 ${Math.round(amount / 1000)} K`;
  return `\u20B9 ${Math.round(amount).toLocaleString("en-IN")}`;
};

export default function FeeCollectionPanel() {
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const [rows, setRows] = useState<FeeCollectionOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFeeCollection() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setLoading(true);
      try {
        const result = await fetchFeeCollectionOverview(
          collegeId,
          collegeEducationId,
        );
        if (!isMounted) return;
        setRows(result.educationRows);
      } catch {
        if (!isMounted) return;
        setRows([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFeeCollection();

    return () => {
      isMounted = false;
    };
  }, [collegeEducationId, collegeId, contextLoading]);

  const isLoading = contextLoading || loading;

  return (
    <div className="flex h-[360px] min-h-0 flex-col rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-md font-semibold text-[#282828]">Fee Collection</h2>
      <div className="custom-scrollbar mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden pr-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-md bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="h-5 w-24 animate-pulse rounded bg-[#F2F2F2]" />
                <div className="h-5 w-28 animate-pulse rounded bg-[#F2F2F2]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 animate-pulse rounded-md bg-[#F2F2F2]" />
                <div className="h-20 animate-pulse rounded-md bg-[#F2F2F2]" />
              </div>
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#525252]">
            No fee collection data available
          </div>
        ) : (
          rows.map((group) => (
            <div key={group.id} className="rounded-md bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-md font-semibold text-[#282828]">
                  {group.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-[#282828]">
                  <span className="text-md font-semibold text-[#16284F]">
                    {group.students.toLocaleString("en-IN")}
                  </span>
                  <span>Students</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-[#E6FBEA] p-3">
                  <p className="text-sm font-medium text-[#43C17A]">
                    Collected
                  </p>
                  <p className="text-md font-semibold text-[#43C17A]">
                    {formatShortCurrency(group.collected)}
                  </p>
                </div>
                <div className="rounded-md bg-[#FFE5E7] p-3">
                  <p className="text-sm font-medium text-[#FF2A2A]">
                    Pending
                  </p>
                  <p className="text-md font-semibold text-[#FF2A2A]">
                    {formatShortCurrency(group.pending)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
