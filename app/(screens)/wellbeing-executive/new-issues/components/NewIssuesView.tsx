"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CaretDown, FilePdf, ListDashes } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import WellbeingExecutiveRight from "../../components/WellbeingExecutiveRight";

type IssueView = "all" | "my" | "urgent";
type IssueStatus = "Pending" | "Resolved";
type IssueScope = "college" | "hostel";

type ExecutiveIssue = {
  id: string;
  student: string;
  meta: string;
  image: string;
  title: string;
  description: string;
  category: string;
  priority: "Urgent" | "High" | "Medium";
  status: IssueStatus;
  time: string;
  dateReported: string;
  block: string;
  room: string;
  evidence: string;
  assignedToMe: boolean;
  attachments: { name: string; size: string }[];
};

const tabs: { key: IssueView; label: string; count: number }[] = [
  { key: "all", label: "All Issues", count: 120 },
  { key: "my", label: "My Issues", count: 12 },
  { key: "urgent", label: "Urgent", count: 18 },
];

const issues: ExecutiveIssue[] = [
  {
    id: "WE-28939",
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/female-student.png",
    title: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "Urgent",
    status: "Resolved",
    time: "10:45 AM",
    dateReported: "25/03/2025",
    block: "A",
    room: "A-206",
    evidence: "projector-evidence.pdf",
    assignedToMe: true,
    attachments: [
      { name: "Project_error.jpg", size: "60 KB" },
      { name: "Project_error.jpg2", size: "60 KB" },
    ],
  },
  {
    id: "WE-28940",
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/student-m.png",
    title: "WiFi not working",
    description: "Internet connectivity is very poor or unavailable.",
    category: "Infrastructure",
    priority: "Urgent",
    status: "Pending",
    time: "10:45 AM",
    dateReported: "25/03/2025",
    block: "B",
    room: "A-205",
    evidence: "wifi-evidence.pdf",
    assignedToMe: true,
    attachments: [
      { name: "Project_error.jpg", size: "60 KB" },
      { name: "Project_error.jpg2", size: "60 KB" },
    ],
  },
  {
    id: "WE-28941",
    student: "Rahul Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/rahul.png",
    title: "Noise disturbance at night",
    description: "Students in nearby classes are making noise.",
    category: "Infrastructure",
    priority: "High",
    status: "Pending",
    time: "10:45 AM",
    dateReported: "25/03/2025",
    block: "A",
    room: "A-203",
    evidence: "noise-evidence.pdf",
    assignedToMe: true,
    attachments: [
      { name: "Project_error.jpg", size: "60 KB" },
      { name: "Project_error.jpg2", size: "60 KB" },
    ],
  },
  {
    id: "WE-28942",
    student: "Sameer Rathod",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/male-student.png",
    title: "Ground maintenance required",
    description: "Football field has uneven surface.",
    category: "Sports",
    priority: "Medium",
    status: "Pending",
    time: "10:45 AM",
    dateReported: "25/03/2025",
    block: "C",
    room: "B-118",
    evidence: "ground-evidence.pdf",
    assignedToMe: false,
    attachments: [],
  },
  {
    id: "WE-28943",
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/female-fe.png",
    title: "Ground maintenance required",
    description: "Football field has uneven surface.",
    category: "Sports",
    priority: "Medium",
    status: "Pending",
    time: "10:45 AM",
    dateReported: "25/03/2025",
    block: "A",
    room: "C-310",
    evidence: "ground-evidence.pdf",
    assignedToMe: false,
    attachments: [],
  },
  {
    id: "WE-28944",
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    image: "/student-m.png",
    title: "Ground maintenance required",
    description: "Football field has uneven surface.",
    category: "Sports",
    priority: "Urgent",
    status: "Pending",
    time: "10:45 AM",
    dateReported: "25/03/2025",
    block: "B",
    room: "A-210",
    evidence: "ground-evidence.pdf",
    assignedToMe: false,
    attachments: [],
  },
];

function getView(value: string | null): IssueView {
  return value === "my" || value === "urgent" ? value : "all";
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFE8E8] px-1.5 text-[9px] font-bold text-[#FF1F1F]">
      {count}
    </span>
  );
}

function ScopeSelectPill({
  value,
  onChange,
}: {
  value: IssueScope;
  onChange: (scope: IssueScope) => void;
}) {
  return (
    <label className="relative flex h-9 min-w-[118px] items-center rounded-md bg-[#16284F] px-3.5 text-[14px] font-bold text-white">
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
        size={15}
        weight="bold"
        className="pointer-events-none absolute right-3"
      />
    </label>
  );
}

