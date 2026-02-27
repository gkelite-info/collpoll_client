import { useState } from "react";

export interface NonFinancialDue {
  id: string | number;
  department: string;
  category: string;
  dueDate: string;
  status: "Pending" | "Cleared";
  remarks: string;
}

export interface FinancialDue {
  id: string | number;
  amount: number;
  penaltyAmount: number;
  waiverAmount: number;
  totalPayable: number;
  paidAmount: number;
  pendingAmount: number;
  department: string;
  category: string;
  status: string;
  paymentGateway: string;
  remarks: string;
}

export interface ExcessDue {
  id: string | number;
  department: string;
  category: string;
  amount: number;
}

interface AdditionalDuesProps {
  financialDues: FinancialDue[];
  nonFinancialDues: NonFinancialDue[];
  excessDues: ExcessDue[];
}

const AdditionalDues: React.FC<AdditionalDuesProps> = ({
  financialDues,
  nonFinancialDues,
  excessDues,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "financial" | "nonFinancial" | "excess"
  >("nonFinancial");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-8 mb-6">
        {[
          { id: "financial", label: "Financial Dues" },
          { id: "nonFinancial", label: "Non Financial Dues" },
          { id: "excess", label: "Excess Breakdown" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-2 font-medium transition-colors ${
              activeSubTab === tab.id
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {activeSubTab === "nonFinancial" && (
            // <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            //   <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-sm text-center whitespace-nowrap">
              {/* <table className="w-full text-sm text-center whitespace-nowrap"> */}
              <thead className="bg-gray-200/70 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nonFinancialDues.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">
                      {item.department}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 text-gray-600">{item.dueDate}</td>
                    <td className="px-6 py-4 text-gray-600">{item.status}</td>
                    <td className="px-6 py-4 text-gray-500">{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            // </div>
            // </div>
          )}

          {activeSubTab === "excess" && (
            <table className="min-w-[800px] w-full text-sm text-center whitespace-nowrap">
              <thead className="bg-gray-200/70 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Departments</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {excessDues.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">
                      {item.department}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 text-gray-600">
                      ₹ {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeSubTab === "financial" && (
            <table className="min-w-[500px] w-full text-sm text-center whitespace-nowrap">
              {/* <table className="w-full text-sm text-center whitespace-nowrap"> */}
              <thead className="bg-gray-200/70 text-gray-800 font-semibold">
                <tr>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Penalty Amount</th>
                  <th className="px-4 py-3">Waiver Amount</th>
                  <th className="px-4 py-3">Total Payable</th>
                  <th className="px-4 py-3">Paid Amount</th>
                  <th className="px-4 py-3">Pending Amount</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment Gateway</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {financialDues.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-600">{item.amount}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.penaltyAmount}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.waiverAmount}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.totalPayable}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.paidAmount}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.pendingAmount}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.department}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{item.category}</td>
                    <td className="px-4 py-4 text-yellow-500 font-medium">
                      • {item.status}
                    </td>
                    <td className="px-4 py-4 text-blue-800 font-bold italic">
                      {item.paymentGateway}
                    </td>
                    <td className="px-4 py-4 text-gray-500">{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalDues;

// "use client";

// import { fetchAdditionalFeeComponents } from "@/lib/helpers/finance/feeStructure/additionalFee/additionalFeeComponentAPI";
// import { fetchAdditionalFeeStructure } from "@/lib/helpers/finance/feeStructure/additionalFee/additionalFeeStructureAPI";
// import { useEffect, useState } from "react";

// interface AdditionalDuesProps {
//   collegeId: number;
//   collegeEducationId: number;
//   collegeBranchId: number;
//   collegeSessionId: number;
// }

// export default function AdditionalDues({
//   collegeId,
//   collegeEducationId,
//   collegeBranchId,
//   collegeSessionId,
// }: AdditionalDuesProps) {
//   const [dues, setDues] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadDues() {
//       setLoading(true);
//       try {
//         // 1. Fetch the structure to get dates and the structure ID
//         const structure = await fetchAdditionalFeeStructure(
//           collegeId,
//           collegeEducationId,
//           collegeBranchId,
//           collegeSessionId,
//         );

//         if (structure) {
//           // 2. Fetch the actual fee components linked to this structure
//           const components = await fetchAdditionalFeeComponents(
//             structure.additionalFeeStructureId,
//           );

//           // 3. Flatten the data so the table can easily render it
//           const formattedData = components.map((comp) => ({
//             id: comp.additionalFeeComponentId,
//             department: comp.department,
//             category: comp.courseType,
//             amount: Number(comp.amount),
//             dueDate: structure.dueDate,
//             lateFeePerDay: Number(structure.lateFeePerDay),
//             remarks: structure.remarks,
//           }));

//           setDues(formattedData);
//         } else {
//           // No structure found for this student's specific session/branch
//           setDues([]);
//         }
//       } catch (error) {
//         console.error("Failed to load additional dues:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (collegeId && collegeBranchId) {
//       loadDues();
//     }
//   }, [collegeId, collegeEducationId, collegeBranchId, collegeSessionId]);

//   if (loading) {
//     return (
//       <div className="p-5 text-sm text-gray-500 animate-pulse">
//         Loading additional dues...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 font-sans text-gray-800">
//       <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
//         <h2 className="text-gray-800 font-bold text-base mb-4">
//           Additional Dues Breakdown
//         </h2>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-[#f8f9fa] text-gray-500 text-xs uppercase tracking-wider font-bold">
//                 <th className="py-3 px-5">Department</th>
//                 <th className="py-3 px-5">Course Type</th>
//                 <th className="py-3 px-5">Amount</th>
//                 <th className="py-3 px-5">Due Date</th>
//                 <th className="py-3 px-5">Late Fee / Day</th>
//                 <th className="py-3 px-5">Remarks</th>
//               </tr>
//             </thead>
//             <tbody className="text-gray-600 text-sm font-medium">
//               {dues.length > 0 ? (
//                 dues.map((due) => (
//                   <tr
//                     key={due.id}
//                     className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
//                   >
//                     <td className="py-3 px-5">{due.department}</td>
//                     <td className="py-3 px-5">{due.category}</td>
//                     <td className="py-3 px-5 font-bold text-gray-900">
//                       ₹ {due.amount.toLocaleString("en-IN")}
//                     </td>
//                     <td className="py-3 px-5 text-red-500">
//                       {new Date(due.dueDate).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </td>
//                     <td className="py-3 px-5 text-orange-500">
//                       ₹ {due.lateFeePerDay}
//                     </td>
//                     <td
//                       className="py-3 px-5 text-xs text-gray-400 max-w-[200px] truncate"
//                       title={due.remarks}
//                     >
//                       {due.remarks || "-"}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="py-8 text-center text-gray-400">
//                     No additional dues found for this academic session.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
