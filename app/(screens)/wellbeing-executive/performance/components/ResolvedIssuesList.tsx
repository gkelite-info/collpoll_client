"use client";

import { CaretDown, FilePdf, ListDashes } from "@phosphor-icons/react";
import { useState } from "react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import type { Executive, Issue } from "../types";

const RESOLVED_ISSUES_PER_PAGE = 10;

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#43C17A]">
            <ListDashes size={16} weight="fill" />
          </span>
          <span className="text-[14px] font-bold text-[#282828]">
            Issue Details
          </span>
        </div>
        <button className="flex h-7 items-center gap-1 rounded bg-[#43C17A] px-3 text-[12px] font-bold text-white">
          Resolved
          <CaretDown size={12} weight="bold" />
        </button>
      </div>
      <h3 className="mb-3 text-[15px] font-bold text-[#282828]">
        {issue.title}
      </h3>
      <div className="mb-3 flex flex-wrap gap-5">
        {[
          ["Category", issue.category],
          ["Priority", issue.priority],
          ["Date Reported", issue.date],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#16284F]">
              {label} :
            </span>
            <span className="rounded border border-[#D7D7D7] px-3 py-1 text-[12px] font-semibold text-[#282828]">
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="mb-3 grid gap-3 text-[#767676] sm:grid-cols-[100px_minmax(0,1fr)]">
        <span className="text-[12px] font-bold text-[#16284F]">
          Description :
        </span>
        <p className="text-[12px] font-normal leading-snug">
          {issue.description}
        </p>
      </div>
      <div className="grid gap-3 text-[#282828] sm:grid-cols-[100px_minmax(0,1fr)]">
        <span className="text-[12px] font-bold text-[#16284F]">
          Attachments :
        </span>
        <div className="flex flex-wrap gap-3">
          {issue.attachments.map((file) => (
            <button
              key={file.name}
              className="flex min-w-[180px] items-center gap-3 rounded border border-[#D7D7D7] bg-white px-3 py-2 text-left"
            >
              <FilePdf size={20} weight="fill" className="text-[#FF2525]" />
              <span>
                <span className="block text-[12px] font-semibold">
                  {file.name}
                </span>
                <span className="block text-[10px] text-[#525252]">
                  {file.size}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ResolvedIssuesList({
  executive,
}: {
  executive: Executive;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(executive.issues.length / RESOLVED_ISSUES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleIssues = executive.issues.slice(
    (safeCurrentPage - 1) * RESOLVED_ISSUES_PER_PAGE,
    safeCurrentPage * RESOLVED_ISSUES_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-3">
      {executive.issues.length > 0 ? (
        <>
          {visibleIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={executive.issues.length}
            itemsPerPage={RESOLVED_ISSUES_PER_PAGE}
            onPageChange={setCurrentPage}
            roundedBottom="rounded-lg shadow-sm"
          />
        </>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center text-[13px] font-semibold text-gray-400 shadow-sm">
          No resolved issues found for this executive.
        </div>
      )}
    </div>
  );
}
