import { CaretDown, Eye } from "@phosphor-icons/react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import TableComponent from "@/app/utils/table/table";
import { getInitials, type StaffAttendanceRecord, type StaffAttendanceStatus } from "../data";
import { statusMeta } from "./AttendanceStats";

type StaffAttendanceTableProps = {
  records: StaffAttendanceRecord[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onStatusChange: (id: number, status: StaffAttendanceStatus) => void;
  onViewProfile: (record: StaffAttendanceRecord) => void;
};

const avatarColors = [
  "bg-[#CFFBE6] text-[#009B55]",
  "bg-[#FFF0D9] text-[#F59E0B]",
  "bg-[#FFE1E1] text-[#EF4444]",
  "bg-[#F1E2FF] text-[#8B5CF6]",
  "bg-[#FFF7C8] text-[#D97706]",
];

export default function StaffAttendanceTable({
  records,
  currentPage,
  itemsPerPage,
  onPageChange,
  onStatusChange,
  onViewProfile,
}: StaffAttendanceTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage);
  const columns = [
    { title: "S.No", key: "serial" },
    { title: "STAFF MEMBER", key: "staffMember" },
    { title: "ROLE", key: "role" },
    { title: "STATUS ⓘ", key: "status" },
    { title: "ACTION", key: "actions" },
  ];
  const tableData = paginatedRecords.map((record, index) => ({
    serial: (
      <span className="block min-w-[60px] text-center font-semibold text-[#8BA0BF]">
        {startIndex + index + 1}
      </span>
    ),
    staffMember: (
      <div className="mx-auto flex min-w-[260px] items-center gap-4 text-left">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[12px] font-bold ${avatarColors[index % avatarColors.length]}`}
        >
          {getInitials(record.name)}
        </span>
        <div>
          <p className="text-[15px] font-extrabold text-[#16284F]">
            {record.name}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-[#8A9AB5]">
            ID: {record.staffId}
          </p>
        </div>
      </div>
    ),
    role: (
      <span className="block min-w-[150px] text-[15px] font-bold text-[#34425E]">
        {record.role}
      </span>
    ),
    status: (
      <div className="flex justify-center">
        <StatusSelect
          value={record.status}
          onChange={(status) => onStatusChange(record.id, status)}
        />
      </div>
    ),
    actions: (
      <button
        type="button"
        onClick={() => onViewProfile(record)}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F3F6FA] text-[#71819A] transition-colors hover:bg-[#16284F] hover:text-white"
        title="View staff attendance"
      >
        <Eye size={17} weight="bold" />
      </button>
    ),
  }));

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#EDF1F7] bg-white">
      <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:py-3 [&_th]:text-[12px] [&_th]:font-extrabold [&_th]:text-[#7D8DA7] [&_td]:py-4">
        <TableComponent
          columns={columns}
          tableData={tableData}
          tableClassName="min-w-[760px]"
          height="none"
          stickyHeader={false}
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-[#EDF1F7] bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="rounded-lg bg-[#EEF6FF] px-5 py-3 text-[12px] font-semibold text-[#16284F] lg:max-w-[560px]">
          Note: Attendance is being marked manually by you for ground staff of{" "}
          <span className="font-extrabold text-[#4F46E5] underline">Sports Department</span>.
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={records.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: StaffAttendanceStatus;
  onChange: (status: StaffAttendanceStatus) => void;
}) {
  const meta = statusMeta[value];

  return (
    <div className="relative w-[190px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as StaffAttendanceStatus)}
        className={`h-10 w-full cursor-pointer appearance-none rounded-lg border-none pl-10 pr-10 text-[13px] font-extrabold outline-none ${meta.className}`}
      >
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="late">Late</option>
        <option value="not_marked">Not Marked</option>
      </select>
      <span className={`pointer-events-none absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${meta.dot}`} />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-current">
        <CaretDown size={14} weight="bold" />
      </span>
    </div>
  );
}
