"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("Drive.student");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-base font-semibold text-[#111827]">
          {t("Replace folder")}
        </h3>
        <p className="text-xs text-[#6B7280]">
          {t(
            "A folder with the name {folderName} already exists Do you want to replace it?",
            {
              folderName: folderName || t("this folder"),
            },
          )}
        </p>
        <div className="mt-4 flex justify-end gap-2 text-sm">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-4 py-1.5 text-[#4B5563] disabled:opacity-50 cursor-pointer"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-[#43C17A] px-4 py-1.5 font-medium text-white disabled:opacity-60 cursor-pointer"
          >
            {loading ? t("Replacing") : t("Replace")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReplaceFolderModal;
