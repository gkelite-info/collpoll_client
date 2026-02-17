// "use client";

// import TableComponent from "@/app/utils/table/table";
// import { useState } from "react";
// import AdminModal from "./AdminDetailsModel";

// export default function AdminsScreen() {
//   const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
//   const columns = [
//     { title: "Admin Name", key: "name" },
//     { title: "Education Type", key: "education" },
//     { title: "Branches", key: "branch" },
//     { title: "Admin under", key: "adminUnder" },
//     { title: "Faculty", key: "faculty" },
//     { title: "Student", key: "student" },
//     { title: "Parent", key: "parent" },
//     { title: "Finance", key: "finance" },
//     { title: "Placement", key: "placement" },
//     { title: "Action", key: "action" },
//   ];

//   const data = [
//     {
//       name: "Aarav Reddy",
//       education: "B Tech",
//       branch: "CSE, ECE, MECH",
//       adminUnder: 3,
//       faculty: 85,
//       student: 2450,
//       parent: 2310,
//       finance: 8,
//       placement: 5,
//       action: <span className="text-gray-600 cursor-pointer">View</span>,
//     },
//     {
//       name: "Priya Sharma",
//       education: "Polytechnic",
//       branch: "Civil, Electrical",
//       adminUnder: 2,
//       faculty: 48,
//       student: 1200,
//       parent: 1100,
//       finance: 6,
//       placement: 4,
//       action: <span className="text-gray-600 cursor-pointer">View</span>,
//     },
//     {
//       name: "Rohit Kumar",
//       education: "Degree",
//       branch: "B.Sc, B.Com",
//       adminUnder: 2,
//       faculty: 56,
//       student: 980,
//       parent: 950,
//       finance: 4,
//       placement: 3,
//       action: <span className="text-gray-600 cursor-pointer">View</span>,
//     },
//     {
//       name: "Ananya Verma",
//       education: "Pharmacy",
//       branch: "B.Pharm",
//       adminUnder: 1,
//       faculty: 35,
//       student: 620,
//       parent: 600,
//       finance: 3,
//       placement: 2,
//       action: <span className="text-gray-600 cursor-pointer">View</span>,
//     },
//     {
//       name: "Sai Teja",
//       education: "MBA",
//       branch: "Business Management",
//       adminUnder: 1,
//       faculty: 28,
//       student: 450,
//       parent: 430,
//       finance: 2,
//       placement: 2,
//       action: <span className="text-gray-600 cursor-pointer">View</span>,
//     },
//     {
//       name: "Arav Reddy",
//       education: "MCA",
//       branch: "Computer Applications",
//       adminUnder: 1,
//       faculty: 20,
//       student: 380,
//       parent: 360,
//       finance: 2,
//       placement: 1,
//       action: <span className="text-gray-600 cursor-pointer">View</span>,
//     },
//   ];

//   const handleView = (adminData: any) => {
//     setSelectedAdmin(adminData);
//   };

//   return (
//     // <div>
//     //   <h3 className="text-lg font-semibold mb-4">Admins : 16</h3>
//     //   <TableComponent columns={columns} tableData={data} height="55vh" />
//     // </div>
//     <div className="relative">
//       <h3 className="text-lg font-semibold mb-4">Admins : 16</h3>
//       <TableComponent columns={columns} tableData={data} height="55vh" />

//       {/* MODAL COMPONENT */}
//       {selectedAdmin && (
//         <AdminModal
//           admin={selectedAdmin}
//           onClose={() => setSelectedAdmin(null)}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import TableComponent from "@/app/utils/table/table";
import { useState } from "react";
import AdminModal from "./AdminDetailsModel"; // Ensure this filename matches exactly

export default function AdminsScreen() {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  // 1. Define the handler BEFORE the data array so it can be used inside it
  const handleView = (adminData: any) => {
    console.log("Opening modal for:", adminData.name); // Debug log
    setSelectedAdmin(adminData);
  };

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
      action: (
        <button 
          // 3. Trigger the function and pass the FULL details required for the modal
          onClick={() => handleView({
            name: "Aarav Reddy",
            id: "90653978",
            email: "aarav.reddy@abc.edu.in",
            phone: "+91 98765 43210",
            gender: "Male",
            education: "B.Tech",
            branch: "CSE, ECE, MECH",
            faculty: 85,
            student: 2450,
            parent: 2310,
            finance: 8,
            placement: 5
          })}
          className="text-gray-600 font-medium cursor-pointer hover:text-green-600 transition-colors"
        >
          View
        </button>
      ),
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
      action: (
        <button 
          onClick={() => handleView({
            name: "Priya Sharma",
            id: "8821902",
            email: "priya.sharma@abc.edu.in",
            phone: "+91 91234 56789",
            gender: "Female",
            education: "Polytechnic",
            branch: "Civil, Electrical",
            faculty: 48,
            student: 1200,
            parent: 1100,
            finance: 6,
            placement: 4
          })}
          className="text-gray-600 font-medium cursor-pointer hover:text-green-600 transition-colors"
        >
          View
        </button>
      ),
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
      action: (
        <button 
           onClick={() => handleView({
            name: "Rohit Kumar",
            id: "1234567",
            email: "rohit.kumar@abc.edu.in",
            phone: "+91 88888 77777",
            gender: "Male",
            education: "Degree",
            branch: "B.Sc, B.Com",
            faculty: 56,
            student: 980,
            parent: 950,
            finance: 4,
            placement: 3
           })}
           className="text-gray-600 font-medium cursor-pointer hover:text-green-600 transition-colors"
        >
            View
        </button>
      ),
    },
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
      action: (
        <button 
          // 3. Trigger the function and pass the FULL details required for the modal
          onClick={() => handleView({
            name: "Aarav Reddy",
            id: "90653978",
            email: "aarav.reddy@abc.edu.in",
            phone: "+91 98765 43210",
            gender: "Male",
            education: "B.Tech",
            branch: "CSE, ECE, MECH",
            faculty: 85,
            student: 2450,
            parent: 2310,
            finance: 8,
            placement: 5
          })}
          className="text-gray-600 font-medium cursor-pointer hover:text-green-600 transition-colors"
        >
          View
        </button>
      ),
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
      action: (
        <button 
          onClick={() => handleView({
            name: "Priya Sharma",
            id: "8821902",
            email: "priya.sharma@abc.edu.in",
            phone: "+91 91234 56789",
            gender: "Female",
            education: "Polytechnic",
            branch: "Civil, Electrical",
            faculty: 48,
            student: 1200,
            parent: 1100,
            finance: 6,
            placement: 4
          })}
          className="text-gray-600 font-medium cursor-pointer hover:text-green-600 transition-colors"
        >
          View
        </button>
      ),
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
      action: (
        <button 
           onClick={() => handleView({
            name: "Rohit Kumar",
            id: "1234567",
            email: "rohit.kumar@abc.edu.in",
            phone: "+91 88888 77777",
            gender: "Male",
            education: "Degree",
            branch: "B.Sc, B.Com",
            faculty: 56,
            student: 980,
            parent: 950,
            finance: 4,
            placement: 3
           })}
           className="text-gray-600 font-medium cursor-pointer hover:text-green-600 transition-colors"
        >
            View
        </button>
      ),
    },
  ];

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold mb-4">Admins : 16</h3>
      <TableComponent columns={columns} tableData={data} height="55vh" />
      {selectedAdmin && (
        <AdminModal
          admin={selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
        />
      )}
    </div>
  );
}