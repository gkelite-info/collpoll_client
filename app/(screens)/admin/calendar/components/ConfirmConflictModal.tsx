"use client";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmConflictModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
          Schedule Conflict
        </h3>

        <p className="text-sm text-[#525252] mb-4">
          This time slot already has one or more events.
          <br />
          Do you want to add this event anyway?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 cursor-pointer text-sm rounded-lg bg-[#14234B] text-white hover:bg-[#0f1b3a]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
