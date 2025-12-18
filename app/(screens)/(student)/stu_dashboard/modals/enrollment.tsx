'use client';

import { X } from "@phosphor-icons/react";

type ConfirmEnrollmentModalProps = {
  open: boolean;
  subjectName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmEnrollmentModal({
  open,
  subjectName,
  onClose,
  onConfirm,
}: ConfirmEnrollmentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[420px] animate-fadeIn relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-[#282828]">
            Confirm Enrollment
          </h2>

          <button onClick={onClose}>
            <X
              size={22}
              weight="bold"
              className="text-[#282828] cursor-pointer"
            />
          </button>
        </div>

        <p className="text-sm text-[#515151] mb-4">
          Once confirmed, this subject will be added to your hall ticket.
        </p>

        <div className="bg-[#F6F7F9] rounded-md px-4 py-3 mb-5">
          <p className="text-[#282828] font-medium text-sm">
            {subjectName}
          </p>
        </div>

        {/* ⚠️ Note */}
        <p className="text-xs text-[#7A7A7A] mb-5">
          Once enrolled, you won’t be able to cancel this action.
        </p>

        {/* 🔘 Actions */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="w-1/2 bg-[#43C17A] text-white py-2 rounded-md text-sm hover:bg-[#3AAA6B] cursor-pointer"
          >
            Confirm
          </button>

          <button
            onClick={onClose}
            className="w-1/2 border py-2 rounded-md text-sm text-[#282828] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
