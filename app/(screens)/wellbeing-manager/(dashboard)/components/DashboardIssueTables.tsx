"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BuildingIcon, CaretDown, EyeIcon, RepeatIcon } from "@phosphor-icons/react";
import { MdPictureAsPdf } from "react-icons/md";
import TableComponent from "@/app/utils/table/table";
import ReassignTicketModal from "../../components/ReassignTicketModal";
import { collegeIssueRows, DashboardIssue, hostelIssueRows } from "./dashboardIssueData";

const TABLE_HEIGHT = "286px";
const DASHBOARD_ROW_LIMIT = 10;

type IssueTableCardProps = {
  title: string;
  description: string;
  rows: DashboardIssue[];
  variant: "college" | "hostel";
  onReassign: (ticketId: string) => void;
};

function StudentCell({ row }: { row: DashboardIssue }) {
  return (
    <div className="flex min-w-[250px] items-center gap-4 text-left">
      <Image
        src={row.studentImage}
        alt={row.student}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold text-[#282828]">{row.student}</p>
        <p className="mt-1 truncate text-[12px] font-medium text-[#282828]">{row.meta}</p>
      </div>
    </div>
  );
}

function IssueCell({ row }: { row: DashboardIssue }) {
  return (
    <div className="min-w-[310px] max-w-[360px] text-left">
      <p className="truncate text-[14px] font-bold text-[#282828]">{row.issue}</p>
      <p className="mt-2 truncate text-[12px] font-medium text-[#282828]">{row.description}</p>
    </div>
  );
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#E8F3EC] px-3 py-1 text-[12px] font-bold text-[#557064]">
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
      <MdPictureAsPdf className="text-[20px] text-[#FF2525]" />
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

function EmptyTableState({ message }: { message: string }) {
  return (
    <div className="flex h-[286px] items-center justify-center rounded-lg border border-dashed border-[#D6DED9] bg-white text-center">
      <p className="max-w-[260px] text-[13px] font-semibold text-[#667085]">{message}</p>
    </div>
  );
}

function IssueTableCard({
  title,
  description,
  rows,
  variant,
  onReassign,
}: IssueTableCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPriority, setSelectedPriority] = useState<DashboardIssue["priority"] | "All">("High");
  const visibleRows = rows
    .filter((row) => selectedPriority === "All" || row.priority === selectedPriority)
    .slice(0, DASHBOARD_ROW_LIMIT);

  const columns = useMemo(
    () =>
      variant === "college"
        ? [
            { title: "Student", key: "subject" },
            { title: "Issue", key: "issue" },
            { title: "Category", key: "category" },
            { title: "Evidence", key: "evidence" },
            { title: "Action", key: "actions" },
          ]
        : [
            { title: "Student", key: "subject" },
            { title: "Issue", key: "issue" },
            { title: "Block", key: "block" },
            { title: "Building / Room", key: "room" },
            { title: "Category", key: "category" },
            { title: "Evidence", key: "evidence" },
            { title: "Action", key: "actions" },
          ],
    [variant],
  );

  const tableData = visibleRows.map((row) => ({
    subject: <StudentCell row={row} />,
    issue: <IssueCell row={row} />,
    block: <span className="block min-w-[64px] text-[14px] font-bold text-[#282828]">{row.block}</span>,
    room: <span className="block min-w-[130px] text-[14px] font-bold text-[#282828]">{row.room}</span>,
    category: <CategoryPill label={row.category} />,
    evidence: <EvidencePill label={row.evidence} />,
    actions: <ActionButtons row={row} onReassign={onReassign} />,
  }));

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F8EF] text-[#43C17A]">
            <BuildingIcon size={20} weight="fill" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#282828]">{title}</h3>
            <p className="mt-1 text-[12px] font-medium text-[#282828]">{description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5 self-end sm:self-auto">
          <label className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-[#282828]">Priority</span>
            <span className="relative">
              <select
                value={selectedPriority}
                onChange={(event) =>
                  setSelectedPriority(event.target.value as DashboardIssue["priority"] | "All")
                }
                className="h-8 cursor-pointer appearance-none rounded-full bg-[#E1F6EA] py-0 pl-4 pr-9 text-[13px] font-bold text-[#43C17A] outline-none"
              >
                {["High", "Urgent", "Medium", "Low", "All"].map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <CaretDown
                size={16}
                weight="bold"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A]"
              />
            </span>
          </label>
          <button
            onClick={() => router.push(`${pathname}?view=issue-list&scope=${variant}`)}
            className="text-[13px] cursor-pointer font-bold text-[#16284F] hover:underline hover:text-green-500 underline-offset-2"
          >
            View All
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyTableState message={`No ${title.toLowerCase()} need attention right now.`} />
      ) : (
        <div className="overflow-x-auto">
          <div className={variant === "college" ? "min-w-[1040px]" : "min-w-[1180px]"}>
            <TableComponent
              columns={columns}
              tableData={tableData}
              height={TABLE_HEIGHT}
              stickyHeader
              fillHeight
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default function DashboardIssueTables() {
  const [reassignModalTargetId, setReassignModalTargetId] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-col gap-3">
        <IssueTableCard
          title="College Issues"
          description="Latest reported complaints across College"
          rows={collegeIssueRows}
          variant="college"
          onReassign={setReassignModalTargetId}
        />
        <IssueTableCard
          title="Hostel Issues"
          description="Latest reported complaints across Hostel"
          rows={hostelIssueRows}
          variant="hostel"
          onReassign={setReassignModalTargetId}
        />
      </div>
      <ReassignTicketModal
        isOpen={reassignModalTargetId !== null}
        onClose={() => setReassignModalTargetId(null)}
        ticketId={reassignModalTargetId || undefined}
      />
    </>
  );
}
