import TableComponent from "@/app/utils/table/table";
import DonutCard from "./Donut";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export default function FacultyScreen() {
  const { collegeEducationType } = useCollegeAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);
  const columns = [
    { title: "Faculty Name", key: "name" },
    { title: "Faculty ID", key: "id" },
    { title: "Education Type", key: "education" },
    ...(!isSchool ? [{ title: "Branch", key: "branch" }] : []),
    { title: "Subjects Handled", key: "subjects" },
    { title: "Support Admin", key: "admin" }, // Requested values: Shravani, Deekshitha
  ];

  const tableData = [
    { name: "Aarav Reddy", id: "102357", education: "B Tech", branch: "CSE", subjects: "AI, ML, DS", admin: "Shravani" },
    { name: "Priya Sharma", id: "102358", education: "B Tech", branch: "CSE", subjects: "AI, ML, DS", admin: "Deekshitha" },
    { name: "Rohit Kumar", id: "102359", education: "B Tech", branch: "CSE", subjects: "AI, ML, DS", admin: "Saraswathi" },
  ];

  return (
    <div className="space-y-6">
      <TableComponent columns={columns} tableData={tableData} height="50vh" />
    </div>
  );
}