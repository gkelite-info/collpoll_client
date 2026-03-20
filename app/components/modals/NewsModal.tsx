"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FilePdfIcon, NewspaperIcon } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOpenPDF: (article: any) => void;
};

export default function NewsModal(props: Props) {
  const { isOpen, onClose, onOpenPDF } = props;
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        setNews(data.articles || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  return (
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
            className="fixed top-16 right-7 z-[1000] w-[360px] max-h-[520px] bg-white translate-x-3 rounded-xl border border-[#E5E7EB] shadow-xl flex flex-col"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <NewspaperIcon size={22} weight="fill" color="#43C17A" />
                <h2
                  className="
                    font-Roboto
                    font-medium
                    text-[24px]
                    leading-[100%]
                    tracking-[0%]
                    text-[#111827]
                  "
                >
                  News
                </h2>
              </div>

              <button onClick={onClose} className="cursor-pointer">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="px-4 pt-3 pb-4 overflow-y-auto space-y-6">
              {loading && <Loader />}

              {!loading && (
                <div>
                  <p className="text-[18px] font-medium text-[#111827]">
                    Todays News
                  </p>
                  <p className="text-[14.7px] text-[#414141] mt-1">
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>

                  <div className="mt-4 space-y-4">
                    {news.map((item, j) => (
                      <div key={j} className="border-b border-[#E5E7EB] pb-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-[16px] font-medium text-[#111827] flex items-center gap-2">
                              🗞️ {item.source?.name || "News Source"}
                            </p>

                            <p className="text-[14px] mt-2">
                              <span className="font-medium text-[#16284F]">
                                Top headlines:
                              </span>
                              <span className="text-[#414141]">
                                {" "}
                                {item.title}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="text-[12px] text-[#414141]">
                              {item.publishedAt
                                ? new Date(item.publishedAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : "Updated"}
                            </p>

                            <button
                              onClick={() => {
                                onClose();
                                setTimeout(() => onOpenPDF(item), 150);
                              }}
                              className="flex items-center cursor-pointer gap-1.5 h-[26px] px-3 bg-[#43C17A] rounded-full text-white text-[12px] font-medium transition-opacity hover:opacity-90"
                            >
                              <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full">
                                <FilePdfIcon
                                  size={12}
                                  weight="fill"
                                  className="text-[#43C17A]"
                                />
                              </span>
                              View PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* <div className="w-full h-screen bg-gray-100 flex items-center justify-center p-6">
            </div> */}
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
