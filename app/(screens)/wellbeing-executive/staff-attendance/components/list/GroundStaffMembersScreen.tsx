"use client";

import {
  ArrowLeft,
  CaretDown,
  Eye,
  MagnifyingGlass,
  ShieldCheckered,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { securityDirectoryRows, type StaffAttendanceRecord } from "../../data";

type GroundStaffMembersScreenProps = {
  records: StaffAttendanceRecord[];
  onBack: () => void;
  onViewProfile: (record: StaffAttendanceRecord) => void;
};

type DirectoryDesignationFilter = "all" | StaffAttendanceRecord["designation"];
type DirectoryStatusFilter = "all" | StaffAttendanceRecord["status"];
type DirectorySortFilter = "name" | "employeeId" | "joiningDate";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

const designationOptions: DropdownOption<DirectoryDesignationFilter>[] = [
  { label: "All Designations", value: "all" },
  { label: "Watchman", value: "Watchman" },
  { label: "Security Guard", value: "Security Guard" },
  { label: "Bouncer", value: "Bouncer" },
];

const statusOptions: DropdownOption<DirectoryStatusFilter>[] = [
  { label: "All Statuses", value: "all" },
  { label: "Present", value: "present" },
  { label: "Absent", value: "absent" },
  { label: "Late", value: "late" },
];

const sortOptions: DropdownOption<DirectorySortFilter>[] = [
  { label: "Sort By", value: "name" },
  { label: "Employee ID", value: "employeeId" },
  { label: "Joining Date", value: "joiningDate" },
];

const getDesignationFilter = (value: string | null): DirectoryDesignationFilter =>
  value === "Watchman" || value === "Security Guard" || value === "Bouncer"
    ? value
    : "all";

const getStatusFilter = (value: string | null): DirectoryStatusFilter =>
  value === "present" || value === "absent" || value === "late" ? value : "all";

const getSortFilter = (value: string | null): DirectorySortFilter =>
  value === "employeeId" || value === "joiningDate" ? value : "name";

export default function GroundStaffMembersScreen({
  records,
  onBack,
  onViewProfile,
}: GroundStaffMembersScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const directoryRows = securityDirectoryRows.length ? securityDirectoryRows : records;
  const designationFilter = getDesignationFilter(searchParams.get("designation"));
  const statusFilter = getStatusFilter(searchParams.get("status"));
  const sortFilter = getSortFilter(searchParams.get("sortBy"));
  const filteredRows = useMemo(() => {
    const rows = directoryRows.filter((record) => {
      const matchesDesignation =
        designationFilter === "all" || record.designation === designationFilter;
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;

      return matchesDesignation && matchesStatus;
    });

    return [...rows].sort((a, b) => {
      if (sortFilter === "employeeId") {
        return a.staffId.localeCompare(b.staffId);
      }

      if (sortFilter === "joiningDate") {
        return Date.parse(a.joiningDate) - Date.parse(b.joiningDate);
      }

      return a.name.localeCompare(b.name);
    });
  }, [designationFilter, directoryRows, sortFilter, statusFilter]);

  const updateFilter = (key: "designation" | "status" | "sortBy", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "directory");

    if (
      (key === "designation" && value === "all") ||
      (key === "status" && value === "all") ||
      (key === "sortBy" && value === "name")
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="min-h-screen w-full bg-white p-5">
      <section className="mx-auto max-w-[1280px] rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#08244A] text-white transition-colors hover:bg-[#123A6D]"
              title="Back to attendance"
            >
              <ArrowLeft size={22} weight="bold" />
            </button>
            <div>
              <h1 className="text-[25px] font-extrabold text-[#08244A]">Security Staff Directory</h1>
              <p className="text-[12px] font-medium text-[#64748B]">
                View and manage all security personnel assigned across the campus.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DirectoryStat title="Total Staff" value="48" icon={<UsersThree size={22} weight="fill" />} tone="gray" />
          <DirectoryStat title="Watchmen" value="18" icon={<Eye size={22} weight="bold" />} tone="green" />
          <DirectoryStat title="Security Guards" value="14" icon={<ShieldCheckered size={23} weight="fill" />} />
          <DirectoryStat
            title="Bouncers"
            value="16"
            icon={
              <span className="relative grid h-6 w-6 place-items-center">
                <X size={12} weight="bold" className="absolute left-[4px] top-[5px] text-[#CC1F1F]" />
                <X size={12} weight="bold" className="absolute bottom-[4px] right-[4px] text-[#CC1F1F]" />
              </span>
            }
            tone="red"
          />
        </div>

        <div className="mt-6 rounded-lg border border-[#D7DFEC] bg-white">
          <div className="grid gap-3 border-b border-[#E4E9F1] p-4 md:grid-cols-[1fr_140px_110px_110px]">
            <div className="flex h-10 items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[12px] font-semibold text-[#8A9AB5]">
              <MagnifyingGlass size={16} />
              Search by name or employee ID
            </div>
            <DirectoryFilterDropdown
              value={designationFilter}
              options={designationOptions}
              onChange={(value) => updateFilter("designation", value)}
            />
            <DirectoryFilterDropdown
              value={statusFilter}
              options={statusOptions}
              onChange={(value) => updateFilter("status", value)}
            />
            <DirectoryFilterDropdown
              value={sortFilter}
              options={sortOptions}
              onChange={(value) => updateFilter("sortBy", value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-[#F3F6FA] text-[10px] uppercase tracking-wide text-[#34425E]">
                <tr>
                  <th className="px-5 py-4">Staff Name</th>
                  <th className="px-5 py-4">Employee ID</th>
                  <th className="px-5 py-4">Designation</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Contact Number</th>
                  <th className="px-5 py-4">Joining Date</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9F1]">
                {filteredRows.map((record) => (
                  <tr key={`${record.staffId}-${record.id}`} className="text-[12px] text-[#34425E]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`https://i.pravatar.cc/80?img=${record.imageSeed}`}
                          alt={record.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="font-extrabold text-[#08244A]">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold">{record.staffId}</td>
                    <td className="px-5 py-4">{record.designation}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-5 py-4">{record.phone.replace(/\d(?=\d{2})/g, "X")}</td>
                    <td className="px-5 py-4">{record.joiningDate}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center text-[#64748B]">
                        <button
                          type="button"
                          onClick={() => onViewProfile(record)}
                          title="View profile"
                          className="cursor-pointer transition-colors hover:text-[#0B66C3]"
                        >
                          <Eye size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#E4E9F1] px-5 py-4 text-[11px] text-[#6B7280]">
            <span>
              Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {directoryRows.length} staff members
            </span>
            <div className="flex items-center gap-2">
              {["<", "1", "2", "3", "...", "12", ">"].map((item) => (
                <button
                  key={item}
                  className={`h-7 min-w-7 rounded border px-2 text-[11px] font-bold ${
                    item === "1"
                      ? "border-[#08244A] bg-[#08244A] text-white"
                      : "border-[#D7DFEC] bg-white text-[#64748B]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: StaffAttendanceRecord["status"] }) {
  const label =
    status === "present" ? "Present" : status === "absent" ? "Absent" : "Late";
  const className =
    status === "present"
      ? "bg-[#E8F8EF] text-[#009B55]"
      : status === "absent"
        ? "bg-[#FFF2F2] text-[#EF4444]"
        : "bg-[#FFF4DF] text-[#D97706]";

  return (
    <span className={`inline-flex min-w-[76px] justify-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${className}`}>
      {label}
    </span>
  );
}

function DirectoryFilterDropdown<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label;

  return (
    <div className="relative z-20" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-[#D7DFEC] bg-[#F8FAFC] px-4 text-[12px] font-semibold text-[#34425E] transition-colors hover:border-[#9BAAC0] hover:bg-white"
      >
        <span className="truncate">{selectedLabel}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="custom-scrollbar absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg bg-white py-1 shadow-xl ring-1 ring-black/5">
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full cursor-pointer px-4 py-2.5 text-left text-[12px] font-semibold transition-colors ${
                  selected
                    ? "bg-[#08244A] text-white"
                    : "bg-white text-[#34425E] hover:bg-[#F3F6FA]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function DirectoryStat({
  title,
  value,
  icon,
  tone = "blue",
}: {
  title: string;
  value: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "red" | "gray";
}) {
  const toneClass = {
    blue: "bg-[#EAF0FF] text-[#2166D1]",
    green: "bg-[#E8F8EF] text-[#43C17A]",
    red: "bg-[#FFF2F2] text-[#CC1F1F]",
    gray: "bg-[#EEF2F5] text-[#08244A]",
  }[tone];

  return (
    <div className="flex min-h-[78px] items-center gap-4 rounded-lg border border-[#D7DFEC] bg-white p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-md ${toneClass}`}>
        {icon}
      </span>
      <span>
        <span className="block text-[10px] font-bold uppercase text-[#6B7280]">{title}</span>
        <span className="mt-1 block text-[21px] font-extrabold text-[#08244A]">{value}</span>
      </span>
    </div>
  );
}
