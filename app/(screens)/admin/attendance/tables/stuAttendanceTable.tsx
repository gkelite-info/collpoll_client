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
import { useState } from "react";

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
      case "Class Cancel":
        return "bg-gray-200 text-gray-600";
      case "Not Marked":
        return "bg-gray-50 text-gray-400 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  const shouldShowReasonInput = (status: string) =>
    ["Absent", "Leave", "Late", "Class Cancel"].includes(status);

  return (
    <div className="space-y-4">
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
                <option value="Late">Late</option>
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
                (!isTopicMode && !selectedClass) || students.length === 0
              }
              className="flex items-center gap-2 bg-[#43C17A] hover:bg-[#36a86a] text-sm cursor-pointer text-white px-4 py-2 rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 font-medium"
            >
              <PencilSimple size={18} weight="bold" />
              Edit Attendance
            </button>
          ) : (
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="bg-[#43C17A] hover:bg-[#36a86a] text-sm cursor-pointer text-white px-4 py-2 rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 whitespace-nowrap font-medium"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {isEditing && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-2 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-gray-500 mr-2 border-r pr-3">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => bulkUpdate("Present")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium cursor-pointer bg-[#43C17A] text-white rounded-lg hover:opacity-90 transition"
            >
              <CheckCircle weight="fill" /> Present
            </button>
            <button
              onClick={() => bulkUpdate("Absent")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium cursor-pointer bg-red-500 text-white rounded-lg hover:opacity-90 transition"
            >
              <XCircle weight="fill" /> Absent
            </button>
            <button
              onClick={() => bulkUpdate("Leave")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium cursor-pointer bg-blue-500 text-white rounded-lg hover:opacity-90 transition"
            >
              <User weight="fill" /> Leave
            </button>
            <button
              onClick={() => bulkUpdate("Late")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium cursor-pointer bg-yellow-500 text-white rounded-lg hover:opacity-90 transition"
            >
              <Clock weight="fill" /> Late
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-[#282828] border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 text-left w-[40px]">
                  <input
                    type="checkbox"
                    className="accent-[#43C17A] h-4 w-4 rounded cursor-pointer"
                    checked={
                      selectedIds.length === filtered.length &&
                      filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                    disabled={!isEditing}
                  />
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  S.No
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  Roll No.
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  Photo
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  Attendance
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  Attendance %
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[20%]">
                  Reason
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s, index) => (
                <tr
                  key={s.id}
                  className={`text-[#515151] transition-colors hover:bg-gray-50/50 ${selectedIds.includes(s.id) ? "bg-[#43C17A05]" : ""}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="accent-[#43C17A] h-4 w-4 rounded cursor-pointer"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSelectOne(s.id)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 font-medium">
                    <span className="text-[#43C17A]">ID </span> - {s.roll}
                  </td>
                  <td className="px-4 py-4">
                    {s.photo ? (
                      <img
                        src={s.photo}
                        className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                        alt={s.name}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-indigo-500 text-xs font-medium text-white">
                        {s.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-800">
                    {s.name}
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className={`relative inline-flex items-center rounded-full w-max ${getStatusStyle(s.attendance)}`}
                    >
                      {s.attendance === "Class Cancel" ? (
                        <span className="px-4 py-1.5 text-xs font-bold">
                          Class Cancelled
                        </span>
                      ) : (
                        <div
                          className={`relative inline-flex items-center rounded-full w-max ${getStatusStyle(s.attendance)}`}
                        >
                          <select
                            value={s.attendance}
                            onChange={(e) =>
                              updateAttendance(s.id, e.target.value as any)
                            }
                            disabled={!isEditing}
                            className={`
    appearance-none bg-transparent border-none outline-none text-xs font-bold pl-4 pr-8 py-1.5 cursor-pointer z-10
      ${
        isEditing
          ? "px-4 cursor-pointer"
          : "pl-4 pr-8 cursor-default pointer-events-none"
      }
    `}
                          >
                            {s.attendance === "Not Marked" && (
                              <option value="Not Marked" disabled>
                                Unmarked
                              </option>
                            )}
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                            <option value="Late">Late</option>
                          </select>

                          <CaretDown
                            size={12}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-600">
                    {s.percentage}
                  </td>
                  <td className="px-4 py-4">
                    {shouldShowReasonInput(s.attendance) ? (
                      <div className="relative group">
                        <input
                          type="text"
                          value={s.reason || ""}
                          onChange={(e) => updateReason(s.id, e.target.value)}
                          placeholder={isEditing ? "Add reason..." : ""}
                          disabled={!isEditing}
                          className={`w-full text-xs bg-transparent border-b ${isEditing ? "border-gray-300 focus:border-[#43C17A]" : "border-transparent"} outline-none py-1 transition-colors text-gray-600 placeholder-gray-400`}
                        />
                        {isEditing && (
                          <NotePencil
                            className={`absolute right-0 top-1.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                            size={14}
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 pl-2">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${parseInt(s.percentage) >= 90 ? "bg-green-100 text-green-700" : parseInt(s.percentage) >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                    >
                      {parseInt(s.percentage) >= 90
                        ? "Top"
                        : parseInt(s.percentage) >= 70
                          ? "Good"
                          : "Low"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => router.push(`/admin/attendance/${s.id}`)}
                      className="text-gray-500 cursor-pointer hover:text-[#43C17A] font-medium text-xs transition-colors hover:underline underline-offset-2"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
