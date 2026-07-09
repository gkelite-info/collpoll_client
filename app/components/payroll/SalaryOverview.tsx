import { useState } from "react";
import { ShimmerBlock } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import AddPayModal from "@/app/(screens)/hr/MyAttendance/components/AddPayModal";

interface SalaryOverviewProps {
  payData: any | null;
  isFetchingPay: boolean;
  isHrView?: boolean;
  employeeProfile?: any;
  effectiveUserId?: number;
  onRefresh?: () => void;
}

export function SalaryOverview({ payData, isFetchingPay, isHrView, employeeProfile, effectiveUserId, onRefresh }: SalaryOverviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FLEXIBLE DATA MAPPING ---
  const totalCTC = payData?.totalCTC || payData?.totalCtc || payData?.employee_salary_structure?.totalCtc || 0;
  const fixedPay = payData?.fixedPay || payData?.employee_salary_structure?.fixedPay || 0;
  const variablePay = payData?.variablePay || payData?.employee_salary_structure?.variablePay || 0;
  const monthlySalary = payData?.monthlySalary || payData?.employee_pay_profiles?.monthlySalary || (totalCTC ? Math.round(totalCTC / 12) : 0);
  const allowancesArray = payData?.allowances || payData?.employee_salary_component_values || [];
  const compliancesArray = payData?.compliances || payData?.employee_payroll_compliance_values || [];

  const totalAllowances = allowancesArray.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
  const totalCompliances = compliancesArray.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
  const takeHomePay = monthlySalary + totalAllowances - totalCompliances;
  
  const formatINR = (val: number | undefined) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[16px] font-extrabold text-[#333333]">
          My Salary
        </h2>
        {isHrView && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isFetchingPay}
            className={`bg-[#16284F] hover:bg-[#1a2f5c] text-white px-6 py-2 rounded-md font-medium text-[13px] transition-colors ${isFetchingPay ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isFetchingPay ? "Loading..." : (payData ? "Edit Pay" : "Add Pay")}
          </button>
        )}
      </div>

      {isHrView && effectiveUserId && (
        <AddPayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            setIsModalOpen(false);
          }}
          payData={payData}
          employee={{
            userId: effectiveUserId,
            name: employeeProfile?.name || "",
            id: employeeProfile?.id || "",
            employeeId: employeeProfile?.employeeId || "",
            joiningDate: employeeProfile?.joiningDate || "",
            department: employeeProfile?.department || "",
            role: employeeProfile?.role || "",
            image: employeeProfile?.image || "",
          }}
        />
      )}

      {/* --- COMPACT DYNAMIC GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="col-span-1 flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 relative overflow-hidden flex-1 flex flex-col justify-center">
            {isFetchingPay && <ShimmerBlock />}
            <p className="text-[#666666] text-[12px] font-semibold">
              Current Compensation
            </p>
            <p className="text-[#333333] font-bold text-[16px] mt-1">
              INR {formatINR(totalCTC)}/Annum
            </p>
            <div className="mt-2.5 flex flex-col gap-1 text-[11px] font-medium text-[#555]">
              <div>
                Fixed - <span className="text-[#43C17A] font-bold">{formatINR(fixedPay)}</span>
              </div>
              <div>
                Variable - <span className="text-[#43C17A] font-bold">{formatINR(variablePay)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-2 relative overflow-hidden">
            {isFetchingPay && <ShimmerBlock />}
            <div className="flex justify-between items-center">
              <span className="text-[#333333] font-bold text-[13px]">Payroll</span>
              <span className="text-[#333333] font-bold text-[12px]">
                Till Date Pay <span className="text-[#43C17A] ml-1">{formatINR(payData?.tillDatePay)}</span>
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#666666] text-[12px] font-semibold">Paycycle</span>
              <span className="text-[#43C17A] font-bold text-[12px]">Monthly</span>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between relative overflow-hidden">
          {isFetchingPay && <ShimmerBlock />}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-[#333333] text-[15px]">
              <span>Monthly :</span>
              <span className="font-bold ml-2">{formatINR(monthlySalary)}</span>
            </div>
            <span className="bg-[#43C17A]/10 text-[#43C17A] text-[10px] px-2 py-0.5 rounded-[4px] font-bold tracking-wide">
              CURRENT
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {compliancesArray.length > 0 ? (
              compliancesArray.map((comp: any, idx: number) => {
                const compName = comp.name || comp.payroll_compliance_types?.title || "Unknown";
                return (
                  <div key={idx} className="bg-[#EAE8F9] rounded-lg py-3 px-3 min-w-[75px] flex-1 text-center flex flex-col justify-center items-center">
                    <span className="text-[#555] text-[12px] font-semibold mb-0.5">{compName}</span>
                    <span className="text-[#5B3EE8] font-bold text-[15px]">{formatINR(Number(comp.amount))}</span>
                  </div>
                );
              })
            ) : (
              <>
                <div className="bg-[#EAE8F9] rounded-lg py-3 px-3 min-w-[75px] flex-1 text-center flex flex-col justify-center items-center">
                  <span className="text-[#555] text-[12px] font-semibold mb-0.5">PF</span>
                  <span className="text-[#5B3EE8] font-bold text-[15px]">0</span>
                </div>
                <div className="bg-[#EAE8F9] rounded-lg py-3 px-3 min-w-[75px] flex-1 text-center flex flex-col justify-center items-center">
                  <span className="text-[#555] text-[12px] font-semibold mb-0.5">EF</span>
                  <span className="text-[#5B3EE8] font-bold text-[15px]">0</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex justify-center items-center text-[15px] border-t border-gray-100 pt-4">
            <span className="text-[#43C17A] font-bold">Take Home :</span>
            <span className="text-[#333333] font-bold ml-2">{formatINR(takeHomePay)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
