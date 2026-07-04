"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TableComponent from "@/app/utils/table/table";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  CalendarBlank,
  CaretDown,
  CheckCircle,
  Clock,
  FileText,
  MagnifyingGlass,
  UsersThree,
  X,
} from "@phosphor-icons/react";

const summaryCards = [
  { label: "Total Requests", status: "total", value: "15", icon: UsersThree },
  { label: "Approved", status: "approved", value: "08", icon: CheckCircle },
  { label: "Pending", status: "pending", value: "02", icon: Clock },
  { label: "Rejected", status: "rejected", value: "05", icon: FileText },
] as const;

const cardPalette: Record<string, { active: string; inactive: string; iconBg: string; icon: string }> = {
  total: {
    active: "bg-[#5C98FF] text-white",
    inactive: "bg-[#EBF2FF] text-[#282828]",
    iconBg: "#5C98FF",
    icon: "#FFFFFF",
  },
  approved: {
    active: "bg-[#48C37C] text-white",
    inactive: "bg-[#E7F8EE] text-[#282828]",
    iconBg: "#48C37C",
    icon: "#FFFFFF",
  },
  pending: {
    active: "bg-[#FFB874] text-white",
    inactive: "bg-[#FFF4EB] text-[#282828]",
    iconBg: "#FFB874",
    icon: "#FFFFFF",
  },
  rejected: {
    active: "bg-[#FF4242] text-white",
    inactive: "bg-[#FFE5E5] text-[#282828]",
    iconBg: "#FF4242",
    icon: "#FFFFFF",
  },
};

const requests = [
  {
    serialNo: "01",
    employeeId: "AC-2345001",
    name: "Ananya Sharma",
    role: "Accountant",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Sick",
    description: "I am not feeling well and need rest for recovery.",
    status: "pending",
  },
  {
    serialNo: "02",
    employeeId: "AC-2345002",
    name: "Arun Kumar",
    role: "Accounts Executive",
    dateRange: "10/11/2025 - 11/11/2025",
    days: "02",
    leaveType: "Personal",
    description: "Personal work at home.",
    status: "approved",
  },
  {
    serialNo: "03",
    employeeId: "AC-2345003",
    name: "Sneha Reddy",
    role: "Accountant",
    dateRange: "08/11/2025 - 10/11/2025",
    days: "03",
    leaveType: "Emergency",
    description: "Family emergency travel.",
    status: "rejected",
  },
  {
    serialNo: "04",
    employeeId: "AC-2345004",
    name: "Vikram Singh",
    role: "Accounts Executive",
    dateRange: "15/11/2025 - 15/11/2025",
    days: "01",
    leaveType: "Travel",
    description: "One day travel leave.",
    status: "approved",
  },
  {
    serialNo: "05",
    employeeId: "AC-2345005",
    name: "Pooja Nair",
    role: "Accountant",
    dateRange: "18/11/2025 - 19/11/2025",
    days: "02",
    leaveType: "Medical",
    description: "Medical leave for checkup.",
    status: "pending",
  },
];

