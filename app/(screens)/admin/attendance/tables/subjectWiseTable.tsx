import { useRouter } from "next/navigation";

interface SubjectRow {
  subject: string;
  subjectId: string;
  total: number;
  attended: number;
  missed: number;
  leave: number;
  percentage: string;
}

export default function SubjectWiseAttendance({
  studentId,
}: {
  studentId: string;
}) {
  const router = useRouter();

  const attendanceData: SubjectRow[] = [
    {
      subject: "Data Structures",
      subjectId: "DS101",
      total: 30,
      attended: 28,
      missed: 2,
      leave: 1,
      percentage: "80%",
    },
    {
      subject: "OOPs using C++",
      subjectId: "OOP201",
      total: 30,
      attended: 25,
      missed: 5,
      leave: 1,
      percentage: "70%",
    },
    {
      subject: "Discrete Math",
      subjectId: "DM301",
      total: 30,
      attended: 22,
      missed: 8,
      leave: 2,
      percentage: "80%",
    },
    {
      subject: "Computer Organization",
      subjectId: "CO401",
      total: 30,
      attended: 30,
      missed: 0,
      leave: 0,
      percentage: "60%",
    },
    {
      subject: "Digital Logic",
      subjectId: "DL501",
      total: 30,
      attended: 28,
      missed: 2,
      leave: 1,
      percentage: "90%",
    },
  ];

  const formatNum = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div className="w-full rounded-[16px] bg-white p-5 shadow-sm">
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
              <th className="px-4 py-2.5 text-xs font-semibold text-[#333333] rounded-tl-lg whitespace-nowrap">
                Subject
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
            {attendanceData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-[#666666] font-medium whitespace-nowrap">
                  {row.subject}
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {row.total}
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {row.attended}
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {formatNum(row.missed)}
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {formatNum(row.leave)}
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {row.percentage}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() =>
                      router.push(
                        `/faculty/attendance/${studentId}/subject/${row.subjectId}`
                      )
                    }
                    className="text-[#333333] font-semibold underline underline-offset-4 decoration-1 text-xs hover:text-black whitespace-nowrap"
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
  );
}
