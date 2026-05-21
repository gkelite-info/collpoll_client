"use client";

import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  CaretDown,
  CheckCircle,
  ListChecks,
  Warning,
  ListChecksIcon,
  ClockCountdownIcon,
  CalendarDotsIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import WellbeingRight from "../../components/WellbeingRight";
import ManagerDashboardCard from "./ManagerDashboardCard";
import TableComponent from "@/app/utils/table/table";
import { managerRecentIssues } from "../data";

const statsConfig = [
  {
    type: "total",
    label: "This month Total Issues",
    value: 128,
    icon: ListChecksIcon,
    inactiveClass: "bg-[#E6DBFF] text-[#7C3AED]",
    activeClass: "bg-[#6C20CA] text-white",
    iconColorClass: "text-[#7C3AED]",
  },
  {
    type: "high",
    label: "High Priority",
    value: 18,
    icon: ClockCountdownIcon,
    inactiveClass: "bg-[#FFDEDE] text-[#FF1F1F]",
    activeClass: "bg-[#FF1F1F] text-white",
    iconColorClass: "text-[#FF1F1F]",
  },
  {
    type: "pending",
    label: "Pending",
    value: 32,
    icon: Warning,
    inactiveClass: "bg-[#FFEDDA] text-[#F59E0B]",
    activeClass: "bg-[#F59E0B] text-white",
    iconColorClass: "text-[#F59E0B]",
  },
  {
    type: "resolved",
    label: "Resolved",
    value: 78,
    icon: CheckCircle,
    inactiveClass: "bg-[#43C17A1A] text-[#43C17A]",
    activeClass: "bg-[#43C17A] text-white",
    iconColorClass: "text-[#43C17A]",
  },
];

const breakdownData = [
  { name: "Infrastructure", value: 42 },
  { name: "Safety", value: 52 },
  { name: "Sports", value: 34 },
  { name: "Events", value: 48 },
  { name: "Medical", value: 48 },
];

function FilterDropdown({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-[#16284F]">{label} :</span>
      <button className="flex h-8 min-w-[90px] items-center justify-between gap-2 border border-[#D7D7D7] rounded-sm cursor-pointer bg-[#F4F4F5] px-3 text-[12px] font-semibold text-[#282828] hover:bg-[#E4E4E7]">
        {value}
        <CaretDown size={14} weight="bold" className="text-[#6B7280]" />
      </button>
    </div>
  );
}

export default function AllIssuesView({ stage }: { stage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") || "total";

  const handleCardClick = (type: string) => {
    router.push(`${pathname}?view=issues&type=${type}`);
  };

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
      <span className="rounded-full bg-[#CFE2FA] px-3 py-1 text-[10px] font-semibold text-[#4A6659]">
        {issue.category}
      </span>
    ),
    priority: (
      <span
        className={`rounded-full px-3 py-1 text-[10px] font-semibold ${issue.priority === "High"
          ? "bg-[#FF2A2A14] text-[#FF2A2A]"
          : "bg-[#FFBB7030] text-[#FFBB70]"
          }`}
      >
        {issue.priority}
      </span>
    ),
  }));

  return (
    <main className="flex min-h-full w-full overflow-x-hidden pb-5">
      <div className="w-full p-1 md:p-2 lg:w-[68%]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1">
            <CaretLeftIcon
              size={20}
              className="text-[#282828] cursor-pointer"
              onClick={() => router.push('/wellbeing-manager')}
            />
            <h1 className="text-xl font-bold text-[#16284F]">
              This month issues (128)
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex h-8 cursor-pointer items-center gap-2 rounded-md bg-[#16284F] px-3 text-[12px] font-bold text-white shadow-sm hover:bg-[#0f1b36]">
              College
              <CaretDown size={14} weight="bold" />
            </button>
            <button className="flex h-8 items-center gap-2 cursor-pointer rounded-full bg-[#43C17A] px-4 text-[12px] font-bold text-white shadow-sm hover:bg-[#34a362]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#43C17A]">
                <CalendarDotsIcon size={12} weight="fill" />
              </span>
              January
              <CaretDown size={14} weight="bold" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {statsConfig.map((stat) => {
            const isActive = currentType === stat.type;
            const Icon = stat.icon;
            return (
              <div
                key={stat.type}
                onClick={() => handleCardClick(stat.type)}
                className={`cursor-pointer rounded-lg p-3 transition-colors ${isActive ? stat.activeClass : stat.inactiveClass
                  }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-md bg-white ${isActive ? stat.iconColorClass : ""
                    }`}
                >
                  <Icon size={20} weight="fill" />
                </span>
                <p className={`mt-5 text-[22px] font-bold leading-tight ${isActive ? 'text-white' : 'text-[#282828]'}`}>
                  {stat.value}
                </p>
                <p className={`mt-1 text-[11px] ${isActive ? 'text-white' : 'text-[#515151]'} font-semibold leading-tight opacity-90`}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-4">
          <FilterDropdown label="Role" value="Student" />
          <FilterDropdown label="Branch" value="All" />
          <FilterDropdown label="Year" value="All" />
          <FilterDropdown label="Priority" value="All" />
        </div>

        <div className="mt-5">
          <ManagerDashboardCard className="min-h-[250px] p-4">
            <h3 className="mb-4 text-[14px] font-bold text-[#16284F]">
              Issues Category Breakdown
            </h3>
            <div className="flex h-[200px] items-end gap-4 pl-1">
              <div className="flex h-full shrink-0 flex-col justify-between pb-8 text-[12px] font-medium text-[#4B5563]">
                {[60, 50, 40, 30, 20, 10, 0].map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
              <div className="grid h-full flex-1 grid-cols-5 items-end gap-2 md:gap-6">
                {breakdownData.map((item) => (
                  <div
                    key={item.name}
                    className="flex h-full min-w-0 flex-col items-center justify-end gap-3"
                  >
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        className="mx-auto min-h-2 w-full max-w-[50px] rounded-t-sm bg-[#43C17A] transition-all duration-500"
                        style={{ height: `${(item.value / 60) * 100}%` }}
                      />
                    </div>
                    <span className="block w-full truncate text-center text-[10px] font-bold text-[#111827] md:text-[11px]">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ManagerDashboardCard>
        </div>

        <div className="mt-5">
          <ManagerDashboardCard className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F8EF] text-[#43C17A]">
                <ListChecks size={18} weight="fill" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#16284F]">
                  Recent Issues
                </h3>
                <p className="text-[12px] font-medium text-[#4B5563]">
                  Latest reported complaints across campus
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <TableComponent
                  columns={columns}
                  tableData={tableData}
                  height="auto"
                  stickyHeader={false}
                />
              </div>
            </div>
          </ManagerDashboardCard>
        </div>
      </div>

      {stage >= 3 ? (
        <WellbeingRight />
      ) : (
        <aside className="hidden w-[32%] flex-col p-2 pr-0 lg:flex lg:w-[32%]">
          <div className="h-[54px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[170px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[520px] animate-pulse rounded-lg bg-gray-200" />
        </aside>
      )}
    </main>
  );
}
