"use client";

import { useMemo } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { ChartBarItem, PlacementStudentRow } from "./mockData";

type ResultsOffersViewProps = {
  companyStats: ChartBarItem[];
  branchStats: ChartBarItem[];
  placedStudents: PlacementStudentRow[];
};

function SimpleBarChart({
  title,
  items,
  showSelect,
}: {
  title: string;
  items: ChartBarItem[];
  showSelect?: boolean;
}) {
  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[15px] font-medium text-[#333333]">{title}</p>
        <div className="flex items-center gap-3">
          {showSelect && (
            <button className="flex items-center gap-1 rounded bg-[#1A3765] px-3 py-1 text-[12px] text-white">
              Infosys <CaretDown size={12} />
            </button>
          )}
          <CaretRight size={16} className="text-[#6B7280]" />
        </div>
      </div>

      <div className="flex h-[140px] items-end gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-[120px] items-end">
              <div
                className="w-8 rounded-t-md bg-gradient-to-b from-[#49C77F] to-[#16284F]"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[#4B5563]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsOffersView({
  companyStats,
  branchStats,
  placedStudents,
}: ResultsOffersViewProps) {
  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "studentId" },
    { title: "Branch", key: "branch" },
    { title: "year", key: "year" },
    { title: "Role", key: "role" },
    { title: "Package", key: "package" },
    { title: "Joining Date", key: "joiningDate" },
    { title: "Status", key: "status" },
    { title: "Offer Letter", key: "offerLetterElement" },
  ];

  const tableData = useMemo(() => {
    return placedStudents.map((student) => ({
      studentName: student.studentName,
      studentId: student.studentId,
      branch: student.branch,
      year: student.year,
      role: student.role,
      package: student.package,
      joiningDate: student.joiningDate,
      status: student.status,
      offerLetterElement: (
        <span className="rounded-full bg-[#E8F8EF] px-3 py-1 font-medium text-[#43C17A]">
          {student.offerLetter || "Offer_Letter"}
        </span>
      ),
    }));
  }, [placedStudents]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart
          title="Company - wise Placement Status"
          items={companyStats}
        />
        <SimpleBarChart
          title=""
          items={branchStats}
          showSelect={true}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[18px] text-[#333333]">
          <span className="font-medium">Infosys</span>
          <span className="text-[#6B7280]">– Placed Students (42 Total)</span>
        </div>

        <div className="flex items-center gap-2 text-[14px] text-[#5C5C5C]">
          <span>Branch :</span>
          <button className="flex items-center gap-1 rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            CSE <CaretDown size={14} />
          </button>
        </div>
      </div>

      <TableComponent columns={columns} tableData={tableData} height="42vh" />
    </div>
  );
}
