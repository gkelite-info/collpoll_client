import { MagnifyingGlass } from "@phosphor-icons/react";

export function VehicleLogFilters() {
  return (
    <div className="grid gap-3 rounded-lg border border-[#D7DFEC] bg-white p-4 md:grid-cols-[minmax(0,1fr)_160px_160px_170px]">
      <label><span className="mb-1 block text-xs font-bold uppercase text-[#475569]">Search Vehicle Number</span><span className="relative block"><MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" /><input placeholder="e.g. TS09AB1234" className="h-10 w-full rounded border border-[#D7DFEC] bg-white pl-10 pr-3 text-sm text-[#16284F] outline-none placeholder:text-[#94A3B8] focus:border-[#43C17A]" /></span></label>
      <label><span className="mb-1 block text-xs font-bold uppercase text-[#475569]">Vehicle Type</span><select className="h-10 w-full cursor-pointer rounded border border-[#D7DFEC] bg-white px-3 text-sm text-[#16284F]"><option>All Types</option><option>Car</option><option>Bike</option></select></label>
      <label><span className="mb-1 block text-xs font-bold uppercase text-[#475569]">Watchman</span><select className="h-10 w-full cursor-pointer rounded border border-[#D7DFEC] bg-white px-3 text-sm text-[#16284F]"><option>All Staff</option><option>Ravi Kumar</option><option>Mahesh</option></select></label>
      <label><span className="mb-1 block text-xs font-bold uppercase text-[#475569]">Date Range</span><input type="date" className="h-10 w-full cursor-pointer rounded border border-[#D7DFEC] bg-white px-3 text-sm text-[#16284F]" /></label>
    </div>
  );
}
