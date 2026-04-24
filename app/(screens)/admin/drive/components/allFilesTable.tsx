"use client";

import {
  MagnifyingGlass,
  DownloadSimple,
  TrashSimple,
  Trash,
} from "@phosphor-icons/react";
import FileIcon from "./fileIcon";
import { DriveFileRow } from "@/lib/helpers/drive/driveFilesAPI";
import { useState } from "react";

type Props = {
  files: DriveFileRow[];
  onDelete: (file: DriveFileRow) => void;
  onDownload: (file: DriveFileRow) => void;
};

// 🟢 NEW: Minimal Confirm Modal Component for individual files
function ConfirmDeleteFileModal({ isOpen, onClose, onConfirm, fileName }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 text-red-600 p-2.5 rounded-full">
            <Trash size={22} weight="fill" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Delete File</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <strong>{fileName}</strong>?
        </p>
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FilesTable({ files, onDelete, onDownload }: Props) {
  const [search, setSearch] = useState("");
  const [fileToDelete, setFileToDelete] = useState<DriveFileRow | null>(null); // 🟢 Control modal state

  const filtered = search
    ? files.filter((f) =>
        f.fileName.toLowerCase().includes(search.toLowerCase()),
      )
    : files;

  const executeDelete = () => {
    if (fileToDelete) {
      onDelete(fileToDelete);
      setFileToDelete(null);
    }
  };

  return (
    <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
      <table className="min-w-full table-auto text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
          <tr>
            <th className="w-10 px-4 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#43C17A14] text-[#43C17A]">
                <MagnifyingGlass size={14} />
              </div>
            </th>
            <th className="px-4 py-3 text-xs">
              <input
                type="text"
                placeholder="Search by file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-[#94A3B8] placeholder:text-[#94A3B8] font-normal normal-case tracking-normal w-full"
              />
            </th>
            <th className="px-4 py-3 text-xs">Type</th>
            <th className="px-4 py-3 text-xs">Size</th>
            <th className="px-4 py-3 text-xs">Uploaded On</th>
            <th className="px-4 py-3 text-right text-xs">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F1F5F9]">
          {filtered.map((file) => {
            const ext = file.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
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
                      onClick={() => onDownload(file)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E0F9ED] text-[#22C55E] cursor-pointer"
                    >
                      <DownloadSimple size={14} weight="bold" />
                    </button>
                    <button
                      onClick={() => setFileToDelete(file)} // 🟢 Trigger Modal
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444] cursor-pointer"
                    >
                      <TrashSimple size={14} weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-xs text-[#94A3B8]"
              >
                {search
                  ? `No files matching "${search}"`
                  : "No files available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmDeleteFileModal
        isOpen={!!fileToDelete}
        fileName={fileToDelete?.fileName}
        onClose={() => setFileToDelete(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
