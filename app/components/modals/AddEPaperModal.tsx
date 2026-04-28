"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { uploadEPaper } from "@/lib/helpers/news/epaperAPI";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddEPaperModal({ isOpen, onClose, onSuccess }: Props) {
  const { collegeId, userId } = useUser();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCancel = () => {
    setName("");
    setDate("");
    setFile(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !date || !file) return toast.error("Please fill all fields");
    if (!collegeId || !userId) return toast.error("User context missing");

    setIsUploading(true);
    const toastId = toast.loading("Uploading E-Paper...");

    try {
      await uploadEPaper(name, date, file, collegeId, userId);
      toast.success("E-Paper uploaded successfully!", { id: toastId });
      setName("");
      setDate("");
      setFile(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1001] bg-black/40 backdrop-blur-sm flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-medium text-lg text-gray-900">
              Add New E-Paper
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="text-[#282828]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Paper Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43C17A]/50"
                placeholder="e.g. Daily Times Edition 1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-[#282828] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43C17A]/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload PDF
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex justify-center text-sm text-gray-600 mt-2">
                    <label className="relative cursor-pointer rounded-md font-medium text-[#43C17A] hover:text-[#359d62]">
                      <span>{file ? file.name : "Select a PDF file"}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full mt-2 bg-[#43C17A] hover:bg-[#359d62] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? "Uploading..." : "Save E-Paper"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
