// "use client";

// import { useState } from "react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";
// import TableComponent from "@/app/utils/table/table";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function BranchWiseCollection() {
//   const [year, setYear] = useState("2026");

//   const router = useRouter();
//   const searchParams = useSearchParams();

//   /* ================== CHART DATA ================== */

//   const chartData = [
//     { branch: "CSE", collected: 60000, pending: 30000 },
//     { branch: "EEE", collected: 90000, pending: 30000 },
//     { branch: "IT", collected: 70000, pending: 20000 },
//     { branch: "ME", collected: 110000, pending: 20000 },
//     { branch: "CIVIL", collected: 50000, pending: 10000 },
//     { branch: "ECE", collected: 75000, pending: 15000 },
//   ];

//   /* ================== MINI BRANCH CARDS ================== */

//   const branches = ["CSE", "EEE", "IT", "ME", "CIVIL", "ECE"];

//   /* ================== TABLE DATA ================== */

//   const tableColumns = [
//     { title: "Branch", key: "branch" },
//     { title: "Collected", key: "collected" },
//     { title: "Pending", key: "pending" },
//     { title: "Total Fees", key: "totalFees" },
//     { title: "Action", key: "action" },
//   ];

//   const tableData = branches.map((branch) => ({
//     branch,
//     collected: "₹ 1,20,00,000",
//     pending: "₹ 30,000",
//     totalFees: "₹ 1,50,00,000",
//     action: (
//       <span
//         className="text-[#22A55D] cursor-pointer hover:underline

//       "
//         onClick={() => {
//   const params = new URLSearchParams(searchParams.toString());
//   params.set("view", "yearWiseCollection");
//   router.push(`?${params.toString()}`);
//         }}
//       >
//         View Years
//       </span>
//     ),
//   }));

//   return (
//     <div className="p-4 w-full space-y-6">
//       {/* ================= BREADCRUMB ================= */}
//       <h2 className="text-lg font-semibold text-[#282828]">
//         B-Tech <span className="text-gray-400">→</span> Branch Wise Collection
//       </h2>

//       {/* ================= FEE COLLECTION CARD ================= */}
//       <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <h3 className="font-semibold text-[#282828]">
//             Fee Collection Trends
//           </h3>

//           <div className="flex items-center gap-6">
//             {/* Academic Year */}
//             <div className="flex items-center gap-2 text-sm">
//               <span>Academic Year</span>
//               <select
//                 value={year}
//                 onChange={(e) => setYear(e.target.value)}
//                 className="bg-[#EDE7F6] px-3 py-1 rounded-lg outline-none"
//               >
//                 <option>2026</option>
//                 <option>2025</option>
//                 <option>2024</option>
//               </select>
//             </div>

//             {/* Legend */}
//             <div className="flex items-center gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-[#43C17A] rounded-sm" />
//                 Collected
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-[#B9E6CD] rounded-sm" />
//                 Pending
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ================= CHART ================= */}
//         <div className="w-full h-[300px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={chartData}>
//               <XAxis dataKey="branch" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="collected" stackId="a" fill="#43C17A" />
//               <Bar dataKey="pending" stackId="a" fill="#B9E6CD" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* ================= MINI CARDS ================= */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//           {branches.map((branch) => (
//             <div key={branch} className="bg-[#F8F8F8] rounded-lg p-3 space-y-2">
//               <p className="text-[#22A55D] font-semibold text-sm">{branch}</p>

//               <div className="bg-[#1E2A4A] text-white text-xs px-3 py-2 rounded-md">
//                 ₹ 1.2 Cr
//               </div>

//               <div className="text-xs space-y-1">
//                 <div className="flex justify-between">
//                   <span>₹ 1,20,000</span>
//                   <span className="text-[#22A55D]">Collected</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>₹ 30L</span>
//                   <span className="text-[#FF0000]">Pending</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ================= BRANCH OVERVIEW ================= */}
//       <div className="space-y-4">
//         <h3 className="font-semibold text-[#282828]">Branch Overview</h3>

//         <TableComponent columns={tableColumns} tableData={tableData} />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import TableComponent from "@/app/utils/table/table";
import { useRouter, useSearchParams } from "next/navigation";

