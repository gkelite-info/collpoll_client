"use client";

import { CaretDown, X } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

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
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormData(initialFormData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[520px] rounded-md bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
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
            </label>
            <div className="relative">
              <select
                required
                value={formData.leaveType}
                onChange={(event) =>
                  setFormData({ ...formData, leaveType: event.target.value })
                }
                className="h-11 w-full appearance-none rounded border border-[#CFCFCF] bg-white px-4 pr-10 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
              >
                <option value="">Select Leave Type</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
                <option value="Emergency">Emergency</option>
                <option value="Travel">Travel</option>
                <option value="Medical">Medical</option>
                <option value="Function">Function</option>
              </select>
              <CaretDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#282828]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Leave Date
            </label>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#282828]">
                  Start Date
                </span>
                <label className="relative">
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        startDate: event.target.value,
                      })
                    }
                    className="h-10 w-full rounded border border-[#CFCFCF] px-4 pr-10 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#282828]">
                  End Date
                </span>
                <label className="relative">
                  <input
                    required
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate || undefined}
                    onChange={(event) =>
                      setFormData({ ...formData, endDate: event.target.value })
                    }
                    className="h-10 w-full rounded border border-[#CFCFCF] px-4 pr-10 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Description
            </label>
            <textarea
              required
              rows={5}
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
              onClick={onClose}
              className="h-11 cursor-pointer rounded bg-[#E0E0E0] text-sm font-semibold text-[#282828] hover:bg-[#D5D5D5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 cursor-pointer rounded bg-[#43C17A] text-sm font-semibold text-white hover:bg-[#34A565]"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
