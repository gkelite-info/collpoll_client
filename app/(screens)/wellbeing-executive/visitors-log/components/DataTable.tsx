import type { ReactNode } from "react";

export type DataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
};

type DataTableProps = {
  columns: DataTableColumn[];
  rows: Array<Record<string, ReactNode>>;
  minWidth?: string;
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable({ columns, rows, minWidth = "850px" }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead className="bg-[#F5F7FA] text-xs font-bold uppercase tracking-wide text-[#64748B]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-5 py-4 ${alignClasses[column.align ?? "left"]}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white text-sm text-[#16284F]">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="min-h-16 transition-colors hover:bg-[#FAFCFE]">
              {columns.map((column) => (
                <td key={column.key} className={`px-5 py-4 ${alignClasses[column.align ?? "left"]}`}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
