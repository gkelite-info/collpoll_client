import React from "react";
import { X } from "@phosphor-icons/react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  pdfUrl: string | null;
  onClose: () => void;
  title?: string;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  pdfUrl,
  onClose,
  title = "Document Preview",
}) => {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10">
      <div className="relative w-full h-full max-w-5xl bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 bg-white">
          <h4 className="font-medium text-md text-black">{title}</h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className="flex-1 bg-gray-50">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
