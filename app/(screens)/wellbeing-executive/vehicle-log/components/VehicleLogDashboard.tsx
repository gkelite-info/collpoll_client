"use client";

import { DownloadSimple, SignIn } from "@phosphor-icons/react";
import { useState } from "react";
import { initialVehicleLogs } from "../data";
import type { VehicleLogEntry, VehicleLogStatus } from "../types";
import { LogVehicleEntryModal } from "../modals/LogVehicleEntryModal";
import { VehicleDetailsModal } from "../modals/VehicleDetailsModal";
import { VehicleLogFilters } from "./VehicleLogFilters";
import { VehicleLogTable } from "./VehicleLogTable";
import { VehicleStats } from "./VehicleStats";

export function VehicleLogDashboard() {
  const [entries, setEntries] = useState(initialVehicleLogs);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VehicleLogEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<VehicleLogEntry | null>(null);

  const addEntry = (entry: VehicleLogEntry) => {
    setEntries((current) => editingEntry
      ? current.map((item) => item.vehicleNumber === editingEntry.vehicleNumber ? entry : item)
      : [entry, ...current.filter((item) => item.vehicleNumber !== entry.vehicleNumber)]);
    setShowEntryModal(false);
    setEditingEntry(null);
  };

  const closeEntryModal = () => {
    setShowEntryModal(false);
    setEditingEntry(null);
  };

  const markExit = (vehicleNumber: string) => {
    const now = new Date();
    const exitTime = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(now);
    const datePart = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(now);
    const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(now);
    const exitDate = `${datePart} (${weekday})`;
    const update = (entry: VehicleLogEntry): VehicleLogEntry => entry.vehicleNumber === vehicleNumber
      ? { ...entry, status: "Exited", exitDate, exitTime, totalDuration: "Completed" }
      : entry;
    setEntries((current) => current.map(update));
    setSelectedEntry((current) => current ? update(current) : null);
  };

  const updateStatus = (vehicleNumber: string, status: VehicleLogStatus) => {
    if (status === "Exited") {
      markExit(vehicleNumber);
      return;
    }
    setEntries((current) => current.map((entry) => entry.vehicleNumber === vehicleNumber
      ? { ...entry, status, exitDate: null, exitTime: null, totalDuration: null }
      : entry));
  };

  const deleteEntry = (vehicleNumber: string) => {
    if (!window.confirm(`Delete vehicle log ${vehicleNumber}?`)) return;
    setEntries((current) => current.filter((entry) => entry.vehicleNumber !== vehicleNumber));
    setSelectedEntry((current) => current?.vehicleNumber === vehicleNumber ? null : current);
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
        <div className="flex flex-wrap gap-3"><button type="button" onClick={() => { setEditingEntry(null); setShowEntryModal(true); }} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#43C17A] px-5 text-sm font-bold text-white hover:bg-[#35A968]"><SignIn size={17} weight="bold" />Log Entry</button><button type="button" onClick={exportLogs} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#43C17A] px-5 text-sm font-bold text-white hover:bg-[#35A968]"><DownloadSimple size={16} weight="bold" />Export Logs</button></div>
      </div>
      <div className="mt-6"><VehicleStats /></div>
      <div className="mt-6"><VehicleLogFilters /></div>
      <div className="mt-6"><VehicleLogTable entries={entries} onStatusChange={updateStatus} onView={setSelectedEntry} onEdit={(entry) => { setEditingEntry(entry); setShowEntryModal(true); }} onDelete={deleteEntry} /></div>
      {showEntryModal && <LogVehicleEntryModal key={editingEntry?.vehicleNumber ?? "new-entry"} open initialEntry={editingEntry} onClose={closeEntryModal} onSubmit={addEntry} />}
      <VehicleDetailsModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} onMarkExit={markExit} />
    </section>
  );
}
