"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("Payments.student"); // Hook
  const [activeSubTab, setActiveSubTab] = useState<
    "financial" | "nonFinancial" | "excess"
  >("nonFinancial");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 overflow-x-auto scrollbar-hide pb-2 px-2">
        {[
          { id: "financial", label: t("Financial Dues") },
          { id: "nonFinancial", label: t("Non Financial Dues") },
          { id: "excess", label: t("Excess Breakdown") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-2 font-medium cursor-pointer transition-colors whitespace-nowrap text-sm md:text-base ${
              activeSubTab === tab.id
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-md:bg-transparent max-md:border-none max-md:shadow-none">
        {activeSubTab === "nonFinancial" && (
          <>
            <div className="hidden md:block overflow-x-auto rounded-xl">
              <table className="min-w-[1200px] w-full text-sm text-center whitespace-nowrap">
                <thead className="bg-gray-200/70 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">{t("Department")}</th>
                    <th className="px-6 py-4">{t("Category")}</th>
                    <th className="px-6 py-4">{t("Due Date")}</th>
                    <th className="px-6 py-4">{t("Status")}</th>
                    <th className="px-6 py-4">{t("Remarks")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nonFinancialDues.map((item, idx) => (
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
                      <td className="px-6 py-4 text-gray-600">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === "Cleared" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {nonFinancialDues.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="font-bold text-gray-800 text-[14px]">
                        {item.category}
                      </h4>
                      <p className="text-xs text-gray-500">{item.department}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${item.status === "Cleared" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{t("Due Date")}:</span>
                    <span className="font-medium text-gray-700">
                      {item.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{t("Remarks")}:</span>
                    <span className="text-gray-700 truncate max-w-[60%] text-right">
                      {item.remarks || "-"}
                    </span>
                  </div>
                </div>
              ))}
              {nonFinancialDues.length === 0 && (
                <p className="text-center text-gray-500 text-sm p-4">
                  {t("No Data Available")}
                </p>
              )}
            </div>
          </>
        )}

        {activeSubTab === "excess" && (
          <>
            <div className="hidden md:block overflow-x-auto rounded-xl">
              <table className="min-w-[800px] w-full text-sm text-center whitespace-nowrap">
                <thead className="bg-gray-200/70 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">{t("Departments")}</th>
                    <th className="px-6 py-4">{t("Category")}</th>
                    <th className="px-6 py-4">{t("Amount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {excessDues.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">
                        ₹ {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {excessDues.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
                >
                  <div className="flex flex-col">
                    <h4 className="font-bold text-gray-800 text-[14px]">
                      {item.category}
                    </h4>
                    <p className="text-xs text-gray-500">{item.department}</p>
                  </div>
                  <span className="text-emerald-600 font-bold text-lg">
                    ₹{item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {excessDues.length === 0 && (
                <p className="text-center text-gray-500 text-sm p-4">
                  {t("No Data Available")}
                </p>
              )}
            </div>
          </>
        )}

        {activeSubTab === "financial" && (
          <>
            <div className="hidden md:block overflow-x-auto rounded-xl">
              <table className="min-w-[500px] w-full text-sm text-center whitespace-nowrap">
                <thead className="bg-gray-200/70 text-gray-800 font-semibold">
                  <tr>
                    <th className="px-4 py-3">{t("Amount")}</th>
                    <th className="px-4 py-3">{t("Penalty Amount")}</th>
                    <th className="px-4 py-3">{t("Waiver Amount")}</th>
                    <th className="px-4 py-3">{t("Total Payable")}</th>
                    <th className="px-4 py-3">{t("Paid Amount")}</th>
                    <th className="px-4 py-3">{t("Pending Amount")}</th>
                    <th className="px-4 py-3">{t("Department")}</th>
                    <th className="px-4 py-3">{t("Category")}</th>
                    <th className="px-4 py-3">{t("Status")}</th>
                    <th className="px-4 py-3">{t("Payment Gateway")}</th>
                    <th className="px-4 py-3">{t("Remarks")}</th>
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
                      <td className="px-4 py-4 text-gray-600 font-semibold">
                        {item.totalPayable}
                      </td>
                      <td className="px-4 py-4 text-emerald-600">
                        {item.paidAmount}
                      </td>
                      <td className="px-4 py-4 text-red-500">
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
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {financialDues.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2.5"
                >
                  <div className="flex justify-between items-start border-b border-gray-50 pb-2 mb-1">
                    <div>
                      <h4 className="font-bold text-gray-800 text-[14px]">
                        {item.category}
                      </h4>
                      <p className="text-xs text-gray-500">{item.department}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700">
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-gray-400">{t("Amount")}</span>
                      <span className="font-medium text-gray-700">
                        ₹{item.amount}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400">{t("Penalty")}</span>
                      <span className="font-medium text-gray-700">
                        ₹{item.penaltyAmount}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400">{t("Paid")}</span>
                      <span className="font-semibold text-emerald-600">
                        ₹{item.paidAmount}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400">{t("Pending")}</span>
                      <span className="font-semibold text-red-500">
                        ₹{item.pendingAmount}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-1 text-[11px]">
                    <span className="font-bold text-gray-700">
                      {t("Total Payable")}
                    </span>
                    <span className="font-black text-gray-900 text-[14px]">
                      ₹{item.totalPayable}
                    </span>
                  </div>
                </div>
              ))}
              {financialDues.length === 0 && (
                <p className="text-center text-gray-500 text-sm p-4">
                  {t("No Data Available")}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdditionalDues;
