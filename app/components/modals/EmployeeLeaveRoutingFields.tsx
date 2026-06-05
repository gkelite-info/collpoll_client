"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/app/utils/Avatar";
import { useUser } from "@/app/utils/context/UserContext";
import {
  EmployeeLeaveTagFetchRole,
  EmployeeLeaveTaggedRole,
  EmployeeLeaveTagOption,
  EmployeeLeaveTagSelection,
  fetchEmployeeLeaveTagOptions,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestTagsAPI";

const requesterTagRole: Record<string, EmployeeLeaveTagFetchRole> = {
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "FinanceManager",
  CollegeHr: "CollegeHr",
  WellbeingExecutive: "WellbeingExecutive",
  PlacementOfficer: "AllStaff",
};

const hrAndCollegeAdminOnlyRoles = new Set([
  "CollegeHr",
  "FinanceManager",
  "WellbeingManager",
]);

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

const tagRoleLabels: Record<EmployeeLeaveTagFetchRole, string> = {
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  FinanceManager: "Finance Manager",
  CollegeHr: "HR",
  CollegeAdmin: "College Admin",
  PlacementOfficer: "Placement Officer",
  WellbeingExecutive: "Wellbeing Executive",
  WellbeingManager: "Wellbeing Manager",
  AllStaff: "Select Staff",
};

const staffRoleOrder: EmployeeLeaveTaggedRole[] = [
  "Faculty",
  "Admin",
  "FinanceManager",
  "Finance",
  "PlacementOfficer",
  "WellbeingManager",
  "WellbeingExecutive",
];

type EmployeeLeaveRoutingFieldsProps = {
  value: EmployeeLeaveTagSelection[];
  onChange: (value: EmployeeLeaveTagSelection[]) => void;
};

export default function EmployeeLeaveRoutingFields({
  value,
  onChange,
}: EmployeeLeaveRoutingFieldsProps) {
  const { collegeId, collegeEducationType, role, userId } = useUser();
  const tagRoles = getRequiredEmployeeLeaveTagRoles(role);

  if (!collegeId || !tagRoles.length) return null;

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
      className={`grid grid-cols-1 gap-3 ${
        tagRoles.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
      }`}
    >
      {tagRoles.map((taggedRole) => (
        <EmployeeLeaveTagSelect
          key={taggedRole}
          collegeId={collegeId}
          excludeUserId={userId}
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
        />
      ))}
    </div>
  );
}

function EmployeeLeaveTagSelect({
  collegeId,
  excludeUserId,
  collegeEducationType,
  taggedRole,
  value,
  onChange,
}: {
  collegeId: number;
  excludeUserId: number | null;
  collegeEducationType: string | null;
  taggedRole: EmployeeLeaveTagFetchRole;
  value: EmployeeLeaveTagSelection | null;
  onChange: (value: EmployeeLeaveTagOption | null) => void;
}) {
  const [options, setOptions] = useState<EmployeeLeaveTagOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const nextOptions = await fetchEmployeeLeaveTagOptions({
          collegeId,
          taggedRole,
          collegeEducationType,
          excludeUserId,
        });
        if (isActive) setOptions(nextOptions);
      } catch (error) {
        console.error(`Failed to load ${taggedRole} leave tag options:`, error);
        if (isActive) setOptions([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadOptions();
    return () => {
      isActive = false;
    };
  }, [
    collegeEducationType,
    collegeId,
    excludeUserId,
    taggedRole,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  const selectedOption = useMemo(
    () =>
      value
        ? options.find(
            (option) =>
              option.taggedRole === value.taggedRole &&
              option.taggedUserId === value.taggedUserId,
          ) ?? null
        : null,
    [options, value],
  );

  const groupedOptions = useMemo(() => {
    if (taggedRole !== "AllStaff") {
      return [{ role: taggedRole, options }];
    }

    return staffRoleOrder
      .map((role) => ({
        role,
        options: options.filter((option) => option.taggedRole === role),
      }))
      .filter((group) => group.options.length > 0);
  }, [options, taggedRole]);

  return (
    <label
      ref={containerRef}
      className="relative flex flex-col gap-2 text-sm font-semibold text-[#282828]"
    >
      <span>
        Tag <span className="text-[#FF2020]">*</span>
      </span>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-11 w-full cursor-pointer items-center justify-between rounded border border-[#CFCFCF] bg-white px-4 text-left text-sm outline-none focus:border-[#43C17A] ${
          selectedOption ? "text-[#525252]" : "text-[#9CA3AF]"
        } disabled:cursor-wait disabled:opacity-70`}
      >
        <span className="min-w-0 truncate">
          {isLoading
            ? "Loading..."
            : selectedOption?.label ?? tagRoleLabels[taggedRole]}
        </span>
        <CaretDown
          size={16}
          className={`shrink-0 text-[#9CA3AF] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !isLoading && (
        <div className="custom-scrollbar absolute left-0 right-0 top-[72px] z-50 max-h-72 overflow-y-auto rounded border border-[#CFCFCF] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className="flex h-10 w-full cursor-pointer items-center bg-[#1F6FD6] px-4 text-left text-sm font-semibold text-white"
          >
            {tagRoleLabels[taggedRole]}
          </button>
          {groupedOptions.map((group) => (
            <div key={group.role}>
              {taggedRole === "AllStaff" && (
                <div className="sticky top-0 z-10 bg-[#F3F4F6] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#525252]">
                  {tagRoleLabels[group.role]}
                </div>
              )}
              {group.options.map((option) => (
                <button
                  key={`${option.taggedRole}-${option.taggedUserId}`}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm text-[#282828] hover:bg-gray-50"
                >
                  <Avatar
                    src={option.profileUrl}
                    alt={option.label}
                    size={30}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {option.label}
                    </span>
                    <span className="block truncate text-xs font-medium text-[#6B7280]">
                      {option.roleLabel ?? tagRoleLabels[option.taggedRole]}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ))}
          {!options.length && (
            <div className="px-4 py-3 text-sm font-medium text-[#9CA3AF]">
              No users found
            </div>
          )}
        </div>
      )}
    </label>
  );
}
