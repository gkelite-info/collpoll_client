"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import TopCards from "./TopCards";
import IssueForm from "./IssueForm";
import IssueList from "./IssueList";
import type { StudentWellbeingIssueListItem } from "@/lib/helpers/wellbeingSupportIssues/types";

function WellbeingPageShimmer() {
  return (
    <div className="flex min-h-screen flex-col p-2 py-7">
      <section className="mx-auto flex w-full flex-1 flex-col rounded-xl bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="mx-auto mt-8 h-[600px] w-full max-w-2xl animate-pulse rounded-2xl bg-gray-100" />
      </section>
    </div>
  );
}

export default function WellbeingContent() {
  const searchParams = useSearchParams();
  const { loading } = useUser();
  const [editingIssue, setEditingIssue] =
    useState<StudentWellbeingIssueListItem | null>(null);
  const currentTab = searchParams.get("tab");

  if (loading) return <WellbeingPageShimmer />;

  return (
    <div className="flex min-h-screen flex-col p-2 py-7">
      <section className="mx-auto flex w-full flex-1 flex-col rounded-xl bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-10 lg:px-10">
        <TopCards />
        {currentTab && !editingIssue ? (
          <IssueList />
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
