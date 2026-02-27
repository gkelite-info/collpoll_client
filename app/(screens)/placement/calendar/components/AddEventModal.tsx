"use client";

import { X } from "@phosphor-icons/react";
import { useState } from "react";

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all";

/* ✅ MOVE TYPE HERE (OUTSIDE COMPONENT) */
type AddEventModalProps = {
  isOpen: boolean;
  initialData: any;
  onClose: () => void;
  onSave: (payload: any) => void;
  mode: "create" | "edit";
  isSaving: boolean;
};

/* ✅ USE TYPE HERE */
export default function AddEventModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  mode,
  isSaving,
}: AddEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">Add Event</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 pt-0 space-y-3 overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Event Title</label>
            <input type="text" placeholder="Enter title" className={INPUT} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Event Topic</label>
            <input type="text" placeholder="Enter topic" className={INPUT} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
              <input type="date" className={INPUT} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Room no.</label>
              <input type="text" placeholder="Enter Room no." className={INPUT} />
            </div>
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <div className="flex gap-1 mt-1">
                <select className={`${INPUT} px-1 text-center`}><option>09</option></select>
                <select className={`${INPUT} px-1 text-center`}><option>00</option></select>
                <select className={`${INPUT} px-1 text-center`}><option>AM</option></select>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <div className="flex gap-1 mt-1">
                <select className={`${INPUT} px-1 text-center`}><option>10</option></select>
                <select className={`${INPUT} px-1 text-center`}><option>00</option></select>
                <select className={`${INPUT} px-1 text-center`}><option>AM</option></select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <select className={INPUT}><option>Select Branch</option></select>
            <select className={INPUT}><option>Select Year</option></select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select className={INPUT}><option>Select Semester</option></select>
            <select className={INPUT}><option>Select Section</option></select>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 bg-[#43C17A] text-white py-3 rounded-lg font-bold hover:bg-[#39a868] transition shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}