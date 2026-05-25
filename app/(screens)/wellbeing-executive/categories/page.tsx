"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import {
  CaretDown,
  CheckCircle,
  FilePdf,
  ListChecks,
  Siren,
  Warning,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import WellbeingExecutiveRight from "../components/WellbeingExecutiveRight";

type IssueScope = "college" | "hostel";

type CategoryIssue = {
  id: string;
  student: string;
  meta: string;
  image: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium";
  block: string;
  room: string;
  evidence: string;
};

const IssueStatusDonut = dynamic(
  () => import("../(dashboard)/components/IssueStatusDonut"),
  {
    ssr: false,
    loading: () => (
      <div className="mt-4 flex min-h-[170px] items-center justify-center gap-4">
        <div className="h-[150px] w-[150px] animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    ),
  },
);

const issueRows: CategoryIssue[] = [
  {
    id: "CAT-1",
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/female-student.png",
    title: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "Medium",
    block: "A",
    room: "A-206",
    evidence: "projector-evidence.pdf",
  },
  {
    id: "CAT-2",
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/student-m.png",
    title: "WiFi not working in Hostel Floor 3",
    description: "Internet connectivity is very poor or unavailable.",
    category: "Infrastructure",
    priority: "Medium",
    block: "B",
    room: "A-205",
    evidence: "hostel-wifi.pdf",
  },
  {
    id: "CAT-3",
    student: "Rahul Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/rahul.png",
    title: "Noise disturbance at night",
    description: "Students in nearby classes are making noise.",
    category: "Infrastructure",
    priority: "Medium",
    block: "A",
    room: "A-203",
    evidence: "noise-report.pdf",
  },
  {
    id: "CAT-4",
    student: "Priya Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/female-fe.png",
    title: "Ground maintenance required",
    description: "Football field has uneven surface.",
    category: "Sports",
    priority: "High",
    block: "C",
    room: "B-118",
    evidence: "ground-report.pdf",
  },
  {
    id: "CAT-5",
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/female-student.png",
    title: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "Medium",
    block: "A",
    room: "A-210",
    evidence: "projector-evidence.pdf",
  },
];

const statCards = [
  {
    label: "This month Total Issues",
    value: "128",
    icon: ListChecks,
    bg: "bg-[#F0E9FF]",
    iconBg: "bg-[#E6DBFF]",
    iconColor: "text-[#7C3AED]",
  },
  {
    label: "High Priority",
    value: "18",
    icon: Siren,
    bg: "bg-[#FFE8E8]",
    iconBg: "bg-[#FFD7D7]",
    iconColor: "text-[#FF1F1F]",
  },
  {
    label: "Pending",
    value: "32",
    icon: Warning,
    bg: "bg-[#FFF0D9]",
    iconBg: "bg-[#FFE0B3]",
    iconColor: "text-[#F59E0B]",
  },
  {
    label: "Resolved",
    value: "78",
    icon: CheckCircle,
    bg: "bg-[#E3F8EC]",
    iconBg: "bg-[#CFF4E0]",
    iconColor: "text-[#27A966]",
  },
];

function ScopeSelect({
  value,
  onChange,
}: {
  value: IssueScope;
  onChange: (scope: IssueScope) => void;
}) {
  return (
    <label className="relative flex h-8 min-w-[110px] items-center rounded-md bg-[#16284F] px-3 text-[12px] font-bold text-white">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as IssueScope)}
        className="h-full w-full cursor-pointer appearance-none bg-transparent pr-7 font-bold text-white outline-none"
      >
        <option className="text-[#16284F]" value="college">
          College
        </option>
        <option className="text-[#16284F]" value="hostel">
          Hostel
        </option>
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3"
      />
    </label>
  );
}

function MonthPill() {
  return (
    <button className="flex h-8 items-center gap-2 rounded-full bg-[#43C17A] px-3 text-[12px] font-bold text-white">
      January
      <CaretDown size={14} weight="bold" />
    </button>
  );
}

function StudentFilterPill() {
  return (
    <button className="flex h-8 min-w-[90px] items-center justify-between gap-2 rounded-md bg-[#16284F] px-3 text-[12px] font-bold text-white">
      Student
      <CaretDown size={14} weight="bold" />
    </button>
  );
}

function StatCard({ item }: { item: (typeof statCards)[number] }) {
  const Icon = item.icon;

  return (
    <div className={`rounded-md p-2.5 ${item.bg}`}>
      <div className="flex items-start gap-2">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${item.iconBg} ${item.iconColor}`}
        >
          <Icon size={14} weight="fill" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-[#282828]">{item.value}</p>
          <p className="mt-0.5 text-[10px] font-medium text-[#282828]">
            {item.label}
          </p>
        </div>
      </div>
    </div>
  );
}

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
      className={`inline-flex min-w-[90px] justify-center rounded-full px-3 py-1 text-[12px] font-bold ${label === "High" ? "bg-[#FFE0E0] text-[#FF1F1F]" : "bg-[#FFF3E2] text-[#FFB45C]"
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

function RecentIssuesTable({ scope }: { scope: IssueScope }) {
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
              Latest reported complaints across {scope === "college" ? "College" : "Hostel"}
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
          tableClassName={scope === "college" ? "min-w-[1180px]" : "min-w-[1160px]"}
        />
      </div>
    </section>
  );
}

export default function CategoriesPage() {
  const [scope, setScope] = useState<IssueScope>("college");

  return (
    <main className="flex w-full flex-col gap-2 lg:min-h-screen  lg:flex-row pb-3">
      <section className="flex w-full flex-col gap-3 overflow-y-auto p-2 lg:w-[68%]">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#282828]">
            <span>Category :</span>
            <label className="relative flex h-8 min-w-[150px] items-center rounded border border-[#D7D7D7] bg-white px-3 text-[12px] font-bold text-[#282828]">
              <select className="h-full w-full cursor-pointer appearance-none bg-transparent pr-7 outline-none">
                <option>Infrastructure</option>
                <option>Sports</option>
                <option>Medical</option>
              </select>
              <CaretDown
                size={14}
                className="pointer-events-none absolute right-3"
                weight="bold"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <ScopeSelect value={scope} onChange={setScope} />
            <StudentFilterPill />
            <MonthPill />
          </div>
        </div>

        <div className="grid max-h-[245px] shrink-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)]">
          <section className="rounded-lg bg-white p-2.5 shadow-sm">
            <h1 className="mb-2 text-[14px] font-bold text-[#282828]">
              Infrastructure Issues
            </h1>
            <div className="grid grid-cols-2 gap-2">
              {statCards.map((item) => (
                <StatCard key={item.label} item={item} />
              ))}
            </div>
          </section>
          <section className="overflow-hidden rounded-lg bg-white p-2 shadow-sm [&>div]:mt-0 [&>div]:min-h-[170px]">
            <IssueStatusDonut />
          </section>
        </div>

        <RecentIssuesTable scope={scope} />
      </section>
      <WellbeingExecutiveRight />
    </main>
  );
}
