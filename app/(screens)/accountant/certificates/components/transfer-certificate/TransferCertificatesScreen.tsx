"use client";

import {
  CalendarBlank,
  CaretDown,
  PencilSimple,
  Eye,
  MagnifyingGlass,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { TransferCreateForm, type TransferCertificateData } from "./TransferCreateForm";
import { TransferPreviewScreen } from "./TransferPreviewScreen";
import { TransferUploadHeaderScreen, type HeaderConfig } from "./TransferUploadHeaderScreen";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import {
  deleteTransferCertificate,
  fetchTransferCertificates,
  fetchTransferHeader,
  saveTransferCertificate,
  type TransferCertificateRecord,
  upsertTransferHeader,
} from "@/lib/helpers/accountant/transferCertificatesAPI";

type TCCertificate = TransferCertificateRecord;

const DEFAULT_ITEMS_PER_PAGE = 10;

const statusClasses: Record<TCCertificate["status"], string> = {
  Generated: "bg-[#CFF7CB] text-[#16803A]",
  Saved: "bg-[#E0E7FF] text-[#4338CA]",
  Draft: "bg-[#FFF4DB] text-[#D97706]",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybeError = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    return [maybeError.message, maybeError.details, maybeError.hint, maybeError.code]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" ");
  }

  return String(error);
}

function formatDateRangeLabel(startDate: string, endDate: string) {
  const format = (value: string) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  if (startDate && endDate) return `${format(startDate)} - ${format(endDate)}`;
  if (startDate) return `From ${format(startDate)}`;
  if (endDate) return `Until ${format(endDate)}`;

  return "Select date range";
}

