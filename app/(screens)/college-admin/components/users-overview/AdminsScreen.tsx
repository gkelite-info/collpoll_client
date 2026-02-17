"use client";

import TableComponent from "@/app/utils/table/table";

export default function AdminsScreen() {
  const columns = [
    { title: "Admin Name", key: "name" },
    { title: "Education Type", key: "education" },
    { title: "Branches", key: "branch" },
    { title: "Admin under", key: "adminUnder" },
    { title: "Faculty", key: "faculty" },
    { title: "Student", key: "student" },
    { title: "Parent", key: "parent" },
    { title: "Finance", key: "finance" },
    { title: "Placement", key: "placement" },
    { title: "Action", key: "action" },
  ];

  const data = [
    {
      name: "Aarav Reddy",
      education: "B Tech",
      branch: "CSE, ECE, MECH",
      adminUnder: 3,
      faculty: 85,
      student: 2450,
      parent: 2310,
      finance: 8,
      placement: 5,
      action: <span className="text-gray-600 cursor-pointer">View</span>,
    },
    {
      name: "Priya Sharma",
      education: "Polytechnic",
      branch: "Civil, Electrical",
      adminUnder: 2,
      faculty: 48,
      student: 1200,
      parent: 1100,
      finance: 6,
      placement: 4,
      action: <span className="text-gray-600 cursor-pointer">View</span>,
    },
    {
      name: "Rohit Kumar",
      education: "Degree",
      branch: "B.Sc, B.Com",
      adminUnder: 2,
      faculty: 56,
      student: 980,
      parent: 950,
      finance: 4,
      placement: 3,
      action: <span className="text-gray-600 cursor-pointer">View</span>,
    },
    {
      name: "Ananya Verma",
      education: "Pharmacy",
      branch: "B.Pharm",
      adminUnder: 1,
      faculty: 35,
      student: 620,
      parent: 600,
      finance: 3,
      placement: 2,
      action: <span className="text-gray-600 cursor-pointer">View</span>,
    },
    {
      name: "Sai Teja",
      education: "MBA",
      branch: "Business Management",
      adminUnder: 1,
      faculty: 28,
      student: 450,
      parent: 430,
      finance: 2,
      placement: 2,
      action: <span className="text-gray-600 cursor-pointer">View</span>,
    },
    {
      name: "Arav Reddy",
      education: "MCA",
      branch: "Computer Applications",
      adminUnder: 1,
      faculty: 20,
      student: 380,
      parent: 360,
      finance: 2,
      placement: 1,
      action: <span className="text-gray-600 cursor-pointer">View</span>,
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Admins : 16</h3>
      <TableComponent columns={columns} tableData={data} height="55vh" />
    </div>
  );
}
