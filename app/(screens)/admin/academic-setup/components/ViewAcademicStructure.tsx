"use client";

import { fetchDegrees } from "@/lib/helpers/admin/academicSetupAPI";
import { useEffect, useState } from "react";

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
  const [data, setData] = useState<AcademicViewData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const degrees = await fetchDegrees();

      const mapped: AcademicViewData[] = degrees.map((d: any) => {
        const parseVal = (val: any) => {
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch (e) {
              return [];
            }
          }
          return Array.isArray(val) ? val : [];
        };

        return {
          id: d.collegeDegreeId,
          degree: d.degreeType,
          branch: d.branch,
          dept: d.departments,
          year: parseVal(d.years),
          sections: parseVal(d.sections),
        };
      });

      setData(mapped);
    };

    loadData();
  }, []);

  return (
    <div className="w-[80%] mx-auto bg-white rounded-md shadow-lg overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left">Degree</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Year</th>
              <th className="p-4 text-left">Sections</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 text-gray-800 transition">
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

                <td
                  className="p-4 text-[#16284F] hover:text-emerald-500 cursor-pointer underline"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
