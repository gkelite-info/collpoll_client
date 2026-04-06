"use client";

import { MagnifyingGlass, DownloadSimple, TrashSimple } from "@phosphor-icons/react";
import FileIcon from "./fileIcon";
import { DriveFileRow } from "@/lib/helpers/drive/driveFilesAPI";
import { useState } from "react";

interface ConfirmDeleteModalProps {
    open: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    isDeleting?: boolean;
    name?: string;
}

function ConfirmDeleteModal({
    open,
    onConfirm,
    onCancel,
    isDeleting = false,
    name = "file",
}: ConfirmDeleteModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-xl w-[380px] p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Delete {name}?
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete this {name}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-[#282828] cursor-pointer rounded-lg text-sm border disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 cursor-pointer rounded-lg text-sm bg-red-600 text-white disabled:opacity-60"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

type Props = {
    files: DriveFileRow[];
    onDelete: (file: DriveFileRow) => void | Promise<void>;
    onDownload: (file: DriveFileRow) => void;
    isDeleting?: boolean;
};

export default function FilesTable({ files, onDelete, onDownload, isDeleting = false }: Props) {
    const [search, setSearch] = useState("");
    const [fileToDelete, setFileToDelete] = useState<DriveFileRow | null>(null);

    const filtered = search
        ? files.filter(f => f.fileName.toLowerCase().includes(search.toLowerCase()))
        : files;

    const handleDeleteConfirm = async () => {
        if (fileToDelete) {
            await onDelete(fileToDelete);
            setFileToDelete(null);
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
            />

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
                            if (!file?.fileName) return null;
                            const ext = file.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
                            const sizeLabel = file.fileSize
                                ? file.fileSize < 1024 * 1024
                                    ? `${(file.fileSize / 1024).toFixed(1)} KB`
                                    : `${(file.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                : "—";
                            const dateLabel = new Date(file.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                            });

                            return (
                                <tr key={file.driveFileId} className="text-sm text-[#0F172A]">
                                    <td className="px-4 py-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#43C17A14] text-[#43C17A]">
                                            <FileIcon type={ext} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{file.fileName}</td>
                                    <td className="px-4 py-3 text-xs text-[#64748B]">{ext}</td>
                                    <td className="px-4 py-3 text-xs text-[#64748B]">{sizeLabel}</td>
                                    <td className="px-4 py-3 text-xs text-[#64748B]">{dateLabel}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => onDownload(file)}
                                                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E0F9ED] text-[#22C55E] cursor-pointer"
                                            >
                                                <DownloadSimple size={14} weight="bold" />
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

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-xs text-[#94A3B8]">
                                    {search ? `No files matching "${search}"` : "No files available"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}