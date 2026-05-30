"use client";

import { X, CaretDown } from "@phosphor-icons/react";
import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

interface WellbeingRequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

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

export default function WellbeingRequestLeaveModal({
  isOpen,
  onClose,
  onSubmit,
}: WellbeingRequestLeaveModalProps) {
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid =
    !formData.leaveType ||
    !formData.startDate ||
    !formData.endDate ||
    !formData.description.trim();

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

                  <div className="custom-scrollbar overflow-y-auto max-h-[260px]">
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
                              ? "bg-[#E7F8EE] text-[#43C17A] font-semibold"
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
              disabled={isSubmitting || isFormInvalid}
              className="h-11 cursor-pointer rounded bg-[#43C17A] text-sm font-semibold text-white hover:bg-[#34A565] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
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
