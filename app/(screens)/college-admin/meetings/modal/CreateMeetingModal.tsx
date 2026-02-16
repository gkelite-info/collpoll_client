"use client";

import { CaretRight, X } from "@phosphor-icons/react";
import { useState } from "react";
import SelectAdminModal from "./SelectAdminModal";

export default function CreateMeetingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const [adminModalOpen, setAdminModalOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-base"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[720px] max-h-[90vh] bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-y-auto px-10 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#282828]">
            Create Meeting
          </h2>
          <button onClick={onClose} className="text-[#282828] hover:text-black">
            <X size={22} />
          </button>

        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-lg font-regular text-[#282828] mb-1">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g., Monthly Review with B.Tech Admins"
            className="w-full text-[#282828] border border-[#CCCCCC] rounded-md px-4 py-2 text-sm placeholder:text-[#BDBDBD] focus:ring-1 focus:ring-[#43C17A] outline-none"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-lg font-regular text-[#282828] mb-2">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Brief description of the meeting.......!!!!"
            className="w-full bg-white border border-[#CCCCCC] text-[#282828] rounded-md px-4 py-0 text-sm placeholder:text-[#BDBDBD] focus:ring-1 focus:ring-[#43C17A] outline-none"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-8 mb-4">

          {/* Date */}
          <div>
            <label className="block text-lg font-regular text-[#282828] mb-2">
              Date
            </label>
            <input
              type="text"
              placeholder="DD | MM | YYYY"
              className="w-full border border-[#CCCCCC] text-[#282828] rounded-md px-4 py-2 text-sm text-center placeholder:text-[#BDBDBD] focus:ring-1 focus:ring-[#43C17A] outline-none"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-lg font-regular text-[#282828] mb-2">
              Time
            </label>

            <div className="flex gap-4">
              <select
                defaultValue=""
                className="flex-1 bg-white border border-[#CCCCCC] rounded-md px-3 py-2 text-sm text-[#BDBDBD]"
              >
                <option value="" disabled hidden>
                  HH
                </option>
                <option value="09" className="text-[#282828]">09</option>
              </select>

              <select
                defaultValue=""
                className="flex-1 bg-white border border-[#CCCCCC] rounded-md px-3 py-2 text-sm text-[#BDBDBD]"
              >
                <option value="" disabled hidden>
                  MM
                </option>
                <option value="00" className="text-[#282828]">00</option>
              </select>

              <select
                defaultValue=""
                className="flex-1 bg-white border border-[#CCCCCC] rounded-md px-3 py-2 text-sm text-[#BDBDBD]"
              >
                <option value="" disabled hidden>
                  AM/PM
                </option>
                <option value="AM" className="text-[#282828]">AM</option>
                <option value="PM" className="text-[#282828]">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Education & Admin */}
        <div className="grid grid-cols-2 gap-8 mb-6">

          <div>
            <label className="block text-lg font-regular text-[#282828] mb-2">
              Education Type
            </label>
            <select
              defaultValue=""
              className="w-full bg-white border border-[#CCCCCC] rounded-md px-4 py-2 text-sm text-[#BDBDBD]"
            >
              <option value="" disabled hidden>
                Select Educational Type
              </option>
              <option value="BTech" className="text-[#282828]">Select Educattional Type</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-regular rounded-md text-[#282828] mb-2">
              Admin(s)
            </label>

            <div
              onClick={() => setAdminModalOpen(true)}
              className="w-full bg-white border border-[#CCCCCC] rounded-md px-4 py-2 text-sm text-[#BDBDBD] cursor-pointer flex items-center justify-between"
            >
              <span>Select Admins</span>
              <CaretRight size={18} className="text-[#BDBDBD]" />
            </div>
          </div>

        </div>

        {/* Meeting Link */}
        <div className="mb-6">
          <label className="block text-lg font-regular text-[#282828] mb-2">
            Meeting Link
          </label>
          <input
            type="text"
            placeholder="Enter meeting link"
            className="w-full bg-white border border-[#CCCCCC] rounded-md px-4 py-2 text-sm placeholder:text-[#BDBDBD]"
          />
        </div>

        {/* Notifications */}
        <div className="mb-8">
          <label className="block text-lg font-regular text-[#282828] mb-4">
            Notifications
          </label>

          <div className="grid grid-cols-2 gap-8">
            <label className="flex items-center gap-3 bg-white border border-[#CCCCCC] rounded-md px-3 py-2 cursor-pointer transition w-full">
              <input type="checkbox" className="w-4 h-4 accent-[#43C17A]" />
              <span className="text-[14px] text-[#282828]">
                In-app notification
              </span>
            </label>

            <label className="flex items-center gap-3 bg-white border border-[#CCCCCC] rounded-md px-5 py-2 cursor-pointer transition w-full">
              <input type="checkbox" className="w-4 h-4 accent-[#43C17A]" />
              <span className="text-[14px] text-[#282828]">
                Email notification
              </span>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-6">
          <button
            onClick={onClose}
            className="flex-1 bg-[#D9D9D9] text-[#282828] py-2 rounded-md font-medium cursor-pointer"
          >
            Cancel
          </button>

          <button className="flex-1 bg-[#43C17A] text-white py-2 rounded-md font-medium hover:opacity-90 transition cursor-pointer">
            Schedule
          </button>
        </div>

      </div>

      {adminModalOpen && (
        <SelectAdminModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
        />
      )}
    </div>
  );
}
