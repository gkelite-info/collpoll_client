"use client";

import {
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "../../academic-setup/components/pagination";

import type { AdminStudentProgressRow } from "@/lib/helpers/admin/studentProgress/getAdminStudentProgressSummary";

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
  students: AdminStudentProgressRow[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  detailQuery?: string;
};

const formatScore = (obtained: number, total: number) =>
  total > 0 ? `${obtained}/${total}` : "-";

export function StudentDataTable({
  students,
  searchQuery,
  onSearchQueryChange,
  currentPage,
  totalRecords,
  onPageChange,
  detailQuery = "",
}: StudentDataTableProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

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

      <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="custom-scrollbar min-h-0 flex-1 overflow-auto">
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
                  <th
                    colSpan={tableHeaders.length}
                    className="px-4 pb-3 pt-0 text-left"
                  >
                    <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                      <MagnifyingGlass
                        size={18}
                        className="shrink-0 text-[#43C17A]"
                      />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(event) =>
                          onSearchQueryChange(event.target.value)
                        }
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
                students.map((student) => {
                  const href = `${pathname}/${student.rollNo}${
                    detailQuery ? `?${detailQuery}` : ""
                  }`;

                  return (
                    <tr
                      key={student.studentId}
                      className="text-[#525252] transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-1">
                        <Avatar
                          src={student.profileUrl}
                          alt={student.studentName}
                          size={32}
                        />
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
                        {formatScore(
                          student.quizMarksObtained,
                          student.totalQuizMarks,
                        )}
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
                          href={href}
                          onClick={() => {
                            if (detailQuery) {
                              window.history.replaceState(
                                window.history.state,
                                "",
                                `${pathname}?${detailQuery}`,
                              );
                            }
                          }}
                          className="text-gray-500 transition-colors hover:text-gray-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
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

        <div className="shrink-0">
          <Pagination
            currentPage={currentPage}
            totalItems={totalRecords}
            itemsPerPage={10}
            onPageChange={onPageChange}
            alwaysShow
          />
        </div>
      </div>
    </div>
  );
}
