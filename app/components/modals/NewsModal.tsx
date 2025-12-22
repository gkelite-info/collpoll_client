"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FilePdfIcon, NewspaperIcon } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";


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
  onOpenPDF: () => void;   // ⭐ ADD THIS LINE HERE
};

type NewsItem =
  | {
    type: "news";
    source: string;
    headline: string;
    time: string;
  }
  | {
    type: "date";
    label: string;
  };

type NewsSection = {
  title: string;
  subtitle: string;
  content: NewsItem[];
};

const newsData: NewsSection[] = [
  {
    title: "Todays News",
    subtitle: "Wednesday 30/10/2025",
    content: [
      {
        type: "news",
        source: "Deccan Chronicle",
        headline: "India launches new weather satellite; Markets",
        time: "Updated at 7:30 AM",
      },
      {
        type: "news",
        source: "Times of India",
        headline: "New EV policy to boost clean mobility; Students",
        time: "Updated at 7:30 AM",
      },
      {
        type: "news",
        source: "Economic Times",
        headline: "Stock markets rise; Tech sector shows strong...",
        time: "Updated at 7:30 AM",
      },

      {
        type: "date",
        label: "30/10/2025 News",
      },

      {
        type: "news",
        source: "Deccan Chronicle",
        headline: "India launches new weather satellite; Markets",
        time: "Updated at 7:30 AM",
      },
      {
        type: "news",
        source: "Times of India",
        headline: "New EV policy to boost clean mobility; Students",
        time: "Updated at 7:30 AM",
      },
      {
        type: "news",
        source: "Economic Times",
        headline: "Stock markets rise; Tech sector shows strong...",
        time: "Updated at 7:30 AM",
      },

      {
        type: "date",
        label: "28/10/2025 News",
      },

      {
        type: "news",
        source: "Deccan Chronicle",
        headline: "India launches new weather satellite; Markets",
        time: "Updated at 7:30 AM",
      },
      {
        type: "news",
        source: "Times of India",
        headline: "New EV policy to boost clean mobility; Students",
        time: "Updated at 7:30 AM",
      },
      {
        type: "news",
        source: "Economic Times",
        headline: "Stock markets rise; Tech sector shows strong...",
        time: "Updated at 7:30 AM",
      },
    ],
  },
];

export default function NewsModal(props: Props) {
  const { isOpen, onClose, onOpenPDF } = props;
  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-16 right-7 z-[1000] w-[360px] max-h-[520px] bg-white translate-x-3 rounded-xl border border-[#E5E7EB] shadow-xl flex flex-col"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
          >
            {/* Header */}
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

              <button onClick={onClose}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>


            {/* Content */}
            <div className="px-4 pt-3 pb-4 overflow-y-auto space-y-6">
              {newsData.map((section, i) => (
                <div key={i}>
                  <p className="text-[18px] font-medium text-[#111827]">
                    {section.title}
                  </p>

                  <p className="text-[14.7px] text-[#414141] mt-1">
                    {section.subtitle}
                  </p>


                  <div className="mt-4 space-y-4">
                    {section.content.map((item, j) => {
                      if (item.type === "date") {
                        return (
                          <p
                            key={j}
                            className="text-[15px] font-medium text-[#111827]"
                          >
                            {item.label}
                          </p>
                        );
                      }
                      return (
                        <div key={j} className="border-b border-[#E5E7EB] pb-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-[16px] font-medium text-[#111827] flex items-center gap-2">
                                🗞️ {item.source}
                              </p>

                              <p className="text-[14px] mt-2">
                                <span className="font-medium text-[#16284F]">
                                  Top headlines:
                                </span>
                                <span className="text-[#414141]">
                                  {" "}
                                  {item.headline}
                                </span>
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <p className="text-[12px] text-[#414141]">
                                {item.time}
                              </p>

                              <button
                                onClick={() => {
                                  onClose();  // Close NewsModal
                                  setTimeout(() => onOpenPDF(), 150); // Open DailyNewsModal in PDF mode
                                }}
                                className="flex items-center gap-1.5 h-[26px] px-3 bg-[#43C17A] rounded-full text-white text-[12px] font-medium">
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
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
