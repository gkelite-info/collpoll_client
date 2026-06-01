"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarBlank,
  MagnifyingGlass,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import CardComponent from "@/app/utils/card";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { useUser } from "@/app/utils/context/UserContext";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { financeAnnouncements } from "@/app/(screens)/finance-manager/(dashboard)/components/data";
import {
  leaveSummaryCards,
  type FinanceLeaveRequest,
} from "@/app/(screens)/finance-manager/leave-request/data";
import RequestLeaveModal from "./components/RequestLeaveModal";
import LeaveRequestDetailsModal from "./components/LeaveRequestDetailsModal";
import {
  fetchEmployeeLeaveRequestCounts,
  fetchPaginatedEmployeeLeaveRequests,
  type EmployeeLeaveRequestRecord,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";

const ITEMS_PER_PAGE = 10;

const cardPalette: Record<
  string,
  { active: string; inactive: string; iconBg: string }
> = {
  total: {
    active: "bg-[#5C98FF]",
    inactive: "bg-[#EBF2FF]",
    iconBg: "#5C98FF",
  },
  approved: {
    active: "bg-[#48C37C]",
    inactive: "bg-[#E7F8EE]",
    iconBg: "#48C37C",
  },
  pending: {
    active: "bg-[#FFB874]",
    inactive: "bg-[#FFF4EB]",
    iconBg: "#FFB874",
  },
  rejected: {
    active: "bg-[#FF4242]",
    inactive: "bg-[#FFE5E5]",
    iconBg: "#FF4242",
  },
};

const statusLabels: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const formatDbDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB");

const titleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const calculateDays = (fromDate: string, toDate: string) => {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  const diff = Math.max(0, to.getTime() - from.getTime());
  return String(Math.floor(diff / 86_400_000) + 1).padStart(2, "0");
};

const mapDbRequestToFinanceRow = (
  request: EmployeeLeaveRequestRecord,
  serialNumber: number,
  fallbackName: string,
): FinanceLeaveRequest => {
  const requesterName = request.user?.fullName ?? fallbackName;
  const fromDate = formatDbDate(request.leaveFromDate);
  const toDate = formatDbDate(request.leaveToDate);
  const leaveType = titleCase(request.leaveType);

  return {
    employeeLeaveRequestId: request.employeeLeaveRequestId,
    serialNo: String(serialNumber).padStart(2, "0"),
    employeeId: request.employee?.employeeId ?? String(request.employeeId),
    name: requesterName,
    role: titleCase(request.role),
    photo: request.user?.profileUrl ?? "",
    requestedDate: formatDbDate(request.createdAt.slice(0, 10)),
    dateRange: `${fromDate} - ${toDate}`,
    days: calculateDays(request.leaveFromDate, request.leaveToDate),
    leaveType,
    description: request.description,
    status: request.status,
    chat: [],
  };
};

function StatusAction({ status }: { status: string }) {
  const classes =
    status === "approved"
      ? "bg-[#E7F8EE] text-[#43C17A]"
      : status === "rejected"
        ? "bg-[#FFD7D7] text-[#FF2020]"
        : "bg-[#FFF1DC] text-[#FF9F2E]";

  return (
    <span
      className={`inline-flex min-w-28 items-center justify-center rounded-full px-4 py-1 text-sm font-medium ${classes}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function LeaveRequestContent() {
  const { userId, fullName, loading: userLoading } = useUser();
  const { collegeId, loading: financeLoading } = useFinanceManager();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") || "total";
  const isRequestLeaveOpen = searchParams.get("modal") === "request-leave";
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<FinanceLeaveRequest | null>(null);
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState<FinanceLeaveRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const loadCounts = useCallback(async () => {
    if (userLoading || financeLoading) return;

    if (!userId || !collegeId) {
      setCounts({ total: 0, approved: 0, pending: 0, rejected: 0 });
      setIsCardsLoading(false);
      return;
    }

    setIsCardsLoading(true);
    try {
      setCounts(await fetchEmployeeLeaveRequestCounts({ userId, collegeId }));
    } catch (error) {
      console.error("Error fetching finance leave summary counts:", error);
      setCounts({ total: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setIsCardsLoading(false);
    }
  }, [collegeId, financeLoading, userId, userLoading]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCounts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCounts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, selectedDate]);

  const loadRequests = useCallback(async () => {
    if (userLoading || financeLoading) return;

    if (!userId || !collegeId) {
      setRequests([]);
      setTotalCount(0);
      setIsTableLoading(false);
      return;
    }

    setIsTableLoading(true);
    try {
      const result = await fetchPaginatedEmployeeLeaveRequests({
        userId,
        collegeId,
        status:
          activeStatus === "total"
            ? undefined
            : (activeStatus as "approved" | "pending" | "rejected"),
        page,
        pageSize: ITEMS_PER_PAGE,
        search: debouncedQuery,
        date: selectedDate,
      });

      setRequests(
        result.data.map((request, index) =>
          mapDbRequestToFinanceRow(
            request,
            (page - 1) * ITEMS_PER_PAGE + index + 1,
            fullName ?? "Finance Executive",
          ),
        ),
      );
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error fetching finance leave requests:", error);
      setRequests([]);
      setTotalCount(0);
    } finally {
      setIsTableLoading(false);
    }
  }, [
    activeStatus,
    collegeId,
    debouncedQuery,
    financeLoading,
    fullName,
    page,
    selectedDate,
    userId,
    userLoading,
  ]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const handleCreated = () => loadRequests();
    window.addEventListener("employee-leave-request-created", handleCreated);
    return () =>
      window.removeEventListener("employee-leave-request-created", handleCreated);
  }, [loadRequests]);

  useEffect(() => {
    const handleCreated = () => loadCounts();
    window.addEventListener("employee-leave-request-created", handleCreated);
    return () =>
      window.removeEventListener("employee-leave-request-created", handleCreated);
  }, [loadCounts]);

  const updateParams = (update: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    update(params);
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const cards = useMemo(
    () =>
      leaveSummaryCards.map((card) => ({
        ...card,
        value: String(counts[card.status as keyof typeof counts] ?? 0).padStart(
          2,
          "0",
        ),
      })),
    [counts],
  );

  const tableData = requests.map((request) => ({
    serialNo: request.serialNo,
    dateRange: request.dateRange,
    days: request.days,
    leaveType: request.leaveType,
    description: request.description,
    action: <StatusAction status={request.status} />,
    details: (
      <button
        type="button"
        onClick={() => setSelectedRequest(request)}
        className="cursor-pointer text-sm font-semibold text-[#006BFF] hover:underline"
      >
        View Details
      </button>
    ),
  }));

  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-hidden bg-[#F4F4F4] pb-5">
      <section className="flex min-h-0 w-full flex-col p-2 md:w-[68%]">
        <style>{`
          .leave-request-table table { min-width: 900px; }
        `}</style>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold text-[#43C17A] md:text-2xl">
              My Leave Request
            </h1>
            <p className="text-sm font-medium text-[#525252]">
              Submit leave applications and view approval updates from HR.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateParams((params) => params.set("modal", "request-leave"))
            }
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#16284F] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#102040]"
          >
            Request Leave
          </button>
        </div>

        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((card) => {
            const isActive = activeStatus === card.status;
            const palette = cardPalette[card.status];
            return isCardsLoading ? (
              <div
                key={card.label}
                className="h-32 w-full animate-pulse rounded-lg bg-white shadow-sm"
              >
                <div className="flex h-full flex-col justify-between p-4">
                  <div className="h-9 w-9 rounded-md bg-gray-200" />
                  <div>
                    <div className="mb-2 h-5 w-12 rounded bg-gray-200" />
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ) : (
              <CardComponent
                key={card.label}
                icon={<UsersThree size={20} weight="fill" />}
                value={card.value}
                label={card.label}
                isActive={isActive}
                iconColor="#FFFFFF"
                iconBgColor={
                  isActive ? "rgba(255,255,255,0.2)" : palette.iconBg
                }
                style={`w-full transition-all duration-300 ${isActive ? palette.active : palette.inactive}`}
                textSize={isActive ? "text-white" : "text-[#282828]"}
                onClick={() => {
                  setPage(1);
                  updateParams((params) => {
                    if (card.status === "total") params.delete("status");
                    else params.set("status", card.status);
                  });
                }}
              />
            );
          })}
        </section>

        <section className="mt-3 flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex w-full max-w-full items-center gap-3 rounded-full bg-gray-200 px-4 py-2.5 sm:max-w-[300px]">
              <MagnifyingGlass size={20} color="#43C17A" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by leave type or description..."
                className="h-full w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#282828]"
              />
            </label>
            <div className="relative self-start sm:self-auto">
              {!isDatePickerOpen ? (
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-md bg-[#DAE9E1] px-4 py-1.5 text-sm font-bold tracking-wide text-[#43C17A] transition-colors hover:bg-[#cbe6d7]"
                >
                  <CalendarBlank size={18} weight="fill" />
                  {selectedDate
                    ? new Date(
                        `${selectedDate}T00:00:00`,
                      ).toLocaleDateString("en-GB")
                    : new Date().toLocaleDateString("en-GB")}
                </button>
              ) : (
                <div className="flex h-8 items-center gap-2 rounded-md border border-[#43C17A] bg-white p-1 shadow-sm">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setPage(1);
                      setIsDatePickerOpen(false);
                    }}
                    className="cursor-pointer rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate("");
                        setIsDatePickerOpen(false);
                      }}
                      className="cursor-pointer rounded px-1 text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="cursor-pointer p-1 text-gray-500"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="leave-request-table min-h-0 flex-1">
            <TableComponent
              columns={[
                { title: "S.No", key: "serialNo" },
                { title: "From - To", key: "dateRange" },
                { title: "Days", key: "days" },
                { title: "Leave Type", key: "leaveType" },
                { title: "Description", key: "description" },
                { title: "Action", key: "action" },
                { title: "Details", key: "details" },
              ]}
              tableData={tableData}
              height="55vh"
              isLoading={isTableLoading}
            />
          </div>
          <Pagination
            currentPage={page}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
            roundedBottom="rounded-b-lg"
          />
        </section>
      </section>

      <aside className="hidden min-h-0 w-[32%] flex-col p-2 pr-0 md:flex">
        <div className="flex justify-end">
          <div className="w-[160px]">
            <CourseScheduleCard isVisibile={false} fullWidth />
          </div>
        </div>
        <WorkWeekCalendar style="mt-3 max-w-full" />
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <AnnouncementsCard
            announceCard={financeAnnouncements}
            height="80vh"
            currentView="others"
            readOnly
          />
        </div>
      </aside>

      <RequestLeaveModal
        open={isRequestLeaveOpen}
        onClose={() => updateParams((params) => params.delete("modal"))}
      />
      <LeaveRequestDetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LeaveRequestContent />
    </Suspense>
  );
}
