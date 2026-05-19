"use client";

import { X } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

type CreateMeetingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingMeetingId?: number | null;
  editingSectionId?: number | null;
};

const inputStyle =
  "h-10 rounded-md border border-[#D9D9D9] px-3 text-sm text-[#282828] outline-none focus:border-[#43C17A]";

export default function CreateMeetingModal({
  isOpen,
  onClose,
  onSuccess,
  editingMeetingId,
}: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTitle("");
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#282828]">
            {editingMeetingId ? "Edit Meeting" : "Create Meeting"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-[#525252] hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Meeting Title
            </label>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter meeting title"
              className={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#282828]">
                Date
              </label>
              <input required type="date" className={inputStyle} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#282828]">
                Meeting Link
              </label>
              <input
                required
                placeholder="https://meet.example.com"
                className={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#282828]">
                From
              </label>
              <input required type="time" className={inputStyle} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#282828]">
                To
              </label>
              <input required type="time" className={inputStyle} />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#282828]">
              Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Add meeting description"
              className="resize-none rounded-md border border-[#D9D9D9] px-3 py-2 text-sm text-[#282828] outline-none focus:border-[#43C17A]"
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 cursor-pointer rounded-md bg-[#E7E7E7] text-sm font-semibold text-[#282828]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-md bg-[#43C17A] text-sm font-semibold text-white"
            >
              Save Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
