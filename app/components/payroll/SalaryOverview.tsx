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
  const addonsArray = payData?.rawAddons || payData?.employee_pay_addons || [];

  const salaryComponents = allowancesArray.map((component: any) => ({
    name:
      component.name ||
      component.salary_component_types?.title ||
      "Other Component",
    amount: Number(component.amount) || 0,
  }));
  const allowanceItems = salaryComponents.filter(
    (component: { amount: number }) => component.amount > 0,
  );
  const componentDeductions = salaryComponents
    .filter((component: { amount: number }) => component.amount < 0)
    .map((component: { name: string; amount: number }) => ({
      ...component,
      amount: Math.abs(component.amount),
    }));
  const addonItems = addonsArray
    .map((addon: any) => ({
      name: addon.title || addon.typeName || addon.addonType || "Other Add-on",
      amount: Number(addon.amount) || 0,
    }))
    .filter((addon: { amount: number }) => addon.amount > 0);
  const complianceItems = compliancesArray
    .map((compliance: any) => ({
      name:
        compliance.name ||
        compliance.payroll_compliance_types?.title ||
        "Other Deduction",
      amount: Math.abs(Number(compliance.amount) || 0),
    }))
    .filter((compliance: { amount: number }) => compliance.amount > 0);

  const totalAllowances = allowanceItems.reduce(
    (sum: number, item: { amount: number }) => sum + item.amount,
    0,
  );
  const totalAddons = addonItems.reduce(
    (sum: number, item: { amount: number }) => sum + item.amount,
    0,
  );
  const deductionItems = [...componentDeductions, ...complianceItems];
  const totalDeductions = deductionItems.reduce(
    (sum: number, item: { amount: number }) => sum + item.amount,
    0,
  );
  const grossEarnings = monthlySalary + totalAllowances + totalAddons;
  const takeHomePay = Math.max(0, grossEarnings - totalDeductions);
  
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
            educationType: employeeProfile?.educationType || "",
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
            <div className={isFetchingPay ? "invisible" : ""}>
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
          </div>

          <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-2 relative overflow-hidden">
            {isFetchingPay && <ShimmerBlock />}
            <div className={isFetchingPay ? "invisible" : ""}>
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
        </div>

        <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between relative overflow-hidden">
          {isFetchingPay && <ShimmerBlock />}
          <div className={`flex flex-col h-full ${isFetchingPay ? "invisible" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center text-[#333333] text-[15px]">
                <span>Basic Salary :</span>
                <span className="font-bold ml-2">{formatINR(monthlySalary)}</span>
              </div>
              <span className="bg-[#43C17A]/10 text-[#43C17A] text-[10px] px-2 py-0.5 rounded-[4px] font-bold tracking-wide">
                CURRENT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg border border-[#43C17A]/20 bg-[#43C17A]/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#333] text-[12px] font-bold">Earnings</span>
                  <span className="text-[#43C17A] text-[12px] font-bold">
                    {formatINR(grossEarnings)}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#666]">Basic Salary</span>
                    <span className="font-semibold">{formatINR(monthlySalary)}</span>
                  </div>
                  {[...allowanceItems, ...addonItems].map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex justify-between gap-2">
                      <span className="text-[#666] truncate" title={item.name}>{item.name}</span>
                      <span className="font-semibold text-[#43C17A]">+{formatINR(item.amount)}</span>
                    </div>
                  ))}
                  {allowanceItems.length === 0 && addonItems.length === 0 && (
                    <div className="text-[#999]">No allowances or add-ons</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#333] text-[12px] font-bold">Deductions</span>
                  <span className="text-red-500 text-[12px] font-bold">
                    {formatINR(totalDeductions)}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {deductionItems.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex justify-between gap-2">
                      <span className="text-[#666] truncate" title={item.name}>{item.name}</span>
                      <span className="font-semibold text-red-500">-{formatINR(item.amount)}</span>
                    </div>
                  ))}
                  {deductionItems.length === 0 && (
                    <div className="text-[#999]">No deductions configured</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
              <div>
                <div className="text-[10px] text-[#777]">Allowances</div>
                <div className="text-[12px] font-bold text-[#43C17A]">+{formatINR(totalAllowances)}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#777]">Add-ons</div>
                <div className="text-[12px] font-bold text-[#43C17A]">+{formatINR(totalAddons)}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#777]">Deductions</div>
                <div className="text-[12px] font-bold text-red-500">-{formatINR(totalDeductions)}</div>
              </div>
            </div>

            <div className="mt-3 flex justify-center items-center text-[15px] border-t border-gray-100 pt-3">
              <span className="text-[#43C17A] font-bold">Take Home :</span>
              <span className="text-[#333333] font-bold ml-2">{formatINR(takeHomePay)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
