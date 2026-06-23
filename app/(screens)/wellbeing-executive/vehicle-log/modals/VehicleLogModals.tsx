"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import {
  Bus,
  Camera,
  Car,
  CheckCircle,
  DotsThree,
  Motorcycle,
  SignIn,
  SignOut,
  X,
} from "@phosphor-icons/react";
import type { VehicleLogEntry } from "../types";

const vehicleTypes: Array<{ label: VehicleLogEntry["vehicleType"]; icon: typeof Car }> = [
  { label: "Car", icon: Car },
  { label: "Bike", icon: Motorcycle },
  { label: "Bus", icon: Bus },
  { label: "Other", icon: DotsThree },
];

const formatDate = (date: Date) => {
  const datePart = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date);
  return `${datePart} (${weekday})`;
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date);

type EntryModalProps = {
  open: boolean;
  initialEntry?: VehicleLogEntry | null;
  onClose: () => void;
  onSubmit: (entry: VehicleLogEntry) => void;
};

export function LogVehicleEntryModal({ open, initialEntry, onClose, onSubmit }: EntryModalProps) {
  const isEditing = Boolean(initialEntry);
  const [vehicleNumber, setVehicleNumber] = useState(initialEntry?.vehicleNumber ?? "");
  const [vehicleType, setVehicleType] = useState<VehicleLogEntry["vehicleType"]>(initialEntry?.vehicleType ?? "Car");
  const [ownerName, setOwnerName] = useState(initialEntry?.ownerName ?? "");
  const [purpose, setPurpose] = useState(initialEntry?.purpose ?? "");
  const [photo, setPhoto] = useState<string | null>(initialEntry?.photo ?? null);

  const reset = () => {
    setVehicleNumber("");
    setVehicleType("Car");
    setOwnerName("");
    setPurpose("");
    setPhoto(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  if (!open) return null;
  const now = new Date();

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...initialEntry,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType,
      ownerName: ownerName.trim(),
      purpose,
      watchman: initialEntry?.watchman ?? "Current Watchman",
      entryDate: initialEntry?.entryDate ?? formatDate(now),
      entryTime: initialEntry?.entryTime ?? formatTime(now),
      exitDate: initialEntry?.exitDate ?? null,
      exitTime: initialEntry?.exitTime ?? null,
      totalDuration: initialEntry?.totalDuration ?? null,
      photo,
      status: initialEntry?.status ?? "Inside Campus",
    });
    reset();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" onMouseDown={close}>
      <form onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} className="max-h-[94vh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#E8F8EF] text-[#22C55E]"><SignIn size={21} weight="bold" /></span><div><h2 className="font-extrabold text-[#16284F]">{isEditing ? "Edit Vehicle Entry" : "Log Vehicle Entry"}</h2><p className="text-xs text-[#64748B]">{isEditing ? "Update the recorded vehicle information." : "Record a new vehicle entry into the campus."}</p></div></div>
          <button type="button" onClick={close} className="cursor-pointer text-[#94A3B8] hover:text-[#16284F]" aria-label="Close"><X size={20} /></button>
        </div>

        <label className="mt-6 block text-xs font-bold text-[#475569]">Vehicle Number <span className="text-red-500">*</span><input required value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} placeholder="Enter vehicle number" className="mt-2 h-11 w-full rounded-lg border border-[#D7DFEC] bg-white px-3 text-sm uppercase text-[#16284F] outline-none placeholder:text-[#94A3B8] focus:border-[#43C17A]" /></label>
        <fieldset className="mt-4"><legend className="text-xs font-bold text-[#475569]">Vehicle Type <span className="text-red-500">*</span></legend><div className="mt-2 grid grid-cols-4 gap-2">{vehicleTypes.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setVehicleType(label)} className={`flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-xs ${vehicleType === label ? "border-[#43C17A] bg-[#E8F8EF] text-[#169653]" : "border-[#D7DFEC] text-[#475569] hover:border-[#43C17A]"}`}><Icon size={21} weight="bold" />{label}</button>)}</div></fieldset>
        <label className="mt-4 block text-xs font-bold text-[#475569]">Driver / Owner Name<input required value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="Enter driver or owner name" className="mt-2 h-11 w-full rounded-lg border border-[#D7DFEC] bg-white px-3 text-sm text-[#16284F] outline-none placeholder:text-[#94A3B8] focus:border-[#43C17A]" /></label>
        <label className="mt-4 block text-xs font-bold text-[#475569]">Purpose of Visit <span className="text-red-500">*</span><select required value={purpose} onChange={(event) => setPurpose(event.target.value)} className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-[#D7DFEC] bg-white px-3 text-sm text-[#16284F] outline-none focus:border-[#43C17A]"><option value="">Select purpose</option><option>Staff</option><option>Visitor</option><option>Official Visit</option><option>Delivery</option><option>Other</option></select></label>
        <div className="mt-4"><span className="text-xs font-bold text-[#475569]">Entry Time</span><div className="mt-2 flex h-11 items-center justify-between rounded-lg border border-[#D7DFEC] px-3 text-sm text-[#475569]"><span>{initialEntry ? `${initialEntry.entryDate} | ${initialEntry.entryTime}` : `${formatDate(now)} | ${formatTime(now)}`}</span><span className="rounded-full bg-[#E8F8EF] px-2 py-1 text-[10px] font-bold text-[#22C55E]">AUTO-FILLED</span></div></div>
        <div className="mt-4"><span className="text-xs font-bold text-[#475569]">Upload Vehicle Photo</span><label className="mt-2 grid min-h-32 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-[#C8D3E1] bg-[#F8FAFC] text-center hover:border-[#43C17A]">{photo ? <span className="relative block h-40 w-full"><Image src={photo} alt="Vehicle preview" fill unoptimized className="object-cover" /></span> : <span><Camera size={25} weight="bold" className="mx-auto text-[#22C55E]" /><strong className="mt-2 block text-xs text-[#34425E]">Capture Photo</strong><small className="text-[10px] text-[#94A3B8]">Take a clear photo of the vehicle</small></span>}<input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" /></label></div>
        <div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={close} className="h-11 cursor-pointer rounded-lg border border-[#D7DFEC] text-sm font-bold text-[#34425E] hover:bg-[#F8FAFC]">Cancel</button><button type="submit" className="h-11 cursor-pointer rounded-lg bg-[#22B967] text-sm font-bold text-white hover:bg-[#169653]">{isEditing ? "Save Changes" : "Log Entry"}</button></div>
      </form>
    </div>
  );
}

