"use client";

export interface GradeEntry {
  subject: string;
  grade: string;
  improvement: "Improved" | "Declining";
}

export default function GradesTable({ grades = [] }: { grades?: GradeEntry[] }) {

  return (
    <div className="flex h-full w-full flex-col rounded-2xl bg-white p-4 font-sans shadow-sm md:rounded-[20px] md:p-6">
      <h2 className="mb-4 text-base font-bold text-[#333333] md:mb-6 md:text-xl">Grades</h2>
      {grades.length ? (
      <div className="w-full flex-1 overflow-x-auto scrollbar-hide">
      <table className="w-full min-w-[320px] border-collapse text-left">
        <thead>
          <tr className="text-[#8E8E8E] text-sm font-medium">
            <th className="pb-4 font-normal">Subject</th>
            <th className="pb-4 font-normal">Grade</th>
            <th className="pb-4 font-normal text-right">Improvement</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {grades.map((item, idx) => (
            <tr
              key={`${item.subject}-${item.grade}-${idx}`}
              className="text-[#333333] border-b border-gray-50 last:border-0"
            >
              <td className="py-4 pr-4 font-medium">{item.subject}</td>
              <td className="py-4 pr-4 font-bold text-[#333333]">
                {item.grade}
              </td>
              <td
                className={`py-4 text-right font-medium ${
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
      </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-[#6B7280]">
          No grades available for this student.
        </div>
      )}
    </div>
  );
}
