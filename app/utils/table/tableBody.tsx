type Column = {
  title: string;
  key: string;
};

type TableBodyProps = {
  columns: Column[];
  tableData: Record<string, any>[];
};

export default function TableBody({ columns, tableData }: TableBodyProps) {
  return (
    <tbody>
      {tableData.length === 0 ? (
        <tr>
          <td
            colSpan={columns.length}
            className="text-center py-10 text-gray-500"
          >
            No records available
          </td>
        </tr>
      ) : (
        tableData.map((row, index) => (
          <tr
            key={index}
            className="border-b border-[#DBDBDB] hover:bg-gray-50 transition-colors text-[#525252]"
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={`px-4 py-2 whitespace-nowrap
                ${
                  col.key === "notes"
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
