import React from "react";
import { X } from "@phosphor-icons/react";

interface AddAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAutomationModal: React.FC<AddAutomationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed text-[#282828] inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[600px] rounded-xl shadow-2xl overflow-hidden font-sans">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#282828]">Automation Name</h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <input
              type="text"
              placeholder="Automation Name"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#282828]">Type</label>
              <input
                type="text"
                defaultValue="Notification"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#282828]">
                Target Module
              </label>
              <input
                type="text"
                defaultValue="Students"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#282828]">
              Trigger Settings
            </h3>

            <div className="grid grid-cols-2 justify-between gap-6">
              <div className="space-y-3">
                <label className="text-[13px] text-gray-600">
                  Run Frequency
                </label>
                <div className="flex items-center gap-2 border border-gray-300 px-3 py-3 rounded-lg">
                  {["Hourly", "Daily", "Weekly", "Monthly"].map((freq) => (
                    <label
                      key={freq}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="frequency"
                          defaultChecked={freq === "Monthly"}
                          className="peer appearance-none w-3 h-3 border border-gray-400 rounded-full checked:border-[#43C17A] transition-all"
                        />
                        <div className="absolute w-2 h-2 bg-[#43C17A] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-xs text-gray-700">{freq}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="">
                <label className="text-[13px] text-gray-600">
                  Schedule Time
                </label>
                <input
                  type="text"
                  defaultValue="07:00 AM"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <p className="text-[12px] text-gray-500 pt-2">
            Last Modified By : Admin 25 Nov 2025
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button className="w-full cursor-pointer py-3 bg-[#43C17A] hover:bg-[#3bad6d] text-white font-bold rounded-lg transition-colors">
              Save
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAutomationModal;
