"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { createPayrollRun, getPayrollEntriesByMonth } from "@/lib/helpers/Hr/payroll/payrollAPI";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { TableRowShimmer, StatCardShimmer } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import { formatCompactNumber, formatExactNumber } from "@/app/utils/numberFormat";
import { finalizePayrollRun, markPayrollPaid } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { format } from "date-fns";
import ViewEntryModal from "./ViewEntryModal";

export default function RunPayrollTab() {
  const { userId, collegeId } = useUser();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isLoading, setIsLoading] = useState(true);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  
  const [runStats, setRunStats] = useState({
    totalStaff: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    status: "",
    payrollRunId: null as number | null
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (!collegeId || !selectedMonth) return;
      setIsLoading(true);
      const [yearStr, monthStr] = selectedMonth.split('-');
      
      try {
        const result = await getPayrollEntriesByMonth(
          Number(collegeId), 
          Number(monthStr), 
          Number(yearStr), 
          currentPage, 
          itemsPerPage,
          debouncedSearch
        );
        
        if (isMounted) {
          setPayrollData(result.entries);
          setTotalItems(result.total);
          
          if (result.runStats) {
            setRunStats({
              totalStaff: result.runStats.totalStaff || 0,
              totalGrossPay: result.runStats.totalGrossEarnings || 0,
              totalDeductions: result.runStats.totalDeductions || 0,
              totalNetPay: result.runStats.totalNetPay || 0,
              status: result.runStats.status || "",
              payrollRunId: result.runStats.payrollRunId || null
            });
          } else {
            setRunStats({ totalStaff: 0, totalGrossPay: 0, totalDeductions: 0, totalNetPay: 0, status: "", payrollRunId: null });
          }
        }
      } catch (error) {
        toast.error("Unable to load payroll data at this time.", { id: "payroll-fetch-error" });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchData();

    return () => { isMounted = false; };
  }, [collegeId, currentPage, selectedMonth, refreshKey, debouncedSearch]);

  const handleConfirmRun = () => {
    setIsConfirmOpen(true);
  };

  const handleRunPayroll = async () => {
    if (!collegeId || !userId || !selectedMonth) return;
    
    const [year, month] = selectedMonth.split('-');
    
    setIsProcessing(true);
    try {
      await createPayrollRun(Number(collegeId), Number(month), Number(year), userId);
      toast.success("Payroll calculated successfully!", { id: "payroll-calculate-success" });
      setRefreshKey(prev => prev + 1);
      setIsConfirmOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate payroll", { id: "payroll-calculate-error" });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };

  const handleFinalizeRun = async () => {
    if (!runStats.payrollRunId) return;
    setIsProcessing(true);
    try {
      await finalizePayrollRun(runStats.payrollRunId);
      toast.success("Payroll run finalized! Payslips are now visible to staff.", { id: "payroll-finalize-success" });
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize payroll run.", { id: "payroll-finalize-error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!runStats.payrollRunId) return;
    setIsProcessing(true);
    try {
      await markPayrollPaid(runStats.payrollRunId);
      toast.success("Payroll marked as paid.", { id: "payroll-paid-success" });
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as paid.", { id: "payroll-paid-error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const monthDisplay = selectedMonth ? format(new Date(`${selectedMonth}-01`), 'MMMM yyyy') : "";

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <ConfirmDeleteModal
        open={isConfirmOpen}
        onConfirm={handleRunPayroll}
        onCancel={() => setIsConfirmOpen(false)}
        title="Calculate Payroll for"
        name={monthDisplay}
        confirmText="Run Payroll"
        loadingText="Processing..."
        actionType="accept"
        isDeleting={isProcessing}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-100 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 relative w-full sm:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-semibold text-gray-700">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#43C17A] bg-white cursor-pointer w-full sm:min-w-[160px]"
            />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-semibold text-gray-700">Search Employee</label>
            <input
              type="text"
              placeholder="Name, Email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#43C17A] bg-white w-full sm:min-w-[200px]"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {(runStats.status === 'draft' || runStats.status === 'calculated') && (
            <button
              onClick={handleFinalizeRun}
              disabled={isProcessing}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto shadow-sm"
            >
              Finalize Run
            </button>
          )}

          {runStats.status === 'finalized' && (
            <button
              onClick={handleMarkPaid}
              disabled={isProcessing}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto shadow-sm"
            >
              Mark as Paid
            </button>
          )}

          <button
            onClick={handleConfirmRun}
            disabled={isProcessing || runStats.status === 'paid'}
            className="bg-[#43C17A] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#38A166] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto shadow-sm"
          >
            {isProcessing ? "Processing..." : (runStats.status ? "Recalculate Payroll" : "Calculate Payroll")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardShimmer />
            <StatCardShimmer />
            <StatCardShimmer />
            <StatCardShimmer />
          </>
        ) : (
          [
            { label: "Total Staff", value: formatCompactNumber(Number(runStats.totalStaff)) },
            { label: "Total Gross Pay", value: `₹${formatCompactNumber(Number(runStats.totalGrossPay))}` },
            { label: "Total Deductions", value: `₹${formatCompactNumber(Number(runStats.totalDeductions))}` },
            { label: "Total Net Pay", value: `₹${formatCompactNumber(Number(runStats.totalNetPay))}` },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Monthly Salary</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Gross Pay</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider whitespace-nowrap">Till Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Deductions</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Net Pay</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <>
                  <TableRowShimmer columns={9} />
                  <TableRowShimmer columns={9} />
                  <TableRowShimmer columns={9} />
                  <TableRowShimmer columns={9} />
                </>
              ) : payrollData.length > 0 ? (
                payrollData.map((data: any, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {data.user?.employee_ids?.employeeId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {data.user?.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {data.user?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{formatExactNumber(Number(data.monthlySalary || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      ₹{formatExactNumber(Number(data.grossEarnings || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-teal-600 bg-teal-50 px-2 py-1 rounded font-semibold">
                        ₹{
                          formatExactNumber(
                            selectedMonth === new Date().toISOString().slice(0, 7)
                              ? Math.max(0, (new Date().getDate() * Number(data.perDayRate || 0)) - (Number(data.lopDays || 0) * Number(data.perDayRate || 0)) - (Number(data.halfDays || 0) * Number(data.perDayRate || 0) * 0.5))
                              : Number(data.grossEarnings || 0)
                          )
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-red-600">
                      -₹{formatExactNumber(Number(data.totalDeductions || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                      ₹{formatExactNumber(Number(data.netPay || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        data.status === 'calculated' ? 'bg-yellow-100 text-yellow-800' :
                        data.status === 'finalized' ? 'bg-blue-100 text-blue-800' :
                        data.status === 'paid' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {data.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedEntryId(data.payrollEntryId)}
                        className="text-[#43C17A] hover:text-[#38A166] transition-colors font-bold cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="font-medium">No payroll data generated for this month</span>
                      <span className="text-xs">Click "Calculate Payroll" to process salaries.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
      </div>

      <ViewEntryModal 
        entryId={selectedEntryId} 
        onClose={() => setSelectedEntryId(null)} 
      />
    </div>
  );
}
