"use client";

import { useSearchParams } from "next/navigation";
import TopCards from "./TopCards";
import IssueForm from "./IssueForm";
import IssueList from "./IssueList";

export default function WellbeingContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  return (
    <div className="p-2 py-7 flex flex-col min-h-screen">
      <section className="mx-auto w-full rounded-xl bg-white px-4 sm:px-8 lg:px-10 py-6 sm:py-10 shadow-sm flex flex-col flex-1">
        <TopCards />
        {currentTab ? (
          <IssueList />
        ) : (
          <IssueForm />
        )}
        
      </section>
    </div>
  );
}
