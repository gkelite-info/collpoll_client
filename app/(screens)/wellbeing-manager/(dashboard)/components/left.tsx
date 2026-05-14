"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { CalendarBlank, CaretDown, ListChecks, Siren } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useUser } from "@/app/utils/context/UserContext";
import {
  managerAnnouncements,
  managerCategories,
  managerFilters,
  managerIssueStats,
  managerRecentIssues,
  urgentIssues,
} from "../data";
import ManagerDashboardCard from "./ManagerDashboardCard";

const ManagerIssueDonut = dynamic(() => import("./ManagerIssueDonut"), {
  ssr: false,
  loading: () => <DonutFallback />,
});

const toneClasses = {
  violet: "bg-[#E6DBFF] text-[#7C3AED]",
  rose: "bg-[#FFE8E8] text-[#FF1F1F]",
  amber: "bg-[#FFEBD4] text-[#F59E0B]",
  emerald: "bg-[#DCECE5] text-[#27A966]",
};

function DonutFallback() {
  return (
    <div className="mt-2 flex min-h-[170px] items-center justify-center gap-4">
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
  const displayName = fullName || "Sameeksha";
  const avatarImage = gender === "Male" ? "/w-m-m.png" : "/w-m-f.png";
  const bgBanner = "/dashboard-banner-bg.png";

  return (
    <div
      className="relative h-[170px] w-full rounded-2xl shadow-sm"
      style={{
        backgroundImage: `url(${bgBanner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 flex h-full items-center px-8">
        <div className="flex max-w-[65%] flex-col gap-2">
          <h1 className="mt-3 text-lg font-medium leading-tight text-[#111827]">
            Welcome back,{" "}
            <span className="text-lg font-bold leading-tight text-[#19A65F]">
              {loading ? "Manager" : displayName}
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-[12px] font-medium leading-5 text-[#111827]">
            Manage and resolve student issues efficiently.
            <br />
            Monitor complaints, prioritize urgent cases, and ensure timely
            resolution of hostel and campus concerns.
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
              alt="Wellbeing manager"
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

function IssueStatTile({ item }: { item: (typeof managerIssueStats)[number] }) {
  const Icon = item.icon;

  return (
    <div className={`rounded-md p-3 ${toneClasses[item.tone as keyof typeof toneClasses]}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
        <Icon size={17} weight="fill" />
      </span>
      <p className="mt-5 text-lg font-bold leading-6 text-[#282828]">
        {item.value}
      </p>
      <p className="mt-1 text-[12px] font-medium leading-4 text-[#282828]">
        {item.label}
      </p>
    </div>
  );
}

function CategoryBreakdown() {
  const max = Math.max(...managerCategories.map((item) => item.value));

  return (
    <ManagerDashboardCard className="min-h-[250px] overflow-hidden">
      <h3 className="mb-3 text-sm font-bold text-[#282828]">
        Issues Category Breakdown
      </h3>
      <div className="flex h-[195px] items-end gap-4 pl-1">
        <div className="flex h-full shrink-0 flex-col justify-between pb-7 text-[12px] font-medium text-[#282828]">
          {[60, 50, 40, 30, 20, 10, 0].map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="grid h-full flex-1 grid-cols-5 items-end gap-3">
          {managerCategories.map((item) => (
            <div
              key={item.name}
              className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
            >
              <div className="flex flex-1 items-end">
                <div
                  className="mx-auto min-h-2 w-[40px] rounded-t-md bg-[#43C17A]"
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
    </ManagerDashboardCard>
  );
}

function UrgentIssues() {
  return (
    <ManagerDashboardCard>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE8E8] text-[#FF1F1F]">
            <Siren size={18} weight="fill" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#282828]">Urgent Issues</h3>
            <p className="text-[12px] font-medium text-[#4B5563]">
              Immediate Action Required
            </p>
          </div>
        </div>
        <button className="text-[12px] font-bold text-[#16284F] underline underline-offset-2">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {urgentIssues.map((issue) => (
          <div
            key={issue.student}
            className="flex items-center gap-3 rounded-md border-l-4 border-[#FF1F1F] bg-[#FFECEC] p-3"
          >
            <Image
              src={issue.studentImage}
              alt={issue.student}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div className="min-w-0 flex-[1.2]">
              <p className="text-[12px] font-bold text-[#282828]">
                {issue.student}
              </p>
              <p className="text-[10px] font-medium text-[#282828]">
                {issue.meta}
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#282828]">
                {issue.issue}
              </p>
              <span className="mt-1 inline-flex rounded-full bg-[#DCEBFF] px-3 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                {issue.category}
              </span>
            </div>
            <div className="flex flex-col gap-2 text-[10px]">
              <span className="w-fit rounded bg-[#FFCDD2] px-2 py-0.5 font-bold text-[#FF1F1F]">
                {issue.priority}
              </span>
              <span className="text-[#4B5563]">{issue.time}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="text-[11px] font-bold text-[#16284F] underline underline-offset-2">
                View
              </button>
              <button className="flex h-7 items-center gap-1 rounded-md bg-[#FDBA74] px-3 text-[11px] font-bold text-white">
                {issue.status}
                <CaretDown size={12} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ManagerDashboardCard>
  );
}

function RecentIssuesTable() {
  const columns = [
    { title: "Student", key: "subject" },
    { title: "Issue", key: "issue" },
    { title: "Category", key: "category" },
    { title: "Priority", key: "priority" },
  ];

  const tableData = managerRecentIssues.map((issue) => ({
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
    category: (
      <span className="rounded-full bg-[#E8F8EF] px-3 py-1 text-[10px] font-semibold text-[#3E8F61]">
        {issue.category}
      </span>
    ),
    priority: (
      <span className="rounded-full bg-[#FFF7E6] px-3 py-1 text-[10px] font-semibold text-[#F59E0B]">
        {issue.priority}
      </span>
    ),
  }));

  return (
    <ManagerDashboardCard className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#43C17A]">
            <ListChecks size={18} weight="fill" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#282828]">Recent Issues</h3>
            <p className="text-[12px] font-medium text-[#4B5563]">
              Latest reported complaints across campus
            </p>
          </div>
        </div>
        <button className="text-[12px] font-bold text-[#16284F] underline underline-offset-2">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          <TableComponent
            columns={columns}
            tableData={tableData}
            height="310px"
            stickyHeader={false}
          />
        </div>
      </div>
    </ManagerDashboardCard>
  );
}

export default function WellbeingManagerLeft() {
  return (
    <div className="w-full p-1 md:w-[68%] md:p-2 lg:w-[68%]">
      <WelcomePanel />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {managerFilters.issueTypes.map((filter) => (
            <FilterPill key={filter} label={filter} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <DatePill label="04/06/2026" />
          <DatePill label={managerFilters.months[0]} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {managerIssueStats.map((item) => (
          <IssueStatTile key={item.label} item={item} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ManagerDashboardCard>
          <h3 className="mb-3 text-sm font-bold text-[#282828]">
            Today Hostel Issue Status Distribution
          </h3>
          <ManagerIssueDonut />
        </ManagerDashboardCard>
        <CategoryBreakdown />
      </div>

      <div className="mt-3">
        <UrgentIssues />
      </div>

      <div className="mt-3">
        <RecentIssuesTable />
      </div>

      <div className="mt-3 grid gap-3 md:hidden">
        <WorkWeekCalendar style="" />
        <AnnouncementsCard
          announceCard={managerAnnouncements}
          height="60vh"
          readOnly
        />
      </div>
    </div>
  );
}