function StaticSelectPill({ label }: { label: string }) {
  return (
    <button className="flex h-9 min-w-[118px] items-center justify-between gap-3 rounded-md bg-[#16284F] px-3.5 text-[14px] font-bold text-white">
      <span>{label}</span>
      <CaretDown size={15} weight="bold" />
    </button>
  );
}

function IssuesHeader({
  activeView,
  onChange,
  selectedScope,
  onScopeChange,
}: {
  activeView: IssueView;
  onChange: (view: IssueView) => void;
  selectedScope: IssueScope;
  onScopeChange: (scope: IssueScope) => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-3">
      <div>
        <h1 className="text-[18px] font-bold text-[#282828]">
          {activeView === "all" ? "Infrastructure Issues" : "Issues"}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-[#282828]">
          Manage and resolve student issues efficiently
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex shrink-0 items-center whitespace-nowrap text-[18px] font-bold leading-none">
          {tabs.map((tab, index) => (
            <div key={tab.key} className="flex items-center">
              {index > 0 ? <span className="mx-1 text-[#282828]">|</span> : null}
              <button
                onClick={() => onChange(tab.key)}
                className={`cursor-pointer ${activeView === tab.key ? "text-[#43C17A]" : "text-[#282828]"
                  }`}
              >
                {tab.label}
                <CountBadge count={tab.count} />
              </button>
            </div>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <ScopeSelectPill value={selectedScope} onChange={onScopeChange} />
          <StaticSelectPill label="Student" />
        </div>
      </div>
    </div>
  );
}

function StudentCell({ issue }: { issue: ExecutiveIssue }) {
  return (
    <div className="flex min-w-[250px] items-center gap-4 text-left">
      <span className="relative block h-10 w-10 shrink-0 object-cover overflow-hidden rounded-full bg-gray-100">
        <Image
          src={issue.image}
          alt={issue.student}
          height={40}
          width={40}
          unoptimized={true}
          className=" object-cover"
        />
        {/* <Avatar
          src={issue.image}
          alt={issue.student}
          size={40}
        /> */}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold text-[#282828]">
          {issue.student}
        </p>
        <p className="mt-1 truncate text-[13px] font-medium text-[#282828]">
          {issue.meta}
        </p>
      </div>
    </div>
  );
}

function IssueCell({ issue }: { issue: ExecutiveIssue }) {
  return (
    <div className="min-w-[320px] max-w-[380px] text-left">
      <p className="truncate text-[14px] font-bold text-[#282828]">
        {issue.title}
      </p>
      <p className="mt-2 truncate text-[13px] font-medium text-[#282828]">
        {issue.description}
      </p>
    </div>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-[112px] justify-center rounded-full bg-[#DCEEFF] px-3 py-1 text-[13px] font-bold text-[#457083]">
      {label}
    </span>
  );
}

function EvidencePill({ label }: { label: string }) {
  return (
    <button
      type="button"
      title={label}
      className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-[#E8F3EC] px-3 py-1 text-[13px] font-bold text-[#16284F]"
    >
      <FilePdf size={18} weight="fill" className="text-[#FF2525]" />
      <span className="whitespace-nowrap">View PDF</span>
    </button>
  );
}

function TextCell({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span
      className={`block text-[14px] font-bold text-[#282828] ${className}`}
    >
      {value}
    </span>
  );
}

function IssuesTable({
  title,
  description,
  rows,
  scope,
}: {
  title: string;
  description: string;
  rows: ExecutiveIssue[];
  scope: IssueScope;
}) {
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
  const tableData = rows.map((issue) => ({
    subject: <StudentCell issue={issue} />,
    issue: <IssueCell issue={issue} />,
    block: <TextCell value={issue.block} className="min-w-[70px]" />,
    room: <TextCell value={issue.room} className="min-w-[130px]" />,
    category: <CategoryBadge label={issue.category} />,
    evidence: <EvidencePill label={issue.evidence} />,
  }));

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#43C17A]">
          <ListDashes size={18} weight="fill" />
        </span>
        <div>
          <h2 className="text-[15px] font-bold text-[#282828]">{title}</h2>
          <p className="text-[14px] font-medium text-[#282828]">
            {description}
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1 [&>div]:h-full">
        <TableComponent
          columns={columns}
          tableData={tableData}
          height="100%"
          stickyHeader={false}
          fillHeight
          tableClassName={scope === "college" ? "min-w-[980px]" : "min-w-[1180px]"}
        />
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: IssueStatus }) {
  const resolved = status === "Resolved";

  return (
    <button
      className={`flex h-7 min-w-[94px] items-center justify-center gap-1 rounded px-2.5 text-[12px] font-bold text-white ${resolved ? "bg-[#43C17A]" : "bg-[#FFB466]"
        }`}
    >
      {status}
      <CaretDown size={12} weight="bold" />
    </button>
  );
}

function DetailMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] font-bold text-[#16284F]">{label} :</span>
      <span className="rounded border border-[#D7D7D7] bg-white px-4 py-1.5 text-[14px] font-semibold text-[#282828]">
        {value}
      </span>
    </div>
  );
}

function AttachmentPill({
  attachment,
}: {
  attachment: ExecutiveIssue["attachments"][number];
}) {
  return (
    <button className="flex min-w-52.5 items-center gap-3 rounded border border-[#D7D7D7] bg-white px-3 py-2 text-left">
      <FilePdf size={22} weight="fill" className="text-[#FF2525]" />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold text-[#282828]">
          {attachment.name}
        </span>
        <span className="block text-[12px] font-normal text-[#525252]">
          {attachment.size}
        </span>
      </span>
    </button>
  );
}

function IssueDetailsCard({
  issue,
  scope,
}: {
  issue: ExecutiveIssue;
  scope: IssueScope;
}) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#43C17A]">
            <ListDashes size={16} weight="fill" />
          </span>
          <span className="text-[16px] font-bold text-[#282828]">
            Issue Details
          </span>
        </div>
        <StatusPill status={issue.status} />
      </div>
      <h2 className="text-[18px] font-bold text-[#282828]">{issue.title}</h2>
      <div className="mt-3 flex flex-wrap gap-8">
        {scope === "hostel" ? (
          <>
            <DetailMeta label="Block" value={issue.block} />
            <DetailMeta label="Building / Room" value={issue.room} />
          </>
        ) : null}
        <DetailMeta label="Category" value={issue.category} />
        <DetailMeta label="Priority" value={issue.priority} />
        <DetailMeta label="Date Reported" value={issue.dateReported} />
      </div>
      <div className="mt-4 grid gap-3 text-[#767676] sm:grid-cols-[130px_minmax(0,1fr)]">
        <span className="text-[18px] font-bold text-[#16284F]">
          Description :
        </span>
        <p className="max-w-190 text-[14px] font-normal leading-none">
          The projector in Classroom CR-2 is not working and is unable to
          display content during lectures. Faculty tried reconnecting the cables
          and restarting the system, but the issue still persists. This is
          affecting ongoing classes, so maintenance support is required as soon
          as possible.
        </p>
      </div>
      <div className="mt-4 grid gap-3 text-[14px] font-medium text-[#282828] sm:grid-cols-[130px_minmax(0,1fr)]">
        <span className="font-bold text-[#16284F]">Attachments :</span>
        <div className="flex flex-wrap gap-3">
          {issue.attachments.map((attachment) => (
            <AttachmentPill key={attachment.name} attachment={attachment} />
          ))}
        </div>
      </div>
    </article>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function IssuesTableShimmer({
  rows,
  titleWidth,
  subtitleWidth,
}: {
  rows: number;
  titleWidth: string;
  subtitleWidth: string;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <SkeletonBlock className="h-8 w-8" />
        <div className="space-y-2">
          <SkeletonBlock className={`h-4 ${titleWidth}`} />
          <SkeletonBlock className={`h-3 ${subtitleWidth}`} />
        </div>
      </div>
      <SkeletonBlock className="h-10 w-full" />
      <div className="min-h-0 flex-1 space-y-5 overflow-hidden pt-5">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.1fr_1.6fr_.6fr_.7fr_.7fr_.7fr] gap-6"
          >
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-7" />
            <SkeletonBlock className="h-7" />
            <SkeletonBlock className="h-7" />
            <SkeletonBlock className="h-7" />
          </div>
        ))}
      </div>
    </section>
  );
}

function AllIssuesShimmer() {
  return (
    <IssuesTableShimmer
      rows={8}
      titleWidth="w-28"
      subtitleWidth="w-64"
    />
  );
}

function UrgentIssuesShimmer() {
  return (
    <IssuesTableShimmer
      rows={8}
      titleWidth="w-28"
      subtitleWidth="w-64"
    />
  );
}

function MyIssuesShimmer() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden pr-1">
      <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <section key={index} className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex justify-between">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-7 w-7" />
              <SkeletonBlock className="h-4 w-28" />
            </div>
            <SkeletonBlock className="h-8 w-24" />
          </div>
          <SkeletonBlock className="h-5 w-72" />
          <div className="mt-4 flex gap-5">
            <SkeletonBlock className="h-8 w-44" />
            <SkeletonBlock className="h-8 w-36" />
            <SkeletonBlock className="h-8 w-48" />
          </div>
          <div className="mt-4 grid grid-cols-[130px_minmax(0,1fr)] gap-3">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
          <div className="mt-4 flex gap-3">
            <SkeletonBlock className="h-14 w-52" />
            <SkeletonBlock className="h-14 w-52" />
          </div>
        </section>
      ))}
      </div>
    </div>
  );
}

