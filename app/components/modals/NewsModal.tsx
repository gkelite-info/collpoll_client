"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash } from "lucide-react";
import { FilePdfIcon, NewspaperIcon } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

import AddEPaperModal from "./AddEPaperModal";
import FullScreenPDFViewer from "./FullScreenPDFViewer";
import { useUser } from "@/app/utils/context/UserContext";
import {
  deleteEPaper,
  EPaperRecord,
  fetchEPapers,
} from "@/lib/helpers/news/epaperAPI";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useTranslations } from "next-intl";

const EPaperShimmer = () => (
  <div className="space-y-5">
    {[1, 2].map((groupKey) => (
      <div key={groupKey} className="space-y-3">
        <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse" />
        <div className="space-y-2">
          {[1, 2].map((itemKey) => (
            <div
              key={itemKey}
              className="bg-white p-3 rounded-lg border border-gray-100 flex items-center justify-between shadow-sm"
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOpenPDF: (article: any) => void;
};

export default function NewsModal({ isOpen, onClose, onOpenPDF }: Props) {
  const { role, collegeId } = useUser();
  const isAdmin = role === "Admin" || role === "SuperAdmin";
  const t = useTranslations("News"); // Initialize hook

  const [activeTab, setActiveTab] = useState<"epaper" | "news">("epaper");
  const [news, setNews] = useState<any[]>([]);
  const [epapers, setEpapers] = useState<EPaperRecord[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingEpapers, setLoadingEpapers] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  const [ePaperToDelete, setEPaperToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadEpapers = useCallback(async () => {
    if (!collegeId) return;
    setLoadingEpapers(true);
    try {
      const data = await fetchEPapers(collegeId);
      setEpapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEpapers(false);
    }
  }, [collegeId]);

  useEffect(() => {
    if (isOpen) {
      loadNews();
      loadEpapers();
    }
  }, [isOpen, loadEpapers]);

  const handleDelete = async (ePaperId: number) => {
    if (!confirm(t("Are you sure you want to delete this e-paper?"))) return;
    setDeletingId(ePaperId);
    const toastId = toast.loading(t("Deleting"));
    try {
      await deleteEPaper(ePaperId);
      toast.success(t("EPaper deleted"), { id: toastId });
      loadEpapers();
    } catch (error: any) {
      toast.error(error.message || t("Failed to delete"), { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const groupedEpapers = epapers.reduce<Record<string, EPaperRecord[]>>(
    (acc, epaper) => {
      const dateStr = new Date(epaper.publish_date).toLocaleDateString(
        "en-GB",
        {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      );
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(epaper);
      return acc;
    },
    {},
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <motion.div
              onClick={onClose}
              className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed top-16 right-5 z-[1000] h-[450px] w-[335px] md:w-[380px] md:h-[600px] lg:w-[380px] lg:h-[600px] max-h-[85vh] bg-white rounded-xl border border-[#E5E7EB] shadow-xl flex flex-col overflow-hidden"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <NewspaperIcon size={24} weight="fill" color="#43C17A" />
                  <h2 className="font-medium text-[20px] text-[#111827] leading-none">
                    {t("News")}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("epaper")}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "epaper"
                      ? "border-[#43C17A] text-[#43C17A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t("EPapers")}
                </button>
                <button
                  onClick={() => setActiveTab("news")}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "news"
                      ? "border-[#43C17A] text-[#43C17A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t("Current News")}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/50">
                {activeTab === "epaper" && (
                  <div className="space-y-6">
                    {isAdmin && (
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#43C17A] text-[#43C17A] rounded-lg font-medium hover:bg-[#43C17A]/5 transition-colors cursor-pointer"
                      >
                        <Plus size={18} /> {t("Add EPaper")}
                      </button>
                    )}

                    {loadingEpapers ? (
                      <EPaperShimmer />
                    ) : Object.keys(groupedEpapers).length === 0 ? (
                      <p className="text-center text-gray-500 text-sm mt-8">
                        {t("No EPapers available")}
                      </p>
                    ) : (
                      Object.entries(groupedEpapers).map(([date, papers]) => (
                        <div key={date} className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md inline-block">
                            {date}
                          </h3>
                          <div className="space-y-3">
                            {papers.map((paper) => (
                              <div
                                key={paper.ePaperId}
                                className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between gap-3"
                              >
                                <span className="text-[15px] font-medium text-gray-800 line-clamp-1 flex-1">
                                  {paper.name}
                                </span>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      setViewerTitle(paper.name);
                                      setViewerPdfUrl(paper.pdf_url);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#43C17A]/10 text-[#43C17A] rounded-md text-xs font-medium hover:bg-[#43C17A]/20 transition-colors cursor-pointer"
                                  >
                                    <FilePdfIcon size={14} weight="fill" />
                                    {t("View")}
                                  </button>

                                  {isAdmin && (
                                    <button
                                      onClick={() =>
                                        setEPaperToDelete(paper.ePaperId)
                                      }
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                      title={t("Delete")}
                                    >
                                      <Trash size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "news" && (
                  <div>
                    {loadingNews ? (
                      <div className="flex justify-center py-8">
                        <Loader />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[14px] text-[#414141] font-medium border-b pb-2 mb-4">
                          {new Date().toLocaleDateString("en-GB", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                        {news.map((item, j) => (
                          <div
                            key={j}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                          >
                            <p className="text-[14px] font-medium text-[#111827] flex items-center gap-2 mb-2">
                              🗞️ {item.source?.name || t("News Source")}
                            </p>
                            <p className="text-[14px] leading-relaxed text-[#414141]">
                              {item.title}
                            </p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                              <p className="text-[11px] text-gray-400">
                                {item.publishedAt
                                  ? new Date(
                                      item.publishedAt,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : t("Updated")}
                              </p>
                              <button
                                onClick={() => {
                                  onClose();
                                  setTimeout(() => onOpenPDF(item), 150);
                                }}
                                className="text-[#43C17A] text-[12px] font-medium hover:underline cursor-pointer"
                              >
                                {t("Read More")}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      <AddEPaperModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadEpapers}
      />

      <FullScreenPDFViewer
        isOpen={!!viewerPdfUrl}
        onClose={() => setViewerPdfUrl(null)}
        pdfUrl={viewerPdfUrl}
        title={viewerTitle}
      />

      <DeleteConfirmModal
        isOpen={ePaperToDelete !== null}
        type="e-paper"
        isDeleting={isDeleting}
        onCancel={() => setEPaperToDelete(null)}
        onConfirm={async () => {
          if (!ePaperToDelete) return;
          setIsDeleting(true);
          const toastId = toast.loading(t("Deleting EPaper"));
          try {
            await deleteEPaper(ePaperToDelete);
            toast.success(t("EPaper deleted"), { id: toastId });
            loadEpapers();
            setEPaperToDelete(null);
          } catch (error: any) {
            toast.error(error.message || t("Failed to delete"), {
              id: toastId,
            });
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </>
  );
}
