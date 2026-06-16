"use client";

import { ArrowLeft, CaretDown, Eye, IdentificationCard } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import type { StaffAttendanceRecord, StaffAttendanceStatus } from "../../data";
import Image from "next/image";
import { statusMeta } from "../AttendanceStats";

type GroundStaffMembersScreenProps = {
  records: StaffAttendanceRecord[];
  activeFilter: "all" | StaffAttendanceStatus;
  onBack: () => void;
  onViewProfile: (record: StaffAttendanceRecord) => void;
};

export default function GroundStaffMembersScreen({
  records,
  activeFilter,
  onBack,
  onViewProfile,
}: GroundStaffMembersScreenProps) {
  const activeLabel =
    activeFilter === "all" ? "All Staff" : `${statusMeta[activeFilter].label} Staff`;

  const columns = [
    { title: "DESIGNATION", key: "designation" },
    { title: "STAFF MEMBER", key: "staffMember" },
    { title: "CONTACT", key: "contact" },
    { title: "JOINING DATE", key: "joiningDate" },
    { title: "STATUS", key: "status" },
    { title: "ACTION", key: "actions" },
  ];
  const tableData = records.map((record, index) => ({
    designation: (
      <span className="text-[12px] font-bold text-[#34425E]">
        {record.designation}
      </span>
    ),
    staffMember: (
      <div className="mx-auto flex min-w-[210px] items-center gap-3 text-left">
        <Image
          src={`https://i.pravatar.cc/80?img=${index + 12}`}
          alt={record.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="text-[13px] font-extrabold text-[#16284F]">{record.name}</p>
          <p className="text-[10px] font-semibold text-[#8A9AB5]">ID: {record.staffId}</p>
        </div>
      </div>
    ),
    contact: (
      <span className="text-[12px] font-semibold text-[#34425E]">{record.phone}</span>
    ),
    joiningDate: (
      <span className="text-[12px] font-semibold text-[#34425E]">{record.joiningDate}</span>
    ),
    status: (
      <span
        className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${statusMeta[record.status].className}`}
      >
        {statusMeta[record.status].label}
      </span>
    ),
    actions: (
      <button
        type="button"
        onClick={() => onViewProfile(record)}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F3F6FA] text-[#71819A] transition-colors hover:bg-[#16284F] hover:text-white"
        title="View staff profile"
      >
        <Eye size={17} weight="bold" />
      </button>
    ),
  }));

  return (
    <main className="min-h-screen w-full overflow-y-auto p-2 pb-6">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col rounded-2xl bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-[#F3F6FA] text-[#08244A] transition-colors hover:bg-[#08244A] hover:text-white"
                title="Back to attendance"
              >
                <ArrowLeft size={18} weight="bold" />
              </button>
              <h1 className="text-[22px] font-extrabold text-[#08244A]">
                Ground Staff Members
              </h1>
            </div>
            <p className="mt-1 text-[12px] font-medium text-[#8A9AB5]">
              View and manage all staff assigned to the Sports Department.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#16284F] px-4 text-[12px] font-bold text-white"
          >
            Designation
            <CaretDown size={14} weight="bold" />
          </button>
        </div>

        <div className="mt-6 flex w-fit border-b-2 border-[#43C17A] pb-1 text-[12px] font-bold text-[#43C17A]">
          {activeLabel}
          <span className="ml-2 rounded bg-[#E8FAF2] px-2 text-[10px]">{records.length}</span>
        </div>

        <div className="mt-5 rounded-xl border border-[#EDF1F7] bg-white">
          <div className="flex items-center gap-3 border-b border-[#EDF1F7] px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#E8FAF2] text-[#10A66A]">
              <IdentificationCard size={20} weight="fill" />
            </span>
            <div>
              <h2 className="text-[14px] font-extrabold text-[#16284F]">Staff Directory</h2>
              <p className="text-[11px] font-medium text-[#8A9AB5]">
                Total staff and current status
              </p>
            </div>
          </div>
          <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:py-3 [&_th]:text-[12px] [&_th]:font-extrabold [&_th]:text-[#7D8DA7] [&_td]:py-4">
            <TableComponent
              columns={columns}
              tableData={tableData}
              tableClassName="min-w-[980px]"
              height="none"
              stickyHeader={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
