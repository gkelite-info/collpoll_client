"use client";

import { FeePlan } from "./paymentConfirm";

export type StripePaymentStatus =
  | "succeeded"
  | "processing"
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "canceled"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "disputed";

export interface FeeSummaryItem {
  id: number;
  paidAmount: number;
  paymentMode: string;
  entity: string;
  paidOn: string;
  status: StripePaymentStatus;
  comments: string;
}

interface AcademicFeesProps {
  plan: FeePlan | null;
  summary: FeeSummaryItem[];
  onPay: () => void;
}

const AcademicFees: React.FC<AcademicFeesProps> = ({
  plan,
  summary,
  onPay,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(val);

  if (!plan)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Active Fee Plan
        </h2>
        <div className="bg-emerald-50 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {plan.programName}
            </h3>
            <p className="text-gray-500 text-sm">{plan.type}</p>
          </div>
          <span className="text-gray-500 font-medium">{plan.academicYear}</span>
        </div>

        <div className="space-y-3 w-full py-2 px-4">
          <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-200">
            <span className="text-gray-700 font-medium">
              Opening Balance Due
            </span>
            <span className="text-gray-600">
              {formatCurrency(plan.openingBalance)}
            </span>
          </div>

          {plan.components.length > 0 ? (
            plan.components.map((comp, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">{comp.label}</span>
                <span className="text-gray-600">
                  {formatCurrency(comp.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic text-sm py-1">
              No fee details found
            </div>
          )}

          {plan.gstAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                GST {plan.gstPercent > 0 ? `(${plan.gstPercent}%)` : ""}
              </span>
              <span className="text-gray-600">
                {formatCurrency(plan.gstAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-dashed pt-2 mt-2">
            <span className="text-gray-800 font-bold">Total Payable</span>
            <span className="text-emerald-500 font-bold">
              {formatCurrency(plan.totalPayable)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Paid Till Now</span>
            <span className="text-emerald-500 font-medium">
              - {formatCurrency(plan.paidTillNow)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
            <span className="text-gray-800 font-bold">Pending Amount</span>
            <span className="text-red-500 font-bold text-lg">
              {formatCurrency(plan.pendingAmount)}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onPay}
            disabled={plan.pendingAmount <= 0}
            className={`
                px-8 py-1 text-lg rounded-md font-medium shadow-sm transition-colors flex items-center gap-2
                ${
                  plan.pendingAmount > 0
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
            `}
          >
            {plan.pendingAmount > 0 ? "Pay Now" : "Fully Paid"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold text-gray-800 text-lg">
            {plan.programName}
          </h3>
          <span className="text-emerald-500 text-sm font-medium">
            Fee Summary
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-gray-700 bg-gray-200/70 font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Paid Amount</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Paid On</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg">Comments</th>
              </tr>
            </thead>
            <tbody>
              {summary.length > 0 ? (
                summary.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-4 py-4 text-emerald-500 font-bold">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.paymentMode}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{item.entity}</td>
                    <td className="px-4 py-4 text-gray-600">{item.paidOn}</td>
                    <td className="px-4 py-4 text-gray-600">{item.status}</td>
                    <td className="px-4 py-4 text-gray-600">{item.comments}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcademicFees;
