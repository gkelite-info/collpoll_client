"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import React from "react";
import { PieChart, Pie, Cell } from "recharts";

import Link from "next/link";
import { detailedStudentsData } from "../data";

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return "#43C17A";
  if (progress >= 80) return "#5DC98A";
  if (progress >= 60) return "#F9A825";
  if (progress >= 40) return "#FFBB70";
  return "#FF3B30";
};

export const RechartsProgressCircle: React.FC<{ progress: number }> = ({
  progress,
}) => {
  const color = getProgressColor(progress);
  const data = [
    { name: "Progress", value: progress },
    { name: "Remaining", value: 100 - progress },
  ];

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <PieChart width={40} height={40}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={450}
          innerRadius={14}
          outerRadius={18}
          stroke="none"
        >
          <Cell key="progress" fill={color} />
          <Cell key="remaining" fill="#E5E7EB" />
        </Pie>
      </PieChart>
      <span
        className="absolute font-bold"
        style={{ color: color, fontSize: "9px" }}
      >
        {progress}%
      </span>
    </div>
  );
};

export function StudentDataTable() {
  const tableHeaders = [
    "Roll No.",
    "Student Name",
    "Attendance",
    "Internal Marks",
    "Assignments Done",
    "Progress %",
    "Action",
  ];

  const getAvatarUrl = (seed: number) =>
    `https://i.pravatar.cc/150?img=${seed}`;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-start mb-2">
        <h2 className="mt-2 flex items-center text-[#282828] font-semibold">
          Class Progress Overview
        </h2>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 max-h-[500px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-[#F1F3F2] z-10">
            <tr>
              <th className="px-4 py-2 text-left">
                <div className="bg-[#43C17A] p-1.5 rounded-full inline-flex items-center justify-center">
                  <MagnifyingGlass size={16} color="white" weight="bold" />
                </div>
              </th>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-semibold text-[#282828] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {detailedStudentsData.map((student) => (
              <tr
                key={student.rollNo}
                className="hover:bg-gray-50 transition-colors text-[#525252]"
              >
                <td className="px-4 py-1 whitespace-nowrap">
                  <div className="h-8 w-8">
                    <img
                      className="rounded-full object-cover h-full w-full"
                      src={getAvatarUrl(student.avatarSeed)}
                      alt={student.studentName}
                    />
                  </div>
                </td>

                <td className="px-4 py-1 whitespace-nowrap text-sm font-medium">
                  {student.rollNo}
                </td>

                <td className="px-4 py-1 whitespace-nowrap text-sm font-medium">
                  {student.studentName}
                </td>

                <td className="px-4 py-1 whitespace-nowrap text-sm">
                  {student.attendancePercent}%
                </td>

                <td className="px-4 py-1 whitespace-nowrap text-sm">
                  {student.internalMarks}
                </td>

                <td className="px-4 py-1 whitespace-nowrap text-sm">
                  {student.assignmentsDone}
                </td>

                <td className="px-4 py-1 whitespace-nowrap text-sm font-medium">
                  <RechartsProgressCircle progress={student.progressPercent} />
                </td>

                <td className="px-4 py-1 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`student-progress/${student.rollNo}`}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
