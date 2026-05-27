"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { CalendarDotsIcon, CaretDown } from "@phosphor-icons/react";

import { useUser } from "@/app/utils/context/UserContext";
import {
  managerAnnouncements,
  managerCategories,
  managerFilters,
  managerIssueStats,
} from "../data";
import ManagerDashboardCard from "./ManagerDashboardCard";
import DashboardIssueTables from "./DashboardIssueTables";

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
        <CalendarDotsIcon size={12} weight="fill" />
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
  const isMale = gender === "Male"
  const bgBanner = "/dashboard-banner-bg.png";

  return (
    <div
      className="relative h-[170px] w-full rounded-2xl shadow-sm max-md:h-[170px]"
      style={{
        backgroundImage: `url(${bgBanner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 flex h-full flex-col justify-start gap-5 rounded-l-lg p-3 max-md:gap-3 max-md:p-4">
        <div className="my-auto flex max-w-[65%] flex-col gap-2 lg:pl-5 max-md:max-w-[55%] max-md:gap-1.5">
          <h1 className="mt-3 text-lg font-medium leading-tight text-[#111827] max-md:mt-0 max-md:text-[15px]">
            Welcome back,{" "}
            <span className="text-lg font-bold leading-tight text-[#19A65F] max-md:text-[15px] md:inline">
              {loading ? "Manager" : displayName}
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-[12px] font-medium leading-5 text-[#111827] max-md:mt-1 max-md:text-[10px] max-md:leading-snug">
            Manage and resolve student issues efficiently.
            <br />
            Monitor complaints, prioritize urgent cases, and ensure timely
            resolution of hostel and campus concerns.
          </p>
        </div>

        {gender ? (
          <div className={`absolute bottom-0 md:-right-3 lg:right-10 z-10 ${isMale ? 'h-[110%]' : 'h-[105%]'} w-[180px] max-md:right-2 max-md:w-[120px]`}>
            <Image
              src={avatarImage}
              alt="Wellbeing manager"
              fill
              className="pointer-events-none object-contain object-bottom"
              priority
              sizes="(max-width: 768px) 150px, 180px"
            />
          </div>
        ) : null}
      </div>

      {/* <svg
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
      </svg> */}
    </div>
  );
}

function IssueStatTile({ item }: { item: (typeof managerIssueStats)[number] }) {
  const router = useRouter()
  const pathname = usePathname()
  const Icon = item.icon;

  return (
    <div
      onClick={() => router.push(`${pathname}?view=issues&type=${item.route}`)}
      className={`rounded-md p-3 cursor-pointer ${toneClasses[item.tone as keyof typeof toneClasses]}`}>
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

export default function WellbeingManagerLeft() {
  return (
    <div className="w-full p-2 lg:w-[68%]">
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
        <DashboardIssueTables />
      </div>
      
    </div>
  );
}
