import { CustomSelect } from "./CustomSelect";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { ExamTableShimmer } from "./ExamTableShimmer";
import { Trash, PencilSimple } from "@phosphor-icons/react";

interface ExamSchedulesTableProps {
  tableEduFilter: number | "All";
  setTableEduFilter: (val: number | "All") => void;
  currentPage: number;
  setCurrentPage: (val: number) => void;
  educations: any[];
  tableLoading: boolean;
  paginatedSchedules: any[];
  totalItems: number;
  itemsPerPage: number;
  onEditSchedule: (schedule: any) => void;
  onDeleteSchedule: (id: number, title: string) => void;
}

export function ExamSchedulesTable({
  tableEduFilter,
  setTableEduFilter,
  currentPage,
  setCurrentPage,
  educations,
  tableLoading,
  paginatedSchedules,
  totalItems,
  itemsPerPage,
  onEditSchedule,
  onDeleteSchedule,
}: ExamSchedulesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800">Created Exam Schedules</h2>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600">Filter:</span>
          <div className="w-[180px]">
            <CustomSelect
              value={tableEduFilter.toString()}
              onChange={(val) => {
                setTableEduFilter(val === "All" ? "All" : Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: "All", label: "All Educations" },
                ...educations.map((edu) => ({
                  value: edu.collegeEducationId,
                  label: edu.collegeEducationType,
                })),
              ]}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F3F4F6]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Schedule Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Exam Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Education
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Scope / Target
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Created At
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-150">
              {tableLoading ? (
                <ExamTableShimmer />
              ) : paginatedSchedules.length > 0 ? (
                paginatedSchedules.map((row, index) => {
                  const hasDates = row.fromDate && row.toDate;
                  const isInter = row.college_education?.collegeEducationType === "Inter";
                  const isSchool = !isInter && row.collegeBranchId === null;

                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-800">
                          {row.scheduleTitle}
                        </div>
                        {hasDates && (
                          <div className="text-[11px] text-gray-500 font-medium">
                            {new Date(row.fromDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            -{" "}
                            {new Date(row.toDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {row.examType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-700">
                          {row.college_education?.collegeEducationType || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {isSchool ? (
                            <span className="text-sm font-bold text-gray-800">
                              {row.academicYear || "All Classes"}
                            </span>
                          ) : isInter ? (
                            <span className="text-sm font-bold text-gray-800">
                              {row.collegeBranchId ? `Group ${row.collegeBranchId}` : "All Groups"}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-gray-800">
                              {row.college_branch?.collegeBranchCode || "All Branches"}
                            </span>
                          )}
                          {!isSchool && !isInter && (
                            <span className="text-xs font-medium text-gray-500">
                              {row.academicYear || "All Years"}
                              {row.college_semester?.collegeSemester ? ` • ${row.college_semester.collegeSemester}` : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {new Date(row.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-[#E6FBEA] text-[#43C17A]">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => onEditSchedule(row)}
                            className="text-gray-500 hover:text-[#43C17A] transition-colors cursor-pointer"
                            title="Edit Schedule"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSchedule(row.collegeExamScheduleId, row.scheduleTitle)}
                            className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Schedule"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No exam schedules created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          alwaysShow={true}
        />
      </div>
    </div>
  );
}
