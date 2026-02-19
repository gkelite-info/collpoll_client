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

import TableBody from "./tableBody";
import TableHead from "./tableHead";

type Column = {
  title: string;
  key: string;
};

type TableComponentProps = {
  columns: Column[];
  tableData: Record<string, any>[];
  height?: string;
  isLoading?: boolean;
};

export default function TableComponent({
  columns,
  tableData,
  height,
  isLoading=false,
}: TableComponentProps) {
  return (
    <div className="mt-2 w-full">
      <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className={`max-h-[${height || "55vh"}] overflow-auto`}>
          <table className="w-full border-collapse">
            <TableHead columns={columns} />
            <TableBody columns={columns} tableData={tableData} isLoading={isLoading}/>
          </table>
        </div>
      </div>
    </div>
  );
}
