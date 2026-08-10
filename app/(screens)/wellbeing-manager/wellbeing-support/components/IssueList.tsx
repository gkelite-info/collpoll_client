"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import IssueCard from "@/app/(screens)/college-admin/wellbeing/components/IssueCard";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import IssueCardShimmer from "@/app/utils/shimmers/IssueCardShimmer";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchManagerWellbeingIssues } from "@/lib/helpers/wellbeingSupportIssues/wellbeingSupportIssueAPI";
import type { ManagerWellbeingIssueListItem, StudentWellbeingIssueTab } from "@/lib/helpers/wellbeingSupportIssues/types";

const isTab = (value: string): value is StudentWellbeingIssueTab =>
  ["raised", "pending", "resolved", "rejected"].includes(value);

export default function IssueList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { collegeId } = useUser();
  const tabValue = searchParams.get("tab") || "raised";
  const tab = isTab(tabValue) ? tabValue : "raised";
  const page = Number(searchParams.get("page")) || 1;
  const limit = 3;
  const [issues, setIssues] = useState<ManagerWellbeingIssueListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadIssues = useCallback(async () => {
    if (!collegeId) return;
    setLoading(true);
    try {
      const result = await fetchManagerWellbeingIssues({ collegeId, page, limit, tab });
      setIssues(result.data);
      setTotal(result.totalCount);
    } catch {
      setIssues([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [collegeId, page, tab]);

  useEffect(() => { void Promise.resolve().then(loadIssues); }, [loadIssues]);
  useEffect(() => {
    window.addEventListener("wellbeing-issue-created", loadIssues);
    return () => window.removeEventListener("wellbeing-issue-created", loadIssues);
  }, [loadIssues]);

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mx-auto mt-6 flex w-full max-w-3xl flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between px-2">
        <h2 className="text-lg font-bold capitalize text-[#16284F] sm:text-xl">{tab} Issues</h2>
        <button type="button" onClick={() => router.push("?")} className="cursor-pointer rounded-lg bg-[#43C17A] px-4 py-2 font-medium text-white hover:bg-[#36a666]">+ Raise Issue</button>
      </div>
      {loading ? <IssueCardShimmer /> : issues.length ? issues.map((issue) => <IssueCard key={issue.id} issue={issue} />) : <div className="flex min-h-[500px] items-center justify-center text-gray-500">No issues found.</div>}
      <Pagination currentPage={page} totalItems={total} itemsPerPage={limit} onPageChange={changePage} />
    </div>
  );
}
