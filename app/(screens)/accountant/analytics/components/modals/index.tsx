"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  BookOpen,
  CalendarBlank,
  CalendarCheck,
  CaretLeft,
  CaretDown,
  CreditCard,
  ChartBar,
  DownloadSimple,
  FilePdf,
  FileText,
  GraduationCap,
  DotsThreeVertical,
  Eye,
  House,
  Plus,
  MinusCircle,
  Paperclip,
  Receipt,
  UserPlus,
  UploadSimple,
  Wallet,
  X,
  Truck,
  TrendUp,
} from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import {
  type AccountantEducationOption,
  type AccountantRevenueTransaction,
  fetchAccountantEducationOptions,
  fetchAccountantStudentFeeMetrics,
  formatAccountantRevenue,
} from "@/lib/helpers/accountant/accountantRevenueAPI";
import {
  type AccountantExpense,
  type AccountantExpenseSummary,
  fetchAccountantExpenses,
  fetchAccountantExpenseSummary,
} from "@/lib/helpers/accountant/accountantExpensesAPI";
import {
  type CollegeRevenueRecord,
  createCollegeRevenueRecord,
  fetchCollegeRevenueEducationOptions,
  fetchCollegeRevenueMetrics,
} from "@/lib/helpers/accountant/collegeRevenueRecordsAPI";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

ModuleRegistry.registerModules([AllCommunityModule]);

import { StatCard, RevenueStatCard, RevenueSourceCard, StudentFeesStatCard, FeeTypeCard } from "../cards";
import { RevenueExpenseChart, ExpensesByCategory, RevenueAnalyticsChart, StudentRevenueTrendChart } from "../charts";
import { PanelHeader, RevenueSourcesPanel, RevenueSourceRow, MonthlyExpensePanel, RecentTransactionsPanel, RecentFeeCollectionsTable, RecentRevenueRecordsTable } from "../panels";
import { StudentFeesScreen, RevenueManagementScreen, AnalyticsOverviewScreen } from "../screens";
import { stats, MONTH_LABELS, CATEGORY_COLORS, studentFeeRevenueSource, revenueStats, revenueSourceOverview, studentFeeStats, feeTypeSummary, recentFeeCollections } from "../shared/constants";
import { AnalyticsPageShimmer } from "../shimmers/AnalyticsPageShimmer";
import { AnalyticsShimmerVariant } from "../shared/types";

