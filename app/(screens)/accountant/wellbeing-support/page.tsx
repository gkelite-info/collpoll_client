"use client";

import CardComponent from "@/app/utils/card";
import Field from "@/app/utils/Field";
import IssueCard from "@/app/(screens)/finance/wellbeing/components/IssueCard";
import type { StudentWellbeingIssueListItem } from "@/lib/helpers/wellbeingSupportIssues/types";
import {
  CheckCircle,
  ClockCountdownIcon,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

const wellbeingCards = [
  {
    id: "raised",
    value: "15",
    label: "Total Raised",
    bg: "#DDD4FF",
    iconColor: "#6F4EF6",
  },
  {
    id: "pending",
    value: "02",
    label: "In Pending",
    bg: "#FFE7C9",
    iconColor: "#FF9F3F",
  },
  {
    id: "resolved",
    value: "10",
    label: "Resolved",
    bg: "#DDF3E7",
    iconColor: "#009B55",
  },
  {
    id: "rejected",
    value: "13",
    label: "Rejected",
    bg: "#FFDCDD",
    iconColor: "#FF2A2A",
  },
];

const mockIssues: Record<string, StudentWellbeingIssueListItem[]> = {
  raised: [
    makeIssue("1", "Pending"),
    makeIssue("2", "Resolved"),
    makeIssue("3", "Rejected"),
  ],
  pending: [makeIssue("4", "Pending"), makeIssue("5", "Pending")],
  resolved: [makeIssue("6", "Resolved"), makeIssue("7", "Resolved")],
  rejected: [makeIssue("8", "Rejected"), makeIssue("9", "Rejected")],
};

function makeIssue(
  id: string,
  status: StudentWellbeingIssueListItem["status"],
): StudentWellbeingIssueListItem {
  return {
    id,
    title: `Accounts portal support request - ${id}`,
    categoryId: 1,
    subCategoryId: 1,
    appliesTo: "college",
    priority: "medium",
    issueVisibilityRole: "wellbeingmanager",
    issueRaisedRole: "Finance",
    category: "Technical Issue",
    subCategory: "Portal Access",
    branch: "well being",
    description:
      "The accountant portal page is not responding correctly while accessing support records. Please review and assign support.",
    dateReported: "04/07/2026",
    status,
    canModify: status === "Pending",
    attachments: [
      { id: 1, name: "support_issue.pdf", size: "60 KB" },
      { id: 2, name: "screenshot.jpg", size: "45 KB" },
    ],
  };
}

function AccountantWellbeingSupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "";

  const issues = useMemo(
    () => (currentTab ? mockIssues[currentTab] ?? [] : []),
    [currentTab],
  );

  const openTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const openForm = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    params.delete("page");
    router.push(params.toString() ? `?${params.toString()}` : "?");
  };

  return (
    <div className="flex min-h-screen flex-col p-2 py-7">
      <section className="mx-auto flex w-full flex-1 flex-col rounded-xl bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-10 lg:px-10">
        <TopCards currentTab={currentTab} onCardClick={openTab} />
        {currentTab ? (
          <IssueList
            tab={currentTab}
            issues={issues}
            onRaiseIssue={openForm}
          />
        ) : (
          <IssueForm />
        )}
      </section>
    </div>
  );
}

