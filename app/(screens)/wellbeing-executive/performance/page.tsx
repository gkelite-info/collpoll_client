"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CaretDown,
  CalendarDotsIcon,
  EnvelopeSimple,
  FilePdf,
  List,
  ListDashes,
  Phone,
} from "@phosphor-icons/react";
import WellbeingExecutiveRight from "../components/WellbeingExecutiveRight";

type Issue = {
  id: string;
  title: string;
  category: string;
  priority: string;
  date: string;
  description: string;
  attachments: { name: string; size: string }[];
};

type Executive = {
  id: number;
  name: string;
  staffId: string;
  role: string;
  category: string;
  image: string;
  phone: string;
  email: string;
  status: string;
  totalIssues: number;
  resolvedIssues: number;
  contribution: number;
  issues: Issue[];
};

const months = ["January", "February", "March", "April", "May", "June"];

const executives: Executive[] = [
  {
    id: 1,
    name: "Naveen Kumar",
    staffId: "ID - 274292",
    role: "Infrastructure Executive",
    category: "Infrastructure",
    image: "/w-e-m.png",
    phone: "+91 90847 46247",
    email: "naveenkumar@gmail.com",
    status: "Actively Contributing",
    totalIssues: 52,
    resolvedIssues: 44,
    contribution: 34,
    issues: [
      {
        id: "R-1",
        title: "Projector not working in CR - 2",
        category: "Infrastructure",
        priority: "Urgent",
        date: "03/27/2026",
        description:
          "The projector in Classroom CR-2 is not working and is unable to display content during lectures. Faculty tried reconnecting the cables and restarting the system, but the issue still persists. This is affecting ongoing classes, so maintenance support is required as soon as possible.",
        attachments: [
          { name: "Project_error.jpg", size: "60 KB" },
          { name: "Project_error.jpg2", size: "60 KB" },
        ],
      },
      {
        id: "R-2",
        title: "AC cooling issue in Faculty Room 3",
        category: "Infrastructure",
        priority: "High",
        date: "03/28/2026",
        description:
          "The air conditioning unit is making a loud noise and not cooling effectively. Multiple faculty members have reported discomfort and require technician support.",
        attachments: [{ name: "AC_Unit_Panel.jpg", size: "1.2 MB" }],
      },
    ],
  },
  {
    id: 2,
    name: "Habeeba Nazeer",
    staffId: "ID - 274292",
    role: "Hostel Executive",
    category: "Hostel",
    image: "/w-e-f.png",
    phone: "+91 90123 46247",
    email: "habeeba.nazeer@gmail.com",
    status: "Actively Contributing",
    totalIssues: 47,
    resolvedIssues: 39,
    contribution: 29,
    issues: [
      {
        id: "R-3",
        title: "WiFi not working in Hostel Floor 3",
        category: "Hostel",
        priority: "Urgent",
        date: "03/29/2026",
        description:
          "Students reported poor connectivity on the third floor. The router needs checking and signal coverage may need to be improved.",
        attachments: [{ name: "Wifi_signal.jpg", size: "80 KB" }],
      },
    ],
  },
  {
    id: 3,
    name: "Sachin Dantala",
    staffId: "ID - 274292",
    role: "Sports Executive",
    category: "Sports",
    image: "/admin-m.png",
    phone: "+91 90987 46247",
    email: "sachin.dantala@gmail.com",
    status: "Monitoring",
    totalIssues: 38,
    resolvedIssues: 27,
    contribution: 21,
    issues: [
      {
        id: "R-4",
        title: "Ground maintenance required",
        category: "Sports",
        priority: "High",
        date: "03/30/2026",
        description:
          "Football field has uneven patches and requires ground staff inspection before practice sessions continue.",
        attachments: [{ name: "Ground_report.jpg", size: "90 KB" }],
      },
    ],
  },
  {
    id: 4,
    name: "Manav Rajput",
    staffId: "ID - 274292",
    role: "Infrastructure Executive",
    category: "Infrastructure",
    image: "/student-m.png",
    phone: "+91 90847 40011",
    email: "manav.rajput@gmail.com",
    status: "Actively Contributing",
    totalIssues: 33,
    resolvedIssues: 24,
    contribution: 19,
    issues: [],
  },
  {
    id: 5,
    name: "Zoha Sadaf",
    staffId: "ID - 274292",
    role: "Medical Executive",
    category: "Medical",
    image: "/w-m-f.png",
    phone: "+91 90847 40012",
    email: "zoha.sadaf@gmail.com",
    status: "Monitoring",
    totalIssues: 29,
    resolvedIssues: 21,
    contribution: 16,
    issues: [],
  },
];

