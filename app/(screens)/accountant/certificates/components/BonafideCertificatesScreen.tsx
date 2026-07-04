"use client";

import {
  CalendarDot,
  CalendarDots,
  Hourglass,
  Plus,
  SealCheck,
} from "@phosphor-icons/react";
import { useState } from "react";

import { BonafideCreateForm } from "./BonafideCreateForm";
import { BonafidePreviewScreen } from "./BonafidePreviewScreen";
import {
  BonafideSummaryCard,
  type BonafideSummaryCardItem,
} from "./BonafideSummaryCard";
import {
  BonafideCertificatesTable,
  type BonafideCertificate,
} from "./BonafideCertificatesTable";

const summaryCards: BonafideSummaryCardItem[] = [
  {
    label: "Total Bonafides",
    value: "1,248",
    helper: "All time",
    icon: SealCheck,
    tone: "blue",
  },
  {
    label: "Issued This Month",
    value: "132",
    helper: "May 2025",
    icon: CalendarDots,
    tone: "green",
  },
  {
    label: "Issued Today",
    value: "14",
    helper: "Today",
    icon: CalendarDot,
    tone: "orange",
  },
  {
    label: "Pending / Draft",
    value: "18",
    helper: "Not yet generated",
    icon: Hourglass,
    tone: "amber",
  },
];

const bonafideCertificates: BonafideCertificate[] = [
  {
    bonafideNo: "BF/24-25/01248",
    studentName: "Arun Kumar",
    educationType: "B.Tech",
    branch: "CSE",
    purpose: "Education Loan",
    dateIssued: "20 May 2025",
    status: "Issued",
  },
  {
    bonafideNo: "BF/24-25/01247",
    studentName: "Sneha Reddy",
    educationType: "B.Tech",
    branch: "IT",
    purpose: "Higher Studies",
    dateIssued: "19 May 2025",
    status: "Issued",
  },
  {
    bonafideNo: "BF/24-25/01246",
    studentName: "Vikram Singh",
    educationType: "B.Tech",
    branch: "ME",
    purpose: "Visa",
    dateIssued: "19 May 2025",
    status: "Issued",
  },
  {
    bonafideNo: "BF/24-25/01245",
    studentName: "Pooja Nair",
    educationType: "B.Tech",
    branch: "ECE",
    purpose: "Bank Account",
    dateIssued: "18 May 2025",
    status: "Draft",
  },
  {
    bonafideNo: "BF/24-25/01244",
    studentName: "Karthik Babu",
    educationType: "B.Tech",
    branch: "CSE",
    purpose: "Scholarship",
    dateIssued: "18 May 2025",
    status: "Issued",
  },
];

export function BonafideCertificatesScreen({
  onSelectTransferCertificate,
}: {
  onSelectTransferCertificate: () => void;
}) {
  const [activeView, setActiveView] = useState<"list" | "create" | "preview">("list");

  if (activeView === "create") {
    return (
      <BonafideCreateForm
        onCancel={() => setActiveView("list")}
        onSave={() => setActiveView("list")}
      />
    );
  }

  if (activeView === "preview") {
    return (
      <BonafidePreviewScreen
        onBackToEdit={() => setActiveView("create")}
        onCancel={() => setActiveView("list")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="flex flex-wrap items-center gap-4 text-[24px] font-bold leading-tight md:text-[28px]">
          <span className="text-[#43C17A]">Bonafides</span>
          <span className="text-[#17213D]">/</span>
          <button
            type="button"
            onClick={onSelectTransferCertificate}
            className="cursor-pointer text-[#17213D] transition-colors hover:text-[#43C17A]"
          >
            Transfer Certificate
          </button>
        </h1>
        <p className="mt-1 text-[13px] font-medium text-[#7B8AA3]">
          Create, review, and issue student certificate requests.
        </p>
      </section>

      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold leading-tight text-[#17213D]">
            Bonafide Certificates
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#4F5E72]">
            Create, manage and track bonafide certificates
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView("create")}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(67,193,122,0.18)]"
        >
          <Plus size={16} weight="bold" />
          Create Bonafide
        </button>
      </section>

      <section className="flex flex-wrap gap-5">
        {summaryCards.map((item) => (
          <BonafideSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <BonafideCertificatesTable
        certificates={bonafideCertificates}
        onViewCertificate={() => setActiveView("preview")}
        onEditCertificate={() => setActiveView("create")}
      />
    </div>
  );
}
