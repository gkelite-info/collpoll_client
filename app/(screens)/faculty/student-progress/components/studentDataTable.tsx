import {
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { FacultyStudentProgressRow } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { StudentTableSkeleton } from "../shimmer/StudentTableSkeleton";

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
    <div className="relative flex h-8 w-8 md:h-10 md:w-10 items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={450}
            innerRadius="70%"
            outerRadius="100%"
            stroke="none"
          >
            <Cell key="progress" fill={color} />
            <Cell key="remaining" fill="#E5E7EB" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <span className="absolute font-bold" style={{ color, fontSize: "8px" }}>
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
  totalRecords: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (items: number) => void;
  isLoading?: boolean;
};

const formatScore = (obtained: number, total: number) =>
  total > 0 ? `${obtained}/${total}` : "-";

const hasAnyProgressData = (student: FacultyStudentProgressRow) =>
  student.conductedClasses > 0 ||
  student.totalAssignments > 0 ||
  student.totalQuizMarks > 0 ||
  student.totalDiscussionForumMarks > 0;

export function StudentDataTable({
  students,
  searchQuery,
  onSearchQueryChange,
  currentPage,
  totalRecords,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  isLoading = false,
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
        <h2 className="mt-2 flex items-center font-bold md:font-semibold text-[#282828] text-[15px] md:text-base">
          Class Progress Overview
        </h2>
      </div>

      <div className="rounded-xl md:rounded-2xl border border-gray-100 bg-white shadow-sm md:shadow-xl flex flex-col">
        <div className="w-full overflow-x-auto rounded-t-xl md:rounded-t-2xl">
          <div className="min-w-[800px] lg:min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F1F3F2]">
                <tr>
                  <th className="px-4 py-2.5 text-left w-14">
                    <button
                      type="button"
                      aria-label={isSearchOpen ? "Close search" : "Open search"}
                      onClick={handleSearchToggle}
                      className="inline-flex h-8 w-8 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-full bg-[#43C17A] text-white shadow-sm transition-colors hover:bg-[#36ab67]"
                    >
                      {isSearchOpen ? (
                        <X
                          size={16}
                          className="md:w-[18px] md:h-[18px]"
                          weight="bold"
                        />
                      ) : (
                        <MagnifyingGlass
                          size={16}
                          className="md:w-[18px] md:h-[18px]"
                          weight="bold"
                        />
                      )}
                    </button>
                  </th>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="whitespace-nowrap px-3 md:px-4 py-2.5 text-left text-[12px] md:text-sm font-semibold text-[#282828]"
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
                      <div className="flex w-full max-w-sm md:max-w-md items-center gap-2 rounded-full border border-gray-200 bg-white px-3 md:px-4 py-1.5 md:py-2 shadow-sm">
                        <MagnifyingGlass
                          size={16}
                          className="md:w-[18px] md:h-[18px] shrink-0 text-[#43C17A]"
                        />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(event) =>
                            onSearchQueryChange(event.target.value)
                          }
                          placeholder="Search roll no or name"
                          className="w-full bg-transparent text-xs md:text-sm text-[#282828] outline-none placeholder:text-[#9CA3AF]"
                        />
                      </div>
                    </th>
                  </tr>
                ) : null}
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <StudentTableSkeleton rowsPerPage={rowsPerPage} />
                ) : students.length ? (
                  students.map((student) => (
                    <tr
                      key={student.studentId}
                      className="text-[#525252] transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-2">
                        <div className="h-8 w-8">
                          <Avatar
                            src={student.profileUrl}
                            size={32}
                            alt={student.studentName}
                          />
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium">
                        {student.rollNo}
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium">
                        {student.studentName}
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
                        {student.conductedClasses > 0
                          ? `${student.attendancePercentage}%`
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
                        {student.totalAssignments > 0
                          ? `${student.assignmentsDoneCount}/${student.totalAssignments}`
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
                        {formatScore(
                          student.quizMarksObtained,
                          student.totalQuizMarks,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
                        {formatScore(
                          student.discussionForumMarksObtained,
                          student.totalDiscussionForumMarks,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium">
                        {hasAnyProgressData(student) ? (
                          <RechartsProgressCircle
                            progress={student.progressPercent}
                          />
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium">
                        <Link
                          href={`student-progress/${student.rollNo}`}
                          className="text-gray-500 transition-colors hover:text-gray-800 border px-3 py-1 rounded-md"
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
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalRecords}
          itemsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          itemsPerPageOptions={[5, 10, 20, 50]}
          onItemsPerPageChange={onRowsPerPageChange}
          roundedBottom="rounded-b-2xl"
          alwaysShow
        />
      </div>
    </div>
  );
}
