import TableComponent from "@/app/utils/table/table";
import DonutCard from "./Donut";

export default function ParentsScreen() {
  const columns = [
    { title: "Parent Name", key: "parentName" },
    { title: "Linked Student", key: "studentName" },
    { title: "Support Admin", key: "admin" },
    { title: "Education Type", key: "education" },
    { title: "Branch", key: "branch" },
    { title: "Year", key: "year" }, // Requested column
  ];

  const tableData = Array(10).fill({
    parentName: "Aarav Reddy",
    studentName: "Ananya Verma",
    admin: "Shravani",
    education: "B Tech",
    branch: "CSE",
    year: "3rd Year",
  });

  return (
    <div className="space-y-6">
      <TableComponent columns={columns} tableData={tableData} height="50vh" />
    </div>
  );
}