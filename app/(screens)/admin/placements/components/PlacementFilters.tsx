"use client";

export default function PlacementFilters() {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Placement Cycle :</span>
          <select className="w-56.75 h-9.5 border border-[#D0D5DD] text-[#282828] rounded-lg px-3 text-sm outline-none bg-white">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Eligibility :</span>
          <select className="w-47.75 h-9.5 border border-[#D0D5DD] text-[#282828] rounded-lg px-3 text-sm outline-none bg-white">
            <option>Eligible</option>
            <option>Not Eligible</option>
          </select>
        </div>

       
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Sort By :</span>
          <select className="w-67.75 h-9.5 border border-[#D0D5DD]  text-[#282828] rounded-lg px-3 text-sm outline-none bg-white">
            <option>Recently Uploaded</option>
            <option>Company Name</option>
            <option>CTC (High to Low)</option>
            <option>CTC (Low to High)</option>
          </select>
        </div>
      </div>
      
      <p className="text-sm font-medium text-[#43C17A]">
        Opportunities
      </p>
    </div>
  );
}
