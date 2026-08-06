"use client";

import { SubjectAttendanceRecord } from "../data";
import { FilePdf } from "@phosphor-icons/react";

export default function SubjectAttendanceTable({
  records,
  loadingData = false,
}: {
  records: SubjectAttendanceRecord[];
  loadingData?: boolean;
}) {
  const statusStyles: Record<string, string> = {
    Present: "bg-green-100 text-green-800",
    Absent: "bg-red-100 text-red-800",
    Leave: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-x-auto w-full">
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
            rgba(255, 255, 255, 0.4) 20%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      <table className="w-full text-sm whitespace-nowrap min-w-max">
        <thead className="bg-[#F1F1F1] text-gray-600">
          <tr className="text-center">
            <th className="px-4 py-3 text-center">Date</th>
            <th className="px-4 py-3 text-center">Time</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Reason</th>
            {/* <th className="px-4 py-3 text-center">Notes</th> */}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {loadingData ? (
            [...Array(5)].map((_, i) => (
              <tr key={`shimmer-${i}`} className="border-b border-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="h-4 w-20 bg-gray-200 rounded shimmer-bg mx-auto" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="h-4 w-24 bg-gray-200 rounded shimmer-bg mx-auto" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="h-6 w-20 bg-gray-200 rounded-full shimmer-bg mx-auto" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="h-4 w-24 bg-gray-200 rounded shimmer-bg mx-auto" />
                </td>
              </tr>
            ))
          ) : records.length > 0 ? (
            records.map((r, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 transition-colors text-black"
              >
                <td className="px-4 py-3 text-center">{r.date}</td>

                <td className="px-4 py-3 text-center">{r.time || "-"}</td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      statusStyles[r.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">{r.reason || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-gray-500 bg-white">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <span className="text-4xl">📂</span>
                  <p className="text-base font-medium text-gray-600">No records found</p>
                  <p className="text-sm text-gray-400">There are no attendance records for this filter.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
