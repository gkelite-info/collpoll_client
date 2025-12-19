"use client";

import { SubjectAttendanceRecord } from "../data";

export default function SubjectAttendanceTable({
  records,
}: {
  records: SubjectAttendanceRecord[];
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Reason</th>
            <th className="px-4 py-3 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-3">{r.date}</td>
              <td className="px-4 py-3">{r.time || "-"}</td>
              <td className="px-4 py-3">{r.status}</td>
              <td className="px-4 py-3">{r.reason || "-"}</td>
              <td className="px-4 py-3">{r.notes || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
