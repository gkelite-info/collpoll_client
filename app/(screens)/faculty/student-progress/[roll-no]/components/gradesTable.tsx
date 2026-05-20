"use client";

export interface GradeEntry {
  subject: string;
  grade: string;
  improvement: "Improved" | "Declining";
}

interface GradesTableProps {
  grades?: GradeEntry[];
}

export default function GradesTable({ grades }: GradesTableProps) {
  const defaultGrades: GradeEntry[] = [
    { subject: "Java Programming", grade: "A", improvement: "Improved" },
    { subject: "Data Structures", grade: "B", improvement: "Declining" },
    { subject: "Database Management", grade: "A", improvement: "Improved" },
    { subject: "Operating Systems", grade: "A", improvement: "Improved" },
    { subject: "Web Development", grade: "B", improvement: "Declining" },
  ];

  const tableGrades = grades?.length ? grades : defaultGrades;

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[20px] shadow-sm w-full h-full font-sans flex flex-col">
      <h2 className="text-[#333333] text-[16px] md:text-xl font-bold mb-4 md:mb-6">
        Grades
      </h2>
      <div className="w-full flex-1 overflow-x-auto scrollbar-hide">
        {tableGrades.length ? (
          <table className="w-full min-w-[320px] text-left border-collapse">
            <thead>
              <tr className="text-[#8E8E8E] text-[12px] md:text-sm font-medium">
                <th className="pb-3 md:pb-4 font-normal">Subject</th>
                <th className="pb-3 md:pb-4 font-normal">Grade</th>
                <th className="pb-3 md:pb-4 font-normal text-right">
                  Improvement
                </th>
              </tr>
            </thead>
            <tbody className="text-[12px] md:text-sm">
              {tableGrades.map((item, idx) => (
                <tr
                  key={`${item.subject}-${item.grade}-${idx}`}
                  className="text-[#333333] border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td
                    className="py-3 md:py-4 pr-3 md:pr-4 font-medium truncate max-w-[140px] md:max-w-none"
                    title={item.subject}
                  >
                    {item.subject}
                  </td>
                  <td className="py-3 md:py-4 pr-3 md:pr-4 font-bold text-[#333333]">
                    {item.grade}
                  </td>
                  <td
                    className={`py-3 md:py-4 text-right font-medium whitespace-nowrap ${
                      item.improvement === "Improved"
                        ? "text-[#4CAF50]"
                        : "text-[#FF3B30]"
                    }`}
                  >
                    {item.improvement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-[13px] md:text-sm text-[#6B7280] text-center">
            No grades available for this student.
          </div>
        )}
      </div>
    </div>
  );
}
