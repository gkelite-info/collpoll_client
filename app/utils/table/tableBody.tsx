"use client";

import TableShimmer from "./tableShimmer";

type Column = {
  title: string;
  key: string;
};

type TableBodyProps = {
  columns: Column[];
  tableData: Record<string, any>[];
  isLoading?: boolean;
};

export default function TableBody({ columns, tableData, isLoading = false }: TableBodyProps) {
  return (
    <tbody className="bg-white">
      {isLoading ? (
        <TableShimmer columnCount={columns.length} />
      ) : tableData.length > 0 ? (
        tableData.map((row, index) => (
          <tr
            key={index}
            className="border-b border-[#DBDBDB] hover:bg-gray-50 transition-colors text-[#525252]"
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={`px-4 py-2 whitespace-nowrap ${col.key === "notes" || col.key === "actions"
                  ? "text-center"
                  : col.key === "subject"
                    ? "text-left"
                    : "text-center"
                  }`}
              >
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={columns.length}
            className="py-20 text-center text-gray-400 italic font-medium"
          >
            No data available to display.
          </td>
        </tr>
      )}
    </tbody>
  );
}