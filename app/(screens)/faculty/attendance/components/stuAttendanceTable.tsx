"use client";

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
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

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
  onFilterChange?: (type: "class" | "section", value: string) => void;
  loadingFilters?: boolean;
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
}: Props) {
  const router = useRouter();
  const [sort, setSort] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = students.filter(
    (s) => sort === "All" || s.attendance === sort,
  );

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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {!isTopicMode && onFilterChange && (
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => onFilterChange("class", e.target.value)}
                className="appearance-none rounded-full bg-[#43C17A1C] pl-4 pr-8 py-1.5 text-[#43C17A] outline-none border-none font-medium cursor-pointer text-sm min-w-[180px]"
                disabled={loadingFilters}
              >
                {classes.length > 0 ? (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))
                ) : (
                  <option value="">No Classes Today</option>
                )}
              </select>
              <CaretDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                size={12}
                weight="bold"
              />
            </div>
          )}

          {!isTopicMode && onFilterChange && (
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => onFilterChange("section", e.target.value)}
                className="appearance-none rounded-full bg-[#43C17A1C] pl-4 pr-8 py-1.5 text-[#43C17A] outline-none border-none font-medium cursor-pointer text-sm"
                disabled={loadingFilters || !selectedClass}
              >
                {sections.length > 0 ? (
                  sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))
                ) : (
                  <option value="">All Sections</option>
                )}
              </select>
              <CaretDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                size={12}
                weight="bold"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 font-medium hidden sm:inline">
              Sort:
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-full bg-[#43C17A1C] pl-3 pr-8 py-1.5 text-[#43C17A] outline-none border-none font-medium cursor-pointer text-sm"
              >
                <option value="All">All Students</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Class Cancel">Class Cancelled</option>
              </select>
              <CaretDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                size={12}
                weight="bold"
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
              className="flex items-center gap-2 bg-[#43C17A] hover:bg-[#36a86a] text-sm cursor-pointer text-white px-4 py-2 rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 font-medium"
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
          <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-2 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-gray-500 mr-2 border-r pr-3 whitespace-nowrap">
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

        <div className="overflow-visible">
          <table className="w-full text-sm">
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
              {loadingFilters ? (
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
                      {s.photo ? (
                        <img
                          src={s.photo}
                          className="h-7 w-7 rounded-full border border-gray-200 object-cover"
                          alt={s.name}
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-indigo-500 text-xs font-medium text-white">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
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
      </div>
    </div>
  );
}
