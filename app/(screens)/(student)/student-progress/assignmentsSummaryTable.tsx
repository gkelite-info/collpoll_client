"use client";

import { CaretDownIcon } from "@phosphor-icons/react";

export type Assignment = {
  assignmentId?: number;
  subject: string;
  title: string;
  dueDate: string;
  marks: string;
  feedback: string;
};

type AssignmentsSummaryTableProps = {
  assignments: Assignment[];
  title: string;
  semesterLabel: string;
};

export function AssignmentsSummaryTable({
  assignments,
  title,
  semesterLabel,
}: AssignmentsSummaryTableProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900 font-bold text-lg">
          {title}
        </h2>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          {semesterLabel}
          <CaretDownIcon size={16} weight="bold" />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-4 px-6 text-gray-700 font-medium text-sm">
                Subject
              </th>
              <th className="py-4 px-6 text-gray-700 font-medium text-sm">
                Assignment Title
              </th>
              <th className="py-4 px-6 text-gray-700 font-medium text-sm">
                Due Date
              </th>
              <th className="py-4 px-6 text-gray-700 font-medium text-sm">
                Marks
              </th>
              <th className="py-4 px-6 text-gray-700 font-medium text-sm">
                Faculty Feedback
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {assignments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 px-6 text-center text-gray-500 text-sm"
                >
                  No assignments found for this semester.
                </td>
              </tr>
            ) : (
              assignments.map((item, index) => (
                <tr
                  key={item.assignmentId ?? `${item.subject}-${index}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                <td className="py-4 px-6 text-gray-600 text-sm font-medium">
                  {item.subject}
                </td>
                <td className="py-4 px-6 text-gray-500 text-sm">
                  {item.title}
                </td>
                <td className="py-4 px-6 text-gray-500 text-sm">
                  {item.dueDate}
                </td>
                <td className="py-4 px-6 text-gray-600 text-sm font-medium">
                  {item.marks}
                </td>
                <td className="py-4 px-6 text-gray-500 text-sm">
                  {item.feedback}
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
