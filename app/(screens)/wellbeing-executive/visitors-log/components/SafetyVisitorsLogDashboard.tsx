"use client";

import { CalendarBlank, CaretDown, CheckCircle, ClipboardText, DownloadSimple, MapPin, MagnifyingGlass, PencilSimple, Plus, Trash, UsersThree } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import {
  createCollegeVisitorLog,
  deleteCollegeVisitorLog,
  fetchCollegeVisitorLogsPage,
  updateCollegeVisitorLog,
  type CollegeVisitorCategory,
  type CollegeVisitorLogRow,
  type CollegeVisitorStatus,
} from "@/lib/helpers/visitors/collegeVisitorLogsAPI";
import { AddCampusVisitorModal, type NewCampusVisitor } from "../modals/AddCampusVisitorModal";
import { DataTable, type DataTableColumn } from "./DataTable";
import { SummaryCard } from "./SummaryCard";

type CampusVisitorStatus = "Completed" | "Inside Campus";
type CampusVisitorVariant = "safety" | "administration";
type CampusVisitor = {
  id: number;
  collegeVisitorId?: number;
  initials: string;
  tone: string;
  name: string;
  mobile: string;
  category: NewCampusVisitor["category"];
  purpose: string;
  numberOfVisitors: number;
  watchman: string;
  date: string;
  entryTime: string;
  exitTime: string;
  status: CampusVisitorStatus;
};

type VisitorContext = {
  collegeId: number;
  userId: number;
};

const safetyVisitors: CampusVisitor[] = [
  { id: 1, initials: "RK", tone: "bg-[#E8ECF7] text-[#34425E]", name: "Rahul Kumar", mobile: "+91 XXXXX1234", category: "Parent", purpose: "Admission Inquiry", numberOfVisitors: 1, watchman: "Ravi Kumar", date: "15 May 2025", entryTime: "10:00 AM", exitTime: "12:30 PM", status: "Completed" },
  { id: 2, initials: "PS", tone: "bg-[#FFF0DF] text-[#F97316]", name: "Priya Sharma", mobile: "+91 XXXXX5678", category: "Parent", purpose: "Parent Meeting", numberOfVisitors: 2, watchman: "Mahesh", date: "15 May 2025", entryTime: "11:15 AM", exitTime: "-", status: "Inside Campus" },
  { id: 3, initials: "KR", tone: "bg-[#FFE5E5] text-[#EF4444]", name: "Kiran Reddy", mobile: "+91 XXXXX7890", category: "Guest", purpose: "Fee Enquiry", numberOfVisitors: 1, watchman: "Ravi Kumar", date: "15 May 2025", entryTime: "12:30 PM", exitTime: "-", status: "Inside Campus" },
];

const cards = [
  { label: "Visitors Today", value: 128, tone: "bg-[#EEF3FB] text-[#16284F]", icon: UsersThree },
  { label: "Completed Visits", value: 102, tone: "bg-[#E6FAF1] text-[#18B978]", icon: CheckCircle },
  { label: "Currently Inside", value: 18, tone: "bg-[#FFF2E5] text-[#F97316]", icon: MapPin },
  { label: "Pending Exits", value: 8, tone: "bg-[#FFE9E9] text-[#EF4444]", icon: ClipboardText },
];

const getInitials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

const toInputDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const formatDisplayDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const parseDisplayDate = (date: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return toInputDate(new Date());
  return toInputDate(parsed);
};

const formatDisplayTime = (time: string | null | undefined) => {
  if (!time) return "-";
  const [hour = "0", minute = "0"] = time.split(":");
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`2026-01-01T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`));
};

