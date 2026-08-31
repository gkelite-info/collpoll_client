"use client";

import { TrashIcon, PencilSimpleLine } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { getLabManualPublicUrl } from "@/lib/helpers/faculty/facultyLabManualHelper";

const getSecureUrl = (url: string) => {
  if (!url) return url;
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx !== -1) return `/api/files/${url.slice(idx + marker.length)}`;
  return url;
};

export interface LabManual {
  labId: number;
  labTitle: string;
  subjectName?: string;
  sectionName?: string;
  description?: string;
  fileName: string;
  fileSize: number;
  pdfUrl?: string;
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
  return new Date(dateStr).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function FacultyLabCard({
  data,
  onDelete,
  onEdit,
}: FacultyLabCardProps) {
  const handleView = async () => {
    if (!data.pdfUrl) {
      if (data.fileUrl) window.open(getSecureUrl(data.fileUrl), "_blank", "noopener,noreferrer");
      return;
    }

    const previewWindow = window.open("", "_blank");
    try {
      const signedUrl = await getLabManualPublicUrl(data.pdfUrl);
      if (!signedUrl) throw new Error("Unable to generate PDF URL");

      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = signedUrl;
      } else {
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      previewWindow?.close();
      toast.error("Failed to open lab manual");
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-3.5 md:p-4 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group flex flex-col md:flex-row md:items-center gap-3 md:gap-4 relative overflow-hidden">
      <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#FFF4F4] border border-[#FECACA] flex flex-col items-center justify-center shrink-0 mt-0.5 md:mt-0">
          <span className="text-[9px] font-black text-[#EF4444] tracking-widest leading-none">
            PDF
          </span>
          <div className="w-4 md:w-5 h-[2px] bg-[#EF4444] mt-1 rounded-full" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-[15px] md:text-base font-bold text-gray-900 leading-tight truncate">
            {data.labTitle}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {data.subjectName && (
              <span className="text-[10px] md:text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/60">
                {data.subjectName}
              </span>
            )}
            {data.sectionName && (
              <span className="text-[10px] md:text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/60">
                Sec: {data.sectionName}
              </span>
            )}
          </div>

          {data.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 md:line-clamp-1 md:max-w-2xl leading-relaxed">
              {data.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-2 md:gap-3 gap-y-1 mt-2.5 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5 truncate max-w-[140px] md:max-w-[220px] font-medium text-gray-500">
              📄 {data.fileName}
            </span>
            <span className="flex items-center before:content-['•'] before:mr-2 before:text-gray-300">
              {formatFileSize(data.fileSize)}
            </span>
            <span className="hidden md:flex items-center before:content-['•'] before:mr-2 before:text-gray-300">
              Uploaded {formatDate(data.uploadedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto shrink-0 mt-1 md:mt-0">
        <span className="md:hidden text-[10px] font-medium text-gray-400">
          {formatDate(data.uploadedAt)}
        </span>

        <div className="flex items-center gap-2">
          {(data.pdfUrl || data.fileUrl) && (
            <button
              type="button"
              onClick={handleView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100 hover:border-emerald-500 cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>View</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(data)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors border border-blue-100 hover:border-blue-500 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
            >
              <PencilSimpleLine size={16} weight="bold" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(data.labId)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors border border-red-100 hover:border-red-500 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
            >
              <TrashIcon size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
