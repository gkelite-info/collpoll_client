"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CaretDown, FilePdf, ListDashes } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import TableComponent from "@/app/utils/table/table";
import WellbeingExecutiveRight from "../../components/WellbeingExecutiveRight";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchWellbeingExecutiveNewIssueCounts } from "@/lib/helpers/wellbeingSupportIssues/wellbeingSupportIssueAPI";
import type {
  WellbeingExecutiveNewIssueCounts,
  WellbeingIssueJobStatus,
  WellbeingIssueRaisedRole,
} from "@/lib/helpers/wellbeingSupportIssues/types";

type IssueView = "all" | "my" | "urgent";
type IssueStatus = "Pending" | "Resolved";
type IssueScope = "all" | "college" | "hostel";
type IssueAppliesTo = Exclude<IssueScope, "all"> | "both";
type IssueRoleFilter = "all" | WellbeingIssueRaisedRole;
type IssueRoleOption = {
  label: string;
  value: IssueRoleFilter;
};

type ExecutiveIssue = {
  id: string;
  supportIssueId: number;
  student: string;
  meta: string;
  role: string;
  scopeLabel: string;
  categoryId: number;
  image: string;
  title: string;
  description: string;
  category: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: IssueStatus;
  time: string;
  dateReported: string;
  block: string;
  room: string;
  evidence: string;
  assignedToMe: boolean;
  canTakeAction: boolean;
  jobId: number | null;
  jobStatus: WellbeingIssueJobStatus | null;
  attachments: { name: string; size: string }[];
};

const tabs: { key: IssueView; label: string }[] = [
  { key: "all", label: "All Issues" },
  { key: "my", label: "My Issues" },
  { key: "urgent", label: "Urgent" },
];

const defaultIssueCounts: WellbeingExecutiveNewIssueCounts = {
  all: 0,
  my: 0,
  urgent: 0,
};

const NEW_ISSUES_ITEMS_PER_PAGE = 10;

const issueRoleOptions: IssueRoleOption[] = [
  { label: "All", value: "all" },
  { label: "Student", value: "Student" },
  { label: "College Admin", value: "CollegeAdmin" },
  { label: "Admin", value: "Admin" },
  { label: "Faculty", value: "Faculty" },
  { label: "Finance", value: "Finance" },
  { label: "College HR", value: "CollegeHr" },
  { label: "Placement Officer", value: "PlacementOfficer" },
  { label: "Wellbeing Executive", value: "WellbeingExecutive" },
  { label: "Wellbeing Manager", value: "WellbeingManager" },
  { label: "Finance Manager", value: "FinanceManager" },
];

const getIssueRoleFilterLabel = (value: IssueRoleFilter) =>
  issueRoleOptions.find((option) => option.value === value)?.label ?? value;

const getIssueSubjectHeader = (value: IssueRoleFilter) =>
  value === "all" ? "Raised By" : getIssueRoleFilterLabel(value);

const getIssueScopeLabel = (value: IssueAppliesTo) =>
  value === "both" ? "Both" : value === "college" ? "College" : "Hostel";

type ExecutiveIssueRow = {
  wellbeingSupportIssueId: number;
  fullName: string;
  email: string;
  issueTitle: string;
  categoryId: number;
  appliesTo: IssueAppliesTo;
  priority: "high" | "medium" | "low";
  description: string;
  IssueStatus: "pending" | "resolved" | "rejected";
  issueRaisedRole: WellbeingIssueRaisedRole;
  createdAt: string | null;
  wellbeing_categories:
    | { categoryName?: string | null }
    | { categoryName?: string | null }[]
    | null;
  wellbeing_support_issue_attachments:
    | {
        wellbeingSupportIssueAttachmentId: number;
        attachment: string;
        is_deleted: boolean | null;
        deletedAt: string | null;
      }[]
    | null;
};

type IssueJobRow = {
  wellbeingIssueJobId: number;
  wellbeingSupportIssueId: number;
  wellBeingId: number;
  status: WellbeingIssueJobStatus;
  isActive: boolean;
  is_deleted: boolean | null;
  deletedAt: string | null;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

function getSupabaseErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const supabaseError = error as SupabaseErrorLike;
    return [
      supabaseError.code,
      supabaseError.message,
      supabaseError.details,
      supabaseError.hint,
    ]
      .filter(Boolean)
      .join(" - ");
  }
  return "";
}

function throwSupabaseError(error: unknown) {
  const message = getSupabaseErrorMessage(error) || "Supabase request failed.";
  throw new Error(message);
}

function formatIssueDate(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAttachmentName(path: string) {
  const fileName = path.split("/").pop() || path;
  return fileName.replace(/^\d+_\d+_/, "");
}

function toExecutiveIssue({
  row,
  job,
  registeredCategoryId,
}: {
  row: ExecutiveIssueRow;
  job?: IssueJobRow;
  registeredCategoryId?: number | null;
}): ExecutiveIssue {
  const categoryRelation = row.wellbeing_categories;
  const categoryName = Array.isArray(categoryRelation)
    ? categoryRelation[0]?.categoryName
    : categoryRelation?.categoryName;
  const attachments = (row.wellbeing_support_issue_attachments ?? [])
    .filter((attachment) => !attachment.is_deleted && !attachment.deletedAt)
    .map((attachment) => ({
      name: getAttachmentName(attachment.attachment),
      size: "File",
    }));

  return {
    id: `WE-${row.wellbeingSupportIssueId}`,
    supportIssueId: row.wellbeingSupportIssueId,
    student: row.fullName,
    meta: row.email,
    role: getIssueRoleFilterLabel(row.issueRaisedRole),
    scopeLabel: getIssueScopeLabel(row.appliesTo),
    categoryId: row.categoryId,
    image: "/male-student.png",
    title: row.issueTitle,
    description: row.description,
    category: categoryName || "Not specified",
    priority:
      row.priority === "high"
        ? "Urgent"
        : row.priority === "low"
          ? "Low"
          : "Medium",
    status: row.IssueStatus === "resolved" ? "Resolved" : "Pending",
    time: row.createdAt
      ? new Date(row.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    dateReported: formatIssueDate(row.createdAt),
    block: "-",
    room: "-",
    evidence: attachments[0]?.name ?? "No attachment",
    assignedToMe:
      job?.status === "inprogress" ||
      job?.status === "completed" ||
      job?.status === "cancelled",
    canTakeAction: registeredCategoryId === row.categoryId,
    jobId: job?.wellbeingIssueJobId ?? null,
    jobStatus: job?.status ?? null,
    attachments,
  };
}

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

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

function DropdownPill<T extends string>({
  value,
  options,
  onChange,
  minWidth,
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  minWidth: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="relative z-10" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 ${minWidth} cursor-pointer items-center justify-between gap-3 rounded-md bg-[#16284F] px-4 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#102044]`}
      >
        <span className="truncate">{selectedLabel}</span>
        <CaretDown
          size={15}
          weight="bold"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="custom-scrollbar absolute left-0 top-full z-20 mt-1 max-h-56 w-full min-w-full overflow-y-auto rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full cursor-pointer px-6 py-3 text-left text-[14px] font-medium transition-colors ${
                  selected
                    ? "bg-[#2166D1] text-white"
                    : "bg-white text-[#16284F] hover:bg-[#E8E8E8]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
} 

function ScopeSelectPill({
  value,
  onChange,
}: {
  value: IssueScope;
  onChange: (scope: IssueScope) => void;
}) {
  const scopeOptions: DropdownOption<IssueScope>[] = [
    { label: "All", value: "all" },
    { label: "College", value: "college" },
    { label: "Hostel", value: "hostel" },
  ];

  return (
    <DropdownPill
      value={value}
      options={scopeOptions}
      onChange={onChange}
      minWidth="min-w-[118px]"
    />
  );
}

function RoleSelectPill({
  value,
  onChange,
}: {
  value: IssueRoleFilter;
  onChange: (role: IssueRoleFilter) => void;
}) {
  return (
    <DropdownPill
      value={value}
      options={issueRoleOptions}
      onChange={onChange}
      minWidth="min-w-[190px]"
    />
  );
}

function IssuesHeader({
  activeView,
  onChange,
  selectedScope,
  onScopeChange,
  counts,
  categoryName,
  selectedRole,
  onRoleChange,
}: {
  activeView: IssueView;
  onChange: (view: IssueView) => void;
  selectedScope: IssueScope;
  onScopeChange: (scope: IssueScope) => void;
  counts: WellbeingExecutiveNewIssueCounts;
  categoryName?: string | null;
  selectedRole: IssueRoleFilter;
  onRoleChange: (role: IssueRoleFilter) => void;
}) {
  const roleLabel = getIssueRoleFilterLabel(selectedRole).toLowerCase();

  return (
    <div className="flex shrink-0 flex-col gap-3">
      <div>
        <h1 className="text-[18px] font-bold text-[#282828]">
          {activeView === "my" && categoryName?.trim()
            ? `${categoryName.trim()} Issues`
            : activeView === "urgent"
              ? "Urgent Issues"
              : "All Issues"}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-[#282828]">
          Manage and resolve {roleLabel} issues efficiently
        </p>
      </div>
      <div className="relative z-10 flex items-center justify-between gap-4 overflow-visible pb-2">
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
                <CountBadge count={counts[tab.key]} />
              </button>
            </div>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <ScopeSelectPill value={selectedScope} onChange={onScopeChange} />
          <RoleSelectPill value={selectedRole} onChange={onRoleChange} />
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
    <div className="mx-auto w-[360px] text-center">
      <p className="w-full truncate text-[14px] font-bold text-[#282828]">
        {issue.title}
      </p>
      <p className="mt-2 w-full truncate text-[13px] font-medium text-[#282828]">
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

function AssignmentActionCell({
  issue,
  onRequestStatus,
  loading,
}: {
  issue: ExecutiveIssue;
  onRequestStatus: (issue: ExecutiveIssue, status: WellbeingIssueJobStatus) => void;
  loading: boolean;
}) {
  if (!issue.canTakeAction) {
    return (
      <span className="block min-w-[150px] text-[13px] font-semibold text-[#9CA3AF]">
        Not your category
      </span>
    );
  }

  if (issue.jobStatus === "inprogress") {
    return (
      <span className="inline-flex h-10 w-[150px] items-center justify-center rounded-full bg-[#E8F8EF] px-3 text-[13px] font-bold text-[#009B55]">
        In Progress
      </span>
    );
  }

  if (issue.jobStatus === "completed") {
    return (
      <span className="inline-flex h-10 w-[150px] items-center justify-center rounded-full bg-[#E8F8EF] px-3 text-[13px] font-bold text-[#009B55]">
        Completed
      </span>
    );
  }

  if (issue.jobStatus === "cancelled") {
    return (
      <span className="inline-flex h-10 w-[150px] items-center justify-center rounded-full bg-[#FFF2F2] px-3 text-[13px] font-bold text-[#FF2A2A]">
        Cancelled
      </span>
    );
  }

  return (
    <div className="flex min-w-[180px] items-center justify-center">
      <button
        type="button"
        disabled={loading}
        onClick={() => onRequestStatus(issue, "inprogress")}
        className="inline-flex h-10 w-[150px] cursor-pointer items-center justify-center rounded-full border border-[#43C17A] bg-white px-3 text-[13px] font-bold text-[#43C17A] transition-colors hover:bg-[#E8F8EF] disabled:cursor-not-allowed disabled:opacity-60"
      >
        In Progress
      </button>
    </div>
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
  roleLabel,
  onRequestJobStatus,
  actionLoadingIssueId,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  title: string;
  description: string;
  rows: ExecutiveIssue[];
  scope: IssueScope;
  roleLabel: string;
  onRequestJobStatus: (issue: ExecutiveIssue, status: WellbeingIssueJobStatus) => void;
  actionLoadingIssueId: number | null;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const columns =
    scope === "hostel"
      ? [
          { title: roleLabel, key: "subject" },
          { title: "Role", key: "role" },
          { title: "College/Hostel", key: "scope" },
          { title: "Issue", key: "issue" },
          { title: "Block", key: "block" },
          { title: "Building / Room", key: "room" },
          { title: "Category", key: "category" },
          { title: "Evidence", key: "evidence" },
          { title: "Action", key: "action" },
        ]
      : [
          { title: roleLabel, key: "subject" },
          { title: "Role", key: "role" },
          { title: "College/Hostel", key: "scope" },
          { title: "Issue", key: "issue" },
          { title: "Category", key: "category" },
          { title: "Evidence", key: "evidence" },
          { title: "Action", key: "action" },
        ];
  const tableData = rows.map((issue) => ({
    subject: <StudentCell issue={issue} />,
    role: <TextCell value={issue.role} className="min-w-[120px]" />,
    scope: <TextCell value={issue.scopeLabel} className="min-w-[120px]" />,
    issue: <IssueCell issue={issue} />,
    block: <TextCell value={issue.block} className="min-w-[70px]" />,
    room: <TextCell value={issue.room} className="min-w-[130px]" />,
    category: <CategoryBadge label={issue.category} />,
    evidence: <EvidencePill label={issue.evidence} />,
    action: (
      <div className="flex min-w-[180px] justify-center">
        <AssignmentActionCell
          issue={issue}
          onRequestStatus={onRequestJobStatus}
          loading={actionLoadingIssueId === issue.supportIssueId}
        />
      </div>
    ),
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
          tableClassName={scope === "hostel" ? "min-w-[1600px]" : "min-w-[1400px]"}
        />
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        roundedBottom="rounded-b-xl"
      />
    </section>
  );
}

function JobStatusDropdown({
  issue,
  onRequestStatus,
  loading,
}: {
  issue: ExecutiveIssue;
  onRequestStatus: (issue: ExecutiveIssue, status: WellbeingIssueJobStatus) => void;
  loading: boolean;
}) {
  if (issue.jobStatus === "completed") {
    return (
      <span className="inline-flex min-w-[135px] justify-center rounded-md bg-[#E8F8EF] px-4 py-2 text-[14px] font-bold text-[#009B55] shadow-sm">
        Completed
      </span>
    );
  }

  if (issue.jobStatus === "cancelled") {
    return (
      <span className="inline-flex min-w-[135px] justify-center rounded-md bg-[#FFF2F2] px-4 py-2 text-[14px] font-bold text-[#FF2A2A] shadow-sm">
        Cancelled
      </span>
    );
  }

  const options: DropdownOption<"pending" | "completed" | "cancelled">[] = [
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className={loading ? "pointer-events-none opacity-60" : ""}>
      <DropdownPill
        value="pending"
        options={options}
        onChange={(nextStatus) => {
          if (nextStatus === "pending") return;
          onRequestStatus(issue, nextStatus);
        }}
        minWidth="min-w-[135px]"
      />
    </div>
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
  onRequestStatus,
  loading,
}: {
  issue: ExecutiveIssue;
  scope: IssueScope;
  onRequestStatus: (issue: ExecutiveIssue, status: WellbeingIssueJobStatus) => void;
  loading: boolean;
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
        <JobStatusDropdown
          issue={issue}
          onRequestStatus={onRequestStatus}
          loading={loading}
        />
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
        <DetailMeta label="College/Hostel" value={issue.scopeLabel} />
        <DetailMeta label="Priority" value={issue.priority} />
        <DetailMeta label="Date Reported" value={issue.dateReported} />
      </div>
      <div className="mt-4 grid gap-3 text-[#767676] sm:grid-cols-[130px_minmax(0,1fr)]">
        <span className="text-[18px] font-bold text-[#16284F]">
          Description :
        </span>
        <p className="max-w-190 text-[14px] font-normal leading-none">
          {issue.description}
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
  rows,
  selectedRole,
  onRequestJobStatus,
  actionLoadingIssueId,
  currentPage,
  itemsPerPage,
  onPageChange,
}: {
  activeView: IssueView;
  loading: boolean;
  selectedScope: IssueScope;
  rows: ExecutiveIssue[];
  selectedRole: IssueRoleFilter;
  onRequestJobStatus: (issue: ExecutiveIssue, status: WellbeingIssueJobStatus) => void;
  actionLoadingIssueId: number | null;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const urgentIssues = useMemo(
    () => rows.filter((issue) => issue.priority === "Urgent"),
    [rows],
  );
  const myIssues = useMemo(
    () => rows.filter((issue) => issue.assignedToMe),
    [rows],
  );
  const paginateIssues = (issues: ExecutiveIssue[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return issues.slice(startIndex, startIndex + itemsPerPage);
  };
  const totalItemsForView =
    activeView === "my"
      ? myIssues.length
      : activeView === "urgent"
        ? urgentIssues.length
        : rows.length;
  const paginatedMyIssues = paginateIssues(myIssues);
  const paginatedUrgentIssues = paginateIssues(urgentIssues);
  const paginatedRows = paginateIssues(rows);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalItemsForView / itemsPerPage));
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [currentPage, itemsPerPage, onPageChange, totalItemsForView]);

  if (loading) {
    if (activeView === "my") return <MyIssuesShimmer />;
    if (activeView === "urgent") return <UrgentIssuesShimmer />;
    return <AllIssuesShimmer />;
  }

  if (activeView === "my") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {paginatedMyIssues.map((issue) => (
              <IssueDetailsCard
                key={issue.id}
                issue={issue}
                scope={selectedScope}
                onRequestStatus={onRequestJobStatus}
                loading={actionLoadingIssueId === issue.supportIssueId}
              />
            ))}
          </div>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={myIssues.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          roundedBottom="rounded-b-xl"
        />
      </div>
    );
  }

  if (activeView === "urgent") {
    return (
      <IssuesTable
        title="Urgent Issues"
        description={`Latest reported complaints across ${
          selectedScope === "all"
            ? "All"
            : selectedScope === "college"
              ? "College"
              : "Hostel"
        }`}
        rows={paginatedUrgentIssues}
        scope={selectedScope}
        roleLabel={getIssueSubjectHeader(selectedRole)}
        onRequestJobStatus={onRequestJobStatus}
        actionLoadingIssueId={actionLoadingIssueId}
        currentPage={currentPage}
        totalItems={urgentIssues.length}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    );
  }

  return (
    <IssuesTable
      title={
        selectedScope === "all"
          ? "All Issues"
          : selectedScope === "college"
            ? "College Issues"
            : "Hostel Issues"
      }
      description={`Latest reported complaints across ${
        selectedScope === "all"
          ? "All"
          : selectedScope === "college"
            ? "College"
            : "Hostel"
      }`}
      rows={paginatedRows}
      scope={selectedScope}
      roleLabel={getIssueSubjectHeader(selectedRole)}
      onRequestJobStatus={onRequestJobStatus}
      actionLoadingIssueId={actionLoadingIssueId}
      currentPage={currentPage}
      totalItems={rows.length}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
    />
  );
}

function NewIssuesBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collegeId, wellBeingId, wellBeingCategoryId, wellBeingCategoryName } = useUser();
  const [activeView, setActiveView] = useState<IssueView>(() =>
    getView(searchParams.get("issueView")),
  );
  const [selectedScope, setSelectedScope] = useState<IssueScope>("all");
  const [selectedRole, setSelectedRole] =
    useState<IssueRoleFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingView, setLoadingView] = useState(true);
  const [issueRows, setIssueRows] = useState<ExecutiveIssue[]>([]);
  const [actionLoadingIssueId, setActionLoadingIssueId] = useState<number | null>(null);
  const [pendingJobAction, setPendingJobAction] = useState<{
    issue: ExecutiveIssue;
    status: WellbeingIssueJobStatus;
  } | null>(null);
  const [counts, setCounts] =
    useState<WellbeingExecutiveNewIssueCounts>(defaultIssueCounts);

  const loadCounts = useMemo(
    () => async () => {
      if (!collegeId) return;

      try {
        const nextCounts = await fetchWellbeingExecutiveNewIssueCounts(
          collegeId,
          wellBeingCategoryId,
          selectedRole === "all" ? null : selectedRole,
          wellBeingId,
        );
        setCounts(nextCounts);
      } catch {
        setCounts(defaultIssueCounts);
      }
    },
    [collegeId, selectedRole, wellBeingCategoryId, wellBeingId],
  );

  const loadIssues = useMemo(
    () => async () => {
      if (!collegeId) return;

      try {
        let assignedIssueIds: number[] | null = null;

        if (activeView === "my") {
          if (!wellBeingId) {
            setIssueRows([]);
            return;
          }

          const { data: assignedJobs, error: assignedJobsError } = await supabase
            .from("wellbeing_issue_jobs")
            .select("wellbeingSupportIssueId")
            .eq("wellBeingId", wellBeingId)
            .in("status", [
              "inprogress" satisfies WellbeingIssueJobStatus,
              "completed" satisfies WellbeingIssueJobStatus,
              "cancelled" satisfies WellbeingIssueJobStatus,
            ])
            .eq("isActive", true)
            .eq("is_deleted", false)
            .is("deletedAt", null);

          if (assignedJobsError) throw assignedJobsError;

          assignedIssueIds = Array.from(
            new Set(
              (assignedJobs ?? [])
                .map((job) => job.wellbeingSupportIssueId)
                .filter((issueId): issueId is number => Boolean(issueId)),
            ),
          );

          if (!assignedIssueIds.length) {
            setIssueRows([]);
            return;
          }
        }

        let query = supabase
          .from("wellbeing_support_issues")
          .select(
            `
            wellbeingSupportIssueId,
            fullName,
            email,
            issueTitle,
            categoryId,
            appliesTo,
            priority,
            description,
            IssueStatus,
            issueRaisedRole,
            createdAt,
            wellbeing_categories (
              categoryName
            ),
            wellbeing_support_issue_attachments (
              wellbeingSupportIssueAttachmentId,
              attachment,
              is_deleted,
              deletedAt
            )
          `,
          )
          .eq("collegeId", collegeId)
          .eq("IssueStatus", "pending")
          .eq("isActive", true)
          .eq("is_deleted", false)
          .in("issueVisibilityRole", ["wellbeingexecutive", "both"])
          .order("createdAt", { ascending: false });

        if (selectedRole !== "all") {
          query = query.eq("issueRaisedRole", selectedRole);
        }

        if (selectedScope !== "all") {
          query = query.in("appliesTo", [selectedScope, "both"]);
        }

        if (activeView === "urgent") {
          query = query.eq("priority", "high");
        }

        const { data, error } = await query;
        if (error) throwSupabaseError(error);

        const fetchedRows = (data ?? []) as ExecutiveIssueRow[];
        const assignedIssueIdSet = assignedIssueIds ? new Set(assignedIssueIds) : null;
        const rows = assignedIssueIdSet
          ? fetchedRows.filter((issue) =>
              assignedIssueIdSet.has(issue.wellbeingSupportIssueId),
            )
          : fetchedRows;
        const issueIds = rows.map((issue) => issue.wellbeingSupportIssueId);
        const { data: jobs, error: jobsError } =
          wellBeingId && issueIds.length
            ? await supabase
                .from("wellbeing_issue_jobs")
                .select("wellbeingIssueJobId, wellbeingSupportIssueId, wellBeingId, status, isActive, is_deleted, deletedAt")
                .eq("wellBeingId", wellBeingId)
                .eq("isActive", true)
                .eq("is_deleted", false)
                .is("deletedAt", null)
            : { data: [], error: null };

        if (jobsError) throwSupabaseError(jobsError);

        const issueIdSet = new Set(issueIds);
        const jobByIssueId = new Map(
          ((jobs ?? []) as IssueJobRow[])
            .filter((job) => issueIdSet.has(job.wellbeingSupportIssueId))
            .map((job) => [
            job.wellbeingSupportIssueId,
            job,
          ]),
        );

        setIssueRows(
          rows.map((row) =>
            toExecutiveIssue({
              row,
              job: jobByIssueId.get(row.wellbeingSupportIssueId),
              registeredCategoryId: wellBeingCategoryId,
            }),
          ),
        );
      } catch (error) {
        const message = getSupabaseErrorMessage(error);
        console.warn("load wellbeing executive issues warning:", message || error);
        setIssueRows([]);
      }
    },
    [activeView, collegeId, selectedRole, selectedScope, wellBeingCategoryId, wellBeingId],
  );

  useEffect(() => {
    setActiveView(getView(searchParams.get("issueView")));
  }, [searchParams]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, selectedRole, selectedScope]);

  useEffect(() => {
    if (!collegeId) return;

    const channel = supabase
      .channel(`wellbeing_executive_new_issues_page_${collegeId}_${wellBeingCategoryId ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wellbeing_support_issues",
          filter: `collegeId=eq.${collegeId}`,
        },
        () => {
          loadCounts();
          loadIssues();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collegeId, loadCounts, loadIssues, wellBeingCategoryId]);

  const handleViewChange = (view: IssueView) => {
    if (view === activeView) return;
    setActiveView(view);
    setCurrentPage(1);
    setLoadingView(true);
    router.push(`?issueView=${view}`);
  };

  useEffect(() => {
    if (!loadingView) return;

    const timer = window.setTimeout(() => setLoadingView(false), 260);
    return () => window.clearTimeout(timer);
  }, [loadingView, activeView]);

  const handleChangeJobStatus = async (
    issue: ExecutiveIssue,
    status: WellbeingIssueJobStatus,
  ) => {
    if (!wellBeingId) {
      toast.error("Wellbeing executive details are still loading.");
      return;
    }

    if (!issue.canTakeAction) {
      toast.error("You can only take issues from your assigned category.");
      return;
    }

    setActionLoadingIssueId(issue.supportIssueId);
    try {
      const now = new Date().toISOString();
      const existingJobId = issue.jobId;

      if (existingJobId) {
        const { error } = await supabase
          .from("wellbeing_issue_jobs")
          .update({
            status,
            isActive: true,
            is_deleted: false,
            deletedAt: null,
            updatedAt: now,
          })
          .eq("wellbeingIssueJobId", existingJobId)
          .eq("wellBeingId", wellBeingId);

        if (error) throwSupabaseError(error);
      } else {
        const { data: existingJobs, error: existingJobError } = await supabase
          .from("wellbeing_issue_jobs")
          .select("wellbeingIssueJobId")
          .eq("wellbeingSupportIssueId", issue.supportIssueId)
          .eq("wellBeingId", wellBeingId)
          .order("wellbeingIssueJobId", { ascending: false })
          .limit(1);

        if (existingJobError) throwSupabaseError(existingJobError);

        const existingJob = existingJobs?.[0];

        if (existingJob?.wellbeingIssueJobId) {
          const { error } = await supabase
            .from("wellbeing_issue_jobs")
            .update({
              status,
              isActive: true,
              is_deleted: false,
              deletedAt: null,
              updatedAt: now,
            })
            .eq("wellbeingIssueJobId", existingJob.wellbeingIssueJobId);

          if (error) throwSupabaseError(error);
        } else {
          const { error } = await supabase
            .from("wellbeing_issue_jobs")
            .insert({
              wellbeingSupportIssueId: issue.supportIssueId,
              wellBeingId,
              status,
              isActive: true,
              is_deleted: false,
              createdAt: now,
              updatedAt: now,
            });

          if (error) throwSupabaseError(error);
        }
      }

      toast.success(
        status === "inprogress"
          ? "Issue moved to in progress."
          : status === "completed"
            ? "Issue completed."
          : status === "cancelled"
            ? "Issue cancelled."
            : "Issue updated.",
      );
      setPendingJobAction(null);
      await Promise.all([loadCounts(), loadIssues()]);
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      console.error("update wellbeing issue job error:", message || error);
      toast.error(message || "Failed to update issue assignment.");
    } finally {
      setActionLoadingIssueId(null);
    }
  };

  const confirmPendingJobAction = () => {
    if (!pendingJobAction) return;
    handleChangeJobStatus(pendingJobAction.issue, pendingJobAction.status);
  };

  const pendingActionIsProgress = pendingJobAction?.status === "inprogress";
  const pendingActionIsCompleted = pendingJobAction?.status === "completed";
  const pendingActionLabel = pendingActionIsProgress
    ? "In Progress"
    : pendingActionIsCompleted
      ? "Completed"
      : "Cancelled";

  return (
    <main className="flex w-full flex-col gap-2 lg:min-h-screen lg:flex-row">
      <section className="flex min-h-0 w-full flex-col gap-4 p-2 lg:h-full lg:w-[68%]">
        <IssuesHeader
          activeView={activeView}
          onChange={handleViewChange}
          selectedScope={selectedScope}
          counts={counts}
          categoryName={wellBeingCategoryName}
          selectedRole={selectedRole}
          onRoleChange={(role) => {
            setSelectedRole(role);
            setCurrentPage(1);
            setLoadingView(true);
          }}
          onScopeChange={(scope) => {
            setSelectedScope(scope);
            setCurrentPage(1);
            setLoadingView(true);
          }}
        />
        <IssuesContent
          activeView={activeView}
          loading={loadingView}
          selectedScope={selectedScope}
          rows={issueRows}
          selectedRole={selectedRole}
          onRequestJobStatus={(issue, status) => setPendingJobAction({ issue, status })}
          actionLoadingIssueId={actionLoadingIssueId}
          currentPage={currentPage}
          itemsPerPage={NEW_ISSUES_ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </section>
      <WellbeingExecutiveRight />
      <ConfirmDeleteModal
        open={pendingJobAction !== null}
        onConfirm={confirmPendingJobAction}
        onCancel={() => {
          if (!actionLoadingIssueId) setPendingJobAction(null);
        }}
        isDeleting={actionLoadingIssueId !== null}
        title="Move to"
        name={pendingActionLabel}
        confirmText={
          pendingActionIsProgress
            ? "Yes, Start"
            : pendingActionIsCompleted
              ? "Yes, Complete"
              : "Yes, Cancel"
        }
        loadingText={
          pendingActionIsProgress
            ? "Starting..."
            : pendingActionIsCompleted
              ? "Completing..."
              : "Cancelling..."
        }
        actionType={pendingActionIsCompleted || pendingActionIsProgress ? "accept" : "reject"}
        customDescription={
          pendingJobAction ? (
            <>
              Are you sure you want to{" "}
              <span className="font-semibold text-gray-700">
                move this issue to {pendingActionLabel.toLowerCase()}
              </span>
              ?
              <br />
              <span className="font-semibold text-gray-700">
                {pendingJobAction.issue.title}
              </span>
            </>
          ) : null
        }
      />
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
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
