"use client";

import { FileSearchIcon } from "@phosphor-icons/react/dist/ssr";
import React from "react";

import { PieChart, Pie, Cell } from "recharts";

export interface DetailedStudent {
  rollNo: string;
  studentName: string;

  avatarSeed: number;
  attendancePercent: number;
  internalMarks: string;
  assignmentsDone: string;
  progressPercent: number;
}

const detailedStudentsData: DetailedStudent[] = [
  {
    rollNo: "21CSE001",
    studentName: "Rohan Patel",
    avatarSeed: 1,
    attendancePercent: 92,
    internalMarks: "45/50",
    assignmentsDone: "5/5",
    progressPercent: 97,
  },
  {
    rollNo: "21CSE002",
    studentName: "Aarav Mehta",
    avatarSeed: 2,
    attendancePercent: 67,
    internalMarks: "45/50",
    assignmentsDone: "4/5",
    progressPercent: 95,
  },
  {
    rollNo: "21CSE003",
    studentName: "Karthik Reddy",
    avatarSeed: 3,
    attendancePercent: 55,
    internalMarks: "45/50",
    assignmentsDone: "3/5",
    progressPercent: 60,
  },
  {
    rollNo: "21CSE004",
    studentName: "Sneha Reddy",
    avatarSeed: 4,
    attendancePercent: 76,
    internalMarks: "45/50",
    assignmentsDone: "4/5",
    progressPercent: 90,
  },
  {
    rollNo: "21CSE005",
    studentName: "Ananya Sharma",
    avatarSeed: 5,
    attendancePercent: 87,
    internalMarks: "45/50",
    assignmentsDone: "5/5",
    progressPercent: 90,
  },
  {
    rollNo: "21CSE006",
    studentName: "Neha Sinha",
    avatarSeed: 6,
    attendancePercent: 45,
    internalMarks: "45/50",
    assignmentsDone: "3/5",
    progressPercent: 60,
  },
  {
    rollNo: "21CSE007",
    studentName: "Arjun Rao",
    avatarSeed: 7,
    attendancePercent: 50,
    internalMarks: "10/50",
    assignmentsDone: "1/5",
    progressPercent: 20,
  },
];

interface RechartsProgressCircleProps {
  progress: number;
}

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return "#43C17A";
  if (progress >= 80) return "#5DC98A";
  if (progress >= 60) return "#F9A825";
  if (progress >= 40) return "#FFBB70";
  return "#FF3B30";
};

export const RechartsProgressCircle: React.FC<RechartsProgressCircleProps> = ({
  progress,
}) => {
  const color = getProgressColor(progress);
  const data = [
    { name: "Progress", value: progress },
    { name: "Remaining", value: 100 - progress },
  ];

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <PieChart width={56} height={56}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={450}
          innerRadius={18}
          outerRadius={25}
          paddingAngle={0}
          stroke="none"
        >
          <Cell key="progress" fill={color} />
          <Cell key="remaining" fill="#E5E7EB" />
        </Pie>
      </PieChart>

      <span
        className="absolute text-xs font-bold"
        style={{ color: color, fontSize: "10px" }}
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
      <div className="flex items-center justify-start mb-4">
        <h2 className="mt-3  flex items-center text-[#282828] font-semibold">
          Class Progress Overview
        </h2>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className={`px-4 py-4 text-left text-sm font-semibold text-gray-500 whitespace-nowrap`}
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
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      <img
                        className="rounded-full object-cover h-full w-full"
                        src={getAvatarUrl(student.avatarSeed)}
                        alt={student.studentName}
                        width={40}
                        height={40}
                      />
                    </div>
                    {student.rollNo}
                  </div>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                  {student.studentName}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {student.attendancePercent}%
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {student.internalMarks}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {student.assignmentsDone}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <RechartsProgressCircle progress={student.progressPercent} />
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                    View
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
