import React, { useEffect, useState } from "react";
import { getPayrollEntryDetails } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { ModalDetailShimmer } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import { formatExactNumber } from "@/app/utils/numberFormat";

interface ViewEntryModalProps {
  entryId: number | null;
  onClose: () => void;
}

export default function ViewEntryModal({ entryId, onClose }: ViewEntryModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!entryId) return;
    
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getPayrollEntryDetails(entryId);
        
        // Parse the exact breakdown of leaves, holidays, weekoffs
        if (result && result.payroll_runs) {
          const month = result.payroll_runs.payrollMonth;
          const year = result.payroll_runs.payrollYear;
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);
          
          const allHolidays = result.holidaysInMonth || [];
          const explicitWeekoffDates = new Set(
            allHolidays
              .filter((h: any) => h.holidayType === 'weekly_off')
              .map((h: any) => h.holidayDate)
          );
          
          const holidayDates = new Set(
            allHolidays
              .filter((h: any) => h.holidayType !== 'weekly_off')
              .map((h: any) => h.holidayDate)
          );
          
          let actualHolidays = 0;
          let actualWeekoffs = 0;
          const userLeavesMap = new Map();
          const userLeaveCounts: Record<string, number> = {};
          const leaveDatesByType: Record<string, string[]> = {};
          
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            const isWeekoff = explicitWeekoffDates.has(dateStr) || (explicitWeekoffDates.size === 0 && d.getDay() === 0);
            const isHoliday = holidayDates.has(dateStr);
            
            if (isWeekoff) actualWeekoffs++;
            else if (isHoliday) actualHolidays++;
          }
          
          (result.leavesTaken || []).forEach((l: any) => {
            for (let d = new Date(l.leaveFromDate); d <= new Date(l.leaveToDate); d.setDate(d.getDate() + 1)) {
              if (d >= startDate && d <= endDate) {
                const dateStr = d.toISOString().split("T")[0];
                const formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                
                const isWeekoff = explicitWeekoffDates.has(dateStr) || (explicitWeekoffDates.size === 0 && d.getDay() === 0);
                const isHoliday = holidayDates.has(dateStr);

                if (!isHoliday && !isWeekoff) {
                  if (!userLeavesMap.has(dateStr)) {
                    userLeavesMap.set(dateStr, l.leaveType);
                    userLeaveCounts[l.leaveType] = (userLeaveCounts[l.leaveType] || 0) + 1;
                    
                    if (!leaveDatesByType[l.leaveType]) leaveDatesByType[l.leaveType] = [];
                    leaveDatesByType[l.leaveType].push(formattedDate);
                  }
                }
              }
            }
          });

          result.parsedBreakdown = {
            holidays: actualHolidays,
            weekoffs: actualWeekoffs,
            leaveCounts: userLeaveCounts,
            leaveDates: leaveDatesByType
          };
        }

        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [entryId]);

  if (!entryId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate pr-2">Payslip Breakdown</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <ModalDetailShimmer />
          ) : error ? (
            <div className="p-6 text-center text-red-500 font-medium">{error}</div>
          ) : data ? (
            <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-6">
              
              {/* Employee Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg sm:text-xl uppercase">
                  {data.user?.fullName?.charAt(0) || "E"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] sm:text-[16px] font-bold text-gray-900 truncate">{data.user?.fullName}</span>
                  <span className="text-[12px] sm:text-[13px] text-gray-500 truncate">{data.user?.employee_ids?.employeeId || "No ID"} • {data.user?.email}</span>
                </div>
              </div>

              {/* Attendance & Salary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Payable Days</span>
                  <span className="text-[16px] font-bold text-gray-800">{data.totalPayableDays || 0}</span>
                </div>
                <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Days Present</span>
                  <span className="text-[16px] font-bold text-gray-800">{data.fullDaysWorked || 0}</span>
                </div>
                <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-100 col-span-2">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mb-2 border-b border-gray-200 pb-1">Paid Absences Breakdown</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-600">Weekoffs</span>
                      <span className="font-semibold text-gray-800">{data.parsedBreakdown?.weekoffs || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-600">Holidays</span>
                      <span className="font-semibold text-gray-800">{data.parsedBreakdown?.holidays || 0}</span>
                    </div>
                    {Object.entries(data.parsedBreakdown?.leaveCounts || {}).map(([type, count]: [string, any]) => (
                      <div key={type} className="flex justify-between items-center text-[13px]">
                        <div className="flex flex-col">
                           <span className="text-gray-600">{type}</span>
                           <span className="text-[10px] text-gray-400 mt-[1px]">{(data.parsedBreakdown?.leaveDates?.[type] || []).join(', ')}</span>
                        </div>
                        <span className="font-semibold text-green-700">{count}</span>
                      </div>
                    ))}
                    {Object.keys(data.parsedBreakdown?.leaveCounts || {}).length === 0 && (
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-600">Leaves Taken</span>
                        <span className="font-semibold text-gray-800">0</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">LOP Days</span>
                  <span className="text-[16px] font-bold text-red-600">{data.lopDays || 0}</span>
                </div>
                <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Monthly Salary</span>
                  <span className="text-[16px] font-bold text-indigo-700">₹{formatExactNumber(data.monthlySalary || 0)}</span>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[14px] font-bold text-gray-800 border-b border-gray-100 pb-2">Deductions Breakdown</h3>
                {data.user?.employee_pay_profiles?.[0]?.employee_payroll_compliance_values?.length > 0 ? (
                  data.user.employee_pay_profiles[0].employee_payroll_compliance_values.map((comp: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-600 font-medium">{comp.payroll_compliance_types?.title || "Deduction"}</span>
                      <span className="text-red-600 font-semibold">-₹{formatExactNumber(comp.amount || 0)}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[13px] text-gray-400 italic">No deductions found.</span>
                )}
                <div className="flex justify-between items-center text-[13px] pt-2 border-t border-gray-100">
                  <span className="text-gray-800 font-bold">Total Deductions</span>
                  <span className="text-red-600 font-bold">-₹{formatExactNumber(data.totalDeductions || 0)}</span>
                </div>
              </div>

              {/* Final Totals */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-500">Total Payable Days</span>
                    <span className="font-medium text-gray-800">{data.totalPayableDays}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-500">Days Present</span>
                    <span className="font-medium text-gray-800">{data.fullDaysWorked}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-500">Paid Absences</span>
                    <span className="font-medium text-green-700">{Math.max(0, data.totalPayableDays - data.fullDaysWorked - (data.halfDays * 0.5) - data.lopDays)}</span>
                  </div>
                <div className="flex justify-between items-center text-[14px] mt-2 border-t border-green-200/50 pt-2">
                  <span className="text-green-800 font-semibold">Gross Pay</span>
                  <span className="text-green-800 font-bold">₹{formatExactNumber(data.grossEarnings || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-[16px] border-t border-green-200/50 pt-2 mt-1">
                  <span className="text-green-900 font-extrabold">Net Take Home</span>
                  <span className="text-green-900 font-extrabold">₹{formatExactNumber(data.netPay || 0)}</span>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
