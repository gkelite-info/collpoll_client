"use client";

import {
  MagnifyingGlass,
  DownloadSimple,
  TrashSimple,
} from "@phosphor-icons/react";
import FileIcon from "./fileIcon";
import { DriveFileRow } from "@/lib/helpers/drive/driveFilesAPI";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

type Props = {
  files: DriveFileRow[];
  search: string;
  onSearchChange: (value: string) => void;
  onDelete: (file: DriveFileRow) => void | Promise<void>;
  onDownload: (file: DriveFileRow) => void;
  isDeleting?: boolean;
  loading?: boolean;
};

export default function FilesTable({
  files,
  search,
  onSearchChange,
  onDelete,
  onDownload,
  isDeleting = false,
  loading = false,
}: Props) {
  const t = useTranslations("Drive.student"); // Hook
  const [fileToDelete, setFileToDelete] = useState<DriveFileRow | null>(null);
  const downloadingFileIdsRef = useRef(new Set<number>());
  const [downloadingFileIds, setDownloadingFileIds] = useState<Set<number>>(
    () => new Set(),
  );

  const handleDeleteConfirm = async () => {
    if (fileToDelete) {
      await onDelete(fileToDelete);
      setFileToDelete(null);
    }
  };

  const handleDownload = async (file: DriveFileRow) => {
    if (downloadingFileIdsRef.current.has(file.driveFileId)) return;

    downloadingFileIdsRef.current.add(file.driveFileId);
    setDownloadingFileIds(new Set(downloadingFileIdsRef.current));
    try {
      await onDownload(file);
    } finally {
      downloadingFileIdsRef.current.delete(file.driveFileId);
      setDownloadingFileIds(new Set(downloadingFileIdsRef.current));
    }
  };

  return (
    <>
      <ConfirmDeleteModal
        open={fileToDelete !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !isDeleting && setFileToDelete(null)}
        isDeleting={isDeleting}
        name={fileToDelete?.fileName ?? "file"}
        title={t("Delete")}
        confirmText={t("Delete")}
        loadingText={t("Deleting")}
      />

      <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-sm max-md:bg-transparent max-md:shadow-none">
        {/* DESKTOP TABLE */}
        <div className="hidden max-h-[520px] min-h-[150px] overflow-y-auto md:block">
          <table className="min-w-full table-auto text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              <tr>
                <th className="w-10 px-4 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#43C17A14] text-[#43C17A]">
                    <MagnifyingGlass size={14} />
                  </div>
                </th>
                <th className="px-4 py-3 text-xs">
                  <input
                    type="text"
                    placeholder={t("Search by file name")}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-transparent outline-none text-[#94A3B8] placeholder:text-[#94A3B8] font-normal normal-case tracking-normal w-full"
                  />
                </th>
                <th className="px-4 py-3 text-xs">{t("Type")}</th>
                <th className="px-4 py-3 text-xs">{t("Size")}</th>
                <th className="px-4 py-3 text-xs">{t("Uploaded On")}</th>
                <th className="px-4 py-3 text-right text-xs">{t("Actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="relative overflow-hidden">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="relative flex gap-6 overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                        <div className="h-4 w-8 rounded bg-gray-200" />
                        <div className="h-4 flex-[3] rounded bg-gray-200" />
                        <div className="h-4 flex-1 rounded bg-gray-200" />
                        <div className="h-4 flex-1 rounded bg-gray-200" />
                        <div className="h-4 flex-1 rounded bg-gray-200" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : files.map((file) => {
                if (!file?.fileName) return null;
                const ext =
                  file.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
                const sizeLabel = file.fileSize
                  ? file.fileSize < 1024 * 1024
                    ? `${(file.fileSize / 1024).toFixed(1)} KB`
                    : `${(file.fileSize / (1024 * 1024)).toFixed(1)} MB`
                  : "—";
                const dateLabel = new Date(file.createdAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                );

                return (
                  <tr key={file.driveFileId} className="text-sm text-[#0F172A]">
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#43C17A14] text-[#43C17A]">
                        <FileIcon type={ext} />
                      </div>
                    </td>
                    <td className="px-4 py-3">{file.fileName}</td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">{ext}</td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">
                      {sizeLabel}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">
                      {dateLabel}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloadingFileIds.has(file.driveFileId)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E0F9ED] text-[#22C55E] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={
                            downloadingFileIds.has(file.driveFileId)
                              ? "Downloading"
                              : "Download"
                          }
                        >
                          {downloadingFileIds.has(file.driveFileId) ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#22C55E]/30 border-t-[#22C55E]" />
                          ) : (
                            <DownloadSimple size={14} weight="bold" />
                          )}
                        </button>
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444] cursor-pointer"
                        >
                          <TrashSimple size={14} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && files.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-xs text-[#94A3B8]"
                  >
                    {search
                      ? t("No files matching {search}", { search })
                      : t("No files available")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD*/}
        <div className="flex min-h-[150px] flex-col gap-3 md:hidden">
          <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-lg border border-gray-100 shadow-sm">
            <MagnifyingGlass size={16} className="text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent outline-none text-[#282828] text-sm w-full"
            />
          </div>

          {loading ? (
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="relative h-16 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
                  <div className="h-4 flex-1 rounded bg-gray-200" />
                </div>
              </div>
            ))
          ) : files.map((file) => {
            if (!file?.fileName) return null;
            const ext = file.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
            const sizeLabel = file.fileSize
              ? file.fileSize < 1024 * 1024
                ? `${(file.fileSize / 1024).toFixed(1)} KB`
                : `${(file.fileSize / (1024 * 1024)).toFixed(1)} MB`
              : "—";
            const dateLabel = new Date(file.createdAt).toLocaleDateString(
              "en-GB",
              { day: "2-digit", month: "short", year: "numeric" },
            );

            return (
              <div
                key={file.driveFileId}
                className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#43C17A14] text-[#43C17A]">
                    <FileIcon type={ext} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                      {file.fileName}
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {sizeLabel} • {dateLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingFileIds.has(file.driveFileId)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0F9ED] text-[#22C55E] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={
                      downloadingFileIds.has(file.driveFileId)
                        ? "Downloading"
                        : "Download"
                    }
                  >
                    {downloadingFileIds.has(file.driveFileId) ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#22C55E]/30 border-t-[#22C55E]" />
                    ) : (
                      <DownloadSimple size={16} weight="bold" />
                    )}
                  </button>
                  <button
                    onClick={() => setFileToDelete(file)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444]"
                  >
                    <TrashSimple size={16} weight="bold" />
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && files.length === 0 && (
            <p className="text-center text-xs text-[#94A3B8] py-4 bg-white rounded-xl shadow-sm">
              {search
                ? t("No files matching {search}", { search })
                : t("No files available")}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