function TopCards({
  currentTab,
  onCardClick,
}: {
  currentTab: string;
  onCardClick: (tab: string) => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-3xl flex-shrink-0 cursor-pointer grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-4">
      {wellbeingCards.map((card) => {
        const isActive = currentTab === card.id;

        return (
          <div key={card.id} onClick={() => onCardClick(card.id)}>
            <CardComponent
              style={`h-28 w-full transition-all duration-200 hover:scale-105 ${
                isActive ? "shadow-md ring-2 ring-offset-2" : "shadow-sm"
              }`}
              inlineStyle={{
                backgroundColor: isActive ? card.iconColor : card.bg,
                borderColor: isActive ? card.iconColor : "transparent",
              }}
              icon={
                <Warning
                  size={18}
                  weight="fill"
                  style={{ color: card.iconColor }}
                />
              }
              value={
                <span
                  style={{ color: isActive ? "#FFFFFF" : card.iconColor }}
                  className="font-bold"
                >
                  {card.value}
                </span>
              }
              label={
                <span style={{ color: isActive ? "#FFFFFF" : "inherit" }}>
                  {card.label}
                </span>
              }
              iconBgColor="#FFFFFF"
              textSize="text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

function IssueList({
  tab,
  issues,
  onRaiseIssue,
}: {
  tab: string;
  issues: StudentWellbeingIssueListItem[];
  onRaiseIssue: () => void;
}) {
  return (
    <div className="mx-auto mt-6 flex w-full max-w-3xl flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between px-2">
        <h2 className="text-lg font-bold capitalize text-[#16284F] sm:text-xl">
          {tab} Issues
        </h2>
        <button
          type="button"
          onClick={onRaiseIssue}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#43C17A] px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#36a666] sm:px-4 sm:text-base"
        >
          <span className="flex h-5 w-5 items-center justify-center text-xl font-semibold leading-none">
            +
          </span>
          <span className="leading-none">Raise Issue</span>
        </button>
      </div>

      <div className="min-h-[500px] flex-1">
        {issues.length ? (
          issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} showActions={false} />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No issues found.
          </div>
        )}
      </div>
    </div>
  );
}

function IssueForm() {
  return (
    <div className="mx-auto mt-8 flex min-h-[600px] w-full max-w-2xl flex-1 flex-col overflow-hidden rounded-2xl bg-[#E8E8E8] shadow-sm">
      <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-r from-[#205B3A] to-[#43C17A] px-5 py-6 text-white sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute rounded-full bg-white/25"
          style={{ width: 150, height: 150, right: -25, top: -55 }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-white/20"
          style={{ width: 80, height: 80, right: 75, bottom: -40 }}
        />
        <h1 className="relative z-10 text-lg font-bold sm:text-xl">
          Raise Wellbeing Issue
        </h1>
        <p className="relative z-10 mt-1.5 max-w-md text-xs leading-snug text-white/90 sm:mt-2 sm:text-sm">
          Fill in the details below. Every submission is tracked and resolved
          transparently.
        </p>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-y-5">
          <TextInput label="Full Name" value="Accountant Gk" readOnly />
          <TextInput label="Email address" value="accountant@gk.edu" readOnly />
          <TextInput label="Issue Title" placeholder="Enter Issue Title" />

          <Field label="Issue Visibility" required>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded border border-[#D0D0D0] text-xs text-[#555555] transition-colors hover:bg-black/5 sm:gap-2 sm:text-sm"
              >
                <div className="h-4 w-4 flex-shrink-0 rounded-full border border-gray-400 bg-transparent" />
                Executive
              </button>
              <button
                type="button"
                className="flex h-10 cursor-default items-center justify-center gap-1.5 rounded border border-[#16284F] bg-[#16284F] text-xs text-white sm:gap-2 sm:text-sm"
              >
                <CheckCircle size={16} weight="fill" />
                Manager
              </button>
            </div>
          </Field>

          <Field label="Applies To" required>
            <div className="flex w-full flex-wrap items-center gap-6 rounded border border-[#D0D0D0] bg-transparent px-4 py-[9px]">
              {["college", "hostel", "both"].map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className="flex cursor-pointer items-center gap-2 text-sm capitalize text-[#555555]"
                >
                  <div
                    className={`h-4 w-4 flex-shrink-0 rounded-full ${
                      index === 0
                        ? "border-4 border-[#16284F]"
                        : "border border-gray-400"
                    }`}
                  />
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <SelectField label="Priority" value="Medium" />
          <SelectField label="Category" value="Technical Issue" />
          <SelectField label="Subcategory" value="Portal Access" />

          <div className="col-span-1 sm:col-span-2">
            <Field label="Description" required>
              <textarea
                placeholder="Describe your issue in detail................"
                className="h-28 w-full resize-none rounded border border-[#D0D0D0] bg-transparent px-4 py-3 text-sm text-[#555555] outline-none placeholder:text-[#8A8A8A] sm:h-32"
              />
            </Field>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Attachments">
              <div className="flex min-h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#43C17A] bg-[#F3F3F3] p-6 text-center transition-colors hover:bg-[#43C17A]/5">
                <UploadSimple size={42} className="text-[#8A8A8A]" />
                <p className="mt-2 text-sm text-[#8A8A8A]">
                  Drag & Drop Your File here or
                </p>
                <button
                  type="button"
                  className="mt-2 cursor-pointer rounded bg-[#43C17A] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#38a869] sm:text-sm"
                >
                  Browse Files
                </button>
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex w-full items-center gap-3 rounded-lg border border-[#0090FF24] bg-[#0083E80D] px-4 py-3 sm:mt-8">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#0090FF24] text-[#0084E8] sm:h-10 sm:w-10">
            <ClockCountdownIcon size={20} className="sm:h-[22px] sm:w-[22px]" />
          </div>
          <p className="text-[11px] font-semibold leading-snug text-[#0585D9] sm:text-xs">
            Our team will review your complaint and respond within 24-48 hours.
          </p>
        </div>

        <div className="mb-4 mt-8 flex justify-center">
          <button
            type="button"
            className="h-12 w-full max-w-[250px] cursor-pointer rounded-lg bg-[#16284F] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#0f1c38] sm:h-14 sm:text-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  readOnly,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <Field label={label} required>
      <input
        value={value}
        readOnly={readOnly}
        placeholder={placeholder || label}
        className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none placeholder:text-[#8A8A8A]"
      />
    </Field>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label} required>
      <button
        type="button"
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded border border-[#D0D0D0] bg-transparent px-4 text-left text-sm text-[#555555]"
      >
        {value}
        <span className="text-xs text-[#8A8A8A]">v</span>
      </button>
    </Field>
  );
}

export default function AccountantWellbeingSupportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <AccountantWellbeingSupportContent />
    </Suspense>
  );
}
