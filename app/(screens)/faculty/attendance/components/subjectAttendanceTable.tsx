"use client";

import { SubjectAttendanceRecord } from "../data";
import { FilePdf } from "@phosphor-icons/react";

export default function SubjectAttendanceTable({
  records,
}: {
  records: SubjectAttendanceRecord[];
}) {
  const statusStyles: Record<string, string> = {
    Present: "bg-green-100 text-green-800",
    Absent: "bg-red-100 text-red-800",
    Leave: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-[#F1F1F1] text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Reason</th>
            <th className="px-4 py-3 text-left">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {records.map((r, i) => (
            <tr
              key={i}
              className="hover:bg-gray-50 transition-colors text-black"
            >
              <td className="px-4 py-3">{r.date}</td>
              <td className="px-4 py-3">{r.time || "-"}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    statusStyles[r.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3">{r.reason || "-"}</td>

              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <button className="p-1.5 bg-[#F5F3FF] rounded-lg hover:bg-[#EDE9FE] transition-colors">
                    <FilePdf
                      size={20}
                      weight="bold"
                      className="text-[#8B5CF6]"
                    />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
