"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  CaretDown,
  CaretRight,
  CheckCircle,
  Envelope,
  Eye,
  FileText,
  Info,
  MagnifyingGlass,
  PaperPlaneTilt,
  TrendUp,
  Users,
  Warning,
  X,
  SpinnerGap,
} from "@phosphor-icons/react";
import ApplicationViewModal from "../applications/ApplicationViewModal";
import {
  getAchieversKpiCounts as getKpiCounts,
  getAchieversRecentApplications as getRecentApplications,
  getAchieversApplicationsByYear as getApplicationsByYear,
  getAchieversAllApplications as getAllApplications,
  getAchieversTopApplications as getTopApplications,
  subscribeAchieversAnalytics as subscribeToAnalytics,
  subscribeAchieversSubmissions as subscribeToSubmissions,
  subscribeAchieversPayments as subscribeToPayments,
  unsubscribeAchieversChannel as unsubscribeChannel,
  formatCourseWithCode,
} from "@/lib/helpers/admin/achieversAdmissionsHelper";
import { formatKpiNumber } from "@/lib/helpers/numberFormatter";
import { downloadCSV } from "@/app/utils/downloadCSV";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { fetchAdmissionsCourses } from "@/lib/helpers/admin/admissionsAPI";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type Application = {
  id: string;
  applicationId?: number;
  name: string;
  course: string;
  submitted: string;
  rawDate?: string;
  payment: "Success" | "Pending" | "Failed";
  admission: "Pending" | "Verification" | "Selected" | "Regret";
  email: string;
  mobile: string;
  score: string;
  raw?: any;
};

const applications: Application[] = [
  { id: "AJC-2026-0142", name: "Aarav Reddy", course: "MPC", submitted: "Today, 10:32 AM", payment: "Success", admission: "Verification", email: "aarav.reddy@example.com", mobile: "+91 98765 43210", score: "92%" },
  { id: "AJC-2026-0141", name: "Saanvi Rao", course: "BiPC", submitted: "Today, 9:18 AM", payment: "Pending", admission: "Pending", email: "saanvi.rao@example.com", mobile: "+91 98765 43211", score: "89%" },
  { id: "AJC-2026-0140", name: "Vihaan Kumar", course: "CEC", submitted: "Yesterday, 4:45 PM", payment: "Success", admission: "Selected", email: "vihaan.kumar@example.com", mobile: "+91 98765 43212", score: "91%" },
  { id: "AJC-2026-0139", name: "Ananya Sharma", course: "MEC", submitted: "Yesterday, 2:10 PM", payment: "Failed", admission: "Pending", email: "ananya.sharma@example.com", mobile: "+91 98765 43213", score: "87%" },
  { id: "AJC-2026-0138", name: "Arjun Patel", course: "MPC", submitted: "21 Sep 2026", payment: "Success", admission: "Verification", email: "arjun.patel@example.com", mobile: "+91 98765 43214", score: "94%" },
  { id: "AJC-2026-0137", name: "Diya Nair", course: "BiPC", submitted: "20 Sep 2026", payment: "Success", admission: "Selected", email: "diya.nair@example.com", mobile: "+91 98765 43215", score: "90%" },
];

