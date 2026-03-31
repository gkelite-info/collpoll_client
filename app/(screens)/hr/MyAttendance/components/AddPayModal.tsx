"use client";

import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { saveEmployeePayDetails } from "@/lib/helpers/Hr/myAttendance/saveEmployeePayDetails";
import React, { useState } from "react";
import toast from "react-hot-toast";

export interface EmployeePayData {
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
}

export default function AddPayModal({
  isOpen,
  onClose,
  onSuccess,
  employee,
}: AddPayModalProps) {
  const { collegeHrId, collegeId, loading: contextLoading } = useCollegeHr();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    totalCTC: "",
    fixedPay: "",
    variablePay: "",
    jobType: "Permanent",
    compType: "Direct Payment",
    totalLeaves: "",
    sickLeave: "",
    casualLeave: "",
    paidLeave: "",
    monthlySalary: "",
  });

  const [addons, setAddons] = useState([
    {
      id: "1",
      typeName: "Bonus",
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
  ]);

  if (!isOpen) return null;

  // --- HANDLERS ---
  const handleTextOrRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return;
    const formatted = Number(rawValue).toLocaleString("en-IN");
    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleAddonAmountChange = (id: string, value: string) => {
    if (value === "") {
      setAddons(addons.map((a) => (a.id === id ? { ...a, amount: "" } : a)));
      return;
    }
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return;
    const formatted = Number(rawValue).toLocaleString("en-IN");
    setAddons(
      addons.map((a) => (a.id === id ? { ...a, amount: formatted } : a)),
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
    // Basic presence checks
    if (!formData.totalCTC || !formData.fixedPay || !formData.monthlySalary) {
      toast.error("Please fill in Total CTC, Fixed Pay, and Monthly Salary.");
      return;
    }

    const ctc = parseInt(formData.totalCTC.replace(/,/g, "") || "0", 10);
    const fixed = parseInt(formData.fixedPay.replace(/,/g, "") || "0", 10);
    const variable = parseInt(
      formData.variablePay.replace(/,/g, "") || "0",
      10,
    );
    const monthly = parseInt(
      formData.monthlySalary.replace(/,/g, "") || "0",
      10,
    );

    const totalL = parseInt(formData.totalLeaves.replace(/,/g, "") || "0", 10);
    const sick = parseInt(formData.sickLeave.replace(/,/g, "") || "0", 10);
    const casual = parseInt(formData.casualLeave.replace(/,/g, "") || "0", 10);
    const paid = parseInt(formData.paidLeave.replace(/,/g, "") || "0", 10);

    // Mathematical Validations
    if (fixed <= 0 || monthly <= 0) {
      toast.error("Fixed Pay and Monthly Salary must be greater than 0.");
      return;
    }

    if (ctc !== fixed + variable) {
      toast.error(
        "Total CTC must be exactly equal to Fixed Pay + Variable Pay.",
      );
      return;
    }

    if (totalL !== sick + casual + paid) {
      toast.error(
        "Total Leaves must be exactly equal to Sick + Casual + Paid Leaves.",
      );
      return;
    }

    if (!formData.jobType || !formData.compType) {
      toast.error("Please select a Job Type and Compensation Type.");
      return;
    }

    if (contextLoading || !collegeId || !collegeHrId) {
      toast.error("HR Context loading. Please try again.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving pay details...");

    const result = await saveEmployeePayDetails({
      userId: parseInt(employee.id, 10),
      collegeId,
      collegeHrId,
      formData,
      addons,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Pay details saved successfully!", { id: toastId });
      onSuccess();
      setTimeout(() => onClose(), 1000);
    } else {
      toast.error(`Failed to save: ${result.error}`, { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[10px] w-full max-w-[850px] max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col custom-scrollbar">
        <h2 className="text-[18px] font-bold text-[#333] mb-3">
          Add Pay Details
        </h2>

        <div className="border border-gray-200 rounded-lg p-3.5 flex items-start gap-5 mb-5 bg-[#fafafa]">
          <img
            src={employee.image}
            alt={employee.name}
            className="w-[80px] h-[80px] rounded object-cover bg-gray-200 shadow-sm"
          />
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
                      className="accent-emerald-500 cursor-pointer w-3.5 h-3.5"
                    />{" "}
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#333] text-[14px] mb-2">
                Compensation Type
              </h4>
              <div className="border border-gray-200 rounded-lg p-2.5 flex justify-between items-center text-[13px]">
                {["PF", "EF", "TDS", "Direct Payment"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1.5 font-bold text-[#2A3958] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="compType"
                      value={type}
                      checked={formData.compType === type}
                      onChange={handleTextOrRadioChange}
                      className="accent-emerald-500 cursor-pointer w-3.5 h-3.5"
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
                      placeholder="0"
                      className="border border-gray-300 rounded px-2 py-1.5 text-[14px] font-bold text-[#282828] text-center placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-[#333] text-[14px] mb-2 opacity-0 hidden md:block">
                Monthly Salary
              </h4>
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-center items-center gap-2 bg-[#fafafa]">
                <span className="font-bold text-[#555] text-[14px]">
                  Monthly Salary :
                </span>
                <div className="border border-gray-200 bg-white rounded w-full py-2 flex justify-center items-center shadow-inner">
                  <input
                    type="text"
                    name="monthlySalary"
                    value={formData.monthlySalary}
                    onChange={handleNumberChange}
                    placeholder="e.g. 50,000"
                    className="font-bold text-[18px] text-[#282828] text-center w-full focus:outline-none bg-transparent placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <h4 className="font-bold text-[#333] text-[14px] mb-2">
                Additional Add-ons
              </h4>
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 max-h-[320px] custom-scrollbar">
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
                          <svg
                            className="w-4 h-4 text-[#43C17A] shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 shrink-0" />
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
                            <svg
                              className="w-4 h-4 text-[#43C17A]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5a.75.75 0 000-1.5H9a.75.75 0 000 1.5h6z"
                                clipRule="evenodd"
                              />
                            </svg>
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
                            className="border border-gray-300 rounded px-2.5 py-1 text-[13px] w-[200px] font-semibold text-[#282828] placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:border-[#43C17A]"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-[#555]">
                            Amount :
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2,000"
                            value={addon.amount}
                            onChange={(e) =>
                              handleAddonAmountChange(addon.id, e.target.value)
                            }
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
                                className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
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
            onClick={onClose}
            disabled={isSaving}
            className={`flex-1 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#555] py-2.5 rounded-lg font-bold text-[14px] transition-colors ${isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 flex items-center justify-center bg-[#43C17A] hover:bg-[#3ba869] text-white py-2.5 rounded-lg font-bold text-[14px] shadow-md shadow-[#43C17A]/20 transition-all ${isSaving ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
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
              "Save Details"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
