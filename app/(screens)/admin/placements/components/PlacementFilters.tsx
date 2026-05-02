
export const placementStatusOptions = ["All", "Open", "Completed"] as const;
export const placementSortOptions = [
  "Recently Uploaded",
  "Oldest First",
  "Company Name A-Z",
  "Company Name Z-A",
  "CTC (High to Low)",
  "CTC (Low to High)",
] as const;

type PlacementFiltersProps = {
  cycle: string;
  cycles: string[];
  branch: string;
  branches: string[];
  status: (typeof placementStatusOptions)[number];
  sortBy: (typeof placementSortOptions)[number];
  isCycleLoading?: boolean;
  isBranchLoading?: boolean;
  isStatusLoading?: boolean;
  isSortLoading?: boolean;
  onCycleChange: (value: string) => void;
  onCycleOpen?: () => void;
  onBranchChange: (value: string) => void;
  onBranchOpen?: () => void;
  onStatusChange: (value: (typeof placementStatusOptions)[number]) => void;
  onStatusOpen?: () => void;
  onSortChange: (value: (typeof placementSortOptions)[number]) => void;
  onSortOpen?: () => void;
};

export default function PlacementFilters({
  cycle,
  cycles,
  branch,
  branches,
  status,
  sortBy,
  isCycleLoading = false,
  isBranchLoading = false,
  isStatusLoading = false,
  isSortLoading = false,
  onCycleChange,
  onCycleOpen,
  onBranchChange,
  onBranchOpen,
  onStatusChange,
  onStatusOpen,
  onSortChange,
  onSortOpen,
}: PlacementFiltersProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-6 space-y-4">
      <div className="flex w-full flex-nowrap items-center gap-6 overflow-x-auto pb-3 pr-3 [scrollbar-color:#43C17A_#E5E7EB] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#43C17A] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#E5E7EB] [&::-webkit-scrollbar]:h-2">
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-[#5C5C5C] whitespace-nowrap">Placement Cycle :</span>
          <div className="relative">
            <select
              className="h-8 w-32 cursor-pointer text-[#282828] rounded-md px-3 text-md font-medium outline-none border border-[#D7D7D7]"
              value={cycle}
              onPointerDown={onCycleOpen}
              onChange={(event) => onCycleChange(event.target.value)}
            >
              {cycles.map((item) => (
                <option key={item} value={item} disabled={Number(item) > currentYear}>
                  {item}
                </option>
              ))}
            </select>
            {isCycleLoading && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Branch :</span>
          <div className="relative">
            <select
              className="h-8 w-36 cursor-pointer text-[#282828] rounded-md px-3 text-md font-medium outline-none border border-[#D7D7D7]"
              value={branch}
              onPointerDown={onBranchOpen}
              onChange={(event) => onBranchChange(event.target.value)}
            >
              <option value="All">All</option>
              {branches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {isBranchLoading && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Status :</span>
          <div className="relative">
            <select
              className="h-8 w-40 cursor-pointer text-[#282828] rounded-md px-3 text-md font-medium outline-none border border-[#D7D7D7]"
              value={status}
              onPointerDown={onStatusOpen}
              onChange={(event) =>
                onStatusChange(event.target.value as (typeof placementStatusOptions)[number])
              }
            >
              {placementStatusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {isStatusLoading && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
            )}
          </div>
        </div>


        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-[#5C5C5C]">Sort By :</span>
          <div className="relative">
            <select
              className="h-8 w-56 cursor-pointer text-[#282828] rounded-md px-3 text-md font-medium outline-none border border-[#D7D7D7]"
              value={sortBy}
              onPointerDown={onSortOpen}
              onChange={(event) =>
                onSortChange(event.target.value as (typeof placementSortOptions)[number])
              }
            >
              {placementSortOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {isSortLoading && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
            )}
          </div>
        </div>
      </div>

      <p className="text-sm font-medium text-[#43C17A]">
        Opportunities
      </p>
    </div>
  );
}
