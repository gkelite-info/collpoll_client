export interface FeePlan {
  programName: string;
  type: string;
  academicYear: string;
  openingBalance: number;
  applicableFees: number;
  scholarship: number;
  totalPayable: number;
  components?: { name: string; amount: number }[];
  gstAmount?: number;
  paidTillNow: number;
  pendingAmount: number;
}

export interface FeeSummaryItem {
  id: string | number;
  paidAmount: number;
  paymentMode: string;
  entity: string;
  paidOn: string;
  status: "Success" | "Pending" | "Failure";
  comments: string;
}

interface AcademicFeesProps {
  plan: FeePlan;
  summary: FeeSummaryItem[];
}

const AcademicFees: React.FC<AcademicFeesProps> = ({ plan, summary }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(val);

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

        <div className="space-y-3 px-6 w-full">
          <div className="flex justify-between items-center ">
            <span className="text-gray-700 font-medium">
              Opening Balance Due
            </span>
            <span className="text-gray-600">
              {formatCurrency(plan.openingBalance)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">
              Base Applicable Fees
            </span>
            <span className="text-gray-600 font-semibold">
              {formatCurrency(plan.applicableFees)}
            </span>
          </div>

          {plan.components && plan.components.length > 0 && (
            <div className="pl-5 border-l-4 border-emerald-200 bg-gray-50/50 py-3 pr-4 rounded-r-md space-y-2 my-2">
              {plan.components.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 font-medium">
                    • {comp.name}
                  </span>
                  <span className="text-gray-600">
                    {formatCurrency(comp.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {plan.gstAmount !== undefined && (
            <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-[15px]">
              <span className="text-gray-600 font-medium">GST (18%)</span>
              <span className="text-gray-600">
                {formatCurrency(plan.gstAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-700 font-medium">Scholarship</span>
            <span className="text-gray-600">
              {formatCurrency(plan.scholarship)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-dashed pt-3">
            <span className="text-gray-800 font-bold">Total Payable</span>
            <span className="text-emerald-500 font-bold">
              {formatCurrency(plan.totalPayable)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Paid Till Now</span>
            <span className="text-emerald-500 font-medium">
              {formatCurrency(plan.paidTillNow)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-800 font-bold text-lg">
              Pending Amount
            </span>
            <span className="text-red-500 font-bold text-lg">
              {formatCurrency(plan.pendingAmount)}
            </span>
          </div>
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
