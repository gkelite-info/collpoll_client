"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
};

export default function FullScreenPDFViewer({
  isOpen,
  onClose,
  pdfUrl,
  title = "E-Paper",
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isOpen || !pdfUrl) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[2000] bg-black/90 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between p-4 text-white border-b border-white/20 bg-black">
          <h2 className="text-xl font-medium">{title}</h2>
          <div className="flex items-center gap-4">
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Download size={18} />
              Download PDF
            </a>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-red-500 rounded-full cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full h-full bg-gray-100">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title={title}
          />
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
