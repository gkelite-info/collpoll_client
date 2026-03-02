"use client";

import { useEffect, useState } from "react";
import { fetchAdminBranchesWithDetails } from "@/lib/helpers/admin/academicSetupAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

export type AcademicViewData = {
  id: string;
  degree: string;
  dept: string;
  branch: string;
  year: any[];
  sections: any[];
};

export default function ViewAcademicStructure({
  onEdit,
}: {
  onEdit: (row: AcademicViewData) => void;
}) {
  const { adminId, loading: adminLoading } = useAdmin();
  const [data, setData] = useState<AcademicViewData[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (adminLoading || !adminId) return;
      setIsFetching(true);

      const mappedData = await fetchAdminBranchesWithDetails(adminId);
      setData(mappedData);

      setIsFetching(false);
    };

    loadData();
  }, [adminId, adminLoading]);

  return (
    <div className="w-[80%] mx-auto bg-white rounded-md shadow-lg overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left">Degree</th>
              <th className="p-4 text-left">Department Code</th>
              <th className="p-4 text-left">Year</th>
              <th className="p-4 text-left">Sections</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  Loading branches...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No academic structures found.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 text-gray-800 transition"
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
    </div>
  );
}