type DetailsModalProps = {
  entry: VehicleLogEntry | null;
  onClose: () => void;
  onMarkExit: (vehicleNumber: string) => void;
};

export function VehicleDetailsModal({ entry, onClose, onMarkExit }: DetailsModalProps) {
  if (!entry) return null;
  const hasExited = entry.status === "Exited";
  const rows = [
    ["Vehicle Number", entry.vehicleNumber], ["Vehicle Type", entry.vehicleType], ["Owner Name", entry.ownerName], ["Purpose of Visit", entry.purpose],
  ];
  const timingRows = hasExited
    ? [["Entry Date", entry.entryDate], ["Entry Time", entry.entryTime], ["Exit Date", entry.exitDate], ["Exit Time", entry.exitTime], ["Total Duration", entry.totalDuration], ["Logged By", entry.watchman]]
    : [["Entry Date", entry.entryDate], ["Entry Time", entry.entryTime], ["Logged By", entry.watchman]];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" onMouseDown={onClose}>
      <div onMouseDown={(event) => event.stopPropagation()} className="max-h-[94vh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#E8F8EF] text-[#22C55E]">{hasExited ? <SignOut size={19} weight="bold" /> : <SignIn size={19} weight="bold" />}</span><h2 className="text-sm font-extrabold text-[#16284F]">Vehicle Details</h2></div><button type="button" onClick={onClose} className="cursor-pointer text-[#94A3B8] hover:text-[#16284F]" aria-label="Close"><X size={20} /></button></div>
        <div className="mt-5 flex items-center justify-between"><div><h3 className="text-2xl font-extrabold text-[#16284F]">{entry.vehicleNumber}</h3><p className="mt-1 text-xs text-[#64748B]">{entry.vehicleType}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${hasExited ? "bg-red-50 text-red-500" : "bg-[#E8F8EF] text-[#169653]"}`}>● {entry.status}</span></div>
        <DetailSection title="Vehicle Information" rows={rows} />
        <DetailSection title={hasExited ? "Entry & Exit Details" : "Entry Details"} rows={timingRows} />
        <div className={`mt-5 flex gap-3 rounded-lg p-4 ${hasExited ? "bg-[#E8F8EF]" : "bg-[#EFFAF3]"}`}><CheckCircle size={20} weight="fill" className="shrink-0 text-[#22C55E]" /><div><p className="text-xs font-bold text-[#169653]">{hasExited ? "Vehicle Exited Successfully" : "Currently Inside Campus"}</p><p className="mt-1 text-[10px] text-[#64748B]">{hasExited ? `Exited at ${entry.exitTime}. Total time inside campus: ${entry.totalDuration}.` : "Vehicle is currently recorded inside the campus."}</p></div></div>
        <div className="mt-5"><p className="mb-2 text-xs font-bold text-[#475569]">Vehicle Photo</p>{entry.photo ? <div className="relative h-44 w-full overflow-hidden rounded-lg"><Image src={entry.photo} alt={`${entry.vehicleNumber} vehicle`} fill unoptimized className="object-cover" /></div> : <div className="grid h-32 place-items-center rounded-lg bg-[#F1F5F9] text-center text-[#94A3B8]"><span><Car size={34} className="mx-auto" /><small className="mt-2 block">No vehicle photo available</small></span></div>}</div>
        <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="h-10 cursor-pointer rounded-lg border border-[#D7DFEC] px-6 text-sm font-bold text-[#34425E] hover:bg-[#F8FAFC]">Close</button>{!hasExited && <button type="button" onClick={() => onMarkExit(entry.vehicleNumber)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-6 text-sm font-bold text-white hover:bg-red-600"><SignOut size={16} weight="bold" />Mark Exit</button>}</div>
      </div>
    </div>
  );
}

function DetailSection({ title, rows }: { title: string; rows: Array<Array<string | null>> }) {
  return <section className="mt-5"><h4 className="mb-2 text-xs font-extrabold text-[#34425E]">{title}</h4><div className="space-y-2 rounded-lg border border-[#EEF2F7] p-3">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-6 text-xs"><span className="text-[#94A3B8]">{label}</span><strong className="text-right font-semibold text-[#34425E]">{value || "—"}</strong></div>)}</div></section>;
}
