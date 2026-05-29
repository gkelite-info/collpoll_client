"use client";

import { CaretDown, X } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { useUser } from "@/app/utils/context/UserContext";
import { createEmployeeLeaveRequest } from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";

type AdminRequestLeaveModalProps = {
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
  "Casual",
  "Sick",
  "Personal",
  "Emergency",
  "Travel",
  "Medical",
];

const initialFormData: LeaveFormData = {
  leaveType: "",
  startDate: "",
  endDate: "",
  description: "",
};

export default function AdminRequestLeaveModal({
  open,
  onClose,
}: AdminRequestLeaveModalProps) {
  const { userId, role } = useUser();
  const { collegeId, loading: adminContextLoading } = useAdmin();
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  const [leaveTypes, setLeaveTypes] = useState(defaultLeaveTypes);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOtherInputOpen, setIsOtherInputOpen] = useState(false);
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setFormData(initialFormData);
    setIsDropdownOpen(false);
    setIsOtherInputOpen(false);
    setCustomLeaveType("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddCustomLeaveType = () => {
    const trimmedLeaveType = customLeaveType.trim();

    if (!trimmedLeaveType) {
      toast.error("Please enter a leave type.");
      return;
    }

    setLeaveTypes((currentTypes) =>
      currentTypes.some(
        (leaveType) =>
          leaveType.toLowerCase() === trimmedLeaveType.toLowerCase(),
      )
        ? currentTypes
        : [...currentTypes, trimmedLeaveType],
    );
    setFormData((currentFormData) => ({
      ...currentFormData,
      leaveType: trimmedLeaveType,
    }));
    setCustomLeaveType("");
    setIsOtherInputOpen(false);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || !collegeId || !role || adminContextLoading) {
      toast.error("Admin session not found. Please re-login.");
      return;
    }

    if (role !== "Admin") {
      toast.error("This request is available for admins only.");
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
        role: "Admin",
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
      const message = getSubmitErrorMessage(error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <style>{`
        .request-leave-date-input::-webkit-calendar-picker-indicator {
          margin-left: auto;
          cursor: pointer;
        }
      `}</style>
      <div className="custom-scrollbar relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-md bg-white p-6 shadow-2xl">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center text-[#525252] hover:text-[#282828]"
          type="button"
        >
          <X size={22} />
        </button>
        <h2 className="pr-10 text-xl font-semibold text-[#282828]">
          Request Leave
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Leave Type
              <RequiredMark />
            </label>
            <div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDropdownOpen((isOpen) => !isOpen)}
                className="flex h-11 w-full cursor-pointer items-center justify-between rounded border border-[#43C17A] bg-white px-4 text-sm text-[#525252] outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {formData.leaveType || "Select Leave Type"}
                <CaretDown size={18} className="text-[#282828]" />
              </button>

              {isDropdownOpen && (
                <div className="mt-1 max-h-[320px] overflow-hidden rounded border border-[#CFCFCF] bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, leaveType: "" })
                    }
                    className="flex h-10 w-full items-center bg-[#1F6FD6] px-4 text-left text-sm font-semibold text-white"
                  >
                    Select Leave Type
                  </button>

                  <div className="custom-scrollbar max-h-[205px] overflow-y-auto">
                    {leaveTypes.map((leaveType) => (
                      <button
                        key={leaveType}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, leaveType });
                          setIsDropdownOpen(false);
                          setIsOtherInputOpen(false);
                        }}
                        className="flex h-10 w-full cursor-pointer items-center px-4 text-left text-sm text-[#282828] hover:bg-[#F3F7F5]"
                      >
                        {leaveType}
                      </button>
                    ))}
                  </div>

                  {!isOtherInputOpen ? (
                    <button
                      type="button"
                      onClick={() => setIsOtherInputOpen(true)}
                      className="flex h-10 w-full cursor-pointer items-center px-4 text-left text-sm font-semibold text-[#43C17A] hover:bg-[#F3F7F5]"
                    >
                      Others
                    </button>
                  ) : (
                    <div className="border-t border-[#E5E5E5] p-3">
                      <input
                        autoFocus
                        value={customLeaveType}
                        onChange={(event) =>
                          setCustomLeaveType(event.target.value)
                        }
                        placeholder="Enter leave type"
                        className="h-10 w-full rounded border border-[#CFCFCF] px-3 text-sm outline-none focus:border-[#43C17A]"
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomLeaveType("");
                            setIsOtherInputOpen(false);
                          }}
                          className="h-9 cursor-pointer rounded bg-[#E0E0E0] text-sm font-semibold text-[#282828]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomLeaveType}
                          className="h-9 cursor-pointer rounded bg-[#43C17A] text-sm font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Leave Date
              <RequiredMark />
            </label>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#282828]">
                  Start Date
                  <RequiredMark />
                </span>
                <label className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        startDate: event.target.value,
                        endDate:
                          formData.endDate &&
                          formData.endDate < event.target.value
                            ? ""
                            : formData.endDate,
                      })
                    }
                    className="request-leave-date-input h-12 w-full rounded-xl border border-[#CFCFCF] px-5 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#282828]">
                  End Date
                  <RequiredMark />
                </span>
                <label className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate || undefined}
                    onChange={(event) =>
                      setFormData({ ...formData, endDate: event.target.value })
                    }
                    className="request-leave-date-input h-12 w-full rounded-xl border border-[#CFCFCF] px-5 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Description
              <RequiredMark />
            </label>
            <textarea
              rows={5}
              maxLength={255}
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              placeholder="Provide a short explanation for your leave request............"
              className="w-full resize-none rounded border border-[#CFCFCF] px-4 py-3 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
            />
          </div>

          <div className="mt-1 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-11 cursor-pointer rounded bg-[#E0E0E0] text-sm font-semibold text-[#282828] hover:bg-[#D5D5D5] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 cursor-pointer rounded bg-[#43C17A] text-sm font-semibold text-white hover:bg-[#34A565] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RequiredMark() {
  return <span className="ml-1 text-[#FF2020]">*</span>;
}

function getSubmitErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Failed to submit leave request.";
}
