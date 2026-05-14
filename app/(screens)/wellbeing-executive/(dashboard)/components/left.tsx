"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { CalendarBlank, CaretDown, ListChecks } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useUser } from "@/app/utils/context/UserContext";
import {
  categories,
  executives,
  issueStats,
  recentIssues,
  wellbeingAnnouncements,
  wellbeingFilters,
} from "../data";
import WellbeingDashboardCard from "./WellbeingDashboardCard";

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
  const { fullName, gender, loading } = useUser();
  const displayName = fullName || "Navegam";
  const avatarImage = gender === "Female" ? "/w-e-f.png" : "/w-e-m.png";
  const bgBanner = "/dashboard-banner-bg.png";

  return (
    <div
      style={{
        backgroundImage: `url(${bgBanner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="relative h-[170px] w-full rounded-2xl shadow-sm"
    >
      <div className="relative z-10 flex h-full items-center px-8">
        <div className="flex max-w-[65%] flex-col gap-2">
          <h1 className="mt-3 text-lg font-medium leading-tight text-[#111827]">
            Welcome back,{" "}
            <span className="text-lg font-bold leading-tight text-[#19A65F]">
              {loading ? "Executive" : displayName}
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-[12px] font-semibold leading-5 text-[#111827]">
            Track and manage issues effectively. Your primary responsibility is
            resolving hostel related complaints.
          </p>
        </div>

        {gender ? (
          <div
            className={`absolute bottom-0 md:-right-3 lg:right-10 ${
              gender === "Male" ? "h-[105%]" : "h-[107%]"
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
      className={`rounded-md p-3 ${
        item.tone === "violet"
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
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white ${
            toneClasses[item.tone as keyof typeof toneClasses]
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

function RecentIssuesTable() {
  const columns = [
    { title: "Student", key: "subject" },
    { title: "Issue", key: "issue" },
    { title: "Handled By", key: "handledBy" },
  ];

  const tableData = recentIssues.map((issue) => ({
    subject: (
      <div className="flex min-w-[185px] items-center gap-2 text-left">
        <Image
          src={issue.studentImage}
          alt={issue.student}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div>
          <p className="text-[12px] font-bold text-[#111827]">
            {issue.student}
          </p>
          <p className="text-[10px] font-medium text-[#4B5563]">
            {issue.meta}
          </p>
        </div>
      </div>
    ),
    issue: (
      <div className="min-w-[260px] text-left">
        <p className="text-[12px] font-bold text-[#111827]">{issue.issue}</p>
        <p className="text-[10px] font-medium text-[#4B5563]">
          {issue.description}
        </p>
      </div>
    ),
    handledBy: (
      <div className="flex min-w-[145px] items-center justify-center gap-2">
        <Image
          src={issue.handlerImage}
          alt={issue.handledBy}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="text-[12px] font-bold text-[#111827]">
          {issue.handledBy}
        </span>
      </div>
    ),
  }));

  return (
    <WellbeingDashboardCard className="px-4 py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#43C17A]">
            <ListChecks size={18} weight="fill" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#282828]">Recent Issues</h3>
            <p className="text-[12px] font-medium text-[#4B5563]">
              Latest reported complaints across hostel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12px]">
          <button className="flex h-8 items-center gap-1 rounded-md bg-[#16284F] px-3 font-semibold text-white">
            Hostel
            <CaretDown size={13} weight="bold" />
          </button>
          <span className="font-semibold text-[#4B5563]">
            Status :{" "}
            <span className="rounded-full bg-[#E8F8EF] px-3 py-1 font-bold text-[#43C17A]">
              Pending
            </span>
          </span>
          <button className="font-bold text-[#16284F] underline underline-offset-2">
            View All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <TableComponent
            columns={columns}
            tableData={tableData}
            height="315px"
            stickyHeader={false}
          />
        </div>
      </div>
    </WellbeingDashboardCard>
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
        <WellbeingDashboardCard className="max-w-[390px]">
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
        <RecentIssuesTable />
      </div>

      <div className="mt-3 grid gap-3 md:hidden">
        <WorkWeekCalendar style="" />
        <AnnouncementsCard
          announceCard={wellbeingAnnouncements}
          height="60vh"
          readOnly
        />
      </div>
    </div>
  );
}