export function RevenueDetailsModal({
  record,
  onClose,
}: {
  record: (typeof recentFeeCollections)[number] | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!record) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const detailItems = [
    { label: "Revenue Source", value: "Student Fees" },
    { label: "Date", value: "23 Oct 2025" },
    { label: "Revenue Title", value: "B.Tech Semester Collection" },
    { label: "Payment Method", value: record.paymentMode },
    { label: "Amount", value: "Rs15,00,000.00", highlight: true },
    { label: "Recorded By", value: "Anuv Shetty" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-8">
      <section className="mx-auto flex max-h-[78vh] w-full max-w-[780px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E6E8EB] px-5 py-4">
          <div>
            <h2 className="text-[18px] font-bold leading-tight text-[#17213D]">
              Revenue Details
            </h2>
            <p className="mt-1 text-[11px] font-semibold text-[#525252]">
              Transaction ID: #REV-2025-1023
            </p>
          </div>
          <button
            type="button"
            aria-label="Close revenue details"
            onClick={onClose}
            className="cursor-pointer text-[#525252] hover:text-[#17213D]"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A9099]">
                Revenue Amount
              </p>
              <p className="mt-3 text-[19px] font-bold leading-tight text-[#08743B]">
                Rs15,00,000
              </p>
            </section>
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A9099]">
                Revenue Source
              </p>
              <p className="mt-3 text-[17px] font-bold leading-tight text-[#17213D]">
                Student Fees
              </p>
            </section>
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A9099]">
                Transaction Date
              </p>
              <p className="mt-3 text-[17px] font-bold leading-tight text-[#17213D]">
                23 Oct 2025
              </p>
            </section>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {detailItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-bold text-[#8A9099]">
                      {item.label}
                    </p>
                    <p
                      className={`mt-1 text-[13px] font-bold ${
                        item.highlight ? "text-[#08743B]" : "text-[#17213D]"
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-[#EEF1F4] pt-4">
                <h3 className="text-[14px] font-bold text-[#17213D]">
                  Description
                </h3>
                <div className="mt-3 rounded-md bg-[#F4F5F7] px-4 py-3">
                  <p className="text-[13px] font-medium italic leading-relaxed text-[#525252]">
                    &quot;Semester fee collection received from B.Tech students for
                    the academic year 2025-26.&quot;
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <div className="mb-4 flex items-center gap-2">
                <Paperclip size={16} weight="bold" className="text-[#08743B]" />
                <h3 className="text-[16px] font-bold text-[#17213D]">
                  Attachments
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Fee Collection Report.pdf", meta: "2.4 MB - PDF Document" },
                  { title: "Transaction Receipt.pdf", meta: "840 KB - PDF Document" },
                ].map((file) => (
                  <article
                    key={file.title}
                    className="rounded-md border border-[#DDE3EA] bg-[#FAFBFC] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#FFECEC] text-[#FF5757]">
                        <FilePdf size={18} weight="fill" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold leading-tight text-[#17213D]">
                          {file.title}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-[#8A9099]">
                          {file.meta}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="flex h-8 cursor-pointer items-center justify-center gap-1 rounded-md bg-[#F0F2F4] text-[11px] font-bold text-[#525252]"
                      >
                        <Eye size={13} weight="bold" />
                        View
                      </button>
                      <button
                        type="button"
                        className="flex h-8 cursor-pointer items-center justify-center gap-1 rounded-md border border-[#08743B] bg-white text-[11px] font-bold text-[#08743B]"
                      >
                        <DownloadSimple size={13} weight="bold" />
                        Download
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#BFC9D5] text-[12px] font-bold text-[#6B7280]"
              >
                <Plus size={14} weight="bold" />
                Add Attachment
              </button>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}


export function AddRevenueRecordModal({
  isOpen,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void | Promise<void>;
}) {
  const { accountantId, collegeId, userId } = useUser();
  const [educationOptions, setEducationOptions] = useState<
    AccountantEducationOption[]
  >([]);
  const [selectedEducationIds, setSelectedEducationIds] = useState<number[]>([]);
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const [revenueSource, setRevenueSource] = useState("");
  const [revenueTitle, setRevenueTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isEducationLoading, setIsEducationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const educationDropdownRef = useRef<HTMLDivElement>(null);
  const selectedEducations = educationOptions.filter((education) =>
    selectedEducationIds.includes(education.collegeEducationId),
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    const loadEducationOptions = async () => {
      setIsEducationLoading(true);
      setFormError("");

      try {
        const options = await fetchCollegeRevenueEducationOptions(
          accountantId,
          collegeId,
        );
        if (!isCurrent) return;
        setEducationOptions(options);
        setSelectedEducationIds((current) => {
          const validIds = current.filter((id) =>
            options.some((option) => option.collegeEducationId === id),
          );
          return validIds.length > 0
            ? validIds
            : options.length === 1
              ? [options[0].collegeEducationId]
              : [];
        });
      } catch (error) {
        console.error("Unable to load revenue education types", error);
        if (isCurrent) {
          setEducationOptions([]);
          setSelectedEducationIds([]);
          setFormError("Unable to load assigned education types.");
        }
      } finally {
        if (isCurrent) setIsEducationLoading(false);
      }
    };

    void loadEducationOptions();
    return () => {
      isCurrent = false;
    };
  }, [accountantId, collegeId, isOpen]);

  useEffect(() => {
    if (!isEducationDropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        educationDropdownRef.current &&
        !educationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEducationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isEducationDropdownOpen]);

  const resetForm = () => {
    setSelectedEducationIds([]);
    setIsEducationDropdownOpen(false);
    setRevenueSource("");
    setRevenueTitle("");
    setAmount("");
    setDateReceived("");
    setPaymentMethod("");
    setDescription("");
    setAttachments([]);
    setFormError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!collegeId || !userId) {
      setFormError("Unable to identify the current accountant and college.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCollegeRevenueRecord({
        revenueSource,
        revenueTitle,
        amount: Number(amount),
        dateReceived,
        paymentMethod,
        description,
        collegeId,
        collegeEducationIds: selectedEducationIds,
        createdBy: userId,
        attachments,
      });
      await onSaved?.();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Unable to save revenue record", error);
      setFormError(
        error instanceof Error ? error.message : "Unable to save revenue record.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (size: number) =>
    size >= 1024 * 1024
      ? `${(size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(size / 1024))} KB`;

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const uniqueFiles = selectedFiles.filter(
      (file) =>
        !attachments.some(
          (current) =>
            current.name === file.name &&
            current.size === file.size &&
            current.lastModified === file.lastModified,
        ),
    );

    if (attachments.length + uniqueFiles.length > 5) {
      setFormError("You can upload a maximum of 5 attachments.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setAttachments((current) => [...current, ...uniqueFiles]);
    event.target.value = "";
  };

  if (!isOpen) return null;

  const inputClass =
    "h-10 rounded-md border border-[#DDE3EA] bg-white px-3 text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#9AA4B2] focus:border-[#24C96F]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6">
      <section className="mx-auto flex max-h-[calc(100vh-48px)] w-full max-w-[660px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 px-8 py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#23B66F]">
              <CreditCard size={18} weight="fill" />
            </span>
            <div>
              <h2 className="text-[20px] font-bold leading-tight text-[#17213D]">
                Add Revenue Record
              </h2>
              <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
                Record a new revenue transaction received by the institution.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close add revenue record modal"
            onClick={handleClose}
            className="cursor-pointer text-[#8A9099] hover:text-[#17213D]"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <form
          id="add-revenue-record-form"
          onSubmit={handleSubmit}
          className="custom-scrollbar flex-1 overflow-y-auto px-8 pb-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Revenue Source <span className="text-[#E5484D]">*</span>
              </span>
              <select
                required
                value={revenueSource}
                onChange={(event) => setRevenueSource(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Select Revenue Source</option>
                <option value="Student Fees">Student Fees</option>
                <option value="Hostel Fees">Hostel Fees</option>
                <option value="Transport Fees">Transport Fees</option>
                <option value="Examination Fees">Examination Fees</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <div
              ref={educationDropdownRef}
              className="relative flex flex-col gap-2"
            >
              <span className="text-[12px] font-bold text-[#17213D]">
                Education Type <span className="text-[#E5484D]">*</span>
              </span>
              <div
                role="button"
                tabIndex={
                  isEducationLoading || educationOptions.length === 0 ? -1 : 0
                }
                aria-haspopup="listbox"
                aria-expanded={isEducationDropdownOpen}
                aria-disabled={isEducationLoading || educationOptions.length === 0}
                onClick={() => {
                  if (!isEducationLoading && educationOptions.length > 0) {
                    setIsEducationDropdownOpen((current) => !current);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (!isEducationLoading && educationOptions.length > 0) {
                      setIsEducationDropdownOpen((current) => !current);
                    }
                  }
                }}
                className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-[#DDE3EA] bg-white px-3 py-1 text-left text-[12px] font-medium text-[#17213D] outline-none focus:border-[#24C96F] aria-disabled:cursor-not-allowed aria-disabled:bg-[#F4F5F7] aria-disabled:opacity-60"
              >
                {selectedEducations.length > 0 ? (
                  <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                    {selectedEducations.map((education) => (
                      <span
                        key={education.collegeEducationId}
                        className="flex max-w-full items-center gap-1.5 rounded-full bg-[#DFF3E7] py-1 pl-2.5 pr-1 text-[11px] font-bold text-[#086C20]"
                      >
                        <span className="truncate">
                          {education.collegeEducationType}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${education.collegeEducationType}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedEducationIds((current) =>
                              current.filter(
                                (id) => id !== education.collegeEducationId,
                              ),
                            );
                          }}
                          className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[#BFE5CC]"
                        >
                          <X size={10} weight="bold" />
                        </button>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="truncate">
                    {isEducationLoading
                      ? "Loading education types..."
                      : educationOptions.length > 0
                        ? "Select an education type"
                        : "No assigned education types"}
                  </span>
                )}
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`shrink-0 transition-transform ${
                    isEducationDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isEducationDropdownOpen && (
                <div
                  role="listbox"
                  aria-multiselectable="true"
                  className="custom-scrollbar absolute left-0 right-0 top-full z-40 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#DDE3EA] bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.16)]"
                >
                  {educationOptions.map((education) => {
                    const isSelected = selectedEducationIds.includes(
                      education.collegeEducationId,
                    );

                    return (
                      <button
                        key={education.collegeEducationId}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() =>
                          setSelectedEducationIds((current) =>
                            isSelected
                              ? current.filter(
                                  (id) =>
                                    id !== education.collegeEducationId,
                                )
                              : [...current, education.collegeEducationId],
                          )
                        }
                        className={`block w-full cursor-pointer rounded px-3 py-2 text-left text-[12px] font-medium hover:bg-[#EAF6EE] ${
                          isSelected
                            ? "bg-[#DFF3E7] font-bold text-[#086C20]"
                            : "text-[#17213D]"
                        }`}
                      >
                        {education.collegeEducationType}
                      </button>
                    );
                  })}
                </div>
              )}
              <span className="text-[10px] font-medium text-[#6B7280]">
                Select assigned education types. Use X to remove them.
              </span>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Revenue Title <span className="text-[#E5484D]">*</span>
              </span>
              <input
                type="text"
                required
                minLength={3}
                maxLength={255}
                value={revenueTitle}
                onChange={(event) => setRevenueTitle(event.target.value)}
                placeholder="Enter revenue title"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Amount <span className="text-[#E5484D]">*</span>
              </span>
              <div className="flex h-10 items-center rounded-md border border-[#DDE3EA] bg-white px-3 focus-within:border-[#24C96F]">
                <span className="mr-2 text-[12px] font-semibold text-[#8A9099]">
                  Rs
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  onWheel={(event) => event.currentTarget.blur()}
                  placeholder="Enter amount"
                  className="w-full bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#9AA4B2]"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Date Received <span className="text-[#E5484D]">*</span>
              </span>
              <input
                type="date"
                required
                value={dateReceived}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => setDateReceived(event.target.value)}
                className={inputClass}
                style={{ colorScheme: "light" }}
              />
            </label>
          </div>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Payment Method <span className="text-[#E5484D]">*</span>
            </span>
            <select
              required
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select payment method</option>
              <option value="UPI">UPI</option>
              <option value="Cash">By Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Card">Card</option>
            </select>
          </label>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Description
            </span>
            <div className="rounded-md border border-[#DDE3EA] bg-white px-3 py-3 focus-within:border-[#24C96F]">
              <textarea
                maxLength={255}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter details about this revenue transaction..."
                className="min-h-[82px] w-full resize-none bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#9AA4B2]"
              />
              <p className="text-right text-[10px] font-medium text-[#9AA4B2]">
                {description.length} / 255
              </p>
            </div>
          </label>

          <div className="mt-5">
            <p className="text-[12px] font-bold text-[#17213D]">
              Attachment <span className="font-medium text-[#9AA4B2]">(Optional)</span>
            </p>
            <label className="mt-2 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#BFC9D5] bg-white px-4 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
              />
              <UploadSimple size={24} weight="bold" className="text-[#16A765]" />
              <span className="mt-4 text-[12px] font-bold text-[#17213D]">
                Drag and drop files here or{" "}
                <span className="text-[#08743B] underline">click to browse</span>
              </span>
              <span className="mt-1 text-[10px] font-medium text-[#9AA4B2]">
                Supports PDF, JPG, PNG, XLS, XLSX (Max. 10MB each)
              </span>
              {attachments.length > 0 && (
                <span className="mt-2 text-[10px] font-bold text-[#08743B]">
                  {attachments.length} file{attachments.length === 1 ? "" : "s"} selected
                </span>
              )}
            </label>
            <p className="mt-2 text-[10px] font-medium text-[#6B7280]">
              You can upload multiple files
            </p>
            {attachments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-[#DCE5DC] bg-[#F7FAF8] px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText
                        size={18}
                        weight="fill"
                        className="shrink-0 text-[#147A3D]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold text-[#17213D]">
                          {file.name}
                        </span>
                        <span className="block text-[10px] text-[#6B7280]">
                          {formatFileSize(file.size)}
                        </span>
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter(
                            (_, fileIndex) => fileIndex !== index,
                          ),
                        )
                      }
                      className="shrink-0 cursor-pointer rounded-full p-1 text-[#D14343] hover:bg-red-50"
                    >
                      <X size={15} weight="bold" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {formError && (
            <p role="alert" className="mt-4 text-[12px] font-semibold text-red-600">
              {formError}
            </p>
          )}
        </form>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-[#EEF1F4] bg-white px-8 py-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-10 min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[#E3E8EF] bg-white px-5 text-[12px] font-bold text-[#17213D]"
          >
            <X size={13} weight="bold" />
            Cancel
          </button>
          <button
            type="submit"
            form="add-revenue-record-form"
            disabled={
              isSubmitting ||
              isEducationLoading ||
              educationOptions.length === 0 ||
              selectedEducationIds.length === 0
            }
            className="flex h-10 min-w-[230px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#08743B] px-5 text-[12px] font-bold text-white shadow-[0_6px_12px_rgba(8,116,59,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Receipt size={13} weight="bold" />
            {isSubmitting ? "Saving..." : "Save Revenue Record"}
          </button>
        </footer>
      </section>
    </div>
  );
}


