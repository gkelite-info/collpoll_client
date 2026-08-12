"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/app/utils/Avatar";
import { useUser } from "@/app/utils/context/UserContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  EmployeeLeaveTagFetchRole,
  EmployeeLeaveTaggedRole,
  EmployeeLeaveTagOption,
  EmployeeLeaveTagSelection,
  fetchEmployeeLeaveTagOptions,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestTagsAPI";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

const requesterTagRole: Record<string, EmployeeLeaveTagFetchRole> = {
  Admin: "AllStaff",
  Faculty: "AllStaff",
  Finance: "AllStaff",
  FinanceManager: "AllStaff",
  Accountant: "AllStaff",
  CollegeHr: "CollegeHr",
  WellbeingExecutive: "AllStaff",
  WellbeingManager: "AllStaff",
  PlacementOfficer: "AllStaff",
};

const hrAndCollegeAdminOnlyRoles = new Set(["CollegeHr"]);

export const getRequiredEmployeeLeaveTagRoles = (
  role?: string | null,
): EmployeeLeaveTagFetchRole[] => {
  const requesterRole = role ? requesterTagRole[role] : undefined;

  if (requesterRole === "AllStaff") {
    return ["AllStaff", "CollegeHr", "CollegeAdmin"];
  }

  if (role && hrAndCollegeAdminOnlyRoles.has(role)) {
    return ["CollegeHr", "CollegeAdmin"];
  }

  return requesterRole ? [requesterRole, "CollegeHr", "CollegeAdmin"] : [];
};

const allStaffTaggedRoles = new Set<EmployeeLeaveTaggedRole>([
  "Admin",
  "Faculty",
  "Finance",
  "FinanceManager",
  "Accountant",
  "CollegeHr",
  "CollegeAdmin",
  "PlacementOfficer",
  "WellbeingExecutive",
  "WellbeingManager",
]);

export const hasRequiredEmployeeLeaveTags = (
  role: string | null | undefined,
  tags: EmployeeLeaveTagSelection[],
) =>
  getRequiredEmployeeLeaveTagRoles(role).every((taggedRole) =>
    taggedRole === "AllStaff"
      ? tags.some(
          (tag) =>
            allStaffTaggedRoles.has(tag.taggedRole) && tag.taggedUserId,
        )
      : tags.some((tag) => tag.taggedRole === taggedRole && tag.taggedUserId),
  );

const getTagRoleLabels = (isSchool: boolean): Record<EmployeeLeaveTagFetchRole, string> => ({
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  FinanceManager: "Finance Manager",
  Accountant: "Accountant",
  CollegeHr: "HR",
  CollegeAdmin: isSchool ? "School Admin" : "College Admin",
  PlacementOfficer: "Placement Officer",
  WellbeingExecutive: "Wellbeing Executive",
  WellbeingManager: "Wellbeing Manager",
  AllStaff: "Select Staff",
});

const getStaffRoleOrder = (isSchool: boolean): EmployeeLeaveTaggedRole[] => {
  const order: EmployeeLeaveTaggedRole[] = [
    "Faculty",
    "Admin",
    "FinanceManager",
    "Finance",
    "Accountant",
  ];
  if (!isSchool) {
    order.push("PlacementOfficer");
  }
  order.push("WellbeingManager", "WellbeingExecutive");
  return order;
};

