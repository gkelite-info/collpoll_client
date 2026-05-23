"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BuildingIcon,
  CaretDown,
  CaretLeftIcon,
  EyeIcon,
  MagnifyingGlass,
  RepeatIcon,
} from "@phosphor-icons/react";
import { MdPictureAsPdf } from "react-icons/md";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import WellbeingRight from "../../components/WellbeingRight";
import ReassignTicketModal from "../../components/ReassignTicketModal";
import { collegeIssueRows, DashboardIssue, hostelIssueRows } from "./dashboardIssueData";

const ITEMS_PER_PAGE = 10;

function StudentCell({ row }: { row: DashboardIssue }) {
  return (
    <div className="flex min-w-[250px] items-center gap-3 text-left">
      <Image
        src={row.studentImage}
        alt={row.student}
        width={42}
        height={42}
        className="h-[42px] w-[42px] rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-[#282828]">{row.student}</p>
        <p className="mt-1 truncate text-[11px] font-medium text-[#4B5563]">{row.meta}</p>
      </div>
    </div>
  );
}

function PriorityPill({ priority }: { priority: DashboardIssue["priority"] }) {
  const className =
    priority === "Urgent"
      ? "bg-[#FFE3E3] text-[#C91E1E]"
      : priority === "High"
        ? "bg-[#FFEEEE] text-[#FF1F1F]"
        : priority === "Medium"
          ? "bg-[#FFF3D8] text-[#B87500]"
          : "bg-[#E8F8EF] text-[#2F8F5B]";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${className}`}>
      {priority}
    </span>
  );
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#E8F3EC] px-3 py-1 text-[11px] font-bold text-[#557064]">
      {label}
    </span>
  );
}

function EvidencePill({ label }: { label: string }) {
  return (
    <button
      title={label}
      className="inline-flex items-center gap-2 rounded-full bg-[#E8F3EC] px-3 py-1 text-[12px] font-bold text-[#16284F]"
    >
      <MdPictureAsPdf className="text-[19px] text-[#FF2525]" />
      <span>View PDF</span>
    </button>
  );
}

function ActionButtons({
  row,
  onReassign,
}: {
  row: DashboardIssue;
  onReassign: (ticketId: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex min-w-[68px] items-center justify-center gap-1.5">
      <button
        type="button"
        title="View issue details"
        onClick={() => router.push(`${pathname}?ticketId=${encodeURIComponent(row.id)}`)}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#16284F] text-white transition-colors hover:bg-[#0F1E3C]"
      >
        <EyeIcon size={16} weight="fill" />
      </button>
      <button
        type="button"
        title="Reassign issue"
        onClick={() => onReassign(row.id)}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#16284F] text-white transition-colors hover:bg-[#0F1E3C]"
      >
        <RepeatIcon size={16} weight="bold" />
      </button>
    </div>
  );
}

export default function DashboardAllIssueListView({ stage }: { stage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialScope = searchParams.get("scope") === "hostel" ? "hostel" : "college";
  const [scope, setScope] = useState<"college" | "hostel">(initialScope);
  const [priority, setPriority] = useState<DashboardIssue["priority"] | "All">("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reassignModalTargetId, setReassignModalTargetId] = useState<string | null>(null);

  const rows = scope === "college" ? collegeIssueRows : hostelIssueRows;
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesPriority = priority === "All" || row.priority === priority;
      const matchesSearch =
        query.length === 0 ||
        row.student.toLowerCase().includes(query) ||
        row.meta.toLowerCase().includes(query) ||
        row.id.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query);

      return matchesPriority && matchesSearch;
    });
  }, [priority, rows, search]);

  const totalItems = filteredRows.length;
  const paginatedRows = filteredRows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns = useMemo(
    () =>
      scope === "college"
        ? [
          { title: "Student", key: "subject" },
          { title: "Issue", key: "issue" },
          { title: "Category", key: "category" },
          { title: "Priority", key: "priority" },
          { title: "Evidence", key: "evidence" },
          { title: "Action", key: "actions" },
        ]
        : [
          { title: "Student", key: "subject" },
          { title: "Issue", key: "issue" },
          { title: "Block", key: "block" },
          { title: "Building / Room", key: "room" },
          { title: "Category", key: "category" },
          { title: "Priority", key: "priority" },
          { title: "Evidence", key: "evidence" },
          { title: "Action", key: "actions" },
        ],
    [scope],
  );

  const tableData = paginatedRows.map((row) => ({
    subject: <StudentCell row={row} />,
    issue: (
      <div className="min-w-[310px] max-w-[380px] text-left">
        <p className="truncate text-[13px] font-bold text-[#282828]">{row.issue}</p>
        <p className="mt-1 truncate text-[11px] font-medium text-[#4B5563]">{row.description}</p>
      </div>
    ),
    block: <span className="block min-w-[64px] text-[13px] font-bold text-[#282828]">{row.block}</span>,
    room: <span className="block min-w-[130px] text-[13px] font-bold text-[#282828]">{row.room}</span>,
    category: <CategoryPill label={row.category} />,
    priority: <PriorityPill priority={row.priority} />,
    evidence: <EvidencePill label={row.evidence} />,
    actions: <ActionButtons row={row} onReassign={setReassignModalTargetId} />,
  }));

  const handleScopeChange = (nextScope: "college" | "hostel") => {
    setScope(nextScope);
    setPage(1);
    router.replace(`${pathname}?view=issue-list&scope=${nextScope}`, { scroll: false });
  };

  return (
    <main className="flex min-h-screen w-full pb-5">
      <div className="w-full p-1 md:p-2 lg:w-[68%]">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <button
                title="Back to dashboard"
                onClick={() => router.push(pathname)}
                className="mt-1 cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-[#282828] hover:bg-[#E5E7EB]"
              >
                <CaretLeftIcon size={18} weight="bold" />
              </button>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F8EF] text-[#43C17A]">
                <BuildingIcon size={20} weight="fill" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-[#16284F]">
                  {scope === "college" ? "College Issues" : "Hostel Issues"}
                </h1>
                <p className="mt-1 text-[12px] font-medium text-[#667085]">
                  Search, filter, and manage all reported wellbeing issues.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={scope}
                onChange={(event) => handleScopeChange(event.target.value as "college" | "hostel")}
                className="h-9 cursor-pointer rounded-md border border-[#D7D7D7] bg-white px-3 text-[12px] font-bold text-[#282828] outline-none"
              >
                <option value="college">Student</option>
                <option value="hostel">Faculty</option>
                <option value="hostel">Admin</option>
                <option value="hostel">Finance</option>
              </select>
              <select
                value={scope}
                onChange={(event) => handleScopeChange(event.target.value as "college" | "hostel")}
                className="h-9 cursor-pointer rounded-md border border-[#D7D7D7] bg-white px-3 text-[12px] font-bold text-[#282828] outline-none"
              >
                <option value="college">College</option>
                <option value="hostel">Hostel</option>
              </select>
              <span className="relative">
                <select
                  value={priority}
                  onChange={(event) => {
                    setPriority(event.target.value as DashboardIssue["priority"] | "All");
                    setPage(1);
                  }}
                  className="h-9 cursor-pointer appearance-none rounded-md border border-[#D7D7D7] bg-white py-0 pl-3 pr-9 text-[12px] font-bold text-[#282828] outline-none"
                >
                  {["All", "Urgent", "High", "Medium", "Low"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={14}
                  weight="bold"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                />
              </span>
            </div>
          </div>

          <div className="relative max-w-full sm:max-w-[360px]">
            <MagnifyingGlass
              size={17}
              weight="bold"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by student, ID, ticket, category"
              className="h-10 w-full rounded-md border border-[#D7D7D7] bg-[#FBFBFC] pl-10 pr-3 text-[12px] font-semibold text-[#282828] outline-none focus:border-[#43C17A]"
            />
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto p-2">
            <div className={scope === "college" ? "min-w-[1120px]" : "min-w-[1260px]"}>
              <TableComponent
                columns={columns}
                tableData={tableData}
                height="71vh"
                stickyHeader
                fillHeight
              />
            </div>
          </div>
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
            roundedBottom="rounded-b-2xl"
          />
        </div>
      </div>

      {stage >= 3 ? (
        <WellbeingRight />
      ) : (
        <aside className="hidden w-[32%] flex-col p-2 pr-0 lg:flex lg:w-[32%]">
          <div className="h-[54px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[170px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[520px] animate-pulse rounded-lg bg-gray-200" />
        </aside>
      )}

      <ReassignTicketModal
        isOpen={reassignModalTargetId !== null}
        onClose={() => setReassignModalTargetId(null)}
        ticketId={reassignModalTargetId || undefined}
      />
    </main>
  );
}
