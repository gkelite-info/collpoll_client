"use client";

import {
  ArrowLeft,
  Eye,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import Image from "next/image";
import TableComponent from "@/app/utils/table/table";
import { useMemo, useState } from "react";
import { getInitials, type StaffAttendanceRecord } from "../../data";

type GroundStaffMembersScreenProps = {
  records: StaffAttendanceRecord[];
  onBack: () => void;
  onViewProfile: (record: StaffAttendanceRecord) => void;
};

export default function GroundStaffMembersScreen({
  records,
  onBack,
  onViewProfile,
}: GroundStaffMembersScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const directoryRows = records;
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
  const columns = [
    { title: "STAFF NAME", key: "image" },
    { title: "EMPLOYEE ID", key: "employeeId" },
    { title: "STATUS", key: "status" },
    { title: "CONTACT NUMBER", key: "contact" },
    { title: "JOINING DATE", key: "joiningDate" },
    { title: "ACTIONS", key: "actions" },
  ];
  const tableData = filteredRows.map((record) => ({
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
    contact: record.phone.replace(/\d(?=\d{2})/g, "X"),
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
              className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#08244A] text-white transition-colors hover:bg-[#123A6D]"
              title="Back to attendance"
            >
              <ArrowLeft size={22} weight="bold" />
            </button>
            <div>
              <h1 className="text-[25px] font-extrabold text-[#08244A]">Security Staff Directory</h1>
              <p className="text-[12px] font-medium text-[#64748B]">
                View and manage all security personnel assigned across the campus.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-[#D7DFEC] bg-white">
          <div className="border-b border-[#E4E9F1] p-4">
            <div className="flex h-10 max-w-[540px] items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[12px] font-semibold text-[#8A9AB5]">
              <MagnifyingGlass size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or employee ID"
                className="h-full flex-1 bg-transparent text-[#34425E] outline-none placeholder:text-[#8A9AB5]"
              />
            </div>
          </div>

          <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:bg-[#F3F6FA] [&_th]:py-4 [&_th]:text-[10px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:text-[#34425E] [&_td]:py-4 [&_td]:text-[12px]">
            <TableComponent columns={columns} tableData={tableData} tableClassName="min-w-[860px] table-fixed" height="none" stickyHeader={false} />
          </div>

          <div className="flex items-center justify-between border-t border-[#E4E9F1] px-5 py-4 text-[11px] text-[#6B7280]">
            <span>
              Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {directoryRows.length} staff members
            </span>
            <div className="flex items-center gap-2">
              {["<", "1", "2", "3", "...", "12", ">"].map((item) => (
                <button
                  key={item}
                  className={`h-7 min-w-7 rounded border px-2 text-[11px] font-bold ${
                    item === "1"
                      ? "border-[#08244A] bg-[#08244A] text-white"
                      : "border-[#D7DFEC] bg-white text-[#64748B]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
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
          : "Not Marked";
  const className =
    status === "present"
      ? "bg-[#E8F8EF] text-[#009B55]"
      : status === "absent"
        ? "bg-[#FFF2F2] text-[#EF4444]"
        : status === "late"
          ? "bg-[#FFF4DF] text-[#D97706]"
          : "bg-[#EEF1F5] text-[#64748B]";

  return (
    <span className={`inline-flex min-w-[76px] justify-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${className}`}>
      {label}
    </span>
  );
}

