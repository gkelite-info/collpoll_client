"use client";

import { getPayrollRuns } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { useEffect, useState } from "react";
import { TableRowShimmer } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import { format } from "date-fns";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import ViewPayrollRunModal from "./ViewPayrollRunModal";
import { CaretDown } from "@phosphor-icons/react";

export default function PayrollHistoryTab() {
  const { collegeId } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filterYear, setFilterYear] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  const currentYear = new Date().getFullYear();
  const yearOptions = [{ value: "all", label: "All Years" }];
  for (let y = currentYear; y >= 2026; y--) {
    yearOptions.push({ value: y.toString(), label: y.toString() });
  }

  const selectedYearLabel = yearOptions.find(o => o.value === filterYear)?.label || "All Years";
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    ...availableStatuses.map((status) => ({
      value: status,
      label: status.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
    })),
  ];
  const selectedStatusLabel = statusOptions.find((option) => option.value === filterStatus)?.label || "All Statuses";

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (!collegeId) return;
      setIsLoading(true);
      
      try {
        const result = await getPayrollRuns(Number(collegeId), currentPage, itemsPerPage, filterYear, filterStatus);
        
        if (isMounted) {
          setHistoryData(result.runs);
          setTotalItems(result.total);
          setAvailableStatuses(result.statuses);
        }
      } catch (error) {
        toast.error("Unable to load payroll history at this time.", { id: "history-fetch-error" });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchData();

    return () => { isMounted = false; };
  }, [collegeId, currentPage, refreshKey, filterYear, filterStatus]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Past Payroll Runs</h2>
        <div className="flex flex-col sm:flex-row gap-4 relative w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              className="relative flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:min-w-[160px]"
              onClick={() => { setIsStatusDropdownOpen((open) => !open); setIsDropdownOpen(false); }}
            >
              <span className="font-medium text-gray-800">{selectedStatusLabel}</span>
              <CaretDown size={16} weight="bold" className={`text-gray-500 transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {statusOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => { setFilterStatus(option.value); setCurrentPage(1); setIsStatusDropdownOpen(false); }}
                    className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors ${filterStatus === option.value ? "bg-[#43C17A]/10 font-semibold text-[#43C17A]" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative w-full sm:w-auto">
            <div 
              className="relative border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer w-full sm:min-w-[160px] flex justify-between items-center"
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsStatusDropdownOpen(false); }}
            >
              <span className="font-medium text-gray-800">{selectedYearLabel}</span>
              <CaretDown 
                size={16} 
                weight="bold" 
                className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
              />
            </div>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {yearOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setFilterYear(opt.value);
                      setCurrentPage(1); // Reset to first page on filter change
                      setIsDropdownOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                      filterYear === opt.value
                        ? "bg-[#43C17A]/10 text-[#43C17A] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="custom-scrollbar relative min-h-0 flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Month/Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Staff Count</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Net Payout</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <TableRowShimmer key={i} columns={5} />
                ))
              ) : historyData.length > 0 ? (
                historyData.map((data: any, i) => {
                  const dateStr = `${data.payrollYear}-${String(data.payrollMonth).padStart(2, '0')}-01`;
                  const monthDisplay = format(new Date(dateStr), 'MMMM yyyy');
                  const displayStatus = data.displayStatus || data.status;
                  
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {monthDisplay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {data.totalStaff} Employees
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        ₹{Number(data.totalNetPay || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          displayStatus === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          displayStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                          displayStatus === 'finalized' ? 'bg-indigo-100 text-indigo-800' :
                          displayStatus === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                          displayStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {displayStatus === "partially_paid" ? "Partially Paid" : displayStatus}
                        </span>
                        {data.paymentProgress?.payableCount > 0 && (
                          <p className="mt-1 text-[10px] text-gray-500">
                            {data.paymentProgress.paidCount}/{data.paymentProgress.payableCount} employees paid
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => setSelectedRun(data)}
                          className="text-[#43C17A] hover:text-[#38A166] transition-colors cursor-pointer font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No payroll history found.
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

      <ViewPayrollRunModal 
        open={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        runData={selectedRun}
        onActionSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}
