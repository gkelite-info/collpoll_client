"use client";

import { useRouter } from "next/navigation";

export interface SubjectStat {
  subjectName: string;
  subjectCode: string;
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export default function SubjectWiseAttendance({
  studentId,
  data,
}: {
  studentId: string;
  data: SubjectStat[];
}) {
  const router = useRouter();

  const formatNum = (num: number | undefined) => {
    const val = num || 0;
    return val < 10 ? `0${val}` : val;
  };

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#333333]">
          Subject-Wise Attendance
        </h2>
        <p className="text-xs text-[#666666]">Subject-Wise Breakdown</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#F5F5F5]">
              {/* REMOVED Subject Code Header */}
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333] whitespace-nowrap rounded-tl-lg">
                Subject Name
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Total
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Attended
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Missed
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Leave
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Percentage
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333] rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEEEEE]">
            {data.map((row, index) => {
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* REMOVED Subject Code Data Cell */}

                  {/* Subject Name */}
                  <td className="px-4 py-3 text-sm text-[#333333] font-semibold">
                    {row.subjectName}
                    <div className="text-[10px] text-gray-400 font-normal">
                      {row.subjectCode}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {formatNum(row.total)}
                  </td>

                  {/* Attended (Present + Late) */}
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {formatNum(row.present)}
                  </td>

                  {/* Missed (Absent) */}
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {formatNum(row.absent)}
                  </td>

                  {/* Leave */}
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {formatNum(row.leave)}
                  </td>

                  {/* Percentage */}
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-bold ${row.percentage < 75 ? "text-red-500" : "text-[#666666]"}`}
                    >
                      {row.percentage}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() =>
                        router.push(
                          `/faculty/attendance/${studentId}/subject/${encodeURIComponent(
                            row.subjectCode,
                          )}`,
                        )
                      }
                      className="text-[#333333] cursor-pointer hover:text-emerald-500 font-semibold underline underline-offset-4 decoration-1 text-xs whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-gray-400 italic"
                >
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
