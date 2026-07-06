"use client";

import {
  CalendarDot,
  CalendarDots,
  Hourglass,
  Plus,
  SealCheck,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchBonafideCertificates,
  type BonafideCertificateRecord,
  type BonafideSummary,
} from "@/lib/helpers/accountant/bonafideCertificatesAPI";
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getCurrentMonthLabel() {
  return new Date().toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function buildSummaryCards(summary: BonafideSummary): BonafideSummaryCardItem[] {
  return [
    {
      label: "Total Bonafides",
      value: formatNumber(summary.total),
      helper: "All time",
      icon: SealCheck,
      tone: "blue",
    },
    {
      label: "Issued This Month",
      value: formatNumber(summary.issuedThisMonth),
      helper: getCurrentMonthLabel(),
      icon: CalendarDots,
      tone: "green",
    },
    {
      label: "Issued Today",
      value: formatNumber(summary.issuedToday),
      helper: "Today",
      icon: CalendarDot,
      tone: "orange",
    },
    {
      label: "Pending / Draft",
      value: formatNumber(summary.pendingDraft),
      helper: "Not yet generated",
      icon: Hourglass,
      tone: "amber",
    },
  ];
}

export function BonafideCertificatesScreen({
  onSelectTransferCertificate,
}: {
  onSelectTransferCertificate: () => void;
}) {
  const [activeView, setActiveView] = useState<"list" | "create" | "preview">("list");
  const { collegeId, loading: userLoading } = useUser();
  const [certificates, setCertificates] = useState<BonafideCertificateRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("All");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState<"All" | "Issued" | "Draft">("All");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [summary, setSummary] = useState<BonafideSummary>({
    total: 0,
    issuedThisMonth: 0,
    issuedToday: 0,
    pendingDraft: 0,
  });
  const [selectedCertificate, setSelectedCertificate] =
    useState<BonafideCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (userLoading) return;

    let isActive = true;

    async function loadBonafides() {
      if (!collegeId) {
        setCertificates([]);
        setSummary({
          total: 0,
          issuedThisMonth: 0,
          issuedToday: 0,
          pendingDraft: 0,
        });
        setAcademicYears([]);
        setError("College context is unavailable for this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchBonafideCertificates({
          collegeId,
          academicYear: selectedAcademicYear,
          search: debouncedSearch,
          status,
          dateIssued: selectedDate || undefined,
        });

        if (!isActive) return;

        setCertificates(result.certificates);
        setSummary(result.summary);
        setAcademicYears(result.academicYears);
      } catch (err) {
        if (!isActive) return;

        console.error("Failed to load bonafide certificates", err);
        setError("Unable to load bonafide certificates right now.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    const timeoutId = window.setTimeout(loadBonafides, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [collegeId, refreshKey, selectedAcademicYear, debouncedSearch, status, selectedDate, userLoading]);

  const summaryCards = useMemo(() => buildSummaryCards(summary), [summary]);
  const filteredCertificates = certificates;

  if (activeView === "create") {
    return (
      <BonafideCreateForm
        initialCertificate={selectedCertificate}
        onCancel={() => setActiveView("list")}
        onSave={() => {
          setRefreshKey((key) => key + 1);
          setActiveView("list");
        }}
      />
    );
  }

  if (activeView === "preview") {
    return (
      <BonafidePreviewScreen
        certificate={selectedCertificate}
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
          onClick={() => {
            setSelectedCertificate(null);
            setActiveView("create");
          }}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(67,193,122,0.18)]"
        >
          <Plus size={16} weight="bold" />
          Create Bonafide
        </button>
      </section>

      <section className="flex flex-wrap gap-5">
        {summaryCards.map((item) => (
          <BonafideSummaryCard key={item.label} item={item} isLoading={isLoading || userLoading} />
        ))}
      </section>

      <BonafideCertificatesTable
        academicYears={academicYears}
        certificates={filteredCertificates as BonafideCertificate[]}
        error={error}
        isLoading={isLoading || userLoading}
        search={search}
        selectedAcademicYear={selectedAcademicYear}
        status={status}
        dateIssued={selectedDate}
        onAcademicYearChange={setSelectedAcademicYear}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDateChange={setSelectedDate}
        onDeleteSuccess={() => setRefreshKey((k) => k + 1)}
        onViewCertificate={(certificate) => {
          setSelectedCertificate(certificate);
          setActiveView("preview");
        }}
        onEditCertificate={(certificate) => {
          setSelectedCertificate(certificate);
          setActiveView("create");
        }}
      />
    </div>
  );
}
