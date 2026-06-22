"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { initialVehicleLogs } from "../data";
import type { VehicleLogStatus } from "../types";
import { VehicleLogFilters } from "./VehicleLogFilters";
import { VehicleLogTable } from "./VehicleLogTable";
import { VehicleStats } from "./VehicleStats";

export function VehicleLogDashboard() {
  const [entries, setEntries] = useState(initialVehicleLogs);

  const updateStatus = (vehicleNumber: string, status: VehicleLogStatus) => {
    setEntries((current) => current.map((entry) => entry.vehicleNumber === vehicleNumber ? { ...entry, status } : entry));
  };

  const exportLogs = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(entries.map((entry) => ({ "Vehicle Number": entry.vehicleNumber, "Vehicle Type": entry.vehicleType, Watchman: entry.watchman, "Entry Time": entry.entryTime, Status: entry.status })));
    worksheet["!cols"] = [{ wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicle Logs");
    XLSX.writeFile(workbook, `vehicle-logs-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#16284F]">Vehicle Logs</h1><p className="mt-1 text-sm text-[#64748B]">Monitor and track all vehicle entries and exits recorded across the campus.</p></div>
        <button type="button" onClick={exportLogs} className="inline-flex h-10 cursor-pointer items-center gap-2 self-start rounded bg-[#43C17A] px-5 text-sm font-bold text-white hover:bg-[#35A968]"><DownloadSimple size={16} weight="bold" />Export Logs</button>
      </div>
      <div className="mt-6"><VehicleStats /></div>
      <div className="mt-6"><VehicleLogFilters /></div>
      <div className="mt-6"><VehicleLogTable entries={entries} onStatusChange={updateStatus} /></div>
    </section>
  );
}
