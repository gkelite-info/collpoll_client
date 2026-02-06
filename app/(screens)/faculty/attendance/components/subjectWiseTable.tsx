// "use client";

// import { useRouter } from "next/navigation";

// export interface SubjectStat {
//   subject: string;
//   totalClasses: number;
//   present: number;
//   absent: number;
//   leave: number;
//   percentage: number;
// }

// export default function SubjectWiseAttendance({
//   studentId,
//   data,
// }: {
//   studentId: string;
//   data: SubjectStat[];
// }) {
//   const router = useRouter();

//   const formatNum = (num: number) => (num < 10 ? `0${num}` : num);

//   return (
//     <div className="w-full rounded-2xl bg-white p-5 shadow-sm">
//       <div className="mb-4">
//         <h2 className="text-lg font-bold text-[#333333]">
//           Subject-Wise Attendance
//         </h2>
//         <p className="text-xs text-[#666666]">Subject-Wise Breakdown</p>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-separate border-spacing-0">
//           <thead>
//             <tr className="bg-[#F5F5F5]">
//               <th className="px-4 py-2.5 text-xs font-semibold text-[#333333] rounded-tl-lg whitespace-nowrap">
//                 Subject
//               </th>
//               <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
//                 Total
//               </th>
//               <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
//                 Attended
//               </th>
//               <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
//                 Missed
//               </th>
//               <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
//                 Leave
//               </th>
//               <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
//                 Percentage
//               </th>
//               <th className="px-4 py-2.5 text-xs font-semibold text-[#333333] rounded-tr-lg">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-[#EEEEEE]">
//             {data.map((row, index) => (
//               <tr key={index} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-4 py-3 text-sm text-[#666666] font-medium whitespace-nowrap">
//                   {row.subject}
//                 </td>
//                 <td className="px-4 py-3 text-sm text-[#666666]">
//                   {row.totalClasses}
//                 </td>
//                 <td className="px-4 py-3 text-sm text-[#666666]">
//                   {row.present}
//                 </td>
//                 <td className="px-4 py-3 text-sm text-[#666666]">
//                   {formatNum(row.absent)}
//                 </td>
//                 <td className="px-4 py-3 text-sm text-[#666666]">
//                   {formatNum(row.leave)}
//                 </td>
//                 <td className="px-4 py-3 text-sm text-[#666666]">
//                   {row.percentage}%
//                 </td>
//                 <td className="px-4 py-3 text-sm">
//                   <button
//                     onClick={() =>
//                       // Since we don't have a unique subjectId yet, using subject name as a placeholder slug
//                       router.push(
//                         `/faculty/attendance/${studentId}/subject/${encodeURIComponent(
//                           row.subject
//                         )}`
//                       )
//                     }
//                     className="text-[#333333] cursor-pointer hover:text-emerald-500 font-semibold underline underline-offset-4 decoration-1 text-xs whitespace-nowrap"
//                   >
//                     View Details
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {data.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="px-4 py-8 text-center text-sm text-gray-400 italic"
//                 >
//                   No attendance records found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";

export interface SubjectStat {
  subjectName: string; // Updated to match helper response
  subjectCode: string; // Added Subject Code
  total: number; // Helper returns 'total', not 'totalClasses'
  present: number;
  // absent/leave are not in the current helper return,
  // but we can derive them or update helper.
  // For now, I'll assume they might be passed or we calculate:
  // (In your helper, you only returned present, total, percentage.
  //  I'll stick to rendering what is available or derived).
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

  // Helper to safely format numbers (fallback to 0 if undefined)
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
              {/* Added Subject Code Column */}
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333] rounded-tl-lg whitespace-nowrap">
                Subject Code
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333] whitespace-nowrap">
                Subject Name
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Total
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Attended
              </th>
              {/* Note: 'Missed' and 'Leave' might need calculation if not in payload */}
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333]">
                Missed
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
              // Simple derivation if absent isn't explicitly passed
              const absentCount = row.total - row.present;

              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Subject Code */}
                  <td className="px-4 py-3 text-sm text-[#333333] font-semibold whitespace-nowrap">
                    {row.subjectCode}
                  </td>

                  {/* Subject Name */}
                  <td className="px-4 py-3 text-sm text-[#666666] font-medium whitespace-nowrap">
                    {row.subjectName}
                  </td>

                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {row.total}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {row.present}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {formatNum(absentCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {row.percentage}%
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() =>
                        router.push(
                          `/faculty/attendance/${studentId}/subject/${encodeURIComponent(
                            row.subjectCode, // Using Code is safer for URLs
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
