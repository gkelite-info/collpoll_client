import { useState, useEffect } from "react";
import { TableShimmer } from "../shimmer/TableShimmer";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

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
  isLoading?: boolean;
}

const AdditionalDues: React.FC<AdditionalDuesProps> = ({
  financialDues,
  nonFinancialDues,
  excessDues,
  isLoading = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "financial" | "nonFinancial" | "excess"
  >("nonFinancial");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab]);

  const getActiveData = () => {
    if (activeSubTab === "financial") return financialDues;
    if (activeSubTab === "excess") return excessDues;
    return nonFinancialDues;
  };

  const activeData = getActiveData();

  const paginatedData = activeData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
            className={`pb-2 font-medium transition-colors cursor-pointer ${
              activeSubTab === tab.id
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {activeSubTab === "nonFinancial" && (
            <table className="min-w-[1200px] w-full text-sm text-center whitespace-nowrap">
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
                {isLoading ? (
                  <TableShimmer columns={5} />
                ) : paginatedData.length > 0 ? (
                  (paginatedData as NonFinancialDue[]).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.dueDate}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.status}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.remarks}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                {isLoading ? (
                  <TableShimmer columns={3} />
                ) : paginatedData.length > 0 ? (
                  (paginatedData as ExcessDue[]).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ₹ {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeSubTab === "financial" && (
            <table className="min-w-[1200px] w-full text-sm text-center whitespace-nowrap">
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
                  <th className="px-4 py-3">Gateway</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <TableShimmer columns={11} />
                ) : paginatedData.length > 0 ? (
                  (paginatedData as FinancialDue[]).map((item, idx) => (
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
                      <td className="px-4 py-4 text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-4 py-4 text-yellow-500 font-medium">
                        • {item.status}
                      </td>
                      <td className="px-4 py-4 text-blue-800 font-bold italic">
                        {item.paymentGateway}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {item.remarks}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-gray-500">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && activeData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={activeData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AdditionalDues;
