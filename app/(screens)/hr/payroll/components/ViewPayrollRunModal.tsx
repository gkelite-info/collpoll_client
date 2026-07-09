import { X } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";
import { finalizePayrollRun, markPayrollPaid } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { formatCompactNumber } from "@/app/utils/numberFormat";

type ViewPayrollRunModalProps = {
  open: boolean;
  onClose: () => void;
  runData: any;
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
    } catch (err: any) {
      toast.error("Unable to finalize payroll run. Please try again.", { id: "payroll-finalize-error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    setIsProcessing(true);
    try {
      await markPayrollPaid(runData.payrollRunId);
      toast.success("Payroll marked as paid.", { id: "payroll-paid-success" });
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Unable to mark payroll as paid. Please try again.", { id: "payroll-paid-error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Payroll Run Details</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">Summary for {monthDisplay}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X size={20} weight="bold" className="sm:w-[20px] sm:h-[20px] w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  runData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  runData.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  runData.status === 'finalized' ? 'bg-indigo-100 text-indigo-800' :
                  runData.status === 'paid' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {runData.status}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Staff Processed</span>
              <div className="mt-2 text-2xl font-bold text-gray-800">
                {formatCompactNumber(Number(runData.totalStaff || 0))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gross Pay</span>
              <div className="mt-2 text-2xl font-bold text-gray-800">
                ₹{formatCompactNumber(Number(runData.totalGrossEarnings || 0))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deductions</span>
              <div className="mt-2 text-2xl font-bold text-red-600">
                ₹{formatCompactNumber(Number(runData.totalDeductions || 0))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Payable Days / Weekoffs & Holidays</span>
              <div className="mt-2 text-lg sm:text-xl font-bold text-gray-800">
                {runData.totalPayableDays || 0} / {runData.totalHolidays || 0}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Processed By</span>
              <div className="mt-2 text-lg font-bold text-gray-800 truncate">
                {runData.processor?.fullName || 'System'}
              </div>
            </div>
            
            <div className="bg-[#43C17A]/10 rounded-xl p-4 border border-[#43C17A]/20 col-span-1 sm:col-span-2">
              <span className="text-xs font-bold text-[#38A166] uppercase tracking-wider">Total Net Payout</span>
              <div className="mt-2 text-3xl font-black text-[#43C17A]">
                ₹{formatCompactNumber(Number(runData.totalNetPay || 0))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            Close
          </button>

          {(runData.status === 'calculated' || runData.status === 'draft' || runData.status === 'processing') && (
            <button
              onClick={handleFinalize}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-center"
            >
              {isProcessing ? "Processing..." : "Finalize Run"}
            </button>
          )}
          
          {runData.status === 'finalized' && (
            <button
              onClick={handleMarkPaid}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-center"
            >
              {isProcessing ? "Processing..." : "Mark as Paid"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
