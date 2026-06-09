"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { BuildingIcon, CalendarBlank, CaretDown } from "@phosphor-icons/react";
import { MdPictureAsPdf } from "react-icons/md";
import TableComponent from "@/app/utils/table/table";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useUser } from "@/app/utils/context/UserContext";
import {
  categories,
  collegeIssues,
  executives,
  hostelIssues,
  issueStats,
  registeredIssueScopes,
  wellbeingAnnouncements,
  wellbeingFilters,
} from "../data";
import type {
  WellbeingExecutiveIssue,
  WellbeingExecutiveIssueScope,
} from "../data";
import WellbeingDashboardCard from "./WellbeingDashboardCard";
import { Avatar } from "@/app/utils/Avatar";

const IssueStatusDonut = dynamic(() => import("./IssueStatusDonut"), {
  ssr: false,
  loading: () => <DonutFallback />,
});

const toneClasses = {
  violet: "bg-[#F0E9FF] text-[#7C3AED]",
  rose: "bg-[#FFE8EC] text-[#F43F5E]",
  amber: "bg-[#FFF0D9] text-[#F59E0B]",
  emerald: "bg-[#E3F8EC] text-[#27A966]",
};

function DonutFallback() {
  return (
    <div className="mt-6 flex min-h-[180px] items-center justify-center gap-4">
      <div className="h-[150px] w-[150px] shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex w-[105px] flex-col gap-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function FilterPill({ label }: { label: string }) {
  return (
    <button className="flex h-8 min-w-[125px] items-center justify-between gap-2 rounded-md bg-[#16284F] px-3 text-[12px] font-semibold text-white shadow-sm">
      <span>{label}</span>
      <CaretDown size={16} weight="bold" />
    </button>
  );
}

function DatePill({ label }: { label: string }) {
  return (
    <button className="flex h-8 items-center gap-2 rounded-full bg-[#43C17A] px-3 text-[12px] font-bold text-white shadow-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#43C17A]">
        <CalendarBlank size={12} weight="fill" />
      </span>
      <span>{label}</span>
      <CaretDown size={14} weight="bold" />
    </button>
  );
}

function WelcomePanel() {
  const { fullName, gender, loading, wellBeingCategoryName } = useUser();
  const displayName = fullName || "Navegam";
  const avatarImage = gender === "Female" ? "/w-e-f.png" : "/w-e-m.png";
  const bgBanner = "/dashboard-banner-bg.png";
  const categoryLabel = wellBeingCategoryName?.trim();

  return (
    <div
      style={{
        backgroundImage: `url(${bgBanner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="relative h-42.5 w-full rounded-2xl shadow-sm"
    >
      <div className="relative z-10 flex h-full items-center px-8">
        <div className="flex max-w-[65%] flex-col gap-2">
          <h1 className="mt-3 text-lg font-medium leading-tight text-[#111827]">
            Welcome back,{" "}
            <span className="text-lg font-bold leading-tight text-[#19A65F]">
              {loading ? "Executive" : displayName}
            </span>
            {!loading && categoryLabel ? (
              <span className="ml-2 align-baseline text-[15px] font-bold leading-tight text-[#16284F]">
                ({categoryLabel})
              </span>
            ) : null}
          </h1>
          <p className="mt-3 max-w-lg text-[12px] font-semibold leading-5 text-[#111827]">
            Track and manage issues effectively. Your primary responsibility is
            resolving hostel related complaints.
          </p>
        </div>

        {gender ? (
          <div
            className={`absolute bottom-0 max-sm:-right-4 md:right-3 lg:right-10 ${gender === "Male" ? "max-sm:h-[102%] md:h-[104%]" : "h-[110%] max-[340px]:w-[50%]"
              } z-10 w-[180px]`}
          >
            <Image
              src={avatarImage}
              alt="Wellbeing executive"
              fill
              className="pointer-events-none object-contain object-bottom"
              priority
              sizes="180px"
            />
          </div>
        ) : null}
      </div>

      <svg
        className="absolute bottom-0 right-0 z-0 h-full w-auto"
        width="186"
        height="170"
        viewBox="0 0 186 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M173.532 0C180.146 0 185.512 5.35094 185.532 11.9644L185.955 154.896C185.98 163.197 179.257 169.94 170.955 169.94H51.5453C46.2115 169.775 40.1483 169.848 34.1023 169.92C7.43518 170.24 -18.9265 170.556 18.8128 150.447C28.6823 144.861 52.2795 137.844 67.7118 154.469C74.142 158.938 101.032 145.673 130.82 112.96C139.793 102.681 157.737 73.8116 157.737 40.5622C156.99 31.1773 155.943 10.7256 157.737 0H171.9H173.532Z"
          fill="#BCE6D0"
        />
      </svg>
    </div>
  );
}

function IssueStatTile({ item }: { item: (typeof issueStats)[number] }) {
  const Icon = item.icon;

  return (
    <div
      className={`rounded-md p-3 ${item.tone === "violet"
        ? "bg-[#E6DBFF]"
        : item.tone === "rose"
          ? "bg-[#FFE8E8]"
          : item.tone === "amber"
            ? "bg-[#FFEBD4]"
            : "bg-[#DFF8EA]"
        }`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white ${toneClasses[item.tone as keyof typeof toneClasses]
            }`}
        >
          <Icon size={16} weight="fill" />
        </span>
        <div>
          <p className="text-[13px] font-bold leading-5 text-[#282828]">
            {item.value}
          </p>
          <p className="mt-1 text-[10px] font-medium leading-4 text-[#282828]">
            {item.label}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryChart() {
  const max = Math.max(...categories.map((item) => item.value));

  return (
    <WellbeingDashboardCard className="min-h-[250px] overflow-hidden">
      <h3 className="mb-4 text-sm font-bold text-[#282828]">Categories</h3>
      <div className="overflow-x-auto pb-1">
        <div className="flex h-[195px] min-w-full items-end gap-4 pl-2 pr-2">
          <div className="flex h-full shrink-0 flex-col justify-between pb-7 text-[12px] font-medium text-[#282828]">
            {[50, 40, 30, 20, 10, 0].map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="grid h-full flex-1 grid-cols-5 items-end gap-3">
            {categories.map((item) => (
              <div
                key={item.name}
                className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
              >
                <div className="flex flex-1 items-end">
                  <div
                    className="mx-auto min-h-2 w-[36px] rounded-t-md bg-[#43C17A]"
                    style={{ height: `${(item.value / max) * 100}%` }}
                  />
                </div>
                <span className="block w-full truncate text-center text-[9px] font-medium text-[#282828]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WellbeingDashboardCard>
  );
}

function ExecutiveStrip() {
  return (
    <WellbeingDashboardCard>
      <h3 className="mb-3 text-sm font-bold text-[#282828]">
        Infrastructure Executives
      </h3>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-8 px-1">
          {executives.map((executive) => (
            <div key={`${executive.name}-${executive.id}`} className="w-[130px] shrink-0 text-center">
              <div className="relative mx-auto h-[92px] w-[92px] overflow-hidden rounded-full bg-[#E8F8EF]">
                <Image
                  src={executive.image}
                  alt={executive.name}
                  fill
                  className="object-contain p-1"
                  sizes="92px"
                />
              </div>
              <p className="mt-3 truncate text-[12px] font-semibold text-[#282828]">
                {executive.name}
              </p>
              <p className="mx-auto mt-1 w-fit rounded bg-[#16284F] px-2.5 py-0.5 text-[11px] font-bold text-white">
                ID : {executive.id}
              </p>
            </div>
          ))}
        </div>
      </div>
    </WellbeingDashboardCard>
  );
}

const priorityOptions: WellbeingExecutiveIssue["priority"][] = [
  "High",
  "Urgent",
  "Medium",
  "Low",
];

function StudentIssueCell({ issue }: { issue: WellbeingExecutiveIssue }) {
  return (
    <div className="flex min-w-[220px] items-center gap-4 text-left">
      <span className="relative block h-10 w-10 shrink-0 object-cover overflow-hidden rounded-full bg-gray-100">
        <Image
          src={issue.studentImage}
          alt={issue.student}
          width={40}
          height={40}
          className="object-cover"
        />
        {/* <Avatar
        src={issue.studentImage}
        alt={issue.student}
        size={48}
      /> */}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold text-[#282828]">
          {issue.student}
        </p>
        <p className="mt-1 truncate text-[12px] font-medium text-[#282828]">
          {issue.meta}
        </p>
      </div>
    </div>
  );
}

function IssueTextCell({ issue }: { issue: WellbeingExecutiveIssue }) {
  return (
    <div className="min-w-[290px] max-w-[360px] text-left">
      <p className="truncate text-[14px] font-bold text-[#282828]">
        {issue.issue}
      </p>
      <p className="mt-2 truncate text-[12px] font-medium text-[#282828]">
        {issue.description}
      </p>
    </div>
  );
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-[150px] max-w-full justify-center rounded-full bg-[#E8F3EC] px-3 py-1 text-[12px] font-bold text-[#557064]">
      <span className="truncate">{label}</span>
    </span>
  );
}

function EvidencePill({ label }: { label: string }) {
  return (
    <button
      type="button"
      title={label}
      className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-full bg-[#E8F3EC] px-3 py-1 text-[12px] font-bold text-[#16284F]"
    >
      <MdPictureAsPdf className="shrink-0 text-[20px] text-[#FF2525]" />
      <span className="whitespace-nowrap">View PDF</span>
    </button>
  );
}

function EmptyIssueState({ scope }: { scope: WellbeingExecutiveIssueScope }) {
  return (
    <div className="flex h-[170px] items-center justify-center rounded-lg border border-dashed border-[#D6DED9] bg-white text-center">
      <p className="max-w-[260px] text-[13px] font-semibold text-[#667085]">
        No {scope} issues need attention right now.
      </p>
    </div>
  );
}

function ExecutiveIssueTableCard({
  scope,
  rows,
}: {
  scope: WellbeingExecutiveIssueScope;
  rows: WellbeingExecutiveIssue[];
}) {
  const [selectedPriority, setSelectedPriority] =
    useState<WellbeingExecutiveIssue["priority"]>("High");
  const title = scope === "college" ? "College Issues" : "Hostel Issues";
  const visibleRows = rows.filter((row) => row.priority === selectedPriority);
  const columns =
    scope === "college"
      ? [
        { title: "Student", key: "subject" },
        { title: "Issue", key: "issue" },
        { title: "Category", key: "category" },
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
  const tableData = visibleRows.map((issue) => ({
    subject: <StudentIssueCell issue={issue} />,
    issue: <IssueTextCell issue={issue} />,
    block: (
      <span className="block min-w-[70px] text-[14px] font-bold text-[#282828]">
        {issue.block}
      </span>
    ),
    room: (
      <span className="block min-w-[130px] text-[14px] font-bold text-[#282828]">
        {issue.room}
      </span>
    ),
    category: <CategoryPill label={issue.category} />,
    evidence: <EvidencePill label={issue.evidence} />,
  }));

  return (
    <WellbeingDashboardCard className="px-4 py-4">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F8EF] text-[#43C17A]">
            <BuildingIcon size={20} weight="fill" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#282828]">{title}</h3>
            <p className="mt-1 text-[12px] font-medium text-[#282828]">
              Latest reported complaints across {scope === "college" ? "College" : "Hostel"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5 self-end sm:self-auto">
          <label className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-[#282828]">Priority</span>
            <span className="relative">
              <select
                value={selectedPriority}
                onChange={(event) =>
                  setSelectedPriority(
                    event.target.value as WellbeingExecutiveIssue["priority"],
                  )
                }
                className="h-8 cursor-pointer appearance-none rounded-full bg-[#E1F6EA] py-0 pl-4 pr-9 text-[13px] font-bold text-[#43C17A] outline-none"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <CaretDown
                size={16}
                weight="bold"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A]"
              />
            </span>
          </label>
          <button className="text-[13px] font-bold text-[#16284F] underline underline-offset-2 hover:text-[#43C17A]">
            View All
          </button>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <EmptyIssueState scope={scope} />
      ) : (
        <TableComponent
          columns={columns}
          tableData={tableData}
          height="360px"
          stickyHeader={false}
          tableClassName={scope === "college" ? "min-w-[900px]" : "min-w-[1100px]"}
        />
      )}
    </WellbeingDashboardCard>
  );
}

function RecentIssuesTables() {
  const rowsByScope = {
    college: collegeIssues,
    hostel: hostelIssues,
  };

  return (
    <div className="flex flex-col gap-3">
      {registeredIssueScopes.map((scope) => (
        <ExecutiveIssueTableCard
          key={scope}
          scope={scope}
          rows={rowsByScope[scope]}
        />
      ))}
    </div>
  );
}

export default function WellbeingExecutiveLeft() {
  return (
    <div className="w-full p-1 md:w-[68%] md:p-2 lg:w-[68%]">
      <WelcomePanel />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {wellbeingFilters.issueTypes.map((filter) => (
            <FilterPill key={filter} label={filter} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <DatePill label="04/06/2026" />
          <DatePill label={wellbeingFilters.months[0]} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
        <WellbeingDashboardCard>
          <h3 className="mb-3 text-sm font-bold text-[#282828]">
            Hostel Issues
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {issueStats.map((item) => (
              <IssueStatTile key={item.label} item={item} />
            ))}
          </div>
          <IssueStatusDonut />
        </WellbeingDashboardCard>

        <div className="flex flex-col gap-3">
          <CategoryChart />
          <ExecutiveStrip />
        </div>
      </div>

      <div className="mt-3">
        <RecentIssuesTables />
      </div>
    </div>
  );
}
