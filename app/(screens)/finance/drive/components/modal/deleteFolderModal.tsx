"use client";

type DeleteFolderModalProps = {
  open: boolean;
  folderName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const DeleteFolderModal = ({
  open,
  folderName,
  onCancel,
  onConfirm,
}: DeleteFolderModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-base font-semibold text-[#111827]">
          Delete folder
        </h3>
        <p className="text-xs text-[#6B7280]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#111827]">
            {folderName || "this folder"}
          </span>
          ? This action cannot be undone.
        </p>

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
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-1.5 font-medium text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
