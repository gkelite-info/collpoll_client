"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import TopCards from "./TopCards";
import IssueForm from "./IssueForm";
import IssueList from "./IssueList";
import { useUser } from "@/app/utils/context/UserContext";
import type { StudentWellbeingIssueListItem } from "@/lib/helpers/wellbeingSupportIssues/types";

export function WellbeingPageShimmer() {
  return (
    <div className="flex min-h-screen flex-col p-2 py-7">
      <section className="mx-auto flex w-full flex-1 flex-col rounded-xl bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-10 lg:px-10">
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

        <div className="mx-auto mt-8 flex min-h-[600px] w-full max-w-2xl animate-pulse flex-col overflow-hidden rounded-2xl bg-[#E8E8E8] shadow-sm">
          <div className="h-52 bg-gray-200" />
          <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <div className="mb-2 h-4 w-28 rounded bg-gray-300" />
                <div className="h-10 rounded border border-gray-200 bg-gray-100" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <div className="mb-2 h-4 w-28 rounded bg-gray-300" />
              <div className="h-28 rounded border border-gray-200 bg-gray-100" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function WellbeingContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { loading } = useUser();
  const [editingIssue, setEditingIssue] =
    useState<StudentWellbeingIssueListItem | null>(null);

  if (loading) {
    return <WellbeingPageShimmer />;
  }

  return (
    <div className="flex min-h-screen flex-col p-2 py-7">
      <section className="mx-auto flex w-full flex-1 flex-col rounded-xl bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-10 lg:px-10">
        <TopCards />
        {currentTab && !editingIssue ? (
          <IssueList onEditIssue={setEditingIssue} />
        ) : (
          <IssueForm
            editingIssue={editingIssue}
            onCancelEdit={() => setEditingIssue(null)}
            onEditComplete={() => setEditingIssue(null)}
          />
        )}
      </section>
    </div>
  );
}
