import {
  MagnifyingGlass,
  DownloadSimple,
  TrashSimple,
} from "@phosphor-icons/react";
import FileIcon from "./fileIcon";
import { FileItemProps } from "@/app/(screens)/(student)/drive/page";

type Props = {
  files: FileItemProps[];
  onDelete: (id: number) => void;
  onDownload: (file: FileItemProps) => void;
};

export default function FilesTable({ files, onDelete, onDownload }: Props) {
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
            <th className="px-4 py-3 text-xs">File Name</th>
            <th className="px-4 py-3 text-xs">Type</th>
            <th className="px-4 py-3 text-xs">Size</th>
            <th className="px-4 py-3 text-xs">Uploaded On</th>
            <th className="px-4 py-3 text-right text-xs">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F1F5F9]">
          {files.map((file) => (
            <tr key={file.id} className="text-sm text-[#0F172A]">
              <td className="px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#43C17A14] text-[#43C17A]">
                  <FileIcon type={file.type} />
                </div>
              </td>

              <td className="px-4 py-3">{file.name}</td>
              <td className="px-4 py-3 text-xs text-[#64748B]">{file.type}</td>
              <td className="px-4 py-3 text-xs text-[#64748B]">
                {file.sizeLabel}
              </td>
              <td className="px-4 py-3 text-xs text-[#64748B]">
                {file.uploadedOnLabel}
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onDownload(file)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E0F9ED] text-[#22C55E]"
                  >
                    <DownloadSimple size={14} weight="bold" />
                  </button>

                  <button
                    onClick={() => onDelete(file.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444]"
                  >
                    <TrashSimple size={14} weight="bold" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {files.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-xs text-[#94A3B8]"
              >
                No files available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
