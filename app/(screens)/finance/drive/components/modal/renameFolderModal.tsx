"use client";

import { useEffect, useState } from "react";

type RenameFolderModalProps = {
  open: boolean;
  currentName: string;
  onCancel: () => void;
  onSave: (newName: string) => void;
};

const RenameFolderModal = ({
  open,
  currentName,
  onCancel,
  onSave,
}: RenameFolderModalProps) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-base font-semibold text-[#111827]">
          Rename folder
        </h3>

        <label className="mb-4 block text-xs font-medium text-[#6B7280]">
          Folder name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#43C17A]"
          />
        </label>

        <div className="mt-4 flex justify-end gap-2 text-sm">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-1.5 text-[#4B5563]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!name.trim()) return;
              onSave(name.trim());
            }}
            className="rounded-lg bg-[#43C17A] px-4 py-1.5 font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameFolderModal;
