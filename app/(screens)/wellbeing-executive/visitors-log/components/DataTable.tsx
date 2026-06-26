import type { ReactNode } from "react";
import TableShimmer from "@/app/utils/table/tableShimmer";

export type DataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
};

type DataTableProps = {
  columns: DataTableColumn[];
  rows: Array<Record<string, ReactNode>>;
  minWidth?: string;
  isLoading?: boolean;
  shimmerRows?: number;
  emptyMessage?: string;
  emptyDescription?: string;
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable({
  columns,
  rows,
  minWidth = "850px",
  isLoading = false,
  shimmerRows = 5,
  emptyMessage = "No Data Available",
  emptyDescription = "No records found for the selected filters.",
}: DataTableProps) {
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
          {isLoading ? <TableShimmer columnCount={columns.length} rowCount={shimmerRows} /> : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-[170px] px-5 py-8 text-center">
                <p className="text-[15px] font-extrabold text-[#16284F]">{emptyMessage}</p>
                <p className="mt-1 text-[12px] font-medium text-[#94A3B8]">{emptyDescription}</p>
              </td>
            </tr>
          ) : rows.map((row, rowIndex) => (
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
