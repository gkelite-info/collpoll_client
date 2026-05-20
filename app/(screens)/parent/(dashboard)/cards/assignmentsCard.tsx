"use client";

import { useEffect, useState } from "react";
import { Clipboard } from "@phosphor-icons/react";
import { useParent } from "@/app/utils/context/parent/useParent";
import { fetchChildAssignmentStats } from "@/lib/helpers/parent/dashboard/fetchChildAssignments";
import { useTranslations } from "next-intl";

type AssignmentProps = {
  completed: number;
  total: number;
  nextDate: string;
};

export default function AssignMentCard() {
  const { childUserId, loading: parentLoading } = useParent();
  const t = useTranslations("Dashboard.parent");
  const [stats, setStats] = useState<AssignmentProps>({
    completed: 0,
    total: 0,
    nextDate: "N/A",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (childUserId) {
        const data = await fetchChildAssignmentStats(childUserId);
        setStats(data);
      }
      setIsFetching(false);
    }
    if (!parentLoading) {
      loadStats();
    }
  }, [childUserId, parentLoading]);

  if (parentLoading || isFetching) {
    return (
      <div className="bg-white h-[180px] lg:h-[200px] w-full lg:w-[32%] rounded-lg p-4 flex flex-col gap-4 shadow-md animate-pulse">
        <div className="w-[75%] h-[20%] flex items-center justify-between">
          <div className="bg-gray-200 rounded-lg h-8 w-8"></div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-4 mt-2">
          <div className="bg-gray-200 rounded-full h-14 w-14 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mt-2"></div>
          <div className="h-4 bg-gray-200 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  const percentage =
    stats.total > 0
      ? Math.min(Math.round((stats.completed / stats.total) * 100), 100)
      : 0;

  return (
    <div className="bg-white h-[180px] lg:h-[200px] w-full lg:w-[32%] rounded-lg p-2.5 lg:p-2 flex flex-col gap-2 shadow-md">
      <div className="w-full lg:w-[75%] h-[20%] flex items-center justify-start lg:justify-between gap-2">
        <div className="bg-[#E1F4E8] rounded-lg p-1.5 lg:p-1 shrink-0">
          <Clipboard
            className="w-4 h-4 lg:w-[22px] lg:h-[22px]"
            weight="fill"
            color="#6ECC90"
          />
        </div>
        <h4 className="text-[13px] lg:text-lg font-medium text-[#282828] truncate pr-1">
          {t("Assignments")}
        </h4>
      </div>

      <div className="w-full h-[80%] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#E6E3FF] rounded-full h-12 w-12 lg:h-14 lg:w-14 flex items-center justify-center">
            <p className="text-[#604DDC] font-semibold text-xs lg:text-sm">
              {stats.completed}/{stats.total}
            </p>
          </div>
        </div>
        <div className="h-[35%] lg:h-[30%] flex flex-col justify-end gap-1.5 lg:gap-1 pb-1">
          <h5 className="text-[#16284F] text-[10px] lg:text-xs font-medium truncate">
            {t("Next Date:")}
            <span className="text-[#604DDC] ml-1">{stats.nextDate}</span>
          </h5>
          <div className="bg-[#DDDDDD] rounded-full w-full h-3 lg:h-4 overflow-hidden shrink-0">
            <div
              className="bg-[#A2D884] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