function TransferTableShimmer() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <tr key={`transfer-shimmer-${rowIndex}`}>
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <td key={`transfer-shimmer-${rowIndex}-${cellIndex}`} className="px-5 py-5">
              <div
                className={`h-4 animate-pulse rounded bg-slate-200 ${
                  cellIndex === 1 ? "w-32" : cellIndex === 5 ? "w-28" : cellIndex === 7 ? "ml-auto w-20" : "w-20"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TransferCertificatesScreen({
  onSelectBonafides,
}: {
  onSelectBonafides: () => void;
}) {
  const { collegeId, userId, loading: userLoading } = useUser();
  const [view, setView] = useState<"list" | "create" | "preview" | "upload-header">("list");
  const [certificates, setCertificates] = useState<TCCertificate[]>([]);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [currentCertData, setCurrentCertData] = useState<TransferCertificateData | null>(null);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    collegeName: "RATNAPURI INSTITUTE OF TECHNOLOGY COLLEGE OF POLYTECHNIC",
    affiliation: "(Affiliated to State Board of Technical Education)",
    address: "RATNAPURI, Turkala Khanapur (V), Hathnoora Mandal, Sangareddy District, Telangana State.",
    phone: "08458-288974, 9505504219"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter dropdown state
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [appliedDateRange, setAppliedDateRange] = useState({ start: "", end: "" });
  const courseDropdownRef = useRef<HTMLLabelElement>(null);
  const statusDropdownRef = useRef<HTMLLabelElement>(null);
  const dateRangeRef = useRef<HTMLDivElement>(null);

  // Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<TCCertificate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (userLoading) return;

    let isActive = true;

    async function loadTransferCertificates() {
      if (!collegeId) {
        setCertificates([]);
        setTotalCertificates(0);
        setError("College context is unavailable for this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const page = await fetchTransferCertificates({
          collegeId,
          page: currentPage,
          itemsPerPage,
          search: debouncedSearch,
        });

        if (!isActive) return;

        setCertificates(page.records);
        setTotalCertificates(page.total);
      } catch (err) {
        if (!isActive) return;
        console.error("Failed to load transfer certificates", getErrorMessage(err), err);
        setError("Unable to load transfer certificates right now.");
      } finally {
        if (isActive) setIsLoading(false);
      }

      try {
        const header = await fetchTransferHeader(collegeId);
        if (isActive && header) setHeaderConfig(header);
      } catch (err) {
        console.warn("Failed to load transfer certificate header", getErrorMessage(err), err);
      }
    }

    loadTransferCertificates();

    return () => {
      isActive = false;
    };
  }, [collegeId, currentPage, debouncedSearch, itemsPerPage, refreshKey, userLoading]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (courseDropdownRef.current && !courseDropdownRef.current.contains(target)) {
        setCourseDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setStatusDropdownOpen(false);
      }
      if (dateRangeRef.current && !dateRangeRef.current.contains(target)) {
        setDateRangeOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  // Trigger TC Generation
  const handlePreviewTC = (data: TransferCertificateData) => {
    setCurrentCertData(data);
    setView("preview");
  };

  const handleUploadHeader = async (data: TransferCertificateData) => {
    setCurrentCertData(data);

    if (!collegeId) {
      toast.error("College context is unavailable for this account.");
      return;
    }

    try {
      const header = await fetchTransferHeader(collegeId);
      if (header) setHeaderConfig(header);
    } catch (err) {
      console.warn("Failed to check transfer certificate header", getErrorMessage(err), err);
    }

    setView("upload-header");
  };

  const handleSaveOrGenerate = async (saveStatus: "Draft" | "Saved" | "Generated") => {
    if (!currentCertData) return;
    if (!collegeId || !userId) {
      toast.error("College or user context is unavailable.");
      return;
    }
    if (!currentCertData.studentId) {
      toast.error("Student record is missing. Please search the student again.");
      return;
    }

    try {
      await saveTransferCertificate({
        collegeTcId: currentCertData.collegeTcId,
        collegeId,
        studentId: currentCertData.studentId,
        collegeTcNo: currentCertData.tcNo,
        issuedDate: currentCertData.date,
        classAtTimeOfLeaving: currentCertData.classAtLeaving,
        dateOfAdmission: currentCertData.dateOfAdmission,
        dateOfLeaving: currentCertData.dateOfLeaving,
        conductRemarks: currentCertData.conductRemarks,
        reasonForLeaving: currentCertData.reasonForLeaving,
        candidateCategory: currentCertData.belongsToScStBc,
        candidateScholarship: currentCertData.receiptOfScholarship === "Yes",
        otherRemarks: currentCertData.otherRemarks,
        issuedBy: userId,
        saveStatus,
      });

      let msg = "PDF generated and downloaded successfully!";
      if (saveStatus === "Draft") msg = "TC saved as draft!";
      else if (saveStatus === "Saved") msg = "TC saved successfully!";
      toast.success(msg);
      setRefreshKey((key) => key + 1);
      setView("list");
      setCurrentCertData(null);
    } catch (err) {
      const message = getErrorMessage(err);
      console.error("Failed to save transfer certificate", message, err);
      toast.error(message || "Unable to save transfer certificate right now.");
    }
  };

  const handleDeleteTrigger = (cert: TCCertificate) => {
    setCertToDelete(cert);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTransferCertificate(certToDelete.collegeTcId);
      setCertificates((prev) => prev.filter((item) => item.collegeTcId !== certToDelete.collegeTcId));
      setTotalCertificates((prev) => Math.max(prev - 1, 0));
      toast.success("Transfer Certificate deleted successfully");
      setDeleteModalOpen(false);
      setCertToDelete(null);
    } catch (err) {
      console.error("Failed to delete transfer certificate", err);
      toast.error("Unable to delete transfer certificate right now.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered certificates computed property
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesCourse =
        courseFilter === "All" ||
        `${cert.course} ${cert.subCourse}`.toLowerCase().includes(courseFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || cert.status.toLowerCase() === statusFilter.toLowerCase();

      const leavingDate = new Date(cert.dateOfLeaving);
      const fromDate = appliedDateRange.start ? new Date(appliedDateRange.start) : null;
      const toDate = appliedDateRange.end ? new Date(appliedDateRange.end) : null;
      const matchesDateRange =
        (!fromDate || leavingDate >= fromDate) &&
        (!toDate || leavingDate <= toDate);

      return matchesCourse && matchesStatus && matchesDateRange;
    });
  }, [appliedDateRange.end, appliedDateRange.start, certificates, courseFilter, statusFilter]);

  // List of distinct courses for dropdown filter
  const distinctCourses = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          certificates
            .map((certificate) => `${certificate.course} ${certificate.subCourse}`.trim())
            .filter(Boolean),
        ),
      ),
    ],
    [certificates],
  );

  if (view === "create") {
    return (
      <TransferCreateForm
        initialCertificate={currentCertData}
        onCancel={() => {
          setView("list");
          setCurrentCertData(null);
        }}
        onPreview={handlePreviewTC}
        onUploadHeader={handleUploadHeader}
      />
    );
  }

  if (view === "upload-header") {
    return (
      <TransferUploadHeaderScreen
        key={[
          headerConfig.collegeName,
          headerConfig.affiliation,
          headerConfig.address,
          headerConfig.phone,
          headerConfig.logoUrl,
        ].join("|")}
        config={headerConfig}
        onCancel={() => setView("create")}
        onSave={async (updatedConfig) => {
          if (!collegeId || !userId) {
            toast.error("College or user context is unavailable.");
            throw new Error("College or user context is unavailable.");
          }

          if (!currentCertData?.studentId) {
            toast.error("Student record is missing. Please search the student again.");
            throw new Error("Student record is missing.");
          }

          try {
            const saved = await saveTransferCertificate({
              collegeTcId: currentCertData.collegeTcId,
              collegeId,
              studentId: currentCertData.studentId,
              collegeTcNo: currentCertData.tcNo,
              issuedDate: currentCertData.date,
              classAtTimeOfLeaving: currentCertData.classAtLeaving,
              dateOfAdmission: currentCertData.dateOfAdmission,
              dateOfLeaving: currentCertData.dateOfLeaving,
              conductRemarks: currentCertData.conductRemarks,
              reasonForLeaving: currentCertData.reasonForLeaving,
              candidateCategory: currentCertData.belongsToScStBc,
              candidateScholarship: currentCertData.receiptOfScholarship === "Yes",
              otherRemarks: currentCertData.otherRemarks,
              issuedBy: userId,
              saveStatus: "Saved",
            });

            let nextHeaderConfig = headerConfig;

            if (!headerConfig.collegeTcHeaderId) {
              const header = await upsertTransferHeader({ collegeId, userId, config: updatedConfig });
              nextHeaderConfig = {
                ...updatedConfig,
                collegeTcHeaderId: header.collegeTcHeaderId,
              };
            }

            setCurrentCertData({
              ...currentCertData,
              collegeTcId: saved.collegeTcId,
            });
            setHeaderConfig(nextHeaderConfig);
            setRefreshKey((key) => key + 1);
            toast.success(
              headerConfig.collegeTcHeaderId
                ? "TC details saved successfully."
                : "TC details and header saved successfully.",
            );
            setView("preview");
          } catch (err) {
            const message = getErrorMessage(err);
            console.error("Failed to save transfer certificate and header", message, err);
            toast.error(message || "Unable to save TC details and header right now.");
            throw err;
          }
        }}
        onDraft={() => {
          handleSaveOrGenerate("Draft");
        }}
      />
    );
  }

  if (view === "preview" && currentCertData) {
    return (
      <TransferPreviewScreen
        data={currentCertData}
        headerConfig={headerConfig}
        onBack={() => setView("create")}
        onCancel={() => setView("create")}
        onGenerate={handleSaveOrGenerate}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <section>
        <h1 className="flex flex-wrap items-center gap-3 text-[20px] font-bold leading-tight md:text-[24px]">
          <button
            type="button"
            onClick={onSelectBonafides}
            className="cursor-pointer text-[#17213D] transition-colors hover:text-[#43C17A]"
          >
            Bonafides
          </button>
          <span className="text-[#17213D]">/</span>
          <span className="text-[#43C17A]">Transfer Certificate</span>
        </h1>
        <p className="mt-1 text-[12px] font-medium text-[#7B8AA3]">
          Create, review, and issue student certificate requests.
        </p>
      </section>

      {/* Action panel */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[22px] font-bold text-[#17213D]">
          Transfer Certificates (TC)
        </h2>

        <button
          type="button"
          onClick={() => setView("create")}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(67,193,122,0.18)] hover:bg-[#349c61] transition-all"
        >
          <Plus size={15} weight="bold" />
          Create TC
        </button>
      </section>

      {/* Filter panel */}
      <section className="rounded-lg border border-[#E7ECF3] bg-white px-5 py-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_170px_170px_220px]">
          {/* Search box */}
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">
              Search Students
            </span>
            <span className="flex h-10 items-center gap-2 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-[#637089] focus-within:border-[#43C17A] focus-within:bg-white transition-all">
              <MagnifyingGlass size={16} weight="bold" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by TC No., Roll No., Student Name..."
                className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#8A96A8]"
              />
            </span>
          </label>

          {/* Course filter */}
          <label ref={courseDropdownRef} className="flex flex-col gap-2 relative">
            <span className="text-[11px] font-semibold text-[#303642]">Course</span>
            <button
              type="button"
              onClick={() => {
                setCourseDropdownOpen(!courseDropdownOpen);
                setStatusDropdownOpen(false);
                setDateRangeOpen(false);
              }}
              className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642] hover:bg-slate-50 transition-colors"
            >
              {courseFilter === "All" ? "All Courses" : courseFilter}
              <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
            </button>

            {courseDropdownOpen && (
              <div className="absolute top-16 left-0 w-full bg-white border border-[#E7ECF3] rounded-md shadow-lg z-20 overflow-hidden">
                {distinctCourses.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCourseFilter(c);
                      setCourseDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer text-[#303642]"
                  >
                    {c === "All" ? "All Courses" : c}
                  </button>
                ))}
              </div>
            )}
          </label>

          {/* Status filter */}
          <label ref={statusDropdownRef} className="flex flex-col gap-2 relative">
            <span className="text-[11px] font-semibold text-[#303642]">Status</span>
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setCourseDropdownOpen(false);
                setDateRangeOpen(false);
              }}
              className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642] hover:bg-slate-50 transition-colors"
            >
              {statusFilter === "All" ? "All Status" : statusFilter}
              <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute top-16 left-0 w-full bg-white border border-[#E7ECF3] rounded-md shadow-lg z-20 overflow-hidden">
                {["All", "Generated", "Saved", "Draft"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStatusFilter(s);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer text-[#303642]"
                  >
                    {s === "All" ? "All Status" : s}
                  </button>
                ))}
              </div>
            )}
          </label>

          {/* Date range */}
          <div ref={dateRangeRef} className="relative flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">
              Date Range
            </span>
            <button
              type="button"
              onClick={() => {
                setDateRangeOpen(!dateRangeOpen);
                setCourseDropdownOpen(false);
                setStatusDropdownOpen(false);
              }}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642] hover:bg-slate-50 transition-colors"
            >
              <CalendarBlank size={15} weight="regular" />
              <span className="whitespace-nowrap">
                {appliedDateRange.start || appliedDateRange.end
                  ? formatDateRangeLabel(appliedDateRange.start, appliedDateRange.end)
                  : "01 Apr 2024 - 20 May 2025"}
              </span>
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 top-16 z-20 w-[260px] rounded-md border border-[#E7ECF3] bg-white p-4 shadow-lg">
                <div className="grid gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-[#596579]">From Date</span>
                    <input
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                      className="h-10 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-[12px] font-medium text-[#17213D] outline-none transition-colors focus:border-[#43C17A] focus:bg-white"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-[#596579]">To Date</span>
                    <input
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                      className="h-10 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-[12px] font-medium text-[#17213D] outline-none transition-colors focus:border-[#43C17A] focus:bg-white"
                    />
                  </label>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDateRangeStart("");
                        setDateRangeEnd("");
                        setAppliedDateRange({ start: "", end: "" });
                        setDateRangeOpen(false);
                      }}
                      className="h-9 cursor-pointer rounded-md border border-[#C9D0D9] px-3 text-[12px] font-bold text-[#303642] transition-colors hover:bg-slate-50"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedDateRange({ start: dateRangeStart, end: dateRangeEnd });
                        setDateRangeOpen(false);
                      }}
                      className="h-9 cursor-pointer rounded-md bg-[#43C17A] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#349c61]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Table section */}
      <section className="overflow-hidden rounded-lg border border-[#E7ECF3] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[#F5F5F5] text-[10px] font-bold uppercase tracking-[0.08em] text-[#596579] border-b border-[#EDF1F6]">
              <tr>
                <th className="px-5 py-4">TC No.</th>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Roll No.</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Date of Leaving</th>
                <th className="px-5 py-4">Reason for Leaving</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6] text-[12px] text-[#303642]">
              {isLoading || userLoading ? (
                <TransferTableShimmer />
              ) : filteredCertificates.length > 0 ? (
                filteredCertificates.map((certificate, index) => (
                  <tr key={certificate.collegeTcId || `${certificate.tcNo}-${index}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-5 font-bold text-[#16803A]">
                      {certificate.tcNo}
                    </td>
                    <td className="px-5 py-5 font-bold text-[#17213D]">
                      {certificate.studentName}
                    </td>
                    <td className="px-5 py-5 font-semibold text-[#17213D]">{certificate.rollNo}</td>
                    <td className="px-5 py-5 font-medium">{`${certificate.course} ${certificate.subCourse}`}</td>
                    <td className="px-5 py-5 font-medium">
                      {new Date(certificate.dateOfLeaving).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-5 font-medium">
                      {certificate.reasonForLeaving}
                    </td>
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                          statusClasses[certificate.status]
                        }`}
                      >
                        {certificate.status}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-5 text-[#263241]">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentCertData(certificate);
                            setView("preview");
                          }}
                          aria-label={`View ${certificate.tcNo}`}
                          className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors p-1 rounded hover:bg-slate-100"
                        >
                          <Eye size={17} weight="bold" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentCertData(certificate);
                            setView("create");
                          }}
                          aria-label={`Edit ${certificate.tcNo}`}
                          className="cursor-pointer text-[#7B8AA3] hover:text-[#43C17A] transition-colors p-1 rounded hover:bg-slate-100"
                        >
                          <PencilSimple size={17} weight="bold" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteTrigger(certificate)}
                          aria-label={`Delete ${certificate.tcNo}`}
                          className="cursor-pointer text-[#7B8AA3] hover:text-[#E11D48] transition-colors p-1 rounded hover:bg-slate-100"
                        >
                          <Trash size={17} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-medium">
                    {error ?? "No transfer certificates found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={totalCertificates}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemsPerPageOptions={[10, 20, 50]}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
          disabled={isLoading || userLoading}
        />
      </section>

      {/* Deletion confirmation modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete"
        name="transfer certificate"
        isDeleting={isDeleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCertToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
      />
    </div>
  );
}