export default function EmployeeLeaveRoutingFields({
  value,
  onChange,
  requesterRole,
  collegeIdOverride,
}: {
  value: EmployeeLeaveTagSelection[];
  onChange: (value: EmployeeLeaveTagSelection[]) => void;
  requesterRole?: string | null;
  collegeIdOverride?: number | null;
}) {
  const { collegeId, collegeEducationType, role, userId } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);
  const effectiveCollegeId = collegeIdOverride ?? collegeId;
  const effectiveRole = requesterRole ?? role;
  const tagRoles = getRequiredEmployeeLeaveTagRoles(effectiveRole);

  const containerRef = useRef<HTMLDivElement>(null);
  const [openDropdownRole, setOpenDropdownRole] = useState<EmployeeLeaveTagFetchRole | null>(null);

  if (!effectiveCollegeId || !tagRoles.length) return null;

  const handleTagChange = (
    fieldRole: EmployeeLeaveTagFetchRole,
    option: EmployeeLeaveTagOption | null,
  ) => {
    const remainingTags =
      fieldRole === "AllStaff"
        ? value.filter((tag) => !allStaffTaggedRoles.has(tag.taggedRole))
        : value.filter((tag) => tag.taggedRole !== fieldRole);

    onChange(option ? [...remainingTags, option] : remainingTags);
  };

  return (
    <div
      ref={containerRef}
      className={`relative grid grid-cols-1 gap-3 sm:grid-cols-3`}
    >
      {tagRoles.map((taggedRole) => (
        <EmployeeLeaveTagSelect
          key={taggedRole}
          collegeId={effectiveCollegeId}
          isSchool={isSchool}
          excludeUserId={
            taggedRole === "AllStaff" ||
            (effectiveRole === "CollegeHr" && taggedRole === "CollegeHr")
              ? null
              : userId
          }
          collegeEducationType={
            taggedRole === "Faculty" ||
            taggedRole === "Admin" ||
            taggedRole === "FinanceManager"
              ? collegeEducationType
              : null
          }
          taggedRole={taggedRole}
          value={
            taggedRole === "AllStaff"
              ? value.find((tag) => allStaffTaggedRoles.has(tag.taggedRole)) ??
                null
              : value.find((tag) => tag.taggedRole === taggedRole) ?? null
          }
          onChange={(option) => handleTagChange(taggedRole, option)}
          isOpen={openDropdownRole === taggedRole}
          onToggle={() => setOpenDropdownRole(openDropdownRole === taggedRole ? null : taggedRole)}
          onClose={() => setOpenDropdownRole(null)}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function EmployeeLeaveTagSelect({
  collegeId,
  isSchool,
  excludeUserId,
  collegeEducationType,
  taggedRole,
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
  containerRef,
}: {
  collegeId: number;
  isSchool: boolean;
  excludeUserId: number | null;
  collegeEducationType: string | null;
  taggedRole: EmployeeLeaveTagFetchRole;
  value: EmployeeLeaveTagSelection | null;
  onChange: (value: EmployeeLeaveTagOption | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const tagRoleLabels = useMemo(() => getTagRoleLabels(isSchool), [isSchool]);
  const staffRoleOrder = useMemo(() => getStaffRoleOrder(isSchool), [isSchool]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
        setSearchQuery("");
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, containerRef, onClose]);

  return (
    <>
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#282828]">
        <span>
          Tag <span className="text-[#FF2020]">*</span>
        </span>
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-11 w-full cursor-pointer items-center justify-between rounded border border-[#CFCFCF] bg-white px-4 text-left text-sm outline-none focus:border-[#43C17A] ${
            value ? "text-[#525252]" : "text-[#9CA3AF]"
          }`}
        >
          <span className="min-w-0 truncate">
            {value ? (value as any).label ?? "Selected" : tagRoleLabels[taggedRole]}
          </span>
          <CaretDown
            size={16}
            className={`shrink-0 text-[#9CA3AF] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </label>

      {isOpen && (
        <div className="absolute top-[72px] left-0 right-0 z-[100] mt-1 overflow-hidden rounded border border-[#CFCFCF] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              onClose();
              setSearchQuery("");
            }}
            className="flex h-10 w-full cursor-pointer items-center bg-[#1F6FD6] px-4 text-left text-sm font-semibold text-white"
          >
            {tagRoleLabels[taggedRole]}
          </button>
          <div className="border-b border-[#E5E7EB] bg-white p-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name..."
              className="h-9 w-full rounded border border-[#D1D5DB] px-3 text-sm font-medium text-[#282828] outline-none focus:border-[#43C17A]"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {taggedRole === "AllStaff" ? (
              staffRoleOrder.map((role) => (
                <RoleSectionGroup
                  key={role}
                  role={role}
                  collegeId={collegeId}
                  excludeUserId={excludeUserId}
                  collegeEducationType={collegeEducationType}
                  searchQuery={debouncedSearch}
                  tagRoleLabels={tagRoleLabels}
                  onSelect={(option) => {
                    onChange({ ...option, label: option.label });
                    onClose();
                    setSearchQuery("");
                  }}
                />
              ))
            ) : (
              <SingleRoleGroup
                role={taggedRole}
                collegeId={collegeId}
                excludeUserId={excludeUserId}
                collegeEducationType={collegeEducationType}
                searchQuery={debouncedSearch}
                tagRoleLabels={tagRoleLabels}
                onSelect={(option) => {
                  onChange({ ...option, label: option.label });
                  onClose();
                  setSearchQuery("");
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SingleRoleGroup({
  role,
  collegeId,
  excludeUserId,
  collegeEducationType,
  searchQuery,
  tagRoleLabels,
  onSelect,
}: {
  role: EmployeeLeaveTagFetchRole;
  collegeId: number;
  excludeUserId: number | null;
  collegeEducationType: string | null;
  searchQuery: string;
  tagRoleLabels: Record<string, string>;
  onSelect: (option: EmployeeLeaveTagOption) => void;
}) {
  const limit = 10;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["leaveTags", role, collegeId, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      fetchEmployeeLeaveTagOptions({
        collegeId,
        taggedRole: role,
        collegeEducationType,
        excludeUserId,
        page: pageParam,
        limit,
        searchQuery,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length >= limit ? allPages.length + 1 : undefined),
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => data?.pages.flat() ?? [], [data]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="custom-scrollbar">
        <UserOptionShimmer />
        <UserOptionShimmer />
        <UserOptionShimmer />
        <UserOptionShimmer />
        <UserOptionShimmer />
      </div>
    );
  }

  if (options.length === 0) {
    return <div className="px-4 py-3 text-sm font-medium text-[#9CA3AF]">No users found</div>;
  }

  return (
    <div className="custom-scrollbar" onScroll={handleScroll}>
      {options.map((option) => (
        <UserOptionButton
          key={`${option.taggedRole}-${option.taggedUserId}`}
          option={option}
          tagRoleLabels={tagRoleLabels}
          onSelect={onSelect}
        />
      ))}
      {isFetchingNextPage && <UserOptionShimmer />}
    </div>
  );
}

function RoleSectionGroup({
  role,
  collegeId,
  excludeUserId,
  collegeEducationType,
  searchQuery,
  tagRoleLabels,
  onSelect,
}: {
  role: EmployeeLeaveTaggedRole;
  collegeId: number;
  excludeUserId: number | null;
  collegeEducationType: string | null;
  searchQuery: string;
  tagRoleLabels: Record<string, string>;
  onSelect: (option: EmployeeLeaveTagOption) => void;
}) {
  const limit = 10;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["leaveTags", role, collegeId, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      fetchEmployeeLeaveTagOptions({
        collegeId,
        taggedRole: role,
        collegeEducationType,
        excludeUserId,
        page: pageParam,
        limit,
        searchQuery,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length >= limit ? allPages.length + 1 : undefined),
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => data?.pages.flat() ?? [], [data]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="border-b border-[#E5E7EB] last:border-b-0">
        <div className="sticky top-0 z-10 bg-[#F3F4F6] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#525252]">
          {tagRoleLabels[role]}
        </div>
        <div className="custom-scrollbar max-h-48 overflow-hidden">
          <UserOptionShimmer />
          <UserOptionShimmer />
          <UserOptionShimmer />
        </div>
      </div>
    );
  }
  
  if (options.length === 0) return null;

  return (
    <div className="border-b border-[#E5E7EB] last:border-b-0">
      <div className="sticky top-0 z-10 bg-[#F3F4F6] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#525252]">
        {tagRoleLabels[role]}
      </div>
      <div className="custom-scrollbar max-h-48 overflow-y-auto" onScroll={handleScroll}>
        {options.map((option) => (
          <UserOptionButton
            key={`${option.taggedRole}-${option.taggedUserId}`}
            option={option}
            tagRoleLabels={tagRoleLabels}
            onSelect={onSelect}
          />
        ))}
        {isFetchingNextPage && <UserOptionShimmer />}
      </div>
    </div>
  );
}

function UserOptionButton({
  option,
  tagRoleLabels,
  onSelect,
}: {
  option: EmployeeLeaveTagOption;
  tagRoleLabels: Record<string, string>;
  onSelect: (option: EmployeeLeaveTagOption) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm text-[#282828] hover:bg-gray-50"
    >
      <Avatar src={option.profileUrl} alt={option.label} size={30} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{option.label}</span>
        <span className="block truncate text-xs font-medium text-[#6B7280]">
          {option.roleLabel ?? tagRoleLabels[option.taggedRole]}
        </span>
      </span>
    </button>
  );
}

function UserOptionShimmer() {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-2">
      <div className="h-[30px] w-[30px] shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
