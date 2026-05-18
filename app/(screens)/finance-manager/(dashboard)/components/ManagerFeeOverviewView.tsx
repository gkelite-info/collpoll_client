"use client";

import TableComponent from "@/app/utils/table/table";
import { CaretDown, CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const rupee = "\u20B9";

const educationOverviewData = [
  ["B.Tech", "2540", "6.2 Cr", "80 L", "7 Cr"],
  ["Degree", "1800", "4.8 Cr", "65 L", "5.45 Cr"],
  ["Inter", "900", "2.1 Cr", "20 L", "2.3 Cr"],
  ["MBA", "320", "1.8 Cr", "10 L", "1.9 Cr"],
  ["MBBS", "450", "2.5 Cr", "35 L", "2.85 Cr"],
];

const branchOverviewData = [
  ["CSE", "2540", "6.2 Cr", "80 L", "7 Cr"],
  ["EEE", "1800", "4.8 Cr", "65 L", "5.45 Cr"],
  ["IT", "900", "2.1 Cr", "20 L", "2.3 Cr"],
  ["Mech", "320", "1.8 Cr", "10 L", "1.9 Cr"],
  ["ECE", "450", "2.5 Cr", "35 L", "2.85 Cr"],
];

const educationColumns = [
  { title: "Education Type", key: "name" },
  { title: "Students", key: "students" },
  { title: "Collected", key: "collected" },
  { title: "Pending", key: "pending" },
  { title: "Total Fees", key: "totalFees" },
];

const branchColumns = [
  { title: "Branch", key: "name" },
  { title: "Students", key: "students" },
  { title: "Collected", key: "collected" },
  { title: "Pending", key: "pending" },
  { title: "Total Fees", key: "totalFees" },
];

function buildRows(rows: string[][]) {
  return rows.map(([name, students, collected, pending, totalFees]) => ({
    name,
    students,
    collected: `${rupee} ${collected}`,
    pending: (
      <span className="font-semibold text-[#FF2525]">
        {rupee} {pending}
      </span>
    ),
    totalFees: (
      <span className="font-semibold text-[#43C17A]">
        {rupee} {totalFees}
      </span>
    ),
  }));
}

function SelectableEducationTable({
  selectedEducation,
  onSelectEducation,
}: {
  selectedEducation: string | null;
  onSelectEducation: (education: string) => void;
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-md font-semibold text-[#282828]">
        Fee Collection Overview
      </h2>
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse overflow-hidden rounded-lg text-center text-sm">
          <thead className="bg-[#ECECEC] text-[#282828]">
            <tr>
              {educationColumns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white text-[#525252]">
            {buildRows(educationOverviewData).map((row) => {
              const isSelected = selectedEducation === row.name;

              return (
                <tr
                  key={row.name as string}
                  className={`cursor-pointer border-b border-[#DBDBDB] transition-colors hover:bg-[#E8F8EF] ${
                    isSelected ? "bg-[#D9F4E4] text-[#282828]" : ""
                  }`}
                  onClick={() => onSelectEducation(row.name as string)}
                >
                  <td className="px-4 py-3 font-semibold">{row.name}</td>
                  <td className="px-4 py-3">{row.students}</td>
                  <td className="px-4 py-3">{row.collected}</td>
                  <td className="px-4 py-3">{row.pending}</td>
                  <td className="px-4 py-3">{row.totalFees}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AcademicYearPill({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm text-[#282828] ${className}`}>
      <span>Academic Year :</span>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#43C17A] px-3 py-1 text-xs font-semibold text-white"
      >
        2026
        <CaretDown size={12} weight="bold" />
      </button>
    </div>
  );
}

function OverviewTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: { title: string; key: string }[];
  rows: Record<string, React.ReactNode>[];
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-md font-semibold text-[#282828]">{title}</h2>
      <TableComponent
        columns={columns}
        tableData={rows}
        height="auto"
        stickyHeader={false}
      />
    </section>
  );
}

export default function ManagerFeeOverviewView() {
  const router = useRouter();
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);
  const selectedBranchTitle = selectedEducation
    ? `${selectedEducation} Fee Collection Overview`
    : "";
  const branchRows = useMemo(() => buildRows(branchOverviewData), []);

  return (
    <div className="w-full p-2 pb-7 lg:pb-5">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to Finance Manager Dashboard"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push("/finance-manager")}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <AcademicYearPill />
      </div>

      <div className="flex flex-col gap-4">
        <SelectableEducationTable
          selectedEducation={selectedEducation}
          onSelectEducation={setSelectedEducation}
        />
        {selectedEducation && (
          <OverviewTable
            title={selectedBranchTitle}
            columns={branchColumns}
            rows={branchRows}
          />
        )}
      </div>
    </div>
  );
}
