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
  const t = useTranslations("Dashboard.parent"); // Hook
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
      <div className="bg-white h-[200px] w-[32%] rounded-lg p-4 flex flex-col gap-4 shadow-md animate-pulse">
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
    <div className="bg-white h-[200px] w-[32%] rounded-lg p-2 flex flex-col gap-2 shadow-md">
      <div className="w-[75%] h-[20%] flex items-center justify-between">
        <div className="bg-[#E1F4E8] rounded-lg p-1">
          <Clipboard size={22} weight="fill" color="#6ECC90" />
        </div>
        <h4 className="text-lg font-medium text-[#282828]">
          {t("Assignments")}
        </h4>
      </div>

      <div className="w-full h-[70%]">
        <div className="h-[80%] flex items-center justify-center">
          <div className="bg-[#E6E3FF] rounded-full h-14 w-14 flex items-center justify-center">
            <p className="text-[#604DDC] font-semibold text-sm">
              {stats.completed}/{stats.total}
            </p>
          </div>
        </div>
        <div className="h-[30%] flex flex-col justify-start gap-1">
          <h5 className="text-[#16284F] text-xs font-medium">
            {t("Next Date:")}
            <span className="text-[#604DDC] ml-1">{stats.nextDate}</span>
          </h5>
          <div className="bg-[#DDDDDD] rounded-full w-full h-4 overflow-hidden">
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
