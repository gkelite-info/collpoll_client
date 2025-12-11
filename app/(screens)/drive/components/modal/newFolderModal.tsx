"use client";

import { useEffect, useState } from "react";

type NewFolderModalProps = {
  open: boolean;
  onCancel: () => void;
  onSave: (data: { name: string; color: string }) => void;
};

const FOLDER_COLORS = ["#0096A6", "#FFAB66", "#2C5A99", "#9B8ACF", "#FF6FAE"];

export default function NewFolderModal({
  open,
  onCancel,
  onSave,
}: NewFolderModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setColor(FOLDER_COLORS[0]);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }
    if (/[@#%]/.test(name)) {
      setError("Folder name cannot contain @ # %");
      return;
    }
    onSave({ name: name.trim(), color });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">
          New Folder
        </h3>

        {/* Folder name */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-[#111827]">
            Folder Name
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter folder name"
            className="w-full rounded border border-[#D1D5DB] px-3 py-2 text-sm outline-none text-black focus:border-[#43C17A]"
          />
          <p className="mt-1 text-xs text-[#6B7280]">
            No special characters like @ # %
          </p>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-[#111827]">
            Choose Folder Color
          </p>
          <div className="flex gap-2 rounded border border-[#E5E7EB] bg-white p-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded ${
                  color === c ? "ring-2 ring-offset-2 ring-[#43C17A]" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded bg-[#43C17A] py-2 text-sm font-semibold text-white"
          >
            Save Folder
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded border border-[#D1D5DB] py-2 text-sm font-semibold text-[#111827]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
