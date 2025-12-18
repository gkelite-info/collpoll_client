"use client";

import { CaretDown, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Student, students } from "../data";

type AttendanceStatus = "Present" | "Absent" | "Leave";

export default function StuAttendanceTable() {
  const router = useRouter();

  const [data, setData] = useState<Student[]>(students);
  const [sort, setSort] = useState<"All" | AttendanceStatus>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = data.filter((s) => sort === "All" || s.attendance === sort);

  const updateAttendance = (id: string, value: AttendanceStatus) => {
    setData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendance: value } : s))
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const bulkUpdate = (status: AttendanceStatus) => {
    setData((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id) ? { ...s, attendance: status } : s
      )
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
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-medium">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-full bg-[#43C17A1C] px-3 py-1 text-[#43C17A] outline-none border-none font-medium"
          >
            <option value="All">All Students</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-2 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-gray-500 mr-2 border-r pr-3">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => bulkUpdate("Present")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-[#43C17A] text-white rounded-lg hover:opacity-90 transition"
            >
              <CheckCircle weight="fill" /> Mark Present
            </button>
            <button
              onClick={() => bulkUpdate("Absent")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:opacity-90 transition"
            >
              <XCircle weight="fill" /> Mark Absent
            </button>
            <button
              onClick={() => bulkUpdate("Leave")}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-blue-500 text-white rounded-lg hover:opacity-90 transition"
            >
              <Clock weight="fill" /> Mark Leave
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#5252520A] text-[#282828] border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    className="accent-[#43C17A] h-4 w-4 rounded cursor-pointer"
                    checked={
                      selectedIds.length === filtered.length &&
                      filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 text-left font-semibold">Roll No.</th>
                <th className="px-4 py-4 text-left font-semibold">Photo</th>
                <th className="px-4 py-4 text-left font-semibold">Name</th>
                <th className="px-4 py-4 text-left font-semibold">
                  Attendance
                </th>
                <th className="px-4 py-4 text-left font-semibold">
                  Attendance %
                </th>
                <th className="px-4 py-4 text-left font-semibold">Status</th>
                <th className="px-4 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className={`text-[#515151] transition-colors hover:bg-gray-50/50 ${
                    selectedIds.includes(s.id) ? "bg-[#43C17A05]" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="accent-[#43C17A] h-4 w-4 rounded cursor-pointer"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSelectOne(s.id)}
                    />
                  </td>

                  <td className="px-4 py-4 font-medium">
                    <span className="text-[#43C17A]">ID </span> - {s.roll}
                  </td>

                  <td className="px-4 py-4">
                    <img
                      src={s.photo}
                      className="h-8 w-8 rounded-full border border-gray-200"
                      alt={s.name}
                    />
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-800">
                    {s.name}
                  </td>

                  <td className="px-4 py-4">
                    <div className="relative group">
                      <select
                        value={s.attendance}
                        onChange={(e) =>
                          updateAttendance(
                            s.id,
                            e.target.value as AttendanceStatus
                          )
                        }
                        className={`appearance-none flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer outline-none border-none ${getStatusStyle(
                          s.attendance
                        )}`}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Leave</option>
                      </select>
                      <CaretDown
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                        size={10}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 font-medium">{s.percentage}%</td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.percentage >= 90
                          ? "bg-green-100 text-green-700"
                          : s.percentage >= 70
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.percentage >= 90
                        ? "Top"
                        : s.percentage >= 70
                        ? "Good"
                        : "Low"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <button
                      onClick={() => router.push(`/faculty/attendance/${s.id}`)}
                      className="text-gray-400 hover:text-[#43C17A] font-bold text-xs transition-colors"
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

      {filtered.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 italic">
          No students found for the selected filter.
        </div>
      )}
    </div>
  );
}
