import React from "react";
import { CollegeRowData } from "../data";

interface CollegeOverviewTableProps {
  data: CollegeRowData[];
}

const CollegeOverviewTable: React.FC<CollegeOverviewTableProps> = ({
  data,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[18px] font-bold text-[#2d2d2d]">College Overview</h2>
      <div className="bg-[#fffafa] rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
          <table className="w-full text-[13px] text-left relative">
            <thead className="text-[#3aa460] bg-[#eef8f0] sticky top-0 z-10">
              <tr>
                {[
                  "College Name",
                  "Code",
                  "Total",
                  "Active",
                  "Inactive",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 font-bold uppercase text-[11px] tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[#5c5c5c] divide-y divide-gray-100/50">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2 font-medium">{row.name}</td>
                  <td className="px-4 py-2">{row.code}</td>
                  <td className="px-4 py-2">{row.totalUsers}</td>
                  <td className="px-4 py-2">{row.activeUsers}</td>
                  <td className="px-4 py-2">{row.inactiveUsers}</td>
                  <td className="px-4 py-2">
                    <button className="text-[#3aa460] font-bold hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollegeOverviewTable;
