"use client";

import { CaretDown, X } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { useUser } from "@/app/utils/context/UserContext";
import { createEmployeeLeaveRequest } from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";

type RequestLeaveModalProps = {
  open: boolean;
  onClose: () => void;
};

type LeaveFormData = {
  leaveType: string;
  startDate: string;
  endDate: string;
  description: string;
};

const defaultLeaveTypes = [
  "Sick",
  "Personal",
  "Emergency",
  "Travel",
  "Others",
];

const initialFormData: LeaveFormData = {
  leaveType: "",
  startDate: "",
  endDate: "",
  description: "",
};

export default function RequestLeaveModal({
  open,
  onClose,
}: RequestLeaveModalProps) {
  const { userId, role } = useUser();
  const { collegeId, loading: financeContextLoading } = useFinanceManager();
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setFormData(initialFormData);
    setIsDropdownOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || !collegeId || role !== "Finance" || financeContextLoading) {
      toast.error("Finance executive session not found. Please re-login.");
      return;
    }

    if (!formData.leaveType) {
      toast.error("Please select a leave type.");
      return;
    }

    if (!formData.startDate) {
      toast.error("Please select a start date.");
      return;
    }

    if (!formData.endDate) {
      toast.error("Please select an end date.");
      return;
    }

    if (formData.endDate < formData.startDate) {
      toast.error("End date cannot be before start date.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEmployeeLeaveRequest({
        userId,
        collegeId,
        role: "Finance",
        leaveType: formData.leaveType,
        leaveFromDate: formData.startDate,
        leaveToDate: formData.endDate,
        description: formData.description.trim(),
      });

      toast.success("Leave request submitted successfully.");
      window.dispatchEvent(new Event("employee-leave-request-created"));
      resetForm();
      onClose();
    } catch (error) {
      toast.error(getSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="custom-scrollbar relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-md bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 cursor-pointer text-[#525252]"
        >
          <X size={22} />
        </button>
        <h2 className="text-xl font-semibold text-[#282828]">Request Leave</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Leave Type
              <RequiredMark />
            </label>
            <div className="relative">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDropdownOpen((isOpen) => !isOpen)}
                className="flex h-11 w-full cursor-pointer items-center justify-between rounded border border-[#43C17A] bg-white px-4 text-sm text-[#525252] outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {formData.leaveType || "Select Leave Type"}
                <CaretDown
                  size={18}
                  className={`text-[#282828] transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-[320px] overflow-hidden rounded border border-[#CFCFCF] bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, leaveType: "" })
                    }
                    className="flex h-10 w-full items-center bg-[#1F6FD6] px-4 text-left text-sm font-semibold text-white"
                  >
                    Select Leave Type
                  </button>

                  <div className="custom-scrollbar max-h-[260px] overflow-y-auto">
                    {defaultLeaveTypes.map((leaveType) => {
                      const isSelected = formData.leaveType === leaveType;
                      return (
                        <button
                          key={leaveType}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, leaveType });
                            setIsDropdownOpen(false);
                          }}
                          className={`flex h-10 w-full cursor-pointer items-center px-4 text-left text-sm transition-colors duration-150 ${
                            isSelected
                              ? "bg-[#E7F8EE] font-semibold text-[#43C17A]"
                              : "text-[#282828] hover:bg-gray-50"
                          }`}
                        >
                          {leaveType}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Field label="Leave Date">
            <div className="grid grid-cols-2 gap-5">
              <input
                required
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    startDate: event.target.value,
                    endDate:
                      formData.endDate && formData.endDate < event.target.value
                        ? ""
                        : formData.endDate,
                  })
                }
                className="h-12 rounded-xl border border-[#CFCFCF] px-4 text-sm outline-none focus:border-[#43C17A]"
              />
              <input
                required
                type="date"
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={(event) =>
                  setFormData({ ...formData, endDate: event.target.value })
                }
                className="h-12 rounded-xl border border-[#CFCFCF] px-4 text-sm outline-none focus:border-[#43C17A]"
              />
            </div>
          </Field>
          <Field label="Description">
            <textarea
              required
              rows={5}
              maxLength={255}
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              placeholder="Provide a short explanation for your leave request............"
              className="w-full resize-none rounded border border-[#CFCFCF] px-4 py-3 text-sm outline-none focus:border-[#43C17A]"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={handleClose} disabled={isSubmitting} className="h-11 cursor-pointer rounded bg-[#E0E0E0] text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="h-11 cursor-pointer rounded bg-[#43C17A] text-sm font-semibold text-white hover:bg-[#34A565] disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-[#282828]">
      <span>
        {label}
        <RequiredMark />
      </span>
      {children}
    </label>
  );
}

function RequiredMark() {
  return <span className="ml-1 text-[#FF2020]">*</span>;
}

function getSubmitErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "22P02"
  ) {
    return "This leave type is not allowed in the database enum yet.";
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "42501"
  ) {
    return "Database policy is blocking this leave request. Please update the RLS insert policy for employee_leave_requests.";
  }

  return error instanceof Error
    ? error.message
    : "Unable to submit leave request.";
}
