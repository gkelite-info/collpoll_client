"use client";
import React from "react";
import { X, CaretDown } from "@phosphor-icons/react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-999 text-black flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[460px] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#2D3748]">Add User</h2>
          <X
            size={18}
            weight="bold"
            className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
            onClick={onClose}
          />
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3EAD6F] outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">Email ID</label>
            <input
              type="email"
              placeholder="name@gmail.com"
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3EAD6F] outline-none placeholder:text-gray-300 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">ID</label>
              <input
                type="text"
                placeholder="ID9876345678"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Contact
              </label>
              <input
                type="text"
                placeholder="9023456789"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Department
              </label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600">
                  <option>CSE</option>
                  <option>ECE</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Role</label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600">
                  <option>Student</option>
                  <option>Faculty</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Year</label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600">
                  <option>1st Year</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Sec</label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600">
                  <option>A section</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#48C78E] cursor-pointer text-white text-sm font-bold py-2 rounded-lg hover:bg-[#3ead6f] active:scale-[0.98] transition-all"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 border cursor-pointer border-gray-200 text-gray-500 text-sm font-bold py-2 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
