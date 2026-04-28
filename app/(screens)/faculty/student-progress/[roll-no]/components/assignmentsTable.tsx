"use client";

import React from "react";

export interface Assignment {
  subject: string;
  task: string;
  dueDate: string;
  dueDateInt?: number;
  status: "Pending" | "Incomplete" | "Completed";
}

interface AssignmentsTableProps {
  assignments?: Assignment[];
}

export default function AssignmentsTable({
  assignments,
}: AssignmentsTableProps) {
  const tableAssignments = assignments ?? [];

  return (
    <div className="bg-white p-6 rounded-[20px] shadow-sm w-full h-full overflow-hidden font-sans">
      <h2 className="text-[#333333] text-xl font-bold mb-6">Assignments</h2>
      {tableAssignments.length ? (
        <div className="h-[360px] w-full overflow-y-auto overflow-x-auto pr-1">
          <table className="w-full min-w-0 table-fixed text-left border-collapse">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead>
              <tr className="text-[#8E8E8E] text-sm font-medium">
                <th className="pb-4 pr-4 font-normal">Subject</th>
                <th className="pb-4 pr-4 font-normal">Task</th>
                <th className="pb-4 pr-4 font-normal">Due Date</th>
                <th className="pb-4 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tableAssignments.map((item, idx) => (
                <tr
                  key={`${item.subject}-${item.task}-${idx}`}
                  className="text-[#333333] border-b border-gray-50 last:border-0"
                >
                  <td className="py-4 pr-4 font-medium align-top">
                    <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
                      {item.subject}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-[#666666] align-top">
                    <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
                      {item.task}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-[#666666] align-top">
                    <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
                      {item.dueDate}
                    </div>
                  </td>
                  <td
                    className={`py-4 text-right font-medium align-top ${
                      item.status === "Pending"
                        ? "text-[#FF3B30]"
                        : item.status === "Incomplete"
                          ? "text-[#FF9500]"
                        : "text-[#4CAF50]"
                    }`}
                  >
                    <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
                      {item.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-sm text-[#6B7280]">
          No assignments available for this student.
        </div>
      )}
    </div>
  );
}
