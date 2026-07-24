import { useState, useEffect, Fragment } from "react";
import toast from "react-hot-toast";
import { Listbox, Transition } from "@headlessui/react";
import { CaretDown } from "@phosphor-icons/react";
import { getMyPayslips } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { PaySlipShimmer } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import PayslipPreviewModal from "./PayslipPreviewModal";

interface PayslipsSectionProps {
  userId: number;
}

export function PayslipsSection({ userId }: PayslipsSectionProps) {
  const [paySlips, setPaySlips] = useState<any[]>([]);
  const [isFetchingSlips, setIsFetchingSlips] = useState(true);
  const [previewEntryId, setPreviewEntryId] = useState<number | null>(null);

  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayslips, setTotalPayslips] = useState(0);
  const itemsPerPage = 10;

  // Year Filter State
  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) {
    yearOptions.push(y);
  }
  const allOption = "All";
  const yearFilterOptions = [allOption, ...yearOptions];
  const [selectedYear, setSelectedYear] = useState<number | string>(allOption);

  const loadPayslips = async () => {
    if (!userId) return;
    setIsFetchingSlips(true);
    try {
      const { slips, total } = await getMyPayslips(
        userId,
        currentPage,
        itemsPerPage,
        selectedYear === allOption ? undefined : selectedYear
      );
      setPaySlips(slips);
      setTotalPayslips(total);
    } catch (error) {
      toast.error("Unable to fetch payslips at this time.", { id: "payslips-fetch-error" });
    } finally {
      setIsFetchingSlips(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, [userId, currentPage, selectedYear]);

  const handleYearChange = (year: number | string) => {
    setSelectedYear(year);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const formatINR = (val: number | undefined) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatTrackingDate = (value?: string | null) => {
    if (!value) return "Pending";
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00Z`)
      : new Date(value);
    if (Number.isNaN(date.getTime())) return "Pending";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  };

  return (
    <>
      <div className="flex items-center justify-between -mb-2 -mt-7">
        <h2 className="text-[16px] font-extrabold text-[#333333]">
          Pay Slips
        </h2>

        {/* Year Filter Dropdown */}
        <div className="relative w-32 z-20">
          <Listbox value={selectedYear} onChange={handleYearChange}>
            {({ open }) => (
              <>
                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-8 text-left border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#43C17A]/50 sm:text-sm">
                  <span className="block truncate text-[#333333] font-bold">
                    {selectedYear === allOption ? "All Years" : selectedYear}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
                    <CaretDown
                      size={16}
                      weight="bold"
                      className={`transition-transform duration-200 ${open ? "rotate-180 text-[#43C17A]" : ""}`}
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-80 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {yearFilterOptions.map((option) => (
                      <Listbox.Option
                        key={option}
                        className={({ active, selected }) =>
                          `relative cursor-pointer select-none py-2 px-3 ${selected
                            ? "bg-[#43C17A]/10 text-[#43C17A] font-extrabold"
                            : active
                              ? "bg-gray-50 text-gray-900 font-medium"
                              : "text-[#333333] font-medium"
                          }`
                        }
                        value={option}
                      >
                        {({ selected }) => (
                          <span className={`block truncate ${selected ? "font-extrabold" : "font-medium"}`}>
                            {option === allOption ? "All Years" : option}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </>
            )}
          </Listbox>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="relative overflow-y-auto max-h-[500px] min-h-[200px] custom-scrollbar pb-2 flex flex-col gap-3 rounded-xl">
          {isFetchingSlips ? (
            <>
              <PaySlipShimmer />
              <PaySlipShimmer />
              <PaySlipShimmer />
              <PaySlipShimmer />
              <PaySlipShimmer />
            </>
          ) : paySlips.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mr-1">
              No payslips found for {selectedYear === allOption ? "your history" : selectedYear}.
            </div>
          ) : (
            paySlips.map((slip) => (
              <div
                key={slip.id}
                className="bg-white rounded-xl p-4 border border-gray-50 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] transition-shadow duration-300 mr-1"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                  <h3 className="text-[15px] font-bold text-[#333333]">
                    {slip.month}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-[13px] font-bold">
                    <span className="text-[#333333]">
                      Status - <span className={slip.status === 'Paid' ? "text-[#43C17A]" : "text-orange-500"}>{slip.status || "Pending"}</span>
                    </span>
                    <button 
                      onClick={() => setPreviewEntryId(slip.id)}
                      className="flex items-center text-[#333333] hover:text-[#43C17A] transition-colors cursor-pointer group"
                    >
                      Download
                      <svg
                        className="w-[14px] h-[14px] ml-1.5 group-hover:-translate-y-0.5 transition-transform"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-[13px]">
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">Pay Date :</span>
                    <span className="text-[#666666] font-medium">{slip.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">Deductions :</span>
                    <span className="text-[#666666] font-medium">{typeof slip.deductions === 'number' ? formatINR(slip.deductions) : slip.deductions}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">Gross Pay :</span>
                    <span className="text-[#666666] font-medium">{typeof slip.gross === 'number' ? formatINR(slip.gross) : slip.gross}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">Net Pay :</span>
                    <span className="text-[#666666] font-medium">{typeof slip.net === 'number' ? formatINR(slip.net) : slip.net}</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 border-t border-gray-100 pt-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Payroll Calculated",
                      date: slip.tracking?.calculatedAt,
                      person: slip.tracking?.processedBy,
                      completed: true,
                    },
                    {
                      label: "HR Finalized",
                      date: slip.tracking?.finalizedAt,
                      person: slip.tracking?.processedBy,
                      completed: Boolean(slip.tracking?.finalizedAt),
                    },
                    {
                      label: slip.status === "Paid" ? "Payment Completed" : "Payment Pending",
                      date: slip.tracking?.paidAt,
                      person: slip.tracking?.paidBy,
                      completed: slip.status === "Paid",
                    },
                  ].map((step) => (
                    <div key={step.label} className="flex items-start gap-2 rounded-lg bg-gray-50 p-2.5">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${step.completed ? "bg-[#43C17A] text-white" : "border-2 border-gray-300 bg-white text-transparent"}`}>✓</span>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-bold ${step.completed ? "text-[#333333]" : "text-gray-500"}`}>{step.label}</p>
                        <p className="mt-0.5 text-[10px] text-gray-500">{step.completed ? formatTrackingDate(step.date) : "Awaiting confirmation"}</p>
                        <p className="mt-0.5 truncate text-[10px] text-gray-400">{step.person || (step.label.includes("Payment") ? "Accountant" : "HR Manager")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Server-Side Pagination */}
        {paySlips.length > 0 && totalPayslips > 0 && !isFetchingSlips && (
          <div className="mt-1 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalItems={totalPayslips}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              roundedBottom="rounded-xl"
            />
          </div>
        )}
      </div>

      <PayslipPreviewModal 
        entryId={previewEntryId} 
        onClose={() => setPreviewEntryId(null)} 
      />
    </>
  );
}