// ✅ ADDED: Custom bar shape
const CustomBar = (props: any) => {
  const { x, y, width, height, payload, dataKey } = props;

  // Determine if this segment should be rounded
  const shouldRoundTop =
    (dataKey === "pending" && payload.pending > 0) ||
    (dataKey === "collected" && payload.pending === 0);

  const radius = 8;

  const path = shouldRoundTop
    ? `
      M ${x}, ${y + height}
      L ${x}, ${y + radius}
      Q ${x}, ${y} ${x + radius}, ${y}
      L ${x + width - radius}, ${y}
      Q ${x + width}, ${y} ${x + width}, ${y + radius}
      L ${x + width}, ${y + height}
      Z
    `
    : `
      M ${x}, ${y}
      L ${x + width}, ${y}
      L ${x + width}, ${y + height}
      L ${x}, ${y + height}
      Z
    `;

  return <path d={path} fill={props.fill} />;
};

export default function BranchWiseCollection() {
  const [year, setYear] = useState("2026");
  const router = useRouter();
  const searchParams = useSearchParams();

  const chartData = [
    { branch: "CSE", collected: 60000, pending: 30000 },
    { branch: "EEE", collected: 90000, pending: 30000 },
    { branch: "IT", collected: 70000, pending: 0 },
    { branch: "ME", collected: 110000, pending: 20000 },
    { branch: "CIVIL", collected: 50000, pending: 10000 },
    { branch: "ECE", collected: 75000, pending: 15000 },
  ];

  const branches = ["CSE", "EEE", "IT", "ME", "CIVIL", "ECE"];

  const tableColumns = [
    { title: "Branch", key: "branch" },
    { title: "Collected", key: "collected" },
    { title: "Pending", key: "pending" },
    { title: "Total Fees", key: "totalFees" },
    { title: "Action", key: "action" },
  ];

  const tableData = branches.map((branch) => ({
    branch,
    collected: "₹ 1,20,00,000",
    pending: "₹ 30,000",
    totalFees: "₹ 1,50,00,000",
    action: (
      <span
        className="text-[#22A55D] cursor-pointer hover:underline"
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("view", "yearWiseCollection");
          router.push(`?${params.toString()}`);
        }}
      >
        View Years
      </span>
    ),
  }));

  const formatYAxis = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}Cr`;
    }
    return `${(value / 100000).toFixed(1)}L`;
  };

  return (
    <div className="p-4 w-full space-y-6">
      <h2 className="text-lg font-semibold text-[#43C17A]">
        B-Tech <span className="text-gray-400">→</span> Branch Wise Collection
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-[#282828] text-lg">
            Fee Collection Trends
          </h3>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#282828] font-bold text-md">
                Academic Year
              </span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-[#EDE7F6] text-[#6C20CA] font-medium px-1.5 py-0.5 rounded-full outline-none"
              >
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-[#282828]">
                <span className="w-3 h-3 bg-[#43C17A] rounded-xs" />
                Collected
              </div>
              <div className="flex items-center gap-2 text-[#282828]">
                <span className="w-3 h-3 bg-[#B9E6CD] rounded-xs" />
                Pending
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[300px] focus:outline-none">
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="border border-white"
          >
            <BarChart
              data={chartData}
              barCategoryGap="25%"
              margin={{ left: -1, bottom: 0 }}
            >
              <CartesianGrid stroke="#CBCBCB" vertical={false} />
              <XAxis dataKey="branch" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                tick={{ dy: -4 }}
                tickMargin={10}
              />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              {/* <Bar dataKey="collected" stackId="a" fill="#43C17A" /> */}
              <Bar
                dataKey="collected"
                stackId="a"
                fill="#43C17A"
                shape={<CustomBar />}
              />
              <Bar
                dataKey="pending"
                stackId="a"
                fill="#C7F2DA"
                activeBar={false}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {branches.map((branch) => (
            <div key={branch} className="bg-[#EAEAEA] rounded-lg p-3 space-y-2">
              <p className="text-[#43C17A] font-semibold text-sm">{branch}</p>

              <div className="bg-[#16284F] text-white font-semibold text-xs px-3 w-full border py-2 rounded-md">
                ₹ 1.2 Cr
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#16284F] font-semibold text-xs">
                    ₹ 1,20,000
                  </span>
                  <span className="text-[#22A55D]">Collected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#16284F] font-semibold">₹ 30L</span>
                  <span className="text-[#FF0000]">Pending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-[#282828]">Branch Overview</h3>

        <TableComponent columns={tableColumns} tableData={tableData} />
      </div>
    </div>
  );
}
