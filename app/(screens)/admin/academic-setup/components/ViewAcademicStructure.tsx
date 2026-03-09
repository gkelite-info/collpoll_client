"use client";

import { useEffect, useState } from "react";
import { fetchAdminBranchesWithDetails } from "@/lib/helpers/admin/academicSetupAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { Pagination } from "./pagination";

export type AcademicViewData = {
  id: string;
  degree: string;
  dept: string;
  branch: string;
  year: any[];
  sections: any[];
};

const ITEMS_PER_PAGE = 10;

export default function ViewAcademicStructure({
  onEdit,
}: {
  onEdit: (row: AcademicViewData) => void;
}) {
  const { adminId, loading: adminLoading } = useAdmin();
  const [data, setData] = useState<AcademicViewData[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { collegeEducationType } = useAdmin();

  useEffect(() => {
    const loadData = async () => {
      if (adminLoading || !adminId) return;
      setIsFetching(true);

      const mappedData = await fetchAdminBranchesWithDetails(adminId);
      setData(mappedData);
      setCurrentPage(1);
      setIsFetching(false);
    };

    loadData();
  }, [adminId, adminLoading]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-[85%] mx-auto bg-white rounded-md border overflow-hidden flex flex-col">
      <div className="min-h-[420px] overflow-y-auto w-full ">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left">Education Type</th>
              <th className="p-4 text-left">{collegeEducationType === "Inter" ? "Group Code" : "Branch Code"}</th>
              <th className="p-4 text-left">Year</th>
              <th className="p-4 text-left">Sections</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isFetching ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400 h-[300px]"
                >
                  <Loader />
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400 h-[300px]"
                >
                  No academic structures found.
                </td>
              </tr>
            ) : (
              currentData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 text-gray-800 transition border-b border-gray-50 last:border-b-0"
                >
                  <td className="p-4">{row.degree}</td>
                  <td className="p-4">{row.dept}</td>

                  <td className="p-4">
                    {!row.year || row.year.length === 0
                      ? "-"
                      : row.year.map((y: any) => y.name || y).join(", ")}
                  </td>

                  <td className="p-4">
                    {!row.sections || row.sections.length === 0
                      ? "-"
                      : row.sections.map((s: any) => s.name || s).join(", ")}
                  </td>

                  <td className="p-4">
                    <button
                      className="text-[#16284F] cursor-pointer hover:text-emerald-500 font-semibold underline transition-colors"
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isFetching && (
        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
