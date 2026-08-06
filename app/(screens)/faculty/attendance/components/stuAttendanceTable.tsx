"use client";

import { Avatar } from "@/app/utils/Avatar";
import {
  ClassOption,
  SectionOption,
  UIStudent,
} from "@/lib/helpers/faculty/attendance/attendanceActions";
import {
  CaretDown,
  CheckCircle,
  Clock,
  NotePencil,
  PencilSimple,
  User,
  XCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CustomDropdown } from "@/app/components/CustomDropdown";

interface Props {
  students: UIStudent[];
  setStudents: (students: UIStudent[]) => void;
  saving: boolean;
  isTopicMode: boolean;
  isEditing: boolean;
  onEditClick: () => void;
  handleSaveAttendance: () => Promise<void>;

  classes?: ClassOption[];
  sections?: SectionOption[];
  selectedClass?: string;
  selectedSection?: string;
  onFilterChange?: (type: "class" | "section" | "calendarType", value: string) => void;
  loadingFilters?: boolean;
  calendarType?: "Single" | "Bulk";
  page?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  loadingData?: boolean;
  isCurrentDate?: boolean;
  sortStatus?: string;
  onSortChange?: (val: string) => void;
}

// 🟢 CUSTOM DROPDOWN COMPONENT for Production-Grade UX
function AttendanceDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-[#43C17A1C] text-[#43C17A]";
      case "Absent":
        return "bg-red-100 text-red-600";
      case "Leave":
        return "bg-blue-100 text-blue-600";
      case "Late":
        return "bg-yellow-100 text-yellow-600";
      case "Not Marked":
        return "bg-gray-50 text-gray-500 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const options = [
    {
      value: "Present",
      label: "Present",
      textColor: "text-[#43C17A]",
      hoverBg: "hover:bg-[#43C17A1C]",
    },
    {
      value: "Absent",
      label: "Absent",
      textColor: "text-red-600",
      hoverBg: "hover:bg-red-50",
    },
    {
      value: "Leave",
      label: "Leave",
      textColor: "text-blue-600",
      hoverBg: "hover:bg-blue-50",
    },
  ];

  return (
    <div className="relative inline-block w-[110px]" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-bold transition-all ${getStatusStyle(
          value,
        )} ${disabled ? "cursor-default" : "cursor-pointer"}`}
      >
        <span>{value === "Not Marked" ? "Unmarked" : value}</span>
        {!disabled && (
          <CaretDown
            size={12}
            weight="bold"
            className={`transition-transform duration-200 opacity-70 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors cursor-pointer block ${
                opt.textColor
              } ${opt.hoverBg} ${
                value === opt.value ? "bg-gray-50/50" : "bg-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TableRowSkeleton = () => (
  <tr className="border-b border-gray-50">
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-4 bg-gray-200 rounded shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-6 bg-gray-200 rounded shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-20 bg-gray-200 rounded shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-7 w-7 bg-gray-200 rounded-full shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-32 bg-gray-200 rounded shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-8 w-24 bg-gray-200 rounded-full shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-12 bg-gray-200 rounded shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-24 bg-gray-200 rounded shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-12 bg-gray-200 rounded shimmer-bg" />
    </td>
    <td className="px-3 py-2 whitespace-nowrap">
      <div className="h-4 w-16 bg-gray-200 rounded shimmer-bg" />
    </td>
  </tr>
);

export default function StuAttendanceTable({
  students,
  setStudents,
  handleSaveAttendance,
  saving,
  isTopicMode,
  isEditing,
  onEditClick,
  classes = [],
  sections = [],
  selectedClass = "",
  selectedSection = "",
  onFilterChange,
  loadingFilters = false,
  calendarType = "Single",
  page = 1,
  itemsPerPage = 20,
  totalItems = 0,
  onPageChange,
  onItemsPerPageChange,
  loadingData = false,
  isCurrentDate = true,
  sortStatus = "All",
  onSortChange,
}: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = students; // Filtering handled by parent via server-side + URL params

  const updateAttendance = (id: string, value: UIStudent["attendance"]) => {
    if (!isEditing) return;
    setStudents(
      students.map((s) => (s.id === id ? { ...s, attendance: value } : s)),
    );
  };
  const updateReason = (id: string, value: string) => {
    if (!isEditing) return;
    setStudents(
      students.map((s) => (s.id === id ? { ...s, reason: value } : s)),
    );
  };
  const toggleSelectAll = () => {
    if (!isEditing) return;
    selectedIds.length === filtered.length
      ? setSelectedIds([])
      : setSelectedIds(filtered.map((s) => s.id));
  };
  const toggleSelectOne = (id: string) => {
    if (!isEditing) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const bulkUpdate = (status: UIStudent["attendance"]) => {
    if (!isEditing) return;
    setStudents(
      students.map((s) =>
        selectedIds.includes(s.id) ? { ...s, attendance: status } : s,
      ),
    );
    setSelectedIds([]);
  };

  const shouldShowReasonInput = (status: string) =>
    ["Absent", "Leave", "Class Cancel"].includes(status);

  return (
    <div className="space-y-4">
      <style>{`
        .shimmer-bg {
          position: relative;
          overflow: hidden;
        }
        .shimmer-bg::after {
          content: "";
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: table-sweep 1.5s infinite;
        }
        @keyframes table-sweep {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {!isTopicMode && onFilterChange && (
            <>
              {/* Calendar Type Dropdown */}
              <div className="w-[120px]">
                <CustomDropdown theme="always-green" hideCheckmark
                  options={[{ label: "Single", value: "Single" }, { label: "Bulk", value: "Bulk" }]}
                  value={calendarType}
                  onChange={(val) => onFilterChange("calendarType", String(val))}
                  disabled={loadingFilters || loadingData}
                  className="!rounded-full !py-1.5 min-h-[32px]"
                />
              </div>

              {/* Class Dropdown */}
              <div className="min-w-[220px]">
                <CustomDropdown theme="always-green" hideCheckmark
                  options={
                    classes.filter(c => (calendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-"))).length > 0
                      ? classes.filter(c => (calendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-"))).map((c) => ({ label: c.label, value: c.id }))
                      : [{ label: "No Classes Found", value: "" }]
                  }
                  value={selectedClass}
                  onChange={(val) => onFilterChange("class", String(val))}
                  disabled={loadingFilters || loadingData || !selectedClass}
                  placeholder="Select Class"
                  className="!rounded-full !py-1.5 min-h-[32px]"
                />
              </div>
            </>
          )}

                    {!isTopicMode && onFilterChange && (
            <div className="min-w-[150px]">
              <CustomDropdown theme="always-green" hideCheckmark
                options={
                  sections.length > 0
                    ? sections.map((s) => ({ label: `Section ${s.name}`, value: s.id }))
                    : [{ label: "All Sections", value: "" }]
                }
                value={selectedSection}
                onChange={(val) => onFilterChange("section", String(val))}
                disabled={loadingFilters || !selectedClass}
                placeholder="Select Section"
                className="!rounded-full !py-1.5 min-h-[32px]"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 font-medium hidden sm:inline">
              Sort:
            </span>
            <div className="relative min-w-[150px]">
              <CustomDropdown theme="always-green" hideCheckmark
                options={[
                  { label: "All Students", value: "All" },
                  { label: "Present", value: "Present" },
                  { label: "Absent", value: "Absent" },
                  { label: "Leave", value: "Leave" },
                  { label: "Class Cancelled", value: "Class Cancel" }
                ]}
                value={sortStatus}
                onChange={(val) => onSortChange?.(String(val))}
                disabled={isEditing || loadingFilters || loadingData || (!isTopicMode && !selectedClass)}
                className="!rounded-full !py-1.5 min-h-[32px]"
              />
            </div>
          </div>


        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {!isEditing ? (
            <button
              onClick={onEditClick}
              disabled={
                (!isTopicMode && !selectedClass) ||
                students.length === 0 ||
                loadingFilters
              }
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg shadow-sm whitespace-nowrap font-medium shrink-0 bg-[#43C17A] hover:bg-[#36a86a] text-white cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
              title=""
            >
              <PencilSimple size={18} weight="bold" />
              Edit Attendance
            </button>
          ) : (
            <button
              onClick={handleSaveAttendance}
              disabled={saving || loadingFilters}
              className="bg-[#43C17A] hover:bg-[#36a86a] text-sm cursor-pointer text-white px-4 py-2 rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 whitespace-nowrap font-medium"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          )}
        </div>
      </div>

      {/* 🟢 Ensures the custom dropdown menu isn't clipped by the container */}
      <div className="overflow-visible rounded-xl border border-gray-100 bg-white shadow-sm">
        {isEditing && selectedIds.length > 0 && !loadingFilters && (
          <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-2 shadow-sm animate-in fade-in slide-in-from-top-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <span className="text-xs font-bold text-gray-500 mr-2 border-r pr-3 whitespace-nowrap flex-shrink-0">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => bulkUpdate("Present")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium cursor-pointer bg-[#43C17A] text-white rounded-lg hover:opacity-90 transition whitespace-nowrap"
            >
              <CheckCircle weight="fill" /> Present
            </button>
            <button
              onClick={() => bulkUpdate("Absent")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium cursor-pointer bg-red-500 text-white rounded-lg hover:opacity-90 transition whitespace-nowrap"
            >
              <XCircle weight="fill" /> Absent
            </button>
            <button
              onClick={() => bulkUpdate("Leave")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium cursor-pointer bg-blue-500 text-white rounded-lg hover:opacity-90 transition whitespace-nowrap"
            >
              <User weight="fill" /> Leave
            </button>
          </div>
        )}

        {selectedIds.length > 0 && selectedIds.length === filtered.length && totalItems > filtered.length && (
          <div className="mb-3 px-2 mt-2">
            <p className="text-orange-500 text-xs sm:text-sm font-bold flex items-center gap-1.5">
               <WarningCircle size={18} weight="bold" className="shrink-0" />
               * Only current page students are selected for marking/saving. You need to do the same for the next page.
            </p>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm whitespace-nowrap min-w-max">
            <thead className="bg-[#FAFAFA] text-[#282828] border-b border-gray-100">
              <tr>
                <th className="px-3 py-2 text-left w-[40px] whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="accent-[#43C17A] h-4 w-4 rounded cursor-pointer"
                    checked={
                      selectedIds.length === filtered.length &&
                      filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                    disabled={!isEditing || loadingFilters}
                  />
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  S.No
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Roll No.
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Photo
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Attendance
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Attendance %
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 w-[20%] whitespace-nowrap">
                  Reason
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loadingData || loadingFilters ? (
                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
              ) : filtered.length > 0 ? (
                filtered.map((s, index) => (
                  <tr
                    key={s.id}
                    className={`text-[#515151] transition-colors hover:bg-gray-50/50 ${
                      selectedIds.includes(s.id) ? "bg-[#43C17A05]" : ""
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="accent-[#43C17A] h-4 w-4 rounded cursor-pointer"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSelectOne(s.id)}
                        disabled={!isEditing}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">
                      <span className="text-[#43C17A]">ID </span> - {s.roll}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {/* {s.photo ? (
                        <img
                          src={s.photo}
                          className="h-7 w-7 rounded-full border border-gray-200 object-cover"
                          alt={s.name}
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-indigo-500 text-xs font-medium text-white">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                      )} */}
                      <Avatar src={s.photo} size={28} alt={s.name}/>
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="px-3 py-2 relative whitespace-nowrap">
                      {/* 🟢 CUSTOM ATTENDANCE DROPDOWN INTEGRATION */}
                      {s.attendance === "Class Cancel" ? (
                        <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-600 px-4 py-1.5 text-xs font-bold w-[110px] justify-center">
                          Cancelled
                        </span>
                      ) : (
                        <AttendanceDropdown
                          value={s.attendance}
                          onChange={(newStatus) =>
                            updateAttendance(s.id, newStatus as any)
                          }
                          disabled={!isEditing}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                      {s.percentage}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {shouldShowReasonInput(s.attendance) ? (
                        <div className="relative group">
                          <input
                            type="text"
                            value={s.reason || ""}
                            onChange={(e) => updateReason(s.id, e.target.value)}
                            placeholder={isEditing ? "Add reason..." : ""}
                            disabled={!isEditing}
                            className={`w-full text-xs bg-transparent border-b ${
                              isEditing
                                ? "border-gray-300 focus:border-[#43C17A]"
                                : "border-transparent"
                            } outline-none py-1 transition-colors text-gray-600 placeholder-gray-400`}
                          />
                          {isEditing && (
                            <NotePencil
                              className="absolute right-0 top-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                              size={14}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 pl-2">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          parseInt(s.percentage) >= 90
                            ? "bg-green-100 text-green-700"
                            : parseInt(s.percentage) >= 70
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {parseInt(s.percentage) >= 90
                          ? "Top"
                          : parseInt(s.percentage) >= 70
                            ? "Good"
                            : "Low"}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() =>
                          router.push(`/faculty/attendance/${s.id}`)
                        }
                        className="text-gray-500 cursor-pointer hover:text-[#43C17A] font-medium text-xs transition-colors hover:underline underline-offset-2"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-8 text-center text-gray-400 italic whitespace-nowrap"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {onPageChange && (
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            itemsPerPageOptions={[10, 20, 50, 100]}
            onItemsPerPageChange={(limit) => {
              if (onItemsPerPageChange) onItemsPerPageChange(limit);
              if (onPageChange) onPageChange(1);
            }}
            disabled={isEditing || loadingFilters}
            roundedBottom="rounded-b-xl"
            alwaysShow={true}
          />
        )}
      </div>
    </div>
  );
}
