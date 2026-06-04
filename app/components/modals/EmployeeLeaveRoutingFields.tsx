"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import {
  EmployeeLeaveTaggedRole,
  EmployeeLeaveTagOption,
  EmployeeLeaveTagSelection,
  fetchEmployeeLeaveTagOptions,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestTagsAPI";

const requesterTagRole: Record<string, EmployeeLeaveTaggedRole> = {
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "FinanceManager",
  CollegeHr: "CollegeHr",
  WellbeingExecutive: "WellbeingExecutive",
  PlacementOfficer: "PlacementOfficer",
};

const hrAndCollegeAdminOnlyRoles = new Set([
  "CollegeHr",
  "FinanceManager",
  "WellbeingManager",
]);

export const getRequiredEmployeeLeaveTagRoles = (
  role?: string | null,
): EmployeeLeaveTaggedRole[] => {
  const requesterRole = role ? requesterTagRole[role] : undefined;

  if (role && hrAndCollegeAdminOnlyRoles.has(role)) {
    return ["CollegeHr", "CollegeAdmin"];
  }

  return requesterRole ? [requesterRole, "CollegeHr", "CollegeAdmin"] : [];
};

export const hasRequiredEmployeeLeaveTags = (
  role: string | null | undefined,
  tags: EmployeeLeaveTagSelection[],
) =>
  getRequiredEmployeeLeaveTagRoles(role).every((taggedRole) =>
    tags.some((tag) => tag.taggedRole === taggedRole && tag.taggedUserId),
  );

const tagRoleLabels: Record<EmployeeLeaveTaggedRole, string> = {
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  FinanceManager: "Finance Manager",
  CollegeHr: "HR",
  CollegeAdmin: "College Admin",
  PlacementOfficer: "Placement Officer",
  WellbeingExecutive: "Wellbeing Executive",
  WellbeingManager: "Wellbeing Manager",
};

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
    taggedRole: EmployeeLeaveTaggedRole,
    taggedUserId: number | null,
  ) => {
    const remainingTags = value.filter((tag) => tag.taggedRole !== taggedRole);
    onChange(
      taggedUserId
        ? [...remainingTags, { taggedRole, taggedUserId }]
        : remainingTags,
    );
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
            value.find((tag) => tag.taggedRole === taggedRole)?.taggedUserId ??
            null
          }
          onChange={(taggedUserId) =>
            handleTagChange(taggedRole, taggedUserId)
          }
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
  taggedRole: EmployeeLeaveTaggedRole;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const [options, setOptions] = useState<EmployeeLeaveTagOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        if (taggedRole === "FinanceManager") {
          console.log("[LeaveTags][FinanceManager] loaded options", {
            collegeId,
            collegeEducationType,
            excludeUserId,
            options: nextOptions,
          });
        }
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

  const fieldClassName =
    "h-11 w-full rounded border border-[#CFCFCF] bg-white px-4 text-sm outline-none focus:border-[#43C17A]";

  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-[#282828]">
      <span>
        Tag <span className="text-[#FF2020]">*</span>
      </span>
      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
        disabled={isLoading}
        className={`${fieldClassName} ${
          value ? "text-[#525252]" : "text-[#9CA3AF]"
        } disabled:cursor-wait disabled:opacity-70`}
      >
        <option value="">
          {isLoading ? "Loading..." : tagRoleLabels[taggedRole]}
        </option>
        {options.map((option) => (
          <option key={option.taggedUserId} value={option.taggedUserId}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
