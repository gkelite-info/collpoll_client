import TableComponent from "@/app/utils/table/table";
import DonutCard from "./Donut";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export default function PlacementScreen() {
  const { collegeEducationType } = useCollegeAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);
  const columns = [
    { title: "Placement Manager", key: "name" },
    { title: "Manager ID", key: "id" },
    { title: "Education Type", key: "education" },
    ...(!isSchool ? [{ title: "Branch", key: "branch" }] : []),
    { title: "Admin", key: "admin" },
  ];

  const tableData = Array(5).fill({
    name: "Aarav Reddy",
    id: "PLC-909",
    education: "B Tech",
    branch: "CSE",
    admin: "Shravani",
  });

  return (
    <div className="space-y-6">
      <TableComponent columns={columns} tableData={tableData} height="50vh" />
    </div>
  );
}