const tableColumns = [
  { title: "S.No", key: "serialNo" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Name", key: "name" },
  { title: "Role", key: "role" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Status", key: "status" },
  { title: "Details", key: "details" },
];

function AccountantLeaveRequestContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRequestLeaveOpen = searchParams.get("modal") === "request-leave";
  const activeView = searchParams.get("view") === "tagged" ? "tagged" : "my";
  const activeStatus = searchParams.get("status") || "total";

  const updateQuery = (update: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    update(params);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const setActiveView = (view: "my" | "tagged") => {
    updateQuery((params) => {
      if (view === "tagged") params.set("view", "tagged");
      else params.delete("view");
      params.delete("status");
    });
  };

  const openRequestLeave = () => {
    updateQuery((params) => params.set("modal", "request-leave"));
  };

  const closeRequestLeave = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const setStatus = (status: string) => {
    updateQuery((params) => {
      if (status === "total") params.delete("status");
      else params.set("status", status);
    });
  };

  const filteredRequests =
    activeStatus === "total"
      ? requests
      : requests.filter((request) => request.status === activeStatus);

  const tableData = filteredRequests.map((request) => ({
    serialNo: request.serialNo,
    employeeId: (
      <span className="font-bold text-[#43C17A]">ID - {request.employeeId}</span>
    ),
    name: <span className="font-medium text-[#282828]">{request.name}</span>,
    role: request.role,
    dateRange: request.dateRange,
    days: request.days,
    leaveType: request.leaveType,
    description: request.description,
    status: <StatusPill status={request.status} />,
    details: (
      <button
        type="button"
        className="cursor-pointer text-sm font-semibold text-[#006BFF] hover:underline"
      >
        View Details
      </button>
    ),
  }));

  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-hidden bg-[#F4F4F4] pb-5">
      <section className="flex min-h-0 w-full flex-col p-2 md:w-[68%]">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="flex flex-wrap items-center gap-2 text-[15px] font-bold lg:text-[17px]">
              <button
                type="button"
                onClick={() => setActiveView("my")}
                className={`cursor-pointer ${
                  activeView === "my" ? "text-[#43C17A]" : "text-[#282828]"
                }`}
              >
                My Leave Request
              </button>
              <span className="text-[#282828]">/</span>
              <button
                type="button"
                onClick={() => setActiveView("tagged")}
                className={`cursor-pointer ${
                  activeView === "tagged" ? "text-[#43C17A]" : "text-[#282828]"
                }`}
              >
                Tagged Leave Requests
              </button>
            </h1>
            <p className="text-sm font-medium text-[#525252]">
              {activeView === "tagged"
                ? "Review leave requests where you are tagged and join the group chat."
                : "Submit leave applications and view approval updates from HR."}
            </p>
          </div>
          {activeView === "my" && (
            <button
              type="button"
              onClick={openRequestLeave}
              className="cursor-pointer whitespace-nowrap rounded-lg bg-[#16284F] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#102040]"
            >
              Request Leave
            </button>
          )}
        </div>

        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {summaryCards.map((card) => {
            const isActive = activeStatus === card.status;
            const Icon = card.icon;
            const palette = cardPalette[card.status];

            return (
              <button
                key={card.status}
                type="button"
                onClick={() => setStatus(card.status)}
                className={`flex h-32 cursor-pointer flex-col justify-between rounded-lg p-4 text-left shadow-sm transition-all hover:scale-[1.02] ${
                  isActive ? palette.active : palette.inactive
                }`}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-md"
                  style={{ backgroundColor: isActive ? "rgba(255,255,255,0.2)" : palette.iconBg }}
                >
                  <Icon size={20} weight="fill" color={palette.icon} />
                </span>
                <span>
                  <strong className="block text-lg">{card.value}</strong>
                  <span className="text-sm font-medium">{card.label}</span>
                </span>
              </button>
            );
          })}
        </section>

        <section className="mt-3 flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex w-full max-w-full items-center gap-3 rounded-full bg-gray-200 px-4 py-2.5 sm:max-w-[300px]">
              <MagnifyingGlass size={20} color="#43C17A" />
              <input
                placeholder={
                  activeView === "tagged"
                    ? "Search tagged requests..."
                    : "Search by leave type or description..."
                }
                className="h-full w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#282828]"
              />
            </label>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-md bg-[#DAE9E1] px-4 py-1.5 text-sm font-bold tracking-wide text-[#43C17A] transition-colors hover:bg-[#cbe6d7]"
            >
              <CalendarBlank size={18} weight="fill" />
              04/07/2026
            </button>
          </div>

          <div className="leave-request-table min-h-0 flex-1">
            <style>{`.leave-request-table table { min-width: 980px; }`}</style>
            <TableComponent
              columns={tableColumns}
              tableData={tableData}
              height="55vh"
              emptyStateMessage="No leave requests available."
            />
          </div>
        </section>
      </section>

      <StaticRightPanel />
      {isRequestLeaveOpen && <RequestLeaveModal onClose={closeRequestLeave} />}
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const statusClass =
    status === "approved"
      ? "bg-[#E7F8EE] text-[#43C17A]"
      : status === "rejected"
        ? "bg-[#FFD7D7] text-[#FF2020]"
        : "bg-[#FFF1DC] text-[#FF9F2E]";

  return (
    <span className={`inline-flex min-w-28 items-center justify-center rounded-full px-4 py-1 text-sm font-medium ${statusClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StaticRightPanel() {
  return (
    <aside className="hidden min-h-0 w-[32%] flex-col p-2 pr-0 md:flex">
      <div className="flex justify-end">
        <div className="w-[160px]">
          <CourseScheduleCard isVisibile={false} fullWidth />
        </div>
      </div>
      <WorkWeekCalendar style="mt-3 max-w-full" />
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <AnnouncementsCard
          announceCard={[]}
          height="80vh"
          currentView="others"
          readOnly
        />
      </div>
    </aside>
  );
}

function RequestLeaveModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[520px] rounded-md bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center text-[#525252] hover:text-[#282828]"
        >
          <X size={22} />
        </button>
        <h2 className="text-xl font-semibold text-[#282828]">Request Leave</h2>

        <form className="mt-4 flex flex-col gap-4">
          <StaticSelect label="Leave Type" placeholder="Select Leave Type" />
          <div className="grid grid-cols-2 gap-5">
            <StaticDate label="Start Date" />
            <StaticDate label="End Date" />
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#282828]">
              Description <RequiredMark />
            </span>
            <textarea
              rows={5}
              placeholder="Provide a short explanation for your leave request............"
              className="w-full resize-none rounded border border-[#CFCFCF] px-4 py-3 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
            />
          </label>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 cursor-pointer rounded bg-[#E0E0E0] text-sm font-semibold text-[#282828] hover:bg-[#D5D5D5]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 cursor-pointer rounded bg-[#43C17A] text-sm font-semibold text-white hover:bg-[#34A565]"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StaticSelect({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-[#282828]">
        {label} <RequiredMark />
      </span>
      <button
        type="button"
        className="flex h-11 w-full cursor-pointer items-center justify-between rounded border border-[#43C17A] bg-white px-4 text-sm text-[#525252] outline-none"
      >
        {placeholder}
        <CaretDown size={18} className="text-[#282828]" />
      </button>
    </label>
  );
}

function StaticDate({ label }: { label: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-[#282828]">
        {label} <RequiredMark />
      </span>
      <input
        type="date"
        className="h-12 w-full cursor-pointer rounded-xl border border-[#CFCFCF] px-5 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
      />
    </label>
  );
}

function RequiredMark() {
  return <span className="ml-1 text-[#FF2020]">*</span>;
}

export default function AccountantLeaveRequestPage() {
  return (
    <Suspense>
      <AccountantLeaveRequestContent />
    </Suspense>
  );
}
