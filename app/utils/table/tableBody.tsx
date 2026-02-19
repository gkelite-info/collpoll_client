import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

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
    <tbody>
      {isLoading ? (
        <tr>
          <td colSpan={columns.length} className="py-10">
            <div className="flex justify-center items-center">
              <Loader />
            </div>
          </td>
        </tr>
      ) :
        (
          tableData.map((row, index) => (
            <tr
              key={index}
              className="border-b border-[#DBDBDB] hover:bg-gray-50 transition-colors text-[#525252]"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2 whitespace-nowrap
                ${col.key === "notes"
                      ? "text-center"
                      : col.key === "actions"
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
        )}
    </tbody>
  );
}
