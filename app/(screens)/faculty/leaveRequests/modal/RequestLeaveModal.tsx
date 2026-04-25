"use client";

import { X, CaretDown } from "@phosphor-icons/react";
import { useState } from "react";

interface FacultyRequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function FacultyRequestLeaveModal({
  isOpen,
  onClose,
  onSubmit,
}: FacultyRequestLeaveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-2">
          <h2 className="text-2xl font-bold text-[#282828]">Request Leave</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer disabled:opacity-50"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[15px] font-semibold text-[#282828]">
              Leave Type
            </label>
            <div className="relative">
              <select
                required
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
                className="w-full appearance-none border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer bg-white"
              >
                <option value="" disabled>
                  Select Leave Type
                </option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
                <option value="Emergency">Emergency</option>
                <option value="Travel">Travel</option>
                <option value="Function">Function</option>
              </select>
              <CaretDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[15px] font-semibold text-[#282828]">
              Leave Date
            </label>
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-semibold text-[#525252]">
                  Start Date
                </span>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-semibold text-[#525252]">
                  End Date
                </span>
                <input
                  type="date"
                  required
                  min={
                    formData.startDate || new Date().toISOString().split("T")[0]
                  }
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[15px] font-semibold text-[#282828]">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide a short explanation for your leave request.........."
              className="w-full resize-none border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#EAEAEA] cursor-pointer text-[#525252] rounded-md font-bold text-sm hover:bg-[#dfdfdf] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#43C17A] cursor-pointer text-white rounded-md font-bold text-sm hover:bg-[#3ba869] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
