"use client";

import { Warning } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CardComponent from "@/app/utils/card";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchManagerWellbeingIssueCounts } from "@/lib/helpers/wellbeingSupportIssues/wellbeingSupportIssueAPI";
import type { StudentWellbeingIssueCounts } from "@/lib/helpers/wellbeingSupportIssues/types";

const cards = [
  { id: "raised", label: "Total Raised", bg: "#DDD4FF", iconColor: "#6F4EF6" },
  { id: "pending", label: "In Pending", bg: "#FFE7C9", iconColor: "#FF9F3F" },
  { id: "resolved", label: "Resolved", bg: "#DDF3E7", iconColor: "#009B55" },
  { id: "rejected", label: "Rejected", bg: "#FFDCDD", iconColor: "#FF2A2A" },
] as const;
const emptyCounts: StudentWellbeingIssueCounts = { raised: 0, pending: 0, resolved: 0, rejected: 0 };

export default function TopCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collegeId } = useUser();
  const [counts, setCounts] = useState(emptyCounts);
  const [loading, setLoading] = useState(true);
  const currentTab = searchParams.get("tab") || "";

  const loadCounts = useCallback(async () => {
    if (!collegeId) return;
    setLoading(true);
    try {
      setCounts(await fetchManagerWellbeingIssueCounts(collegeId));
    } catch {
      setCounts(emptyCounts);
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  useEffect(() => { void Promise.resolve().then(loadCounts); }, [loadCounts]);
  useEffect(() => {
    window.addEventListener("wellbeing-issue-created", loadCounts);
    return () => window.removeEventListener("wellbeing-issue-created", loadCounts);
  }, [loadCounts]);

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-4">
      {cards.map((card) => {
        const active = currentTab === card.id;
        return (
          <button key={card.id} type="button" onClick={() => router.push(`?tab=${card.id}&page=1`)} className="cursor-pointer text-left">
            <CardComponent
              style={`h-28 w-full transition-all hover:scale-105 ${active ? "ring-2 ring-offset-2" : "shadow-sm"}`}
              inlineStyle={{ backgroundColor: active ? card.iconColor : card.bg, borderColor: card.iconColor }}
              icon={<Warning size={18} weight="fill" style={{ color: card.iconColor }} />}
              value={<span className="font-bold" style={{ color: active ? "#fff" : card.iconColor }}>{loading ? "--" : String(counts[card.id]).padStart(card.id === "raised" ? 1 : 2, "0")}</span>}
              label={<span style={{ color: active ? "#fff" : "inherit" }}>{card.label}</span>}
              iconBgColor="#FFFFFF"
              textSize="text-sm"
            />
          </button>
        );
      })}
    </div>
  );
}
