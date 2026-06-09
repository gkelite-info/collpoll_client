"use client";

import { Warning } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { wellbeingCards } from "../data";
import CardComponent from "@/app/utils/card";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchStudentWellbeingIssueCounts } from "@/lib/helpers/wellbeingSupportIssues/wellbeingSupportIssueAPI";
import type { StudentWellbeingIssueCounts } from "@/lib/helpers/wellbeingSupportIssues/types";

const defaultCounts: StudentWellbeingIssueCounts = {
  raised: 0,
  pending: 0,
  resolved: 0,
  rejected: 0,
};

const formatCount = (count: number, pad = false) =>
  pad ? String(count).padStart(2, "0") : String(count);

function TopCardsShimmer() {
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-28 w-full animate-pulse rounded-lg bg-gray-100 p-3 shadow-sm"
        >
          <div className="mb-4 h-8 w-9 rounded-sm bg-gray-200" />
          <div className="h-5 w-10 rounded bg-gray-200" />
          <div className="mt-3 h-3 w-20 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function TopCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "";
  const { userId, collegeId } = useUser();
  const [counts, setCounts] = useState<StudentWellbeingIssueCounts>(defaultCounts);
  const [loading, setLoading] = useState(false);

  const loadCounts = useCallback(async () => {
    if (!userId || !collegeId) return;

    setLoading(true);
    try {
      const nextCounts = await fetchStudentWellbeingIssueCounts(userId, collegeId);
      setCounts(nextCounts);
    } catch {
      setCounts(defaultCounts);
    } finally {
      setLoading(false);
    }
  }, [userId, collegeId]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    window.addEventListener("wellbeing-issue-created", loadCounts);
    return () => window.removeEventListener("wellbeing-issue-created", loadCounts);
  }, [loadCounts]);

  const handleCardClick = (id: string) => {
    // If clicking the currently active tab, maybe unselect it to go back to the form?
    // Or just always navigate to it. The requirement implies clicking switches to list.
    const params = new URLSearchParams(searchParams);
    params.set("tab", id);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const dynamicCards = wellbeingCards.map((card) => ({
    ...card,
    value: loading
      ? "--"
      : card.id === "raised"
        ? formatCount(counts.raised)
        : formatCount(counts[card.id as keyof StudentWellbeingIssueCounts], true),
  }));

  if (loading) {
    return <TopCardsShimmer />;
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0 cursor-pointer">
      {dynamicCards.map((card) => {
        const isActive = currentTab === card.id;
        
        return (
          <div key={card.id} onClick={() => handleCardClick(card.id)}>
            <CardComponent
              style={`h-28 w-full transition-all duration-200 hover:scale-105 ${
                isActive ? "shadow-md ring-2 ring-offset-2 ring-opacity-50" : "shadow-sm"
              }`}
              inlineStyle={{ 
                backgroundColor: isActive ? card.iconColor : card.bg,
                borderColor: isActive ? card.iconColor : "transparent",
              }}
              icon={
                <Warning
                  size={18}
                  weight="fill"
                  style={{ color: isActive ? card.iconColor : card.iconColor }}
                />
              }
              value={
                <span style={{ color: isActive ? "#FFFFFF" : card.iconColor }} className="font-bold">
                  {card.value}
                </span>
              }
              label={
                <span style={{ color: isActive ? "#FFFFFF" : "inherit" }}>
                  {card.label}
                </span>
              }
              iconBgColor="#FFFFFF"
              textSize="text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}
