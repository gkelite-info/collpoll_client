export const downloadCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(","), // header row
    ...data.map((row) =>
      headers.map((field) => `"${row[field] ?? ""}"`).join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
