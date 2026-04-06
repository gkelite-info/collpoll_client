"use client";

type ReplaceFolderModalProps = {
  open: boolean;
  folderName: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

const ReplaceFolderModal = ({
  open,
  folderName,
  onCancel,
  onConfirm,
  loading = false,
}: ReplaceFolderModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-base font-semibold text-[#111827]">
          Replace folder
        </h3>

        <p className="text-xs text-[#6B7280]">
          A folder with the name{" "}
          <span className="font-semibold text-[#111827]">
            {folderName || "this folder"}
          </span>{" "}
          already exists. Do you want to replace it?
        </p>

        <div className="mt-4 flex justify-end gap-2 text-sm">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-4 py-1.5 text-[#4B5563] disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-[#43C17A] px-4 py-1.5 font-medium text-white disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Replacing..." : "Replace"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceFolderModal;