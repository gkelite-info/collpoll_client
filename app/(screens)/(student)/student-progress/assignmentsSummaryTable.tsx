"use client";

import { CaretDownIcon } from "@phosphor-icons/react";

export type SubjectProgressRow = {
  subject: string;
  subjectKey: string;
  attendance: string;
  assignmentsDone: string;
  quiz: string;
  discussionForum: string;
  progressPercent: number;
};

type SubjectProgressTableProps = {
  rows: SubjectProgressRow[];
  semesterLabel: string;
};

function ProgressRing({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const ringColor =
    safeValue >= 60 ? "#F59E0B" : safeValue > 0 ? "#FF3B30" : "#D9DDE3";

  return (
    <div
      className="relative flex h-14 w-14 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${ringColor} ${safeValue * 3.6}deg, #E5E7EB 0deg)`,
      }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[12px] font-bold text-[#FF5A4A]">
        {safeValue}%
      </div>
    </div>
  );
}

export function AssignmentsSummaryTable({
  rows,
  semesterLabel,
}: SubjectProgressTableProps) {
  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#282828]">Class Progress Overview</h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-[#43C17A] px-4 py-2 text-sm font-medium text-white"
        >
          {semesterLabel}
          <CaretDownIcon size={16} weight="bold" />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">Subject</th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">Attendance</th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">Assignments Done</th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">Quiz</th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">Discussion Forum</th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">Progress %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  No subject progress data available for this semester.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.subject}-${index}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-5 text-sm font-medium text-[#282828]">
                    {row.subject}
                  </td>
                  <td className="px-4 py-5 text-sm text-[#525252]">{row.attendance}</td>
                  <td className="px-4 py-5 text-sm text-[#525252]">{row.assignmentsDone}</td>
                  <td className="px-4 py-5 text-sm text-[#525252]">{row.quiz}</td>
                  <td className="px-4 py-5 text-sm text-[#525252]">{row.discussionForum}</td>
                  <td className="px-4 py-5">
                    <ProgressRing value={row.progressPercent} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
