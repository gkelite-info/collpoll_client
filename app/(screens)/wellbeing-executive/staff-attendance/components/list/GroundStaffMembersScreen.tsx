"use client";

import {
  CaretLeft,
  Eye,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import Image from "next/image";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import TableComponent from "@/app/utils/table/table";
import { useMemo, useState } from "react";
import { getInitials, type StaffAttendanceRecord, type StaffAttendanceStatus } from "../../data";

type GroundStaffMembersScreenProps = {
  records: StaffAttendanceRecord[];
  activeStatus?: StaffAttendanceStatus | null;
  isLoading?: boolean;
  onBack: () => void;
  onViewProfile: (record: StaffAttendanceRecord) => void;
};

const DIRECTORY_ITEMS_PER_PAGE = 5;

export default function GroundStaffMembersScreen({
  records,
  activeStatus = null,
  isLoading = false,
  onBack,
  onViewProfile,
}: GroundStaffMembersScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isInitialLoading = isLoading && !records.length && !searchQuery.trim();
  const directoryRows = useMemo(
    () =>
      activeStatus
        ? records.filter((record) => record.status === activeStatus)
        : records,
    [activeStatus, records],
  );
  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return directoryRows.filter((record) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        record.name.toLowerCase().includes(normalizedQuery) ||
        record.staffId.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [directoryRows, searchQuery]);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * DIRECTORY_ITEMS_PER_PAGE,
    currentPage * DIRECTORY_ITEMS_PER_PAGE,
  );

  const columns = [
    { title: "STAFF NAME", key: "image" },
    { title: "EMPLOYEE ID", key: "employeeId" },
    { title: "STATUS", key: "status" },
    { title: "CONTACT NUMBER", key: "contact" },
    { title: "JOINING DATE", key: "joiningDate" },
    { title: "ACTIONS", key: "actions" },
  ];
  const tableData = paginatedRows.map((record) => ({
    image: (
      <div className="flex min-w-[170px] items-center gap-3 text-left">
        {record.image ? (
          <Image
            src={record.image}
            alt={record.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EAF0F7] text-[11px] font-extrabold text-[#0B66C3]">
            {getInitials(record.name)}
          </span>
        )}
        <span className="font-extrabold text-[#08244A]">{record.name}</span>
      </div>
    ),
    employeeId: <span className="font-semibold">{record.staffId}</span>,
    status: <StatusBadge status={record.status} />,
    contact: record.phone,
    joiningDate: record.joiningDate,
    actions: (
      <button type="button" onClick={() => onViewProfile(record)} title="View profile" className="cursor-pointer text-[#64748B] transition-colors hover:text-[#0B66C3]">
        <Eye size={18} weight="bold" />
      </button>
    ),
  }));

  return (
    <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
      <section className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center text-[#08244A] transition-colors hover:text-[#123A6D]"
              title="Back to attendance"
            >
              <CaretLeft size={24} weight="bold" />
            </button>
            <div>
              <h1 className="text-[25px] font-extrabold text-[#08244A]">Security Staff Directory</h1>
              <p className="text-[12px] font-medium text-[#64748B]">
                View and manage all security personnel assigned across the campus.
              </p>
            </div>
          </div>
        </div>

        {isInitialLoading ? (
          <GroundStaffDirectoryShimmer />
        ) : (
          <div className="mt-6 rounded-lg border border-[#D7DFEC] bg-white">
            <div className="border-b border-[#E4E9F1] p-4">
              <div className="flex h-10 max-w-[540px] items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[12px] font-semibold text-[#8A9AB5]">
                <MagnifyingGlass size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name or employee ID"
                  className="h-full flex-1 bg-transparent text-[#34425E] outline-none placeholder:text-[#8A9AB5]"
                />
              </div>
            </div>

            <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:bg-[#F3F6FA] [&_th]:py-4 [&_th]:text-[10px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:text-[#34425E] [&_td]:py-4 [&_td]:text-[12px]">
              <TableComponent
                columns={columns}
                tableData={tableData}
                isLoading={isLoading}
                tableClassName="min-w-[860px] table-fixed"
                height="none"
                stickyHeader={false}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredRows.length}
              itemsPerPage={DIRECTORY_ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function GroundStaffDirectoryShimmer() {
  return (
    <div className="mt-6 animate-pulse overflow-hidden rounded-lg border border-[#D7DFEC] bg-white">
      <div className="border-b border-[#E4E9F1] p-4">
        <div className="h-10 max-w-[540px] rounded-md bg-[#EAF0F7]" />
      </div>
      <div className="h-14 bg-[#F3F6FA]" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.5fr_1fr_1fr_1.2fr_1fr_80px] items-center gap-5 border-b border-[#E4E9F1] px-6 py-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#DDE5F0]" />
            <div className="h-4 w-28 rounded bg-[#EAF0F7]" />
          </div>
          {Array.from({ length: 5 }).map((__, cellIndex) => (
            <div key={cellIndex} className="h-4 rounded bg-[#EAF0F7]" />
          ))}
        </div>
      ))}
      <div className="flex justify-end gap-2 px-5 py-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-7 w-7 rounded-full bg-[#EAF0F7]" />
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StaffAttendanceRecord["status"] }) {
  const label =
    status === "present"
      ? "Present"
      : status === "absent"
        ? "Absent"
        : status === "late"
          ? "Late"
          : status === "leave"
            ? "Leave"
          : "Not Marked";
  const className =
    status === "present"
      ? "bg-[#E8F8EF] text-[#009B55]"
      : status === "absent"
        ? "bg-[#FFF2F2] text-[#EF4444]"
        : status === "late"
          ? "bg-[#FFF4DF] text-[#D97706]"
          : status === "leave"
            ? "bg-[#EAF0FF] text-[#2563EB]"
          : "bg-[#EEF1F5] text-[#64748B]";

  return (
    <span className={`inline-flex min-w-[76px] justify-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${className}`}>
      {label}
    </span>
  );
}