const monthlyApplications = [18, 26, 32, 29, 45, 54, 61, 58, 72, 48, 35, 24];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatusBadge({ value }: { value: Application["payment"] | Application["admission"] }) {
  const styles: Record<string, string> = {
    Success: "bg-green-100 text-green-700",
    Selected: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-700",
    Regret: "bg-red-100 text-red-700",
    Verification: "bg-blue-100 text-blue-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer transition hover:opacity-90 ${styles[value] || styles.Pending}`}>{value}</span>;
}

function EmailModal({
  count,
  selectedCandidates = [],
  onClose,
  onSuccess,
}: {
  count: number;
  selectedCandidates?: Application[];
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [template, setTemplate] = useState("Certificate Verification");
  const [confirmed, setConfirmed] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const canSendVerification = useMemo(
    () => selectedCandidates.every((candidate) => candidate.payment === "Success" && candidate.admission !== "Verification"),
    [selectedCandidates],
  );
  const canSendSelection = useMemo(
    () => selectedCandidates.every((candidate) => candidate.admission === "Verification"),
    [selectedCandidates],
  );

  const templates = [
    { title: "Certificate Verification", description: "Invite students to report for document verification.", icon: <Info size={18} weight="fill" />, color: "bg-yellow-100 text-yellow-700" },
    { title: "Selection Congratulation", description: "Congratulate students on their selection for admissions.", icon: <CheckCircle size={18} weight="fill" />, color: "bg-green-100 text-green-700" },
    { title: "Admission Regret", description: "Inform candidates that they were not placed/selected.", icon: <Warning size={18} weight="fill" />, color: "bg-red-100 text-red-700" },
  ];

  const preview = template === "Certificate Verification"
    ? { subject: "Certificate Verification Schedule - AJC-XXXXXX", body: "Dear Student,\n\nWe have reviewed your application and would like to invite you for the physical verification of your certificates and documents as part of the admission process.\n\nPlease visit the campus between 10:00 AM and 4:00 PM on any working day.\n\nBest regards,\nAdmissions Office" }
    : template === "Selection Congratulation"
      ? { subject: "Admission Selection Offer - AJC-XXXXXX", body: "Dear Student,\n\nCongratulations! We are pleased to inform you that you have been selected for admission at Achievers Junior College.\n\nBest regards,\nAdmissions Office" }
      : { subject: "Admission Application Status Update - AJC-XXXXXX", body: "Dear Student,\n\nThank you for your interest in Achievers Junior College. We regret to inform you that we are unable to offer you admission at this time.\n\nBest regards,\nAdmissions Office" };

  const handleSendEmails = async () => {
    if (!confirmed || isSending) return;

    const templateTypeMap: Record<string, "verification" | "congratulate" | "regret"> = {
      "Certificate Verification": "verification",
      "Selection Congratulation": "congratulate",
      "Admission Regret": "regret",
    };
    const templateType = templateTypeMap[template] || "verification";

    if (templateType === "verification" && !canSendVerification) {
      toast.error("Verification emails require successful payment and a status other than Verification.");
      return;
    }
    if (templateType === "congratulate" && !canSendSelection) {
      toast.error("Selection emails can only be sent after certificate verification.");
      return;
    }

    setIsSending(true);
    const sendingToastId = toast.loading("Sending emails...");

    const recipients = selectedCandidates.map((app) => ({
      applicationId: app.applicationId || app.raw?.applicationId,
      applicationNumber: app.id,
      firstName: app.raw?.firstName || app.name.split(" ")[0] || "Applicant",
      lastName: app.raw?.lastName || app.name.split(" ").slice(1).join(" ") || "",
      emailId: app.email,
      course: app.course,
      applicationFor: app.raw?.applicationFor || "Inter",
      createdAt: app.rawDate || app.submitted,
    }));

    try {
      const response = await fetch("/api/emails/send-admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, templateType }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        toast.success(`Successfully sent emails to ${recipients.length} student(s)!`, { id: sendingToastId });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(resData.error || "Failed to send emails.", { id: sendingToastId });
      }
    } catch {
      toast.error("An error occurred while sending emails.", { id: sendingToastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={!isSending ? onClose : undefined}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative flex max-h-[90vh] w-full max-w-[650px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Envelope size={24} className="text-indigo-600" /> Send Admission Emails
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a template to send to the <strong className="text-gray-800">{count}</strong> selected student(s).
            </p>
          </div>
          <button disabled={isSending} onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50">
            <X size={20} weight="bold" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-1">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Select Template Option</p>
            <div className="grid grid-cols-1 gap-3 px-0.5 md:grid-cols-3">
              {templates.map((item) => (
                <button
                  key={item.title}
                  onClick={() => { setTemplate(item.title); setConfirmed(false); }}
                  disabled={isSending}
                  className={`flex h-full cursor-pointer flex-col justify-between rounded-xl border p-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${template === item.title ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className={`mb-2 w-fit rounded-lg p-1.5 ${item.color}`}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="mt-0.5 text-[10px] leading-normal text-gray-500">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {template === "Certificate Verification" && !canSendVerification && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-normal text-amber-800">
              <Warning size={18} className="mt-0.5 shrink-0" />
                <div><strong className="text-amber-900">Verification Restriction:</strong> Students must have a successful payment status and must not already be marked for verification.</div>
              </div>
          )}
          {template === "Selection Congratulation" && !canSendSelection && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-normal text-amber-800">
              <Warning size={18} className="mt-0.5 shrink-0" />
              <div><strong className="text-amber-900">Selection Restriction:</strong> Students must complete certificate verification before a selection email can be sent.</div>
            </div>
          )}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Template Preview</span>
              <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-medium text-slate-600">Achievers Layout</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600"><strong className="text-gray-800">Subject:</strong> {preview.subject}</p>
              <p className="text-xs text-gray-600"><strong className="text-gray-800">From:</strong> Achievers Admissions &lt;admissions@gkeliteinfo.com&gt;</p>
            </div>
            <div className="h-36 overflow-y-auto whitespace-pre-line rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-gray-600">
              {preview.body}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
            <input
              id="confirm-achievers-email"
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={isSending || (template === "Certificate Verification" && !canSendVerification) || (template === "Selection Congratulation" && !canSendSelection)}
              className="mt-1 h-4 w-4 cursor-pointer rounded text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <label htmlFor="confirm-achievers-email" className="cursor-pointer select-none text-xs leading-normal text-gray-600">
              I confirm that I want to send this template email to all <strong className="text-indigo-700">{count} selected candidate(s)</strong>. I understand this action cannot be undone.
            </label>
          </div>
        </div>
        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button disabled={isSending} onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            Cancel
          </button>
          <button
            disabled={!confirmed || isSending || (template === "Certificate Verification" && !canSendVerification) || (template === "Selection Congratulation" && !canSendSelection)}
            onClick={handleSendEmails}
            className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? (
              <>
                <SpinnerGap className="mr-2 inline animate-spin" size={16} /> Sending...
              </>
            ) : (
              <>
                <PaperPlaneTilt className="mr-2 inline" /> Send Emails
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const PERCENTAGE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

function PercentageDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="flex items-center gap-2 cursor-pointer" ref={ref}>
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer">{label}:</span>
      <div className="relative w-24">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-800 shadow-sm hover:border-gray-300 focus:border-blue-500 focus:outline-none transition cursor-pointer"
        >
          <span>{displayLabel}</span>
          <CaretDown size={14} className={`text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className="absolute left-0 top-full mt-1 w-24 max-h-36 overflow-y-scroll rounded-xl border border-gray-200 bg-white shadow-xl z-50 p-1 green-dropdown-scroll"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#10b981 #f1f5f9",
            }}
          >
            <style>{`
              .green-dropdown-scroll::-webkit-scrollbar {
                width: 6px !important;
                display: block !important;
              }
              .green-dropdown-scroll::-webkit-scrollbar-track {
                background: #f1f5f9 !important;
                border-radius: 9999px !important;
              }
              .green-dropdown-scroll::-webkit-scrollbar-thumb {
                background: #10b981 !important;
                border-radius: 9999px !important;
              }
              .green-dropdown-scroll::-webkit-scrollbar-thumb:hover {
                background: #059669 !important;
              }
            `}</style>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer ${
                !value ? "bg-blue-50 font-semibold text-blue-600" : "text-gray-700"
              }`}
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer ${
                  value === opt.value ? "bg-blue-50 font-semibold text-blue-600" : "text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationsTableShimmer({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white" aria-label="Loading applications">
      <div className="grid grid-cols-6 gap-5 bg-gray-50 px-6 py-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded bg-gray-200" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid grid-cols-6 gap-5 border-t border-gray-100 px-6 py-6">
          {Array.from({ length: 6 }).map((__, column) => (
            <div key={column} className="h-4 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ApplicationsOverviewShimmer() {
  return (
    <div className="space-y-6" aria-label="Loading admissions overview">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}

export default function AdmissionApplications() {
  const { collegeCode, collegeId } = useUser();
  // Target AJC (Achievers Junior College) in admin
  const targetCollege = (collegeCode && collegeCode.toLowerCase().includes("ajc")) ? collegeCode : "ajc";

  const [screen, setScreen] = useState<"overview" | "applications">("overview");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationTab, setApplicationTab] = useState<"all" | "top">("all");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [admissionFilter, setAdmissionFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [level, setLevel] = useState("Inter");
  const [course, setCourse] = useState("All");
  const [percentageFrom, setPercentageFrom] = useState("");
  const [percentageTo, setPercentageTo] = useState("");

  const percentageFromOptions = useMemo(
    () => PERCENTAGE_STEPS.map((v) => ({ label: `${v}%`, value: String(v) })),
    []
  );

  const percentageToOptions = useMemo(
    () =>
      PERCENTAGE_STEPS.filter((v) => {
        if (percentageFrom === "") return v > 0;
        return v >= Number(percentageFrom);
      }).map((v) => ({ label: `${v}%`, value: String(v) })),
    [percentageFrom]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Dynamic State ---
  const [visitors, setVisitors] = useState<number>(0);
  const [opens, setOpens] = useState<number>(0);
  const [submissions, setSubmissions] = useState<number>(0);
  const [kpiLoaded, setKpiLoaded] = useState(false);

  const visitorIdsSet = useRef<Set<string>>(new Set());
  const openIdsSet = useRef<Set<string>>(new Set());

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>(new Array(12).fill(0));
  const [hasDynamicChart, setHasDynamicChart] = useState(false);

  const [recentLive, setRecentLive] = useState<Application[]>([]);
  const [hasRecentLive, setHasRecentLive] = useState(false);

  const [liveApplications, setLiveApplications] = useState<Application[]>([]);
  const [hasLiveApps, setHasLiveApps] = useState(false);

  const [topApplicationsList, setTopApplicationsList] = useState<Application[]>([]);
  const [hasTopApps, setHasTopApps] = useState(false);
  const [databaseGroups, setDatabaseGroups] = useState<string[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [topApplicationsLoading, setTopApplicationsLoading] = useState(false);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsPerPage, setApplicationsPerPage] = useState(10);
  const [recentPage, setRecentPage] = useState(1);
  const [recentPerPage, setRecentPerPage] = useState(5);

  const registeredCourses = useMemo(() => {
    const list = ["All", ...databaseGroups];
    const seen = new Set(list.map((item) => item.toLowerCase()));
    (liveApplications || []).forEach((app) => {
      const c = app.course || "";
      const match = c.match(/\(([A-Za-z]+)\)/);
      const code = match ? match[1].toUpperCase() : (c.length <= 6 && !c.includes(" ") ? c.toUpperCase() : "");
      if (code && !seen.has(code.toLowerCase())) {
        seen.add(code.toLowerCase());
        list.push(code);
      }
    });
    return list;
  }, [databaseGroups, liveApplications]);

  useEffect(() => {
    let isMounted = true;
    const loadGroups = async () => {
      setGroupsLoading(true);
      try {
        if (!collegeId) {
          if (isMounted) setDatabaseGroups([]);
          return;
        }
        const courses = await fetchAdmissionsCourses(collegeId);
        if (!isMounted) return;
        const seen = new Set<string>();
        const groups = (courses || []).reduce<string[]>((result, item) => {
          const value = String(item.code || item.name || "").trim();
          const key = value.toLowerCase();
          if (value && !seen.has(key)) {
            seen.add(key);
            result.push(value);
          }
          return result;
        }, []);
        setDatabaseGroups(groups);
      } catch (error) {
        console.error("Failed to load admission groups:", error);
        if (isMounted) setDatabaseGroups([]);
      } finally {
        if (isMounted) setGroupsLoading(false);
      }
    };
    loadGroups();
    return () => { isMounted = false; };
  }, [collegeId]);

  // 1. Dynamic KPI Counts & Realtime
  useEffect(() => {
    let isMounted = true;
    const loadKpis = async () => {
      try {
        const counts = await getKpiCounts();
        if (isMounted && counts) {
          setVisitors(counts.visitors || 0);
          setOpens(counts.opens || 0);
          setSubmissions(counts.submissions || 0);
          visitorIdsSet.current = counts.visitorIds || new Set();
          openIdsSet.current = counts.openIds || new Set();
          setKpiLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load AJC KPI counts:", err);
      } finally {
        if (isMounted) setKpiLoaded(true);
      }
    };
    loadKpis();

    const analyticsSub = subscribeToAnalytics(
      (visitorId: string) => {
        if (!visitorIdsSet.current.has(visitorId)) {
          visitorIdsSet.current.add(visitorId);
          setVisitors((v) => v + 1);
        }
      },
      (visitorId: string) => {
        if (!openIdsSet.current.has(visitorId)) {
          openIdsSet.current.add(visitorId);
          setOpens((o) => o + 1);
        }
      }
    );

    const submissionsSub = subscribeToSubmissions(() => {
      setSubmissions((s) => s + 1);
      setRefreshTrigger((prev) => prev + 1);
    });

    return () => {
      isMounted = false;
      unsubscribeChannel(analyticsSub);
      unsubscribeChannel(submissionsSub);
    };
  }, [targetCollege]);

  // 2. Dynamic Monthly Trend & Realtime
  useEffect(() => {
    let isMounted = true;
    const loadChartData = async () => {
      try {
        const counts = await getApplicationsByYear(selectedYear);
        if (isMounted && counts) {
          setMonthlyCounts(counts);
          setHasDynamicChart(true);
        }
      } catch (err) {
        console.error("Failed to load AJC chart data:", err);
      } finally {
        if (isMounted) setHasDynamicChart(true);
      }
    };
    loadChartData();
    return () => { isMounted = false; };
  }, [selectedYear, targetCollege, refreshTrigger]);

  // 3. Dynamic Recent Applications & Realtime
  useEffect(() => {
    let isMounted = true;
    const loadRecent = async () => {
      try {
        const formatted = await getRecentApplications(50);
        if (isMounted && formatted) {
          setRecentLive(formatted);
          setHasRecentLive(true);
        }
      } catch (err) {
        console.error("Failed to load AJC recent applications:", err);
      } finally {
        if (isMounted) setHasRecentLive(true);
      }
    };
    loadRecent();

    const paymentsSub = subscribeToPayments(() => {
      loadRecent();
      setRefreshTrigger((prev) => prev + 1);
    });

    return () => {
      isMounted = false;
      unsubscribeChannel(paymentsSub);
    };
  }, [targetCollege, refreshTrigger]);

  // 4. Dynamic All Applications
  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      setApplicationsLoading(true);
      try {
        const formatted = await getAllApplications({
          search: debouncedSearch,
          dateFrom,
          dateTo,
          paymentFilter,
          admissionFilter,
          minGrade: percentageFrom ? Number(percentageFrom) : undefined,
          maxGrade: percentageTo ? Number(percentageTo) : undefined,
        });
        if (isMounted && formatted) {
          setLiveApplications(formatted);
          setHasLiveApps(true);
        }
      } catch (err) {
        console.error("Failed to load AJC all applications:", err);
      } finally {
        if (isMounted) {
          setHasLiveApps(true);
          setApplicationsLoading(false);
        }
      }
    };
    loadAll();
    return () => { isMounted = false; };
  }, [debouncedSearch, dateFrom, dateTo, paymentFilter, admissionFilter, percentageFrom, percentageTo, targetCollege, refreshTrigger]);

  // 5. Dynamic Top Applications
  useEffect(() => {
    let isMounted = true;
    if (applicationTab === "top") {
      const loadTop = async () => {
        setTopApplicationsLoading(true);
        try {
          const parsedGrade = percentageFrom ? Number(percentageFrom) : 90;
          const formatted = await getTopApplications(course, parsedGrade);
          if (isMounted && formatted) {
            setTopApplicationsList(formatted);
            setHasTopApps(true);
          }
        } catch (err) {
          console.error("Failed to load AJC top applications:", err);
        } finally {
          if (isMounted) {
            setHasTopApps(true);
            setTopApplicationsLoading(false);
          }
        }
      };
      loadTop();
    }
    return () => { isMounted = false; };
  }, [applicationTab, level, course, percentageFrom, targetCollege, refreshTrigger]);

  // Live applications
  const basePool = useMemo(() => {
    if (applicationTab === "top") {
      return topApplicationsList;
    }
    return liveApplications;
  }, [applicationTab, liveApplications, topApplicationsList]);

  const filteredApplications = useMemo(() => {
    const term = (search || "").trim().toLowerCase();
    const isEmailSearch = term.includes("@");

    return basePool.filter((item) => {
      const words = term.split(/\s+/).filter(Boolean);
      const matchesSearch =
        words.length === 0 ||
        words.every((w) => {
          const fields = [item.id, item.name, item.course, item.mobile];
          if (isEmailSearch) {
            fields.push(item.email);
          }
          return fields.some((value) => (value || "").toLowerCase().includes(w));
        });
      const matchesPayment = paymentFilter === "All" || item.payment === paymentFilter;
      const matchesAdmission = admissionFilter === "All" || item.admission === admissionFilter;
      const matchesCourse =
        applicationTab === "all" ||
        course === "All" ||
        item.course.toLowerCase().includes(course.toLowerCase());

      const scoreVal = parseFloat((item.score || "").replace(/[^0-9.]/g, "")) || 0;
      const minP = percentageFrom ? parseFloat(percentageFrom) : (applicationTab === "top" ? 90 : 0);
      const maxP = percentageTo ? parseFloat(percentageTo) : 100;
      const matchesPercentage = scoreVal >= minP && scoreVal <= maxP;

      let matchesDate = true;
      if (dateFrom && item.rawDate) {
        matchesDate = new Date(item.rawDate).getTime() >= new Date(dateFrom).getTime();
      }
      if (dateTo && item.rawDate && matchesDate) {
        matchesDate = new Date(item.rawDate).getTime() <= new Date(dateTo).getTime() + 86400000;
      }

      return matchesSearch && matchesPayment && matchesAdmission && matchesCourse && matchesPercentage && matchesDate;
    });
  }, [admissionFilter, applicationTab, basePool, course, dateFrom, dateTo, search, percentageFrom, percentageTo, paymentFilter]);

  const rankedApplications = useMemo(() => {
    if (applicationTab !== "top") {
      return filteredApplications.map((item) => ({ ...item, rank: 1 }));
    }

    const sorted = [...filteredApplications].sort((a, b) => {
      const sA = parseFloat((a.score || "").replace(/[^0-9.]/g, "")) || 0;
      const sB = parseFloat((b.score || "").replace(/[^0-9.]/g, "")) || 0;
      return sB - sA;
    });

    let currentRank = 1;
    let prevScore: number | null = null;

    return sorted.map((item) => {
      const score = parseFloat((item.score || "").replace(/[^0-9.]/g, "")) || 0;
      if (prevScore !== null && score < prevScore) {
        currentRank = currentRank + 1;
      }
      prevScore = score;
      return {
        ...item,
        rank: currentRank,
      };
    });
  }, [applicationTab, filteredApplications]);

  const effectiveApplicationsPage = Math.min(
    applicationsPage,
    Math.max(1, Math.ceil(rankedApplications.length / applicationsPerPage)),
  );
  const effectiveRecentPage = Math.min(
    recentPage,
    Math.max(1, Math.ceil(recentLive.length / recentPerPage)),
  );

  const paginatedApplications = useMemo(() => {
    const start = (effectiveApplicationsPage - 1) * applicationsPerPage;
    return rankedApplications.slice(start, start + applicationsPerPage);
  }, [effectiveApplicationsPage, applicationsPerPage, rankedApplications]);

  const paginatedRecentApplications = useMemo(() => {
    const start = (effectiveRecentPage - 1) * recentPerPage;
    return recentLive.slice(start, start + recentPerPage);
  }, [effectiveRecentPage, recentLive, recentPerPage]);

  const selectedCandidatesList = useMemo(() => {
    return rankedApplications.filter((item) => selectedIds.includes(item.id));
  }, [rankedApplications, selectedIds]);

  const handleExportCSV = () => {
    const rows = rankedApplications.map((item) => ({
      "Application ID": item.id,
      ...(applicationTab === "top" ? { "Rank": `#${item.rank}` } : {}),
      "Applicant Name": item.name,
      "Course": item.course,
      "Email": item.email,
      "Mobile": item.mobile,
      "Percentage": item.score,
      "Submission Date": item.submitted,
      "Payment Status": item.payment,
      "Admission Status": item.admission,
    }));
    downloadCSV(rows, `AJC_Admissions_${new Date().toISOString().split("T")[0]}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPaymentFilter("All");
    setAdmissionFilter("All");
    setCourse("All");
    if (applicationTab === "top") {
      setPercentageFrom("90");
      setPercentageTo("100");
    } else {
      setPercentageFrom("");
      setPercentageTo("");
    }
    setSelectedIds([]);
  };

  const handleRecentApplicationClick = (application: Application) => {
    setApplicationTab("all");
    setPaymentFilter("All");
    setAdmissionFilter("All");
    setDateFrom("");
    setDateTo("");
    setPercentageFrom("");
    setPercentageTo("");
    setCourse("All");
    setSelectedIds([]);
    setApplicationsPage(1);
    setApplicationsLoading(true);
    setSearch(application.id);
    setScreen("applications");
  };

  if (screen === "applications") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <button
              onClick={() => { setSearch(""); setScreen("overview"); }}
              className="mb-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-[#43C17A] hover:text-green-700"
            >
              <ArrowLeft size={16} weight="bold" /> Back to overview
            </button>
            <h2 className="text-3xl font-bold text-gray-900">Applications</h2>
            <p className="text-sm text-gray-500">Manage and view form submissions from the website.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
            <div className="flex rounded-xl bg-gray-200 p-1">
              <button
                onClick={() => {
                  setApplicationTab("all");
                  setSelectedIds([]);
                  setPercentageFrom("");
                  setPercentageTo("");
                }}
                className={`rounded-lg px-5 py-2 text-sm font-bold transition cursor-pointer ${applicationTab === "all" ? "bg-violet-600 text-white shadow" : "text-gray-600 hover:text-gray-900"}`}
              >
                All Applications
              </button>
              <button
                onClick={() => {
                  setApplicationTab("top");
                  setSelectedIds([]);
                  setPercentageFrom("90");
                  setPercentageTo("100");
                }}
                className={`rounded-lg px-5 py-2 text-sm font-bold transition cursor-pointer ${applicationTab === "top" ? "bg-violet-600 text-white shadow" : "text-gray-600 hover:text-gray-900"}`}
              >
                Top Applications
              </button>
            </div>
          </div>
        </div>

        {applicationTab === "top" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex gap-8 border-b border-gray-200">
              {["Inter"].map((item) => (
                <button
                  key={item}
                  onClick={() => { setLevel(item); setCourse("All"); setSelectedIds([]); }}
                  className="border-b-2 px-4 pb-3 text-sm font-semibold transition border-blue-600 text-blue-600 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {groupsLoading && Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-10 w-20 animate-pulse rounded-full bg-gray-100" />
              ))}
              {registeredCourses.map((item) => (
                <button
                  key={item}
                  onClick={() => { setCourse(item); setSelectedIds([]); }}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition cursor-pointer ${course === item ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative min-w-64 flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 placeholder:text-blue-500"
              />
            </div>
            <label className="text-sm font-semibold text-gray-700 cursor-pointer">
              From:
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  setDateFrom(val);
                  if (dateTo && val && new Date(dateTo) < new Date(val)) {
                    setDateTo("");
                  }
                }}
                className="ml-2 rounded-xl border border-gray-200 p-3 font-normal cursor-pointer"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 cursor-pointer">
              To:
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="ml-2 rounded-xl border border-gray-200 p-3 font-normal cursor-pointer"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 cursor-pointer">
              Payment Status:
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                className="ml-2 rounded-xl border border-gray-200 p-3 font-normal cursor-pointer"
              >
                <option className="cursor-pointer">All</option>
                <option className="cursor-pointer">Success</option>
                <option className="cursor-pointer">Pending</option>
                <option className="cursor-pointer">Failed</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700 cursor-pointer">
              Admission Status:
              <select
                value={admissionFilter}
                onChange={(event) => setAdmissionFilter(event.target.value)}
                className="ml-2 rounded-xl border border-gray-200 p-3 font-normal cursor-pointer"
              >
                <option className="cursor-pointer">All</option>
                <option className="cursor-pointer">Pending</option>
                <option className="cursor-pointer">Verification</option>
                <option className="cursor-pointer">Selected</option>
                <option className="cursor-pointer">Regret</option>
              </select>
            </label>
            <PercentageDropdown
              label="Percentage From"
              placeholder="Min"
              value={percentageFrom}
              options={percentageFromOptions}
              onChange={(val) => {
                setPercentageFrom(val);
                if (percentageTo && val && Number(val) > Number(percentageTo)) {
                  setPercentageTo("");
                }
              }}
            />
            <PercentageDropdown
              label="Percentage To"
              placeholder="Max"
              value={percentageTo}
              options={percentageToOptions}
              onChange={(val) => setPercentageTo(val)}
            />
            {applicationTab === "top" && (
              <button
                disabled={!selectedIds.length}
                onClick={() => setShowEmailModal(true)}
                className="ml-auto cursor-pointer rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send Mail ({selectedIds.length})
              </button>
            )}
            <button
              onClick={handleClearFilters}
              className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {(applicationsLoading || (applicationTab === "top" && topApplicationsLoading)) ? (
          <ApplicationsTableShimmer rows={applicationsPerPage > 10 ? 10 : applicationsPerPage} />
        ) : <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  {applicationTab === "top" && (
                    <th className="px-5 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        className="cursor-pointer"
                        checked={rankedApplications.length > 0 && selectedIds.length === rankedApplications.length}
                        onChange={(event) =>
                          setSelectedIds(event.target.checked ? rankedApplications.map((item) => item.id) : [])
                        }
                      />
                    </th>
                  )}
                  <th className="px-5 py-4 whitespace-nowrap">Application ID</th>
                  {applicationTab === "top" && <th className="px-5 py-4 whitespace-nowrap">Rank</th>}
                  <th className="px-5 py-4 whitespace-nowrap">Applicant Name</th>
                  <th className="px-5 py-4 whitespace-nowrap">Course</th>
                  <th className="px-5 py-4 whitespace-nowrap">Contact</th>
                  <th className="px-5 py-4 whitespace-nowrap">Percentage</th>
                  <th className="px-5 py-4 whitespace-nowrap">Date</th>
                  <th className="px-5 py-4 whitespace-nowrap">Payment Status</th>
                  <th className="px-5 py-4 whitespace-nowrap">Admission Status</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedApplications.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedApplication(item)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {applicationTab === "top" && (
                      <td className="px-5 py-4 whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          checked={selectedIds.includes(item.id)}
                          onChange={() =>
                            setSelectedIds((current) =>
                              current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
                            )
                          }
                          aria-label={`Select ${item.name}`}
                        />
                      </td>
                    )}
                    <td className="px-5 py-4 font-mono text-xs text-gray-600 whitespace-nowrap">{item.id}</td>
                    {applicationTab === "top" && <td className="px-5 py-4 font-bold text-gray-700 whitespace-nowrap">#{item.rank}</td>}
                    <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">{item.name}</td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{item.course}</td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                      <div>{item.email}</div>
                      <div className="text-xs text-gray-400">{item.mobile}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap">{item.score}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{item.submitted}</td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge value={item.payment} /></td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge value={item.admission} /></td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedApplication(item); }}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rankedApplications.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">No applications match your search.</div>
          )}
          <div className="border-t border-gray-100 bg-white px-5 py-4">
            <Pagination
              currentPage={effectiveApplicationsPage}
              totalItems={rankedApplications.length}
              itemsPerPage={applicationsPerPage}
              onPageChange={setApplicationsPage}
              itemsPerPageOptions={[5, 10, 20, 50]}
              onItemsPerPageChange={(value) => { setApplicationsPerPage(value); setApplicationsPage(1); }}
              disabled={applicationsLoading || topApplicationsLoading}
              alwaysShow
            />
          </div>
        </div>}

        <ApplicationViewModal
          application={selectedApplication}
          isOpen={selectedApplication !== null}
          onClose={() => setSelectedApplication(null)}
        />

        {showEmailModal && (
          <EmailModal
            count={selectedIds.length}
            selectedCandidates={selectedCandidatesList}
            onClose={() => setShowEmailModal(false)}
            onSuccess={() => {
              setSelectedIds([]);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        )}
      </div>
    );
  }

  const recentApplications = recentLive;
  const displayMonthly = monthlyCounts;
  const maxMonthly = Math.max(...displayMonthly, 1);

  if (!kpiLoaded || !hasDynamicChart || !hasRecentLive) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admissions Overview</h2>
          <p className="text-sm text-gray-500">Track website activity and recent admission submissions.</p>
        </div>
        <ApplicationsOverviewShimmer />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admissions Overview</h2>
        <p className="text-sm text-gray-500">Track website activity and recent admission submissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          { title: "Website Visitors", value: formatKpiNumber(visitors), icon: <Users size={28} weight="duotone" />, style: "border-blue-200 bg-blue-50 text-blue-600" },
          { title: "Admissions Opened", value: formatKpiNumber(opens), icon: <FileText size={28} weight="duotone" />, style: "border-orange-200 bg-orange-50 text-orange-600" },
          { title: "Forms Submitted", value: formatKpiNumber(submissions), icon: <CheckCircle size={28} weight="duotone" />, style: "border-green-200 bg-green-50 text-green-600" },
        ].map((card) => (
          <div key={card.title} className={`flex items-center gap-4 rounded-2xl border p-5 ${card.style} shadow-sm transition hover:scale-[1.01]`}>
            <div className="rounded-full bg-white p-3 shadow-sm">{card.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Admissions Trend</h3>
              <p className="text-sm text-gray-500">Monthly form submissions overview for {selectedYear}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 outline-none"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <TrendUp size={20} weight="bold" />
              </div>
            </div>
          </div>

          <div className="flex h-64 items-end gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 pt-8">
            {displayMonthly.map((value, index) => (
              <div key={months[index]} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                <div className="group relative flex flex-1 items-end">
                  <span className="absolute left-1/2 z-10 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value} applications
                  </span>
                  <div
                    className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max((value / maxMonthly) * 100, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-400 sm:text-xs">{months[index]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Recent Applications</h3>
              <p className="text-sm text-gray-500">Latest website submissions</p>
            </div>
            <button
              onClick={() => setScreen("applications")}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              View All <CaretRight size={14} weight="bold" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {paginatedRecentApplications.map((item) => (
              <button
                key={item.id}
                onClick={() => handleRecentApplicationClick(item)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-full bg-blue-50 p-2.5 text-blue-600">
                    <FileText size={19} weight="duotone" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="truncate text-xs text-gray-500">{item.course} · {item.id}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge value={item.payment} />
                  <p className="mt-1 text-[11px] text-gray-400">{item.submitted}</p>
                </div>
              </button>
            ))}
            {recentApplications.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">No recent submissions found.</div>
            )}
            <div className="px-4 py-3">
              <Pagination
                currentPage={effectiveRecentPage}
                totalItems={recentApplications.length}
                itemsPerPage={recentPerPage}
                onPageChange={setRecentPage}
                itemsPerPageOptions={[5, 10, 20]}
                onItemsPerPageChange={(value) => { setRecentPerPage(value); setRecentPage(1); }}
                alwaysShow
              />
            </div>
          </div>
        </section>
      </div>

      <ApplicationViewModal
        application={selectedApplication}
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
      />
    </div>
  );
}