const parseDisplayTime = (time: string | null | undefined) => {
  if (!time || time.trim() === "-") return null;
  const trimmed = time.trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}:00`;
};

const toDbCategory = (category: NewCampusVisitor["category"]): CollegeVisitorCategory =>
  category.toLowerCase() as CollegeVisitorCategory;

const toUiCategory = (category: CollegeVisitorCategory): NewCampusVisitor["category"] => {
  if (category === "guest") return "Guest";
  if (category === "other") return "Other";
  return "Parent";
};

const toDbStatus = (status: CampusVisitorStatus): CollegeVisitorStatus =>
  status === "Completed" ? "exited" : "entered";

const toUiStatus = (status: CollegeVisitorStatus): CampusVisitorStatus =>
  status === "exited" ? "Completed" : "Inside Campus";

const mapVisitorRow = (row: CollegeVisitorLogRow): CampusVisitor => ({
  id: row.collegeVisitorId,
  collegeVisitorId: row.collegeVisitorId,
  initials: getInitials(row.visitorName),
  tone: "bg-[#E8ECF7] text-[#34425E]",
  name: row.visitorName,
  mobile: row.visitorMobile,
  category: toUiCategory(row.visitorCategory),
  purpose: row.purposeOfVisit,
  numberOfVisitors: row.noOfVisitors,
  watchman: "Unassigned",
  date: formatDisplayDate(row.entryDate),
  entryTime: formatDisplayTime(row.entryTime),
  exitTime: formatDisplayTime(row.exitTime),
  status: toUiStatus(row.visitorStatus),
});

export function CampusVisitorsLogDashboard({
  variant,
  visitorContext,
}: {
  variant: CampusVisitorVariant;
  visitorContext?: VisitorContext;
}) {
  const isDynamicVisitorLog = Boolean(visitorContext);
  const [visitors, setVisitors] = useState<CampusVisitor[]>(() => isDynamicVisitorLog ? [] : variant === "safety" ? safetyVisitors : []);
  const [isVisitorLoading, setIsVisitorLoading] = useState(Boolean(isDynamicVisitorLog));
  const [addVisitorOpen, setAddVisitorOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<CampusVisitor | null>(null);
  const [deleteVisitor, setDeleteVisitor] = useState<CampusVisitor | null>(null);
  const [isSavingVisitor, setIsSavingVisitor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date()));
  const [statusFilter, setStatusFilter] = useState<"all" | CampusVisitorStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(search);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!visitorContext) return;

    let active = true;
    setIsVisitorLoading(true);
    fetchCollegeVisitorLogsPage({
      collegeId: visitorContext.collegeId,
      entryDate: selectedDate,
      visitorStatus: statusFilter === "Completed" ? "exited" : statusFilter === "Inside Campus" ? "entered" : "all",
      search: appliedSearch,
      page: currentPage,
      limit: itemsPerPage,
    })
      .then((result) => {
        if (!active) return;
        setVisitors(result.data.map(mapVisitorRow));
        setTotalVisitors(result.count);
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Failed to load visitor logs.");
      })
      .finally(() => {
        if (active) setIsVisitorLoading(false);
      });

    return () => { active = false; };
  }, [appliedSearch, currentPage, selectedDate, statusFilter, visitorContext]);
  const columns: DataTableColumn[] = [
    { key: "visitor", label: "Visitor Name" },
    { key: "mobile", label: "Mobile Number" },
    { key: "purpose", label: "Purpose" },
    { key: "date", label: "Date" },
    { key: "entryTime", label: "Entry Time" },
    { key: "exitTime", label: "Exit Time" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", align: "center" as const },
  ];

  const visitorCounts = useMemo(() => ({
    total: isDynamicVisitorLog ? totalVisitors : visitors.length,
    completed: visitors.filter((visitor) => visitor.status === "Completed").length,
    inside: visitors.filter((visitor) => visitor.status === "Inside Campus").length,
    pending: visitors.filter((visitor) => visitor.status === "Inside Campus").length,
  }), [isDynamicVisitorLog, totalVisitors, visitors]);

  const summaryCards = isDynamicVisitorLog
    ? [
      { ...cards[0], value: visitorCounts.total },
      { ...cards[1], value: visitorCounts.completed },
      { ...cards[2], value: visitorCounts.inside },
      { ...cards[3], value: visitorCounts.pending },
    ]
    : cards;

  const visibleVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return visitors.filter((visitor) => {
      const matchesSearch =
        !query ||
        visitor.name.toLowerCase().includes(query) ||
        visitor.mobile.toLowerCase().includes(query) ||
        visitor.purpose.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || visitor.status === statusFilter;
      const matchesDate = !selectedDate || parseDisplayDate(visitor.date) === selectedDate;
      return matchesSearch && matchesStatus && (isDynamicVisitorLog || matchesDate);
    });
  }, [isDynamicVisitorLog, search, selectedDate, statusFilter, visitors]);

  const paginatedVisitors = useMemo(() => {
    if (isDynamicVisitorLog) return visibleVisitors;
    const start = (currentPage - 1) * itemsPerPage;
    return visibleVisitors.slice(start, start + itemsPerPage);
  }, [currentPage, isDynamicVisitorLog, visibleVisitors]);

  const totalPaginationItems = isDynamicVisitorLog ? totalVisitors : visibleVisitors.length;

  const updateStatus = async (id: number, status: CampusVisitorStatus) => {
    const visitor = visitors.find((currentVisitor) => currentVisitor.id === id);
    if (!visitorContext || !visitor?.collegeVisitorId) {
      setVisitors((current) => current.map((currentVisitor) => currentVisitor.id === id ? { ...currentVisitor, status } : currentVisitor));
      return;
    }

    const nextExitTime = status === "Completed"
      ? parseDisplayTime(visitor.exitTime) ?? parseDisplayTime(formatDisplayTime(new Date().toTimeString().slice(0, 8)))
      : null;
    try {
      const updated = await updateCollegeVisitorLog({
        collegeVisitorId: visitor.collegeVisitorId,
        collegeId: visitorContext.collegeId,
        visitorName: visitor.name,
        visitorMobile: visitor.mobile,
        visitorCategory: toDbCategory(visitor.category),
        purposeOfVisit: visitor.purpose,
        noOfVisitors: visitor.numberOfVisitors,
        entryDate: parseDisplayDate(visitor.date),
        entryTime: parseDisplayTime(visitor.entryTime) ?? "00:00:00",
        exitTime: nextExitTime,
        visitorStatus: toDbStatus(status),
      });
      setVisitors((current) => current.map((currentVisitor) => currentVisitor.id === id ? mapVisitorRow(updated) : currentVisitor));
      toast.success("Visitor status updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update visitor status.");
    }
  };

  const addVisitor = async (visitor: NewCampusVisitor) => {
    if (!visitorContext) {
      const initials = getInitials(visitor.name);
      setVisitors((current) => [{ id: Date.now(), initials, tone: "bg-[#E8ECF7] text-[#34425E]", name: visitor.name, mobile: visitor.mobile, category: visitor.category, purpose: visitor.purpose, numberOfVisitors: visitor.numberOfVisitors, watchman: "Unassigned", date: visitor.date, entryTime: visitor.entryTime, exitTime: visitor.exitTime || "-", status: "Inside Campus" }, ...current]);
      setAddVisitorOpen(false);
      return;
    }

    setIsSavingVisitor(true);
    try {
      const exitTime = parseDisplayTime(visitor.exitTime);
      const created = await createCollegeVisitorLog({
        collegeId: visitorContext.collegeId,
        visitorName: visitor.name,
        visitorMobile: visitor.mobile,
        visitorCategory: toDbCategory(visitor.category),
        purposeOfVisit: visitor.purpose,
        noOfVisitors: visitor.numberOfVisitors,
        entryDate: parseDisplayDate(visitor.date),
        entryTime: parseDisplayTime(visitor.entryTime) ?? "00:00:00",
        exitTime,
        visitorStatus: exitTime ? "exited" : "entered",
        createdBy: visitorContext.userId,
      });
      setVisitors((current) => [mapVisitorRow(created), ...current]);
      setAddVisitorOpen(false);
      toast.success("Visitor added successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add visitor.");
    } finally {
      setIsSavingVisitor(false);
    }
  };

  const updateVisitor = async (updatedVisitor: NewCampusVisitor) => {
    if (!editingVisitor) return;
    if (!visitorContext || !editingVisitor.collegeVisitorId) {
      const initials = getInitials(updatedVisitor.name);
      setVisitors((current) =>
        current.map((visitor) =>
          visitor.id === editingVisitor.id
            ? { ...visitor, initials, name: updatedVisitor.name, mobile: updatedVisitor.mobile, category: updatedVisitor.category, purpose: updatedVisitor.purpose, numberOfVisitors: updatedVisitor.numberOfVisitors, date: updatedVisitor.date, entryTime: updatedVisitor.entryTime, exitTime: updatedVisitor.exitTime || "-" }
            : visitor,
        ),
      );
      setEditingVisitor(null);
      return;
    }

    setIsSavingVisitor(true);
    try {
      const exitTime = parseDisplayTime(updatedVisitor.exitTime);
      const updated = await updateCollegeVisitorLog({
        collegeVisitorId: editingVisitor.collegeVisitorId,
        collegeId: visitorContext.collegeId,
        visitorName: updatedVisitor.name,
        visitorMobile: updatedVisitor.mobile,
        visitorCategory: toDbCategory(updatedVisitor.category),
        purposeOfVisit: updatedVisitor.purpose,
        noOfVisitors: updatedVisitor.numberOfVisitors,
        entryDate: parseDisplayDate(updatedVisitor.date),
        entryTime: parseDisplayTime(updatedVisitor.entryTime) ?? "00:00:00",
        exitTime,
        visitorStatus: exitTime ? "exited" : "entered",
      });
      setVisitors((current) => current.map((visitor) => visitor.id === editingVisitor.id ? mapVisitorRow(updated) : visitor));
      setEditingVisitor(null);
      toast.success("Visitor updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update visitor.");
    } finally {
      setIsSavingVisitor(false);
    }
  };

  const removeVisitor = async () => {
    if (!deleteVisitor) return;
    if (!visitorContext || !deleteVisitor.collegeVisitorId) {
      setVisitors((current) => current.filter((visitor) => visitor.id !== deleteVisitor.id));
      setDeleteVisitor(null);
      return;
    }

    try {
      await deleteCollegeVisitorLog({
        collegeVisitorId: deleteVisitor.collegeVisitorId,
        collegeId: visitorContext.collegeId,
      });
      setVisitors((current) => current.filter((visitor) => visitor.id !== deleteVisitor.id));
      setDeleteVisitor(null);
      toast.success("Visitor deleted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete visitor.");
    }
  };

  const exportLogs = async () => {
    setIsExporting(true);
    try {
      const exportVisitors = visitorContext
        ? (await fetchCollegeVisitorLogsPage({
          collegeId: visitorContext.collegeId,
          entryDate: selectedDate,
          visitorStatus: statusFilter === "Completed" ? "exited" : statusFilter === "Inside Campus" ? "entered" : "all",
          search: appliedSearch,
          page: 1,
          limit: Math.max(totalVisitors, 1),
        })).data.map(mapVisitorRow)
        : visibleVisitors;

      if (exportVisitors.length === 0) {
        toast.error("No visitor logs available to export.");
        return;
      }

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(exportVisitors.map((visitor) => ({ "Visitor Name": visitor.name, "Mobile Number": visitor.mobile, Purpose: visitor.purpose, Date: visitor.date, "Entry Time": visitor.entryTime, "Exit Time": visitor.exitTime, Status: visitor.status })));
      worksheet["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Visitor Logs");
      XLSX.writeFile(workbook, `visitor-logs-${selectedDate || new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export visitor logs.");
    } finally {
      setIsExporting(false);
    }
  };

  const rows = paginatedVisitors.map((visitor) => ({
    visitor: <div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${visitor.tone}`}>{visitor.initials}</span><span className="font-extrabold text-[#16284F]">{visitor.name}</span></div>,
    mobile: visitor.mobile,
    purpose: (
      <span
        title={visitor.purpose}
        className="block max-w-[170px] overflow-x-auto whitespace-nowrap rounded border border-[#D7DFEC] bg-[#F3F6FA] px-2 py-1 text-xs no-scrollbar"
      >
        {visitor.purpose}
      </span>
    ),
    watchman: visitor.watchman,
    date: <span className="font-semibold">{visitor.date}</span>,
    entryTime: <span className="font-bold">{visitor.entryTime}</span>,
    exitTime: <span className="font-bold">{visitor.exitTime}</span>,
    status: <CampusVisitorStatusDropdown status={visitor.status} onChange={(status) => updateStatus(visitor.id, status)} />,
    actions: (
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => setEditingVisitor(visitor)} title="Edit visitor" className="cursor-pointer text-[#64748B] hover:text-[#149447]">
          <PencilSimple size={18} weight="bold" />
        </button>
        <button type="button" onClick={() => setDeleteVisitor(visitor)} title="Delete visitor" className="cursor-pointer text-[#EF4444] hover:text-[#B91C1C]">
          <Trash size={18} weight="bold" />
        </button>
      </div>
    ),
  }));

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#16284F]">Visitor Logs</h1><p className="mt-1 text-sm text-[#64748B]">Monitor and track all visitor entries recorded across the campus.</p></div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setAddVisitorOpen(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#43C17A] px-5 text-sm font-bold text-white hover:bg-[#35A968]"><Plus size={16} weight="bold" />Add Visitor</button>
          <button
            type="button"
            onClick={exportLogs}
            disabled={isExporting}
            className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#16284F] px-5 text-sm font-bold text-white transition-all ${
              isExporting ? "cursor-not-allowed opacity-70" : "hover:bg-[#1E3A8A]"
            }`}
          >
            {isExporting ? "Exporting Logs..." : "Export Logs"}
            {!isExporting && <DownloadSimple size={18} weight="bold" />}
          </button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{summaryCards.map((card) => <SummaryCard key={card.label} {...card} />)}</div>
      <div className="mt-6 overflow-hidden rounded-lg border border-[#D7DFEC] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#D7DFEC] p-4 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
                if (isDynamicVisitorLog) setIsVisitorLoading(true);
              }}
              placeholder="Search visitor name"
              className="h-10 w-full rounded border border-[#D7DFEC] pl-10 pr-3 text-sm text-[#16284F] outline-none placeholder:text-[#64748B] focus:border-[#43C17A]"
            />
          </label>
          <span className="text-sm font-semibold text-[#475569]">Filters:</span>
          {!isDatePickerOpen ? (
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#DAE9E1] px-5 text-sm font-extrabold tracking-wide text-[#43C17A] hover:bg-[#CBE6D7]"
            >
              <CalendarBlank size={18} weight="fill" />
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-GB")}
            </button>
          ) : (
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded border border-[#43C17A] bg-white px-4 text-sm text-[#34425E] shadow-sm">
              <CalendarBlank size={16} className="text-[#43C17A]" weight="fill" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setCurrentPage(1);
                  setIsDatePickerOpen(false);
                  if (isDynamicVisitorLog) setIsVisitorLoading(true);
                }}
                className="cursor-pointer bg-transparent text-sm font-semibold text-[#34425E] outline-none"
              />
            </label>
          )}
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as "all" | CampusVisitorStatus);
              setCurrentPage(1);
              if (isDynamicVisitorLog) setIsVisitorLoading(true);
            }}
            className="h-10 cursor-pointer rounded border border-[#D7DFEC] bg-white px-4 text-sm text-[#34425E]"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Inside Campus">Inside Campus</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          minWidth={isDynamicVisitorLog ? "1120px" : "1240px"}
          isLoading={isVisitorLoading}
          shimmerRows={itemsPerPage}
        />
        {!isVisitorLoading ? (
          <Pagination
            currentPage={currentPage}
            totalItems={totalPaginationItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              if (isDynamicVisitorLog) setIsVisitorLoading(true);
            }}
          />
        ) : null}
      </div>
      {addVisitorOpen ? <AddCampusVisitorModal onClose={() => setAddVisitorOpen(false)} onSave={addVisitor} isSaving={isSavingVisitor} /> : null}
      {editingVisitor ? (
        <AddCampusVisitorModal
          initialVisitor={{
            name: editingVisitor.name,
            mobile: editingVisitor.mobile,
            category: editingVisitor.category,
            purpose: editingVisitor.purpose,
            numberOfVisitors: editingVisitor.numberOfVisitors,
            date: editingVisitor.date,
            entryTime: editingVisitor.entryTime,
            exitTime: editingVisitor.exitTime,
          }}
          onClose={() => setEditingVisitor(null)}
          onSave={updateVisitor}
          isSaving={isSavingVisitor}
        />
      ) : null}
      <ConfirmDeleteModal
        open={Boolean(deleteVisitor)}
        title="Delete"
        name="visitor"
        confirmText="Yes, Delete"
        onCancel={() => setDeleteVisitor(null)}
        onConfirm={removeVisitor}
        customDescription={deleteVisitor ? (
          <>
            Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteVisitor.name}</span>? This action cannot be undone.
          </>
        ) : undefined}
      />
    </section>
  );
}

export function SafetyVisitorsLogDashboard({ visitorContext }: { visitorContext?: VisitorContext }) {
  return <CampusVisitorsLogDashboard variant="safety" visitorContext={visitorContext} />;
}

function CampusVisitorStatusDropdown({ status, onChange }: { status: CampusVisitorStatus; onChange: (status: CampusVisitorStatus) => void }) {
  const className = status === "Completed" ? "bg-[#E7FAEE] text-[#10A66A]" : "bg-[#FFF2E5] text-[#F97316]";
  return <div className={`relative inline-flex rounded-full ${className}`}><select value={status} onChange={(event) => onChange(event.target.value as CampusVisitorStatus)} aria-label="Visitor status" className="h-8 cursor-pointer appearance-none rounded-full bg-transparent py-1 pl-3 pr-8 text-xs font-extrabold outline-none"><option value="Completed">Completed</option><option value="Inside Campus">Inside Campus</option></select><CaretDown size={12} weight="bold" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" /></div>;
}
