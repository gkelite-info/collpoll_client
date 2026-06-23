"use client";

import { PencilSimple } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import type { VehicleLogEntry, VehicleLogStatus } from "../types";
import { VehicleStatusDropdown } from "./VehicleStatusDropdown";

type VehicleLogTableProps = {
  entries: VehicleLogEntry[];
  onStatusChange: (vehicleNumber: string, status: VehicleLogStatus) => void;
};

export function VehicleLogTable({ entries, onStatusChange }: VehicleLogTableProps) {
  const columns = [
    { title: "VEHICLE NUMBER", key: "vehicleNumber" },
    { title: "VEHICLE TYPE", key: "vehicleType" },
    { title: "WATCHMAN", key: "watchman" },
    { title: "ENTRY TIME", key: "entryTime" },
    { title: "STATUS", key: "status" },
    { title: "ACTIONS", key: "actions" },
  ];
  const tableData = entries.map((entry) => ({
    vehicleNumber: <span className="font-bold text-[#16284F]">{entry.vehicleNumber}</span>,
    vehicleType: entry.vehicleType,
    watchman: entry.watchman,
    entryTime: <span className="font-bold">{entry.entryTime}</span>,
    status: <VehicleStatusDropdown status={entry.status} onChange={(status) => onStatusChange(entry.vehicleNumber, status)} />,
    actions: <button type="button" title="Edit vehicle log" className="cursor-pointer text-[#475569] hover:text-[#16284F]"><PencilSimple size={18} weight="bold" /></button>,
  }));

  return (
    <div className="overflow-hidden rounded-lg border border-[#D7DFEC] bg-white">
      <div className="border-b border-[#D7DFEC] px-5 py-4 text-sm font-semibold text-[#16284F]">Recent Activity Logs</div>
      <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:bg-[#F3F6FA] [&_th]:py-4 [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:text-[#475569] [&_td]:py-4 [&_td]:text-sm [&_td]:text-[#16284F]">
        <TableComponent columns={columns} tableData={tableData} tableClassName="min-w-[850px]" height="none" stickyHeader={false} />
      </div>
      <div className="flex items-center justify-between border-t border-[#D7DFEC] px-5 py-4 text-xs text-[#64748B]"><span>Rows per page: <strong className="ml-3 text-[#16284F]">10</strong></span><span>Page 1 of 16</span></div>
    </div>
  );
}
