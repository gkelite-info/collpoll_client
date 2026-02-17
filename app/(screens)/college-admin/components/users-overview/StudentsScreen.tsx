"use client";

import {
  ModuleRegistry,
  DonutSeriesModule,
  LegendModule,
} from "ag-charts-community";
import TableComponent from "@/app/utils/table/table";

ModuleRegistry.registerModules([DonutSeriesModule, LegendModule]);

export default function StudentsScreen() {
  const columns = [
    { title: "Student Name", key: "name" },
    { title: "Student ID", key: "id" },
    { title: "Education Type", key: "education" },
    { title: "Branch", key: "branch" },
    { title: "Support Admin", key: "admin" },
    { title: "year", key: "year" },
  ];

  const tableData = Array(6).fill({
    name: "Aarav Reddy",
    id: "ID64287492",
    education: "B Tech",
    branch: "CSE",
    admin: "Shravani",
    year: "3rd Year",
  });

  return (
    <div className="">
      <div className="mt-8">
        <div className="flex items-center gap-6 mb-4">
          <h3 className="font-bold text-gray-800">Total Students : 4,620</h3>
          <div className="flex gap-4 items-center text-sm">
            <span className="text-gray-500">Education Type : <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-md ml-1">B Tech</span></span>
            <span className="text-gray-500">Branch : <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-md ml-1">CSE ▾</span></span>
            <span className="text-gray-500">Year : <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-md ml-1">2026 ▾</span></span>
          </div>
        </div>

        <TableComponent
          columns={columns}
          tableData={tableData}
          height="55vh"
        />

      </div>
    </div>
  );
} 