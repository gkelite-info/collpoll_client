"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddAnnouncementModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);

  const roles = ["College Admin", "Admin", "Student", "Parent"];

  if (!open) return null;

  const handleSave = async () => {

    const titleRegex = /^[A-Za-z\s]+$/;
    const today = new Date().toISOString().split("T")[0];

    if (!title || !date || !role) {
      toast.error("Please fill all fields!");
      return;
    }

    if (!titleRegex.test(title.trim())) {
      toast.error("Title should contain only letters");
      return;
    }

    if (date < today) {
      toast.error("Past dates are not allowed");
      return;
    }

    try {

      setSaving(true);

      // 🔹 Your API call will go here later
      // Example:
      // await saveAnnouncement({ title, date, role })

      toast.success("Announcement created successfully");

      setTitle("");
      setDate("");
      setRole("");

      onClose();

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

      <div
        className="bg-white w-[540px] rounded-xl shadow-xl p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-semibold text-[#2F2F2F]">
            Add Announcement
          </h2>

          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-black"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1 mb-5">
          <label className="text-base font-medium text-[#2F2F2F]">
            Title
          </label>

          <input
            type="text"
            placeholder="Short title of the announcement"
            value={title}
            onChange={(e) => {
              const value = e.target.value;

              if (/^[A-Za-z\s]*$/.test(value)) {
                setTitle(value);
              }
            }}
            className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F] placeholder:text-[#B0B0B0] outline-none focus:ring-2 focus:ring-[#43C17A]"
          />
        </div>

        {/* Schedule */}
        <div className="mb-6">
          <p className="text-base font-semibold text-[#2F2F2F] mb-3">
            Schedule
          </p>

          <div className="flex gap-4">

            {/* Date */}
            <div className="flex flex-col w-1/2">
              <label className="text-base font-medium text-[#2F2F2F] mb-1">
                Date
              </label>

              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F]"
              />
            </div>

            {/* Select Roles */}
            <div className="flex flex-col w-1/2">
              <label className="text-base font-medium text-[#2F2F2F] mb-1">
                Select Roles
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F]"
              >
                <option value="">Select Role</option>
                <option>College Admin</option>
                <option>Admin</option>
                <option>Student</option>
                <option>Parent</option>
              </select>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">

          <button
            onClick={onClose}
            className="flex-1 border border-[#CBD5E1] rounded-md py-2 text-[14px] text-[#4B5563] cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-2 rounded-md text-[14px] text-white ${
              saving
                ? "bg-[#A7DDBE] cursor-not-allowed"
                : "bg-[#43C17A] hover:bg-[#3AAA6B] cursor-pointer"
            }`}
          >
            {saving ? "Saving..." : "Save Announcement"}
          </button>

        </div>

      </div>
    </div>
  );
}