"use client";

import Image from "next/image";
import { FilePdf, ListChecks } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { issueRows } from "../data";
import type { CategoryIssue, IssueScope } from "../types";

function StudentCell({ issue }: { issue: CategoryIssue }) {
  return (
    <div className="flex min-w-[230px] items-center gap-3 text-left">
      <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
        <Image
          src={issue.image}
          alt={issue.student}
          height={40}
          width={40}
          className="scale-90 object-cover"
        />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-[#282828]">
          {issue.student}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium text-[#282828]">
          {issue.meta}
        </p>
      </div>
    </div>
  );
}

function IssueCell({ issue }: { issue: CategoryIssue }) {
  return (
    <div className="min-w-[300px] max-w-[360px] text-left">
      <p className="truncate text-[13px] font-bold text-[#282828]">
        {issue.title}
      </p>
      <p className="mt-2 truncate text-[11px] font-medium text-[#282828]">
        {issue.description}
      </p>
    </div>
  );
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-[120px] justify-center rounded-full bg-[#E8F3EC] px-3 py-1 text-[12px] font-bold text-[#557064]">
      {label}
    </span>
  );
}

function PriorityPill({ label }: { label: CategoryIssue["priority"] }) {
  return (
    <span
      className={`inline-flex min-w-[90px] justify-center rounded-full px-3 py-1 text-[12px] font-bold ${
        label === "High"
          ? "bg-[#FFE0E0] text-[#FF1F1F]"
          : "bg-[#FFF3E2] text-[#FFB45C]"
      }`}
    >
      {label}
    </span>
  );
}

function EvidencePill({ label }: { label: string }) {
  return (
    <button
      title={label}
      className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-[#E8F3EC] px-3 py-1 text-[12px] font-bold text-[#16284F]"
    >
      <FilePdf size={18} weight="fill" className="text-[#FF2525]" />
      View PDF
    </button>
  );
}

export default function RecentIssuesTable({ scope }: { scope: IssueScope }) {
  const columns =
    scope === "college"
      ? [
          { title: "Student", key: "subject" },
          { title: "Issue", key: "issue" },
          { title: "Category", key: "category" },
          { title: "Priority", key: "priority" },
          { title: "Evidence", key: "evidence" },
        ]
      : [
          { title: "Student", key: "subject" },
          { title: "Issue", key: "issue" },
          { title: "Block", key: "block" },
          { title: "Building / Room", key: "room" },
          { title: "Category", key: "category" },
          { title: "Evidence", key: "evidence" },
        ];

  const tableData = issueRows.map((issue) => ({
    subject: <StudentCell issue={issue} />,
    issue: <IssueCell issue={issue} />,
    block: (
      <span className="block min-w-[70px] text-[13px] font-bold text-[#282828]">
        {issue.block}
      </span>
    ),
    room: (
      <span className="block min-w-[130px] text-[13px] font-bold text-[#282828]">
        {issue.room}
      </span>
    ),
    category: <CategoryPill label={issue.category} />,
    priority: <PriorityPill label={issue.priority} />,
    evidence: <EvidencePill label={issue.evidence} />,
  }));

  return (
    <section className="flex min-h-[500px] flex-1 flex-col rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#43C17A]">
            <ListChecks size={18} weight="fill" />
          </span>
          <div>
            <h2 className="text-[13px] font-bold text-[#282828]">
              Recent Issues
            </h2>
            <p className="text-[11px] font-medium text-[#282828]">
              Latest reported complaints across{" "}
              {scope === "college" ? "College" : "Hostel"}
            </p>
          </div>
        </div>
        <button className="text-[12px] font-bold text-[#16284F] underline underline-offset-2">
          View All
        </button>
      </div>
      <div className="min-h-0 flex-1 [&>div]:h-full">
        <TableComponent
          columns={columns}
          tableData={tableData}
          height="100%"
          stickyHeader={false}
          fillHeight
          tableClassName={
            scope === "college" ? "min-w-[1180px]" : "min-w-[1160px]"
          }
        />
      </div>
    </section>
  );
}
