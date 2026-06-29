// "use client";

// import TableBody from "./tableBody";
// import TableHead from "./tableHead";

// type Column = {
//   title: string;
//   key: string;
// };

// type TableComponentProps = {
//   columns: Column[];
//   tableData: Record<string, any>[];
// };

// export default function TableComponent({ columns, tableData }: TableComponentProps) {
//   return (
//     <div className="mt-2 w-full">
//       <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
//         <table className="w-full border-collapse">
//           <TableHead columns={columns} />
//           <TableBody columns={columns} tableData={tableData} />
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

import { ReactNode } from "react";
import TableBody from "./tableBody";
import TableHead from "./tableHead";

type Column = {
  title: ReactNode;
  key: string;
};

type TableComponentProps = {
  columns: Column[];
  tableData: Record<string, ReactNode>[];
  height?: string;
  isLoading?: boolean;
  stickyHeader?: boolean;
  fillHeight?: boolean;
  tableClassName?: string;
  emptyStateMessage?: string;
};

export default function TableComponent({
  columns,
  tableData,
  height,
  isLoading = false,
  stickyHeader = true,
  fillHeight = false,
  tableClassName = "",
  emptyStateMessage = "No data available.",
}: TableComponentProps) {
  return (
    <div className="mt-2 w-full">
      <div
        className="relative w-full bg-white shadow-md rounded-lg overflow-hidden"
        style={fillHeight && height ? { height } : undefined}
      >
        <div
          className="custom-scrollbar overflow-auto"
          style={
            fillHeight && height
              ? { height, maxHeight: height }
              : { maxHeight: height || "55vh" }
          }
        >
          <table className={`w-full border-collapse ${tableClassName}`}>
            <TableHead columns={columns} stickyHeader={stickyHeader} />
            <TableBody
              columns={columns}
              tableData={tableData}
              isLoading={isLoading}
              showEmptyState={false}
            />
          </table>
        </div>
        {!isLoading && tableData.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 top-11 flex items-center justify-center px-4 text-center text-gray-400">
            <span className="text-sm font-medium italic max-w-lg">
              {emptyStateMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
