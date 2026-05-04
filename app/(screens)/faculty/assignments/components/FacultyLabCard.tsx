"use client";

import { TrashIcon, PencilSimpleLine } from "@phosphor-icons/react"; // Added PencilSimpleLine
import { useState } from "react";

export interface LabManual {
    labId: number;
    labTitle: string;
    subjectName?: string;
    sectionName?: string;
    description?: string;
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    uploadedAt: string;
}

interface FacultyLabCardProps {
    data: LabManual;
    onDelete?: (labId: number) => void;
    onEdit?: (lab: LabManual) => void;
}

function formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export default function FacultyLabCard({ data, onDelete, onEdit }: FacultyLabCardProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="w-full bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-[#43C17A]/30 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-[#FFF4F4] border border-[#FECACA] flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-extrabold text-[#EF4444] tracking-widest leading-none">PDF</span>
                <div className="w-5 h-[1.5px] bg-[#EF4444] mt-0.5 rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#282828] truncate leading-tight">
                    {data.labTitle}
                </h3>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {data.subjectName && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {data.subjectName}
                        </span>
                    )}
                    {data.sectionName && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {data.sectionName}
                        </span>
                    )}
                </div>

                {data.description && (
                    <p className="text-xs text-gray-400 mt-1 max-w-[360px] max-h-10 overflow-auto leading-5 whitespace-nowrap">
                        {data.description}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-gray-400 truncate max-w-[200px]">
                        📄 {data.fileName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        {formatFileSize(data.fileSize)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        Uploaded {formatDate(data.uploadedAt)}
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                {data.fileUrl && (
                    <a
                        href={data.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D5FFE7] text-[#43C17A] text-xs font-medium hover:bg-[#43C17A] hover:text-white transition-colors"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                    </a>
                )}

                <div className="flex items-center justify-end">
                    {onEdit && !showConfirm && (
                        <button
                            onClick={() => onEdit(data)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Edit Lab"
                        >
                            <PencilSimpleLine size={16} weight="bold" className="text-blue-500" />
                        </button>
                    )}

                    {onDelete && !showConfirm && (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete Lab"
                        >
                            <TrashIcon size={16} weight="fill" className="text-red-500" />
                        </button>
                    )}
                </div>

                {showConfirm && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-red-500 font-medium">Delete?</span>
                        <button
                            onClick={() => { onDelete?.(data.labId); setShowConfirm(false); }}
                            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 px-1 cursor-pointer"
                        >
                            No
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
