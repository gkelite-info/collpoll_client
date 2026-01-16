"use client";

import { useEffect, useState } from "react";

import { AcademicData } from "../page";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";





// const data = [
//   { degree: "B.Tech", dept: "CSE", year: "4 Years", sections: "A, B, C, D" },
//   { degree: "B.Tech", dept: "IT", year: "4 Years", sections: "A, B" },
//   { degree: "B.Sc", dept: "Mathematics", year: "3 Years", sections: "A" },
//   { degree: "MBA", dept: "Finance", year: "2 Years", sections: "A" },
//   { degree: "B.Tech", dept: "CSE", year: "4 Years", sections: "A, B, C, D" },
//   { degree: "B.Tech", dept: "IT", year: "4 Years", sections: "A, B" },
//   { degree: "B.Sc", dept: "Mathematics", year: "3 Years", sections: "A" },
//   { degree: "MBA", dept: "Finance", year: "2 Years", sections: "A" },
// ];

export default function ViewAcademicStructure({
  onEdit,
  adminId,
}: {
  onEdit: (row: AcademicData) => void;
  adminId?: number;
}) {


  const [data, setData] = useState<AcademicData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const degrees = await fetchCollegeDegrees();

      // Map DB → UI shape (NO UI change)
      const mapped: AcademicData[] = degrees.map((d: any) => ({
        degree: d.degreeType,
        dept: d.departments,
        year: JSON.stringify(d.years ?? []),      // JSON as requested
        sections: JSON.stringify(d.sections ?? []), // JSON as requested
      }));

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
              <tr
                key={i}
                className="hover:bg-gray-50 text-gray-800 transition"
              >
                <td className="p-4">{row.degree}</td>
                <td className="p-4">{row.dept}</td>

                <td className="p-4">
                  {row.year === "[]" || !row.year
                    ? "-"
                    : JSON.parse(row.year)
                      .map((y: any) => y.name)
                      .join(", ")}
                </td>

                <td className="p-4">
                  {row.sections === "[]" || !row.sections
                    ? "-"
                    : JSON.parse(row.sections)
                      .map((s: any) => s.name)
                      .join(", ")}
                </td>


                <td
                  className="p-4 text-[#16284F] cursor-pointer underline"
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
// function useUserContext(): { user: any; } {
//   throw new Error("Function not implemented.");
// }