function IssuesContent({
  activeView,
  loading,
  selectedScope,
}: {
  activeView: IssueView;
  loading: boolean;
  selectedScope: IssueScope;
}) {
  const urgentIssues = useMemo(
    () => issues.filter((issue) => issue.priority === "Urgent"),
    [],
  );
  const myIssues = useMemo(
    () => issues.filter((issue) => issue.assignedToMe),
    [],
  );

  if (loading) {
    if (activeView === "my") return <MyIssuesShimmer />;
    if (activeView === "urgent") return <UrgentIssuesShimmer />;
    return <AllIssuesShimmer />;
  }

  if (activeView === "my") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-3">
          {myIssues.map((issue) => (
            <IssueDetailsCard
              key={issue.id}
              issue={issue}
              scope={selectedScope}
            />
          ))}
        </div>
      </div>
    );
  }

  if (activeView === "urgent") {
    return (
      <IssuesTable
        title="Urgent Issues"
        description={`Latest reported complaints across ${
          selectedScope === "college" ? "College" : "Hostel"
        }`}
        rows={urgentIssues}
        scope={selectedScope}
      />
    );
  }

  return (
    <IssuesTable
      title={selectedScope === "college" ? "College Issues" : "Hostel Issues"}
      description={`Latest reported complaints across ${
        selectedScope === "college" ? "College" : "Hostel"
      }`}
      rows={issues}
      scope={selectedScope}
    />
  );
}

function NewIssuesBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<IssueView>(() =>
    getView(searchParams.get("issueView")),
  );
  const [selectedScope, setSelectedScope] = useState<IssueScope>("college");
  const [loadingView, setLoadingView] = useState(true);

  useEffect(() => {
    setActiveView(getView(searchParams.get("issueView")));
  }, [searchParams]);

  const handleViewChange = (view: IssueView) => {
    if (view === activeView) return;
    setActiveView(view);
    setLoadingView(true);
    router.push(`?issueView=${view}`);
  };

  useEffect(() => {
    if (!loadingView) return;

    const timer = window.setTimeout(() => setLoadingView(false), 260);
    return () => window.clearTimeout(timer);
  }, [loadingView, activeView]);

  return (
    <main className="flex w-full flex-col gap-2 lg:min-h-screen lg:flex-row">
      <section className="flex min-h-0 w-full flex-col gap-4 p-2 lg:h-full lg:w-[68%]">
        <IssuesHeader
          activeView={activeView}
          onChange={handleViewChange}
          selectedScope={selectedScope}
          onScopeChange={(scope) => {
            setSelectedScope(scope);
            setLoadingView(true);
          }}
        />
        <IssuesContent
          activeView={activeView}
          loading={loadingView}
          selectedScope={selectedScope}
        />
      </section>
      <WellbeingExecutiveRight bounded />
    </main>
  );
}

function PageShimmer() {
  return (
    <main className="flex min-h-screen w-full gap-2 p-2">
      <section className="w-full lg:w-[68%]">
        <SkeletonBlock className="h-16 w-full" />
        <div className="mt-4">
          <AllIssuesShimmer />
        </div>
      </section>
      <aside className="hidden w-[32%] md:block">
        <SkeletonBlock className="h-[520px] w-full" />
      </aside>
    </main>
  );
}

export default function NewIssuesView() {
  return (
    <Suspense fallback={<PageShimmer />}>
      <NewIssuesBody />
    </Suspense>
  );
}
