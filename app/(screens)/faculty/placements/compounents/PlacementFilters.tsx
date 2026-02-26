
export default function PlacementFilters() {
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5C5C5C] whitespace-nowrap">Placement Cycle :</span>
          <select className="w-25 h-8 text-[#282828] rounded-md px-3 text-md font-medium outline-none border border-[#D7D7D7]">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Eligibility :</span>
          <select className="w-35 h-8  text-[#282828] rounded-md px-3 text-md font-medium outline-none border border-[#D7D7D7]">
            <option>Eligible</option>
            <option>Not Eligible</option>
          </select>
        </div>


        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Sort By :</span>
          <select className="w-45 h-8 text-[#282828] rounded-md px-3 text-md font-medium outline-none border border-[#D7D7D7]">
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
