"use client";

import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { saveEmployeePayDetails } from "@/lib/helpers/Hr/myAttendance/saveEmployeePayDetails";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface EmployeePayData {
  userId: number;
  name: string;
  id: string;
  joiningDate: string;
  department: string;
  role: string;
  image: string;
}

interface AddPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: EmployeePayData;
  payData?: any;
}

export default function AddPayModal({
  isOpen,
  onClose,
  onSuccess,
  employee,
  payData,
}: AddPayModalProps) {
  const { collegeHrId, collegeId, loading: contextLoading } = useCollegeHr();
  const [isSaving, setIsSaving] = useState(false);

  const initialFormData = {
    totalCTC: "",
    fixedPay: "",
    variablePay: "",
    jobType: "Permanent",
    totalLeaves: "",
    sickLeave: "",
    casualLeave: "",
    paidLeave: "",
  };

  const initialActiveAllowances = [
    {
      id: "hra",
      name: "House Rent Allowance (HRA)",
      amount: "",
      isDeduction: false,
    },
    {
      id: "telephone",
      name: "Telephone Allowance",
      amount: "",
      isDeduction: false,
    },
  ];

  const initialAvailableAllowances = [
    { id: "transport", name: "Transportation Allowance", isDeduction: false },
    { id: "bonus", name: "Statutory Bonus (Paid Monthly)", isDeduction: false },
    {
      id: "deduction",
      name: "Company's Deduction (Tax/Allowances)",
      isDeduction: true,
    },
    { id: "special", name: "Special Allowance", isDeduction: false },
  ];

  const initialCompliances = [
    { id: "pf", name: "PF", amount: "", selected: false },
    { id: "ef", name: "EF", amount: "", selected: false },
    { id: "tds", name: "TDS", amount: "", selected: false },
    { id: "direct", name: "Direct Pay", amount: "", selected: false },
  ];

  const initialAddons = [
    {
      id: "1",
      typeName: "Performance Bonus",
      amount: "",
      payoutType: "Fixed",
      isOpen: true,
    },
    {
      id: "2",
      typeName: "Joining Compensation",
      amount: "",
      payoutType: "Fixed",
      isOpen: false,
    },
    {
      id: "3",
      typeName: "Maintenance",
      amount: "",
      payoutType: "Fixed",
      isOpen: false,
    },
  ];

  const [formData, setFormData] = useState(initialFormData);
  const [basicSalary, setBasicSalary] = useState("");

  const [activeAllowances, setActiveAllowances] = useState(
    initialActiveAllowances,
  );
  const [availableAllowances, setAvailableAllowances] = useState(
    initialAvailableAllowances,
  );

  const [addingCustomAllowance, setAddingCustomAllowance] = useState(false);
  const [customAllowanceName, setCustomAllowanceName] = useState("");
  const [customAllowanceType, setCustomAllowanceType] = useState<
    "allowance" | "deduction"
  >("allowance");

  const [compliances, setCompliances] = useState(initialCompliances);
  const [addingCustomCompliance, setAddingCustomCompliance] = useState(false);
  const [customComplianceName, setCustomComplianceName] = useState("");

  const [addons, setAddons] = useState(initialAddons);

  useEffect(() => {
    if (isOpen && payData) {
      const leaves = Array.isArray(payData.leaveAllocations)
        ? payData.leaveAllocations[0]
        : payData.leaveAllocations ||
          payData.employee_leave_allocations?.[0] ||
          payData.employee_leave_allocations;

      setFormData({
        totalCTC: payData.totalCTC ? payData.totalCTC.toString() : "",
        fixedPay: payData.fixedPay ? payData.fixedPay.toString() : "",
        variablePay: payData.variablePay ? payData.variablePay.toString() : "",
        jobType: payData.jobType || "Permanent",
        totalLeaves: leaves?.totalLeaves?.toString() ?? "",
        sickLeave: leaves?.sickLeave?.toString() ?? "",
        casualLeave: leaves?.casualLeave?.toString() ?? "",
        paidLeave: leaves?.paidLeave?.toString() ?? "",
      });

      setBasicSalary(
        payData.monthlySalary ? payData.monthlySalary.toString() : "",
      );

      if (payData.allowances && payData.allowances.length > 0) {
        const loadedAllowances = payData.allowances.map(
          (a: any, idx: number) => ({
            id: `loaded-allowance-${idx}`,
            name: a.name,
            amount: a.amount.toString(),
            isDeduction: Number(a.amount) < 0,
          }),
        );
        setActiveAllowances(loadedAllowances);
        const loadedNames = loadedAllowances.map((a: any) =>
          a.name.toLowerCase(),
        );
        setAvailableAllowances(
          initialAvailableAllowances.filter(
            (a) => !loadedNames.includes(a.name.toLowerCase()),
          ),
        );
      } else {
        setActiveAllowances(initialActiveAllowances);
        setAvailableAllowances(initialAvailableAllowances);
      }

      if (payData.compliances && payData.compliances.length > 0) {
        const loadedCompliances = initialCompliances.map((comp) => {
          const found = payData.compliances.find(
            (c: any) => c.name.toLowerCase() === comp.name.toLowerCase(),
          );
          if (found) {
            return { ...comp, amount: found.amount.toString(), selected: true };
          }
          return comp;
        });

        const customComps = payData.compliances
          .filter(
            (c: any) =>
              !initialCompliances.some(
                (ic) => ic.name.toLowerCase() === c.name.toLowerCase(),
              ),
          )
          .map((c: any, idx: number) => ({
            id: `loaded-custom-comp-${idx}`,
            name: c.name,
            amount: c.amount.toString(),
            selected: true,
          }));

        setCompliances([...loadedCompliances, ...customComps]);
      } else {
        setCompliances(initialCompliances);
      }

      const dbAddons = payData.rawAddons || payData.employee_pay_addons || [];
      if (dbAddons && dbAddons.length > 0) {
        const loadedAddons = dbAddons.map((a: any, idx: number) => ({
          id: `loaded-addon-${idx}`,
          typeName: a.title || a.addonType || "",
          amount: a.amount?.toString() || "",
          payoutType:
            a.payNature === "VARIABLE" || a.payNature === "Variable"
              ? "Variable"
              : "Fixed",
          isOpen: false,
        }));

        const mergedAddons = [...loadedAddons];
        initialAddons.forEach((initial) => {
          if (
            !loadedAddons.some(
              (la: any) =>
                la.typeName.toLowerCase() === initial.typeName.toLowerCase(),
            )
          ) {
            mergedAddons.push(initial);
          }
        });
        setAddons(mergedAddons);
      } else {
        setAddons(initialAddons);
      }
    } else if (isOpen && !payData) {
      resetForm();
    }
  }, [isOpen, payData]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData(initialFormData);
    setBasicSalary("");
    setActiveAllowances(initialActiveAllowances);
    setAvailableAllowances(initialAvailableAllowances);
    setCompliances(initialCompliances);
    setAddons(initialAddons);
    setAddingCustomAllowance(false);
    setAddingCustomCompliance(false);
    setCustomAllowanceName("");
    setCustomComplianceName("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatNumber = (val: string) => {
    const isNegative = val.startsWith("-");
    const rawValue = val.replace(/\D/g, "");
    if (!rawValue) return isNegative ? "-" : "";
    const formatted = Number(rawValue).toLocaleString("en-IN");
    return isNegative ? `-${formatted}` : formatted;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: formatNumber(value) }));
  };

  const handleTextOrRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.dataset.placeholder = e.target.placeholder;
    e.target.placeholder = "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = e.target.dataset.placeholder || "";
  };

  const moveAllowanceToActive = (id: string) => {
    const allowance = availableAllowances.find((a) => a.id === id);
    if (!allowance) return;
    setAvailableAllowances(availableAllowances.filter((a) => a.id !== id));
    setActiveAllowances([
      ...activeAllowances,
      { ...allowance, amount: allowance.isDeduction ? "-" : "" },
    ]);
  };

  const handleActiveAllowanceAmount = (
    id: string,
    value: string,
    isDeduction: boolean,
  ) => {
    let formatted = formatNumber(value);

    if (formatted === "-") {
      formatted = "";
    } else if (isDeduction && formatted && !formatted.startsWith("-")) {
      formatted = `-${formatted}`;
    }

    setActiveAllowances(
      activeAllowances.map((a) =>
        a.id === id ? { ...a, amount: formatted } : a,
      ),
    );
  };

  const saveCustomAllowance = () => {
    if (customAllowanceName.trim()) {
      setAvailableAllowances([
        ...availableAllowances,
        {
          id: Date.now().toString(),
          name: customAllowanceName.trim(),
          isDeduction: customAllowanceType === "deduction",
        },
      ]);
      setCustomAllowanceName("");
      setCustomAllowanceType("allowance");
      setAddingCustomAllowance(false);
    }
  };

  const toggleCompliance = (id: string) => {
    setCompliances(
      compliances.map((c) =>
        c.id === id ? { ...c, selected: !c.selected } : c,
      ),
    );
  };

  const handleComplianceAmount = (id: string, value: string) => {
    setCompliances(
      compliances.map((c) =>
        c.id === id ? { ...c, amount: formatNumber(value) } : c,
      ),
    );
  };

  const saveCustomCompliance = () => {
    if (customComplianceName.trim()) {
      setCompliances([
        ...compliances,
        {
          id: Date.now().toString(),
          name: customComplianceName.trim(),
          amount: "",
          selected: true,
        },
      ]);
      setCustomComplianceName("");
      setAddingCustomCompliance(false);
    }
  };

  const handleAddonAmountChange = (id: string, value: string) => {
    setAddons(
      addons.map((a) =>
        a.id === id ? { ...a, amount: formatNumber(value) } : a,
      ),
    );
  };
  const toggleAddon = (id: string) =>
    setAddons(
      addons.map((a) => (a.id === id ? { ...a, isOpen: !a.isOpen } : a)),
    );
  const removeAddon = (id: string) =>
    setAddons(addons.filter((a) => a.id !== id));
  const handleAddonChange = (id: string, field: string, value: string) =>
    setAddons(addons.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  const handleAddOther = () =>
    setAddons([
      ...addons,
      {
        id: Date.now().toString(),
        typeName: "",
        amount: "",
        payoutType: "Fixed",
        isOpen: true,
      },
    ]);

  const handleSave = async () => {
    if (!formData.totalCTC || !formData.fixedPay || !basicSalary) {
      toast.error("Please fill in Total CTC, Fixed Pay, and Basic Salary.");
      return;
    }

    const ctc = parseInt(formData.totalCTC.replace(/,/g, "") || "0", 10);
    const fixed = parseInt(formData.fixedPay.replace(/,/g, "") || "0", 10);
    const variable = parseInt(
      formData.variablePay.replace(/,/g, "") || "0",
      10,
    );

    if (ctc !== fixed + variable) {
      toast.error(
        "Total CTC must be exactly equal to Fixed Pay + Variable Pay.",
      );
      return;
    }

    if (
      !formData.totalLeaves ||
      !formData.sickLeave ||
      !formData.casualLeave ||
      !formData.paidLeave
    ) {
      toast.error(
        "Please fill in all Leave Allocation fields (cannot be empty).",
      );
      return;
    }

    const tLeaves = parseInt(formData.totalLeaves.replace(/,/g, "") || "0", 10);
    const sLeave = parseInt(formData.sickLeave.replace(/,/g, "") || "0", 10);
    const cLeave = parseInt(formData.casualLeave.replace(/,/g, "") || "0", 10);
    const pLeave = parseInt(formData.paidLeave.replace(/,/g, "") || "0", 10);

    if (tLeaves !== sLeave + cLeave + pLeave) {
      toast.error(
        "Total Leaves must exactly match the sum of Sick, Casual, and Paid leaves.",
      );
      return;
    }

    if (contextLoading || !collegeId || !collegeHrId) {
      toast.error("HR Context loading. Please try again.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving pay details...");

    const payload = {
      ...formData,
      basicSalary,
      activeAllowances,
      compliances: compliances.filter((c) => c.selected),
    };

    const result = await saveEmployeePayDetails({
      userId: employee.userId,
      collegeId,
      collegeHrId,
      formData: payload,
      addons,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Pay details saved successfully!", { id: toastId });
      onSuccess();
      setTimeout(() => handleClose(), 1000);
    } else {
      toast.error(`Failed to save: ${result.error}`, { id: toastId });
    }
  };

  const PlusIcon = ({ isRed = false }: { isRed?: boolean }) => (
    <svg
      className={`w-[18px] h-[18px] ${isRed ? "text-red-500" : "text-[#43C17A]"} cursor-pointer hover:scale-110 transition-transform`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[10px] w-full max-w-[850px] max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col custom-scrollbar">
        <h2 className="text-[18px] font-bold text-[#333] mb-3">
          {payData ? "Edit Pay Details" : "Add Pay Details"}
        </h2>

        <div className="border border-gray-200 rounded-lg p-3.5 flex items-start gap-5 mb-5 bg-[#fafafa]">
          {employee.image ? (
            <img
              src={employee.image}
              alt={employee.name}
              className="w-[80px] h-[80px] rounded object-cover bg-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-[80px] h-[80px] rounded bg-gray-200 shadow-sm flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-[16px] font-bold text-[#333] mb-2">
              {employee.name}
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-[13px]">
              <div>
                <span className="font-semibold text-[#555] w-[100px] inline-block">
                  Employee ID :
                </span>{" "}
                <span className="text-[#282828] font-medium">
                  {employee.id}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#555] w-[100px] inline-block">
                  Joining Date :
                </span>{" "}
                <span className="text-[#282828] font-medium">
                  {employee.joiningDate}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#555] w-[100px] inline-block">
                  Department :
                </span>{" "}
                <span className="text-[#282828] font-medium">
                  {employee.department}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#555] w-[100px] inline-block">
                  Role :
                </span>{" "}
                <span className="text-[#282828] font-medium">
                  {employee.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-[#333] text-[14px] mb-2">
                Salary Structure
              </h4>
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2.5 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#555]">Total CTC:</span>
                  <input
                    type="text"
                    name="totalCTC"
                    value={formData.totalCTC}
                    onChange={handleNumberChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="e.g. 12,00,000"
                    className="border border-gray-300 rounded px-2.5 py-1 w-[170px] font-semibold text-[#282828] placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#555]">Fixed Pay :</span>
                  <input
                    type="text"
                    name="fixedPay"
                    value={formData.fixedPay}
                    onChange={handleNumberChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="e.g. 10,00,000"
                    className="border border-gray-300 rounded px-2.5 py-1 w-[170px] font-semibold text-[#282828] placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#555]">Variable Pay :</span>
                  <input
                    type="text"
                    name="variablePay"
                    value={formData.variablePay}
                    onChange={handleNumberChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="e.g. 2,00,000"
                    className="border border-gray-300 rounded px-2.5 py-1 w-[170px] font-semibold text-[#282828] placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#333] text-[14px] mb-2">
                Job Type
              </h4>
              <div className="border border-gray-200 rounded-lg p-2.5 flex justify-between items-center text-[13px]">
                {["Intern", "Contract", "Permanent"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1.5 font-bold text-[#2A3958] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="jobType"
                      value={type}
                      checked={formData.jobType === type}
                      onChange={handleTextOrRadioChange}
                      className="accent-[#43C17A] cursor-pointer w-3.5 h-3.5"
                    />{" "}
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#333] text-[14px] mb-2">
                Leave Allocation
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Leaves Per Year", name: "totalLeaves" },
                  { label: "Sick Leave", name: "sickLeave" },
                  { label: "Casual Leave", name: "casualLeave" },
                  { label: "Paid Leave", name: "paidLeave" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-1">
                    <label className="font-bold text-[12px] text-[#555]">
                      {field.label} :
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleNumberChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="0"
                      className="border border-gray-300 rounded px-2 py-1.5 text-[14px] font-bold text-[#282828] text-center placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-white">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="font-bold text-[#333] text-[13px]">
                  Basic Salary :
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={basicSalary}
                    onChange={(e) =>
                      setBasicSalary(formatNumber(e.target.value))
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="0"
                    className="border border-gray-300 bg-white text-[#282828] font-bold text-[13px] text-center w-[100px] rounded px-2 py-1 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-[#43C17A]"
                  />
                </div>
              </div>

              {activeAllowances.map((allowance) => (
                <div
                  key={allowance.id}
                  className="flex justify-between items-center text-[12px]"
                >
                  <span
                    className={`font-bold ${allowance.isDeduction ? "text-red-500" : "text-[#333]"}`}
                  >
                    {allowance.name} :
                  </span>
                  <input
                    type="text"
                    value={allowance.amount}
                    onChange={(e) =>
                      handleActiveAllowanceAmount(
                        allowance.id,
                        e.target.value,
                        allowance.isDeduction,
                      )
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="0"
                    className={`border border-gray-200 rounded px-2 py-0.5 w-[80px] text-right font-bold outline-none text-[#282828] ${allowance.isDeduction ? "focus:border-red-500" : "focus:border-[#43C17A]"}`}
                  />
                </div>
              ))}

              <div className="flex flex-col gap-2 mt-1">
                {availableAllowances.map((allowance) => (
                  <div
                    key={allowance.id}
                    onClick={() => moveAllowanceToActive(allowance.id)}
                    className="flex items-center gap-2 cursor-pointer group w-fit"
                  >
                    <PlusIcon isRed={allowance.isDeduction} />
                    <span className="font-bold text-[#555] text-[12px] group-hover:text-[#333] transition-colors cursor-pointer">
                      {allowance.name}
                    </span>
                  </div>
                ))}

                {addingCustomAllowance ? (
                  <div className="flex flex-col gap-2 mt-2 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-4 text-[12px] font-semibold text-[#555]">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          className="accent-[#43C17A] cursor-pointer"
                          checked={customAllowanceType === "allowance"}
                          onChange={() => setCustomAllowanceType("allowance")}
                        />
                        Allowance
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          className="accent-red-500 cursor-pointer"
                          checked={customAllowanceType === "deduction"}
                          onChange={() => setCustomAllowanceType("deduction")}
                        />
                        Deduction
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customAllowanceName}
                        onChange={(e) => setCustomAllowanceName(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Name"
                        autoFocus
                        className="border text-[#282828] border-gray-300 rounded px-2 py-0.5 text-[12px] outline-none focus:border-[#43C17A] flex-1"
                      />
                      <button
                        onClick={saveCustomAllowance}
                        className={`text-white cursor-pointer px-2 py-0.5 rounded text-[11px] font-bold ${customAllowanceType === "deduction" ? "bg-red-500 hover:bg-red-600" : "bg-[#43C17A] hover:bg-[#3ba869]"}`}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingCustomAllowance(false);
                          setCustomAllowanceType("allowance");
                        }}
                        className="text-gray-400 cursor-pointer hover:text-red-500 text-[11px] font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setAddingCustomAllowance(true)}
                    className="flex items-center gap-2 cursor-pointer text-[#282828] group w-fit mt-1"
                  >
                    <PlusIcon />
                    <span className="font-bold text-[#333] text-[12px] cursor-pointer">
                      Others
                    </span>
                  </div>
                )}
              </div>

              <h4 className="font-bold text-[#333] text-[14px] mt-2 border-t border-gray-100 pt-3">
                Payroll Compliance
              </h4>

              <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-[12px]">
                {compliances.map((comp) => (
                  <div key={comp.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={comp.selected}
                      onChange={() => toggleCompliance(comp.id)}
                      className="accent-[#1a2f5c] cursor-pointer w-3.5 h-3.5 rounded"
                    />
                    <label
                      onClick={() => toggleCompliance(comp.id)}
                      className="font-bold text-[#2A3958] flex-1 cursor-pointer"
                    >
                      {comp.name}
                    </label>
                    <input
                      type="text"
                      value={comp.amount}
                      onChange={(e) =>
                        handleComplianceAmount(comp.id, e.target.value)
                      }
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="0"
                      className="border border-gray-200 rounded px-1 py-0.5 w-[60px] text-center text-[#282828] font-semibold outline-none focus:border-[#43C17A]"
                    />
                  </div>
                ))}
              </div>

              {addingCustomCompliance ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={customComplianceName}
                    onChange={(e) => setCustomComplianceName(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Compliance Name"
                    autoFocus
                    className="border text-[#282828] border-gray-300 rounded px-2 py-0.5 text-[12px] outline-none focus:border-[#43C17A] flex-1"
                  />
                  <button
                    onClick={saveCustomCompliance}
                    className="bg-[#43C17A] hover:bg-[#3ba869] text-white cursor-pointer px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingCustomCompliance(false)}
                    className="text-gray-400 cursor-pointer hover:text-red-500 text-[11px] font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setAddingCustomCompliance(true)}
                  className="flex items-center gap-2 cursor-pointer group w-fit mt-1"
                >
                  <PlusIcon />
                  <span className="font-bold text-[#333] text-[12px] cursor-pointer">
                    Others
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <h4 className="font-bold text-[#333] text-[14px] mb-2">
                Additional Add-ons
              </h4>
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 max-h-[220px] custom-scrollbar">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="border border-gray-200 rounded-lg p-3 bg-white transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => toggleAddon(addon.id)}
                      >
                        {!addon.isOpen ? (
                          <PlusIcon />
                        ) : (
                          <div className="w-[18px] h-[18px] shrink-0" />
                        )}
                        {addon.isOpen ? (
                          <span className="font-bold text-[#333] text-[13px]">
                            Configure Add-on
                          </span>
                        ) : (
                          <span
                            className={`font-bold text-[13px] ${addon.typeName ? "text-[#333]" : "text-gray-400 italic"}`}
                          >
                            {addon.typeName || "Unnamed Add-on"}
                          </span>
                        )}
                        {!addon.isOpen && addon.amount && (
                          <div className="flex items-center gap-1.5 ml-auto mr-2">
                            <span className="text-[11px] font-bold text-[#43C17A] bg-[#43C17A]/10 px-2 py-0.5 rounded">
                              ₹{addon.amount}
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                              {addon.payoutType}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeAddon(addon.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <svg
                            className="w-[16px] h-[16px]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        {addon.isOpen && (
                          <button
                            onClick={() => toggleAddon(addon.id)}
                            className="p-1 cursor-pointer"
                          >
                            <PlusIcon />
                          </button>
                        )}
                      </div>
                    </div>

                    {addon.isOpen && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-[#555]">
                            Type Name :
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Performance Bonus"
                            value={addon.typeName}
                            onChange={(e) =>
                              handleAddonChange(
                                addon.id,
                                "typeName",
                                e.target.value,
                              )
                            }
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className="border border-gray-300 rounded px-2.5 py-1 text-[13px] w-[200px] font-semibold text-[#282828] placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-[#555]">
                            Amount :
                          </label>
                          <input
                            type="text"
                            placeholder="0"
                            value={addon.amount}
                            onChange={(e) =>
                              handleAddonAmountChange(addon.id, e.target.value)
                            }
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className="border border-gray-300 rounded px-2.5 py-1 text-[13px] w-[200px] font-semibold text-[#282828] text-center placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                          />
                        </div>
                        <div className="flex justify-end gap-5 mt-1 pr-2">
                          {["Fixed", "Variable"].map((type) => (
                            <label
                              key={type}
                              className="flex items-center gap-1.5 font-bold text-[12px] text-[#2A3958] cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`payoutType-${addon.id}`}
                                checked={addon.payoutType === type}
                                onChange={() =>
                                  handleAddonChange(
                                    addon.id,
                                    "payoutType",
                                    type,
                                  )
                                }
                                className="w-3.5 h-3.5 accent-[#43C17A] cursor-pointer"
                              />{" "}
                              {type}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddOther}
                  className="flex items-center justify-center gap-2 mt-1 py-2.5 border-2 border-dashed border-[#43C17A] text-[#43C17A] rounded-lg font-bold text-[13px] hover:bg-[#43C17A]/5 transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Other Add-on
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className={`flex-1 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#555] py-2.5 rounded-lg font-bold text-[14px] transition-colors cursor-pointer ${isSaving ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 flex items-center justify-center bg-[#43C17A] hover:bg-[#3ba869] text-white py-2.5 rounded-lg font-bold text-[14px] shadow-md shadow-[#43C17A]/20 transition-all cursor-pointer ${isSaving ? "cursor-not-allowed opacity-80" : ""}`}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
