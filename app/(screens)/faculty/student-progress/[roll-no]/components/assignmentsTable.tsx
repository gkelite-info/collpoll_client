"use client";

import React from "react";

interface Assignment {
  subject: string;
  task: string;
  dueDate: string;
  status: "Pending" | "Completed";
}

const mockAssignments: Assignment[] = [
  {
    subject: "Data Structures",
    task: "Implement Linked List",
    dueDate: "27/10/2025",
    status: "Pending",
  },
  {
    subject: "DBMS",
    task: "ER Diagram Submission",
    dueDate: "27/10/2025",
    status: "Completed",
  },
  {
    subject: "Database Manage..",
    task: "Scheduling Algorithms",
    dueDate: "27/10/2025",
    status: "Completed",
  },
  {
    subject: "Operating Systems",
    task: "HTML Form Design",
    dueDate: "27/10/2025",
    status: "Completed",
  },
  {
    subject: "Software Engineering",
    task: "Inheritance Assignment",
    dueDate: "27/10/2025",
    status: "Completed",
  },
];

export default function AssignmentsTable() {
  return (
    <div className="bg-white p-6 rounded-[20px] shadow-sm w-full h-full font-sans">
      <h2 className="text-[#333333] text-xl font-bold mb-6">Assignments</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-[#8E8E8E] text-sm font-medium">
            <th className="pb-4 font-normal">Subject</th>
            <th className="pb-4 font-normal">Task</th>
            <th className="pb-4 font-normal">Due Date</th>
            <th className="pb-4 font-normal text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {mockAssignments.map((item, idx) => (
            <tr
              key={idx}
              className="text-[#333333] border-b border-gray-50 last:border-0"
            >
              <td className="py-4 pr-4 font-medium">{item.subject}</td>
              <td className="py-4 pr-4 text-[#666666]">{item.task}</td>
              <td className="py-4 pr-4 text-[#666666]">{item.dueDate}</td>
              <td
                className={`py-4 text-right font-medium ${
                  item.status === "Pending"
                    ? "text-[#FF3B30]"
                    : "text-[#4CAF50]"
                }`}
              >
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
