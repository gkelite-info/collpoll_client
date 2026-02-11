type Column = {
  title: string;
  key: string;
};

type TableHeadProps = {
  columns: Column[];
};

export default function TableHead({ columns }: TableHeadProps) {
  return (
    <thead className="bg-[#ECECEC] text-[#282828] text-regular sticky top-0 z-10">
      <tr>
        {columns.map((col) => (
          <th
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
            {col.title}
          </th>
        ))}
      </tr>
    </thead>
  );
}
