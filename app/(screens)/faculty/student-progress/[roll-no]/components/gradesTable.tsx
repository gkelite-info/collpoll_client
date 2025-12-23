"use client";

import React from "react";

interface GradeEntry {
  subject: string;
  grade: string;
  improvement: "Improved" | "Declining";
}

const mockGrades: GradeEntry[] = [
  { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
  { subject: "Data Structures", grade: "B", improvement: "Declining" },
  { subject: "Database Manage..", grade: "A", improvement: "Improved" },
  { subject: "Operating Systems", grade: "A", improvement: "Improved" },
  { subject: "Web Development", grade: "B", improvement: "Declining" },
];

export default function GradesTable() {
  return (
    <div className="bg-white p-6 rounded-[20px] shadow-sm w-full h-full font-sans">
      <h2 className="text-[#333333] text-xl font-bold mb-6">Grades</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-[#8E8E8E] text-sm font-medium">
            <th className="pb-4 font-normal">Subject</th>
            <th className="pb-4 font-normal">Grade</th>
            <th className="pb-4 font-normal text-right">Improvement</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {mockGrades.map((item, idx) => (
            <tr
              key={idx}
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
  );
}
