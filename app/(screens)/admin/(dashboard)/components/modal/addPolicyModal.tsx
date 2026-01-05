import React from "react";
import { X } from "@phosphor-icons/react";

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-[640px] rounded-xl shadow-2xl overflow-hidden font-sans border border-gray-100">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">
              Add New Policy
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} weight="bold" />
            </button>
          </div>
          <p className="text-[14px] text-gray-500 mt-1">
            Define and configure a new institutional policy to be applied across
            the system.
          </p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#333333]">
              Policy Name
            </label>
            <input
              type="text"
              placeholder='Short, unique title (e.g., "Attendance Requirement")'
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-green-500 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#333333]">
              Description
            </label>
            <textarea
              placeholder="Clearly describe the rule and its intent"
              rows={2}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-green-500 placeholder:text-gray-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[14px] font-bold text-[#333333]">
              Status
            </label>
            <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-[#43C17A] transition-colors focus:outline-none">
              <span className="inline-block h-3 w-3 translate-x-6 transform rounded-full bg-white transition-transform" />
            </button>
          </div>

          <div className="flex gap-4 pt-2">
            <button className="flex-1 py-3 bg-[#43C17A] hover:bg-[#3bad6d] text-white text-[15px] font-bold rounded-lg transition-colors shadow-sm">
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-[15px] font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPolicyModal;
