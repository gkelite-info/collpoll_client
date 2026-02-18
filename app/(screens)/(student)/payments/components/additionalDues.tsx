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
