import { Check, X } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";
import { finalizePayrollRun } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { formatCompactNumber } from "@/app/utils/numberFormat";

type ViewPayrollRunModalProps = {
  open: boolean;
  onClose: () => void;
  runData: {
    payrollRunId: number;
    payrollMonth: number;
    payrollYear: number;
    status: string;
    displayStatus?: string;
    totalStaff?: number | string;
    totalGrossEarnings?: number | string;
    totalDeductions?: number | string;
    totalNetPay?: number | string;
    totalPayableDays?: number;
    totalHolidays?: number;
    createdAt?: string | null;
    calculatedAt?: string | null;
    updatedAt?: string | null;
    finalizedAt?: string | null;
    paidAt?: string | null;
    paymentCompletedAt?: string | null;
    processor?: { fullName?: string | null } | null;
    paymentProgress?: {
      paidCount: number;
      pendingCount: number;
      payableCount: number;
    };
  };
  onActionSuccess?: () => void;
};

export default function ViewPayrollRunModal({ open, onClose, runData, onActionSuccess }: ViewPayrollRunModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open || !runData) return null;

  const dateStr = `${runData.payrollYear}-${String(runData.payrollMonth).padStart(2, '0')}-01`;
  const monthDisplay = format(new Date(dateStr), 'MMMM yyyy');

  const handleFinalize = async () => {
    setIsProcessing(true);
    try {
      await finalizePayrollRun(runData.payrollRunId);
      toast.success("Payroll run finalized successfully.", { id: "payroll-finalize-success" });
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch {
      toast.error("Unable to finalize payroll run. Please try again.", { id: "payroll-finalize-error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTrackingDate = (value?: string | null) => {
    if (!value) return "Date not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date not available" : format(date, "dd MMM yyyy");
  };

  const normalizedStatus = String(runData.displayStatus || runData.status || "").toLowerCase();
  const hasBeenFinalized = normalizedStatus === "finalized"
    || normalizedStatus === "partially_paid"
    || normalizedStatus === "paid";
  const hasBeenPaid = normalizedStatus === "paid";
  const hasPartialPayments = normalizedStatus === "partially_paid";
  const trackingSteps = [
    {
      title: "Payroll Calculated",
      date: formatTrackingDate(runData.calculatedAt || runData.createdAt),
      actor: runData.processor?.fullName || "HR Manager",
      completed: true,
    },
    {
      title: hasBeenFinalized ? "HR Finalized" : "HR Finalization Pending",
      date: hasBeenFinalized ? formatTrackingDate(runData.finalizedAt || runData.updatedAt) : "Awaiting HR Manager",
      actor: "HR Manager",
      completed: hasBeenFinalized,
    },
    {
      title: hasBeenPaid ? "Payment Completed" : hasPartialPayments ? "Payment In Progress" : "Payment Confirmation Pending",
      date: hasBeenPaid
        ? formatTrackingDate(runData.paidAt || runData.paymentCompletedAt || runData.updatedAt)
        : hasPartialPayments
          ? `${runData.paymentProgress?.paidCount || 0} of ${runData.paymentProgress?.payableCount || 0} employees paid`
          : "Awaiting Accountant",
      actor: "Accountant",
      completed: hasBeenPaid,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="flex max-h-[84vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
          <div className="min-w-0 pr-2">
            <h2 className="truncate text-base font-bold text-gray-800">Payroll Run Details</h2>
            <p className="mt-0.5 truncate text-xs text-gray-500">Summary for {monthDisplay}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X size={20} weight="bold" className="sm:w-[20px] sm:h-[20px] w-4 h-4" />
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  normalizedStatus === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  normalizedStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                  normalizedStatus === 'finalized' ? 'bg-indigo-100 text-indigo-800' :
                  normalizedStatus === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                  normalizedStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {normalizedStatus === "partially_paid" ? "Partially Paid" : normalizedStatus}
                </span>
              </div>
            </div>
            
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Staff Processed</span>
              <div className="mt-2 text-xl font-bold text-gray-800">
                {formatCompactNumber(Number(runData.totalStaff || 0))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Payment Progress</span>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="text-xl font-bold text-gray-800">
                  {runData.paymentProgress?.paidCount || 0} / {runData.paymentProgress?.payableCount || 0} paid
                </div>
                <div className="text-sm font-semibold text-amber-700">
                  {runData.paymentProgress?.pendingCount || 0} pending
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#43C17A] transition-all"
                  style={{
                    width: `${runData.paymentProgress?.payableCount
                      ? Math.min(100, (runData.paymentProgress.paidCount / runData.paymentProgress.payableCount) * 100)
                      : 0}%`,
                  }}
                />
              </div>
            </div>
            
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gross Pay</span>
              <div className="mt-2 text-xl font-bold text-gray-800">
                ₹{formatCompactNumber(Number(runData.totalGrossEarnings || 0))}
              </div>
            </div>
            
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deductions</span>
              <div className="mt-2 text-xl font-bold text-red-600">
                ₹{formatCompactNumber(Number(runData.totalDeductions || 0))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Payable Days / Weekoffs & Holidays</span>
              <div className="mt-2 text-base font-bold text-gray-800">
                {runData.totalPayableDays || 0} / {runData.totalHolidays || 0}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Processed By</span>
              <div className="mt-2 truncate text-base font-bold text-gray-800">
                {runData.processor?.fullName || 'System'}
              </div>
            </div>
            
            <div className="col-span-1 rounded-xl border border-[#43C17A]/20 bg-[#43C17A]/10 p-3 sm:col-span-2">
              <span className="text-xs font-bold text-[#38A166] uppercase tracking-wider">Total Net Payout</span>
              <div className="mt-2 text-2xl font-black text-[#43C17A]">
                ₹{formatCompactNumber(Number(runData.totalNetPay || 0))}
              </div>
            </div>
          </div>

          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-3.5">
            <h3 className="text-sm font-bold text-gray-900">Payment Tracking</h3>
            <div className="mt-4">
              {trackingSteps.map((step, index) => (
                <div key={step.title} className="relative grid grid-cols-[28px_minmax(0,1fr)_auto] gap-2.5 pb-5 last:pb-0">
                  {index < trackingSteps.length - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-14px)] w-px bg-gray-200" />}
                  <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${step.completed ? "bg-[#22C36A] text-white" : "border-2 border-gray-300 bg-white text-gray-300"}`}>
                    {step.completed ? <Check size={14} weight="bold" /> : <span className="h-2 w-2 rounded-full bg-gray-300" />}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className={`text-xs font-bold ${step.completed ? "text-gray-900" : "text-gray-500"}`}>{step.title}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{step.date}</p>
                  </div>
                  <p className="pt-0.5 text-right text-[10px] font-medium text-gray-600">{step.actor}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {(runData.status === 'calculated' || runData.status === 'draft' || runData.status === 'processing') && <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
          {/* Close button intentionally hidden. The top-right X remains available.
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            Close
          </button>
          */}

            <button
              onClick={handleFinalize}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-center"
            >
              {isProcessing ? "Processing..." : "Finalize Run"}
            </button>

          {/* Mark as Paid is intentionally handled outside the HR payroll modal.
          {runData.status === 'finalized' && (
            <button
              onClick={handleMarkPaid}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-center"
            >
              {isProcessing ? "Processing..." : "Mark as Paid"}
            </button>
          )}
          */}
        </div>}
      </div>
    </div>
  );
}
