import { CaretDown } from "@phosphor-icons/react";
import { CustomDropdown } from "@/app/components/CustomDropdown";

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
  educationTypeId: number | null;
  educations: { id: number; label: string }[];
  branchId: number | null;
  branches: { id: number; label: string }[];
  academicYearId: number | null;
  academicYears: { id: number; label: string }[];
  status: (typeof placementStatusOptions)[number];
  sortBy: (typeof placementSortOptions)[number];
  isSchool?: boolean;
  isEducationLoading?: boolean;
  isBranchLoading?: boolean;
  isAcademicYearLoading?: boolean;
  isStatusLoading?: boolean;
  isSortLoading?: boolean;
  onEducationChange: (value: number | null) => void;
  onEducationOpen?: () => void;
  onBranchChange: (value: number | null) => void;
  onBranchOpen?: () => void;
  onAcademicYearChange: (value: number | null) => void;
  onAcademicYearOpen?: () => void;
  onStatusChange: (value: (typeof placementStatusOptions)[number]) => void;
  onStatusOpen?: () => void;
  onSortChange: (value: (typeof placementSortOptions)[number]) => void;
  onSortOpen?: () => void;
};

export default function PlacementFilters({
  educationTypeId,
  educations,
  branchId,
  branches,
  academicYearId,
  academicYears,
  status,
  sortBy,
  isSchool = false,
  isEducationLoading = false,
  isBranchLoading = false,
  isAcademicYearLoading = false,
  isStatusLoading = false,
  isSortLoading = false,
  onEducationChange,
  onEducationOpen,
  onBranchChange,
  onBranchOpen,
  onAcademicYearChange,
  onAcademicYearOpen,
  onStatusChange,
  onStatusOpen,
  onSortChange,
  onSortOpen,
}: PlacementFiltersProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex w-full flex-nowrap items-center gap-6 overflow-x-auto pb-3 pr-3 [scrollbar-color:#43C17A_#E5E7EB] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#43C17A] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#E5E7EB] [&::-webkit-scrollbar]:h-1.5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-[#5C5C5C] whitespace-nowrap">Education Type :</span>
          <div className="relative min-w-[140px]">
            <CustomDropdown
              theme="always-green"
              value={educationTypeId ?? ""}
              options={[
                { value: "", label: "All" },
                ...educations.map((item) => ({ value: item.id, label: item.label })),
              ]}
              onChange={(val) => onEducationChange(val ? Number(val) : null)}
              onOpenChange={(isOpen) => {
                if (isOpen && onEducationOpen) onEducationOpen();
              }}
            />
            {isEducationLoading && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
            )}
          </div>
        </div>

        {!isSchool && (
          <div className="flex shrink-0 items-center gap-2">
            <span className={`text-sm whitespace-nowrap transition-colors ${!educationTypeId ? "text-[#A3A3A3]" : "text-[#5C5C5C]"}`}>Branch :</span>
            <div className="relative min-w-[140px]">
              <CustomDropdown
                theme="always-green"
                value={branchId ?? ""}
                options={[
                  { value: "", label: "All" },
                  ...branches.map((item) => ({ value: item.id, label: item.label })),
                ]}
                onChange={(val) => onBranchChange(val ? Number(val) : null)}
                onOpenChange={(isOpen) => {
                  if (isOpen && onBranchOpen) onBranchOpen();
                }}
                disabled={!educationTypeId}
              />
              {isBranchLoading && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
              )}
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <span className={`text-sm whitespace-nowrap transition-colors ${(!isSchool && !branchId) || (isSchool && !educationTypeId) ? "text-[#A3A3A3]" : "text-[#5C5C5C]"}`}>Academic Year :</span>
          <div className="relative min-w-[140px]">
            <CustomDropdown
              theme="always-green"
              value={academicYearId ?? ""}
              options={[
                { value: "", label: "All" },
                ...academicYears.map((item) => ({ value: item.id, label: item.label })),
              ]}
              onChange={(val) => onAcademicYearChange(val ? Number(val) : null)}
              onOpenChange={(isOpen) => {
                if (isOpen && onAcademicYearOpen) onAcademicYearOpen();
              }}
              disabled={isSchool ? !educationTypeId : !branchId}
            />
            {isAcademicYearLoading && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-[#5C5C5C] whitespace-nowrap">Status :</span>
          <div className="relative min-w-[120px]">
            <CustomDropdown
              theme="always-green"
              value={status}
              options={placementStatusOptions.map((item) => ({ value: item, label: item }))}
              onChange={(val) => onStatusChange(val as (typeof placementStatusOptions)[number])}
              onOpenChange={(isOpen) => {
                if (isOpen && onStatusOpen) onStatusOpen();
              }}
            />
            {isStatusLoading && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-[#5C5C5C] whitespace-nowrap">Sort By :</span>
          <div className="relative min-w-[160px]">
            <CustomDropdown
              theme="always-green"
              value={sortBy}
              options={placementSortOptions.map((item) => ({ value: item, label: item }))}
              onChange={(val) => onSortChange(val as (typeof placementSortOptions)[number])}
              onOpenChange={(isOpen) => {
                if (isOpen && onSortOpen) onSortOpen();
              }}
            />
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
