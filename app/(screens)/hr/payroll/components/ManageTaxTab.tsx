"use client";

import { useState } from "react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { TableRowShimmer } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import { CaretDown } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { getTaxDeclarations } from "@/lib/helpers/Hr/payroll/taxDeclarationAPI";
import toast from "react-hot-toast";

export default function ManageTaxTab() {
  const { collegeId } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const filterOptions = [
    { value: "all", label: "All Declarations" },
    { value: "pending", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const selectedFilterLabel = filterOptions.find(o => o.value === filterStatus)?.label || "All Declarations";

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
      if (!collegeId) return;
      setIsLoading(true);
      
      try {
        const result = await getTaxDeclarations(Number(collegeId), filterStatus, currentPage, itemsPerPage, debouncedSearch);
        
        if (isMounted) {
          setDeclarations(result.declarations);
          setTotalItems(result.total);
        }
      } catch (error) {
        toast.error("Unable to load tax declarations at this time.", { id: "tax-fetch-error" });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchData();

    return () => { isMounted = false; };
  }, [collegeId, currentPage, filterStatus, debouncedSearch]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Tax Declarations</h2>
        <div className="flex flex-col sm:flex-row gap-4 relative w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Name, Email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#43C17A] bg-white w-full sm:min-w-[200px]"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <div 
              className="relative border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer w-full sm:min-w-[200px] flex justify-between items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
            <span className="font-medium text-gray-800">{selectedFilterLabel}</span>
            <CaretDown 
              size={16} 
              weight="bold" 
              className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
            />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {filterOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setFilterStatus(opt.value);
                    setCurrentPage(1); // Reset to first page on filter change
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    filterStatus === opt.value
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
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Regime</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Declared</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <>
                  <TableRowShimmer columns={6} />
                  <TableRowShimmer columns={6} />
                  <TableRowShimmer columns={6} />
                  <TableRowShimmer columns={6} />
                </>
              ) : declarations.length > 0 ? (
                declarations.map((dec: any, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {dec.user?.employee_ids?.employeeId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {dec.user?.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dec.user?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {dec.taxRegime} Regime
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      ₹{Number(dec.totalDeclared || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        dec.proofStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        dec.proofStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        dec.proofStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {dec.proofStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[#43C17A] hover:text-[#38A166] transition-colors">
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No tax declarations found.
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
    </div>
  );
}
