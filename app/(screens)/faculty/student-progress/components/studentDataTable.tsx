"use client";

import { CaretLeftIcon, CaretRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

import type { FacultyStudentProgressRow } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";

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
    <div className="relative flex h-10 w-10 items-center justify-center">
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
        style={{ color, fontSize: "9px" }}
      >
        {progress}%
      </span>
    </div>
  );
};

type StudentDataTableProps = {
  students: FacultyStudentProgressRow[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
};

const formatScore = (obtained: number, total: number) =>
  total > 0 ? `${obtained}/${total}` : "-";

export function StudentDataTable({
  students,
  searchQuery,
  onSearchQueryChange,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}: StudentDataTableProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableHeaders = [
    "Roll No.",
    "Student Name",
    "Attendance",
    "Assignments Done",
    "Quiz",
    "Discussion Forum",
    "Progress %",
    "Action",
  ];

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    if (isSearchOpen && searchQuery) {
      onSearchQueryChange("");
      return;
    }

    setIsSearchOpen((current) => !current);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="mt-2 flex items-center font-semibold text-[#282828]">
          Class Progress Overview
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="max-h-125 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-10 bg-[#F1F3F2]">
            <tr>
              <th className="px-4 py-2 text-left">
                <button
                  type="button"
                  aria-label={isSearchOpen ? "Close search" : "Open search"}
                  onClick={handleSearchToggle}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#43C17A] text-white shadow-sm transition-colors hover:bg-[#36ab67]"
                >
                  {isSearchOpen ? (
                    <X size={18} weight="bold" />
                  ) : (
                    <MagnifyingGlass size={18} weight="bold" />
                  )}
                </button>
              </th>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-[#282828]"
                >
                  {header}
                </th>
              ))}
            </tr>
            {isSearchOpen ? (
              <tr>
                <th className="px-4 pb-3 pt-0 text-left" />
                <th colSpan={tableHeaders.length} className="px-4 pb-3 pt-0 text-left">
                  <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <MagnifyingGlass size={18} className="shrink-0 text-[#43C17A]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(event) => onSearchQueryChange(event.target.value)}
                      placeholder="Search by roll no or student name"
                      className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </th>
              </tr>
            ) : null}
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {students.length ? (
              students.map((student) => (
                <tr
                  key={student.studentId}
                  className="text-[#525252] transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-1">
                    <div className="h-8 w-8">
                      {student.profileUrl ? (
                        <img
                          className="h-full w-full rounded-full object-cover"
                          src={student.profileUrl}
                          alt={student.studentName}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#E5E7EB] text-xs font-semibold text-[#6B7280]">
                          {student.studentName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm font-medium">
                    {student.rollNo}
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm font-medium">
                    {student.studentName}
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm">
                    {student.attendancePercentage}%
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm">
                    {student.totalAssignments > 0
                      ? `${student.assignmentsDoneCount}/${student.totalAssignments}`
                      : "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm">
                    {formatScore(student.quizMarksObtained, student.totalQuizMarks)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm">
                    {formatScore(
                      student.discussionForumMarksObtained,
                      student.totalDiscussionForumMarks,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm font-medium">
                    <RechartsProgressCircle progress={student.progressPercent} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-1 text-sm font-medium">
                    <Link
                      href={`student-progress/${student.rollNo}`}
                      className="text-gray-500 transition-colors hover:text-gray-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableHeaders.length + 1}
                  className="px-4 py-8 text-center text-sm text-[#6B7280]"
                >
                  {searchQuery
                    ? "No students found for that search."
                    : "No student progress data available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-4 py-4">
            <p className="text-sm text-[#6B7280]">
              Showing page {currentPage} of {totalPages} ({totalRecords} records)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                  currentPage === 1
                    ? "cursor-not-allowed border-gray-200 text-gray-300"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <CaretLeftIcon size={16} weight="bold" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                    currentPage === page
                      ? "bg-[#16284F] text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                  currentPage === totalPages
                    ? "cursor-not-allowed border-gray-200 text-gray-300"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
