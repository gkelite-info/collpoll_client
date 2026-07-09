"use client";

import { X, CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import toast from "react-hot-toast";
import EmployeeLeaveRoutingFields, {
  hasRequiredEmployeeLeaveTags,
} from "@/app/components/modals/EmployeeLeaveRoutingFields";
import { EmployeeLeaveTagSelection } from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestTagsAPI";
import { useUser } from "@/app/utils/context/UserContext";

interface FacultyRequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FacultyLeaveFormData) => Promise<void>;
}

type FacultyLeaveFormData = {
  leaveType: string;
  startDate: string;
  endDate: string;
  description: string;
  tags: EmployeeLeaveTagSelection[];
};

const defaultLeaveTypes = [
  "Sick",
  "Personal",
  "Emergency",
  "Travel",
  "Others",
];

export default function FacultyRequestLeaveModal({
  isOpen,
  onClose,
  onSubmit,
}: FacultyRequestLeaveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { role } = useUser();

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    description: "",
    tags: [] as EmployeeLeaveTagSelection[],
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      description: "",
      tags: [],
    });
    setIsDropdownOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveType) {
      toast.error("Please select a leave type.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select the leave dates.");
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

    if (!hasRequiredEmployeeLeaveTags(role, formData.tags)) {
      toast.error("Please select all required tagged users.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="custom-scrollbar relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-md bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#282828]">Request Leave</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer disabled:opacity-50"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

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
                <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded border border-[#CFCFCF] bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, leaveType: "" })
                    }
                    className="flex h-10 w-full items-center bg-[#1F6FD6] px-4 text-left text-sm font-semibold text-white"
                  >
                    Select Leave Type
                  </button>
                  {defaultLeaveTypes.map(
                    (leaveType) => (
                      <button
                        key={leaveType}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, leaveType });
                          setIsDropdownOpen(false);
                        }}
                        className={`flex h-10 w-full cursor-pointer items-center px-4 text-left text-sm ${
                          formData.leaveType === leaveType
                            ? "bg-[#E7F8EE] font-semibold text-[#43C17A]"
                            : "text-[#282828] hover:bg-gray-50"
                        }`}
                      >
                        {leaveType}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          <EmployeeLeaveRoutingFields
            value={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
          />

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
                <input
                  type="date"
                  required
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
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#282828]">
                  End Date
                  <RequiredMark />
                </span>
                <input
                  type="date"
                  required
                  min={formData.startDate || undefined}
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="request-leave-date-input h-12 w-full rounded-xl border border-[#CFCFCF] px-5 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Description
              <RequiredMark />
            </label>
            <textarea
              required
              rows={5}
              maxLength={255}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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
              disabled={
                isSubmitting ||
                !formData.leaveType ||
                !formData.startDate ||
                !formData.endDate ||
                !formData.description.trim() ||
                !hasRequiredEmployeeLeaveTags(role, formData.tags)
              }
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded bg-[#43C17A] text-sm font-semibold text-white hover:bg-[#34A565] disabled:cursor-not-allowed disabled:opacity-50"
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