function ExecutiveAvatar({
  src,
  alt,
  size = 44,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full bg-gray-100"
      style={{ height: size, width: size }}
    >
      <Image src={src} alt={alt} height={size} width={size} className="object-cover" />
    </span>
  );
}

function MetricCard({
  value,
  label,
  className,
  valueClassName,
}: {
  value: string | number;
  label: string;
  className: string;
  valueClassName: string;
}) {
  return (
    <div className={`flex h-[76px] flex-col justify-between rounded-md p-3 ${className}`}>
      <span className={`text-[20px] font-extrabold leading-none ${valueClassName}`}>
        {value}
      </span>
      <span className="text-[12px] font-bold text-[#16284F]">{label}</span>
    </div>
  );
}

function ExecutiveProfileCard({
  executive,
  month,
  onMonthChange,
}: {
  executive: Executive;
  month: string;
  onMonthChange: (month: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex items-center gap-4">
          <ExecutiveAvatar src={executive.image} alt={executive.name} size={78} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-[16px] font-bold text-[#282828]">
                {executive.name}
              </h2>
              <span className="text-[11px] font-bold text-[#282828]">
                {executive.staffId}
              </span>
            </div>
            <p className="mt-1 text-[12px] font-bold text-[#43C17A]">
              {executive.role}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[12px] font-bold text-[#16284F]">
              <span className="rounded-full bg-[#43C17A26] p-1 text-[#43C17A]">
                <Phone size={13} weight="fill" />
              </span>
              {executive.phone}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <p className="text-[12px] font-bold text-[#282828]">
            Performance -{" "}
            <span className="text-[#43C17A]">{executive.status}</span>
          </p>
          <p className="flex items-center gap-2 text-[12px] font-bold text-[#16284F]">
            <span className="rounded-full bg-[#43C17A26] p-1 text-[#43C17A]">
              <EnvelopeSimple size={13} weight="fill" />
            </span>
            Email - {executive.email}
          </p>
          <div className="relative">
            <button
              onClick={() => setOpen((value) => !value)}
              className="flex items-center gap-1 rounded-full bg-[#43C17A] px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <span className="rounded-full bg-white p-1 text-[#43C17A]">
                <CalendarDotsIcon size={12} weight="fill" />
              </span>
              {month}
              <CaretDown size={12} weight="bold" />
            </button>
            {open ? (
              <div className="absolute right-0 top-full z-10 mt-1 max-h-[180px] w-32 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                {months.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onMonthChange(item);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-[12px] font-bold ${
                      item === month
                        ? "bg-[#E8F8EF] text-[#43C17A]"
                        : "text-[#16284F] hover:bg-gray-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          value={executive.totalIssues}
          label="Total Issues Handled"
          className="bg-[#E2DAFF]"
          valueClassName="text-[#3801FF]"
        />
        <MetricCard
          value={executive.resolvedIssues}
          label="Issues Resolved"
          className="bg-[#FFEDDA]"
          valueClassName="text-[#EEB373]"
        />
        <MetricCard
          value={`${executive.contribution}%`}
          label="Contribution"
          className="bg-[#E6FFF1]"
          valueClassName="text-[#43C17A]"
        />
      </div>
    </section>
  );
}

function ContributionSection({ executive }: { executive: Executive }) {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (executive.contribution / 100) * circumference;

  return (
    <section className="shrink-0">
      <h2 className="mb-3 text-[16px] font-bold text-[#282828]">
        Contribution : <span className="text-[#43C17A]">{executive.category}</span>
      </h2>
      <div className="flex flex-col items-center gap-6 rounded-lg bg-white p-5 shadow-sm sm:flex-row">
        <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#CBDAC9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#437E66"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-[22px] font-extrabold text-[#16284F]">
              {executive.resolvedIssues}
            </p>
            <p className="text-[9px] font-bold text-[#16284F]">
              Issues Resolved
            </p>
          </div>
        </div>

        <div className="w-full flex-1">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold text-[#282828]">
              {executive.totalIssues}
            </span>
            <span className="text-[12px] font-bold text-[#16284F]">
              Total Issues
            </span>
          </div>
          <div className="mb-3 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-[#437E66]"
              style={{ width: `${executive.contribution}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] font-bold">
            <span className="text-gray-500">Issues Resolved</span>
            <span className="text-[#16284F]">
              Contribution Share{" "}
              <span className="text-[#282828]">{executive.contribution}%</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

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

function ExecutivesPanel({
  selectedId,
  onSelect,
}: {
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
      <h3 className="px-4 py-3 text-[16px] font-bold text-[#282828]">
        Executives
      </h3>
      <div className="flex flex-col">
        {executives.map((executive) => (
          <button
            key={executive.id}
            onClick={() => onSelect(executive.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left ${
              selectedId === executive.id ? "bg-[#E8F8EF]" : "bg-[#ECECEC]"
            }`}
          >
            <ExecutiveAvatar
              src={executive.image}
              alt={executive.name}
              size={42}
            />
            <span>
              <span className="block text-[13px] font-bold text-[#282828]">
                {executive.name}
              </span>
              <span className="block text-[11px] font-medium text-[#282828]">
                {executive.staffId}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function PerformancePage() {
  const [selectedExecutiveId, setSelectedExecutiveId] = useState(1);
  const [month, setMonth] = useState("January");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const selectedExecutive = useMemo(
    () =>
      executives.find((executive) => executive.id === selectedExecutiveId) ||
      executives[0],
    [selectedExecutiveId],
  );

  const executivesSidebar = (
    <ExecutivesPanel
      selectedId={selectedExecutive.id}
      onSelect={(id) => {
        setSelectedExecutiveId(id);
        setIsMobileDrawerOpen(false);
      }}
    />
  );

  return (
    <main className="flex w-full flex-col gap-2 lg:min-h-screen lg:flex-row">
      <section className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto p-2 lg:h-full lg:w-[68%]">
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-[#282828]">
              Performance
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#282828]">
              Monitor and track performance of well-being executives
            </p>
          </div>
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="rounded-lg border border-gray-200 bg-white p-2 text-[#16284F] shadow-sm lg:hidden"
          >
            <List size={22} weight="bold" />
          </button>
        </div>

        <ExecutiveProfileCard
          executive={selectedExecutive}
          month={month}
          onMonthChange={setMonth}
        />
        <ContributionSection executive={selectedExecutive} />
        <div className="flex flex-col gap-3">
          {selectedExecutive.issues.length > 0 ? (
            selectedExecutive.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          ) : (
            <div className="rounded-lg bg-white p-8 text-center text-[13px] font-semibold text-gray-400 shadow-sm">
              No resolved issues found for this executive.
            </div>
          )}
        </div>
      </section>

      <WellbeingExecutiveRight
        bounded
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        hideDefaultMobileContent
        showCalendar={true}
        showHeaderCards={false}
        showCourseScheduleCard
      >
        {executivesSidebar}
      </WellbeingExecutiveRight>
    </main>
  );
}
