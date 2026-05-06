"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Progress.student"); // Hook

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm max-md:p-0 max-md:bg-transparent max-md:shadow-none max-md:rounded-none">
      <div className="mb-6 flex items-center justify-between max-md:flex-col-reverse max-md:items-stretch max-md:gap-3 max-md:mb-3">
        <h2 className="text-lg font-bold text-[#282828] max-md:text-[14.5px] max-md:font-bold max-md:tracking-tight max-md:text-gray-800">
          {t("Class Progress Overview")}
        </h2>
        <div className="flex justify-end">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#43C17A] px-4 py-2 text-sm font-medium text-white max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:rounded-md shadow-sm"
          >
            {semesterLabel}
            <CaretDownIcon size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 max-md:hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">
                {t("Subject")}
              </th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">
                {t("Attendance")}
              </th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">
                {t("Assignments Done")}
              </th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">
                {t("Quiz")}
              </th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">
                {t("Discussion Forum")}
              </th>
              <th className="px-4 py-4 text-sm font-medium text-[#282828]">
                {t("Progress %")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  {t("No subject progress data available for this semester")}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={`${row.subject}-${index}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-5 text-sm font-medium text-[#282828]">
                    {row.subject}
                  </td>
                  <td className="px-4 py-5 text-sm text-[#525252]">
                    {row.attendance}
                  </td>
                  <td className="px-4 py-5 text-sm text-[#525252]">
                    {row.assignmentsDone}
                  </td>
                  <td className="px-4 py-5 text-sm text-[#525252]">
                    {row.quiz}
                  </td>
                  <td className="px-4 py-5 text-sm text-[#525252]">
                    {row.discussionForum}
                  </td>
                  <td className="px-4 py-5">
                    <ProgressRing value={row.progressPercent} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="hidden max-md:flex flex-col gap-3">
        {rows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-gray-500 border border-gray-100">
            {t("No subject progress data available for this semester")}
          </div>
        ) : (
          rows.map((row, index) => (
            <div
              key={`${row.subject}-${index}`}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 relative"
            >
              <div className="grid grid-cols-[135px_10px_1fr] gap-y-2.5 text-[13px]">
                <div className="font-semibold text-[#282828]">
                  {t("Subject")}
                </div>
                <div className="text-[#282828]">:</div>
                <div className="text-[#525252] truncate pr-14">
                  {row.subject}
                </div>

                <div className="font-semibold text-[#282828]">
                  {t("Attendance")}
                </div>
                <div className="text-[#282828]">:</div>
                <div className="text-[#525252]">{row.attendance}</div>

                <div className="font-semibold text-[#282828]">
                  {t("Assignments Done")}
                </div>
                <div className="text-[#282828]">:</div>
                <div className="text-[#525252]">{row.assignmentsDone}</div>

                <div className="font-semibold text-[#282828]">{t("Quiz")}</div>
                <div className="text-[#282828]">:</div>
                <div className="text-[#525252]">{row.quiz}</div>

                <div className="font-semibold text-[#282828]">
                  {t("Discussion Forum")}
                </div>
                <div className="text-[#282828]">:</div>
                <div className="text-[#525252]">{row.discussionForum}</div>
              </div>

              <div className="absolute right-4 top-4 scale-[0.85] origin-top-right">
                <ProgressRing value={row.progressPercent} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
